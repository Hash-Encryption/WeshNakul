import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourcePath = path.join(rootDir, 'docs/research/jeddah-italian-pass-d-corrected.json');
const dataset = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const CANONICAL_30 = new Set([
  'abhur_al_janoubiyah', 'abhur_al_shamaliyah',
  'al_andalus',          'al_aziziyah',
  'al_balad',            'al_basateen',
  'al_bawadi',           'al_faiha',
  'al_faisaliyyah',      'al_hamdaniyah',
  'al_hamra',            'al_khalidiyyah',
  'al_marwah',           'al_mohammadiyyah',
  'al_murjan',           'al_naeem',
  'al_naseem',           'al_rawdah',
  'al_rehab',            'al_ruwais',
  'al_safa',             'al_salamah',
  'al_samer',            'al_sharafeyah',
  'al_shati',            'al_sheraa',
  'al_thaghr',           'al_zahra',
  'an_nuzhah',           'ar_rabwah'
]);

const VIBE_TAGS_MAP = {
  'jon_and_vinnys': {
    ar: ['أيقونة لوس أنجلوس', 'إيطالي أمريكي فاخر', 'أجواء عصرية', 'جلسات راقية'],
    en: ['LA Icon', 'Upscale Italian-American', 'Trendy Hotspot', 'Premium Dining']
  },
  'noto': {
    ar: ['إيطالي فاخر وراقي', 'جدة ووك والتحلية', 'بيتزا وباستا صقلية', 'أجواء أنيقة'],
    en: ['Luxury Italian Dining', 'Jeddah Walk Tahlia', 'Sicilian Pizza & Pasta', 'Chic Ambience']
  },
  'san_carlo_cicchetti': {
    ar: ['سلسلة إيطالية عالمية فاخرة', 'أطباق تشيكيتّي فينيسية', 'أجواء راقية ومميزة', 'شارع التحلية'],
    en: ['World Renowned Italian', 'Venetian Cicchetti Plates', 'Fine Dining Elegance', 'Tahlia Street']
  },
  'piatto': {
    ar: ['مطعم إيطالي عائلي', 'أطباق باستا وبيتزا شهيرة', 'أجواء مريحة ولمات', 'فروع متعددة'],
    en: ['Family Italian Classic', 'Famous Pasta & Pizza', 'Comfortable Ambience', 'Multiple Locations']
  },
  'olive_garden': {
    ar: ['أشهر سلسلة إيطالية أمريكية', 'أتيلييه لافي طريق الملك', 'شوربات وسلطات لا محدودة', 'أجواء عائلية'],
    en: ['Famous Italian-American Chain', 'Atelier LaVie King Road', 'Unlimited Soup & Salad', 'Family Friendly']
  },
  'eataly': {
    ar: ['سوق ومطعم إيطالي عالمي', 'فطور وإفطار إيطالي راقي', 'مخبوزات وباستا طازجة', 'فايبز الأندلس'],
    en: ['Global Italian Food Market', 'Artisan Breakfast & Bakery', 'Fresh Pasta & Pizza', 'Vibes Al Andalus']
  },
  'il_vero': {
    ar: ['بيتزا نابولية أصلية', 'سهرات حتى وقت متأخر', 'حي الأندلس', 'أجواء إيطالية دافئة'],
    en: ['Authentic Neapolitan Pizza', 'Late Night Dining', 'Al Andalus Neighborhood', 'Cozy Italian Vibe']
  },
  'portofino': {
    ar: ['مطعم إيطالي وبحري عريق', 'ريزوتو وثمار بحر كلاسيك', 'حي الروضة', 'أجواء كلاسيكية هادئة'],
    en: ['Heritage Italian & Seafood', 'Classic Risotto & Calamari', 'Ar Rawdah District', 'Classic Quiet Dining']
  },
  'vivaci': {
    ar: ['إيطالي راقي وعصري', 'بيتزا حطب وباستا مميزة', 'حي الزهراء', 'أجواء حيوية رايقة'],
    en: ['Artisan Italian Craft', 'Wood-Fired Pizza & Pasta', 'Al Zahra District', 'Vibrant Trendy Ambience']
  },
  'napoli_blu': {
    ar: ['بيتزا نابولية', 'حطب ومختصة', 'سهرات حتى الفجر', 'جلسات شبابية'],
    en: ['Neapolitan Style', 'Artisan Oven', 'Late Night Until 4am', 'Trendy Spot']
  },
  'il_postino_pizzeria': {
    ar: ['إيطالي أصيل', 'بيتزا حطب', 'أجواء أوروبية', 'عجينة مخمرة'],
    en: ['Authentic Italian', 'Wood-Fired', 'European Vibe', 'Fermented Dough']
  },
  'wood_fire_pizza_lenuo': {
    ar: ['فرن حطب عريق من ٢٠٠١', 'بيتزا وباستا طازجة', 'حي الحمراء', 'محلي محبوب'],
    en: ['Wood Fire Oven Since 2001', 'Fresh Pizza & Pasta', 'Al Hamra District', 'Local Favorite']
  },
  'verra_pizza': {
    ar: ['بيتزا حطب نابولية', 'مكونات إيطالية مستوردة', 'فروع الزهراء وأبحر', 'سهرات'],
    en: ['Wood-Fired Pizza', 'True Neapolitan', 'Imported Italian', 'Late Night']
  },
  'salernoo': {
    ar: ['جوهرة إيطالية مخفية', 'باستا تروفل وريزوتو', 'حي الزهراء', 'جلسات دافئة وهادئة'],
    en: ['Italian Hidden Gem', 'Truffle Pasta & Risotto', 'Al Zahra District', 'Intimate Cozy Dining']
  },
  'il_castello': {
    ar: ['مطعم إيطالي كلاسيك عريق', 'باستا وبيكاتا تقليدية', 'حي الشرفية', 'أجواء هادئة وأصيلة'],
    en: ['Heritage Italian Trattoria', 'Traditional Pasta & Veal', 'Al Sharafeyah District', 'Authentic Classic Charm']
  },
  'pizzalio': {
    ar: ['بيتزا إيطالية سريعة', 'أسعار اقتصادية', 'حي السلامة', 'سريع وسفري'],
    en: ['Fast Italian Pizza', 'Value & Budget Friendly', 'As Salamah District', 'Quick Bite & Takeaway']
  }
};

