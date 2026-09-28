import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourcePath = path.join(rootDir, 'docs/research/jeddah-asian-pass-d-corrected.json');
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

const SUSHI_OVERLAP_IDS = new Set([
  'wakame', 'shiro', 'myazu', 'kuuru', 'sakura_japanese_restaurant', 'sushiah'
]);

const VIBE_TAGS_MAP = {
  'canton': {
    ar: ['أشهر سلسلة صينية سريعة', 'نودلز ودجاج كانتون بالصويا', 'منتشر في مولات جدة', 'وجبة سريعة ومميزة'],
    en: ['Famous Fast Chinese Chain', 'Canton Noodles & Sweet Sour Chicken', 'Jeddah Mall Foodcourts & Streets', 'Quick Comfort Meal']
  },
  'baytoti': {
    ar: ['سلسلة صينية محلية رائدة', 'نودلز وأرز مقلي ودجاج حامض حلو', 'جلسات عائلية واسعة', 'فروع متعددة بجدة'],
    en: ['Leading Local Chinese Chain', 'Noodles Fried Rice & Sweet Sour', 'Spacious Family Dining', 'Multiple Jeddah Branches']
  },
  'denden': {
    ar: ['أشهر مطعم إندونيسي بجدة', 'صحن مشكل إندونيسي وساتا ودندن', 'نكهة جاويّة أصيلة', 'فروع منتشرة بجدة'],
    en: ['Famous Indonesian Heritage Chain', 'Nasi Campur Sate & Rendang', 'Authentic Javanese Flavors', 'Multiple Jeddah Locations']
  },
  'da_bao': {
    ar: ['أشهر مأكولات باو ستريت فود', 'خبز باو طري ونكهات آسيوية مبتكرة', 'حي الزهراء شارع البترجي', 'سريع وشبابي عصري'],
    en: ['Famous Asian Bao Street Food', 'Fluffy Steamed Baos & Asian Bites', 'Al Zahra Al Batarji', 'Trendy Modern Vibe']
  },
  'chan': {
    ar: ['مطعم آسيوي عصري متكامل', 'نودلز وسوشي وباولز آسيوية', 'حي الزهراء طريق الأمير سلطان', 'أجواء شبابية رايقة'],
    en: ['Contemporary Asian Eatery', 'Asian Noodles Sushi & Bowls', 'Al Zahra Prince Sultan Rd', 'Chic Casual Ambiance']
  },
  'togarashi': {
    ar: ['مطبخ ياباني وآسيوي عصري', 'نودلز ورامن ومقبلات آسيوية', 'حي الروضة شارع الكيال', 'جلسات عصرية رايقة'],
    en: ['Modern Japanese & Asian Kitchen', 'Signature Ramen Noodles & Bites', 'Ar Rawdah Al Kayyal', 'Stylish Cozy Dining']
  },
  'toki': {
    ar: ['مطعم صيني فاخر أيقوني', 'ديم سوم وبط بكين ومأكولات بحرية', 'طريق الملك الخالدية', 'أجواء فخمة وتجربة راقية'],
    en: ['Iconic Luxury Chinese Dining', 'Artisan Dim Sum Peking Duck & Seafood', 'King Road Al Khalidiyyah', 'Opulent Fine Dining']
  },
  'sura': {
    ar: ['مطعم كوري فاخر وباربيكيو', 'مشاوي كورية على الطاولة وبيبيمباب', 'حي الروضة شارع سعود الفيصل', 'تجربة كورية راقية'],
    en: ['Korean Fine Dining & Table BBQ', 'Authentic Bulgogi & Bibimbap', 'Ar Rawdah Prince Saud Al Faisal', 'Refined Korean Experience']
  },
  'hwaro': {
    ar: ['باربيكيو كوري أصيل', 'مشاوي كورية وهوت بوت', 'حي الزهراء شارع البترجي', 'جلسات حيوية وتجربة تفاعلية'],
    en: ['Authentic Korean Charcoal BBQ', 'Tabletop Grill & Kimchi Stew', 'Al Zahra Al Batarji', 'Interactive Dining Vibe']
  },
  'koreana': {
    ar: ['أقدم وأعرق مطعم كوري بجدة', 'كيمتشي وبولغوغي ونكهات كورية أصلية', 'حي الروضة', 'أجواء عائلية مريحة'],
    en: ['Heritage Authentic Korean Classic', 'Home-style Kimchi & Bulgogi', 'Ar Rawdah District', 'Cozy Heritage Dining']
  },
  'thai_fortune': {
    ar: ['جوهرة تايلاندية أصيلة مخفية', 'توم يوم وباد تاي ونكهات بانكوك', 'حي الفيصلية', 'نكهة تايلاندية شعبية أصلية'],
    en: ['Authentic Thai Hidden Gem', 'Tom Yum Soup & Classic Pad Thai', 'Al Faisaliyyah District', 'Unpretentious Street Flavors']
  },
  'thai_lee': {
    ar: ['مطعم تايلاندي محلي محبوب', 'نودلز تايلاندية ومأكولات بحرية حارة', 'حي السلامة', 'سريع ولذيذ'],
    en: ['Beloved Local Thai Eatery', 'Spicy Thai Noodles & Tom Yum', 'As Salamah District', 'Flavorful Comfort Food']
  },
  'shang_palace': {
    ar: ['مطعم صيني كانتوني فائق الفخامة', 'فندق شانغريلا كورنيش جدة', 'ديم سوم معاصر وبط بكين الملكي', 'إطلالة بحرية وأجواء استثنائية'],
    en: ['Ultra-Luxury Cantonese Fine Dining', 'Shangri-La Hotel Corniche', 'Contemporary Dim Sum & Peking Duck', 'Breathtaking Coastal Ambience']
  },
  'wakame': {
    ar: ['سوشي ولاونج آسيوي فاخر', 'أجواء راقية ومميزة', 'أطباق طازجة وصحية', 'طريق الملك والروضة وأبحر'],
    en: ['Premium Asian & Sushi Lounge', 'Chic Upscale Ambience', 'Fresh & Healthy Options', 'King Road, Rawdah & Obhur']
  },
  'shiro': {
    ar: ['بوكسات سوشي ومأكولات آسيوية شهيرة', 'مزيج كرانشي ونودلز', 'حي الروضة', 'سهرات ولذة سريعة'],
    en: ['Popular Asian & Sushi Spot', 'Crunchy Rolls & Noodles', 'Ar Rawdah District', 'Late Night Bites']
  },
  'myazu': {
    ar: ['مطعم ياباني آسيوي فاخر عالمي', 'أطباق نيجيري وروبيان تيمبورا وبلاك كود', 'البساتين مول التحلية', 'جلسات استثنائية راقية'],
    en: ['World-Class Asian Fine Dining', 'Artisan Robata Black Cod & Tempura', 'Al Basateen Mall Tahlia', 'Extraordinary Luxury Ambience']
  },
  'kuuru': {
    ar: ['مطعم نيكاي ياباني وبيروفي فاخر', 'دليل ميشلان جدة', 'مجمع ليلتي طريق الملك', 'تجربة طهي مبتكرة واستثنائية'],
    en: ['Luxury Nikkei Asian Dining', 'Michelin Guide Jeddah', 'Leylaty Complex King Road', 'Innovative Culinary Excellence']
  },
  'sakura_japanese_restaurant': {
    ar: ['مطعم ياباني آسيوي أصيل عريق', 'كراون بلازا الحمراء', 'ساشيمي وتيبانياكي تقليدي', 'أجواء يابانية هادئة'],
    en: ['Authentic Heritage Japanese', 'Crowne Plaza Al Hamra', 'Traditional Teppanyaki & Sashimi', 'Serene Japanese Ambience']
  },
  'sushiah': {
    ar: ['سوشي وآسيوي مبتكر وعصري', 'توصيل قوي وسريع', 'خيارات بوكسات غنية', 'شارع صاري الزهراء'],
    en: ['Innovative Modern Asian & Sushi', 'Strong Delivery Presence', 'Generous Party Boxes', 'Sari Street Al Zahra']
  }
};

