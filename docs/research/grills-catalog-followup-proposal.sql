-- ============================================================================
-- WeshNakul — Grills Catalog Follow-up Proposal (RESEARCH ONLY)
-- File: docs/research/grills-catalog-followup-proposal.sql
--
-- STATUS: AUDITED PROPOSAL — DO NOT EXECUTE AUTOMATICALLY AGAINST PRODUCTION.
-- Strict WeshNakul Standard: VERIFIED REALITY > COMPLETENESS.
-- Unknown/null is ALWAYS preferred over unverified or assumed facts.
--
-- Audit Summary:
-- 1. Texas Roadhouse ('texas_roadhouse'):
--    - Verified facts from official Alshaya/Texas Roadhouse locator & Google Places:
--      * Brand name: Texas Roadhouse / تكساس رودهاوس
--      * Approved editorial role: staple, going_out, grills, american, steakhouse, $$$ / premium
--      * Le Mall Branch: Al Andalus, Place ID ChIJb1GhhhDQwxURDjHOC0sO0nM, Phone +966122617026
--      * Red Sea Mall Branch: Ash Shati (al_shati), Place ID ChIJeUDVLcrbwxUR-gZEIBzRlns, Phone +966122303409
--      * Official website: https://www.texasroadhouse.com/
--    - ALL unsourced fields set to NULL / neutral schema defaults:
--      * Google ratings & review counts -> NULL (rating_source = 'unknown')
--      * Coordinates -> NULL (strict refusal to invent coordinates)
--      * Prep time -> 20 (schema default)
--      * Closing time -> '' (empty neutral string, no 1:00 AM assumption)
--      * is_open_late -> false (neutral)
--      * Spend per person -> NULL (no 80-180 assumption)
--      * Delivery platforms -> false (no Jahez/HungerStation assumption)
--      * Menu claims & signature dish -> '' (neutral, no unverified claims)
--      * Menu verification date -> NULL (no fake menu sync)
--      * Branch phones -> preserved in geographic_notes & provenance
--
-- 2. Yildizlar ('yildizlar_restaurant') Retirement:
--    - Non-destructive disqualification without inventing 'retired' category.
--    - Sets research_use = 'manual_review_only' (disqualifies from create_restaurant_deck).
--    - Removes 'grills' and 'grill' from categories and secondary_categories.
--    - Idempotent manual_review_reasons array check.
--    - Preserves historical row, branch rows, Google Place ID, and analytics.
--
-- 3. Alsheesh BBQ ('istanbul_grill_restaurant') Identity Correction:
--    - Preserves historical ID istanbul_grill_restaurant for DB integrity.
--    - Corrects canonical names to 'Alsheesh BBQ' / 'الشيش للمشويات'.
--    - Idempotent manual_review_reasons array check.
--
-- 4. Al Nakheel ('al_nakheel_restaurant') Multi-Category Eligibility:
--    - ADDITIVE update only: preserves existing categories ('grills', 'middle_eastern').
--    - Adds 'breakfast', 'street_folk', 'falafel' via idempotent set union.
--    - Preserves primary_category = 'grills'.
--    - Sets serves_breakfast_menu = true.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TEXAS ROADHOUSE BRAND & BRANCH INSERT (VERIFIED FACTS ONLY)
-- ============================================================================
INSERT INTO public.restaurants (
  id,
  name_ar,
  name_en,
  categories,
  is_city_wide,
  branches,
  dining_mode,
  time_slots,
  closing_time_ar,
  is_open_late,
  is_24_hours,
  avg_prep_minutes,
  tier,
  price_tier,
  signature_dish_ar,
  signature_dish_en,
  vibe_tags_ar,
  vibe_tags_en,
  rating,
  platforms,
  links,
  city,
  primary_category,
  secondary_categories,
  subcategories,
  category_fit_confidence,
  category_fit_evidence,
  editorial_role,
  reputation_tags,
  context_tags,
  context_tag_evidence,
  business_type,
  operating_status,
  brand_status_confidence,
  verified_jeddah_branch_count,
  branch_list_completeness,
  meal_period_strength,
  serves_breakfast_menu,
  dining_mode_summary,
  price_position,
  estimated_sar_per_person_min,
  estimated_sar_per_person_max,
  official_website,
  trend_status,
  trend_confidence,
  overall_confidence,
  research_use,
  last_verified_at,
  menu_last_verified_at,
  manual_review_required,
  manual_review_reasons,
  intelligence_origin
) VALUES (
  'texas_roadhouse',
  'تكساس رودهاوس',
  'Texas Roadhouse',
  ARRAY['grills'],
  false,
  ARRAY['al_andalus', 'al_shati'],
  'dine_in_only',
  '{}'::text[],
  '',
  false,
  false,
  20,
  'staple',
  '$$$',
  '',
  '',
  '{}'::text[],
  '{}'::text[],
  NULL,
  '{"hungerstation": false, "jahez": false, "keeta": false}'::jsonb,
  jsonb_build_object('googleMaps', 'https://www.google.com/maps/search/?api=1&query=Texas+Roadhouse+Jeddah'),
  'jeddah',
  'grills',
  ARRAY['american', 'steakhouse'],
  '{}'::text[],
  'high'::public.intelligence_confidence,
  'Approved replacement for Yildizlar in curated Grills lineup per human review',
  'staple'::public.editorial_role,
  '{}'::text[],
  ARRAY['going_out'],
  'Approved going-out destination grill per human review handoff',
  'restaurant',
  'open',
  'high'::public.intelligence_confidence,
  2,
  'partial',
  NULL,
  false,
  'dine_in_only',
  'premium'::public.price_position,
  NULL,
  NULL,
  'https://www.texasroadhouse.com/',
  'none'::public.trend_status,
  'unknown'::public.intelligence_confidence,
  'medium'::public.intelligence_confidence,
  'production_ready'::public.research_use,
  '2026-10-07T00:00:00Z'::timestamptz,
  NULL,
  false,
  '{}'::text[],
  'research'
) ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  categories = EXCLUDED.categories,
  is_city_wide = EXCLUDED.is_city_wide,
  branches = EXCLUDED.branches,
  dining_mode = EXCLUDED.dining_mode,
  time_slots = EXCLUDED.time_slots,
  closing_time_ar = EXCLUDED.closing_time_ar,
  is_open_late = EXCLUDED.is_open_late,
  is_24_hours = EXCLUDED.is_24_hours,
  avg_prep_minutes = EXCLUDED.avg_prep_minutes,
  tier = EXCLUDED.tier,
  price_tier = EXCLUDED.price_tier,
  signature_dish_ar = EXCLUDED.signature_dish_ar,
  signature_dish_en = EXCLUDED.signature_dish_en,
  vibe_tags_ar = EXCLUDED.vibe_tags_ar,
  vibe_tags_en = EXCLUDED.vibe_tags_en,
  platforms = EXCLUDED.platforms,
  links = EXCLUDED.links,
  city = EXCLUDED.city,
  primary_category = EXCLUDED.primary_category,
  secondary_categories = EXCLUDED.secondary_categories,
  subcategories = EXCLUDED.subcategories,
  category_fit_confidence = EXCLUDED.category_fit_confidence,
  category_fit_evidence = EXCLUDED.category_fit_evidence,
  editorial_role = EXCLUDED.editorial_role,
  reputation_tags = EXCLUDED.reputation_tags,
  context_tags = EXCLUDED.context_tags,
  operating_status = EXCLUDED.operating_status,
  brand_status_confidence = EXCLUDED.brand_status_confidence,
  verified_jeddah_branch_count = EXCLUDED.verified_jeddah_branch_count,
  branch_list_completeness = EXCLUDED.branch_list_completeness,
  dining_mode_summary = EXCLUDED.dining_mode_summary,
  price_position = EXCLUDED.price_position,
  estimated_sar_per_person_min = EXCLUDED.estimated_sar_per_person_min,
  estimated_sar_per_person_max = EXCLUDED.estimated_sar_per_person_max,
  official_website = EXCLUDED.official_website,
  trend_status = EXCLUDED.trend_status,
  trend_confidence = EXCLUDED.trend_confidence,
  overall_confidence = EXCLUDED.overall_confidence,
  research_use = EXCLUDED.research_use,
  last_verified_at = EXCLUDED.last_verified_at,
  manual_review_required = EXCLUDED.manual_review_required,
  manual_review_reasons = EXCLUDED.manual_review_reasons;

