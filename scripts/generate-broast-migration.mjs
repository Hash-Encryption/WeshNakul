import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourcePath = path.join(rootDir, 'docs/research/jeddah-broast-pass-d-corrected.json');
const dataset = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const BRAND_ID_MAP = {
  "ALBAIK": "albaik",
  "Raising Cane's": "raising_canes",
  "KFC": "kfc",
  "Texas Chicken": "texas_chicken",
  "Popeyes": "popeyes",
  "Dave's Hot Chicken": "daves_hot_chicken",
  "TNDR": "tndr",
  "Wingstop": "wingstop",
  "Crusted": "crusted",
  "Crisper": "crisper",
  "Dabboos": "dabboos",
  "Sayakh": "sayakh",
  "Nashville's Hot Chicken": "nashvilles_hot_chicken",
  "Tenders Cart": "tenders_cart",
  "Rami Broast": "rami_broast",
  "Chicken Mubeen": "chicken_mubeen",
  "Ktaykit": "ktaykit",
  "Al Najah Broast": "al_najah_broast",
  "Broast Hanoo": "broast_hanoo"
};

// Signature dish mapping for rich bilingual display
const SIGNATURE_DISH_MAP = {
  "albaik": { ar: "وجبة دجاج مسحب حراق 🍗", en: "Spicy Chicken Musahab Meal 🍗" },
  "raising_canes": { ar: "وجبة بوكس كومبو (أصابع دجاج وصوص كينز)", en: "Box Combo (Chicken Fingers & Cane's Sauce)" },
  "kfc": { ar: "دجاج مقلي الخلطة السرية 🍗", en: "Original Recipe Fried Chicken 🍗" },
  "texas_chicken": { ar: "دجاج مقلي حراق وبسكويت العسل بالزبدة", en: "Spicy Fried Chicken & Honey-Butter Biscuits" },
  "popeyes": { ar: "دجاج لويزيانا المقلي الحار وبطاطس كاجون", en: "Spicy Louisiana Fried Chicken & Cajun Fries" },
  "daves_hot_chicken": { ar: "سلايدرز وتندرز ناشفيل الحارة 🌶️", en: "Nashville Hot Chicken Sliders & Tenders 🌶️" },
  "tndr": { ar: "تندرز كرسبي مقرمشة مع الصوص الخاص", en: "Crispy Tenders & Secret Dip" },
  "wingstop": { ar: "أجنحة دجاج مقلية بتتبيلات متنوعة", en: "Classic Tossed Wings (Mango Habanero / Garlic Parm)" },
  "crusted": { ar: "ستربس دجاج مقلية فائقة القرمشة", en: "Ultra-Crispy Fried Chicken Strips" },
  "crisper": { ar: "بروست كرسبر الحراق المقرمش 🍗", en: "Crisper Spicy Broast 🍗" },
  "dabboos": { ar: "دجاج دبوس مقلي حراق ومقرمش", en: "Dabboos Spicy Fried Chicken" },
  "sayakh": { ar: "أسياخ وتندرز دجاج مقلي مقرمش", en: "Sayakh Signature Fried Skewers & Tenders" },
  "nashvilles_hot_chicken": { ar: "سلايدر دجاج ناشفيل حار أصلي 🌶️", en: "Authentic Nashville Hot Chicken Slider 🌶️" },
  "tenders_cart": { ar: "بوكس بطاطس وتندرز مغطى بالصوصات", en: "Loaded Tenders Fries Box" },
  "rami_broast": { ar: "بروست دجاج حراق تقليدي 🍗", en: "Classic Spicy Broast Chicken 🍗" },
  "chicken_mubeen": { ar: "بروست حراق بالثوم والبهارات 🍗", en: "Spicy Broasted Chicken with Garlic 🍗" },
  "ktaykit": { ar: "بروست كتاكيت حراق مقرمش 🍗", en: "Traditional Spicy Broast Chicken 🍗" },
  "al_najah_broast": { ar: "بروست النجاح الكلاسيكي بالثوم 🍗", en: "Old-School Jeddah Broast with Garlic 🍗" },
  "broast_hanoo": { ar: "بروست هنو التاريخي المقرمش بالبلد", en: "Historic Balad Crispy Broast Chicken" }
};

