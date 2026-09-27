import fs from 'node:fs';

const sql = `-- WeshNakul — Burger Category Expansion & Core Guarantee Deck Algorithm
-- Migration: 20260928000100_jeddah_burger_expansion_and_deck_algorithm.sql
-- 1. Adds core_status column on public.restaurants ('core' | 'expansion')
-- 2. Sets core_status = 'core' for the 10 approved foundation Burger brands
-- 3. Inserts 11 new expansion Burger brands (core_status = 'expansion') with 14 verified physical branches
-- 4. Updates private.create_restaurant_deck with the Burger deck algorithm:
--    * Verified branch geography resolution & use-case distance limits
--    * Guaranteed >= 1 random eligible core brand (if eligible core exists)
--    * Random fill for remaining cards from full eligible pool (allows 1, 2, 3+ core)
--    * Repeat protection (prefers unseen candidates across draws)
--    * Soft diversity constraints (limits excessive clustering of identical styles/prices)
--    * Shuffles final 7-card deck so the guaranteed core position is private
--    * Preserves existing non-Burger category recommendation pipelines
BEGIN;

-- 1. Add core_status column on restaurants
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS core_status text CHECK (core_status IN ('core', 'expansion') OR core_status IS NULL);

-- 2. Update the 10 original Burger foundation brands as CORE
UPDATE public.restaurants
SET core_status = 'core'
WHERE id IN (
  'section_b', 'california_burger', 'century_burger', 'chefs_burger', 'sign_burger',
  'nora_burger', 'wbj', 'lou_burger', 'pplr', 'smash_me'
);

-- 3. Upsert the 11 new expansion Burger brands
INSERT INTO public.restaurants (
  id, name_ar, name_en, primary_category, secondary_categories, subcategories,
  category_fit_confidence, category_fit_evidence, editorial_role, reputation_tags,
  context_tags, context_tag_evidence, business_type, operating_status,
  brand_status_confidence, established_year, origin_city, origin_country,
  verified_jeddah_branch_count, branch_list_completeness, meal_period_strength,
  serves_breakfast_menu, dining_mode_summary, menu_breadth, price_position,
  estimated_sar_per_person_min, estimated_sar_per_person_max, official_website,
  trend_status, trend_confidence, overall_confidence, research_use,
  last_verified_at, menu_last_verified_at, manual_review_required, manual_review_reasons,
  intelligence_origin, core_status, city, is_city_wide, dining_mode, time_slots,
  closing_time_ar, is_open_late, is_24_hours, avg_prep_minutes, tier, price_tier,
  signature_dish_ar, signature_dish_en, vibe_tags_ar, vibe_tags_en, rating, platforms, links
) VALUES
(
  'black_tap', 'بلاك تاب', 'Black Tap', 'burger', ARRAY['american']::text[], ARRAY['craft_burger']::text[],
  'high', 'Official Jeddah venue and burger-led menu', 'popular', ARRAY['mainstream']::text[],
  ARRAY['dine_in_strong', 'casual_hangout', 'premium']::text[], 'Dine-in burger bar format', 'restaurant', 'open',
  'high', 2015, 'New York', 'United States', 1, 'complete', '{"lunch":"strong","dinner":"strong","late_night":"strong"}'::jsonb,
  false, 'both', 'focused', 'premium', 65, 140, 'https://blacktap.com/location/jeddah/',
  'none', 'high', 'high', 'production_ready',
  '2026-09-27T00:00:00Z', '2026-09-27T00:00:00Z', false, '{}'::text[],
  'research', 'expansion', 'Jeddah', true, 'both', ARRAY['lunch','dinner','late_night']::text[],
  'يقفل 1:00 ص', true, false, 25, 'trend', '$$$',
  'أول أمريكان برجر', 'All-American Burger', ARRAY['داين إن راقي', 'برجر كرافت']::text[], ARRAY['Premium Dine-in', 'Craft Burger']::text[], 4.6,
  '{"hungerstation":false,"jahez":false,"keeta":false}'::jsonb, '{}'::jsonb
),
(
  'fatt', 'فات', 'FATT', 'burger', '{}'::text[], ARRAY['beef_burger']::text[],
  'high', 'Stars Avenue burger concept and delivery footprint', 'discovery', ARRAY['rising']::text[],
  ARRAY['casual_hangout', 'delivery_strong', 'late_night']::text[], 'Stars Avenue storefront with delivery', 'restaurant', 'open',
  'high', 2022, 'Jeddah', 'Saudi Arabia', 1, 'complete', '{"lunch":"strong","dinner":"strong","late_night":"strong"}'::jsonb,
  false, 'both', 'focused', 'standard', 35, 75, 'https://linktr.ee/fatt',
  'rising', 'high', 'high', 'production_ready',
  '2026-09-27T00:00:00Z', '2026-09-27T00:00:00Z', false, '{}'::text[],
  'research', 'expansion', 'Jeddah', true, 'both', ARRAY['lunch','dinner','late_night']::text[],
  'يقفل 4:00 ص', true, false, 20, 'trend', '$$',
  'برجر فات دبل', 'FATT Double Burger', ARRAY['سريع', 'متأخر']::text[], ARRAY['Quick Bite', 'Late Night']::text[], 4.3,
  '{"hungerstation":true,"jahez":true,"keeta":true}'::jsonb, '{}'::jsonb
),
(
  'burger_boutique', 'برجر بوتيك', 'Burger Boutique', 'burger', ARRAY['american']::text[], ARRAY['gourmet_burger']::text[],
  'high', 'Established upscale Ar Rawdah burger destination', 'popular', ARRAY['mainstream']::text[],
  ARRAY['dine_in_strong', 'casual_hangout', 'late_night']::text[], 'Destination gourmet dining', 'restaurant', 'open',
  'high', 2014, 'Kuwait', 'Kuwait', 1, 'complete', '{"lunch":"moderate","dinner":"strong","late_night":"strong"}'::jsonb,
  false, 'both', 'broad', 'premium', 70, 160, NULL,
  'none', 'high', 'high', 'production_ready',
  '2026-09-27T00:00:00Z', '2026-09-27T00:00:00Z', false, '{}'::text[],
  'research', 'expansion', 'Jeddah', true, 'both', ARRAY['lunch','dinner','late_night']::text[],
  'يقفل 2:00 ص', true, false, 25, 'staple', '$$$',
  'بي برجر كلاسيك', 'BB Classic Burger', ARRAY['جورميه', 'أجواء عصرية']::text[], ARRAY['Gourmet', 'Modern Vibe']::text[], 4.6,
  '{"hungerstation":false,"jahez":false,"keeta":false}'::jsonb, '{}'::jsonb
),
(
  'place', 'بليس', 'Place', 'burger', ARRAY['smash_burger']::text[], ARRAY['smash_burger']::text[],
  'high', 'Recent Rawdah concept with strong smash burger reception', 'discovery', ARRAY['rising']::text[],
  ARRAY['quick_bite', 'casual_hangout', 'late_night', 'smash']::text[], 'Smash burger spot on Prince Sultan', 'restaurant', 'open',
  'high', 2023, 'Jeddah', 'Saudi Arabia', 1, 'complete', '{"lunch":"strong","dinner":"strong","late_night":"strong"}'::jsonb,
  false, 'both', 'focused', 'standard', 35, 70, 'https://www.arabnews.com/food-health/where-we-are-going-today-place-burger-restaurant-in-jeddah-2639585',
  'rising', 'high', 'high', 'production_ready',
  '2026-09-27T00:00:00Z', '2026-09-27T00:00:00Z', false, '{}'::text[],
  'research', 'expansion', 'Jeddah', true, 'both', ARRAY['lunch','dinner','late_night']::text[],
  'يقفل 3:00 ص', true, false, 15, 'trend', '$$',
  'سيجنتشر برجر', 'Signature Burger', ARRAY['سماش برجر', 'صوص مميز']::text[], ARRAY['Smash Burger', 'Signature Sauce']::text[], 4.4,
  '{"hungerstation":true,"jahez":true,"keeta":true}'::jsonb, '{}'::jsonb
),
(
  'score', 'سكور', 'Score', 'burger', '{}'::text[], ARRAY['beef_burger']::text[],
  'high', 'Well-established Al Zahra burger hotspot with high reviews', 'popular', ARRAY['local_favorite']::text[],
  ARRAY['casual_hangout', 'late_night']::text[], 'Late night casual hangout in Al Zahra', 'restaurant', 'open',
  'high', 2020, 'Jeddah', 'Saudi Arabia', 1, 'complete', '{"lunch":"strong","dinner":"strong","late_night":"strong"}'::jsonb,
  false, 'both', 'focused', 'standard', 35, 75, 'https://score.sa/',
  'none', 'high', 'high', 'production_ready',
  '2026-09-27T00:00:00Z', '2026-09-27T00:00:00Z', false, '{}'::text[],
  'research', 'expansion', 'Jeddah', true, 'both', ARRAY['lunch','dinner','late_night']::text[],
  'يقفل 3:00 ص', true, false, 20, 'staple', '$$',
  'سكور برجر لحم', 'Score Beef Burger', ARRAY['محلي مفضل', 'جلسات شبابية']::text[], ARRAY['Local Favorite', 'Youth Hangout']::text[], 4.3,
  '{"hungerstation":false,"jahez":false,"keeta":false}'::jsonb, '{}'::jsonb
),
(
  'smpl_brgr', 'سمبل برجر', 'SMPL BRGR', 'burger', ARRAY['smash_burger']::text[], ARRAY['smash_burger']::text[],
  'high', 'Late-night affordable smash burger in Al Zahra', 'popular', ARRAY['local_favorite']::text[],
  ARRAY['quick_bite', 'late_night', 'budget', 'smash']::text[], 'Popular budget-friendly late-night smash', 'restaurant', 'open',
  'high', 2021, 'Jeddah', 'Saudi Arabia', 1, 'complete', '{"lunch":"strong","dinner":"strong","late_night":"strong"}'::jsonb,
  false, 'both', 'focused', 'budget', 20, 45, NULL,
  'none', 'high', 'high', 'production_ready',
  '2026-09-27T00:00:00Z', '2026-09-27T00:00:00Z', false, '{}'::text[],
  'research', 'expansion', 'Jeddah', true, 'both', ARRAY['lunch','dinner','late_night']::text[],
  'يقفل 5:30 ص', true, false, 15, 'staple', '$',
  'سمبل برجر دبل', 'Smpl Brgr Double', ARRAY['سماش خفيف', 'قيمة ممتازة']::text[], ARRAY['Light Smash', 'Great Value']::text[], 4.3,
  '{"hungerstation":true,"jahez":false,"keeta":false}'::jsonb, '{}'::jsonb
),
(
  'bunco_burger', 'بنكو برجر', 'Bunco Burger', 'burger', '{}'::text[], ARRAY['beef_burger']::text[],
  'high', 'North Jeddah neighborhood burger favorite in Al Murjan', 'discovery', ARRAY['rising']::text[],
  ARRAY['quick_bite', 'late_night', 'budget']::text[], 'North Jeddah local destination', 'restaurant', 'open',
  'high', 2022, 'Jeddah', 'Saudi Arabia', 1, 'complete', '{"lunch":"strong","dinner":"strong","late_night":"strong"}'::jsonb,
  false, 'both', 'focused', 'budget', 22, 50, NULL,
  'rising', 'high', 'high', 'production_ready',
  '2026-09-27T00:00:00Z', '2026-09-27T00:00:00Z', false, '{}'::text[],
  'research', 'expansion', 'Jeddah', true, 'both', ARRAY['lunch','dinner','late_night']::text[],
  'يقفل 4:30 ص', true, false, 15, 'trend', '$',
  'بنكو برجر كلاسيك', 'Bunco Burger', ARRAY['برجر طازج', 'شمال جدة']::text[], ARRAY['Fresh Burger', 'North Jeddah']::text[], 4.4,
  '{"hungerstation":false,"jahez":false,"keeta":false}'::jsonb, '{}'::jsonb
),
(
  'mmmm_burger', 'مممم برجر', 'Mmmm Burger', 'burger', '{}'::text[], ARRAY['smash_burger']::text[],
  'high', 'Dual-location Jeddah value smash burger brand', 'popular', ARRAY['local_favorite']::text[],
  ARRAY['quick_bite', 'late_night', 'budget']::text[], 'Multi-district value favorite', 'restaurant', 'open',
  'high', 2020, 'Jeddah', 'Saudi Arabia', 2, 'complete', '{"lunch":"strong","dinner":"strong","late_night":"strong"}'::jsonb,
  false, 'both', 'focused', 'budget', 18, 42, 'https://linktr.ee/mmmm.burger',
  'none', 'high', 'high', 'production_ready',
  '2026-09-27T00:00:00Z', '2026-09-27T00:00:00Z', false, '{}'::text[],
  'research', 'expansion', 'Jeddah', true, 'both', ARRAY['lunch','dinner','late_night']::text[],
  'يقفل 4:00 ص', true, false, 15, 'staple', '$',
  'مممم تشيز برجر', 'Mmmm Cheeseburger', ARRAY['سعر مناسب', 'سريع']::text[], ARRAY['Value Price', 'Quick Bite']::text[], 4.1,
  '{"hungerstation":false,"jahez":false,"keeta":false}'::jsonb, '{}'::jsonb
),
(
  'the_plan', 'ذا بلان', 'The Plan', 'burger', ARRAY['tex_mex']::text[], ARRAY['beef_burger','tex_mex']::text[],
  'high', 'Tri-location burger & casual dining concept in Jeddah', 'discovery', ARRAY['rising']::text[],
  ARRAY['casual_hangout', 'late_night', 'dine_in_strong']::text[], 'Casual hangout across south, north, and central Jeddah', 'restaurant', 'open',
  'high', 2021, 'Jeddah', 'Saudi Arabia', 3, 'complete', '{"lunch":"strong","dinner":"strong","late_night":"strong"}'::jsonb,
  false, 'both', 'broad', 'standard', 35, 75, 'https://linktr.ee/theplan.res',
  'rising', 'high', 'high', 'production_ready',
  '2026-09-27T00:00:00Z', '2026-09-27T00:00:00Z', false, '{}'::text[],
  'research', 'expansion', 'Jeddah', true, 'both', ARRAY['lunch','dinner','late_night']::text[],
  'يقفل 4:00 ص', true, false, 20, 'trend', '$$',
  'ذا بلان برجر', 'The Plan Burger', ARRAY['تكس مكس', 'جلسات واسعة']::text[], ARRAY['Tex-Mex', 'Spacious Seating']::text[], 3.9,
  '{"hungerstation":true,"jahez":false,"keeta":false}'::jsonb, '{}'::jsonb
),
(
  'im_hungry', 'آيم هنقري', 'I''M Hungry', 'burger', ARRAY['fast_food']::text[], ARRAY['fast_food_burger']::text[],
  'high', 'High-volume value burger footprint across Jeddah', 'popular', ARRAY['mainstream']::text[],
  ARRAY['quick_bite', 'delivery_strong', 'late_night', 'budget']::text[], 'Widespread value chain with 24/7 delivery', 'restaurant', 'open',
  'high', 2016, 'Jeddah', 'Saudi Arabia', 1, 'partial', '{"lunch":"strong","dinner":"strong","late_night":"strong"}'::jsonb,
  false, 'both', 'broad', 'budget', 15, 38, 'https://imhungry.co/',
  'none', 'high', 'high', 'usable_with_caution',
  '2026-09-27T00:00:00Z', '2026-09-27T00:00:00Z', true, ARRAY['multi_branch_reconciliation_ongoing']::text[],
  'research', 'expansion', 'Jeddah', true, 'both', ARRAY['lunch','dinner','late_night']::text[],
  'مفتوح 24 ساعة', true, true, 15, 'staple', '$',
  'دبل بيف برجر', 'Double Beef Burger', ARRAY['سعر اقتصادي', 'خدمة سريعة']::text[], ARRAY['Economic Price', 'Fast Service']::text[], 3.7,
  '{"hungerstation":false,"jahez":false,"keeta":false}'::jsonb, '{}'::jsonb
),
(
  'brgr1983', 'برجر 1983', 'BRGR1983', 'burger', '{}'::text[], ARRAY['beef_burger']::text[],
  'high', 'Established Al Zahra burger staple with solid reputation', 'popular', ARRAY['local_favorite']::text[],
  ARRAY['quick_bite', 'casual_hangout', 'late_night']::text[], 'Popular neighborhood joint in Al Zahra', 'restaurant', 'open',
  'high', 2019, 'Jeddah', 'Saudi Arabia', 1, 'complete', '{"lunch":"strong","dinner":"strong","late_night":"strong"}'::jsonb,
  false, 'both', 'focused', 'standard', 30, 65, NULL,
  'none', 'high', 'high', 'production_ready',
  '2026-09-27T00:00:00Z', '2026-09-27T00:00:00Z', false, '{}'::text[],
  'research', 'expansion', 'Jeddah', true, 'both', ARRAY['lunch','dinner','late_night']::text[],
  'يقفل 2:00 ص', true, false, 20, 'staple', '$$',
  'برجر 1983 كلاسيك', '1983 Burger', ARRAY['مربى بيكون', 'نكهة خاصة']::text[], ARRAY['Bacon Jam', 'Special Flavor']::text[], 4.5,
  '{"hungerstation":false,"jahez":false,"keeta":false}'::jsonb, '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  primary_category = EXCLUDED.primary_category,
  secondary_categories = EXCLUDED.secondary_categories,
  core_status = EXCLUDED.core_status,
  editorial_role = EXCLUDED.editorial_role,
  reputation_tags = EXCLUDED.reputation_tags,
  context_tags = EXCLUDED.context_tags,
  price_position = EXCLUDED.price_position,
  dining_mode_summary = EXCLUDED.dining_mode_summary,
  research_use = EXCLUDED.research_use,
  operating_status = EXCLUDED.operating_status,
  rating = EXCLUDED.rating;

-- 4. Upsert the 14 verified physical branches for expansion brands
INSERT INTO public.restaurant_branches (
  restaurant_id, branch_name_ar, branch_name_en, branch_status, branch_status_confidence,
  branch_type, district, address_en, latitude, longitude, maps_business_name,
  google_place_id, maps_lookup_status, google_maps_url, google_rating, google_review_count,
  rating_source, maps_last_verified_at, branch_identity_confidence, geographic_notes, last_verified_at
) VALUES
(
  'black_tap', 'لا باز بلازا', 'La Paz Plaza', 'open', 'high',
  'full_dine_in', 'al_salamah', 'J43V+C68, As Salamah, Jeddah 23525, Saudi Arabia',
  21.6035426, 39.1429601, 'Black Tap LA PAZ', 'ChIJ-Y1Y6azbwxURKyaLx0i3UDw',
  'verified', 'https://maps.google.com/?cid=4346175163625842219', 4.6, 2803,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in canonical district al_salamah', '2026-09-27T00:00:00Z'
),
(
  'fatt', 'ستارز افينيو', 'Stars Avenue', 'open', 'high',
  'full_dine_in', 'al_zahra', 'Stars Avenue, Al Zahra, Jeddah 23613, Saudi Arabia',
  21.5726588, 39.1273775, 'Fatt فات', 'ChIJhcYBkVzZwxURPJQrFs3CSBI',
  'verified', 'https://maps.google.com/?cid=1317517077101909052', 4.3, 2037,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in canonical district al_zahra', '2026-09-27T00:00:00Z'
),
(
  'burger_boutique', 'الروضة', 'Ar Rawdah', 'open', 'high',
  'full_dine_in', 'al_rawdah', '8683 Abdulmaqsud Khoja, Ar Rawdah, Jeddah 23435, Saudi Arabia',
  21.5728803, 39.1483138, 'برجر بوتيك', 'ChIJ2RB91HzbwxUR544gkYm5qzU',
  'verified', 'https://maps.google.com/?cid=3867388705524190951', 4.6, 6718,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in canonical district al_rawdah', '2026-09-27T00:00:00Z'
),
(
  'place', 'الروضة', 'Ar Rawdah', 'open', 'high',
  'full_dine_in', 'al_rawdah', 'Prince Sultan Rd, Ar Rawdah, Jeddah 23435, Saudi Arabia',
  21.5711746, 39.1435949, 'Place', 'ChIJK-w_13vbwxURHZz0hy7bQIA',
  'verified', 'https://maps.google.com/?cid=9241627428260191261', 4.4, 3633,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in canonical district al_rawdah', '2026-09-27T00:00:00Z'
),
(
  'score', 'الزهراء', 'Al Zahra', 'open', 'high',
  'full_dine_in', 'al_zahra', 'Ahmad Al Attas, Al Zahra, Jeddah 23425, Saudi Arabia',
  21.5895143, 39.1315648, 'Score | سكور', 'ChIJP4mbowXbwxURs4_RppyWNn8',
  'verified', 'https://maps.google.com/?cid=9166679691117039539', 4.3, 2174,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in canonical district al_zahra', '2026-09-27T00:00:00Z'
),
(
  'smpl_brgr', 'الزهراء', 'Al Zahra', 'open', 'high',
  'full_dine_in', 'al_zahra', 'Ahmad Al Attas, Al Zahra, Jeddah 23521, Saudi Arabia',
  21.5938657, 39.1309733, 'SMPL BRGR', 'ChIJP_rAQIjbwxURMKiPHdD7MWg',
  'verified', 'https://maps.google.com/?cid=7508058925071050800', 4.3, 3355,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in canonical district al_zahra', '2026-09-27T00:00:00Z'
),
(
  'bunco_burger', 'المرجان', 'Al Murjan', 'open', 'high',
  'full_dine_in', 'al_murjan', 'Al Murjan, Jeddah 23711, Saudi Arabia',
  21.6911520, 39.1060228, 'Bunco Burger | بنكو برجر', 'ChIJAy4Lm2HZwxURAZMq3o8KluE',
  'verified', 'https://maps.google.com/?cid=16255191518064317185', 4.4, 1000,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in canonical district al_murjan', '2026-09-27T00:00:00Z'
),
(
  'mmmm_burger', 'الفيصلية', 'Al Faisaliyyah', 'open', 'high',
  'full_dine_in', 'al_faisaliyyah', 'Al Maahad Al Senai, Al Faisaliyyah, Jeddah 23442, Saudi Arabia',
  21.5729941, 39.1705678, 'Mmmm Faisaliyyah مممم الفيصلية', 'ChIJP9DteJTRwxURk2pT6oEjhTA',
  'verified', 'https://maps.google.com/?cid=3496239726612146835', 4.1, 1580,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in canonical district al_faisaliyyah', '2026-09-27T00:00:00Z'
),
(
  'mmmm_burger', 'التحلية / الروضة', 'Tahliyah / Ar Rawdah', 'open', 'high',
  'full_dine_in', 'al_rawdah', 'Prince Mohammed Bin Abdulaziz St, Ar Rawdah, Jeddah 23431, Saudi Arabia',
  21.5503501, 39.1485637, 'Mmmm Tahliyah مممم التحلية', 'ChIJVSHKhP7bwxUR_SfN9tyAEzY',
  'verified', 'https://maps.google.com/?cid=3896599789127411709', 4.1, 388,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in canonical district al_rawdah', '2026-09-27T00:00:00Z'
),
(
  'the_plan', 'السليمانية', 'Al Sulaymaniyah', 'open', 'high',
  'full_dine_in', 'al_faiha', 'Abu Thar Al-Ghifari, Al Sulaymaniyah, Jeddah 22253, Saudi Arabia',
  21.5035797, 39.2397163, 'The Plan', 'ChIJ4TtkJWzNwxURc-65l-5yxhQ',
  'verified', 'https://maps.google.com/?cid=1497010295220596339', 3.7, 1978,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located adjacent to canonical district al_faiha', '2026-09-27T00:00:00Z'
),
(
  'the_plan', 'أبحر / الزمرد', 'Obhur / Al Zummrad', 'open', 'high',
  'full_dine_in', 'abhur_al_shamaliyah', 'Prince Abdullah Al Faisal St, Al Zummrad, Jeddah 23815, Saudi Arabia',
  21.7534831, 39.1186079, 'The Plan', 'ChIJL6axylRjwRURNjLfpeOaH_c',
  'verified', 'https://maps.google.com/?cid=17807121754177352246', 3.8, 1477,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in North Obhur corridor', '2026-09-27T00:00:00Z'
),
(
  'the_plan', 'المحمدية', 'Al Mohammadiyyah', 'open', 'high',
  'full_dine_in', 'al_mohammadiyyah', 'Ibrahim Al-Anqari, Al Mohammadiyyah, Jeddah 23617, Saudi Arabia',
  21.6441772, 39.1239922, 'The Plan', 'ChIJNa6xZbjZwxURva53Yk2Fj04',
  'verified', 'https://maps.google.com/?cid=10996843460492144317', 4.2, 641,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in canonical district al_mohammadiyyah', '2026-09-27T00:00:00Z'
),
(
  'im_hungry', 'النسيم', 'Al Naseem', 'open', 'high',
  'full_dine_in', 'al_naseem', '6186 King Abdullah Rd, Al Naseem, Jeddah 23233, Saudi Arabia',
  21.5168453, 39.2316484, 'I''M Hungry', 'ChIJ7xK_w7rNwxURtLmeo2mELOs',
  'verified', 'https://maps.google.com/?cid=16972740263677573556', 3.7, 1974,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in canonical district al_naseem', '2026-09-27T00:00:00Z'
),
(
  'brgr1983', 'الزهراء', 'Al Zahra', 'open', 'high',
  'full_dine_in', 'al_zahra', 'H4WJ+X68, Al Zahra, Jeddah 23521, Saudi Arabia',
  21.5878470, 39.1311029, 'BRGR1983', 'ChIJqaKSOAnbwxUR7ewaUIJJS1g',
  'verified', 'https://maps.google.com/?cid=6384218882650016493', 4.5, 1815,
  'google_maps_direct', '2026-09-27T00:00:00Z', 'high', 'Located in canonical district al_zahra', '2026-09-27T00:00:00Z'
)
ON CONFLICT (google_place_id) DO UPDATE SET
  restaurant_id = EXCLUDED.restaurant_id,
  branch_name_ar = EXCLUDED.branch_name_ar,
  branch_name_en = EXCLUDED.branch_name_en,
  district = EXCLUDED.district,
  address_en = EXCLUDED.address_en,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  maps_business_name = EXCLUDED.maps_business_name,
  google_maps_url = EXCLUDED.google_maps_url,
  google_rating = EXCLUDED.google_rating,
  google_review_count = EXCLUDED.google_review_count,
  branch_identity_confidence = EXCLUDED.branch_identity_confidence,
  geographic_notes = EXCLUDED.geographic_notes,
  last_verified_at = EXCLUDED.last_verified_at;

-- 5. Upsert signature dishes (best sellers)
INSERT INTO public.restaurant_best_sellers (
  restaurant_id, name_ar, name_en, is_signature, sort_order, confidence, evidence_summary, last_verified_at
) VALUES
  ('black_tap', 'أول أمريكان برجر', 'All-American Burger', true, 1, 'high', 'Certified Black Tap signature item', '2026-09-27T00:00:00Z'),
  ('black_tap', 'ترافل برجر', 'Truffle Burger', false, 2, 'high', 'Popular gourmet burger', '2026-09-27T00:00:00Z'),
  ('fatt', 'برجر فات دبل', 'FATT Double Burger', true, 1, 'high', 'Certified FATT signature item', '2026-09-27T00:00:00Z'),
  ('burger_boutique', 'بي برجر كلاسيك', 'BB Classic Burger', true, 1, 'high', 'Certified Burger Boutique signature item', '2026-09-27T00:00:00Z'),
  ('place', 'سيجنتشر برجر', 'Signature Burger', true, 1, 'high', 'Certified Place signature item', '2026-09-27T00:00:00Z'),
  ('place', 'ترافل برجر', 'Truffle Burger', false, 2, 'high', 'Specialty burger item', '2026-09-27T00:00:00Z'),
  ('place', 'بيكون برجر', 'Bacon Burger', false, 3, 'high', 'Popular specialty smash', '2026-09-27T00:00:00Z'),
  ('score', 'سكور برجر لحم', 'Score Beef Burger', true, 1, 'high', 'Certified Score signature item', '2026-09-27T00:00:00Z'),
  ('smpl_brgr', 'سمبل برجر دبل', 'Smpl Brgr Double', true, 1, 'high', 'Certified SMPL BRGR signature item', '2026-09-27T00:00:00Z'),
  ('bunco_burger', 'بنكو برجر', 'Bunco Burger', true, 1, 'high', 'Certified Bunco signature item', '2026-09-27T00:00:00Z'),
  ('bunco_burger', 'بنكو بيكون', 'Bunco Bacon', false, 2, 'high', 'Popular specialty item', '2026-09-27T00:00:00Z'),
  ('mmmm_burger', 'مممم تشيز برجر', 'Mmmm Cheeseburger', true, 1, 'high', 'Certified Mmmm signature item', '2026-09-27T00:00:00Z'),
  ('mmmm_burger', 'بيج مممم', 'Big Mmmm', false, 2, 'high', 'Popular specialty item', '2026-09-27T00:00:00Z'),
  ('the_plan', 'ذا بلان برجر', 'The Plan Burger', true, 1, 'high', 'Certified The Plan signature item', '2026-09-27T00:00:00Z'),
  ('im_hungry', 'دبل بيف برجر', 'Double Beef Burger', true, 1, 'high', 'Certified I''M Hungry signature item', '2026-09-27T00:00:00Z'),
  ('brgr1983', '1983 برجر', '1983 Burger', true, 1, 'high', 'Certified 1983 signature item', '2026-09-27T00:00:00Z'),
  ('brgr1983', 'بيكون جام برجر', 'Bacon Jam Burger', false, 2, 'high', 'Signature bacon jam specialty', '2026-09-27T00:00:00Z')
ON CONFLICT DO NOTHING;

-- 6. Update private.deck_payload to pass coreStatus
CREATE OR REPLACE FUNCTION private.deck_payload(requested_deck_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
  SELECT jsonb_build_object(
    'deckId', d.id,
    'generation', d.generation,
    'restaurants', coalesce(jsonb_agg(jsonb_build_object(
      'id', r.id,
      'nameAr', r.name_ar,
      'nameEn', r.name_en,
      'categories', r.categories,
      'isCityWide', r.is_city_wide,
      'branches', CASE WHEN b.district IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(b.district) END,
      'diningMode', r.dining_mode,
      'timeSlots', r.time_slots,
      'closingTimeAr', r.closing_time_ar,
      'isOpenLate', r.is_open_late,
      'is24Hours', r.is_24_hours,
      'avgPrepMinutes', r.avg_prep_minutes,
      'tier', r.tier,
      'priceTier', r.price_tier,
      'signatureDishAr', coalesce(bs.name_ar, r.signature_dish_ar),
      'signatureDishEn', coalesce(bs.name_en, r.signature_dish_en),
      'vibeTagsAr', r.vibe_tags_ar,
      'vibeTagsEn', r.vibe_tags_en,
      'rating', coalesce(b.google_rating, r.rating),
      'platforms', r.platforms,
      'links', r.links || CASE WHEN b.google_maps_url IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('googleMaps', b.google_maps_url) END,
      'selectedBranch', CASE WHEN b.id IS NULL THEN NULL ELSE jsonb_build_object(
        'id', b.id,
        'nameAr', b.branch_name_ar,
        'nameEn', b.branch_name_en,
        'district', b.district,
        'addressAr', b.address_ar,
        'addressEn', b.address_en,
        'googleMapsUrl', b.google_maps_url,
        'distanceKm', i.distance_km,
        'rating', b.google_rating,
        'reviewCount', b.google_review_count
      ) END,
      'coreStatus', r.core_status
    ) ORDER BY i.position) FILTER (WHERE i.position IS NOT NULL), '[]'::jsonb)
  )
  FROM private.room_restaurant_decks d
  LEFT JOIN private.room_restaurant_deck_items i ON i.deck_id = d.id
  LEFT JOIN public.restaurants r ON r.id = i.restaurant_id
  LEFT JOIN public.restaurant_branches b ON b.id = i.branch_id
  LEFT JOIN LATERAL (
    SELECT s.name_ar, s.name_en
    FROM public.restaurant_best_sellers s
    WHERE s.restaurant_id = r.id AND s.is_signature
    ORDER BY s.sort_order, s.id
    LIMIT 1
  ) bs ON true
  WHERE d.id = requested_deck_id
  GROUP BY d.id, d.generation
$$;

-- 7. Implement the updated private.create_restaurant_deck algorithm
CREATE OR REPLACE FUNCTION private.create_restaurant_deck(
  p_room_id uuid,
  p_participant_id uuid,
  p_session_token text,
  p_after_deck_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  room_row public.rooms%ROWTYPE;
  latest_deck private.room_restaurant_decks%ROWTYPE;
  new_deck_id uuid;
  next_generation integer;
  draw_salt text;
  draw_seed text;
  prev_deck_restaurants text[];
  all_prev_deck_restaurants text[];
  core_guaranteed_id text := NULL;
  eligible_core_count integer := 0;
  total_eligible_count integer := 0;
  has_nearby_pref boolean;
  has_healthy_pref boolean;
BEGIN
  -- Authorization check
  IF NOT EXISTS (
    SELECT 1 FROM public.participants p
    WHERE p.id = p_participant_id AND p.room_id = p_room_id AND p.session_token = p_session_token
  ) THEN
    RAISE EXCEPTION 'Room membership required' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));
  SELECT * INTO room_row FROM public.rooms WHERE id = p_room_id FOR UPDATE;
  IF NOT FOUND OR room_row.stage <> 'swiping' OR room_row.winning_category IS NULL OR room_row.swiping_started_at IS NULL THEN
    RAISE EXCEPTION 'Room is not ready for restaurant swiping' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO latest_deck
  FROM private.room_restaurant_decks
  WHERE room_id = p_room_id AND round_started_at = room_row.swiping_started_at
  ORDER BY generation DESC LIMIT 1;

  IF p_after_deck_id IS NULL AND FOUND THEN
    RETURN private.deck_payload(latest_deck.id);
  END IF;

  IF p_after_deck_id IS NOT NULL THEN
    IF latest_deck.id IS NULL OR NOT EXISTS (
      SELECT 1 FROM private.room_restaurant_decks d
      WHERE d.id = p_after_deck_id AND d.room_id = p_room_id
        AND d.round_started_at = room_row.swiping_started_at
    ) THEN
      RAISE EXCEPTION 'Invalid prior deck' USING ERRCODE = '22023';
    END IF;
    IF latest_deck.id <> p_after_deck_id THEN
      RETURN private.deck_payload(latest_deck.id);
    END IF;
    next_generation := latest_deck.generation + 1;
  ELSE
    next_generation := 0;
  END IF;

  INSERT INTO private.room_restaurant_decks (room_id, round_started_at, category, generation)
  VALUES (p_room_id, room_row.swiping_started_at, room_row.winning_category, next_generation)
  RETURNING id INTO new_deck_id;

  -- True cryptographic randomness for the draw seed to eliminate table row-order bias
  draw_salt := replace(gen_random_uuid()::text, '-', '');
  draw_seed := p_room_id::text || ':' || room_row.winning_category || ':' || next_generation::text || ':' || draw_salt;

  has_nearby_pref := coalesce('nearby' = ANY(room_row.preferences), false);
  has_healthy_pref := coalesce('healthy' = ANY(room_row.preferences), false);

  -- Track recently served restaurant brands for repeat protection
  IF latest_deck.id IS NOT NULL THEN
    SELECT coalesce(array_agg(restaurant_id), '{}'::text[]) INTO prev_deck_restaurants
    FROM private.room_restaurant_deck_items
    WHERE deck_id = latest_deck.id;
  ELSE
    prev_deck_restaurants := '{}'::text[];
  END IF;

  SELECT coalesce(array_agg(DISTINCT i.restaurant_id), '{}'::text[]) INTO all_prev_deck_restaurants
  FROM private.room_restaurant_deck_items i
  JOIN private.room_restaurant_decks d ON d.id = i.deck_id
  WHERE d.room_id = p_room_id;

  -- Temporary table to hold eligible candidates resolved to verified branches
  CREATE TEMP TABLE IF NOT EXISTS _deck_candidates (
    restaurant_id text PRIMARY KEY,
    core_status text,
    selected_branch_id uuid,
    selected_district text,
    distance_km double precision,
    weight double precision,
    editorial_classification text,
    price_position text,
    context_tags text[],
    is_immediate_repeat boolean,
    is_historical_repeat boolean
  ) ON COMMIT DROP;
  TRUNCATE _deck_candidates;

  WITH context AS (
    SELECT private.normalize_district(room_row.neighborhood) AS district_id, l.latitude, l.longitude
    FROM (SELECT 1) x LEFT JOIN private.room_locations l ON l.room_id = p_room_id
  ),
  eligible_branches AS (
    SELECT
      r.id AS restaurant_id,
      coalesce(r.core_status, CASE WHEN r.editorial_role = 'staple' THEN 'core' ELSE 'expansion' END) AS core_status,
      r.editorial_role,
      r.reputation_tags,
      r.context_tags,
      r.price_position,
      r.dining_mode_summary,
      r.rating,
      r.trend_status,
      r.trend_confidence,
      r.overall_confidence,
      b.id AS branch_id,
      b.district AS branch_district,
      b.latitude AS branch_latitude,
      b.longitude AS branch_longitude,
      b.google_rating AS branch_google_rating,
      b.google_review_count AS branch_google_review_count,
      b.rating_source AS branch_rating_source,
      b.branch_identity_confidence,
      private.haversine_km(context.latitude, context.longitude, b.latitude, b.longitude) AS dist_km,
      private.district_tier(context.district_id, branch_geo.district_id) AS geo_tier,
      CASE
        WHEN room_row.eating_mode = 'delivery' THEN 'delivery'
        WHEN room_row.eating_mode = 'dine_in' THEN 'going_out'
        WHEN r.dining_mode_summary = 'delivery_only' THEN 'delivery'
        WHEN r.dining_mode_summary = 'dine_in_only' THEN 'going_out'
        ELSE 'both'
      END AS use_case
    FROM public.restaurants r
    CROSS JOIN context
    JOIN public.restaurant_branches b ON b.restaurant_id = r.id
    LEFT JOIN private.district_geography branch_geo ON branch_geo.district_id = private.normalize_district(b.district)
    WHERE lower(r.city) = lower(room_row.city)
      AND r.operating_status NOT IN ('temporarily_closed','permanently_closed')
      AND r.research_use IN ('production_ready','usable_with_caution')
      AND (
        r.primary_category = room_row.winning_category
        OR room_row.winning_category = ANY(r.secondary_categories)
        OR room_row.winning_category = ANY(r.categories)
      )
      -- Healthy preference filter: healthy is a filter, never a burger subcategory
      AND (NOT has_healthy_pref OR ('healthy' = ANY(r.categories) OR 'healthy' = ANY(r.context_tags) OR r.primary_category = 'healthy'))
      AND b.branch_status NOT IN ('temporarily_closed','permanently_closed')
      AND (
        room_row.eating_mode <> 'dine_in' OR (
          b.dine_in IS DISTINCT FROM false AND b.branch_type NOT IN ('takeaway_only','delivery_only','kiosk')
        )
      )
      AND (
        (room_row.eating_mode = 'dine_in' AND coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','dine_in_only'))
        OR (room_row.eating_mode = 'delivery' AND (
          coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','delivery_only')
          OR EXISTS (SELECT 1 FROM public.delivery_platform_listings dl WHERE dl.restaurant_id = r.id AND dl.status IN ('verified','probable'))
        ))
        OR (coalesce(room_row.eating_mode, 'any') NOT IN ('dine_in', 'delivery'))
      )
  ),
  filtered_branches AS (
    SELECT eb.*
    FROM eligible_branches eb
    CROSS JOIN context
    WHERE
      CASE
        -- Verified physical GPS radius by use-case
        WHEN context.latitude IS NOT NULL THEN
          eb.branch_latitude IS NOT NULL AND eb.branch_longitude IS NOT NULL
          AND eb.dist_km <= (
            CASE
              WHEN has_nearby_pref THEN
                CASE eb.use_case WHEN 'delivery' THEN 8.0 WHEN 'going_out' THEN 18.0 ELSE 12.0 END
              ELSE
                CASE eb.use_case WHEN 'delivery' THEN 14.0 WHEN 'going_out' THEN 35.0 ELSE 25.0 END
            END
          )
        -- District neighborhood tier by use-case
        WHEN context.district_id IS NOT NULL THEN
          CASE
            WHEN has_nearby_pref THEN
              CASE eb.use_case WHEN 'delivery' THEN eb.geo_tier <= 1 WHEN 'going_out' THEN eb.geo_tier <= 3 ELSE eb.geo_tier <= 2 END
            ELSE
              CASE eb.use_case WHEN 'delivery' THEN eb.geo_tier <= 2 WHEN 'going_out' THEN eb.geo_tier <= 4 ELSE eb.geo_tier <= 3 END
          END
        -- Citywide
        ELSE true
      END
  ),
  best_branch_per_restaurant AS (
    SELECT DISTINCT ON (fb.restaurant_id)
      fb.restaurant_id,
      fb.core_status,
      fb.branch_id,
      fb.branch_district,
      fb.dist_km,
      fb.editorial_role,
      fb.reputation_tags,
      fb.trend_status,
      fb.context_tags,
      fb.price_position,
      (
        0.55 +
        private.reputation_weight(coalesce(fb.branch_google_rating, fb.rating), fb.branch_google_review_count) * 1.45 *
          CASE fb.branch_rating_source WHEN 'google_maps_direct' THEN 1.0 WHEN 'google_derived_secondary' THEN 0.82 ELSE 0.68 END +
        CASE WHEN fb.dist_km IS NOT NULL THEN 1.0 / (1.0 + fb.dist_km / 8.0) ELSE 0.0 END +
        private.district_weight(fb.geo_tier) +
        CASE fb.editorial_role WHEN 'staple' THEN 0.24 WHEN 'popular' THEN 0.2 WHEN 'discovery' THEN 0.1 ELSE 0.0 END +
        CASE WHEN fb.trend_status IN ('rising','trending') AND fb.trend_confidence IN ('high','medium') THEN 0.16 ELSE 0.0 END +
        CASE WHEN fb.overall_confidence = 'high' THEN 0.18 WHEN fb.overall_confidence = 'medium' THEN 0.08 ELSE 0.0 END
      )::double precision AS weight
    FROM filtered_branches fb
    CROSS JOIN context
    ORDER BY
      fb.restaurant_id,
      CASE WHEN context.latitude IS NOT NULL AND fb.branch_latitude IS NOT NULL THEN 0 ELSE 1 END,
      fb.dist_km NULLS LAST,
      fb.geo_tier ASC,
      CASE fb.branch_identity_confidence WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      private.reputation_weight(fb.branch_google_rating, fb.branch_google_review_count) DESC,
      private.weighted_key(draw_seed, fb.branch_id::text, 1)
  )
  INSERT INTO _deck_candidates
  SELECT
    bbr.restaurant_id,
    bbr.core_status,
    bbr.branch_id,
    bbr.branch_district,
    bbr.dist_km,
    bbr.weight,
    CASE
      WHEN 'jeddah_staple' = ANY(bbr.reputation_tags) OR bbr.editorial_role = 'staple' THEN 'staple'
      WHEN 'local_favorite' = ANY(bbr.reputation_tags) THEN 'local_favorite'
      WHEN 'rising' = ANY(bbr.reputation_tags) OR bbr.trend_status IN ('rising','trending') THEN 'rising'
      WHEN 'hidden_gem' = ANY(bbr.reputation_tags) THEN 'hidden_gem'
      ELSE 'mainstream'
    END,
    bbr.price_position::text,
    bbr.context_tags,
    bbr.restaurant_id = ANY(prev_deck_restaurants),
    bbr.restaurant_id = ANY(all_prev_deck_restaurants)
  FROM best_branch_per_restaurant bbr;

  SELECT count(*)::int INTO total_eligible_count FROM _deck_candidates;
  SELECT count(*)::int INTO eligible_core_count FROM _deck_candidates WHERE core_status = 'core';

  -- Debug output if core guarantee cannot be satisfied due to real location/availability constraints
  IF room_row.winning_category = 'burger' AND eligible_core_count = 0 AND total_eligible_count > 0 THEN
    RAISE WARNING 'WSH_BURGER_CORE_UNAVAILABLE: No eligible core Burger brand found for room % constraints (total eligible: %)',
      p_room_id, total_eligible_count;
  END IF;

  CREATE TEMP TABLE IF NOT EXISTS _chosen_cards (
    restaurant_id text PRIMARY KEY,
    branch_id uuid,
    distance_km double precision,
    core_status text
  ) ON COMMIT DROP;
  TRUNCATE _chosen_cards;

  IF room_row.winning_category = 'burger' THEN
    -- Step 6: Guarantee >=1 random eligible core restaurant (if at least one eligible core exists)
    IF eligible_core_count > 0 THEN
      WITH core_pool AS (
        SELECT c.*,
          private.weighted_key(draw_seed || ':core', c.restaurant_id, c.weight) AS core_key,
          CASE
            WHEN c.is_immediate_repeat THEN 2
            WHEN c.is_historical_repeat THEN 1
            ELSE 0
          END AS repeat_tier
        FROM _deck_candidates c
        WHERE c.core_status = 'core'
      )
      SELECT restaurant_id INTO core_guaranteed_id
      FROM core_pool
      ORDER BY repeat_tier ASC, core_key ASC
      LIMIT 1;

      INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
      SELECT c.restaurant_id, c.selected_branch_id, c.distance_km, c.core_status
      FROM _deck_candidates c
      WHERE c.restaurant_id = core_guaranteed_id;
    END IF;

    -- Step 7 & 8: Fill remaining deck positions randomly from the full eligible pool (allows 1, 2, 3+ core)
    -- with diversity and repeat protection safeguards
    WITH remaining_pool AS (
      SELECT c.*,
        private.weighted_key(draw_seed || ':fill', c.restaurant_id, c.weight) AS fill_key,
        CASE
          WHEN c.is_immediate_repeat THEN 2
          WHEN c.is_historical_repeat THEN 1
          ELSE 0
        END AS repeat_tier,
        row_number() OVER (
          PARTITION BY (CASE WHEN 'smash' = ANY(c.context_tags) THEN 'smash' WHEN 'wagyu' = ANY(c.context_tags) THEN 'wagyu' ELSE 'classic' END)
          ORDER BY (CASE WHEN c.is_immediate_repeat THEN 1 ELSE 0 END), private.weighted_key(draw_seed || ':style', c.restaurant_id, c.weight)
        ) AS style_rank,
        row_number() OVER (
          PARTITION BY c.price_position
          ORDER BY (CASE WHEN c.is_immediate_repeat THEN 1 ELSE 0 END), private.weighted_key(draw_seed || ':price', c.restaurant_id, c.weight)
        ) AS price_rank,
        row_number() OVER (
          PARTITION BY c.editorial_classification
          ORDER BY (CASE WHEN c.is_immediate_repeat THEN 1 ELSE 0 END), private.weighted_key(draw_seed || ':editorial', c.restaurant_id, c.weight)
        ) AS editorial_rank
      FROM _deck_candidates c
      WHERE NOT EXISTS (SELECT 1 FROM _chosen_cards cur WHERE cur.restaurant_id = c.restaurant_id)
    ),
    diverse_ranked AS (
      SELECT rp.*,
        rp.fill_key * (
          1.0 +
          greatest(rp.style_rank - 3, 0) * 0.15 +
          greatest(rp.price_rank - 3, 0) * 0.12 +
          greatest(rp.editorial_rank - 3, 0) * 0.10
        ) AS diverse_key
      FROM remaining_pool rp
    )
    INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
    SELECT dr.restaurant_id, dr.selected_branch_id, dr.distance_km, dr.core_status
    FROM diverse_ranked dr
    ORDER BY dr.repeat_tier ASC, dr.diverse_key ASC
    LIMIT (7 - (SELECT count(*)::int FROM _chosen_cards));

  ELSE
    -- Non-Burger categories: preserve existing proven recommendation logic
    WITH non_burger_pool AS (
      SELECT c.*,
        private.weighted_key(draw_seed, c.restaurant_id, c.weight) AS selection_key,
        CASE WHEN c.is_historical_repeat THEN 1 ELSE 0 END AS repeat_tier,
        row_number() OVER (PARTITION BY c.price_position ORDER BY private.weighted_key(draw_seed, c.restaurant_id, c.weight)) AS price_rank,
        row_number() OVER (PARTITION BY private.normalize_district(c.selected_district) ORDER BY private.weighted_key(draw_seed, c.restaurant_id, c.weight)) AS district_rank
      FROM _deck_candidates c
    ),
    ranked AS (
      SELECT nbp.*,
        selection_key * (1 + greatest(price_rank - 3, 0) * 0.12 + greatest(district_rank - 3, 0) * 0.1) AS diverse_key
      FROM non_burger_pool nbp
    )
    INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
    SELECT r.restaurant_id, r.selected_branch_id, r.distance_km, r.core_status
    FROM ranked r
    ORDER BY r.repeat_tier ASC, r.diverse_key ASC
    LIMIT 7;
  END IF;

  -- Step 9 & 10: Shuffle the completed deck so guaranteed core position is private
  INSERT INTO private.room_restaurant_deck_items (deck_id, position, restaurant_id, branch_id, distance_km)
  SELECT
    new_deck_id,
    row_number() OVER (ORDER BY private.weighted_key(draw_seed || ':shuffle', c.restaurant_id, 1))::smallint AS position,
    c.restaurant_id,
    c.branch_id,
    round(c.distance_km::numeric, 2)
  FROM _chosen_cards c;

  RETURN private.deck_payload(new_deck_id);
END;
$$;

-- 8. Grant execute permissions
REVOKE ALL ON FUNCTION private.create_restaurant_deck(uuid, uuid, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.deck_payload(uuid) TO anon, authenticated;

COMMIT;
`;

fs.writeFileSync('supabase/migrations/20260928000100_jeddah_burger_expansion_and_deck_algorithm.sql', sql.trim() + '\n', 'utf8');
console.log('Successfully wrote supabase/migrations/20260928000100_jeddah_burger_expansion_and_deck_algorithm.sql');
