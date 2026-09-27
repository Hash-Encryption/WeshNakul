import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourcePath = path.join(rootDir, 'docs/research/jeddah-shawarma-pass-d-corrected.json');
const dataset = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const coordsPath = path.join(rootDir, 'scripts/shawarma-google-coords.json');
const googleCoords = JSON.parse(fs.readFileSync(coordsPath, 'utf8'));

const BRAND_ID_MAP = {
  'Shawarmer': 'shawarmer',
  'Shawarma Classic': 'shawarma_classic',
  'Shawarma Alrimal': 'shawarma_alrimal',
  'Shamiyat Haritna': 'shamiyat_haritna',
  'Ayedh Shawarma': 'ayedh_shawarma',
  'Al-Khal Al-Dimashqi': 'al_khal_al_dimashqi',
  'Shawarma Habteen': 'shawarma_habteen',
  'Ziyada Toum': 'ziyada_toum',
  'Shawarma Elak': 'shawarma_elak',
  'Shawarma Shakir Aljazeera': 'shawarma_shakir_aljazeera',
  'Shawarma Abu Bahij': 'shawarma_abu_bahij',
  'Radi Shawarma and Juices': 'radi_shawarma',
  'Shawarma Allosh': 'shawarma_allosh',
  'Shawarma Marmasha': 'shawarma_marmasha'
};

const SIGNATURE_DISH_MAP = {
  'shawarmer': { ar: 'عربي شاورمر بالدجاج 🌯', en: 'Arabo Chicken Shawarma 🌯' },
  'shawarma_classic': { ar: 'شاورما كلاسك عربي 🌯', en: 'Shawarma Classic Arabi 🌯' },
  'shawarma_alrimal': { ar: 'شاورما دجاج مع الثوم 🌯', en: 'Chicken Shawarma with Garlic 🌯' },
  'shamiyat_haritna': { ar: 'شاورما شامية عربي بالثوم 🌯', en: 'Shami Arabic Shawarma with Garlic 🌯' },
  'ayedh_shawarma': { ar: 'شاورما دجاج عايض 🌯', en: 'Ayedh Chicken Shawarma 🌯' },
  'al_khal_al_dimashqi': { ar: 'شاورما دمشقية أصيلة على الفحم 🌯', en: 'Authentic Damascene Shawarma 🌯' },
  'shawarma_habteen': { ar: 'حبتين دجاج على الطريقة الشامية 🌯', en: 'Habteen Double Chicken Shawarma 🌯' },
  'ziyada_toum': { ar: 'شاورما دجاج ثوم زيادة 🌯', en: 'Extra-Garlic Chicken Shawarma 🌯' },
  'shawarma_elak': { ar: 'شاورما إلك عربي دجاج 🌯', en: 'Elak Arabic Chicken Shawarma 🌯' },
  'shawarma_shakir_aljazeera': { ar: 'شاورما لحم خلطة شاكر 🌯', en: 'Shakir Mixed Meat Shawarma 🌯' },
  'shawarma_abu_bahij': { ar: 'شاورما دجاج خاصة أبو بهيج 🌯', en: 'Abu Bahij Special Chicken Shawarma 🌯' },
  'radi_shawarma': { ar: 'شاورما راضي دجاج بالثوم 🌯', en: 'Radi Chicken Shawarma with Garlic 🌯' },
  'shawarma_allosh': { ar: 'شاورما علوش عربي بالثوم 🌯', en: 'Arabic Chicken Shawarma 🌯' },
  'shawarma_marmasha': { ar: 'شاورما مرمشة بالبلد 🌯', en: 'Marmasha Classic Balad Shawarma 🌯' }
};