const VIBE_TAGS_MAP = {
  "albaik": { ar: ["أسطورة جدة", "ثوم", "سريع"], en: ["Jeddah Icon", "Garlic Sauce", "Quick Bite"] },
  "raising_canes": { ar: ["صوص كينز", "تندرز طازجة", "أمريكي"], en: ["Cane's Sauce", "Fresh Tenders", "American Style"] },
  "kfc": { ar: ["خلطة سرية", "عالمي", "سريع"], en: ["Secret Recipe", "Global Chain", "Quick Bite"] },
  "texas_chicken": { ar: ["بسكويت عسل", "حراق", "مقرمش"], en: ["Honey Biscuits", "Spicy", "Crispy"] },
  "popeyes": { ar: ["نكهة لويزيانا", "كاجون", "قرمشة"], en: ["Louisiana Flavor", "Cajun", "Crunchy"] },
  "daves_hot_chicken": { ar: ["ناشفيل حار", "ترند عالمي", "سبايسي"], en: ["Nashville Heat", "Global Trend", "Spicy Sliders"] },
  "tndr": { ar: ["ترند شبابي", "تندرز", "صوصات"], en: ["Trendy", "Tenders", "Signature Dips"] },
  "wingstop": { ar: ["أجنحة دجاج", "نكهات حارة", "سهرات"], en: ["Chicken Wings", "Bold Flavors", "Late Night"] },
  "crusted": { ar: ["قرمشة استثنائية", "ستربس", "محلي"], en: ["Extra Crunch", "Strips", "Local Favorite"] },
  "crisper": { ar: ["قرمشة عالية", "حراق", "آخر الليل"], en: ["Ultra Crispy", "Spicy", "Late Night"] },
  "dabboos": { ar: ["حراق", "دبوس مقلي", "سريع"], en: ["Spicy", "Crispy Drumsticks", "Quick Bite"] },
  "sayakh": { ar: ["أسياخ مقلية", "سريع", "ترند"], en: ["Fried Skewers", "Quick Bite", "Casual"] },
  "nashvilles_hot_chicken": { ar: ["ناشفيل أصلي", "حرارة عالية", "سلايدرز"], en: ["Authentic Nashville", "High Heat", "Sliders"] },
  "tenders_cart": { ar: ["تندرز وبطاطس", "سريع", "صوصات"], en: ["Tenders & Fries", "Quick Bite", "Loaded Sauces"] },
  "rami_broast": { ar: ["قديم ومعروف", "حراق", "ثوم أصلي"], en: ["Local Staple", "Spicy", "Classic Garlic"] },
  "chicken_mubeen": { ar: ["بروست شعبي", "حراق", "سعره ممتاز"], en: ["Popular Broast", "Spicy", "Great Value"] },
  "ktaykit": { ar: ["بروست كلاسيك", "فروع متعددة", "سريع"], en: ["Classic Broast", "Multi Branch", "Quick Bite"] },
  "al_najah_broast": { ar: ["قديم ومعروف", "بروست بالثوم", "محلي"], en: ["Old-School", "Garlicky Broast", "Local Classic"] },
  "broast_hanoo": { ar: ["تاريخي بالبلد", "بروست أصلي", "أصيل"], en: ["Historic Balad", "Authentic Broast", "Heritage"] }
};

const PRICE_POSITION_MAP = {
  "budget_affordable": { position: "budget", tier: "$", min: 15, max: 32 },
  "affordable": { position: "budget", tier: "$", min: 18, max: 38 },
  "mid_range": { position: "standard", tier: "$$", min: 28, max: 65 }
};

