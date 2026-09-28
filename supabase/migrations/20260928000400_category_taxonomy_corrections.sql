-- WeshNakul — Forward-Only Migration: Category Taxonomy Correction Pass
-- Migration: 20260928000400_category_taxonomy_corrections.sql
-- 1. Normalizes street_folk_food -> street_folk across primary_category, categories, secondary_categories.
-- 2. Normalizes grills -> grill across primary_category, categories, secondary_categories, subcategories.
-- 3. Reclassifies Broast vs Fried Chicken into two distinct recommendation pools (6 broast, 14 fried chicken, ALBAIK in both).
-- 4. Cleans Asian vs Sushi eligibility: separates sushi-only brands from Asian, keeps 5 intentional broad-menu overlap brands.
-- 5. Preserves all verified branches, coordinates, ratings, Place IDs, addresses, and research provenance intact.
BEGIN;

-- ============================================================================
-- 1. FALAFEL & STREET FOOD: Normalize street_folk_food -> street_folk
-- ============================================================================

UPDATE public.restaurants
SET
  primary_category = 'street_folk',
  categories = array_replace(categories, 'street_folk_food', 'street_folk'),
  secondary_categories = array_replace(secondary_categories, 'street_folk_food', 'street_folk'),
  subcategories = array_replace(subcategories, 'street_folk_food', 'street_folk')
WHERE primary_category = 'street_folk_food'
   OR 'street_folk_food' = ANY(categories)
   OR 'street_folk_food' = ANY(secondary_categories);

-- ============================================================================
-- 2. GRILLS: Normalize grills -> grill
-- ============================================================================

UPDATE public.restaurants
SET
  primary_category = 'grill',
  categories = array_replace(categories, 'grills', 'grill'),
  secondary_categories = array_replace(secondary_categories, 'grills', 'grill'),
  subcategories = array_replace(subcategories, 'grills', 'grill')
WHERE primary_category = 'grills'
   OR 'grills' = ANY(categories)
   OR 'grills' = ANY(secondary_categories)
   OR 'grills' = ANY(subcategories);

-- Also update any legacy restaurant rows referencing grills
UPDATE public.restaurants
SET
  categories = array_replace(categories, 'grills', 'grill'),
  secondary_categories = array_replace(secondary_categories, 'grills', 'grill')
WHERE 'grills' = ANY(categories)
   OR 'grills' = ANY(secondary_categories);

-- ============================================================================
-- 3. BROAST VS FRIED CHICKEN: Dedicated recommendation pools
-- ============================================================================

-- 3a. Broast-primary brands (traditional broasted / pressure-fried chicken)
-- ALBAIK: Jeddah staple, primary broast, intentionally eligible for fried_chicken
UPDATE public.restaurants
SET
  primary_category = 'broast',
  categories = ARRAY['broast', 'fried_chicken', 'burger', 'seafood'],
  secondary_categories = ARRAY['traditional_broast', 'fried_chicken', 'musahab'],
  subcategories = ARRAY['traditional_broast', 'fried_chicken', 'musahab']
WHERE id = 'albaik';

-- Traditional broast-only brands
UPDATE public.restaurants
SET
  primary_category = 'broast',
  categories = ARRAY['broast'],
  secondary_categories = ARRAY['traditional_broast'],
  subcategories = ARRAY['traditional_broast']
WHERE id IN ('rami_broast', 'chicken_mubeen', 'al_najah_broast', 'broast_hanoo');

UPDATE public.restaurants
SET
  primary_category = 'broast',
  categories = ARRAY['broast'],
  secondary_categories = ARRAY['traditional_broast', 'musahab'],
  subcategories = ARRAY['traditional_broast', 'musahab']
WHERE id = 'ktaykit';

-- 3b. Fried Chicken-primary brands (American fried chicken, tenders, wings, hot chicken)
UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['tenders'],
  subcategories = ARRAY['tenders', 'chicken_fingers']
WHERE id = 'raising_canes';

UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['american_fried_chicken'],
  subcategories = ARRAY['bone_in', 'strips']
WHERE id = 'kfc';

UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['american_fried_chicken'],
  subcategories = ARRAY['bone_in', 'tenders']
WHERE id = 'texas_chicken';

UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['louisiana_fried_chicken'],
  subcategories = ARRAY['bone_in', 'tenders']
WHERE id = 'popeyes';

UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['hot_chicken', 'tenders', 'nashville'],
  subcategories = ARRAY['hot_chicken', 'tenders', 'nashville']