const VIBE_TAGS_MAP = {
  'shawarmer': { ar: ['شاورما مبتكرة', 'عربي', 'سريع', 'سهرات'], en: ['Modern Shawarma', 'Arabi Box', 'Quick Bite', 'Late Night'] },
  'shawarma_classic': { ar: ['شاورما كلاسيك', 'فلكة', 'عربي', 'سريع'], en: ['Classic Shawarma', 'Falka', 'Arabi Box', 'Quick Bite'] },
  'shawarma_alrimal': { ar: ['قديم ومعروف', 'ثوم', 'سريع', 'أصيل'], en: ['Old-School Staple', 'Garlic Sauce', 'Quick Bite', 'Authentic'] },
  'shamiyat_haritna': { ar: ['شامي أصيل', 'جلسات شباب', 'ثوم زيادة'], en: ['Authentic Levantine', 'Casual Hangout', 'Extra Garlic'] },
  'ayedh_shawarma': { ar: ['ترند', 'ثوم', 'سريع', 'سهرات'], en: ['Trendy', 'Garlicky', 'Quick Bite', 'Late Night'] },
  'al_khal_al_dimashqi': { ar: ['دمشقي أصيل', 'فحم ونكهة', 'جلسات'], en: ['Authentic Damascus', 'Charcoal Flavor', 'Dine-In'] },
  'shawarma_habteen': { ar: ['حبتين', 'شامي', 'سريع', 'آخر الليل'], en: ['Double Wrap', 'Levant Style', 'Quick Bite', 'Late Night'] },
  'ziyada_toum': { ar: ['ثوم زيادة', 'لبناني', 'جلسات شباب'], en: ['Extra Garlic', 'Lebanese Style', 'Youth Hangout'] },
  'shawarma_elak': { ar: ['شامي', 'سريع', 'آخر الليل'], en: ['Levant Style', 'Quick Bite', 'Late Night'] },
  'shawarma_shakir_aljazeera': { ar: ['أسطورة جدة', 'لحم بلدي', 'خلطة شاكر'], en: ['Jeddah Legend', 'Fresh Meat', 'Shakir Signature Mix'] },
  'shawarma_abu_bahij': { ar: ['شاورما خاصة', 'خلطات مميزة', 'سريع'], en: ['Special Shawarma', 'Signature Dips', 'Quick Bite'] },
  'radi_shawarma': { ar: ['أسطورة شعبية', 'شاورما وعصير', 'قديم ومعروف'], en: ['Popular Legend', 'Shawarma & Juice', 'Classic Jeddah Staple'] },
  'shawarma_allosh': { ar: ['شامي أصيل', 'ثوم زيادة', 'سهرات'], en: ['Levant Style', 'Extra Garlic', 'Late Night'] },
  'shawarma_marmasha': { ar: ['تاريخي بالبلد', 'شاورما أصيلة', 'نكهة زمان'], en: ['Historic Balad', 'Authentic Shawarma', 'Old School Flavor'] }
};

const PRICE_POSITION_MAP = {
  'budget': { position: 'budget', tier: '$', min: 10, max: 24 },
  'budget_to_affordable': { position: 'budget', tier: '$', min: 12, max: 28 },
  'affordable': { position: 'budget', tier: '$', min: 14, max: 32 },
  'affordable_to_mid': { position: 'standard', tier: '$$', min: 18, max: 38 },
  'mid_range': { position: 'standard', tier: '$$', min: 22, max: 45 }
};

const EDITORIAL_ROLE_MAP = {
  'staple': { role: 'staple', tier: 'staple', reputation: ['jeddah_staple'] },
  'mainstream': { role: 'popular', tier: 'trend', reputation: ['mainstream'] },
  'local_favorite': { role: 'popular', tier: 'trend', reputation: ['local_favorite'] },
  'rising': { role: 'popular', tier: 'trend', reputation: ['rising'] },
  'hidden_gem': { role: 'discovery', tier: 'trend', reputation: ['hidden_gem'] }
};

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

const DISTRICT_ALIAS_MAP = {
  'al_fayha': 'al_faiha',
  'as_salamah': 'al_salamah',
  'ash_shati': 'al_shati',
  'as_safa': 'al_safa',
  'ar_ruwais': 'al_ruwais',
  'ar_rawdah': 'al_rawdah',
  'obhur_al_shamaliyah': 'abhur_al_shamaliyah'
};