const EDITORIAL_ROLE_MAP = {
  "staple": { role: "staple", tier: "staple", reputation: ["jeddah_staple"] },
  "mainstream": { role: "popular", tier: "trend", reputation: ["mainstream"] },
  "local_favorite": { role: "popular", tier: "trend", reputation: ["local_favorite"] },
  "rising": { role: "popular", tier: "trend", reputation: ["rising"] },
  "hidden_gem": { role: "discovery", tier: "trend", reputation: ["hidden_gem"] }
};

// Shape the structured JSON for the migration payload
const shapedBrands = dataset.brands.map(brand => {
  const brandId = BRAND_ID_MAP[brand.canonical_name];
  if (!brandId) throw new Error(`Unknown brand canonical name: ${brand.canonical_name}`);

  const sigDish = SIGNATURE_DISH_MAP[brandId] || { ar: brand.signature_dishes[0] || "", en: brand.signature_dishes[0] || "" };
  const vibeTags = VIBE_TAGS_MAP[brandId] || { ar: ["بروست", "سريع"], en: ["Broast", "Quick Bite"] };
  const priceInfo = PRICE_POSITION_MAP[brand.price_positioning] || { position: "budget", tier: "$", min: 18, max: 35 };
  const edInfo = EDITORIAL_ROLE_MAP[brand.editorial_classification] || { role: "popular", tier: "trend", reputation: ["local_favorite"] };

  const isRising = brand.editorial_classification === "rising" || (brand.context_tags || []).includes("rising");
  const isTrending = (brand.context_tags || []).includes("trending");
  const reputationTags = [...edInfo.reputation];
  if (isTrending && !reputationTags.includes("trending")) reputationTags.push("trending");

  const trendStatus = isTrending ? "trending" : (isRising ? "rising" : "none");
  const trendConfidence = (isTrending || isRising) ? "high" : "unknown";

  const categories = brandId === "albaik" 
    ? ["broast", "fried_chicken", "burger", "seafood"]
    : ["broast", "fried_chicken"];

  // Distinct verified canonical districts
  const distinctDistricts = [...new Set(brand.branches.map(b => b.canonical_district).filter(Boolean))].sort();

  return {
    brand_id: brandId,
    canonical_name: brand.canonical_name,
    arabic_name: brand.arabic_name,
    categories,
    primary_category: "broast",
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
    time_slots: brand.meal_fit || ["lunch", "dinner", "late_night"],
    is_open_late: (brand.context_tags || []).includes("late_night") || (brand.meal_fit || []).includes("late_night"),
    is_24_hours: brand.branches.some(b => b.hours && b.hours.toLowerCase().includes("24 hours")),
    is_city_wide: Boolean(brand.is_city_wide),
    branch_list_completeness: brand.branch_list_complete ? "complete" : "partial",
    verified_jeddah_branch_count: brand.branches.length,
    canonical_districts: distinctDistricts,
    official_website: (brand.sources && brand.sources[0]) ? brand.sources[0] : null,
    trend_status: trendStatus,
    trend_confidence: trendConfidence,
    best_sellers: brand.signature_dishes.map((dish, idx) => ({
      name_en: dish,
      name_ar: idx === 0 ? sigDish.ar : null,
      is_signature: idx === 0,
      sort_order: idx
    })),
    delivery_platforms: {
      hungerstation: brand.delivery_platform_presence?.hungerstation?.presence === "yes",
      jahez: brand.delivery_platform_presence?.jahez?.presence === "yes",
      keeta: brand.delivery_platform_presence?.keeta?.presence === "yes"
    },
    branches: brand.branches.map(br => ({
      restaurant_id: brandId,
      branch_name_en: br.branch_name,
      branch_name_ar: null,
      branch_type: br.branch_name.includes("Airport") ? "airport" : "unknown",
      district: br.canonical_district,
      address_en: br.formatted_address,
      latitude: br.latitude,
      longitude: br.longitude,
      maps_business_name: brand.canonical_name,
      google_place_id: br.google_place_id,
      google_maps_url: br.google_maps_url,
      google_rating: br.google_rating,
      google_review_count: br.google_review_count,
      operating_status: br.operating_status,
      geographic_notes: br.manual_review_reason,
      production_branch_status: br.production_branch_status
    }))
  };
});

