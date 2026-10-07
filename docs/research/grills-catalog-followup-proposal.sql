-- ============================================================================
-- WeshNakul — Grills Catalog Follow-up Proposal (RESEARCH ONLY)
-- File: docs/research/grills-catalog-followup-proposal.sql
--
-- DO NOT EXECUTE AUTOMATICALLY AGAINST PRODUCTION SUPABASE.
--
-- Description:
-- 1. Proposed retirement of Yildizlar Restaurant from curated Grills catalog.
-- 2. Catalog specification template for Texas Roadhouse (pending verified Jeddah branch research).
-- 3. Proposal for Al Nakheel multi-category eligibility (Grills + Breakfast + Falafel).
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. RETIRE YILDIZLAR RESTAURANT (PROPOSAL)
-- ============================================================================
-- Yildizlar Restaurant (yildizlar_restaurant) currently exists in the Grills catalog.
-- It is slated to be replaced in the curated set by Texas Roadhouse as the premium steak/grill going-out option.
-- This section will be executed only after Texas Roadhouse branch data is verified.

/*
DELETE FROM private.room_restaurant_deck_items WHERE restaurant_id = 'yildizlar_restaurant';
DELETE FROM public.restaurant_branches WHERE restaurant_id = 'yildizlar_restaurant';
DELETE FROM public.restaurants WHERE id = 'yildizlar_restaurant';
*/


-- ============================================================================
-- 2. TEXAS ROADHOUSE (CATALOG SPECIFICATION - AWAITING VERIFIED BRANCH DATA)
-- ============================================================================
-- Texas Roadhouse replaces Yildizlar.
-- NOTE: Branch data below is a placeholder template and MUST be populated with
-- verified Google Place IDs, exact GPS coordinates, and district data before execution.
-- DO NOT EXECUTE UNTIL VERIFIED BRANCH AUDIT IS COMPLETE.

/*
INSERT INTO public.restaurants (
  id,
  name_en,
  name_ar,
  primary_category,
  categories,
  secondary_categories,
  subcategories,
  editorial_role,
  tier,
  price_position,
  price_tier,
  signature_dish_ar,
  signature_dish_en,
  vibe_tags_ar,
  vibe_tags_en,
  time_slots,
  is_open_late,
  is_24_hours,
  is_city_wide,
  delivery_platforms,
  official_website
) VALUES (
  'texas_roadhouse',
  'Texas Roadhouse',
  'تكساس رودهاوس',
  'grill',
  ARRAY['grill', 'american', 'steakhouse'],
  ARRAY['steakhouse', 'american', 'going_out'],
  ARRAY['ribs', 'steak', 'fresh_bread'],
  'staple',
  'staple',
  'premium',
  '$$$',
  'ستيك وضلوع مشوية مع خبز طازج',
  'Hand-cut Steaks, Fall-Off-The-Bone Ribs & Made-From-Scratch Sides',
  ARRAY['ستيك هاوس أمريكي', 'أجواء عائلية حيوية', 'جلسات واسعة', 'خبز طازج وزبدة القرفة'],
  ARRAY['American Steakhouse', 'Lively Family Dining', 'Spacious Seating', 'Fresh Baked Bread & Cinnamon Butter'],
  ARRAY['lunch', 'dinner', 'late_night'],
  true,
  false,
  false,
  ARRAY['jahez', 'hungerstation'],
  'https://www.texasroadhouse.com/'
) ON CONFLICT (id) DO UPDATE SET
  primary_category = EXCLUDED.primary_category,
  categories = EXCLUDED.categories;

-- Pending verified Jeddah branches (e.g. Le Mall / Andalus Mall / Red Sea Mall):
-- INSERT INTO public.restaurant_branches (
--   restaurant_id, branch_name_en, branch_name_ar, district, google_place_id,
--   google_maps_url, latitude, longitude, branch_status, last_verified_at
-- ) VALUES (...);
*/


-- ============================================================================
-- 3. AL NAKHEEL MULTI-CATEGORY ELIGIBILITY (GRILLS + BREAKFAST + FALAFEL)
-- ============================================================================
-- Al Nakheel Restaurant should eventually be eligible for:
-- - Grills: yes, premium/going-out
-- - Breakfast: yes, premium/going-out Hijazi breakfast
-- - Falafel: yes, premium/going-out alternative
-- Keeping primary_category as 'grill' while broadening categories array:

/*
UPDATE public.restaurants
SET
  categories = ARRAY['grill', 'breakfast', 'falafel', 'street_folk', 'middle_eastern'],
  secondary_categories = ARRAY['hijazi_breakfast', 'traditional_grill', 'family_dining', 'going_out'],
  time_slots = ARRAY['breakfast', 'lunch', 'dinner', 'late_night']
WHERE id = 'al_nakheel_restaurant';
*/

COMMIT;
