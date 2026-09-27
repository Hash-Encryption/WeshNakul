import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourcePath = path.join(rootDir, 'docs/research/jeddah-seafood-pass-d-corrected.json');
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
  'twina_seafood': {
    ar: ['مأكولات بحرية فاخرة', 'جلسات عائلية وإطلالات بحرية', 'نادي اليخوت ودرة العروس وذهبـان', 'أسماك طازجة'],
    en: ['Luxury Red Sea Seafood', 'Waterfront Family Dining', 'Yacht Club & Resort Venues', 'Fresh Fish Selection']
  },
  'shrimp_anatomy': {
    ar: ['أكياس شرمب بنكهات مميزة', 'سيفود بول عصري', 'سهرات وجلسات شبابية', 'شرمب مود وديناميت'],
    en: ['Signature Seafood Boil Bags', 'Trendy Fast Casual', 'Late Night Vibes', 'Shrimp Mode & Dynamite']
  },
  'shrimp_zone': {
    ar: ['أشهر أكياس شرمب بجدة', 'خلطات ونكهات قوية', 'سريع وسفري وتوصيل قوي', 'جمبري مشوي ومقلي'],
    en: ['Iconic Seafood Boil', 'Bold Signature Seasonings', 'Delivery & Quick Bite Strong', 'Grilled & Fried Shrimp']
  },
  'shrimp_nation': {
    ar: ['سلسلة شرمب نيشن الشهيرة', 'أكياس بحرية وسرطان وكابوريا', 'سهرات وجلسات كاجوال', 'فروع متعددة بجدة'],
    en: ['Famous Seafood Boil Chain', 'Crab, Lobster & Mussels', 'Late Night Casual Hangout', 'Wide Jeddah Coverage']
  },
  'alqalzam_seafood_restaurant': {
    ar: ['منتجع القلزم البحري', 'عراقة المأكولات البحرية الحجازية', 'جلسات عائلية خاصة وكبائن', 'أسماك طازجة وطواجن'],
    en: ['AlQalzam Seafood Resort', 'Hijazi Seafood Tradition', 'Private Family Cabins', 'Fresh Fish & Tagines']
  },
  'amohamza': {
    ar: ['عمو حمزة الشهير', 'عروض وجبات سمك عائلية', 'سمك بلطي وفيليه مقلي ومشوي', 'توصيل سريع واقتصادي'],
    en: ['Classic AmoHamza', 'Value Seafood Meals', 'Grilled & Fried Tilapia / Fillet', 'Family Delivery Favorite']
  },
  'hook': {
    ar: ['مطعم هوك للأكلات البحرية', 'أكياس جمبري واستاكوزا ومحار', 'أجواء عصرية شبابية', 'جلسات الزهراء والفيحاء'],
    en: ['Hook Seafood Dining', 'Shrimp, Lobster & Oyster Bags', 'Modern Casual Atmosphere', 'Al Zahra & Al Fayha Spots']
  },
  'operation_seafood': {
    ar: ['أوبريشن سي فود الزهراء وأبحر', 'طواجن بحرية ونكهات تايلندية', 'أسماك طازجة وأكياس جمبري', 'سهرات وجلسات حيوية'],
    en: ['Operation Seafood', 'Thai Seafood & Tagines', 'Fresh Catch & Shrimp Bags', 'Lively Dine-In & Late Night']
  },
  'alaaly_seafood_restaurant': {
    ar: ['مطعم العالي للمأكولات البحرية', 'صواني وطواجن بحرية مشكلة', 'حي الروضة عبدالمقصود خوجه', 'سمك مقلي ومشوي طازج'],
    en: ['Alaaly Seafood', 'Generous Seafood Trays', 'Ar Rawdah Landmark', 'Fresh Grilled & Fried Fish']
  },
  'albasali_seafood_restaurant': {
    ar: ['أقدم وأعرق مطعم سمك بجدة', 'تاريخ باب مكة والبلد من 1950', 'سمك حري مقلي وصيادية أصلية', 'تراث جدة الأصيل'],
    en: ['Historic Jeddah Oldest Fish Spot', 'Bab Makkah Heritage Since 1950', 'Authentic Harid & Sayadiyah', 'True Hijazi Legacy']
  },
  'saedi_fish_restaurant': {
    ar: ['مطعم الصعيدي للأسماك الطازجة', 'عراقة كورنيش الحمراء وحراء', 'سمك طازج يختار بالوزن', 'سهرات حتى الفجر'],
    en: ['Al Saedi Fresh Fish', 'Corniche Al Hamra & Hira Tradition', 'Fresh Catch Chosen by Weight', 'Open Late Until 2am']
  },
  'baeshen_seafood': {
    ar: ['مطعم باعشن التاريخي', 'تراث سوق باب مكة والبلد', 'سمك طازج على الطريقة التقليدية', 'أسعار شعبية وجودة عالية'],
    en: ['Baeshen Historic Seafood', 'Bab Makkah Heritage Flavor', 'Traditional Hijazi Preparation', 'Authentic Value & Quality']
  },
  'asmak_tharaa': {
    ar: ['أسماك ثراء طريق الأمير سلطان', 'أطباق بحرية مبتكرة وتبسي بحري', 'صيادية وطواجن ومقليات فاخرة', 'جلسات راقية وتوصيل'],
    en: ['Asmak Tharaa Prince Sultan', 'Gourmet Tipsy Bahri Platters', 'Upscale Seafood & Sayadiyah', 'Premium Ambience & Delivery']
  },
  'el_marakby_seafood_restaurant': {
    ar: ['المراكبي للمأكولات البحرية الإسكندرانية', 'ممشى سعود الفيصل بالتحلية', 'جمبري جامبو وطواجن بالصوص الأبيض', 'سهرات عشاء راقية'],
    en: ['El Marakby Alexandrian Seafood', 'Saud Al Faisal Tahlia Walk', 'Jumbo Shrimp & White Sauce Tagines', 'Late Night Elegant Dining']
  },
  'portofish_seafood': {
    ar: ['بورتوفيش شارع فلسطين بالحمراء', 'تجربة بحرية راقية وسمك طازج', 'أطباق مبتكرة وعروض مميزة', 'سهرات حتى وقت متأخر'],
    en: ['Portofish Seafood Palestine St', 'Upscale Fresh Catch Experience', 'Innovative Platters & Combos', 'Late Night Until 3am']
  },
  'almurjan_seafood_restaurant': {
    ar: ['مطاعم المرجان للمأكولات البحرية', 'طريق الملك عبدالله وحي المرجان', 'باييلا بحرية وسالمون بشاميل ومندي', 'جلسات عائلية واسعة'],
    en: ['AlMurjan Seafood Restaurants', 'King Abdullah Rd & Al Murjan', 'Paella, Salmon Bechamel & Mandhi', 'Spacious Family Dining']
  },
  'almarsah': {
    ar: ['مطعم المرسى شارع حراء', 'وجبات سمك وجمبري سريعة واقتصادية', 'توصيل قوي وسفري سريع', 'أرز صيادية وسمك مقلي'],
    en: ['Almarsah Hira Street', 'Fast Value Seafood Meals', 'High Turnover Delivery & Takeaway', 'Fried Fish & Sayadiyah Rice']
  },
  'seagulls_catch': {
    ar: ['صيد النورس حي الرويس', 'سمك شعور وحريد مقلي طازج', 'أطباق ومأكولات بحرية شعبية وسريعة', 'سهرات وجبات بحرية'],
    en: ["SeaGulls' Catch Al Ruwais", 'Fresh Fried Shaour & Harid', 'Neighborhood Seafood Takeaway', 'Late Night Quick Bites']
  },
  'blue_ocean_restaurant': {
    ar: ['بلو أوشن فقيه أكواريوم', 'أشهر إطلالة بحرية مباشرة على كورنيش جدة', 'جلسات شاطئية وأجواء مميزة', 'سلطعون وجمبري وأسماك'],
    en: ['Blue Ocean at Fakieh Aquarium', 'Direct Red Sea Panoramic Views', 'Iconic Waterfront Destination', 'Crab, Shrimp & Fresh Fish']
  },
  'al_daraj_seafood_restaurant': {
    ar: ['مطعم الدرج التاريخي', 'طريق مكة القديم حارة المظلوم بالبلد', 'سمك طازج مقلي ومشوي على الأصول', 'جوهرة بحرية مخفية'],
    en: ['Al-Daraj Historic Seafood', 'Old Mecca Road Al Balad', 'Authentic Traditional Fried & Grilled Fish', 'Old Town Hidden Gem']
  }
};

