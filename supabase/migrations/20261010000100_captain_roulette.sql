-- 20261010000100_captain_roulette.sql
-- Captain Roulette: Authoritative cross-room weighted selection, 14-day history decay, and synchronized 1-reroll voting

-- 1. Persistent cross-room captain history
CREATE TABLE IF NOT EXISTS private.captain_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  event_id text NOT NULL,
  participant_id uuid NOT NULL,
  stable_player_id text NOT NULL,
  nickname text NOT NULL,
  was_reroll boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_captain_event UNIQUE (room_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_captain_history_player ON private.captain_history (stable_player_id, created_at);
REVOKE ALL ON TABLE private.captain_history FROM PUBLIC, anon, authenticated;

-- 2. Authoritative room captain events table for synchronized state machine
CREATE TABLE IF NOT EXISTS public.captain_events (
  id text PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'initial_result_provisional',
  provisional_captain_id uuid,
  provisional_captain_nickname text,
  final_captain_id uuid,
  final_captain_nickname text,
  requester_participant_id uuid,
  frozen_voter_ids uuid[] DEFAULT '{}',
  votes jsonb DEFAULT '{}'::jsonb,
  objection_ends_at timestamptz,
  vote_ends_at timestamptz,
  has_rerolled boolean NOT NULL DEFAULT false,
  eligible_candidate_ids uuid[] DEFAULT '{}',
  candidate_meta jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_captain_events_room ON public.captain_events (room_id, created_at DESC);
ALTER TABLE public.captain_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read captain events" ON public.captain_events FOR SELECT USING (true);

-- 3. Unbiased random uniform double in [0, 1) using cryptographic entropy
CREATE OR REPLACE FUNCTION private.crypto_random_double() RETURNS double precision
LANGUAGE plpgsql VOLATILE SET search_path = pg_catalog, public, extensions, private AS $$
DECLARE
  v_hex text;
  v_num bigint;
BEGIN
  -- Extract 8 hex characters (32 bits = 4 bytes) from PostgreSQL native CSPRNG gen_random_uuid()
  v_hex := substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  v_num := ('x' || v_hex)::bit(32)::bigint;
  RETURN v_num::double precision / 4294967296.0;
END;
$$;

-- 4. Calculate decayed weight for a stable player identity
-- Formula:
-- ageInDays = age of win in days
-- contribution = 0.5 ^ (ageInDays / 7) for wins < 14 days; 0 for wins >= 14 days (refreshes to 100 in 14 days)
-- penalty = sum(contributions)
-- weight = 100 / (1 + 4 * penalty)
CREATE OR REPLACE FUNCTION private.calculate_player_captain_weight(p_stable_id text) RETURNS double precision
LANGUAGE plpgsql STABLE SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_penalty double precision := 0.0;
  v_rec RECORD;
  v_age double precision;
  v_contribution double precision;
BEGIN
  IF p_stable_id IS NULL OR length(p_stable_id) = 0 THEN
    RETURN 100.0;
  END IF;

  FOR v_rec IN
    SELECT created_at
    FROM private.captain_history
    WHERE stable_player_id = p_stable_id
      AND created_at >= (now() - interval '14 days')
  LOOP
    v_age := extract(epoch from (now() - v_rec.created_at)) / 86400.0;
    IF v_age < 14.0 THEN
      v_contribution := power(0.5, v_age / 7.0);
      v_penalty := v_penalty + v_contribution;
    END IF;
  END LOOP;

  RETURN 100.0 / (1.0 + 4.0 * v_penalty);
END;
$$;

-- 5. RPC: Start captain selection event
CREATE OR REPLACE FUNCTION public.start_captain_selection(
  p_room_id uuid,
  p_session_token text,
  p_stable_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_caller RECORD;
  v_active_parts RECORD;
  v_candidates jsonb := '[]'::jsonb;
  v_part RECORD;
  v_part_stable text;
  v_weight double precision;
  v_total_weight double precision := 0.0;
  v_cand_ids uuid[] := '{}';
  v_cand_weights double precision[] := '{}';
  v_roll double precision;
  v_cum double precision := 0.0;
  v_chosen_id uuid := NULL;
  v_chosen_nick text := NULL;
  v_event_id text;
  v_objection_ends timestamptz;
  v_result jsonb;
  v_initial_char text;
  v_i int;
BEGIN
  -- Authenticate caller in room
  SELECT id, nickname, is_host INTO v_caller
  FROM public.participants
  WHERE room_id = p_room_id
    AND session_token = p_session_token
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'WSH_UNAUTHORIZED';
  END IF;

  -- Gather eligible active participants (exclude away and disconnected)
  -- If none active, fallback to all participants
  FOR v_part IN
    SELECT id, nickname, player_color, session_token
    FROM public.participants
    WHERE room_id = p_room_id
      AND status = 'active'
    ORDER BY joined_at ASC
  LOOP
    v_cand_ids := array_append(v_cand_ids, v_part.id);
  END LOOP;

  IF cardinality(v_cand_ids) = 0 THEN
    FOR v_part IN
      SELECT id, nickname, player_color, session_token
      FROM public.participants
      WHERE room_id = p_room_id
      ORDER BY joined_at ASC
    LOOP
      v_cand_ids := array_append(v_cand_ids, v_part.id);
    END LOOP;
  END IF;

  IF cardinality(v_cand_ids) < 3 THEN
    RAISE EXCEPTION 'WSH_INSUFFICIENT_ACTIVE_PLAYERS';
  END IF;

  -- Build candidates metadata and weights
  FOR v_part IN
    SELECT id, nickname, player_color, session_token
    FROM public.participants
    WHERE id = ANY(v_cand_ids)
    ORDER BY joined_at ASC
  LOOP
    -- Use participant's session_token or caller's provided stable ID if matching caller
    v_part_stable := CASE 
      WHEN v_part.id = v_caller.id AND p_stable_id IS NOT NULL AND length(p_stable_id) > 8 THEN p_stable_id
      ELSE v_part.session_token
    END;

    v_weight := private.calculate_player_captain_weight(v_part_stable);
    v_total_weight := v_total_weight + v_weight;
    v_cand_weights := array_append(v_cand_weights, v_weight);

    v_initial_char := upper(substring(trim(v_part.nickname) from 1 for 1));
    IF v_initial_char IS NULL OR v_initial_char = '' THEN
      v_initial_char := '?';
    END IF;

    v_candidates := v_candidates || jsonb_build_object(
      'id', v_part.id,
      'nickname', v_part.nickname,
      'initial', v_initial_char,
      'color', v_part.player_color,
      'weight', v_weight
    );
  END LOOP;

  -- Cryptographically draw initial provisional winner proportionally to weight
  v_roll := private.crypto_random_double() * v_total_weight;
  FOR v_i IN 1..cardinality(v_cand_ids) LOOP
    v_cum := v_cum + v_cand_weights[v_i];
    IF v_chosen_id IS NULL AND (v_cum >= v_roll OR v_i = cardinality(v_cand_ids)) THEN
      v_chosen_id := v_cand_ids[v_i];
      SELECT nickname INTO v_chosen_nick FROM public.participants WHERE id = v_chosen_id;
    END IF;
  END LOOP;

  v_event_id := gen_random_uuid()::text;
  v_objection_ends := now() + interval '10 seconds';

  -- Create authoritative event
  INSERT INTO public.captain_events (
    id,
    room_id,
    status,
    provisional_captain_id,
    provisional_captain_nickname,
    frozen_voter_ids,
    objection_ends_at,
    eligible_candidate_ids,
    candidate_meta
  ) VALUES (
    v_event_id,
    p_room_id,
    'initial_result_provisional',
    v_chosen_id,
    v_chosen_nick,
    v_cand_ids,
    v_objection_ends,
    v_cand_ids,
    v_candidates
  );

  SELECT jsonb_build_object(
    'eventId', v_event_id,
    'status', 'initial_result_provisional',
    'provisionalCaptainId', v_chosen_id,
    'provisionalCaptainNickname', v_chosen_nick,
    'frozenVoterIds', v_cand_ids,
    'objectionEndsAt', v_objection_ends,
    'candidates', v_candidates,
    'hasRerolled', false
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 6. RPC: Request captain reroll during objection window (1 reroll per event max)
CREATE OR REPLACE FUNCTION public.request_captain_reroll(
  p_room_id uuid,
  p_event_id text,
  p_session_token text
) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_caller RECORD;
  v_ev RECORD;
  v_votes jsonb;
  v_vote_ends timestamptz;
  v_voter_count int;
  v_req_approvals int;
  v_app_count int := 1;
BEGIN
  -- Authenticate caller
  SELECT id, nickname INTO v_caller
  FROM public.participants
  WHERE room_id = p_room_id
    AND session_token = p_session_token
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'WSH_UNAUTHORIZED';
  END IF;

  -- Lock event row
  SELECT * INTO v_ev
  FROM public.captain_events
  WHERE id = p_event_id
    AND room_id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'WSH_EVENT_NOT_FOUND';
  END IF;

  -- Verify eligible voter
  IF NOT (v_caller.id = ANY(v_ev.frozen_voter_ids)) THEN
    RAISE EXCEPTION 'WSH_NOT_ELIGIBLE_VOTER';
  END IF;

  -- Check if reroll already requested or used
  IF v_ev.has_rerolled THEN
    RAISE EXCEPTION 'WSH_REROLL_ALREADY_USED';
  END IF;

  -- Check if objection window is still open
  IF v_ev.status <> 'initial_result_provisional' AND v_ev.status <> 'objection_window' THEN
    RAISE EXCEPTION 'WSH_INVALID_EVENT_STAGE';
  END IF;

  IF now() > v_ev.objection_ends_at THEN
    RAISE EXCEPTION 'WSH_OBJECTION_WINDOW_EXPIRED';
  END IF;

  v_vote_ends := now() + interval '15 seconds';
  v_votes := jsonb_build_object(v_caller.id::text, 'approve');

  v_voter_count := cardinality(v_ev.frozen_voter_ids);
  v_req_approvals := (v_voter_count / 2) + 1; -- strict majority floor(N / 2) + 1

  -- Check single voter edge case (N=1)
  IF v_app_count >= v_req_approvals AND v_voter_count = 1 THEN
    -- Finalize original captain since no alternative candidate exists
    UPDATE public.captain_events
    SET status = 'finalized',
        final_captain_id = v_ev.provisional_captain_id,
        final_captain_nickname = v_ev.provisional_captain_nickname,
        has_rerolled = true,
        requester_participant_id = v_caller.id,
        votes = v_votes,
        updated_at = now()
    WHERE id = p_event_id;

    RETURN jsonb_build_object(
      'eventId', p_event_id,
      'status', 'finalized',
      'finalCaptainId', v_ev.provisional_captain_id,
      'finalCaptainNickname', v_ev.provisional_captain_nickname,
      'hasRerolled', true
    );
  END IF;

  UPDATE public.captain_events
  SET status = 'reroll_vote_open',
      has_rerolled = true,
      requester_participant_id = v_caller.id,
      votes = v_votes,
      vote_ends_at = v_vote_ends,
      updated_at = now()
  WHERE id = p_event_id;

  RETURN jsonb_build_object(
    'eventId', p_event_id,
    'status', 'reroll_vote_open',
    'requesterParticipantId', v_caller.id,
    'requesterNickname', v_caller.nickname,
    'votes', v_votes,
    'voteEndsAt', v_vote_ends,
    'requiredApprovals', v_req_approvals,
    'voterCount', v_voter_count,
    'hasRerolled', true
  );
END;
$$;

-- 7. RPC: Cast vote on reroll
CREATE OR REPLACE FUNCTION public.cast_captain_vote(
  p_room_id uuid,
  p_event_id text,
  p_session_token text,
  p_vote text -- 'approve' or 'reject'
) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_caller RECORD;
  v_ev RECORD;
  v_votes jsonb;
  v_vote_clean text;
  v_voter_count int;
  v_req_approvals int;
  v_approvals int := 0;
  v_rejections int := 0;
  v_uncast int;
  v_vote_key text;
  v_vote_val text;
  -- 2nd draw variables
  v_remaining_ids uuid[] := '{}';
  v_remaining_weights double precision[] := '{}';
  v_part RECORD;
  v_weight double precision;
  v_total_weight double precision := 0.0;
  v_roll double precision;
  v_cum double precision := 0.0;
  v_new_chosen_id uuid := NULL;
  v_new_chosen_nick text := NULL;
  v_i int;
  v_caller_stable text;
BEGIN
  -- Authenticate caller
  SELECT id, nickname INTO v_caller
  FROM public.participants
  WHERE room_id = p_room_id
    AND session_token = p_session_token
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'WSH_UNAUTHORIZED';
  END IF;

  v_vote_clean := lower(trim(p_vote));
  IF v_vote_clean <> 'approve' AND v_vote_clean <> 'reject' THEN
    RAISE EXCEPTION 'WSH_INVALID_VOTE';
  END IF;

  -- Lock event row
  SELECT * INTO v_ev
  FROM public.captain_events
  WHERE id = p_event_id
    AND room_id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'WSH_EVENT_NOT_FOUND';
  END IF;

  IF v_ev.status <> 'reroll_vote_open' THEN
    RAISE EXCEPTION 'WSH_VOTE_CLOSED';
  END IF;

  IF now() > v_ev.vote_ends_at THEN
    RAISE EXCEPTION 'WSH_VOTE_TIME_EXPIRED';
  END IF;

  IF NOT (v_caller.id = ANY(v_ev.frozen_voter_ids)) THEN
    RAISE EXCEPTION 'WSH_NOT_ELIGIBLE_VOTER';
  END IF;

  v_votes := coalesce(v_ev.votes, '{}'::jsonb);
  IF v_votes ? v_caller.id::text THEN
    RAISE EXCEPTION 'WSH_ALREADY_VOTED';
  END IF;

  -- Record vote
  v_votes := v_votes || jsonb_build_object(v_caller.id::text, v_vote_clean);

  v_voter_count := cardinality(v_ev.frozen_voter_ids);
  v_req_approvals := (v_voter_count / 2) + 1; -- strict majority floor(N / 2) + 1

  -- Tally
  FOR v_vote_key, v_vote_val IN SELECT key, value#>>'{}' FROM jsonb_each(v_votes) LOOP
    IF v_vote_val = 'approve' THEN
      v_approvals := v_approvals + 1;
    ELSIF v_vote_val = 'reject' THEN
      v_rejections := v_rejections + 1;
    END IF;
  END LOOP;

  v_uncast := v_voter_count - (v_approvals + v_rejections);

  -- 1. Check for Early Approval
  IF v_approvals >= v_req_approvals THEN
    -- Approved! Perform 2nd draw excluding provisional captain
    FOR v_part IN
      SELECT id, nickname, player_color, session_token
      FROM public.participants
      WHERE id = ANY(v_ev.eligible_candidate_ids)
        AND id <> v_ev.provisional_captain_id
      ORDER BY joined_at ASC
    LOOP
      v_remaining_ids := array_append(v_remaining_ids, v_part.id);
      v_weight := private.calculate_player_captain_weight(v_part.session_token);
      v_total_weight := v_total_weight + v_weight;
      v_remaining_weights := array_append(v_remaining_weights, v_weight);
    END LOOP;

    IF cardinality(v_remaining_ids) = 0 THEN
      -- If only 1 player existed originally, keep provisional captain
      v_new_chosen_id := v_ev.provisional_captain_id;
      v_new_chosen_nick := v_ev.provisional_captain_nickname;
    ELSE
      v_roll := private.crypto_random_double() * v_total_weight;
      FOR v_i IN 1..cardinality(v_remaining_ids) LOOP
        v_cum := v_cum + v_remaining_weights[v_i];
        IF v_new_chosen_id IS NULL AND (v_cum >= v_roll OR v_i = cardinality(v_remaining_ids)) THEN
          v_new_chosen_id := v_remaining_ids[v_i];
          SELECT nickname INTO v_new_chosen_nick FROM public.participants WHERE id = v_new_chosen_id;
        END IF;
      END LOOP;
    END IF;

    -- Finalize with 2nd captain
    UPDATE public.captain_events
    SET status = 'finalized',
        final_captain_id = v_new_chosen_id,
        final_captain_nickname = v_new_chosen_nick,
        votes = v_votes,
        updated_at = now()
    WHERE id = p_event_id;

    -- Record exactly one captain win for final captain in history
    SELECT session_token INTO v_caller_stable FROM public.participants WHERE id = v_new_chosen_id;
    INSERT INTO private.captain_history (
      room_id, event_id, participant_id, stable_player_id, nickname, was_reroll
    ) VALUES (
      p_room_id, p_event_id, v_new_chosen_id, coalesce(v_caller_stable, v_new_chosen_id::text), v_new_chosen_nick, true
    ) ON CONFLICT (room_id, event_id) DO NOTHING;

    RETURN jsonb_build_object(
      'eventId', p_event_id,
      'status', 'finalized',
      'finalDecision', 'approved',
      'finalCaptainId', v_new_chosen_id,
      'finalCaptainNickname', v_new_chosen_nick,
      'votes', v_votes,
      'approvals', v_approvals,
      'rejections', v_rejections,
      'requiredApprovals', v_req_approvals,
      'hasRerolled', true
    );
  END IF;

  -- 2. Check for Early Rejection
  -- If uncast + approvals < requiredApprovals, approval is impossible
  IF (v_approvals + v_uncast) < v_req_approvals THEN
    -- Rejected! Original provisional captain confirmed
    UPDATE public.captain_events
    SET status = 'finalized',
        final_captain_id = v_ev.provisional_captain_id,
        final_captain_nickname = v_ev.provisional_captain_nickname,
        votes = v_votes,
        updated_at = now()
    WHERE id = p_event_id;

    -- Record exactly one captain win for original provisional captain
    SELECT session_token INTO v_caller_stable FROM public.participants WHERE id = v_ev.provisional_captain_id;
    INSERT INTO private.captain_history (
      room_id, event_id, participant_id, stable_player_id, nickname, was_reroll
    ) VALUES (
      p_room_id, p_event_id, v_ev.provisional_captain_id, coalesce(v_caller_stable, v_ev.provisional_captain_id::text), v_ev.provisional_captain_nickname, false
    ) ON CONFLICT (room_id, event_id) DO NOTHING;

    RETURN jsonb_build_object(
      'eventId', p_event_id,
      'status', 'finalized',
      'finalDecision', 'rejected',
      'finalCaptainId', v_ev.provisional_captain_id,
      'finalCaptainNickname', v_ev.provisional_captain_nickname,
      'votes', v_votes,
      'approvals', v_approvals,
      'rejections', v_rejections,
      'requiredApprovals', v_req_approvals,
      'hasRerolled', true
    );
  END IF;

  -- 3. Vote still ongoing
  UPDATE public.captain_events
  SET votes = v_votes,
      updated_at = now()
  WHERE id = p_event_id;

  RETURN jsonb_build_object(
    'eventId', p_event_id,
    'status', 'reroll_vote_open',
    'votes', v_votes,
    'approvals', v_approvals,
    'rejections', v_rejections,
    'requiredApprovals', v_req_approvals,
    'hasRerolled', true
  );
END;
$$;

-- 8. RPC: Resolve / finalize captain event on timer expiry or manual sync
CREATE OR REPLACE FUNCTION public.resolve_captain_event(
  p_room_id uuid,
  p_event_id text
) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_ev RECORD;
  v_votes jsonb;
  v_voter_count int;
  v_req_approvals int;
  v_approvals int := 0;
  v_rejections int := 0;
  v_vote_key text;
  v_vote_val text;
  v_caller_stable text;
  -- 2nd draw
  v_remaining_ids uuid[] := '{}';
  v_remaining_weights double precision[] := '{}';
  v_part RECORD;
  v_weight double precision;
  v_total_weight double precision := 0.0;
  v_roll double precision;
  v_cum double precision := 0.0;
  v_new_chosen_id uuid := NULL;
  v_new_chosen_nick text := NULL;
  v_i int;
BEGIN
  -- Lock event row
  SELECT * INTO v_ev
  FROM public.captain_events
  WHERE id = p_event_id
    AND room_id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'WSH_EVENT_NOT_FOUND';
  END IF;

  -- If already finalized, return idempotent result
  IF v_ev.status = 'finalized' THEN
    RETURN jsonb_build_object(
      'eventId', p_event_id,
      'status', 'finalized',
      'finalCaptainId', v_ev.final_captain_id,
      'finalCaptainNickname', v_ev.final_captain_nickname,
      'hasRerolled', v_ev.has_rerolled,
      'provisionalCaptainId', v_ev.provisional_captain_id,
      'provisionalCaptainNickname', v_ev.provisional_captain_nickname,
      'votes', v_ev.votes
    );
  END IF;

  -- Case A: Objection window expired with NO reroll requested
  IF v_ev.status = 'initial_result_provisional' OR v_ev.status = 'objection_window' THEN
    UPDATE public.captain_events
    SET status = 'finalized',
        final_captain_id = v_ev.provisional_captain_id,
        final_captain_nickname = v_ev.provisional_captain_nickname,
        updated_at = now()
    WHERE id = p_event_id;

    SELECT session_token INTO v_caller_stable FROM public.participants WHERE id = v_ev.provisional_captain_id;
    INSERT INTO private.captain_history (
      room_id, event_id, participant_id, stable_player_id, nickname, was_reroll
    ) VALUES (
      p_room_id, p_event_id, v_ev.provisional_captain_id, coalesce(v_caller_stable, v_ev.provisional_captain_id::text), v_ev.provisional_captain_nickname, false
    ) ON CONFLICT (room_id, event_id) DO NOTHING;

    RETURN jsonb_build_object(
      'eventId', p_event_id,
      'status', 'finalized',
      'finalDecision', 'uncontested',
      'finalCaptainId', v_ev.provisional_captain_id,
      'finalCaptainNickname', v_ev.provisional_captain_nickname,
      'hasRerolled', false
    );
  END IF;

  -- Case B: Reroll vote timer expired
  IF v_ev.status = 'reroll_vote_open' THEN
    v_votes := coalesce(v_ev.votes, '{}'::jsonb);
    v_voter_count := cardinality(v_ev.frozen_voter_ids);
    v_req_approvals := (v_voter_count / 2) + 1;

    FOR v_vote_key, v_vote_val IN SELECT key, value#>>'{}' FROM jsonb_each(v_votes) LOOP
      IF v_vote_val = 'approve' THEN
        v_approvals := v_approvals + 1;
      ELSIF v_vote_val = 'reject' THEN
        v_rejections := v_rejections + 1;
      END IF;
    END LOOP;

    -- If tie or approvals < requiredApprovals -> REJECTED ("keep them")
    IF v_approvals < v_req_approvals THEN
      UPDATE public.captain_events
      SET status = 'finalized',
          final_captain_id = v_ev.provisional_captain_id,
          final_captain_nickname = v_ev.provisional_captain_nickname,
          updated_at = now()
      WHERE id = p_event_id;

      SELECT session_token INTO v_caller_stable FROM public.participants WHERE id = v_ev.provisional_captain_id;
      INSERT INTO private.captain_history (
        room_id, event_id, participant_id, stable_player_id, nickname, was_reroll
      ) VALUES (
        p_room_id, p_event_id, v_ev.provisional_captain_id, coalesce(v_caller_stable, v_ev.provisional_captain_id::text), v_ev.provisional_captain_nickname, false
      ) ON CONFLICT (room_id, event_id) DO NOTHING;

      RETURN jsonb_build_object(
        'eventId', p_event_id,
        'status', 'finalized',
        'finalDecision', 'rejected',
        'finalCaptainId', v_ev.provisional_captain_id,
        'finalCaptainNickname', v_ev.provisional_captain_nickname,
        'votes', v_votes,
        'approvals', v_approvals,
        'rejections', v_rejections,
        'requiredApprovals', v_req_approvals,
        'hasRerolled', true
      );
    ELSE
      -- Approved at timeout! 2nd draw excluding provisional captain
      FOR v_part IN
        SELECT id, nickname, player_color, session_token
        FROM public.participants
        WHERE id = ANY(v_ev.eligible_candidate_ids)
          AND id <> v_ev.provisional_captain_id
        ORDER BY joined_at ASC
      LOOP
        v_remaining_ids := array_append(v_remaining_ids, v_part.id);
        v_weight := private.calculate_player_captain_weight(v_part.session_token);
        v_total_weight := v_total_weight + v_weight;
        v_remaining_weights := array_append(v_remaining_weights, v_weight);
      END LOOP;

      IF cardinality(v_remaining_ids) = 0 THEN
        v_new_chosen_id := v_ev.provisional_captain_id;
        v_new_chosen_nick := v_ev.provisional_captain_nickname;
      ELSE
        v_roll := private.crypto_random_double() * v_total_weight;
        FOR v_i IN 1..cardinality(v_remaining_ids) LOOP
          v_cum := v_cum + v_remaining_weights[v_i];
          IF v_new_chosen_id IS NULL AND (v_cum >= v_roll OR v_i = cardinality(v_remaining_ids)) THEN
            v_new_chosen_id := v_remaining_ids[v_i];
            SELECT nickname INTO v_new_chosen_nick FROM public.participants WHERE id = v_new_chosen_id;
          END IF;
        END LOOP;
      END IF;

      UPDATE public.captain_events
      SET status = 'finalized',
          final_captain_id = v_new_chosen_id,
          final_captain_nickname = v_new_chosen_nick,
          updated_at = now()
      WHERE id = p_event_id;

      SELECT session_token INTO v_caller_stable FROM public.participants WHERE id = v_new_chosen_id;
      INSERT INTO private.captain_history (
        room_id, event_id, participant_id, stable_player_id, nickname, was_reroll
      ) VALUES (
        p_room_id, p_event_id, v_new_chosen_id, coalesce(v_caller_stable, v_new_chosen_id::text), v_new_chosen_nick, true
      ) ON CONFLICT (room_id, event_id) DO NOTHING;

      RETURN jsonb_build_object(
        'eventId', p_event_id,
        'status', 'finalized',
        'finalDecision', 'approved',
        'finalCaptainId', v_new_chosen_id,
        'finalCaptainNickname', v_new_chosen_nick,
        'votes', v_votes,
        'approvals', v_approvals,
        'rejections', v_rejections,
        'requiredApprovals', v_req_approvals,
        'hasRerolled', true
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('eventId', p_event_id, 'status', v_ev.status);
END;
$$;

-- 9. RPC: Get active captain event state for room (recovery & reconnects)
CREATE OR REPLACE FUNCTION public.get_captain_event_state(
  p_room_id uuid,
  p_session_token text
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_ev RECORD;
  v_voter_count int;
  v_req_approvals int;
  v_approvals int := 0;
  v_rejections int := 0;
  v_vote_key text;
  v_vote_val text;
BEGIN
  SELECT * INTO v_ev
  FROM public.captain_events
  WHERE room_id = p_room_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_voter_count := cardinality(v_ev.frozen_voter_ids);
  v_req_approvals := (v_voter_count / 2) + 1;

  IF v_ev.votes IS NOT NULL THEN
    FOR v_vote_key, v_vote_val IN SELECT key, value#>>'{}' FROM jsonb_each(v_ev.votes) LOOP
      IF v_vote_val = 'approve' THEN
        v_approvals := v_approvals + 1;
      ELSIF v_vote_val = 'reject' THEN
        v_rejections := v_rejections + 1;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'eventId', v_ev.id,
    'status', v_ev.status,
    'provisionalCaptainId', v_ev.provisional_captain_id,
    'provisionalCaptainNickname', v_ev.provisional_captain_nickname,
    'finalCaptainId', v_ev.final_captain_id,
    'finalCaptainNickname', v_ev.final_captain_nickname,
    'requesterParticipantId', v_ev.requester_participant_id,
    'frozenVoterIds', v_ev.frozen_voter_ids,
    'votes', coalesce(v_ev.votes, '{}'::jsonb),
    'approvals', v_approvals,
    'rejections', v_rejections,
    'requiredApprovals', v_req_approvals,
    'voterCount', v_voter_count,
    'objectionEndsAt', v_ev.objection_ends_at,
    'voteEndsAt', v_ev.vote_ends_at,
    'hasRerolled', v_ev.has_rerolled,
    'candidates', v_ev.candidate_meta
  );
END;
$$;

-- Permissions
REVOKE ALL ON FUNCTION public.start_captain_selection(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_captain_selection(uuid, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.request_captain_reroll(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_captain_reroll(uuid, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.cast_captain_vote(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cast_captain_vote(uuid, text, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.resolve_captain_event(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_captain_event(uuid, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_captain_event_state(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_captain_event_state(uuid, text) TO anon, authenticated;
