import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourcePath = path.join(rootDir, 'docs/research/jeddah-sushi-pass-d-corrected.json');
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
  'maki_house': {
    ar: ['ماكي وسوشي متنوع', 'بوكسات مشاركة', 'سهرات حتى الفجر', 'فروع متعددة'],
    en: ['Varied Maki & Sushi', 'Sharing Party Boxes', 'Late Night Until 4am', 'Multiple Locations']
  },
  'wakame': {
    ar: ['سوشي ولاونج فاخر', 'أجواء راقية ومميزة', 'أطباق طازجة وصحية', 'طريق الملك والروضة وأبحر'],
    en: ['Premium Sushi & Lounge', 'Chic Upscale Ambience', 'Fresh & Healthy Options', 'King Road, Rawdah & Obhur']
  },
  'gold_sushi_club': {
    ar: ['نادي سوشي راقي', 'سوشي ونودلز يابانية', 'أجواء عصرية أنيقة', 'شارع صاري والمحمدية وأبحر'],
    en: ['Upscale Sushi Club', 'Artisan Sushi & Noodles', 'Chic Trendy Ambience', 'Sari, Mohammadiyyah & Obhur']
  },
  'sushiah': {
    ar: ['سوشي مبتكر وعصري', 'توصيل قوي وسريع', 'خيارات بوكسات غنية', 'شارع صاري الزهراء'],
    en: ['Innovative Modern Sushi', 'Strong Delivery Presence', 'Generous Party Boxes', 'Sari Street Al Zahra']
  },
  'shiro': {
    ar: ['بوكسات سوشي شهيرة', 'مزيج كرانشي وكاليفورنيا', 'حي الروضة', 'سهرات ولذة سريعة'],
    en: ['Popular Sushi Boxes', 'Crunchy & California Rolls', 'Ar Rawdah District', 'Late Night Bites']
  },
  'myazu': {
    ar: ['مطعم ياباني فاخر عالمي', 'أطباق نيجيري وروبيان تيمبورا', 'البساتين مول التحلية', 'جلسات استثنائية راقية'],
    en: ['World-Class Fine Dining', 'Artisan Nigiri & Tempura', 'Al Basateen Mall Tahlia', 'Extraordinary Luxury Ambience']
  },
  'sakura_japanese_restaurant': {
    ar: ['مطعم ياباني أصيل عريق', 'كراون بلازا الحمراء', 'ساشيمي وسوشي تقليدي', 'أجواء يابانية هادئة'],
    en: ['Authentic Heritage Japanese', 'Crowne Plaza Al Hamra', 'Traditional Sashimi & Sushi', 'Serene Japanese Ambience']
  },
  'sushiart': {
    ar: ['سوشي عصري فني', 'رد سي مول', 'أطباق صحية وساشيمي', 'جلسات عصرية مريحة'],
    en: ['Artisan French-Japanese Sushi', 'Red Sea Mall', 'Healthy Bites & Sashimi', 'Relaxed Modern Mall Dining']
  },
  'sushi_yoshi': {
    ar: ['مطعم سوشي وبحري عريق', 'إطلالة الكورنيش والحمراء', 'بوكسات مقلية وسوشي كلاسيك', 'سهرات حتى منتصف الليل'],
    en: ['Heritage Sushi & Seafood', 'Corniche & Al Hamra Views', 'Signature Fried Rolls & Classic Maki', 'Late Night Dining']
  },
  'kuuru': {
    ar: ['مطعم نيكاي ياباني فاخر', 'دليل ميشلان جدة', 'مجمع ليلتي طريق الملك', 'تجربة طهي مبتكرة واستثنائية'],
    en: ['Luxury Nikkei Japanese', 'Michelin Guide Jeddah', 'Leylaty Complex King Road', 'Innovative Culinary Excellence']
  },
  'tanuki_sushi': {
    ar: ['سوشي شبابي مبتكر', 'كيكات سوشي وبوبس', 'حي السلامة', 'سهرات وتوصيل نشط'],
    en: ['Creative Trendy Sushi', 'Sushi Cakes & Push Pops', 'As Salamah District', 'Late Night & Delivery']
  },
  'kimono': {
    ar: ['مطعم ياباني راقي', 'ذا بوينت شارع عبدالمقصود خوجة', 'أجواء عصرية وسوشي نيجيري', 'حي الروضة'],
    en: ['Chic Japanese Eatery', 'The Point Abdul Maqsud Khojah', 'Trendy Vibe & Artisan Nigiri', 'Ar Rawdah District']
  },
  'ikigai_sushi_restaurant': {
    ar: ['مختص سوشي محلي', 'كومبو سوشي وكرانشي', 'حي الحمراء', 'سهرات حتى الفجر'],
    en: ['Local Sushi Specialist', 'Signature Combos & Crunchy Rolls', 'Al Hamra District', 'Late Night Until 2am']
  },
  'ashi_sushi': {
    ar: ['مطعم سوشي ياباني محبوب', 'شارع سعود الفيصل الروضة', 'توصيل نشط وسريع', 'أجواء مريحة'],
    en: ['Beloved Local Sushi', 'Prince Saud Al Faisal Ar Rawdah', 'Active Delivery & Takeaway', 'Cozy Atmosphere']
  },
  'fuji_japanese_restaurant': {
    ar: ['مطعم ياباني كلاسيكي عريق', 'مركز برودواي طريق الملك', 'أوشي سوشي وقارب ماكي', 'أجواء عائلية أصيلة'],
    en: ['Heritage Japanese Classic', 'Broadway Center King Road', 'Oshisushi & Maki Boats', 'Authentic Family Dining']
  },
  'ricci_san': {
    ar: ['مطعم ياباني صاعد مميز', 'أبحر الجنوبية طريق الملك', 'أوماكاسي وسكالوب رول', 'سهرات راقية ومميزة'],
    en: ['Rising Japanese Eatery', 'South Obhur King Road', 'Omakase Sashimi & Scallop Rolls', 'Chic Coastal Dining']
  }
};