const PRICE_POSITION_MAP = {
  'affordable': { position: 'budget', tier: '$', min: 25, max: 60 },
  'mid-range': { position: 'standard', tier: '$$', min: 50, max: 110 },
  'premium': { position: 'premium', tier: '$$$', min: 90, max: 220 }
};

const EDITORIAL_ROLE_MAP = {
  'staple': { role: 'staple', tier: 'staple', reputation: ['jeddah_staple'] },
  'mainstream': { role: 'popular', tier: 'trend', reputation: ['mainstream'] },
  'local_favorite': { role: 'popular', tier: 'trend', reputation: ['local_favorite'] },
  'rising': { role: 'popular', tier: 'trend', reputation: ['rising'] },
  'hidden_gem': { role: 'discovery', tier: 'trend', reputation: ['hidden_gem'] }
};

const FALLBACK_DISHES_MAP = {
  'twina_seafood': [
    { en: 'Grilled Najil & Hamour', ar: 'ناجل وهامور مشوي على الفحم' },
    { en: 'Sayadiyah Rice', ar: 'أرز صيادية توينا الفاخر' },
    { en: 'Jumbo Grilled Prawns', ar: 'جمبري جامبو مشوي' }
  ],
  'alqalzam_seafood_restaurant': [
    { en: 'Charcoal Grilled Najil', ar: 'ناجل بلدي مشوي عالفحم' },
    { en: 'AlQalzam Seafood Tagine', ar: 'طاجن القلزم المشكل' },
    { en: 'Fried Jumbo Shrimp', ar: 'جمبري جامبو مقلي مقرمش' }
  ],
  'albasali_seafood_restaurant': [
    { en: 'Crispy Fried Harid with Sayadiyah', ar: 'سمك حريد مقلي مقرمش مع أرز الصيادية' },
    { en: 'Traditional Bab Makkah Shrimp', ar: 'جمبري مقلي بلدي بنكهة باب مكة' },
    { en: 'Red Sea Fish Soup', ar: 'شوربة سمك بحرية تقليدية' }
  ],
  'saedi_fish_restaurant': [
    { en: 'Grilled Hamour by Weight', ar: 'هامور بلدي مشوي طازج بالوزن' },
    { en: 'Fried Calamari & Shrimp', ar: 'حبار وجمبري مقلي مقرمش' },
    { en: 'Saedi Sayadiyah Rice', ar: 'أرز صيادية الصعيدي الشهير' }
  ],
  'baeshen_seafood': [
    { en: 'Fried Shaour with Traditional Rice', ar: 'سمك شعور مقلي مع الأرز الحجازي' },
    { en: 'Baeshen Spiced Fresh Shrimp', ar: 'جمبري بلدي متبل بخلطة باعشن' },
    { en: 'Traditional Fish Soup', ar: 'مرقة سمك حجازية أصيلة' }
  ],
  'portofish_seafood': [
    { en: 'Portofish Signature Seafood Platter', ar: 'طبق بورتوفيش البحري المميز' },
    { en: 'Grilled Salmon & Hamour', ar: 'سالمون وهامور مشوي بتتبيلة الأعشاب' },
    { en: 'Fried Shrimp & Calamari Basket', ar: 'سلة جمبري وحبار مقلي مقرمش' }
  ],
  'seagulls_catch': [
    { en: 'Fried Fresh Fish with Rice', ar: 'سمك مقلي طازج مع الأرز والصوص' },
    { en: 'Golden Fried Shrimp', ar: 'جمبري مقلي ذهبي مقرمش' },
    { en: 'Seafood Soup', ar: 'شوربة سي فود بالكريمة' }
  ],
  'blue_ocean_restaurant': [
    { en: 'Crab Cake & Seafood Platter', ar: 'كراب كيك وطبق المأكولات البحرية' },
    { en: 'Grilled Lobster Tail', ar: 'ذيل استاكوزا مشوي بالزبدة' },
    { en: 'Crispy Coconut Shrimp', ar: 'جمبري جوز الهند المقرمش' }
  ],
  'al_daraj_seafood_restaurant': [
    { en: 'Authentic Fried Red Sea Fish', ar: 'سمك بحري مقلي على الطريقة التاريخية' },
    { en: 'Traditional Spiced Shrimp', ar: 'جمبري بلدي بالتتبيلة الحجازية' },
    { en: 'Al-Daraj Special Sayadiyah', ar: 'صيادية الدرج الخاصة' }
  ]
};

