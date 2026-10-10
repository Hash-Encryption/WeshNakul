-- Migration: 20261010000400_expose_roulette_and_minigame_suggestions.sql
-- Extend toggle_room_suggestion target validation to support Food Roulette and Mini-Game requests
-- from regular players, and clear them when restaurant tie resolves.

CREATE OR REPLACE FUNCTION public.toggle_room_suggestion(
  p_room_id uuid,
  p_session_token text,
  p_target text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  part_id uuid;
  is_host_participant boolean;
  existing_id uuid;
BEGIN
  part_id := private.room_participant(p_room_id, p_session_token, false);

  -- Host does not suggest: host triggers authoritative actions
  SELECT is_host INTO is_host_participant FROM public.participants WHERE id = part_id;
  IF is_host_participant THEN
    RAISE EXCEPTION 'WSH_HOST_CANNOT_SUGGEST' USING ERRCODE = '22023';
  END IF;

  -- Validate target (permits modes, preferences, actions, roulette, and all mini-games)
  IF p_target IS NULL OR length(p_target) < 1 OR length(p_target) > 64
     OR p_target !~ '^(mode:(food|breakfast|cafes)|preference:(healthy|nearby)|action:(spin_again|show_another_7|choose_another_category|try_another_restaurant|roulette)|game:(shuffle_cards|sudden_death|food_brawl|food_race|pick_a_box|emoji_clash|sizzling_skillet))$'
  THEN
    RAISE EXCEPTION 'WSH_INVALID_SUGGESTION_TARGET' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO existing_id FROM private.room_suggestions
  WHERE room_id = p_room_id AND participant_id = part_id AND target = p_target;

  IF existing_id IS NOT NULL THEN
    -- Toggle off (withdrawn)
    DELETE FROM private.room_suggestions WHERE id = existing_id;
  ELSE
    -- Toggle on (active suggestion)
    INSERT INTO private.room_suggestions(room_id, participant_id, target)
    VALUES (p_room_id, part_id, p_target)
    ON CONFLICT (room_id, participant_id, target) DO NOTHING;
  END IF;

  RETURN private.room_state(p_room_id, part_id);
END;
$$;

-- Update resolve_restaurant_tie to clean up roulette and mini-game suggestions on tie resolution
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

  -- Clear relevant suggestions
  DELETE FROM private.room_suggestions
  WHERE room_id = p_room_id AND (target IN ('action:spin_again', 'action:try_another_restaurant', 'action:roulette') OR target LIKE 'game:%');

  PERFORM private.finalize_restaurant(p_room_id,(room_row.restaurant_summary->>'deckId')::uuid,selected_id,p_method);
  RETURN private.room_state(p_room_id,participant_id);
END
$$;

REVOKE ALL ON FUNCTION public.toggle_room_suggestion(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_room_suggestion(uuid, text, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.resolve_restaurant_tie(uuid, text, bigint, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_restaurant_tie(uuid, text, bigint, text, text) TO anon, authenticated;