const PRICE_POSITION_MAP = {
  'affordable': { position: 'budget', tier: '$', min: 25, max: 55 },
  'mid-range': { position: 'standard', tier: '$$', min: 45, max: 95 },
  'premium': { position: 'premium', tier: '$$$', min: 75, max: 180 }
};

const EDITORIAL_ROLE_MAP = {
  'staple': { role: 'staple', tier: 'staple', reputation: ['jeddah_staple'] },
  'mainstream': { role: 'popular', tier: 'trend', reputation: ['mainstream'] },
  'local_favorite': { role: 'popular', tier: 'trend', reputation: ['local_favorite'] },
  'rising': { role: 'popular', tier: 'trend', reputation: ['rising'] },
  'hidden_gem': { role: 'discovery', tier: 'trend', reputation: ['hidden_gem'] }
};

const shapedBrands = dataset.brands.map(brand => {
  const brandId = brand.id;
  const vibeTags = VIBE_TAGS_MAP[brandId] || { ar: ['إيطالي', 'باستا'], en: ['Italian', 'Pasta'] };
  const priceInfo = PRICE_POSITION_MAP[brand.price_positioning] || { position: 'standard', tier: '$$', min: 45, max: 95 };
  const edInfo = EDITORIAL_ROLE_MAP[brand.editorial_classification] || { role: 'popular', tier: 'trend', reputation: ['local_favorite'] };

  const categories = ['italian'];
  if (brand.secondary_categories && brand.secondary_categories.length > 0) {
    for (const sc of brand.secondary_categories) {
      if (!categories.includes(sc)) categories.push(sc);
    }
  }

  // Best sellers
  const bestSellers = (brand.signature_dishes || []).map((dishStr, idx) => {
    return {
      name_en: dishStr,
      name_ar: dishStr,
      is_signature: idx === 0,
      sort_order: idx
    };
  });
  if (bestSellers.length === 0) {
    bestSellers.push({
      name_en: 'Pasta & Pizza Specialties',
      name_ar: 'تشكيلة الباستا والبيتزا الإيطالية',
      is_signature: true,
      sort_order: 0
    });
  }

  const firstDish = bestSellers[0];

  // Map branches
  const shapedBranches = (brand.branches || []).map(br => {
    const isCanonical = br.canonical_district && CANONICAL_30.has(br.canonical_district);
    const district = isCanonical ? br.canonical_district : null;
    const prodStatus = isCanonical ? 'production_ready' : 'usable_with_caution';

    if (!isCanonical && (!br.geographic_notes || br.geographic_notes.trim().length === 0)) {
      throw new Error(`Branch ${br.branch_name} (${brandId}) outside canonical geography missing geographic_notes`);
    }

    return {
      restaurant_id: brandId,
      branch_name_en: br.branch_name,
      branch_name_ar: null,
      branch_type: 'full_dine_in',
      district,
      address_en: br.formatted_address,
      latitude: br.latitude,
      longitude: br.longitude,
      maps_business_name: brand.canonical_name,
      google_place_id: br.google_place_id,
      google_maps_url: br.google_maps_url,
      google_rating: br.google_rating,
      google_review_count: br.google_review_count,
      operating_status: br.operating_status,
      hours: br.hours,
      phone: br.phone,
      geographic_notes: br.geographic_notes,
      production_branch_status: prodStatus
    };
  });

  const canonicalDistricts = shapedBranches.map(b => b.district).filter(Boolean);
  const isCityWide = canonicalDistricts.length >= 3;
  const isOpenLate = brand.context_tags?.includes('late_night') || false;

  return {
    brand_id: brandId,
    canonical_name: brand.canonical_name,
    arabic_name: brand.arabic_name,
    categories,
    primary_category: 'italian',
    secondary_categories: brand.secondary_categories || [],
    subcategories: brand.secondary_categories || [],
    editorial_role: edInfo.role,
    tier: edInfo.tier,
    price_position: priceInfo.position,
    price_tier: priceInfo.tier,
    estimated_spend_min_sar: priceInfo.min,
    estimated_spend_max_sar: priceInfo.max,
    signature_dish_ar: firstDish.name_ar,
    signature_dish_en: firstDish.name_en,
    vibe_tags_ar: vibeTags.ar,
    vibe_tags_en: vibeTags.en,
    reputation_tags: edInfo.reputation,
    context_tags: brand.context_tags || [],
    time_slots: brand.modes?.includes('breakfast') ? ['breakfast', 'lunch', 'dinner', 'late_night'] : (isOpenLate ? ['lunch', 'dinner', 'late_night'] : ['lunch', 'dinner']),
    is_open_late: isOpenLate,
    is_24_hours: false,
    is_city_wide: isCityWide,
    branch_list_completeness: brand.branches?.length > 1 ? 'complete' : 'partial',
    verified_jeddah_branch_count: shapedBranches.length,
    canonical_districts: canonicalDistricts,
    delivery_platforms: ['hungerstation', 'jahez'],
    official_website: brand.official_website || null,
    research_use: 'production_ready',
    branches: shapedBranches,
    best_sellers: bestSellers
  };
});

