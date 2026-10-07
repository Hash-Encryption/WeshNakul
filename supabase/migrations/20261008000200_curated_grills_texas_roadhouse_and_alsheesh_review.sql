-- ============================================================================
-- WeshNakul Migration: Curated Grills Catalog Follow-up
-- File: supabase/migrations/20261008000200_curated_grills_texas_roadhouse_and_alsheesh_review.sql
--
-- STATUS: FOR REVIEW ONLY — DO NOT EXECUTE AUTOMATICALLY AGAINST PRODUCTION.
-- Requires human approval and explicit execution command.
--
-- Scope:
-- 1. Insert Texas Roadhouse ('texas_roadhouse') and its 2 verified Jeddah branches
--    (Le Mall in Al Andalus, Red Sea Mall in Ash Shati) with verified Place IDs
--    and coordinates null (uninvented).
-- 2. Retire Yildizlar Restaurant ('yildizlar_restaurant') non-destructively
--    from recommendation eligibility while preserving historical records.
-- 3. Correct Istanbul Grill ('istanbul_grill_restaurant') canonical identity
--    to Alsheesh BBQ ('الشيش للمشويات') matching Place ID ChIJpeROlxLawxURhEcynrnaKxY.
-- 4. Enable multi-category eligibility for Al Nakheel ('al_nakheel_restaurant')
--    for breakfast and falafel/street_folk while preserving primary Grills identity.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. INSERT TEXAS ROADHOUSE ('texas_roadhouse')
-- ============================================================================
-- Replaces Yildizlar as the premium steak & grill going-out anchor.
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
  ARRAY['grills', 'american', 'steakhouse'],
  false,
  ARRAY['al_andalus', 'al_shati'],
  'both',
  ARRAY['lunch', 'dinner', 'late_night'],
  'يقفل 1:00 ص',
  true,
  false,
  25,
  'staple',
  '$$$',
  'ستيك وضلوع مشوية مع خبز طازج وزبدة القرفة',
  'Hand-Cut Steaks, Fall-Off-The-Bone Ribs & Made-From-Scratch Sides',
  ARRAY['ستيك هاوس أمريكي', 'أجواء عائلية راقية', 'جلسات واسعة', 'خبز طازج وزبدة القرفة'],
  ARRAY['American Steakhouse', 'Lively Family Dining', 'Spacious Seating', 'Fresh Baked Bread & Cinnamon Butter'],
  NULL,
  '["jahez", "hungerstation"]'::jsonb,
  jsonb_build_object('googleMaps', 'https://www.google.com/maps/search/?api=1&query=Texas+Roadhouse+Jeddah'),
  'jeddah',
  'grills',
  ARRAY['american', 'steakhouse', 'going_out'],
  ARRAY['ribs', 'steak', 'fresh_bread'],
  'high'::public.intelligence_confidence,
  'Verified operational presence in Jeddah via official locator and Google Place IDs',
  'staple'::public.editorial_role,
  ARRAY['destination_dining', 'family_favorite'],
  ARRAY['dine_in_strong', 'going_out'],
  'Established global brand with active flagship mall dining branches in Jeddah',
  'restaurant',
  'open',
  'high'::public.intelligence_confidence,
  2,
  'verified_complete',
  NULL,
  false,
  'both',
  'premium'::public.price_position,
  80,
  180,
  'https://www.texasroadhouse.com/',
  'none'::public.trend_status,
  'high'::public.intelligence_confidence,
  'high'::public.intelligence_confidence,
  'production_ready'::public.research_use,
  '2026-10-07T00:00:00Z'::timestamptz,
  '2026-10-07T00:00:00Z'::timestamptz,
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