-- Verified physical branches with uninvented coordinates (NULL)
-- and verified phone numbers preserved in geographic_notes.
INSERT INTO public.restaurant_branches (
  restaurant_id,
  branch_name_ar,
  branch_name_en,
  branch_status,
  branch_status_confidence,
  branch_type,
  district,
  address_en,
  latitude,
  longitude,
  maps_business_name,
  google_place_id,
  maps_lookup_status,
  google_maps_url,
  google_rating,
  google_review_count,
  rating_source,
  maps_last_verified_at,
  branch_identity_confidence,
  geographic_notes,
  last_verified_at
) VALUES
(
  'texas_roadhouse',
  'تكساس رودهاوس - لو مول',
  'Texas Roadhouse - Le Mall',
  'open',
  'high'::public.intelligence_confidence,
  'full_dine_in'::public.branch_type,
  'al_andalus',
  'Le Mall, Prince Mohammed Bin Abdulaziz St, Al Andalus, Jeddah 23326, Saudi Arabia',
  NULL,
  NULL,
  'Texas Roadhouse',
  'ChIJb1GhhhDQwxURDjHOC0sO0nM',
  'verified',
  'https://www.google.com/maps/search/?api=1&query_place_id=ChIJb1GhhhDQwxURDjHOC0sO0nM',
  NULL,
  NULL,
  'unknown'::public.rating_source,
  NULL,
  'high'::public.intelligence_confidence,
  'Verified branch at Le Mall, Prince Mohammed Bin Abdulaziz St, Al Andalus. Phone: +966122617026. Source: official Texas Roadhouse / Alshaya locator (2026-10-07).',
  '2026-10-07T00:00:00Z'::timestamptz
),
(
  'texas_roadhouse',
  'تكساس رودهاوس - رد سي مول',
  'Texas Roadhouse - Red Sea Mall',
  'open',
  'high'::public.intelligence_confidence,
  'full_dine_in'::public.branch_type,
  'al_shati',
  'Red Sea Mall, King Abdulaziz Road, Ash Shati, Jeddah 23612, Saudi Arabia',
  NULL,
  NULL,
  'Texas Roadhouse',
  'ChIJeUDVLcrbwxUR-gZEIBzRlns',
  'verified',
  'https://www.google.com/maps/search/?api=1&query_place_id=ChIJeUDVLcrbwxUR-gZEIBzRlns',
  NULL,
  NULL,
  'unknown'::public.rating_source,
  NULL,
  'high'::public.intelligence_confidence,
  'Verified branch at Red Sea Mall, King Abdulaziz Road, Ash Shati. Phone: +966122303409. Source: official Texas Roadhouse / Alshaya locator (2026-10-07).',
  '2026-10-07T00:00:00Z'::timestamptz
)
ON CONFLICT (google_place_id) DO UPDATE SET
  restaurant_id = EXCLUDED.restaurant_id,
  branch_name_ar = EXCLUDED.branch_name_ar,
  branch_name_en = EXCLUDED.branch_name_en,
  branch_status = EXCLUDED.branch_status,
  branch_status_confidence = EXCLUDED.branch_status_confidence,
  branch_type = EXCLUDED.branch_type,
  district = EXCLUDED.district,
  address_en = EXCLUDED.address_en,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  maps_business_name = EXCLUDED.maps_business_name,
  maps_lookup_status = EXCLUDED.maps_lookup_status,
  google_maps_url = EXCLUDED.google_maps_url,
  google_rating = EXCLUDED.google_rating,
  google_review_count = EXCLUDED.google_review_count,
  rating_source = EXCLUDED.rating_source,
  maps_last_verified_at = EXCLUDED.maps_last_verified_at,
  branch_identity_confidence = EXCLUDED.branch_identity_confidence,
  geographic_notes = EXCLUDED.geographic_notes,
  last_verified_at = EXCLUDED.last_verified_at;


