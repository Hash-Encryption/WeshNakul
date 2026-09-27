import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourcePath = path.join(rootDir, 'docs/research/jeddah-grills-pass-d-corrected.json');
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
  'khayal_restaurant': {
    ar: ['مشاوي تركية فاخرة', 'أجواء عائلية راقية', 'إفطار ومشاوي', 'جلسات مميزة'],
    en: ['Luxury Turkish Grills', 'Fine Family Dining', 'Breakfast & Barbecue', 'Premium Ambience']
  },
  'ennabi_grill': {
    ar: ['مشاوي سعودية شهيرة', 'توصيل سريع وسفري', 'كباب حجازي وحلبي', 'جمعات وسهرات'],
    en: ['Saudi Grill Specialist', 'Fast Delivery & Takeaway', 'Hijazi & Halabi Kebab', 'Gatherings']
  },
  'kabebo': {
    ar: ['كباب حجازي أصيل', 'سريع وسفري', 'مبشور حجازي', 'أسعار اقتصادية'],
    en: ['Authentic Hijazi Kebab', 'Fast Casual', 'Hijazi Mabshoor', 'Value & Affordable']
  },
  'al_hamraa_barbecue_restaurant': {
    ar: ['مشاوي جمعات وبوفيهات', 'صحون عائلية مشكلة', 'توصيل سفري', 'سهرات'],
    en: ['Gathering & Event Grills', 'Family Mixed Trays', 'Takeaway & Delivery', 'Late Night']
  },
  'taksim_point_restaurant': {
    ar: ['مشاوي تركية على الواجهة', 'كباب أضنة مميز', 'جلسات كورنيش راقية', 'سهرات'],
    en: ['Waterfront Turkish Grills', 'Signature Adana Kebab', 'Scenic Seaside Dining', 'Late Night']
  },
  'al_fairouz_restaurant': {
    ar: ['مطعم تركي عريق من ١٩٨٦', 'مشاوي على الفحم', 'إسكندر كباب', 'عائلي وكلاسيك'],
    en: ['Heritage Turkish Since 1986', 'Charcoal Grills', 'Iskander Kebab', 'Family Classic']
  },
  'shami': {
    ar: ['مشاوي شامية عريقة', 'فحم طبيعي', 'فطور ومشاوي', 'أجواء عائلية'],
    en: ['Levantine Grill Heritage', 'Natural Charcoal', 'All-Day Dining', 'Family Ambience']
  },
  'skewers_grilled_restaurant': {
    ar: ['كباب إسطنبول السريع', 'سفري واقتصادي', 'مشاوي طازجة', 'سهرات'],
    en: ['Istanbul Kabab Skewers', 'Quick & Affordable', 'Fresh Charcoal Grills', 'Late Night']
  },
  'at_beirut_jeddah': {
    ar: ['مشاوي لبنانية أصيلة', 'شيش طاووق ومقبلات', 'توصيل قوي', 'سهرات'],
    en: ['Authentic Lebanese Grills', 'Shish Tawook & Mezza', 'Strong Delivery', 'Late Night']
  },
  'al_nakheel_restaurant': {
    ar: ['أيقونة الكورنيش الحجازية', 'مشاوي وأجواء بحرية', 'ريش وكفتة ضأن', 'سهرات كورنيش'],
    en: ['Corniche Landmark', 'Seaside Open-Air Dining', 'Lamb Chops & Kofta', 'Late Night Classic']
  },
  'shababik': {
    ar: ['لبناني فاخر وراقي', 'مشاوي فحم استثنائية', 'جلسات أنا سبيشال مول', 'أجواء أنيقة'],
    en: ['Upscale Lebanese Dining', 'Artisan Charcoal Grills', 'Ana Special Mall', 'Chic Ambience']
  },
  'burj_al_hamam': {
    ar: ['سلسلة لبنانية فاخرة', 'ريش وكباب وموزات', 'جلسات عائلية أنيقة', 'ضيافة راقية'],
    en: ['Luxury Lebanese Legend', 'Cutlets & Premium Kebabs', 'Elegant Family Dining', 'Fine Hospitality']
  },
  'saraya_latif': {
    ar: ['مشاوي تركية مختصة', 'كباب أضنة وأورفا', 'جلسات رايقة', 'سهرات'],
    en: ['Artisan Turkish Grills', 'Adana & Urfa Kebabs', 'Warm Hospitality', 'Late Night']
  },
  'yildizlar_restaurant': {
    ar: ['مطعم عريق وكلاسيك', 'مشاوي شرقية ومقبلات', 'أجواء تقليدية', 'جلسات هادئة'],
    en: ['Heritage Classic Restaurant', 'Middle Eastern Grills & Mezza', 'Traditional Charm', 'Quiet Dining']
  },
  'istanbul_grill_restaurant': {
    ar: ['مشاوي تركية سريعة', 'سفري واقتصادي', 'شارع حراء', 'سهرات'],
    en: ['Fast Turkish Grills', 'Budget & Quick Bite', 'Hira Street', 'Late Night Takeaway']
  }
};

