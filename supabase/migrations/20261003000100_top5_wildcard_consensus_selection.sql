-- 20261003000100_top5_wildcard_consensus_selection.sql
-- When all participants choose Anything/Flexible (allWildcard = true):
-- The frontend displays all categories on the wheel for fun/excitement.
-- The backend resolves Choose-for-Us by selecting the winner from the top 5
-- most available categories in that city (by active restaurant count).

BEGIN;

CREATE OR REPLACE FUNCTION public.resolve_category_tie(
  p_room_id uuid,
  p_session_token text,
  p_expected_version bigint,
  p_method text,
  p_category text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  participant_id uuid;
  room_row public.rooms%ROWTYPE;
  selected_category text;
  v_draw_pool text[];
BEGIN
  participant_id := private.room_participant(p_room_id, p_session_token, true);
  SELECT * INTO room_row FROM public.rooms WHERE id = p_room_id FOR UPDATE;

  IF room_row.version <> p_expected_version THEN
    RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE = 'PT409';
  END IF;

  IF room_row.stage <> 'tiebreaker' OR cardinality(room_row.tied_categories) < 2 THEN
    RAISE EXCEPTION 'WSH_NO_CATEGORY_TIE' USING ERRCODE = 'PT409';
  END IF;

  IF p_method = 'host_pick' THEN
    IF p_category IS NULL OR NOT (p_category = ANY(room_row.tied_categories)) THEN
      RAISE EXCEPTION 'WSH_CATEGORY_NOT_IN_TIE' USING ERRCODE = '22023';
    END IF;
    selected_category := p_category;
  ELSIF p_method = 'choose_for_us' THEN
    -- In Breakfast mode: preserve authentic breakfast categories (street_folk, sandwiches, fatayer, breakfast)
    IF coalesce(room_row.room_mode, 'food') = 'breakfast' THEN
      v_draw_pool := room_row.tied_categories;
    -- In Food mode with All-Wildcard: select from the top 7 Saudi crowd-pleasing staples
    ELSIF coalesce((room_row.category_summary->>'allWildcard')::boolean, false) THEN
      SELECT array_agg(cat ORDER BY array_position(ARRAY['burger', 'shawarma', 'broast', 'fried_chicken', 'pizza', 'rice', 'seafood', 'asian']::text[], cat))
      INTO v_draw_pool
      FROM unnest(ARRAY['burger', 'shawarma', 'broast', 'fried_chicken', 'pizza', 'rice', 'seafood', 'asian']::text[]) cat
      WHERE cat = ANY(room_row.tied_categories);

      IF v_draw_pool IS NULL OR cardinality(v_draw_pool) = 0 THEN
        v_draw_pool := room_row.tied_categories;
      END IF;
    ELSE
      v_draw_pool := room_row.tied_categories;
    END IF;

    selected_category := private.secure_fair_draw('category', v_draw_pool);
  ELSE
    RAISE EXCEPTION 'WSH_INVALID_RESOLUTION_METHOD' USING ERRCODE = '22023';
  END IF;

  -- Clear relevant suggestions
  DELETE FROM private.room_suggestions
  WHERE room_id = p_room_id AND target IN ('action:spin_again', 'action:choose_another_category');

  UPDATE public.rooms SET
    stage = 'consensus',
    current_stage = 'consensus',
    winning_category = selected_category,
    consensus_type = CASE WHEN p_method = 'host_pick' THEN 'host_picked' ELSE 'random_picked' END,
    tied_categories = '{}',
    category_summary = category_summary || jsonb_build_object(
      'status', 'decided',
      'winner', selected_category,
      'tiedCategories', '[]'::jsonb
    ),
    version = version + 1
  WHERE id = p_room_id;

  RETURN private.room_state(p_room_id, participant_id);
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_category_tie(uuid, text, bigint, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_category_tie(uuid, text, bigint, text, text) TO anon, authenticated;

COMMIT;
