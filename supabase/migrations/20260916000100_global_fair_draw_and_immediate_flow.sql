-- 20260916000100_global_fair_draw_and_immediate_flow.sql
-- Global Fair Draw with Anti-Streak & Immediate Category Participation Flow:
-- 1. Ensure gen_random_bytes fallback exists if pgcrypto extension is omitted in test environments.
-- 2. Create private.fair_draw_history table with atomic row-locking concurrency.
-- 3. Implement private.crypto_random_index with unbiased rejection sampling.
-- 4. Implement private.secure_fair_draw helper with canonical candidate key and 2-win anti-streak exclusion.
-- 5. Wire secure_fair_draw into resolve_category_tie and resolve_restaurant_tie for Choose-for-Us.
-- 6. Update create_room_authorized so newly created rooms start directly in 'voting' with category_summary calculated after host insertion.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'gen_random_bytes') THEN
    CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea
    LANGUAGE sql VOLATILE AS $f$
      SELECT decode(substr(md5(gen_random_uuid()::text || clock_timestamp()::text || random()::text), 1, p_len * 2), 'hex')
    $f$;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS private.fair_draw_history (
  decision_kind text NOT NULL,
  canonical_candidate_key text NOT NULL,
  draw_version int NOT NULL DEFAULT 1,
  last_winner_id text NOT NULL,
  consecutive_win_count int NOT NULL DEFAULT 1,
  last_draw_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (decision_kind, canonical_candidate_key, draw_version)
);

REVOKE ALL ON TABLE private.fair_draw_history FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.crypto_random_index(p_count int) RETURNS int
LANGUAGE plpgsql VOLATILE SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_num bigint;
  v_limit bigint;
BEGIN
  IF p_count <= 1 THEN RETURN 1; END IF;
  -- 2^32 = 4294967296. Rejection sampling eliminates modulo bias.
  v_limit := (4294967296 / p_count) * p_count;
  LOOP
    v_num := ('x' || encode(gen_random_bytes(4), 'hex'))::bit(32)::bigint;
    IF v_num < v_limit THEN
      RETURN 1 + (v_num % p_count)::int;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION private.secure_fair_draw(
  p_decision_kind text,
  p_candidates text[],
  p_draw_version int DEFAULT 1
) RETURNS text
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_sorted text[];
  v_key text;
  v_last_winner text;
  v_consecutive int := 0;
  v_eligible text[];
  v_winner text;
  v_idx int;