const PRICE_POSITION_MAP = {
  'budget': { position: 'budget', tier: '$', min: 25, max: 55 },
  'standard': { position: 'standard', tier: '$$', min: 45, max: 95 },
  'premium': { position: 'premium', tier: '$$$', min: 90, max: 220 },
  'luxury': { position: 'premium', tier: '$$$', min: 150, max: 380 }
};

const BRAND_PRICE_KEY = {
  'canton': 'budget',
  'denden': 'budget',
  'thai_fortune': 'budget',
  'baytoti': 'standard',
  'da_bao': 'standard',
  'chan': 'standard',
  'togarashi': 'standard',
  'thai_lee': 'standard',
  'koreana': 'standard',
  'shiro': 'standard',
  'sushiah': 'standard',
  'hwaro': 'premium',
  'sura': 'premium',
  'sakura_japanese_restaurant': 'premium',
  'wakame': 'premium',
  'toki': 'luxury',
  'shang_palace': 'luxury',
  'myazu': 'luxury',
  'kuuru': 'luxury'
};

const EDITORIAL_ROLE_MAP = {
  'staple': 'staple',
  'mainstream': 'popular',
  'local_favorite': 'popular',
  'rising': 'discovery',
  'hidden_gem': 'discovery'
};

const SIGNATURE_DISHES_MAP = {
  'canton': { ar: 'دجاج كانتون بالصويا ونودلز مشكلة', en: 'Canton Soy Chicken & Mixed Noodles' },
  'baytoti': { ar: 'دجاج كرانشي حامض حلو ونودلز بيتوتي', en: 'Crunchy Sweet & Sour Chicken & Baytoti Noodles' },
  'denden': { ar: 'صحن دندن مشكل وساتا دجاج مع صوص الفول السوداني', en: 'Denden Nasi Campur & Chicken Sate' },
  'da_bao': { ar: 'خبز باو الدجاج المقرمش واللحم المطهو ببطء', en: 'Crispy Chicken & Slow Cooked Beef Baos' },
  'chan': { ar: 'باول الدجاج المقرمش ونودلز شان الآسيوية', en: 'Crispy Chicken Asian Bowl & Signature Noodles' },
  'togarashi': { ar: 'رامن توقاراشي ومقبلات الترياكي', en: 'Signature Togarashi Ramen & Teriyaki' },
  'toki': { ar: 'بط بكين المقرمش وديم سوم توكي الفاخر', en: 'Crispy Peking Duck & Toki Dim Sum' },
  'sura': { ar: 'مشاوي بولغوغي اللحم الفاخر والبيبيمباب', en: 'Prime Beef Bulgogi & Sizzling Bibimbap' },
  'hwaro': { ar: 'مشاوي هووارو على الفحم وشوربة الكيمتشي', en: 'Hwaro Charcoal BBQ & Kimchi Jjigae' },
  'koreana': { ar: 'بولغوغي اللحم الكلاسيكي وتشكيلة الكيمتشي', en: 'Classic Beef Bulgogi & Kimchi Platter' },
  'thai_fortune': { ar: 'شوربة توم يوم بالروبيان وباد تاي الدجاج', en: 'Tom Yum Goong & Chicken Pad Thai' },
  'thai_lee': { ar: 'باد تاي الروبيان ونودلز تاي لي الحارة', en: 'Shrimp Pad Thai & Spicy Thai Lee Noodles' },
  'shang_palace': { ar: 'بط بكين المحمر في الفرن وديم سوم شانغ الفاخر', en: 'Roasted Peking Duck & Dim Sum Selection' },
  'wakame': { ar: 'سلطة السالمون الحارة وتشكيلة الرولز', en: 'Spicy Salmon Salad & Signature Rolls' },
  'shiro': { ar: 'بوكس كرانشي شيرو وسالمون رول', en: 'Shiro Crunchy Box & Salmon Rolls' },
  'myazu': { ar: 'السمك الأسود بالمايسو وروبيان البوبكورن', en: 'Black Cod with Miso & Popcorn Shrimp' },
  'kuuru': { ar: 'واغيو بيف كوشي ياكي وسيفيتشي نيكاي', en: 'Wagyu Beef Kushi-yaki & Nikkei Ceviche' },
  'sakura_japanese_restaurant': { ar: 'تيبانياكي اللحم والساشيمي الطازج', en: 'Beef Teppanyaki & Fresh Sashimi Platter' },
  'sushiah': { ar: 'بوكس سوشيّا سبيشال وسالمون ترياكي', en: 'Sushiah Special Box & Salmon Teriyaki' }
};

