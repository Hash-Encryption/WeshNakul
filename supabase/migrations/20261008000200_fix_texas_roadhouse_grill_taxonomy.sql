-- ============================================================================
-- WeshNakul — Fix Texas Roadhouse Grills Taxonomy Mapping
-- File: supabase/migrations/20261008000200_fix_texas_roadhouse_grill_taxonomy.sql
--
-- Context:
-- Texas Roadhouse was seeded with primary_category = 'grills' (plural), but
-- WeshNakul's consensus engine and room winning_category use 'grill' (singular).
--
-- Action:
-- Updates primary_category to 'grill' and ensures 'grill' is included in categories,
-- preserving all existing categories (including 'grills' for backward compatibility).
-- ============================================================================

BEGIN;

UPDATE public.restaurants
SET
  primary_category = 'grill',
  categories = CASE
    WHEN 'grill' = ANY(categories) THEN categories
    ELSE array_append(categories, 'grill')
  END
WHERE id = 'texas_roadhouse';

COMMIT;
