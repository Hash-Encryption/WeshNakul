-- 20261010000200_audit_and_harden_captain_roulette.sql
-- Captain Roulette Security Hardening, Stable Cross-Room Identity, and Strict Timing Enforcement

-- 1. Ensure stable_player_id column exists on participants and room_mode on rooms
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS stable_player_id text;
CREATE INDEX IF NOT EXISTS idx_participants_stable_player ON public.participants (stable_player_id);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS room_mode text NOT NULL DEFAULT 'food';

-- 2. Drop previous signatures to avoid parameter default conflicts
DROP FUNCTION IF EXISTS public.create_room_authorized(text, text, text, text, text, text, text, double precision, double precision);
DROP FUNCTION IF EXISTS public.join_room_authorized(text, text, text);
DROP FUNCTION IF EXISTS private.calculate_player_captain_weight(text);

-- 3. Update create_room_authorized to capture stable_player_id
CREATE OR REPLACE FUNCTION public.create_room_authorized(
  p_code text,
  p_session_token text,
  p_eating_mode text,
  p_city text,
  p_neighborhood text,
  p_language text,
  p_nickname text,
  p_latitude double precision DEFAULT NULL,
  p_longitude double precision DEFAULT NULL,
  p_stable_player_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  room_row public.rooms%ROWTYPE;
  participant_row public.participants%ROWTYPE;
  participant_count int;
  v_stable_id text;
BEGIN
  IF p_session_token IS NULL OR length(p_session_token) < 16 OR p_code !~ '^[A-Z0-9]{4}$' OR p_eating_mode NOT IN ('delivery','dine_in','any')
    OR p_language NOT IN ('ar','en') OR nullif(trim(p_city),'') IS NULL OR nullif(trim(p_nickname),'') IS NULL
  THEN RAISE EXCEPTION 'WSH_INVALID_ROOM_INPUT' USING ERRCODE='22023'; END IF;
  IF (p_latitude IS NULL) <> (p_longitude IS NULL) THEN RAISE EXCEPTION 'WSH_INVALID_LOCATION' USING ERRCODE='22023'; END IF;

  v_stable_id := coalesce(nullif(trim(p_stable_player_id), ''), p_session_token);

  INSERT INTO public.rooms(code,status,eating_mode,city,neighborhood,language,current_stage,stage)
  VALUES (p_code,'food_selection',p_eating_mode,trim(p_city),nullif(trim(p_neighborhood),''),p_language,'voting','voting') RETURNING * INTO room_row;

  SELECT count(*)::int INTO participant_count FROM public.participants WHERE room_id=room_row.id;
  INSERT INTO public.participants(room_id,session_token,stable_player_id,nickname,player_color,player_shape,is_host,status)
  VALUES (room_row.id,p_session_token,v_stable_id,trim(p_nickname),(ARRAY['#55B96A','#F0443E','#FFD75A','#73C8EA','#9B86EC','#F6A6AD','#E5D3B3'])[participant_count%7+1],
    (ARRAY['scallop','squircle','circle','diamond','hexagon'])[participant_count%5+1],true,'active') RETURNING * INTO participant_row;

  UPDATE public.rooms SET host_participant_id=participant_row.id, category_summary=private.category_state(room_row.id)
  WHERE id=room_row.id RETURNING * INTO room_row;

  IF p_latitude IS NOT NULL THEN INSERT INTO private.room_locations(room_id,latitude,longitude) VALUES(room_row.id,p_latitude,p_longitude); END IF;
  RETURN jsonb_build_object('room',to_jsonb(room_row),'participant',to_jsonb(participant_row));
END;
$$;

-- 4. Update join_room_authorized to capture stable_player_id
CREATE OR REPLACE FUNCTION public.join_room_authorized(
  p_code text,
  p_session_token text,
  p_nickname text,
  p_stable_player_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  room_row public.rooms%ROWTYPE;
  participant_row public.participants%ROWTYPE;
  participant_count int;
  v_stable_id text;
BEGIN
  IF p_session_token IS NULL OR length(p_session_token) < 16 OR nullif(trim(p_nickname),'') IS NULL THEN
    RAISE EXCEPTION 'WSH_INVALID_JOIN_INPUT' USING ERRCODE='22023';
  END IF;
  SELECT * INTO room_row FROM public.rooms WHERE code=upper(trim(p_code)) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'WSH_ROOM_NOT_FOUND' USING ERRCODE='22023'; END IF;
  IF room_row.created_at <= now()-interval '30 minutes' OR room_row.expires_at<=now() THEN RAISE EXCEPTION 'WSH_ROOM_EXPIRED' USING ERRCODE='PT409'; END IF;

  v_stable_id := coalesce(nullif(trim(p_stable_player_id), ''), p_session_token);

  SELECT * INTO participant_row FROM public.participants WHERE room_id=room_row.id AND session_token=p_session_token;
  IF FOUND THEN
    IF participant_row.stable_player_id IS NULL AND v_stable_id IS NOT NULL THEN
      UPDATE public.participants SET stable_player_id = v_stable_id WHERE id = participant_row.id RETURNING * INTO participant_row;
    END IF;
    RETURN jsonb_build_object('room',to_jsonb(room_row),'participant',to_jsonb(participant_row));
  END IF;

  IF room_row.stage NOT IN ('lobby','voting') AND NOT (room_row.room_mode = 'cafes' AND room_row.stage = 'swiping') THEN
    RAISE EXCEPTION 'WSH_INVALID_ROOM_STAGE' USING ERRCODE='PT409';
  END IF;

  SELECT count(*)::int INTO participant_count FROM public.participants WHERE room_id=room_row.id AND status='active';
  IF participant_count>=10 THEN RAISE EXCEPTION 'WSH_ROOM_FULL' USING ERRCODE='PT409'; END IF;

  INSERT INTO public.participants(room_id,session_token,stable_player_id,nickname,player_color,player_shape,is_host,status)
  VALUES(room_row.id,p_session_token,v_stable_id,trim(p_nickname),(ARRAY['#55B96A','#F0443E','#FFD75A','#73C8EA','#9B86EC','#F6A6AD','#E5D3B3'])[participant_count%7+1],
    (ARRAY['scallop','squircle','circle','diamond','hexagon'])[participant_count%5+1],false,'active') RETURNING * INTO participant_row;

  IF room_row.stage='voting' THEN
    UPDATE public.rooms SET version=version+1,category_summary=private.category_state(room_row.id)
    WHERE id=room_row.id RETURNING * INTO room_row;
  ELSE
    UPDATE public.rooms SET version=version+1
    WHERE id=room_row.id RETURNING * INTO room_row;
  END IF;

  RETURN jsonb_build_object('room',to_jsonb(room_row),'participant',to_jsonb(participant_row));
END;
$$;

-- 5. Calculate decayed weight with optional reference clock for testing and exact boundary precision
CREATE OR REPLACE FUNCTION private.calculate_player_captain_weight(
  p_stable_id text,
  p_ref_time timestamptz DEFAULT now()
) RETURNS double precision
LANGUAGE plpgsql STABLE SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_penalty double precision := 0.0;
  v_rec RECORD;
  v_age double precision;
  v_contribution double precision;
BEGIN
  IF p_stable_id IS NULL OR length(trim(p_stable_id)) = 0 THEN
    RETURN 100.0;
  END IF;

  FOR v_rec IN
    SELECT created_at
    FROM private.captain_history
    WHERE stable_player_id = trim(p_stable_id)
      AND created_at > (p_ref_time - interval '14 days')
      AND created_at <= p_ref_time
  LOOP
    v_age := extract(epoch from (p_ref_time - v_rec.created_at)) / 86400.0;
    IF v_age >= 0.0 AND v_age < 14.0 THEN
      v_contribution := power(0.5, v_age / 7.0);
      v_penalty := v_penalty + v_contribution;
    END IF;
  END LOOP;

  RETURN 100.0 / (1.0 + 4.0 * v_penalty);
END;
$$;

-- 6. RPC: start_captain_selection hardened
CREATE OR REPLACE FUNCTION public.start_captain_selection(
  p_room_id uuid,
  p_session_token text,
  p_stable_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_caller RECORD;
  v_existing_ev RECORD;
  v_candidates jsonb := '[]'::jsonb;
  v_part RECORD;
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

  -- Ensure caller's stable identity is set if provided
  IF p_stable_id IS NOT NULL AND length(trim(p_stable_id)) > 0 THEN
    UPDATE public.participants
    SET stable_player_id = trim(p_stable_id)
    WHERE id = v_caller.id AND (stable_player_id IS NULL OR stable_player_id = session_token);
  END IF;

  -- Return active unfinalized event if one is in progress (prevents race conditions)
  SELECT * INTO v_existing_ev
  FROM public.captain_events
  WHERE room_id = p_room_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND AND v_existing_ev.status <> 'finalized' THEN
    RETURN jsonb_build_object(
      'eventId', v_existing_ev.id,
      'status', v_existing_ev.status,
      'provisionalCaptainId', v_existing_ev.provisional_captain_id,
      'provisionalCaptainNickname', v_existing_ev.provisional_captain_nickname,
      'frozenVoterIds', v_existing_ev.frozen_voter_ids,
      'objectionEndsAt', v_existing_ev.objection_ends_at,
      'voteEndsAt', v_existing_ev.vote_ends_at,
      'candidates', v_existing_ev.candidate_meta,
      'hasRerolled', v_existing_ev.has_rerolled
    );
  END IF;

  -- Gather eligible ACTIVE participants only (exclude away and disconnected; no fallbacks)
  FOR v_part IN
    SELECT id, nickname, player_color, coalesce(stable_player_id, session_token) as stable_id
    FROM public.participants
    WHERE room_id = p_room_id
      AND status = 'active'
    ORDER BY joined_at ASC
  LOOP
    v_cand_ids := array_append(v_cand_ids, v_part.id);
  END LOOP;

  -- Require at least 2 active players for Captain Roulette
  IF cardinality(v_cand_ids) < 2 THEN
    RAISE EXCEPTION 'WSH_INSUFFICIENT_ACTIVE_PLAYERS';
  END IF;

  -- Build candidates metadata and weights using stable_player_id
  FOR v_part IN
    SELECT id, nickname, player_color, coalesce(stable_player_id, session_token) as stable_id
    FROM public.participants
    WHERE id = ANY(v_cand_ids)
    ORDER BY joined_at ASC
  LOOP
    v_weight := private.calculate_player_captain_weight(v_part.stable_id);
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

-- 7. RPC: request_captain_reroll hardened
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

  v_voter_count := cardinality(v_ev.frozen_voter_ids);
  IF v_voter_count < 2 THEN
    RAISE EXCEPTION 'WSH_INSUFFICIENT_VOTERS';
  END IF;

  v_vote_ends := now() + interval '15 seconds';
  v_votes := jsonb_build_object(v_caller.id::text, 'approve');
  v_req_approvals := (v_voter_count / 2) + 1; -- strict majority floor(N / 2) + 1

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

-- 8. RPC: cast_captain_vote hardened
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
  v_winner_stable text;
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

  -- 1. Early Approval: strict majority reached
  IF v_approvals >= v_req_approvals THEN
    FOR v_part IN
      SELECT id, nickname, coalesce(stable_player_id, session_token) as stable_id
      FROM public.participants
      WHERE id = ANY(v_ev.eligible_candidate_ids)
        AND id <> v_ev.provisional_captain_id
      ORDER BY joined_at ASC
    LOOP
      v_remaining_ids := array_append(v_remaining_ids, v_part.id);
      v_weight := private.calculate_player_captain_weight(v_part.stable_id);
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
        votes = v_votes,
        updated_at = now()
    WHERE id = p_event_id;

    -- Record exactly one captain win for final captain in history with stable identity
    SELECT coalesce(stable_player_id, session_token) INTO v_winner_stable
    FROM public.participants WHERE id = v_new_chosen_id;

    INSERT INTO private.captain_history (
      room_id, event_id, participant_id, stable_player_id, nickname, was_reroll
    ) VALUES (
      p_room_id, p_event_id, v_new_chosen_id, coalesce(v_winner_stable, v_new_chosen_id::text), v_new_chosen_nick, true
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

  -- 2. Early Rejection: approval mathematically impossible
  IF (v_approvals + v_uncast) < v_req_approvals THEN
    UPDATE public.captain_events
    SET status = 'finalized',
        final_captain_id = v_ev.provisional_captain_id,
        final_captain_nickname = v_ev.provisional_captain_nickname,
        votes = v_votes,
        updated_at = now()
    WHERE id = p_event_id;

    SELECT coalesce(stable_player_id, session_token) INTO v_winner_stable
    FROM public.participants WHERE id = v_ev.provisional_captain_id;

    INSERT INTO private.captain_history (
      room_id, event_id, participant_id, stable_player_id, nickname, was_reroll
    ) VALUES (
      p_room_id, p_event_id, v_ev.provisional_captain_id, coalesce(v_winner_stable, v_ev.provisional_captain_id::text), v_ev.provisional_captain_nickname, false
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

  -- 3. Vote still open
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

-- 9. RPC: resolve_captain_event hardened with caller auth and strict deadline checking
DROP FUNCTION IF EXISTS public.resolve_captain_event(uuid, text);

CREATE OR REPLACE FUNCTION public.resolve_captain_event(
  p_room_id uuid,
  p_event_id text,
  p_session_token text
) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_caller_id uuid;
  v_ev RECORD;
  v_votes jsonb;
  v_voter_count int;
  v_req_approvals int;
  v_approvals int := 0;
  v_rejections int := 0;
  v_vote_key text;
  v_vote_val text;
  v_winner_stable text;
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
  -- Authenticate caller in room
  SELECT id INTO v_caller_id
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

  -- Case A: Objection window check
  IF v_ev.status = 'initial_result_provisional' OR v_ev.status = 'objection_window' THEN
    -- Strictly enforce server-side objection window deadline
    IF now() < v_ev.objection_ends_at THEN
      RETURN jsonb_build_object(
        'eventId', p_event_id,
        'status', v_ev.status,
        'provisionalCaptainId', v_ev.provisional_captain_id,
        'provisionalCaptainNickname', v_ev.provisional_captain_nickname,
        'objectionEndsAt', v_ev.objection_ends_at,
        'hasRerolled', false,
        'message', 'OBJECTION_WINDOW_ACTIVE'
      );
    END IF;

    -- Objection window expired with NO objection: finalize uncontested provisional captain
    UPDATE public.captain_events
    SET status = 'finalized',
        final_captain_id = v_ev.provisional_captain_id,
        final_captain_nickname = v_ev.provisional_captain_nickname,
        updated_at = now()
    WHERE id = p_event_id;

    SELECT coalesce(stable_player_id, session_token) INTO v_winner_stable
    FROM public.participants WHERE id = v_ev.provisional_captain_id;

    INSERT INTO private.captain_history (
      room_id, event_id, participant_id, stable_player_id, nickname, was_reroll
    ) VALUES (
      p_room_id, p_event_id, v_ev.provisional_captain_id, coalesce(v_winner_stable, v_ev.provisional_captain_id::text), v_ev.provisional_captain_nickname, false
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

  -- Case B: Reroll voting window check
  IF v_ev.status = 'reroll_vote_open' THEN
    -- Strictly enforce server-side voting window deadline
    IF now() < v_ev.vote_ends_at THEN
      RETURN jsonb_build_object(
        'eventId', p_event_id,
        'status', v_ev.status,
        'voteEndsAt', v_ev.vote_ends_at,
        'votes', v_ev.votes,
        'hasRerolled', true,
        'message', 'VOTING_WINDOW_ACTIVE'
      );
    END IF;

    -- Voting timer expired: tally votes
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

    -- If tie or approvals < requiredApprovals -> REJECTED (keep provisional captain)
    IF v_approvals < v_req_approvals THEN
      UPDATE public.captain_events
      SET status = 'finalized',
          final_captain_id = v_ev.provisional_captain_id,
          final_captain_nickname = v_ev.provisional_captain_nickname,
          updated_at = now()
      WHERE id = p_event_id;

      SELECT coalesce(stable_player_id, session_token) INTO v_winner_stable
      FROM public.participants WHERE id = v_ev.provisional_captain_id;

      INSERT INTO private.captain_history (
        room_id, event_id, participant_id, stable_player_id, nickname, was_reroll
      ) VALUES (
        p_room_id, p_event_id, v_ev.provisional_captain_id, coalesce(v_winner_stable, v_ev.provisional_captain_id::text), v_ev.provisional_captain_nickname, false
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
      -- Approved at timeout! 2nd draw excluding provisional captain using stable IDs
      FOR v_part IN
        SELECT id, nickname, coalesce(stable_player_id, session_token) as stable_id
        FROM public.participants
        WHERE id = ANY(v_ev.eligible_candidate_ids)
          AND id <> v_ev.provisional_captain_id
        ORDER BY joined_at ASC
      LOOP
        v_remaining_ids := array_append(v_remaining_ids, v_part.id);
        v_weight := private.calculate_player_captain_weight(v_part.stable_id);
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

      SELECT coalesce(stable_player_id, session_token) INTO v_winner_stable
      FROM public.participants WHERE id = v_new_chosen_id;

      INSERT INTO private.captain_history (
        room_id, event_id, participant_id, stable_player_id, nickname, was_reroll
      ) VALUES (
        p_room_id, p_event_id, v_new_chosen_id, coalesce(v_winner_stable, v_new_chosen_id::text), v_new_chosen_nick, true
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

-- 10. RPC: get_captain_event_state authenticated
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
  -- Authenticate caller in room
  PERFORM 1
  FROM public.participants
  WHERE room_id = p_room_id
    AND session_token = p_session_token
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'WSH_UNAUTHORIZED';
  END IF;

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

-- 11. Security: Revoke broad table access and enforce RLS
DROP POLICY IF EXISTS "Allow read captain events" ON public.captain_events;
ALTER TABLE public.captain_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.captain_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE private.captain_history FROM PUBLIC, anon, authenticated;

-- Function Execution Grants
REVOKE ALL ON FUNCTION public.create_room_authorized(text, text, text, text, text, text, text, double precision, double precision, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_room_authorized(text, text, text, text, text, text, text, double precision, double precision, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.join_room_authorized(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_room_authorized(text, text, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.start_captain_selection(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_captain_selection(uuid, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.request_captain_reroll(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_captain_reroll(uuid, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.cast_captain_vote(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cast_captain_vote(uuid, text, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.resolve_captain_event(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_captain_event(uuid, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_captain_event_state(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_captain_event_state(uuid, text) TO anon, authenticated;