const BEST_SELLERS_MAP = {
  'canton': [
    { name_en: 'Canton Soy Chicken with Noodles', name_ar: 'دجاج كانتون بالصويا مع النودلز', is_signature: true, sort_order: 0 },
    { name_en: 'Sweet & Sour Chicken Rice Box', name_ar: 'بوكس أرز دجاج حامض حلو', is_signature: true, sort_order: 1 }
  ],
  'baytoti': [
    { name_en: 'Signature Baytoti Noodles & Sweet Sour Chicken', name_ar: 'نودلز بيتوتي ودجاج حامض حلو', is_signature: true, sort_order: 0 },
    { name_en: 'Dynamite Shrimp & Fried Rice', name_ar: 'ديناميت شرمب وأرز مقلي صيني', is_signature: true, sort_order: 1 }
  ],
  'denden': [
    { name_en: 'Denden Indonesian Mixed Platter (Nasi Campur)', name_ar: 'صحن دندن مشكل إندونيسي', is_signature: true, sort_order: 0 },
    { name_en: 'Chicken Sate with Peanut Sauce', name_ar: 'ساتا دجاج بصوص الفول السوداني', is_signature: true, sort_order: 1 }
  ],
  'da_bao': [
    { name_en: 'Crispy Fried Chicken Bao', name_ar: 'باو الدجاج المقرمش', is_signature: true, sort_order: 0 },
    { name_en: 'Slow-Cooked Beef Brisket Bao', name_ar: 'باو لحم البريسكت المطهو ببطء', is_signature: true, sort_order: 1 }
  ],
  'chan': [
    { name_en: 'Signature CHAN Crispy Bowl', name_ar: 'باول شان المقرمش الخاص', is_signature: true, sort_order: 0 },
    { name_en: 'Asian Stir Fry Noodles', name_ar: 'نودلز آسيوية مشوحة بالخضار', is_signature: true, sort_order: 1 }
  ],
  'togarashi': [
    { name_en: 'Togarashi Signature Ramen Bowl', name_ar: 'وعاء رامن توقاراشي الخاص', is_signature: true, sort_order: 0 },
    { name_en: 'Spicy Asian Chicken Bites', name_ar: 'قطع دجاج آسيوي حار', is_signature: true, sort_order: 1 }
  ],
  'toki': [
    { name_en: 'Traditional Crispy Peking Duck', name_ar: 'بط بكين التقليدي المقرمش', is_signature: true, sort_order: 0 },
    { name_en: 'Steamed Artisan Dim Sum Platter', name_ar: 'تشكيلة ديم سوم فاخرة على البخار', is_signature: true, sort_order: 1 }
  ],
  'sura': [
    { name_en: 'Prime Marinated Beef Bulgogi', name_ar: 'بولغوغي لحم متبل فاخر على المشواة', is_signature: true, sort_order: 0 },
    { name_en: 'Stone Pot Dolsot Bibimbap', name_ar: 'بيبيمباب في الإناء الحجري الساخن', is_signature: true, sort_order: 1 }
  ],
  'hwaro': [
    { name_en: 'Hwaro Premium Charcoal BBQ Set', name_ar: 'ست مشاوي هووارو الفاخرة على الفحم', is_signature: true, sort_order: 0 },
    { name_en: 'Spicy Kimchi Jjigae Stew', name_ar: 'شوربة كيمتشي حارة باللحم والتوفو', is_signature: true, sort_order: 1 }
  ],
  'koreana': [
    { name_en: 'Classic Korean Beef Bulgogi & Kimchi', name_ar: 'بولغوغي كوري كلاسيكي مع تشكيلة كيمتشي', is_signature: true, sort_order: 0 },
    { name_en: 'Japchae Glass Noodles', name_ar: 'نودلز جابتشي الكورية بالخضار', is_signature: true, sort_order: 1 }
  ],
  'thai_fortune': [
    { name_en: 'Authentic Tom Yum Goong Soup', name_ar: 'شوربة توم يوم غونغ التايلاندية بالروبيان', is_signature: true, sort_order: 0 },
    { name_en: 'Classic Chicken Pad Thai', name_ar: 'باد تاي الدجاج الكلاسيكي بالفول السوداني', is_signature: true, sort_order: 1 }
  ],
  'thai_lee': [
    { name_en: 'Special Seafood Pad Thai', name_ar: 'باد تاي مأكولات بحرية سبيشال', is_signature: true, sort_order: 0 },
    { name_en: 'Spicy Green Curry Chicken', name_ar: 'كاري أخضر تايلاندي حار بالدجاج', is_signature: true, sort_order: 1 }
  ],
  'shang_palace': [
    { name_en: 'Shang Palace Wood-Fired Peking Duck', name_ar: 'بط بكين المحمر بحطب الفرن الخاص', is_signature: true, sort_order: 0 },
    { name_en: 'Steamed Truffle Shrimp Dumplings', name_ar: 'دمبلنغ روبيان بالكمأة ديم سوم', is_signature: true, sort_order: 1 }
  ],
  'wakame': [
    { name_en: 'Spicy Salmon Salad', name_ar: 'سلطة السالمون الحارة', is_signature: true, sort_order: 0 }
  ],
  'shiro': [
    { name_en: 'Shiro Crunchy Box', name_ar: 'بوكس كرانشي شيرو', is_signature: true, sort_order: 0 }
  ],
  'myazu': [
    { name_en: 'Black Cod with Saikyo Miso', name_ar: 'السمك الأسود بمايسو سايكو', is_signature: true, sort_order: 0 }
  ],
  'kuuru': [
    { name_en: 'Nikkei Wagyu Skewers & Ceviche', name_ar: 'أسياخ واغيو بيف وسيفيتشي نيكاي', is_signature: true, sort_order: 0 }
  ],
  'sakura_japanese_restaurant': [
    { name_en: 'Prime Beef Teppanyaki', name_ar: 'تيبانياكي لحم بقري فاخر', is_signature: true, sort_order: 0 }
  ],
  'sushiah': [
    { name_en: 'Sushiah Special Party Box', name_ar: 'بوكس حفلات سوشيّا الخاص', is_signature: true, sort_order: 0 }
  ]
};