BEGIN
  IF p_candidates IS NULL OR cardinality(p_candidates) = 0 THEN
    RETURN NULL;
  END IF;
  IF cardinality(p_candidates) = 1 THEN
    RETURN p_candidates[1];
  END IF;

  -- 1. Canonical key: sorted candidates joined by '|'
  SELECT array_agg(c ORDER BY c) INTO v_sorted FROM unnest(p_candidates) c;
  v_key := array_to_string(v_sorted, '|');

  -- 2. Lock history row atomically across rooms
  SELECT last_winner_id, consecutive_win_count
  INTO v_last_winner, v_consecutive
  FROM private.fair_draw_history
  WHERE decision_kind = p_decision_kind
    AND canonical_candidate_key = v_key
    AND draw_version = p_draw_version
  FOR UPDATE;

  -- 3. Anti-streak rule: after 2 consecutive identical wins for this exact canonical matchup,
  -- temporarily exclude that candidate for this draw only.
  IF FOUND AND v_consecutive >= 2 AND v_last_winner IS NOT NULL THEN
    SELECT array_agg(c) INTO v_eligible FROM unnest(v_sorted) c WHERE c <> v_last_winner;
    IF v_eligible IS NULL OR cardinality(v_eligible) = 0 THEN
      v_eligible := v_sorted;
    END IF;
  ELSE
    v_eligible := v_sorted;
  END IF;

  -- 4. Cryptographically secure unbiased draw
  v_idx := private.crypto_random_index(cardinality(v_eligible));
  v_winner := v_eligible[v_idx];

  -- 5. Update streak counter
  IF FOUND AND v_winner = v_last_winner THEN
    v_consecutive := v_consecutive + 1;
  ELSE
    v_last_winner := v_winner;
    v_consecutive := 1;
  END IF;

  -- 6. Upsert history row atomically
  INSERT INTO private.fair_draw_history (
    decision_kind, canonical_candidate_key, draw_version,
    last_winner_id, consecutive_win_count, last_draw_at, updated_at
  ) VALUES (
    p_decision_kind, v_key, p_draw_version,
    v_last_winner, v_consecutive, now(), now()
  )
  ON CONFLICT (decision_kind, canonical_candidate_key, draw_version)
  DO UPDATE SET
    last_winner_id = excluded.last_winner_id,
    consecutive_win_count = excluded.consecutive_win_count,
    last_draw_at = now(),
    updated_at = now();

  RETURN v_winner;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_category_tie(
  p_room_id uuid,p_session_token text,p_expected_version bigint,p_method text,p_category text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE participant_id uuid; room_row public.rooms%ROWTYPE; selected_category text;
BEGIN
  participant_id:=private.room_participant(p_room_id,p_session_token,true);
  SELECT * INTO room_row FROM public.rooms WHERE id=p_room_id FOR UPDATE;
  IF room_row.version<>p_expected_version THEN RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE='PT409'; END IF;
  IF room_row.stage<>'tiebreaker' OR cardinality(room_row.tied_categories)<2 THEN RAISE EXCEPTION 'WSH_NO_CATEGORY_TIE' USING ERRCODE='PT409'; END IF;
  IF p_method='host_pick' THEN
    IF p_category IS NULL OR NOT p_category=ANY(room_row.tied_categories) THEN RAISE EXCEPTION 'WSH_CATEGORY_NOT_IN_TIE' USING ERRCODE='22023'; END IF;
    selected_category:=p_category;
  ELSIF p_method='choose_for_us' THEN
    selected_category:=private.secure_fair_draw('category', room_row.tied_categories);
  ELSE RAISE EXCEPTION 'WSH_INVALID_RESOLUTION_METHOD' USING ERRCODE='22023'; END IF;
  UPDATE public.rooms SET stage='consensus',current_stage='consensus',winning_category=selected_category,
    consensus_type=CASE WHEN p_method='host_pick' THEN 'host_picked' ELSE 'random_picked' END,
    tied_categories='{}',category_summary=category_summary||jsonb_build_object('status','decided','winner',selected_category,'tiedCategories','[]'::jsonb),
    version=version+1 WHERE id=p_room_id;
  RETURN private.room_state(p_room_id,participant_id);
END
$$;

CREATE OR REPLACE FUNCTION public.resolve_restaurant_tie(
  p_room_id uuid,p_session_token text,p_expected_version bigint,p_method text,p_restaurant_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE participant_id uuid; room_row public.rooms%ROWTYPE; selected_id text; tied_ids text[];
BEGIN
  participant_id:=private.room_participant(p_room_id,p_session_token,true);
  SELECT * INTO room_row FROM public.rooms WHERE id=p_room_id FOR UPDATE;
  IF room_row.version<>p_expected_version THEN RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE='PT409'; END IF;
  IF room_row.stage<>'swiping' OR room_row.restaurant_state<>'tie' OR room_row.finalized_at IS NOT NULL THEN RAISE EXCEPTION 'WSH_NO_RESTAURANT_TIE' USING ERRCODE='PT409'; END IF;
  SELECT array_agg(value) INTO tied_ids FROM jsonb_array_elements_text(room_row.restaurant_summary->'tiedRestaurantIds');
  IF cardinality(tied_ids)<2 THEN RAISE EXCEPTION 'WSH_NO_RESTAURANT_TIE' USING ERRCODE='PT409'; END IF;
  IF p_method='host_pick' THEN
    IF p_restaurant_id IS NULL OR NOT p_restaurant_id=ANY(tied_ids) THEN RAISE EXCEPTION 'WSH_CANDIDATE_NOT_IN_TIE' USING ERRCODE='22023'; END IF;
    selected_id:=p_restaurant_id;
  ELSIF p_method='choose_for_us' THEN
    selected_id:=private.secure_fair_draw('restaurant', tied_ids);
  ELSIF p_method='sudden_death' THEN
    IF p_restaurant_id IS NULL OR NOT p_restaurant_id=ANY(tied_ids) THEN RAISE EXCEPTION 'WSH_CANDIDATE_NOT_IN_TIE' USING ERRCODE='22023'; END IF;
    selected_id:=p_restaurant_id;
  ELSE
    RAISE EXCEPTION 'WSH_INVALID_RESOLUTION_METHOD' USING ERRCODE='22023';
  END IF;
  PERFORM private.finalize_restaurant(p_room_id,(room_row.restaurant_summary->>'deckId')::uuid,selected_id,p_method);
  RETURN private.room_state(p_room_id,participant_id);
END
$$;

CREATE OR REPLACE FUNCTION public.create_room_authorized(
  p_code text, p_session_token text, p_eating_mode text, p_city text, p_neighborhood text,
  p_language text, p_nickname text, p_latitude double precision DEFAULT NULL, p_longitude double precision DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE room_row public.rooms%ROWTYPE; participant_row public.participants%ROWTYPE; participant_count int;
BEGIN
  IF p_session_token IS NULL OR length(p_session_token)<16 OR p_code !~ '^[A-Z0-9]{4}$' OR p_eating_mode NOT IN ('delivery','dine_in','any')
    OR p_language NOT IN ('ar','en') OR nullif(trim(p_city),'') IS NULL OR nullif(trim(p_nickname),'') IS NULL
  THEN RAISE EXCEPTION 'WSH_INVALID_ROOM_INPUT' USING ERRCODE='22023'; END IF;
  IF (p_latitude IS NULL) <> (p_longitude IS NULL) THEN RAISE EXCEPTION 'WSH_INVALID_LOCATION' USING ERRCODE='22023'; END IF;

  -- Create room directly in 'voting' stage
  INSERT INTO public.rooms(code,status,eating_mode,city,neighborhood,language,current_stage,stage)
  VALUES (p_code,'food_selection',p_eating_mode,trim(p_city),nullif(trim(p_neighborhood),''),p_language,'voting','voting') RETURNING * INTO room_row;

  SELECT count(*)::int INTO participant_count FROM public.participants WHERE room_id=room_row.id;
  INSERT INTO public.participants(room_id,session_token,nickname,player_color,player_shape,is_host,status)
  VALUES (room_row.id,p_session_token,trim(p_nickname),(ARRAY['#55B96A','#F0443E','#FFD75A','#73C8EA','#9B86EC','#F6A6AD','#E5D3B3'])[participant_count%7+1],
    (ARRAY['scallop','squircle','circle','diamond','hexagon'])[participant_count%5+1],true,'active') RETURNING * INTO participant_row;

  -- Recalculate category_summary AFTER host is inserted so eligibleParticipantCount = 1 from inception
  UPDATE public.rooms SET host_participant_id=participant_row.id, category_summary=private.category_state(room_row.id)
  WHERE id=room_row.id RETURNING * INTO room_row;

  IF p_latitude IS NOT NULL THEN INSERT INTO private.room_locations(room_id,latitude,longitude) VALUES(room_row.id,p_latitude,p_longitude); END IF;
  RETURN jsonb_build_object('room',to_jsonb(room_row),'participant',to_jsonb(participant_row));
END
$$;

CREATE OR REPLACE FUNCTION public.start_category_voting(p_room_id uuid,p_session_token text,p_expected_version bigint) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE participant_id uuid; room_row public.rooms%ROWTYPE;
BEGIN
  participant_id:=private.room_participant(p_room_id,p_session_token,true);
  SELECT * INTO room_row FROM public.rooms WHERE id=p_room_id FOR UPDATE;
  IF room_row.stage = 'voting' THEN
    RETURN private.room_state(p_room_id,participant_id);
  END IF;
  IF room_row.version<>p_expected_version THEN RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE='PT409'; END IF;
  IF room_row.stage<>'lobby' THEN RAISE EXCEPTION 'WSH_INVALID_ROOM_STAGE' USING ERRCODE='PT409'; END IF;
  UPDATE public.rooms SET stage='voting',current_stage='voting',status='food_selection',version=version+1,
    category_summary=private.category_state(p_room_id) WHERE id=p_room_id;
  RETURN private.room_state(p_room_id,participant_id);
END
$$;