const NON_CANONICAL_NOTES = {
  'al_rabi': 'Branch verified in Al Rabi (outer east corridor along Al Haramain Rd), outside the 30-district canonical urban whitelist; stored with district = null.',
  'taiba': 'Branch verified in Taiba (far north Jeddah suburb, ~30km north), outside the 30-district canonical urban whitelist; stored with district = null.',
  'al_sanabel': 'Branch verified in Al Sanabel (outer south Jeddah, ~25km south of central core), outside the 30-district canonical urban whitelist; stored with district = null.',
  'umm_al_qoura': 'Branch verified on Umm Al Qoura St corridor, stored with district = null per non-canonical slug in certified source.',
  'mishrifah': 'Branch verified in Mishrifah (historic central district outside the 30-district canonical urban whitelist); stored with district = null.',
  'al_amir_fawaz_al_janouby': 'Branch verified in Prince Fawaz South (outer south-east Jeddah residential sector), outside the 30-district canonical urban whitelist; stored with district = null.'
};

const shapedBrands = dataset.brands.map(brand => {
  const brandId = BRAND_ID_MAP[brand.canonical_name_en];
  if (!brandId) throw new Error(`Unknown brand canonical name: ${brand.canonical_name_en}`);

  const sigDish = SIGNATURE_DISH_MAP[brandId] || {
    ar: brand.signature_items[0] || 'شاورما دجاج 🌯',
    en: brand.signature_items[0] || 'Chicken Shawarma 🌯'
  };
  const vibeTags = VIBE_TAGS_MAP[brandId] || { ar: ['شاورما', 'سريع'], en: ['Shawarma', 'Quick Bite'] };
  const priceInfo = PRICE_POSITION_MAP[brand.price_positioning] || { position: 'budget', tier: '$', min: 14, max: 30 };
  const edInfo = EDITORIAL_ROLE_MAP[brand.editorial_classification] || { role: 'popular', tier: 'trend', reputation: ['local_favorite'] };

  const isRising = brand.editorial_classification === 'rising' || (brand.context_tags || []).includes('rising');
  const isTrending = (brand.context_tags || []).includes('trending');
  const reputationTags = [...edInfo.reputation];
  if (isTrending && !reputationTags.includes('trending')) reputationTags.push('trending');

  const trendStatus = isTrending ? 'trending' : (isRising ? 'rising' : 'none');
  const trendConfidence = (isTrending || isRising) ? 'high' : 'unknown';

  const categories = ['shawarma'];
  if (brand.secondary_categories && brand.secondary_categories.length > 0) {
    for (const sc of brand.secondary_categories) {
      if (!categories.includes(sc)) categories.push(sc);
    }
  }

  // Map branches and resolve districts
  const shapedBranches = (brand.production_branches || []).map(br => {
    const rawDist = br.canonical_district;
    const resolvedDist = DISTRICT_ALIAS_MAP[rawDist] || rawDist;
    const isCanonical = CANONICAL_30.has(resolvedDist);

    const district = isCanonical ? resolvedDist : null;
    const geographicNotes = isCanonical ? null : (NON_CANONICAL_NOTES[rawDist] || `Branch verified outside 30-district whitelist in ${rawDist}; stored with district = null.`);
    const prodStatus = isCanonical ? 'production_ready' : 'usable_with_caution';

    const coords = googleCoords[br.google_place_id];
    if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
      throw new Error(`Missing verified Google coordinates for place ID ${br.google_place_id}`);
    }

    const branchType = br.branch_name.toLowerCase().includes('mall') ? 'mall_foodcourt' : 'unknown';

    return {
      restaurant_id: brandId,
      branch_name_en: br.branch_name,
      branch_name_ar: null,
      branch_type: branchType,
      district,
      address_en: br.address,
      latitude: coords.latitude,
      longitude: coords.longitude,
      maps_business_name: brand.canonical_name_en,
      google_place_id: br.google_place_id,
      google_maps_url: br.google_maps_url,
      google_rating: br.google_rating,
      google_review_count: br.google_review_count,
      operating_status: br.operating_status,
      geographic_notes: geographicNotes,
      production_branch_status: prodStatus
    };
  });

  const distinctCanonicalDistricts = [...new Set(shapedBranches.map(b => b.district).filter(Boolean))].sort();

  const bestSellers = (brand.signature_items && brand.signature_items.length > 0)
    ? brand.signature_items.map((dish, idx) => ({
        name_en: dish,
        name_ar: idx === 0 ? sigDish.ar : null,
        is_signature: idx === 0,
        sort_order: idx
      }))
    : [{
        name_en: sigDish.en,
        name_ar: sigDish.ar,
        is_signature: true,
        sort_order: 0
      }];

  const deliveryPlatforms = {
    hungerstation: (brand.brand_sources || []).some(s => s.includes('hungerstation')),
    jahez: (brand.brand_sources || []).some(s => s.includes('jahez')),
    keeta: (brand.brand_sources || []).some(s => s.includes('keeta'))
  };

  const isCityWide = shapedBranches.length >= 5;

  return {
    brand_id: brandId,
    canonical_name: brand.canonical_name_en,
    arabic_name: brand.canonical_name_ar,
    categories,
    primary_category: 'shawarma',
    secondary_categories: brand.secondary_categories || [],
    subcategories: brand.secondary_categories || [],
    editorial_role: edInfo.role,
    tier: edInfo.tier,
    price_position: priceInfo.position,
    price_tier: priceInfo.tier,
    estimated_spend_min_sar: priceInfo.min,
    estimated_spend_max_sar: priceInfo.max,
    signature_dish_ar: sigDish.ar,
    signature_dish_en: sigDish.en,
    vibe_tags_ar: vibeTags.ar,
    vibe_tags_en: vibeTags.en,
    reputation_tags: reputationTags,
    context_tags: brand.context_tags || [],
    time_slots: brand.meal_fit || ['lunch', 'dinner', 'late_night'],
    is_open_late: (brand.context_tags || []).includes('late_night') || (brand.meal_fit || []).includes('late_night'),
    is_24_hours: false,
    is_city_wide: isCityWide,
    branch_list_completeness: brandId === 'shawarmer' ? 'partial' : 'complete',
    verified_jeddah_branch_count: shapedBranches.length,
    canonical_districts: distinctCanonicalDistricts,
    official_website: (brand.brand_sources && brand.brand_sources[0] && brand.brand_sources[0].startsWith('http')) ? brand.brand_sources[0] : null,
    trend_status: trendStatus,
    trend_confidence: trendConfidence,
    best_sellers: bestSellers,
    delivery_platforms: deliveryPlatforms,
    branches: shapedBranches
  };
});