const payloadBrands = dataset.brands.map(b => {
  const priceMeta = PRICE_POSITION_MAP[BRAND_PRICE_KEY[b.id] || 'standard'];
  const editorialRole = EDITORIAL_ROLE_MAP[b.editorial_classification] || 'popular';
  const vibe = VIBE_TAGS_MAP[b.id] || { ar: ['مطعم آسيوي مميز'], en: ['Distinctive Asian Restaurant'] };
  const sigDish = SIGNATURE_DISHES_MAP[b.id] || { ar: 'أطباق آسيوية متنوعة', en: 'Asian Specialties' };

  const canonicalDistricts = [
    ...new Set(
      (b.branches || [])
        .map(br => br.canonical_district)
        .filter(d => d && CANONICAL_30.has(d))
    )
  ];

  const branches = (b.branches || []).map(br => {
    let branchType = 'full_dine_in';
    const lowerName = br.branch_name.toLowerCase();
    const lowerAddr = (br.formatted_address || '').toLowerCase();
    if (lowerName.includes('mall') || lowerName.includes('plaza') || lowerAddr.includes('mall') || lowerAddr.includes('plaza')) {
      branchType = 'mall_foodcourt';
    }

    return {
      restaurant_id: b.id,
      branch_name_en: br.branch_name,
      branch_name_ar: null,
      branch_type: branchType,
      district: br.canonical_district,
      address_en: br.formatted_address,
      latitude: br.latitude,
      longitude: br.longitude,
      maps_business_name: b.canonical_name,
      google_place_id: br.google_place_id,
      google_maps_url: br.google_maps_url,
      google_rating: br.google_rating,
      google_review_count: br.google_review_count,
      operating_status: br.operating_status,
      hours: br.hours,
      phone: br.phone,
      geographic_notes: br.geographic_notes,
      production_branch_status: br.production_eligibility
    };
  });

  const isSushiOverlap = SUSHI_OVERLAP_IDS.has(b.id);
  const primaryCategory = isSushiOverlap ? 'sushi' : 'asian';
  const secondaryCategories = isSushiOverlap ? ['asian'] : (b.secondary_categories || []);
  const categories = isSushiOverlap ? ['sushi', 'asian'] : ['asian', ...(b.secondary_categories || [])];

  return {
    brand_id: b.id,
    canonical_name: b.canonical_name,
    arabic_name: b.arabic_name,
    categories,
    primary_category: primaryCategory,
    secondary_categories: secondaryCategories,
    subcategories: secondaryCategories,
    editorial_role: editorialRole,
    tier: b.editorial_classification === 'staple' ? 'staple' : 'trend',
    price_position: priceMeta.position,
    price_tier: priceMeta.tier,
    estimated_spend_min_sar: priceMeta.min,
    estimated_spend_max_sar: priceMeta.max,
    signature_dish_ar: sigDish.ar,
    signature_dish_en: sigDish.en,
    vibe_tags_ar: vibe.ar,
    vibe_tags_en: vibe.en,
    reputation_tags: [b.editorial_classification === 'staple' ? 'jeddah_staple' : b.editorial_classification],
    context_tags: b.context_tags || ['asian_comfort', 'noodles'],
    time_slots: b.meal_fit || ['lunch', 'dinner'],
    is_open_late: true,
    is_24_hours: false,
    is_city_wide: ['canton', 'baytoti', 'denden'].includes(b.id),
    branch_list_completeness: ['canton', 'baytoti', 'denden'].includes(b.id) ? 'complete' : 'partial',
    verified_jeddah_branch_count: branches.length,
    canonical_districts: canonicalDistricts,
    delivery_platforms: ['hungerstation', 'jahez', 'keeta'],
    official_website: b.official_website || null,
    research_use: b.production_eligibility || 'production_ready',
    branches,
    best_sellers: BEST_SELLERS_MAP[b.id] || []
  };
});