-- Insert verified branches for Texas Roadhouse:
-- Coordinates are preserved as NULL (not invented) adhering strictly to schema rules.
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
  last_verified_at,
  production_branch_status
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
  4.3,
  1500,
  'google_maps_direct',
  '2026-10-07T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  'Official Alshaya / Texas Roadhouse Jeddah Le Mall branch on Prince Mohammed Bin Abdulaziz St in Al Andalus.',
  '2026-10-07T00:00:00Z'::timestamptz,
  'production_ready'
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
  4.4,
  2100,
  'google_maps_direct',
  '2026-10-07T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  'Official Alshaya / Texas Roadhouse Jeddah Red Sea Mall branch on King Abdulaziz Road in Ash Shati.',
  '2026-10-07T00:00:00Z'::timestamptz,
  'production_ready'
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
  rating_source = EXCLUDED.rating_source,
  maps_last_verified_at = EXCLUDED.maps_last_verified_at,
  branch_identity_confidence = EXCLUDED.branch_identity_confidence,
  geographic_notes = EXCLUDED.geographic_notes,
  last_verified_at = EXCLUDED.last_verified_at,
  production_branch_status = EXCLUDED.production_branch_status;


-- ============================================================================
-- 2. NON-DESTRUCTIVE RETIREMENT OF YILDIZLAR RESTAURANT ('yildizlar_restaurant')
-- ============================================================================
-- Preserve historical row, relations, and branches, but disqualify from active grills decks.
UPDATE public.restaurants
SET
  research_use = 'manual_review_only'::public.research_use,
  manual_review_required = true,
  manual_review_reasons = array_append(
    coalesce(manual_review_reasons, '{}'::text[]),
    'Retired from curated Grills recommendation lineup in favor of Texas Roadhouse'
  ),
  primary_category = 'retired',
  categories = array_remove(array_remove(categories, 'grills'), 'grill'),
  secondary_categories = array_remove(array_remove(secondary_categories, 'grills'), 'grill')
WHERE id = 'yildizlar_restaurant';

UPDATE public.restaurant_branches
SET
  production_branch_status = 'manual_review_required'
WHERE restaurant_id = 'yildizlar_restaurant';


-- ============================================================================
-- 3. CANONICAL IDENTITY CORRECTION: ISTANBUL GRILL -> ALSHEESH BBQ
-- ============================================================================
-- Verified Google Place ID ChIJpeROlxLawxURhEcynrnaKxY on Hira St / Al Naeem corresponds
-- directly to Alsheesh BBQ ('الشيش للمشويات'). Update canonical metadata while preserving
-- historical ID and branch relationship.
UPDATE public.restaurants
SET
  name_en = 'Alsheesh BBQ',
  name_ar = 'الشيش للمشويات',
  vibe_tags_ar = ARRAY['مشاوي على الفحم', 'سفري واقتصادي', 'شارع حراء', 'سهرات'],
  vibe_tags_en = ARRAY['Charcoal BBQ', 'Budget & Quick Bite', 'Hira Street', 'Late Night Takeaway'],
  signature_dish_ar = 'مشاوي مشكلة 250 جرام',
  signature_dish_en = 'Mixed Grill - 250 G',
  manual_review_reasons = array_append(
    coalesce(manual_review_reasons, '{}'::text[]),
    'Canonical identity corrected from Istanbul Grill to Alsheesh BBQ matching Place ID ChIJpeROlxLawxURhEcynrnaKxY'
  )
WHERE id = 'istanbul_grill_restaurant';

UPDATE public.restaurant_branches
SET
  branch_name_en = 'Al Naeem / Hira Street',
  branch_name_ar = 'النعيم / شارع حراء',
  maps_business_name = 'Alsheesh BBQ'
WHERE restaurant_id = 'istanbul_grill_restaurant';


-- ============================================================================
-- 4. AL NAKHEEL MULTI-CATEGORY ELIGIBILITY (GRILLS + BREAKFAST + FALAFEL)
-- ============================================================================
-- Maintain primary_category as 'grills' while extending categories array so Al Nakheel
-- participates in Breakfast and Falafel/Street-Folk recommendations.
UPDATE public.restaurants
SET
  categories = ARRAY['grills', 'breakfast', 'falafel', 'street_folk', 'middle_eastern'],
  secondary_categories = ARRAY['hijazi_breakfast', 'traditional_grill', 'family_dining', 'going_out'],
  time_slots = ARRAY['breakfast', 'lunch', 'dinner', 'late_night'],
  serves_breakfast_menu = true
WHERE id = 'al_nakheel_restaurant';

COMMIT;
