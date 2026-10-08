-- WeshNakul — Curated Grills Catalog Follow-up (Texas Roadhouse, Alsheesh BBQ, Yildizlar retirement, Al Nakheel expansion)
-- Applied to production Supabase: 2026-10-08

BEGIN;

-- ============================================================================
-- SAFETY GUARD: Assert no Place ID collision with an unrelated brand
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.restaurant_branches old
    WHERE old.google_place_id IN ('ChIJb1GhhhDQwxURDjHOC0sO0nM', 'ChIJeUDVLcrbwxUR-gZEIBzRlns')
      AND old.restaurant_id <> 'texas_roadhouse'
  ) THEN
    RAISE EXCEPTION 'Place ID collision: One of the Texas Roadhouse Place IDs is already assigned to a different restaurant in public.restaurant_branches';
  END IF;
END $$;


-- ============================================================================
-- 1. TEXAS ROADHOUSE BRAND & BRANCH INSERT (VERIFIED FACTS ONLY)
-- ============================================================================
-- Note on technical defaults vs verified facts:
-- - avg_prep_minutes (20): Schema default requirement, NOT a measured kitchen prep time.
-- - platforms (all false): Reflects unresearched delivery listings, NOT confirmed absence from Jahez/HungerStation.
-- - time_slots ('{}'): Operating meal windows are unresearched.
-- - closing_time_ar (''): Neutral string, closing hours are unresearched.
-- - spend min/max (NULL): Unresearched spend figures remain strictly NULL.
-- - signature dish / vibes ('' / '{}'): No unresearched menu marketing claims added.
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
  'Approved going-out destination grill per human review handoff. Technical defaults (prep_time=20, platforms all false) used where schema requires non-null but reflect unresearched fields.',
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
  dining_mode = coalesce(public.restaurants.dining_mode, EXCLUDED.dining_mode),
  time_slots = CASE WHEN cardinality(EXCLUDED.time_slots) > 0 THEN EXCLUDED.time_slots ELSE public.restaurants.time_slots END,
  closing_time_ar = CASE WHEN EXCLUDED.closing_time_ar <> '' THEN EXCLUDED.closing_time_ar ELSE public.restaurants.closing_time_ar END,
  is_open_late = coalesce(public.restaurants.is_open_late, EXCLUDED.is_open_late),
  tier = EXCLUDED.tier,
  price_tier = EXCLUDED.price_tier,
  signature_dish_ar = CASE WHEN EXCLUDED.signature_dish_ar <> '' THEN EXCLUDED.signature_dish_ar ELSE public.restaurants.signature_dish_ar END,
  signature_dish_en = CASE WHEN EXCLUDED.signature_dish_en <> '' THEN EXCLUDED.signature_dish_en ELSE public.restaurants.signature_dish_en END,
  vibe_tags_ar = CASE WHEN cardinality(EXCLUDED.vibe_tags_ar) > 0 THEN EXCLUDED.vibe_tags_ar ELSE public.restaurants.vibe_tags_ar END,
  vibe_tags_en = CASE WHEN cardinality(EXCLUDED.vibe_tags_en) > 0 THEN EXCLUDED.vibe_tags_en ELSE public.restaurants.vibe_tags_en END,
  platforms = CASE WHEN public.restaurants.platforms <> '{"hungerstation": false, "jahez": false, "keeta": false}'::jsonb THEN public.restaurants.platforms ELSE EXCLUDED.platforms END,
  primary_category = EXCLUDED.primary_category,
  secondary_categories = EXCLUDED.secondary_categories,
  editorial_role = EXCLUDED.editorial_role,
  context_tags = EXCLUDED.context_tags,
  operating_status = EXCLUDED.operating_status,
  verified_jeddah_branch_count = greatest(coalesce(public.restaurants.verified_jeddah_branch_count, 0), EXCLUDED.verified_jeddah_branch_count),
  price_position = EXCLUDED.price_position,
  estimated_sar_per_person_min = coalesce(public.restaurants.estimated_sar_per_person_min, EXCLUDED.estimated_sar_per_person_min),
  estimated_sar_per_person_max = coalesce(public.restaurants.estimated_sar_per_person_max, EXCLUDED.estimated_sar_per_person_max),
  official_website = coalesce(public.restaurants.official_website, EXCLUDED.official_website),
  research_use = EXCLUDED.research_use,
  last_verified_at = greatest(public.restaurants.last_verified_at, EXCLUDED.last_verified_at);