const allBranches = shapedBrands.flatMap(b => b.branches);
console.log(`Shaped ${shapedBrands.length} Shawarma brands, ${allBranches.length} branches.`);

const payload = {
  catalog_metadata: {
    title: 'WeshNakul Jeddah Shawarma Production Catalog',
    version: 'Pass D Certified Corrected',
    date: '2026-09-26',
    brand_count: shapedBrands.length,
    branch_count: allBranches.length
  },
  brands: shapedBrands
};

const migrationSql = `-- Google-verified Jeddah Shawarma production catalog.
-- Source: docs/research/jeddah-shawarma-pass-d-corrected.json
-- 14 approved brands, 48 verified physical branches (40 canonical, 8 outer-district caution branches).
-- Enriched with verified coordinates directly from Google Places API (New) for all 48 unique Google Place IDs.
-- Reconciles legacy unverified placeholder seeds without altering Burger or Broast catalogs.
-- Apply after 20260926000200_jeddah_broast_fried_chicken_catalog.sql.
BEGIN;

-- 0. Reconcile legacy orphan placeholder 'shawerma_alrimal' (with typo ID) if present without branches
DELETE FROM public.restaurants WHERE id = 'shawerma_alrimal' AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_branches WHERE restaurant_id = 'shawerma_alrimal'
);

CREATE TEMP TABLE _shawarma_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _shawarma_catalog(payload) VALUES ($catalog$${JSON.stringify(payload, null, 2)}$catalog$::jsonb);

DO $$
DECLARE p jsonb := (SELECT payload FROM _shawarma_catalog);
BEGIN
  -- Verify total brands count = 14
  IF jsonb_array_length(p->'brands') <> 14 THEN
    RAISE EXCEPTION 'Shawarma catalog must contain exactly 14 brands';
  END IF;
  IF (SELECT count(DISTINCT b->>'brand_id') FROM jsonb_array_elements(p->'brands') b) <> 14 THEN
    RAISE EXCEPTION 'Duplicate shawarma brand IDs';
  END IF;

  -- Verify total branches count = 48
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 48 THEN
    RAISE EXCEPTION 'Shawarma catalog must contain exactly 48 physical branches';
  END IF;

  -- Verify place IDs and maps URLs are unique and present
  IF (SELECT count(DISTINCT br->>'google_place_id') FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 48 THEN
    RAISE EXCEPTION 'Duplicate or missing Google Place IDs in shawarma branches';
  END IF;
  IF (SELECT count(DISTINCT br->>'google_maps_url') FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 48 THEN
    RAISE EXCEPTION 'Duplicate or missing Google Maps URLs in shawarma branches';
  END IF;

  -- Verify all branches have non-null coordinates, addresses, maps URLs, and valid operating status
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'latitude' IS NULL OR br->>'longitude' IS NULL
       OR br->>'address_en' IS NULL
       OR br->>'operating_status' <> 'open'
  ) THEN RAISE EXCEPTION 'Incomplete branch record detected in shawarma payload'; END IF;

  -- Verify non-null canonical districts reference valid geography rows in private.district_geography
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = br->>'district')
  ) THEN RAISE EXCEPTION 'Shawarma catalog contains an unknown canonical district'; END IF;

  -- Verify exactly 8 branches outside 30-district canonical whitelist have null district and non-null geographic notes
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NULL) <> 8 THEN
    RAISE EXCEPTION 'Shawarma catalog must contain exactly 8 caution branches with null district';
  END IF;

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
WITH catalog AS (SELECT payload FROM _shawarma_catalog), brands AS (
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
  CASE WHEN (b->>'is_24_hours')::boolean THEN 'مفتوح 24 ساعة' ELSE 'يقفل 3:00 ص' END,
  (b->>'is_open_late')::boolean,
  (b->>'is_24_hours')::boolean,
  15,
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
  (b->>'trend_status')::public.trend_status,
  (b->>'trend_confidence')::public.intelligence_confidence,
  'high'::public.intelligence_confidence,
  'production_ready'::public.research_use,
  '2026-09-25T00:00:00Z'::timestamptz,
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

-- 2. Cleanup stale best sellers and sources for these 14 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _shawarma_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _shawarma_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _shawarma_catalog), branches AS (
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
  '2026-09-25T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  br->>'geographic_notes',
  '2026-09-25T00:00:00Z'::timestamptz
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
WITH catalog AS (SELECT payload FROM _shawarma_catalog), sellers AS (
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
  'Certified Shawarma Pass D dataset signature item',
  '2026-09-25T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _shawarma_catalog), brands AS (
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
  '2026-09-25T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources
WITH catalog AS (SELECT payload FROM _shawarma_catalog), branches AS (
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
  '2026-09-25T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Verified direct Google Maps place record'
FROM branches br
JOIN public.restaurant_branches rb ON rb.google_place_id = br->>'google_place_id';

COMMIT;
`;

const outputPath = path.join(rootDir, 'supabase/migrations/20260926000300_jeddah_shawarma_catalog.sql');
fs.writeFileSync(outputPath, migrationSql, 'utf8');
console.log(`Generated migration written to ${outputPath} (${migrationSql.length} bytes).`);
