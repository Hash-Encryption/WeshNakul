-- WeshNakul — Forward-Only Migration: Captain Roulette 3-Player Minimum Eligibility
-- Migration: 20261010000300_captain_roulette_minimum_players.sql
-- Enforces that Captain Roulette strictly requires at least 3 active players.
-- Rejects 1 or 2 active players, and ignores away/disconnected players.

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

  -- Note: Participant identity is strictly immutable once joined. Client-supplied p_stable_id is ignored to prevent identity spoofing.

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

  -- Require at least 3 active players for Captain Roulette
  IF cardinality(v_cand_ids) < 3 THEN
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