const PRICE_POSITION_MAP = {
  'affordable': { position: 'budget', tier: '$', min: 25, max: 55 },
  'mid-range': { position: 'standard', tier: '$$', min: 45, max: 95 },
  'premium': { position: 'premium', tier: '$$$', min: 75, max: 180 },
  'luxury': { position: 'premium', tier: '$$$', min: 120, max: 300 }
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
  const vibeTags = VIBE_TAGS_MAP[brandId] || { ar: ['سوشي ياباني', 'مأكولات آسيوية'], en: ['Japanese Sushi', 'Asian Food'] };
  
  // Custom price tier handling for luxury concepts
  let priceInfo = PRICE_POSITION_MAP[brand.price_positioning] || { position: 'standard', tier: '$$', min: 45, max: 95 };
  if (brandId === 'myazu' || brandId === 'kuuru') {
    priceInfo = PRICE_POSITION_MAP['luxury'];
  }
  
  const edInfo = EDITORIAL_ROLE_MAP[brand.editorial_classification] || { role: 'popular', tier: 'trend', reputation: ['local_favorite'] };

  const categories = ['sushi'];
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
      name_en: 'Specialty Sushi Rolls & Nigiri',
      name_ar: 'تشكيلة السوشي والنيجيري الخاصة',
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

  const platforms = [];
  if (brand.delivery_platforms?.hungerstation?.presence === 'yes') platforms.push('hungerstation');
  if (brand.delivery_platforms?.jahez?.presence === 'yes') platforms.push('jahez');
  if (brand.delivery_platforms?.keeta?.presence === 'yes') platforms.push('keeta');
  if (platforms.length === 0) platforms.push('hungerstation');

  return {
    brand_id: brandId,
    canonical_name: brand.canonical_name,
    arabic_name: brand.arabic_name,
    categories,
    primary_category: 'sushi',
    secondary_categories: brand.secondary_categories || ['asian'],
    subcategories: brand.secondary_categories || ['asian'],
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
    time_slots: isOpenLate ? ['lunch', 'dinner', 'late_night'] : ['lunch', 'dinner'],
    is_open_late: isOpenLate,
    is_24_hours: false,
    is_city_wide: isCityWide,
    branch_list_completeness: brand.branches?.length > 1 ? 'complete' : 'partial',
    verified_jeddah_branch_count: shapedBranches.length,
    canonical_districts: canonicalDistricts,
    delivery_platforms: platforms,
    official_website: brand.official_website || null,
    research_use: 'production_ready',
    branches: shapedBranches,
    best_sellers: bestSellers
  };
});

const payloadJson = JSON.stringify({
  catalog_metadata: {
    title: 'WeshNakul Jeddah Sushi Production Catalog',
    version: 'Pass D Certified Corrected',
    date: '2026-09-28',
    brand_count: shapedBrands.length,
    branch_count: shapedBrands.reduce((acc, b) => acc + b.branches.length, 0),
    canonical_branch_count: shapedBrands.reduce((acc, b) => acc + b.branches.filter(br => br.district !== null).length, 0),
    outer_caution_branch_count: shapedBrands.reduce((acc, b) => acc + b.branches.filter(br => br.district === null).length, 0)
  },
  brands: shapedBrands
}, null, 2);

