-- WeshNakul — Forward-Only Migration: Merge Broast into Fried Chicken Taxonomy
-- Migration: 20261007000100_merge_broast_into_fried_chicken.sql
-- 1. Merges user-facing 'broast' category into single 'fried_chicken' category.
-- 2. Preserves internal traditional broast & musahab subtype intelligence.
-- 3. Updates authoritative consensus functions (allowed_categories, valid_category_selection, resolve_category_tie).
-- 4. Reclassifies all 19 verified chicken brands to primary_category = 'fried_chicken'.
-- 5. Canonicalizes Al Tazaj to Saudi/Rice taxonomy (categories = ['rice', 'grill']), isolating it from fried chicken.
-- 6. Canonicalizes existing database state (food_choices, rooms winning/tied categories, category_summary, tally recomputation).

BEGIN;

-- ============================================================================
-- 1. AUTHORITATIVE FOOD TAXONOMY (15 categories)
-- ============================================================================

CREATE OR REPLACE FUNCTION private.allowed_categories(p_mode text) RETURNS text[]
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog AS $$
  SELECT CASE
    WHEN p_mode = 'breakfast' THEN
      ARRAY['street_folk', 'sandwiches', 'fatayer', 'breakfast']::text[]
    WHEN p_mode = 'food' THEN
      ARRAY[
        'burger','shawarma','fried_chicken','rice','grill','pizza','sushi',
        'italian','asian','seafood','indian','fatayer','street_folk','mexican','sandwiches'
      ]::text[]
    ELSE
      ARRAY[]::text[]
  END;
$$;

-- ============================================================================
-- 2. CATEGORY SELECTION VALIDATION (15 real categories maximum)
-- ============================================================================

CREATE OR REPLACE FUNCTION private.valid_category_selection(value text[], p_room_mode text DEFAULT 'food'::text) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public, private AS $$
DECLARE
  allowed text[];
  wildcard text;
BEGIN
  IF value IS NULL OR coalesce(cardinality(value), 0) < 1 OR cardinality(value) > 15 THEN
    RETURN false;
  END IF;

  -- Ensure uniqueness
  IF cardinality(value) <> (SELECT count(DISTINCT item) FROM unnest(value) item) THEN
    RETURN false;
  END IF;

  IF p_room_mode = 'food' THEN
    allowed := private.allowed_categories('food');
    wildcard := 'flexible';
  ELSIF p_room_mode = 'breakfast' THEN
    allowed := private.allowed_categories('breakfast');
    wildcard := 'any_breakfast';
  ELSE
    RETURN false;
  END IF;

  -- Wildcard exclusivity: if wildcard is present, cardinality must be 1
  IF wildcard = ANY(value) AND cardinality(value) > 1 THEN
    RETURN false;
  END IF;

  -- All items must either be the mode wildcard or belong to allowed categories for this mode
  RETURN NOT EXISTS (
    SELECT 1 FROM unnest(value) item
    WHERE item IS NULL OR (item <> wildcard AND NOT (item = ANY(allowed)))
  );
END;
$$;