const PRICE_POSITION_MAP = {
  'budget': { position: 'budget', tier: '$', min: 20, max: 40 },
  'affordable': { position: 'budget', tier: '$', min: 25, max: 50 },
  'mid_range': { position: 'standard', tier: '$$', min: 45, max: 85 },
  'mid_range_to_premium': { position: 'premium', tier: '$$$', min: 65, max: 130 },
  'premium': { position: 'premium', tier: '$$$', min: 80, max: 180 }
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
  const vibeTags = VIBE_TAGS_MAP[brandId] || { ar: ['مشاوي', 'كباب'], en: ['Grills', 'Kebab'] };
  const priceInfo = PRICE_POSITION_MAP[brand.price_positioning] || { position: 'standard', tier: '$$', min: 45, max: 85 };
  const edInfo = EDITORIAL_ROLE_MAP[brand.editorial_classification] || { role: 'popular', tier: 'trend', reputation: ['local_favorite'] };

  const categories = ['grills'];
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
      name_en: 'Mixed Grill',
      name_ar: 'مشاوي مشكلة',
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

  const distinctCanonicalDistricts = [...new Set(shapedBranches.map(b => b.district).filter(Boolean))].sort();
  const isCityWide = shapedBranches.length >= 5;
  const officialWebsite = (brand.source_urls && brand.source_urls[0] && brand.source_urls[0].startsWith('http') && !brand.source_urls[0].includes('google.com'))
    ? brand.source_urls[0]
    : null;

  return {
    brand_id: brandId,
    canonical_name: brand.canonical_name,
    arabic_name: brand.arabic_name,
    categories,
    primary_category: 'grills',
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
    context_tags: brand.context_tags || ['dine_in_strong'],
    time_slots: brand.meal_fit || ['lunch', 'dinner', 'late_night'],
    is_open_late: (brand.context_tags || []).includes('late_night') || (brand.meal_fit || []).includes('late_night'),
    is_24_hours: false,
    is_city_wide: isCityWide,
    branch_list_completeness: isCityWide ? 'complete' : 'partial',
    verified_jeddah_branch_count: shapedBranches.length,
    canonical_districts: distinctCanonicalDistricts,
    delivery_platforms: brand.delivery_presence || ['jahez', 'hungerstation'],
    official_website: officialWebsite,
    research_use: 'production_ready',
    branches: shapedBranches,
    best_sellers: bestSellers
  };
});

const catalogPayload = {
  catalog_metadata: {
    title: 'WeshNakul Jeddah Grills Production Catalog',
    version: 'Pass D Certified Corrected',
    date: '2026-09-27',
    brand_count: shapedBrands.length,
    branch_count: shapedBrands.reduce((acc, b) => acc + b.branches.length, 0),
    canonical_branch_count: shapedBrands.reduce((acc, b) => acc + b.branches.filter(br => br.district !== null).length, 0),
    outer_caution_branch_count: shapedBrands.reduce((acc, b) => acc + b.branches.filter(br => br.district === null).length, 0)
  },
  brands: shapedBrands
};