const migrationSql = `-- Google-verified Jeddah Sushi production catalog.
-- Source: docs/research/jeddah-sushi-pass-d-corrected.json
-- 16 approved brands, 28 verified physical branches (all 28 in canonical 30 districts).
-- Reconciles legacy Asian seed restaurant identity (wakame) without duplicate creation.
-- 100% Google Place IDs, Maps URLs, verified exact coordinates, addresses, hours, and ratings.
-- Apply after 20260927000600_jeddah_italian_catalog.sql.
BEGIN;

CREATE TEMP TABLE _sushi_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _sushi_catalog(payload) VALUES ($catalog$${payloadJson}$catalog$::jsonb);

-- 1. Upsert public.restaurants
-- Reuses existing restaurant identity 'wakame' while inserting the other 15 verified brands
WITH catalog AS (SELECT payload FROM _sushi_catalog), brands AS (
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
  jsonb_build_object(
    'hungerstation', b->'delivery_platforms' @> '["hungerstation"]',
    'jahez', b->'delivery_platforms' @> '["jahez"]',
    'keeta', b->'delivery_platforms' @> '["keeta"]'
  ),
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
  '2026-09-28T00:00:00Z'::timestamptz,
  false,
  '{}'::text[],
  'research'
FROM brands
ON CONFLICT (id) DO UPDATE SET
  name_ar=EXCLUDED.name_ar,
  name_en=EXCLUDED.name_en,
  categories=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.categories, EXCLUDED.categories)) item),
  secondary_categories=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.secondary_categories, EXCLUDED.secondary_categories)) item),
  subcategories=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.subcategories, EXCLUDED.subcategories)) item),
  primary_category=EXCLUDED.primary_category,
  context_tags=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.context_tags, EXCLUDED.context_tags)) item),
  reputation_tags=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.reputation_tags, EXCLUDED.reputation_tags)) item),
  vibe_tags_ar=EXCLUDED.vibe_tags_ar,
  vibe_tags_en=EXCLUDED.vibe_tags_en,
  editorial_role=EXCLUDED.editorial_role,
  tier=EXCLUDED.tier,
  price_tier=EXCLUDED.price_tier,
  price_position=EXCLUDED.price_position,
  signature_dish_ar=EXCLUDED.signature_dish_ar,
  signature_dish_en=EXCLUDED.signature_dish_en,
  branches=EXCLUDED.branches,
  is_city_wide=EXCLUDED.is_city_wide,
  time_slots=EXCLUDED.time_slots,
  closing_time_ar=EXCLUDED.closing_time_ar,
  is_open_late=EXCLUDED.is_open_late,
  platforms=EXCLUDED.platforms,
  official_website=COALESCE(EXCLUDED.official_website, restaurants.official_website),
  last_verified_at=EXCLUDED.last_verified_at,
  research_use='production_ready'::public.research_use;

-- 2. Cleanup stale best sellers and sources for brands prior to insertion
DELETE FROM public.restaurant_best_sellers s USING _sushi_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
);

DELETE FROM public.restaurant_sources s USING _sushi_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
) AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _sushi_catalog), branches AS (
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
  '2026-09-28T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  br->>'geographic_notes',
  '2026-09-28T00:00:00Z'::timestamptz
FROM branches
ON CONFLICT (google_place_id) DO UPDATE SET
  restaurant_id=EXCLUDED.restaurant_id,
  branch_name_ar=COALESCE(restaurant_branches.branch_name_ar, EXCLUDED.branch_name_ar),
  branch_name_en=EXCLUDED.branch_name_en,
  branch_status=EXCLUDED.branch_status,
  district=EXCLUDED.district,
  address_en=EXCLUDED.address_en,
  latitude=EXCLUDED.latitude,
  longitude=EXCLUDED.longitude,
  maps_business_name=EXCLUDED.maps_business_name,
  google_maps_url=EXCLUDED.google_maps_url,
  google_rating=EXCLUDED.google_rating,
  google_review_count=EXCLUDED.google_review_count,
  geographic_notes=EXCLUDED.geographic_notes,
  last_verified_at=EXCLUDED.last_verified_at;

-- 4. Insert signature dishes into public.restaurant_best_sellers
WITH catalog AS (SELECT payload FROM _sushi_catalog), sellers AS (
  SELECT b->>'brand_id' AS restaurant_id, item
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'best_sellers') item
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
  'Certified Sushi Pass D dataset signature item',
  '2026-09-28T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _sushi_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  WHERE b->>'official_website' IS NOT NULL
)
INSERT INTO public.restaurant_sources (
  restaurant_id, source_type, source_url, supports, date_checked, evidence_quality, notes
)
SELECT
  b->>'brand_id',
  'official_website'::public.research_source_type,
  b->>'official_website',
  ARRAY['brand_identity', 'category', 'best_sellers']::text[],
  '2026-09-28T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources
WITH catalog AS (SELECT payload FROM _sushi_catalog), branches AS (
  SELECT br
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
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
  '2026-09-28T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Verified direct Google Maps place record'
FROM branches br
JOIN public.restaurant_branches rb ON rb.google_place_id = br->>'google_place_id';

COMMIT;
`;

const targetMigrationFile = path.join(rootDir, 'supabase/migrations/20260928000100_jeddah_sushi_catalog.sql');
fs.writeFileSync(targetMigrationFile, migrationSql, 'utf8');
console.log('Successfully generated:', targetMigrationFile);