-- ============================================================================
-- 2. NON-DESTRUCTIVE RETIREMENT OF YILDIZLAR RESTAURANT ('yildizlar_restaurant')
-- ============================================================================
-- Disqualifies from recommendation decks (research_use IN ('production_ready', 'usable_with_caution'))
-- while preserving historical records, branches, and taxonomy integrity.
UPDATE public.restaurants
SET
  research_use = 'manual_review_only'::public.research_use,
  manual_review_required = true,
  manual_review_reasons = CASE
    WHEN 'Retired from curated Grills recommendation lineup in favor of Texas Roadhouse' = ANY(coalesce(manual_review_reasons, '{}'::text[]))
    THEN manual_review_reasons
    ELSE array_append(
      coalesce(manual_review_reasons, '{}'::text[]),
      'Retired from curated Grills recommendation lineup in favor of Texas Roadhouse'
    )
  END,
  categories = array_remove(array_remove(categories, 'grills'), 'grill'),
  secondary_categories = array_remove(array_remove(secondary_categories, 'grills'), 'grill')
WHERE id = 'yildizlar_restaurant';


-- ============================================================================
-- 3. CANONICAL IDENTITY CORRECTION: ISTANBUL GRILL -> ALSHEESH BBQ
-- ============================================================================
-- Preserves historical ID 'istanbul_grill_restaurant' and verified branch data while
-- correcting canonical brand display to Alsheesh BBQ (الشيش للمشويات).
UPDATE public.restaurants
SET
  name_en = 'Alsheesh BBQ',
  name_ar = 'الشيش للمشويات',
  manual_review_reasons = CASE
    WHEN 'Canonical identity corrected from Istanbul Grill to Alsheesh BBQ matching Place ID ChIJpeROlxLawxURhEcynrnaKxY' = ANY(coalesce(manual_review_reasons, '{}'::text[]))
    THEN manual_review_reasons
    ELSE array_append(
      coalesce(manual_review_reasons, '{}'::text[]),
      'Canonical identity corrected from Istanbul Grill to Alsheesh BBQ matching Place ID ChIJpeROlxLawxURhEcynrnaKxY'
    )
  END