const migrationSql = `-- Google-verified Jeddah Grills production catalog.
-- Source: docs/research/jeddah-grills-pass-d-corrected.json
-- 15 approved brands, 43 verified physical branches (29 canonical, 14 outer-district caution branches).
-- Enriched with verified coordinates, Place IDs, addresses, and ratings directly from Google Places / Maps.
-- Reconciles legacy unverified placeholder seeds without altering Burger, Broast, Shawarma, Saudi Rice, or Pizza catalogs.
-- Apply after 20260927000100_jeddah_pizza_catalog.sql.
BEGIN;

-- 0. Clean legacy orphan placeholders if present without branches
DELETE FROM public.restaurants WHERE id = 'khayal' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'khayal'
);
DELETE FROM public.restaurants WHERE id = 'saruja_restaurants' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'saruja_restaurants'
);
DELETE FROM public.restaurants WHERE id = 'al_bait_al_halabi' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'al_bait_al_halabi'
);

CREATE TEMP TABLE _grills_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _grills_catalog(payload) VALUES ($catalog$${JSON.stringify(catalogPayload, null, 2)}$catalog$::jsonb);

DO $$
DECLARE
  p jsonb;
BEGIN
  SELECT payload INTO p FROM _grills_catalog;
  
  -- Verify brand count is exactly 15
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands')) <> 15 THEN
    RAISE EXCEPTION 'Grills catalog must contain exactly 15 brands';
  END IF;

  -- Verify branch count is exactly 43
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 43 THEN
    RAISE EXCEPTION 'Grills catalog must contain exactly 43 branches';
  END IF;

  -- Verify canonical branch count is 29
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NOT NULL) <> 29 THEN
    RAISE EXCEPTION 'Grills catalog must contain exactly 29 canonical branches';
  END IF;

  -- Verify outer caution branch count is 14
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NULL) <> 14 THEN
    RAISE EXCEPTION 'Grills catalog must contain exactly 14 caution branches';
  END IF;

  -- Verify all canonical branches exist in private.district_geography
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = br->>'district')
  ) THEN RAISE EXCEPTION 'Grills catalog contains an unknown canonical district'; END IF;

  -- Verify all caution branches have non-null geographic notes
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NULL AND (br->>'geographic_notes' IS NULL OR length(trim(br->>'geographic_notes')) = 0)
  ) THEN RAISE EXCEPTION 'Caution branch without geographic notes detected'; END IF;

  -- Verify no place ID belongs to another brand in the existing database
  IF EXISTS (
    SELECT 1 FROM public.restaurant_branches old
    JOIN jsonb_array_elements(p->'brands') brand ON true
    JOIN jsonb_array_elements(brand->'branches') br ON br->>'google_place_id' = old.google_place_id
    WHERE old.restaurant_id <> brand->>'brand_id'
  ) THEN RAISE EXCEPTION 'Google Place ID is already assigned to a different restaurant brand'; END IF;
END $$;

-- 1. Upsert public.restaurants
WITH catalog AS (SELECT payload FROM _grills_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
)
INSERT INTO public.restaurants (
  id, name_ar, name_en, categories, is_city_wide, branches, dining_mode, time_slots, closing_time_ar, is_open_late, is_24_hours,
  avg_prep_minutes, tier, price_tier, signature_dish_ar, signature_dish_en, vibe_tags_ar, vibe_tags_en, rating, platforms, links,
  city, primary_category, secondary_categories, subcategories, category_fit_confidence, category_fit_evidence, editorial_role,
  reputation_tags, context_tags, context_tag_evidence, business_type, operating_status, brand_status_confidence,
  verified_jeddah_branch_count, branch_list_completeness, meal_period_strength, serves_breakfast_menu, dining_mode_summary,
  price_position, estimated_sar_per_person_min, estimated_sar_per_person_max, official_website, trend_status, trend_confidence,
  overall_confidence, research_use, last_verified_at, menu_last_verified_at, manual_review_required, manual_review_reasons, intelligence_origin
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
  CASE WHEN (b->>'is_24_hours')::boolean THEN 'مفتوح 24 ساعة' ELSE 'يقفل 2:00 ص' END,
  (b->>'is_open_late')::boolean,
  (b->>'is_24_hours')::boolean,
  25,
  b->>'tier',
  b->>'price_tier',
  b->>'signature_dish_ar',
  b->>'signature_dish_en',
  ARRAY(SELECT jsonb_array_elements_text(b->'vibe_tags_ar')),
  ARRAY(SELECT jsonb_array_elements_text(b->'vibe_tags_en')),
  NULL,
  b->'delivery_platforms',
  jsonb_build_object('googleMaps', 'https://www.google.com/maps/search/?api=1&query=' || replace(b->>'canonical_name', ' ', '+') || '+Jeddah'),
  'jeddah',
  b->>'primary_category',
  ARRAY(SELECT jsonb_array_elements_text(b->'secondary_categories')),
  ARRAY(SELECT jsonb_array_elements_text(b->'subcategories')),
  'high'::public.intelligence_confidence,
  'Verified by first-party operational presence and Google Places branch inventory',
  (b->>'editorial_role')::public.editorial_role,
  ARRAY(SELECT jsonb_array_elements_text(b->'reputation_tags')),
  ARRAY(SELECT jsonb_array_elements_text(b->'context_tags')),
  NULL,
  'restaurant',
  'open',
  'high'::public.intelligence_confidence,
  (b->>'verified_jeddah_branch_count')::integer,
  b->>'branch_list_completeness',
  NULL,
  false,
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
  NULL,
  false,
  '{}'::text[],
  'research'
FROM brands
ON CONFLICT (id) DO UPDATE SET
  name_ar=EXCLUDED.name_ar,
  name_en=EXCLUDED.name_en,
  categories=EXCLUDED.categories,
  is_city_wide=EXCLUDED.is_city_wide,
  branches=EXCLUDED.branches,
  dining_mode=EXCLUDED.dining_mode,
  time_slots=EXCLUDED.time_slots,
  closing_time_ar=EXCLUDED.closing_time_ar,
  is_open_late=EXCLUDED.is_open_late,
  is_24_hours=EXCLUDED.is_24_hours,
  avg_prep_minutes=EXCLUDED.avg_prep_minutes,
  tier=EXCLUDED.tier,
  price_tier=EXCLUDED.price_tier,
  signature_dish_ar=EXCLUDED.signature_dish_ar,
  signature_dish_en=EXCLUDED.signature_dish_en,
  vibe_tags_ar=EXCLUDED.vibe_tags_ar,
  vibe_tags_en=EXCLUDED.vibe_tags_en,
  platforms=EXCLUDED.platforms,
  links=EXCLUDED.links,
  city=EXCLUDED.city,
  primary_category=EXCLUDED.primary_category,
  secondary_categories=EXCLUDED.secondary_categories,
  subcategories=EXCLUDED.subcategories,
  category_fit_confidence=EXCLUDED.category_fit_confidence,
  category_fit_evidence=EXCLUDED.category_fit_evidence,
  editorial_role=EXCLUDED.editorial_role,
  reputation_tags=EXCLUDED.reputation_tags,
  context_tags=EXCLUDED.context_tags,
  business_type=EXCLUDED.business_type,
  operating_status=EXCLUDED.operating_status,
  brand_status_confidence=EXCLUDED.brand_status_confidence,
  verified_jeddah_branch_count=EXCLUDED.verified_jeddah_branch_count,
  branch_list_completeness=EXCLUDED.branch_list_completeness,
  dining_mode_summary=EXCLUDED.dining_mode_summary,
  price_position=EXCLUDED.price_position,
  estimated_sar_per_person_min=EXCLUDED.estimated_sar_per_person_min,
  estimated_sar_per_person_max=EXCLUDED.estimated_sar_per_person_max,
  official_website=EXCLUDED.official_website,
  trend_status=EXCLUDED.trend_status,
  trend_confidence=EXCLUDED.trend_confidence,
  overall_confidence=EXCLUDED.overall_confidence,
  research_use=EXCLUDED.research_use,
  last_verified_at=EXCLUDED.last_verified_at,
  manual_review_required=EXCLUDED.manual_review_required,
  manual_review_reasons=EXCLUDED.manual_review_reasons,
  intelligence_origin=EXCLUDED.intelligence_origin;

-- 2. Cleanup stale best sellers and sources for these 15 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _grills_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _grills_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _grills_catalog), branches AS (
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
  branch_name_ar=EXCLUDED.branch_name_ar,
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

-- 4. Insert best sellers
WITH catalog AS (SELECT payload FROM _grills_catalog), sellers AS (
  SELECT b->>'brand_id' restaurant_id, item
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
  'Certified Grills Pass D dataset signature item',
  '2026-09-27T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _grills_catalog), brands AS (
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
  '2026-09-27T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources
WITH catalog AS (SELECT payload FROM _grills_catalog), branches AS (
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
  '2026-09-27T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Verified direct Google Maps place record'
FROM branches br
JOIN public.restaurant_branches rb ON rb.google_place_id = br->>'google_place_id';

COMMIT;
`;

const migrationPath = path.join(rootDir, 'supabase/migrations/20260927000200_jeddah_grills_catalog.sql');
fs.writeFileSync(migrationPath, migrationSql);
console.log('Migration generated successfully at:', migrationPath);