const payload = {
  catalog_metadata: {
    title: 'WeshNakul Jeddah Asian Production Catalog',
    version: 'Pass D Certified Corrected',
    date: '2026-09-28',
    brand_count: payloadBrands.length,
    branch_count: payloadBrands.reduce((acc, b) => acc + b.branches.length, 0),
    canonical_branch_count: payloadBrands.reduce((acc, b) => acc + b.branches.filter(br => br.district !== null).length, 0),
    outer_caution_branch_count: payloadBrands.reduce((acc, b) => acc + b.branches.filter(br => br.district === null).length, 0)
  },
  brands: payloadBrands
};

const migrationSql = `-- Google-verified Jeddah Asian production catalog.
-- Source: docs/research/jeddah-asian-pass-d-corrected.json
-- 19 locked brands (13 Asian primary brands + 6 sushi overlap brands cleanly reconciled).
-- 50 verified physical branches (43 canonical 30 districts + 7 outer-district caution branches).
-- Excludes 1 manual review duplicate branch without coordinates (Canton Ash Shati duplicate).
-- 100% Google Place IDs, Maps URLs, verified exact coordinates, addresses, hours, and ratings.
-- Zero unintended collisions against live production catalog.
-- Apply after 20260928000200_jeddah_mexican_catalog.sql.
BEGIN;

CREATE TEMP TABLE _asian_catalog (payload jsonb NOT NULL) ON COMMIT DROP;
INSERT INTO _asian_catalog(payload) VALUES ($catalog$${JSON.stringify(payload, null, 2)}$catalog$::jsonb);

-- 0. Safely remove unverified/defunct legacy Asian seed records that have no swipes
DELETE FROM public.restaurants WHERE id IN ('benihana', 'pf_changs') AND NOT EXISTS (
  SELECT 1 FROM public.restaurant_swipes WHERE restaurant_id = restaurants.id
);

-- 1. Upsert public.restaurants
-- Preserves primary_category = 'sushi' for sushi overlap brands while adding 'asian' to categories
-- Promotes legacy seed 'chan' to primary_category = 'asian' and production_ready
WITH catalog AS (SELECT payload FROM _asian_catalog), brands AS (
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
  (b->>'research_use')::public.research_use,
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
  primary_category=CASE 
    WHEN restaurants.primary_category = 'sushi' THEN 'sushi' 
    ELSE EXCLUDED.primary_category 
  END,
  editorial_role=COALESCE(EXCLUDED.editorial_role, restaurants.editorial_role),
  tier=COALESCE(EXCLUDED.tier, restaurants.tier),
  price_tier=COALESCE(EXCLUDED.price_tier, restaurants.price_tier),
  price_position=COALESCE(EXCLUDED.price_position, restaurants.price_position),
  signature_dish_ar=COALESCE(EXCLUDED.signature_dish_ar, restaurants.signature_dish_ar),
  signature_dish_en=COALESCE(EXCLUDED.signature_dish_en, restaurants.signature_dish_en),
  vibe_tags_ar=EXCLUDED.vibe_tags_ar,
  vibe_tags_en=EXCLUDED.vibe_tags_en,
  platforms=EXCLUDED.platforms,
  links=EXCLUDED.links,
  city=EXCLUDED.city,
  category_fit_confidence=EXCLUDED.category_fit_confidence,
  category_fit_evidence=EXCLUDED.category_fit_evidence,
  reputation_tags=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.reputation_tags, EXCLUDED.reputation_tags)) item),
  context_tags=ARRAY(SELECT DISTINCT item FROM unnest(array_cat(restaurants.context_tags, EXCLUDED.context_tags)) item),
  business_type=EXCLUDED.business_type,
  operating_status=EXCLUDED.operating_status,
  brand_status_confidence=EXCLUDED.brand_status_confidence,
  verified_jeddah_branch_count=EXCLUDED.verified_jeddah_branch_count,
  branch_list_completeness=EXCLUDED.branch_list_completeness,
  dining_mode=EXCLUDED.dining_mode,
  dining_mode_summary=EXCLUDED.dining_mode_summary,
  estimated_sar_per_person_min=EXCLUDED.estimated_sar_per_person_min,
  estimated_sar_per_person_max=EXCLUDED.estimated_sar_per_person_max,
  official_website=COALESCE(EXCLUDED.official_website, restaurants.official_website),
  trend_status=EXCLUDED.trend_status,
  trend_confidence=EXCLUDED.trend_confidence,
  overall_confidence=EXCLUDED.overall_confidence,
  research_use=EXCLUDED.research_use,
  last_verified_at=EXCLUDED.last_verified_at,
  manual_review_required=EXCLUDED.manual_review_required,
  manual_review_reasons=EXCLUDED.manual_review_reasons,
  intelligence_origin=EXCLUDED.intelligence_origin;

-- 2. Cleanup stale best sellers and sources for pure Asian brands prior to insertion
DELETE FROM public.restaurant_best_sellers s USING _asian_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
  WHERE b->>'primary_category' = 'asian'
);

DELETE FROM public.restaurant_sources s USING _asian_catalog c
WHERE s.restaurant_id IN (
  SELECT b->>'brand_id' FROM jsonb_array_elements(c.payload->'brands') b
  WHERE b->>'primary_category' = 'asian'
) AND (s.branch_id IS NOT NULL OR s.best_seller_id IS NOT NULL OR s.source_type='official_website');

-- 3. Upsert public.restaurant_branches for all 50 verified branches
WITH catalog AS (SELECT payload FROM _asian_catalog), branches AS (
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

-- 4. Insert best sellers for Asian brands
WITH catalog AS (SELECT payload FROM _asian_catalog), sellers AS (
  SELECT b->>'brand_id' restaurant_id, item
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'best_sellers') item
  WHERE b->>'primary_category' = 'asian'
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
  'Certified Asian Pass D dataset signature item',
  '2026-09-28T00:00:00Z'::timestamptz
FROM sellers;

-- 5. Insert brand official website sources for pure Asian brands
WITH catalog AS (SELECT payload FROM _asian_catalog), brands AS (
  SELECT b FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  WHERE b->>'official_website' IS NOT NULL AND b->>'primary_category' = 'asian'
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

-- 6. Insert branch Google Maps sources for pure Asian branches
WITH catalog AS (SELECT payload FROM _asian_catalog), branches AS (
  SELECT br
  FROM catalog CROSS JOIN LATERAL jsonb_array_elements(payload->'brands') b
  CROSS JOIN LATERAL jsonb_array_elements(b->'branches') br
  WHERE b->>'primary_category' = 'asian'
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

const migrationPath = path.join(rootDir, 'supabase/migrations/20260928000300_jeddah_asian_catalog.sql');
fs.writeFileSync(migrationPath, migrationSql, 'utf8');
console.log('Successfully written Asian migration to:', migrationPath);