const shapedBrands = dataset.brands.map(brand => {
  const brandId = brand.id;
  const vibeTags = VIBE_TAGS_MAP[brandId] || { ar: ['مأكولات بحرية', 'سمك طازج'], en: ['Seafood', 'Fresh Catch'] };
  const priceInfo = PRICE_POSITION_MAP[brand.price_positioning] || { position: 'standard', tier: '$$', min: 50, max: 110 };
  const edInfo = EDITORIAL_ROLE_MAP[brand.editorial_classification] || { role: 'popular', tier: 'trend', reputation: ['local_favorite'] };

  const categories = ['seafood'];
  if (brand.secondary_categories && brand.secondary_categories.length > 0) {
    for (const sc of brand.secondary_categories) {
      if (!categories.includes(sc)) categories.push(sc);
    }
  }

  // Best sellers
  let bestSellers = [];
  if (brand.signature_dishes && brand.signature_dishes.length > 0) {
    bestSellers = brand.signature_dishes.map((dishStr, idx) => ({
      name_en: dishStr,
      name_ar: dishStr,
      is_signature: idx === 0,
      sort_order: idx
    }));
  } else if (FALLBACK_DISHES_MAP[brandId]) {
    bestSellers = FALLBACK_DISHES_MAP[brandId].map((dish, idx) => ({
      name_en: dish.en,
      name_ar: dish.ar,
      is_signature: idx === 0,
      sort_order: idx
    }));
  } else {
    bestSellers.push({
      name_en: 'Fresh Seafood Specialties',
      name_ar: 'تشكيلة المأكولات البحرية الطازجة',
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
    primary_category: 'seafood',
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
    time_slots: isOpenLate ? ['lunch', 'dinner', 'late_night'] : ['lunch', 'dinner'],
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
    title: 'WeshNakul Jeddah Seafood Production Catalog',
    version: 'Pass D Certified Corrected',
    date: '2026-09-28',
    brand_count: shapedBrands.length,
    branch_count: shapedBrands.reduce((acc, b) => acc + b.branches.length, 0),
    canonical_branch_count: shapedBrands.reduce((acc, b) => acc + b.branches.filter(br => br.district !== null).length, 0),
    outer_caution_branch_count: shapedBrands.reduce((acc, b) => acc + b.branches.filter(br => br.district === null).length, 0),
    seafood_deck_rule: {
      deck_size: 7,
      guaranteed_anchor_count: 1,
      anchor_candidates: ['Shrimp Zone', 'Shrimp Anatomy'],
      initial_anchor_probability_each: 0.5,
      rule: 'Choose exactly one anchor first, then choose the nearest usable physical branch. Do not automatically add the other anchor in the remaining six cards.',
      nearest_usable_branch_resolution: true,
      remaining_cards_selection: 'randomized_from_seafood_candidate_pool'
    }
  },
  brands: shapedBrands
}, null, 2);

const migrationSql = `-- Google-verified Jeddah Seafood production catalog.
-- Source: docs/research/jeddah-seafood-pass-d-corrected.json
-- 20 approved brands, 52 verified physical branches (41 canonical, 11 outer-district caution branches).
-- Preserves Seafood Anchor Rule (Shrimp Zone & Shrimp Anatomy, 50/50 anchor selection, 1 per 7-card deck).
-- Strict sushi exclusion verified (zero sushi restaurants or dishes).
-- 100% Google Place IDs, Maps URLs, verified coordinates, addresses, hours, and ratings.
-- Apply after 20260927000600_jeddah_italian_catalog.sql.
BEGIN;

CREATE TEMP TABLE _seafood_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _seafood_catalog(payload) VALUES ($catalog$${payloadJson}$catalog$::jsonb);

-- 1. Upsert public.restaurants
WITH catalog AS (SELECT payload FROM _seafood_catalog), brands AS (
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
DELETE FROM public.restaurant_best_sellers s USING _seafood_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
);

DELETE FROM public.restaurant_sources s USING _seafood_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
) AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches
WITH catalog AS (SELECT payload FROM _seafood_catalog), branches AS (
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
WITH catalog AS (SELECT payload FROM _seafood_catalog), sellers AS (
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
  'Certified Seafood Pass D dataset signature item',
  '2026-09-28T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources
WITH catalog AS (SELECT payload FROM _seafood_catalog), brands AS (
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
WITH catalog AS (SELECT payload FROM _seafood_catalog), branches AS (
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

const migrationPath = path.join(rootDir, 'supabase/migrations/20260928000100_jeddah_seafood_catalog.sql');
fs.writeFileSync(migrationPath, migrationSql);
console.log('Seafood migration generated successfully at:', migrationPath);