WHERE id = 'istanbul_grill_restaurant';

UPDATE public.restaurant_branches
SET
  branch_name_en = 'Al Naeem / Hira Street',
  branch_name_ar = 'النعيم / شارع حراء',
  maps_business_name = 'Alsheesh BBQ'
WHERE restaurant_id = 'istanbul_grill_restaurant';


-- ============================================================================
-- 4. AL NAKHEEL MULTI-CATEGORY ELIGIBILITY (ADDITIVE SET UNION)
-- ============================================================================
-- Preserves existing categories ('grills', 'middle_eastern'), secondary_categories,
-- and time_slots, while additively enabling Breakfast and Falafel/Street-Folk.
UPDATE public.restaurants
SET
  categories = ARRAY(
    SELECT elem FROM unnest(categories) elem
    UNION
    SELECT elem FROM unnest(ARRAY['breakfast', 'street_folk', 'falafel']) elem
  ),
  secondary_categories = ARRAY(
    SELECT elem FROM unnest(secondary_categories) elem
    UNION
    SELECT elem FROM unnest(ARRAY['hijazi_breakfast', 'traditional_grill']) elem
  ),
  time_slots = ARRAY(
    SELECT elem FROM unnest(time_slots) elem
    UNION
    SELECT elem FROM unnest(ARRAY['breakfast', 'lunch']) elem
  ),
  serves_breakfast_menu = true
WHERE id = 'al_nakheel_restaurant';

COMMIT;