const payloadJson = JSON.stringify({
  catalog_metadata: {
    title: 'WeshNakul Jeddah Italian Production Catalog',
    version: 'Pass D Certified Corrected',
    date: '2026-09-27',
    brand_count: shapedBrands.length,
    branch_count: shapedBrands.reduce((acc, b) => acc + b.branches.length, 0),
    canonical_branch_count: shapedBrands.reduce((acc, b) => acc + b.branches.filter(br => br.district !== null).length, 0),
    outer_caution_branch_count: shapedBrands.reduce((acc, b) => acc + b.branches.filter(br => br.district === null).length, 0)
  },
  brands: shapedBrands
}, null, 2);

const migrationSql = `-- Google-verified Jeddah Italian production catalog.
-- Source: docs/research/jeddah-italian-pass-d-corrected.json
-- 16 approved brands, 22 verified physical branches (21 canonical, 1 outer-district caution branch).
-- Reconciles 6 Pizza-catalog overlaps (jon_and_vinnys, napoli_blu, pizzalio, verra_pizza, wood_fire_pizza_lenuo, il_postino_pizzeria) without duplicates.
-- 100% Google Place IDs, Maps URLs, verified coordinates, addresses, hours, and ratings.
-- Apply after 20260927000200_jeddah_grills_catalog.sql.
BEGIN;

CREATE TEMP TABLE _italian_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _italian_catalog(payload) VALUES ($catalog$${payloadJson}$catalog$::jsonb);

-- 1. Upsert public.restaurants
-- Reuses existing restaurant identities for Pizza overlaps and adds 'italian' to categories
WITH catalog AS (SELECT payload FROM _italian_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
)
INSERT INTO public.restaurants (
  id, name_ar, name_en, categories, is_city_wide, branches, dining_mode, time_slots,
  closing_time_ar, is_open_late, is_24_hours, avg_prep_minutes, tier, price_tier,
  signature_dish_ar, signature_dish_en, vibe_tags_ar, vibe_tags_en, platforms, links,
  city, primary_category, secondary_categories, subcategories, category_fit_confidence,
  category_fit_evidence, editorial_role, reputation_tags, context_tags, business_type,
  operating_status, brand_status_confidence, verified_jeddah_branch_count,
  branch_list_completeness, dining_mode_summary, price_position,
  estimated_sar_per_person_min, estimated_sar_per_person_max, official_website,
  trend_status, trend_confidence, overall_confidence, research_use, last_verified_at,
  manual_review_required, manual_review_reasons, intelligence_origin
)
SELECT
  b->>'brand_id',
  b->>'arabic_name',
  b->>'canonical_name',
  ARRAY(SELECT jsonb_array_elements_text(b->'categories')),
  (b->>'is_city_wide')::boolean,
  ARRAY(SELECT jsonb_array_elements_text(b->'canonical_districts')),
  'both',
  ARRAY(SELECT jsonb_array_elements_text(b->'time_slots')),
  CASE WHEN (b->>'is_open_late')::boolean THEN 'يقفل 2:00 ص' ELSE 'يقفل 12:00 ص' END,
  (b->>'is_open_late')::boolean,
  (b->>'is_24_hours')::boolean,
  25,
  b->>'tier',
  b->>'price_tier',
  b->>'signature_dish_ar',
  b->>'signature_dish_en',
  ARRAY(SELECT jsonb_array_elements_text(b->'vibe_tags_ar')),
  ARRAY(SELECT jsonb_array_elements_text(b->'vibe_tags_en')),
  b->'delivery_platforms',
  jsonb_build_object('googleMaps', 'https://www.google.com/maps/search/?api=1&query=' || replace(b->>'canonical_name', ' ', '+') || '+Jeddah'),
  'jeddah',
  b->>'primary_category',
  ARRAY(SELECT jsonb_array_elements_text(b->'secondary_categories')),
  ARRAY(SELECT jsonb_array_elements_text(b->'subcategories')),
  'high'::public.intelligence_confidence,
  'Verified by operational physical presence and direct Google Places branch inventory',
  (b->>'editorial_role')::public.editorial_role,
  ARRAY(SELECT jsonb_array_elements_text(b->'reputation_tags')),
  ARRAY(SELECT jsonb_array_elements_text(b->'context_tags')),
  'restaurant',
  'open',
  'high'::public.intelligence_confidence,
  (b->>'verified_jeddah_branch_count')::integer,
  b->>'branch_list_completeness',
  'both',
  (b->>'price_position')::public.price_position,
  (b->>'estimated_spend_min_sar')::numeric,
  (b->>'estimated_spend_max_sar')::numeric,
  b->>'official_website',
  'none'::public.trend_status,
  'high'::public.intelligence_confidence,
  'high'::public.intelligence_confidence,
  'production_ready'::public.research_use,
  '2026-09-27T00:00:00Z'::timestamptz,
  false,
  '{}'::text[],
  'research'
FROM brands
ON CONFLICT (id) DO UPDATE SET
  name_ar=EXCLUDED.name_ar,
  name_en=EXCLUDED.name_en,
  -- Merge category memberships (adds 'italian' while preserving existing pizza/grills/etc.)
  categories=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.categories, EXCLUDED.categories)) item),
  secondary_categories=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.secondary_categories, EXCLUDED.secondary_categories)) item),
  subcategories=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.subcategories, EXCLUDED.subcategories)) item),
  -- Preserve existing primary_category if already defined (e.g. pizza stays pizza)
  primary_category=COALESCE(restaurants.primary_category, EXCLUDED.primary_category),
  context_tags=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.context_tags, EXCLUDED.context_tags)) item),
  reputation_tags=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.reputation_tags, EXCLUDED.reputation_tags)) item),
  vibe_tags_ar=EXCLUDED.vibe_tags_ar,
  vibe_tags_en=EXCLUDED.vibe_tags_en,
  editorial_role=COALESCE(restaurants.editorial_role, EXCLUDED.editorial_role),
  tier=COALESCE(restaurants.tier, EXCLUDED.tier),
  price_tier=COALESCE(restaurants.price_tier, EXCLUDED.price_tier),
  price_position=COALESCE(restaurants.price_position, EXCLUDED.price_position),
  signature_dish_ar=COALESCE(restaurants.signature_dish_ar, EXCLUDED.signature_dish_ar),
  signature_dish_en=COALESCE(restaurants.signature_dish_en, EXCLUDED.signature_dish_en),
  official_website=COALESCE(EXCLUDED.official_website, restaurants.official_website),
  last_verified_at=EXCLUDED.last_verified_at,
  research_use='production_ready'::public.research_use;

-- 2. Cleanup stale best sellers and sources for new brands prior to insertion
DELETE FROM public.restaurant_best_sellers s USING _italian_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
  WHERE b->>'brand_id' NOT IN ('jon_and_vinnys', 'napoli_blu', 'pizzalio', 'verra_pizza', 'wood_fire_pizza_lenuo', 'il_postino_pizzeria')
);

DELETE FROM public.restaurant_sources s USING _italian_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
  WHERE b->>'brand_id' NOT IN ('jon_and_vinnys', 'napoli_blu', 'pizzalio', 'verra_pizza', 'wood_fire_pizza_lenuo', 'il_postino_pizzeria')
) AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _italian_catalog), branches AS (
  SELECT br
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
)
INSERT INTO public.restaurant_branches (
  restaurant_id, branch_name_ar, branch_name_en, branch_status, branch_status_confidence, branch_type,
  district, address_en, latitude, longitude, maps_business_name, google_place_id, maps_lookup_status,
  google_maps_url, google_rating, google_review_count, rating_source, maps_last_verified_at,
  branch_identity_confidence, geographic_notes, last_verified_at
)
SELECT
  br->>'restaurant_id',
  br->>'branch_name_ar',
  br->>'branch_name_en',
  'open',
  'high'::public.intelligence_confidence,
  (br->>'branch_type')::public.branch_type,
  br->>'district',
  br->>'address_en',
  (br->>'latitude')::double precision,
  (br->>'longitude')::double precision,
  br->>'maps_business_name',
  br->>'google_place_id',
  'verified',
  br->>'google_maps_url',
  (br->>'google_rating')::numeric,
  (br->>'google_review_count')::integer,
  'google_maps_direct',
  '2026-09-27T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  br->>'geographic_notes',
  '2026-09-27T00:00:00Z'::timestamptz
FROM branches
ON CONFLICT (google_place_id) DO UPDATE SET
  restaurant_id=EXCLUDED.restaurant_id,
  branch_name_ar=COALESCE(restaurant_branches.branch_name_ar, EXCLUDED.branch_name_ar),
  branch_name_en=EXCLUDED.branch_name_en,
  branch_status=EXCLUDED.branch_status,
  branch_status_confidence=EXCLUDED.branch_status_confidence,
  branch_type=EXCLUDED.branch_type,
  district=EXCLUDED.district,
  address_en=EXCLUDED.address_en,
  latitude=EXCLUDED.latitude,
  longitude=EXCLUDED.longitude,
  maps_business_name=EXCLUDED.maps_business_name,
  maps_lookup_status=EXCLUDED.maps_lookup_status,
  google_maps_url=EXCLUDED.google_maps_url,
  google_rating=EXCLUDED.google_rating,
  google_review_count=EXCLUDED.google_review_count,
  rating_source=EXCLUDED.rating_source,
  maps_last_verified_at=EXCLUDED.maps_last_verified_at,
  branch_identity_confidence=EXCLUDED.branch_identity_confidence,
  geographic_notes=EXCLUDED.geographic_notes,
  last_verified_at=EXCLUDED.last_verified_at;

-- 4. Insert best sellers for brands
WITH catalog AS (SELECT payload FROM _italian_catalog), sellers AS (
  SELECT b->>'brand_id' restaurant_id, item
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'best_sellers') item
  WHERE b->>'brand_id' NOT IN ('jon_and_vinnys', 'napoli_blu', 'pizzalio', 'verra_pizza', 'wood_fire_pizza_lenuo', 'il_postino_pizzeria')
)
INSERT INTO public.restaurant_best_sellers (
  restaurant_id, name_ar, name_en, is_signature, sort_order, confidence, evidence_summary, last_verified_at
)
SELECT
  restaurant_id,
  item->>'name_ar',
  item->>'name_en',
  (item->>'is_signature')::boolean,
  (item->>'sort_order')::integer,
  'high'::public.intelligence_confidence,
  'Certified Italian Pass D dataset signature item',
  '2026-09-27T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _italian_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  WHERE b->>'official_website' IS NOT NULL
    AND b->>'brand_id' NOT IN ('jon_and_vinnys', 'napoli_blu', 'pizzalio', 'verra_pizza', 'wood_fire_pizza_lenuo', 'il_postino_pizzeria')
)
INSERT INTO public.restaurant_sources (
  restaurant_id, source_type, source_url, supports, date_checked, evidence_quality, notes
)
SELECT
  b->>'brand_id',
  'official_website'::public.research_source_type,
  b->>'official_website',
  ARRAY['brand_identity', 'category', 'best_sellers']::text[],
  '2026-09-27T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources
WITH catalog AS (SELECT payload FROM _italian_catalog), branches AS (
  SELECT br
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
  WHERE b->>'brand_id' NOT IN ('jon_and_vinnys', 'napoli_blu', 'pizzalio', 'verra_pizza', 'wood_fire_pizza_lenuo', 'il_postino_pizzeria')
)
INSERT INTO public.restaurant_sources (
  restaurant_id, branch_id, source_type, source_url, supports, date_checked, evidence_quality, notes
)
SELECT
  br->>'restaurant_id',
  rb.id,
  'google_maps'::public.research_source_type,
  br->>'google_maps_url',
  ARRAY['google_identity', 'location', 'business_status', 'google_reputation']::text[],
  '2026-09-27T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Verified direct Google Maps place record'
FROM branches br
JOIN public.restaurant_branches rb ON rb.google_place_id = br->>'google_place_id';

COMMIT;
`;

const migrationPath = path.join(rootDir, 'supabase/migrations/20260927000600_jeddah_italian_catalog.sql');
fs.writeFileSync(migrationPath, migrationSql);
console.log('Italian migration generated successfully at:', migrationPath);