-- Non-destructive branch upsert preserving existing verified coordinates and ratings.
-- Coordinates are preserved as NULL (uninvented).
-- Branch phone numbers are preserved in geographic_notes.
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
  'https://www.google.com/maps/search/?api=1&query=Texas+Roadhouse+Le+Mall+Jeddah&query_place_id=ChIJb1GhhhDQwxURDjHOC0sO0nM',
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
  'https://www.google.com/maps/search/?api=1&query=Texas+Roadhouse+Red+Sea+Mall+Jeddah&query_place_id=ChIJeUDVLcrbwxUR-gZEIBzRlns',
  NULL,
  NULL,
  'unknown'::public.rating_source,
  NULL,
  'high'::public.intelligence_confidence,
  'Verified branch at Red Sea Mall, King Abdulaziz Road, Ash Shati. Phone: +966122303409. Source: official Texas Roadhouse / Alshaya locator (2026-10-07).',
  '2026-10-07T00:00:00Z'::timestamptz
)
ON CONFLICT (google_place_id) DO UPDATE SET
  branch_name_ar = coalesce(EXCLUDED.branch_name_ar, public.restaurant_branches.branch_name_ar),
  branch_name_en = coalesce(EXCLUDED.branch_name_en, public.restaurant_branches.branch_name_en),
  branch_status = coalesce(EXCLUDED.branch_status, public.restaurant_branches.branch_status),
  branch_status_confidence = CASE
    WHEN EXCLUDED.branch_status_confidence = 'unknown' THEN public.restaurant_branches.branch_status_confidence
    ELSE coalesce(EXCLUDED.branch_status_confidence, public.restaurant_branches.branch_status_confidence)
  END,
  branch_type = CASE
    WHEN EXCLUDED.branch_type = 'unknown' THEN public.restaurant_branches.branch_type
    ELSE coalesce(EXCLUDED.branch_type, public.restaurant_branches.branch_type)
  END,
  district = coalesce(EXCLUDED.district, public.restaurant_branches.district),
  address_en = coalesce(EXCLUDED.address_en, public.restaurant_branches.address_en),
  latitude = coalesce(public.restaurant_branches.latitude, EXCLUDED.latitude),
  longitude = coalesce(public.restaurant_branches.longitude, EXCLUDED.longitude),
  maps_business_name = coalesce(public.restaurant_branches.maps_business_name, EXCLUDED.maps_business_name),
  maps_lookup_status = CASE
    WHEN public.restaurant_branches.maps_lookup_status = 'verified' THEN 'verified'
    ELSE coalesce(EXCLUDED.maps_lookup_status, public.restaurant_branches.maps_lookup_status)
  END,
  google_maps_url = coalesce(public.restaurant_branches.google_maps_url, EXCLUDED.google_maps_url),
  google_rating = coalesce(public.restaurant_branches.google_rating, EXCLUDED.google_rating),
  google_review_count = coalesce(public.restaurant_branches.google_review_count, EXCLUDED.google_review_count),
  rating_source = CASE
    WHEN public.restaurant_branches.rating_source <> 'unknown' THEN public.restaurant_branches.rating_source
    ELSE EXCLUDED.rating_source
  END,
  maps_last_verified_at = coalesce(public.restaurant_branches.maps_last_verified_at, EXCLUDED.maps_last_verified_at),
  branch_identity_confidence = CASE
    WHEN EXCLUDED.branch_identity_confidence = 'unknown' THEN public.restaurant_branches.branch_identity_confidence
    ELSE coalesce(EXCLUDED.branch_identity_confidence, public.restaurant_branches.branch_identity_confidence)
  END,
  geographic_notes = coalesce(public.restaurant_branches.geographic_notes, EXCLUDED.geographic_notes),
  last_verified_at = greatest(public.restaurant_branches.last_verified_at, EXCLUDED.last_verified_at)
WHERE public.restaurant_branches.restaurant_id = EXCLUDED.restaurant_id;


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
