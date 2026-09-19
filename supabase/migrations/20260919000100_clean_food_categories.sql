-- WeshNakul — Forward-Only Migration: Clean Active Food Categories
-- Migration: 20260919000100_clean_food_categories.sql
-- Removes breakfast, healthy, coffee, dessert from active Food mode and Food wildcard derivation.
-- Preserves Breakfast mode provisional taxonomy and healthy preference.
-- Preserves historical completed room outcomes intact.

-- 1. Update authoritative allowed_categories for food and breakfast modes
CREATE OR REPLACE FUNCTION private.allowed_categories(p_mode text) RETURNS text[]
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog AS $$
  SELECT CASE
    WHEN p_mode = 'breakfast' THEN
      ARRAY['street_folk', 'sandwiches', 'fatayer', 'breakfast']::text[]
    WHEN p_mode = 'food' THEN
      ARRAY[
        'burger','shawarma','fried_chicken','broast','rice','grill','pizza','sushi',
        'italian','asian','seafood','indian','fatayer','street_folk','mexican','sandwiches'
      ]::text[]
    ELSE
      ARRAY[]::text[]
  END;
$$;

-- 2. Update category selection validation with 17-item max bound
CREATE OR REPLACE FUNCTION private.valid_category_selection(value text[], p_room_mode text DEFAULT 'food'::text) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public, private AS $$
DECLARE
  allowed text[];
  wildcard text;
BEGIN
  IF value IS NULL OR coalesce(cardinality(value), 0) < 1 OR cardinality(value) > 17 THEN
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

-- 3. Only normalize active un-finalized voting choices in active rooms (preserve completed rooms)
UPDATE public.food_choices fc
SET is_submitted = false
FROM public.rooms r
WHERE fc.room_id = r.id
  AND r.stage = 'voting'
  AND fc.is_submitted
  AND NOT (
    coalesce(private.valid_category_selection(fc.selected_categories, coalesce(r.room_mode, 'food')), false)
  );

-- 4. Permissions
REVOKE ALL ON FUNCTION private.allowed_categories(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.valid_category_selection(text[], text) FROM PUBLIC, anon, authenticated;