REVOKE ALL ON FUNCTION private.allowed_categories(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.valid_category_selection(text[], text) FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- 3. RESOLVE CATEGORY TIE (Removes 'broast' from wildcard staples array)
-- ============================================================================

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
    -- In Breakfast mode: preserve authentic breakfast categories
    IF coalesce(room_row.room_mode, 'food') = 'breakfast' THEN
      v_draw_pool := room_row.tied_categories;
    -- In Food mode with All-Wildcard: select from top crowd-pleasing staples
    ELSIF coalesce((room_row.category_summary->>'allWildcard')::boolean, false) THEN
      SELECT array_agg(cat ORDER BY array_position(ARRAY['burger', 'shawarma', 'fried_chicken', 'pizza', 'rice', 'seafood', 'asian']::text[], cat))
      INTO v_draw_pool
      FROM unnest(ARRAY['burger', 'shawarma', 'fried_chicken', 'pizza', 'rice', 'seafood', 'asian']::text[]) cat
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

-- ============================================================================
-- 4. DATABASE RESTAURANT TAXONOMY MERGE
-- ============================================================================

-- 4a. Reclassify the 6 traditional broast brands to fried_chicken while preserving subtype intelligence
UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken', 'burger', 'seafood'],
  secondary_categories = ARRAY['traditional_broast', 'fried_chicken', 'musahab'],
  subcategories = ARRAY['traditional_broast', 'fried_chicken', 'musahab']
WHERE id = 'albaik';

UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['traditional_broast'],
  subcategories = ARRAY['traditional_broast']
WHERE id IN ('rami_broast', 'chicken_mubeen', 'al_najah_broast', 'broast_hanoo');

UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['traditional_broast', 'musahab'],
  subcategories = ARRAY['traditional_broast', 'musahab']
WHERE id = 'ktaykit';

-- 4b. Canonicalize Al Tazaj to Saudi/Rice & Grill taxonomy (do not put into fried chicken)
UPDATE public.restaurants
SET
  primary_category = 'rice',
  categories = ARRAY['rice', 'grill'],
  secondary_categories = ARRAY['rice', 'grill'],
  subcategories = ARRAY['rice', 'grill']
WHERE id = 'al_tazaj';

-- 4c. Canonicalize any remaining restaurant records with exact 'broast' token
UPDATE public.restaurants
SET primary_category = 'fried_chicken'
WHERE primary_category = 'broast';

UPDATE public.restaurants
SET categories = array_remove(categories, 'broast')
WHERE 'broast' = ANY(categories);

UPDATE public.restaurants
SET secondary_categories = array_remove(secondary_categories, 'broast')
WHERE 'broast' = ANY(secondary_categories);

UPDATE public.restaurants
SET subcategories = array_remove(subcategories, 'broast')
WHERE 'broast' = ANY(subcategories);

-- ============================================================================
-- 5. PERSISTED STATE CANONICALIZATION
-- ============================================================================

-- 5a. food_choices: replace 'broast' with 'fried_chicken', deduplicate preserving order
UPDATE public.food_choices
SET selected_categories = CASE
  WHEN 'fried_chicken' = ANY(selected_categories) THEN
    array_remove(selected_categories, 'broast')
  ELSE
    (
      SELECT array_agg(CASE WHEN c = 'broast' THEN 'fried_chicken' ELSE c END ORDER BY ord)
      FROM unnest(selected_categories) WITH ORDINALITY AS t(c, ord)
    )
END
WHERE 'broast' = ANY(selected_categories);

-- 5b. rooms: winning_category
UPDATE public.rooms
SET winning_category = 'fried_chicken'
WHERE winning_category = 'broast';

-- 5c. rooms: tied_categories
UPDATE public.rooms
SET tied_categories = CASE
  WHEN 'fried_chicken' = ANY(tied_categories) THEN
    array_remove(tied_categories, 'broast')
  ELSE
    (
      SELECT array_agg(CASE WHEN c = 'broast' THEN 'fried_chicken' ELSE c END ORDER BY ord)
      FROM unnest(tied_categories) WITH ORDINALITY AS t(c, ord)
    )
END
WHERE 'broast' = ANY(tied_categories);

-- 5d. rooms: category_summary winner and tiedCategories
UPDATE public.rooms
SET category_summary = jsonb_set(
  category_summary,
  '{winner}',
  '"fried_chicken"'::jsonb
)
WHERE category_summary->>'winner' = 'broast';

UPDATE public.rooms
SET category_summary = jsonb_set(
  category_summary,
  '{tiedCategories}',
  to_jsonb(tied_categories)
)
WHERE category_summary ? 'tiedCategories'
  AND category_summary->'tiedCategories' @> '["broast"]'::jsonb;

-- 5e. rooms: category_summary tally recomputation & clamping
-- For rooms with food_choices rows: recompute tally authoritatively from canonicalized choices (prevents double-counting)
UPDATE public.rooms r
SET category_summary = jsonb_set(
  r.category_summary,
  '{tally}',
  private.category_tally(r.id)
)
WHERE r.category_summary ? 'tally'
  AND EXISTS (SELECT 1 FROM public.food_choices fc WHERE fc.room_id = r.id);

-- For archived rooms without food_choices rows: clamp fried_chicken tally to eligibleParticipantCount and remove 'broast' key
UPDATE public.rooms
SET category_summary = jsonb_set(
  category_summary - 'tally',
  '{tally}',
  (
    SELECT jsonb_object_agg(
      key,
      CASE
        WHEN key = 'fried_chicken' THEN
          least(
            coalesce((category_summary->>'eligibleParticipantCount')::int, 2147483647),
            coalesce((category_summary->'tally'->>'fried_chicken')::int, 0) + coalesce((category_summary->'tally'->>'broast')::int, 0)
          )
        ELSE
          val::int
      END
    )
    FROM jsonb_each_text(category_summary->'tally') AS t(key, val)
    WHERE key <> 'broast'
  )
)
WHERE category_summary ? 'tally'
  AND category_summary->'tally' ? 'broast'
  AND NOT EXISTS (SELECT 1 FROM public.food_choices fc WHERE fc.room_id = rooms.id);

-- 5f. Normalize active un-finalized voting choices in active rooms
UPDATE public.food_choices fc
SET is_submitted = false
FROM public.rooms r
WHERE fc.room_id = r.id
  AND r.stage = 'voting'
  AND fc.is_submitted
  AND NOT (
    coalesce(private.valid_category_selection(fc.selected_categories, coalesce(r.room_mode, 'food')), false)
  );

COMMIT;