WHERE id = 'daves_hot_chicken';

UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['tenders'],
  subcategories = ARRAY['tenders']
WHERE id IN ('tndr', 'crisper', 'tenders_cart');

UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['wings'],
  subcategories = ARRAY['wings', 'tenders']
WHERE id = 'wingstop';

UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['hot_chicken', 'tenders', 'nashville'],
  subcategories = ARRAY['nashville', 'tenders', 'hot_chicken']
WHERE id = 'crusted';

UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['tenders', 'chicken_burgers'],
  subcategories = ARRAY['tenders', 'chicken_burgers']
WHERE id = 'dabboos';

UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['quick_bite'],
  subcategories = ARRAY['chicken_skewers', 'crispy_chicken']
WHERE id = 'sayakh';

UPDATE public.restaurants
SET
  primary_category = 'fried_chicken',
  categories = ARRAY['fried_chicken'],
  secondary_categories = ARRAY['hot_chicken', 'nashville'],
  subcategories = ARRAY['hot_chicken', 'nashville']
WHERE id = 'nashvilles_hot_chicken';

-- ============================================================================
-- 4. ASIAN VS SUSHI: Clean eligibility & intentional overlap
-- ============================================================================

-- 4a. Sushi-only brands: Remove 'asian' tag so they do not crowd the Asian catalog
UPDATE public.restaurants
SET
  primary_category = 'sushi',
  categories = array_remove(categories, 'asian'),
  secondary_categories = array_remove(secondary_categories, 'asian'),
  subcategories = CASE
    WHEN subcategories IS NULL OR cardinality(subcategories) = 0 OR subcategories = ARRAY['asian']
      THEN ARRAY['sushi']
    ELSE array_remove(subcategories, 'asian')
  END
WHERE id IN (
  'maki_house',
  'gold_sushi_club',
  'sushiart',
  'sushiah',
  'tanuki_sushi',
  'kimono',
  'ikigai_sushi_restaurant',
  'ashi_sushi',
  'fuji_japanese_restaurant',
  'ricci_san'
);

-- Sushi Yoshi: sushi + seafood, not asian
UPDATE public.restaurants
SET
  primary_category = 'sushi',
  categories = ARRAY['sushi', 'seafood'],
  secondary_categories = ARRAY['seafood'],
  subcategories = ARRAY['seafood', 'sushi']
WHERE id = 'sushi_yoshi';

-- 4b. Intentional Overlap: High-end Japanese & Nikkei restaurants with genuine broad Asian menus
-- Wakame: Asian & Sushi lounge with noodles, robata, teppan, dim sum
UPDATE public.restaurants
SET
  primary_category = 'sushi',
  categories = ARRAY['sushi', 'asian'],
  secondary_categories = ARRAY['japanese', 'asian_lounge'],
  subcategories = ARRAY['japanese', 'asian_lounge', 'sushi']
WHERE id = 'wakame';

-- MYAZU: Contemporary Japanese fine dining with extensive robata and hot dishes
UPDATE public.restaurants
SET
  primary_category = 'sushi',
  categories = ARRAY['sushi', 'asian'],
  secondary_categories = ARRAY['japanese', 'fine_dining'],
  subcategories = ARRAY['japanese', 'fine_dining', 'sushi']
WHERE id = 'myazu';

-- SHiRO: Contemporary Japanese with noodles, bento, teppanyaki
UPDATE public.restaurants
SET
  primary_category = 'sushi',
  categories = ARRAY['sushi', 'asian'],
  secondary_categories = ARRAY['japanese', 'pan_asian'],
  subcategories = ARRAY['japanese', 'pan_asian', 'sushi']
WHERE id = 'shiro';

-- Kuuru: High-end Nikkei cuisine (Japanese-Peruvian)
UPDATE public.restaurants
SET
  primary_category = 'sushi',
  categories = ARRAY['sushi', 'asian'],
  secondary_categories = ARRAY['nikkei', 'asian_fusion'],
  subcategories = ARRAY['nikkei', 'asian_fusion', 'sushi']
WHERE id = 'kuuru';

-- Sakura Japanese Restaurant: Teppanyaki show cooking & traditional Japanese dining
UPDATE public.restaurants
SET
  primary_category = 'sushi',
  categories = ARRAY['sushi', 'asian'],
  secondary_categories = ARRAY['japanese', 'teppanyaki'],
  subcategories = ARRAY['japanese', 'teppanyaki', 'sushi']
WHERE id = 'sakura_japanese_restaurant';

COMMIT;