const allBranches = shapedBrands.flatMap(b => b.branches);

console.log(`Shaped ${shapedBrands.length} brands, ${allBranches.length} branches.`);

const payload = {
  catalog_metadata: {
    title: "WeshNakul Jeddah Broast & Fried Chicken Production Catalog",
    version: "Pass D Certified",
    date: "2026-09-26",
    brand_count: shapedBrands.length,
    branch_count: allBranches.length
  },
  brands: shapedBrands
};

const migrationSql = `-- Google-verified Jeddah Broast / Fried Chicken catalog.
-- Source: docs/research/jeddah-broast-pass-d-corrected.json
-- 19 approved brands, 75 verified physical branches (71 production_ready, 4 usable_with_caution).
-- Apply after 20260926000100_expand_jeddah_geography_30_districts.sql.
BEGIN;

CREATE TEMP TABLE _broast_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _broast_catalog(payload) VALUES ($catalog$${JSON.stringify(payload, null, 2)}$catalog$::jsonb);

DO $$
DECLARE p jsonb := (SELECT payload FROM _broast_catalog);
BEGIN
  IF jsonb_array_length(p->'brands') <> 19 THEN RAISE EXCEPTION 'Broast catalog must contain 19 brands'; END IF;
  IF (SELECT count(DISTINCT b->>'brand_id') FROM jsonb_array_elements(p->'brands') b) <> 19 THEN RAISE EXCEPTION 'Duplicate broast brand IDs'; END IF;
  
  -- Verify total branches count = 75
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 75 THEN
    RAISE EXCEPTION 'Broast catalog must contain exactly 75 physical branches';
  END IF;

  -- Verify place IDs and maps URLs are unique and present
  IF (SELECT count(DISTINCT br->>'google_place_id') FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 75 THEN
    RAISE EXCEPTION 'Duplicate or missing Google Place IDs in broast branches';
  END IF;
  IF (SELECT count(DISTINCT br->>'google_maps_url') FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br) <> 75 THEN
    RAISE EXCEPTION 'Duplicate or missing Google Maps URLs in broast branches';
  END IF;

  -- Verify all branches have non-null coordinates and valid operating status
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'latitude' IS NULL OR br->>'longitude' IS NULL
       OR br->>'address_en' IS NULL
       OR br->>'operating_status' <> 'open'
       OR br->>'google_rating' IS NULL OR br->>'google_review_count' IS NULL
  ) THEN RAISE EXCEPTION 'Incomplete branch record detected in broast payload'; END IF;

  -- Verify non-null canonical districts reference valid geography rows in private.district_geography
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
    WHERE br->>'district' IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = br->>'district')
  ) THEN RAISE EXCEPTION 'Broast catalog contains an unknown canonical district'; END IF;

  -- Verify caution branches have null district and non-null geographic notes
  IF (SELECT count(*) FROM jsonb_array_elements(p->'brands') b CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br WHERE br->>'district' IS NULL) <> 4 THEN
    RAISE EXCEPTION 'Broast catalog must contain exactly 4 caution branches with null district';
  END IF;

  -- Verify no place ID belongs to another brand in the existing database
  IF EXISTS (
    SELECT 1 FROM public.restaurant_branches old
    JOIN jsonb_array_elements(p->'brands') brand ON true
    JOIN jsonb_array_elements(brand->'branches') br ON br->>'google_place_id' = old.google_place_id
    WHERE old.restaurant_id <> brand->>'brand_id'
  ) THEN RAISE EXCEPTION 'Google Place ID is already assigned to a different restaurant brand'; END IF;
END $$;

-- 1. Upsert public.restaurants
WITH catalog AS (SELECT payload FROM _broast_catalog), brands AS (
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
  18,
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
  '2026-09-26T00:00:00Z'::timestamptz,
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
  context_tag_evidence=EXCLUDED.context_tag_evidence,
  business_type=EXCLUDED.business_type,
  operating_status=EXCLUDED.operating_status,
  brand_status_confidence=EXCLUDED.brand_status_confidence,
  verified_jeddah_branch_count=EXCLUDED.verified_jeddah_branch_count,
  branch_list_completeness=EXCLUDED.branch_list_completeness,
  meal_period_strength=EXCLUDED.meal_period_strength,
  serves_breakfast_menu=EXCLUDED.serves_breakfast_menu,
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

-- 2. Cleanup stale best sellers and sources for these 19 brands prior to re-insertion
DELETE FROM public.restaurant_best_sellers s USING _broast_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b);

DELETE FROM public.restaurant_sources s USING _broast_catalog c
WHERE s.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b)
  AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _broast_catalog), branches AS (
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
  '2026-09-26T00:00:00Z'::timestamptz,
  'high'::public.intelligence_confidence,
  br->>'geographic_notes',
  '2026-09-26T00:00:00Z'::timestamptz
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
WITH catalog AS (SELECT payload FROM _broast_catalog), sellers AS (
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
  'Certified Broast V3 dataset signature item',
  '2026-09-26T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _broast_catalog), brands AS (
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
  '2026-09-26T00:00:00Z'::timestamptz,
  'primary'::public.evidence_quality,
  'Official brand online presence'
FROM brands;

-- 6. Insert branch Google Maps sources
WITH catalog AS (SELECT payload FROM _broast_catalog), branches AS (
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
  '2026-09-26T00:00:00Z'::timestamptz,
  'strong_secondary'::public.evidence_quality,
  'Verified Google Places physical branch listing'
FROM branches br
JOIN public.restaurant_branches rb ON rb.google_place_id = br->>'google_place_id';

-- 7. Post-flight verification assertions
DO $$
DECLARE
  p jsonb := (SELECT payload FROM _broast_catalog);
  v_brand_count integer;
  v_branch_count integer;
  v_caution_count integer;
  v_prod_branch_count integer;
BEGIN
  SELECT count(*) INTO v_brand_count
  FROM public.restaurants r
  WHERE r.id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(p->'brands') b)
    AND r.primary_category = 'broast'
    AND r.research_use = 'production_ready'
    AND 'fried_chicken' = ANY(r.categories);

  IF v_brand_count <> 19 THEN
    RAISE EXCEPTION 'Broast post-flight failed: expected 19 production_ready brands, found %', v_brand_count;
  END IF;

  SELECT count(*) INTO v_branch_count
  FROM public.restaurant_branches rb
  WHERE rb.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(p->'brands') b);

  IF v_branch_count <> 75 THEN
    RAISE EXCEPTION 'Broast post-flight failed: expected 75 branches, found %', v_branch_count;
  END IF;

  SELECT count(*) INTO v_prod_branch_count
  FROM public.restaurant_branches rb
  WHERE rb.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(p->'brands') b)
    AND rb.district IS NOT NULL;

  IF v_prod_branch_count <> 71 THEN
    RAISE EXCEPTION 'Broast post-flight failed: expected 71 production branches with canonical district, found %', v_prod_branch_count;
  END IF;

  SELECT count(*) INTO v_caution_count
  FROM public.restaurant_branches rb
  WHERE rb.restaurant_id IN (SELECT b->>'brand_id' FROM jsonb_array_elements(p->'brands') b)
    AND rb.district IS NULL
    AND rb.geographic_notes IS NOT NULL;

  IF v_caution_count <> 4 THEN
    RAISE EXCEPTION 'Broast post-flight failed: expected 4 caution branches with null district and notes, found %', v_caution_count;
  END IF;
END $$;

COMMIT;
`;

const targetPath = path.join(rootDir, 'supabase/migrations/20260926000200_jeddah_broast_fried_chicken_catalog.sql');
fs.writeFileSync(targetPath, migrationSql, 'utf8');
console.log(`Generated migration written to ${targetPath}`);
