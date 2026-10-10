-- WeshNakul — Forward-Only Migration: Captain Roulette 2-Player Minimum Eligibility & Immediate Finalization
-- Migration: 20261010000300_captain_roulette_minimum_players.sql
-- Enforces:
-- 1. Minimum 2 active players (1 active player is rejected with WSH_INSUFFICIENT_ACTIVE_PLAYERS).
-- 2. With exactly 2 active players: immediately finalize selection into captain_history; disable objection/voting/reroll.
-- 3. With 3+ active players: preserve existing provisional selection, 10s objection window, and voting flow.
-- Inactive, away, and disconnected players are strictly ignored in player counts.

CREATE OR REPLACE FUNCTION public.start_captain_selection(
  p_room_id uuid,
  p_session_token text,
  p_stable_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, public, extensions, private AS $$
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
  v_winner_stable text := NULL;
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
      'finalCaptainId', v_existing_ev.final_captain_id,
      'finalCaptainNickname', v_existing_ev.final_captain_nickname,
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

  IF cardinality(v_cand_ids) = 2 THEN
    -- Exactly 2 active players: immediately finalize selection into captain_history
    SELECT coalesce(stable_player_id, session_token) INTO v_winner_stable
    FROM public.participants WHERE id = v_chosen_id;

    INSERT INTO public.captain_events (
      id,
      room_id,
      status,
      provisional_captain_id,
      provisional_captain_nickname,
      final_captain_id,
      final_captain_nickname,
      frozen_voter_ids,
      objection_ends_at,
      eligible_candidate_ids,
      candidate_meta,
      has_rerolled
    ) VALUES (
      v_event_id,
      p_room_id,
      'finalized',
      v_chosen_id,
      v_chosen_nick,
      v_chosen_id,
      v_chosen_nick,
      v_cand_ids,
      NULL,
      v_cand_ids,
      v_candidates,
      false
    );

    INSERT INTO private.captain_history (
      room_id,
      event_id,
      participant_id,
      stable_player_id,
      nickname,
      was_reroll
    ) VALUES (
      p_room_id,
      v_event_id,
      v_chosen_id,
      coalesce(v_winner_stable, v_chosen_id::text),
      v_chosen_nick,
      false
    ) ON CONFLICT (room_id, event_id) DO NOTHING;

    SELECT jsonb_build_object(
      'eventId', v_event_id,
      'status', 'finalized',
      'provisionalCaptainId', v_chosen_id,
      'provisionalCaptainNickname', v_chosen_nick,
      'finalCaptainId', v_chosen_id,
      'finalCaptainNickname', v_chosen_nick,
      'finalDecision', 'uncontested',
      'frozenVoterIds', v_cand_ids,
      'objectionEndsAt', NULL,
      'voteEndsAt', NULL,
      'candidates', v_candidates,
      'hasRerolled', false
    ) INTO v_result;

  ELSE
    -- 3 or more active players: provisional selection with 10s objection window
    v_objection_ends := now() + interval '10 seconds';

    INSERT INTO public.captain_events (
      id,
      room_id,
      status,
      provisional_captain_id,
      provisional_captain_nickname,
      frozen_voter_ids,
      objection_ends_at,
      eligible_candidate_ids,
      candidate_meta,
      has_rerolled
    ) VALUES (
      v_event_id,
      p_room_id,
      'initial_result_provisional',
      v_chosen_id,
      v_chosen_nick,
      v_cand_ids,
      v_objection_ends,
      v_cand_ids,
      v_candidates,
      false
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
  END IF;

  RETURN v_result;
END;
$$;

-- Reroll requests are disallowed if fewer than 3 active voters or already finalized
CREATE OR REPLACE FUNCTION public.request_captain_reroll(
  p_room_id uuid,
  p_event_id text,
  p_session_token text
) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, public, extensions, private AS $$
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

  -- Disallow reroll if already used
  IF v_ev.has_rerolled THEN
    RAISE EXCEPTION 'WSH_REROLL_ALREADY_USED';
  END IF;

  -- Check if objection window is open
  IF v_ev.status <> 'initial_result_provisional' AND v_ev.status <> 'objection_window' THEN
    RAISE EXCEPTION 'WSH_INVALID_EVENT_STAGE';
  END IF;

  -- Disallow reroll if fewer than 3 active players/voters
  IF cardinality(v_ev.frozen_voter_ids) < 3 THEN
    RAISE EXCEPTION 'WSH_REROLL_NOT_ALLOWED';
  END IF;

  IF now() > v_ev.objection_ends_at THEN
    RAISE EXCEPTION 'WSH_OBJECTION_WINDOW_EXPIRED';
  END IF;

  v_voter_count := cardinality(v_ev.frozen_voter_ids);
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
    'voteEndsAt', v_vote_ends,
    'votes', v_votes,
    'approvals', 1,
    'rejections', 0,
    'requiredApprovals', v_req_approvals,
    'voterCount', v_voter_count,
    'hasRerolled', true
  );
END;
$$;
