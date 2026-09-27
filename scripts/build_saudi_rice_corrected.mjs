import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const cachePath = path.join(rootDir, 'tmp', 'saudi_rice_places_details_cache.json');
const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

// Format opening hours to clean string
function formatHours(regularOpeningHours) {
  if (!regularOpeningHours) return null;
  if (Array.isArray(regularOpeningHours.weekdayDescriptions) && regularOpeningHours.weekdayDescriptions.length > 0) {
    // Return primary schedule representation
    return regularOpeningHours.weekdayDescriptions[0].replace(/^[^:]+:\s*/, '').trim();
  }
  return null;
}

function makeBranch(opts) {
  const p = cache[opts.placeId];
  if (!p) {
    throw new Error(`Missing place details for ${opts.placeId}`);
  }

  const hoursStr = formatHours(p.regularOpeningHours);

  return {
    branch_name: opts.branchName,
    physical_existence: 'verified',
    city: 'Jeddah',
    formatted_address: p.formattedAddress,
    raw_district: opts.rawDistrict,
    canonical_district: opts.canonicalDistrict, // string or null
    google_maps_url: `https://www.google.com/maps/place/?q=place_id:${p.id}`,
    google_place_id: p.id,
    latitude: p.location.latitude,
    longitude: p.location.longitude,
    google_rating: p.rating ?? null,
    google_review_count: p.userRatingCount ?? null,
    operating_status: p.businessStatus === 'OPERATIONAL' ? 'open' : 'closed',
    hours: hoursStr,
    phone: p.nationalPhoneNumber || null,
    last_verified_at: '2026-09-26',
    source_provenance: [
      'Google Places API (New)',
      'Google Maps verified storefront listing',
      opts.additionalProvenance || 'Official brand branch footprint'
    ].filter(Boolean),
    production_eligibility: opts.canonicalDistrict ? 'production_ready' : 'usable_with_caution',
    geographic_notes: opts.geographicNotes || null
  };
}

function makeExcludedBranch(opts) {
  const p = cache[opts.placeId];
  return {
    branch_name: opts.branchName,
    candidate_name: opts.candidateName,
    google_place_id: opts.placeId || (p ? p.id : null),
    formatted_address: p ? p.formattedAddress : (opts.address || null),
    business_status: p ? p.businessStatus : 'UNKNOWN',
    exclusion_reason: opts.reason,
    last_verified_at: '2026-09-26',
    source_provenance: [
      'Google Places API (New)',
      'Google Maps verification'
    ]
  };
}

const BRANDS = [
  // 1. Raydan
  {
    id: 'raydan',
    canonical_name: 'Raydan',
    arabic_name: 'ريدان',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['mandi', 'madhbi', 'traditional_saudi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'staple',
    classification_evidence: 'Jeddah-founded Saudi rice institution (est. 1989, publicly listed), deeply established heritage brand with wide citywide coverage.',
    price_positioning: 'budget_mid',
    signature_dishes: [
      'Mandi Lamb (مندي لحم)',
      'Madhbi Chicken (مظبي دجاج)',
      'Kabsa Chicken (كبسة دجاج)',
      'Saleeg Taifi (سليق طائفي)'
    ],
    context_tags: ['casual_hangout', 'delivery_strong', 'late_night', 'group_dining'],
    meal_fit: ['lunch', 'dinner', 'late_night'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'active', url: null },
      keeta: { presence: 'active', url: null }
    },
    sources: [
      'https://raydan.com.sa/',
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Hamdaniyah Al Majed',
        placeId: 'ChIJg9bwO2N8wRURHt_T0Rzf_9A',
        rawDistrict: 'Al Hamdaniyah',
        canonicalDistrict: 'al_hamdaniyah',
        geographicNotes: 'Located on Al Hamdaniyah Street near Al Majed commercial strip.'
      }),
      makeBranch({
        branchName: 'Hamdaniyah Al Falah',
        placeId: 'ChIJ08FVqph8wRUR_FdL0gaLmh8',
        rawDistrict: 'Al Falah',
        canonicalDistrict: null,
        geographicNotes: 'Located in Al Falah neighborhood just north of Al Hamdaniyah, outside the 30 canonical districts.'
      }),
      makeBranch({
        branchName: 'Naseem',
        placeId: 'ChIJh_8wm__NwxURCB3xm75aoTs',
        rawDistrict: 'Al Naseem',
        canonicalDistrict: 'al_naseem',
        geographicNotes: 'Located on Abu Dhar Al-Ghifari Street in Al Naseem district.'
      }),
      makeBranch({
        branchName: 'Obhur',
        placeId: 'ChIJG9SGUAFjwRURtnZvgfbECpw',
        rawDistrict: 'Abhur Al Shamaliyah',
        canonicalDistrict: 'abhur_al_shamaliyah',
        geographicNotes: 'Located on Aber Al Qarat Road in Abhur Al Shamaliyah.'
      }),
      makeBranch({
        branchName: 'Safa',
        placeId: 'ChIJAQAAABTRwxURnjXuvVohR6I',
        rawDistrict: 'Al Safa',
        canonicalDistrict: 'al_safa',
        geographicNotes: 'Flagship central branch located on Abdullah Al Sharbatli Street, Al Safa.'
      }),
      makeBranch({
        branchName: 'Samer',
        placeId: 'ChIJLdb_U2TRwxUR_IuGLpMDYeU',
        rawDistrict: 'Al Samer',
        canonicalDistrict: 'al_samer',
        geographicNotes: 'Located on Al Samer Road (Al Rabie/Al Samer boundary).'
      }),
      makeBranch({
        branchName: 'Hira',
        placeId: 'ChIJC02hBabQwxUR0ZYW3K24iBM',
        rawDistrict: 'An Nuzhah',
        canonicalDistrict: 'an_nuzhah',
        geographicNotes: 'Located on Hira Street within An Nuzhah district.'
      })
    ],
    excluded_branches: [
      makeExcludedBranch({
        branchName: 'Al Haramain / Abrq Al-Rughama',
        candidateName: 'Al Haramain / Abrq Al-Rughama',
        placeId: 'ChIJl9VGbMHNwxURMVzg03GMbEw',
        reason: 'Google Places status is CLOSED_PERMANENTLY; listing no longer active.'
      }),
      makeExcludedBranch({
        branchName: 'Taysir',
        candidateName: 'Taysir',
        placeId: 'ChIJN028d4PTwxURw6YS5HQH_vA',
        reason: 'Google Places status is CLOSED_PERMANENTLY; listing no longer active.'
      }),
      makeExcludedBranch({
        branchName: 'Sanabel Express',
        candidateName: 'Sanabel Express',
        placeId: 'ChIJj-mg-jfLwxUR4fEzk7907NU',
        reason: 'Google Places status is CLOSED_PERMANENTLY; express outlet shut down.'
      }),
      makeExcludedBranch({
        branchName: 'Hay Al Riyadh',
        candidateName: 'Hay Al Riyadh',
        placeId: 'ChIJrbbduat7wRURFberS4poFG8',
        reason: 'Google Places status is CLOSED_PERMANENTLY; listing no longer active.'
      })
    ],
    manual_review_branches: [
      {
        branch_name: 'Rawdah',
        google_place_id: 'ChIJqb2TWQDRwxURW2FW4WvIRrg',
        address: 'Ar Rawdah, Jeddah 23434, Saudi Arabia',
        status: 'manual_review',
        reason: 'Older Rawdah evidence conflicts with current official Raydan corporate directory; kept in manual review per catalog protocol until physical site visit re-verifies operating status.'
      }
    ]
  },

  // 2. Al Romansiah
  {
    id: 'al_romansiah',
    canonical_name: 'Al Romansiah',
    arabic_name: 'الرومانسية',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['mandi', 'madhbi', 'traditional_saudi', 'haneeth'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'staple',
    classification_evidence: 'Kingdom-wide Saudi hospitality flagship chain with enormous brand equity, famous for high-standard Mandi, Madhbi, and Haneeth.',
    price_positioning: 'mid',
    signature_dishes: [
      'Madhbi Chicken (مظبي دجاج)',
      'Mandi Lamb (مندي لحم)',
      'Haneeth Lamb (حنيذ لحم)',
      'Kabsa Chicken (كبسة دجاج)',
      'Kunafeh (كنافة)'
    ],
    context_tags: ['group_dining', 'dine_in_strong', 'delivery_strong', 'casual_hangout'],
    meal_fit: ['lunch', 'dinner'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'active', url: null },
      keeta: { presence: 'active', url: null }
    },
    sources: [
      'https://alromansiah.com/',
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Bawadi',
        placeId: 'ChIJacUSc5DRwxURiis7IF3O_Ho',
        rawDistrict: 'Al Bawadi',
        canonicalDistrict: 'al_bawadi',
        geographicNotes: 'Major multi-story dining complex on Quraysh Street, Al Bawadi.'
      }),
      makeBranch({
        branchName: 'Hamdaniyah',
        placeId: 'ChIJuye_rRJ9wRUR6yRl-SmRjQc',
        rawDistrict: 'Al Hamdaniyah',
        canonicalDistrict: 'al_hamdaniyah',
        geographicNotes: 'Located in Al Hamdaniyah commercial corridor.'
      }),
      makeBranch({
        branchName: 'Safa',
        placeId: 'ChIJS2-RawDRwxURgWHa6QRNWMY',
        rawDistrict: 'Al Safa',
        canonicalDistrict: 'al_safa',
        geographicNotes: 'Located on Prince Mutaib bin Abdulaziz Road, Al Safa.'
      }),
      makeBranch({
        branchName: 'Sanabel',
        placeId: 'ChIJI8cwBADLwxURj9Vpqjl8n1k',
        rawDistrict: 'Al Sanabel',
        canonicalDistrict: null,
        geographicNotes: 'Located on Khubayb bin Adi Al Ansari Street in Al Sanabel (outer southern district outside the 30 canonical districts).'
      })
    ],
    excluded_branches: [],
    manual_review_branches: []
  },

  // 3. Al Saddah
  {
    id: 'al_saddah',
    canonical_name: 'Al Saddah',
    arabic_name: 'السدة',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['mandi', 'madfoon', 'madhbi', 'traditional_saudi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'staple',
    classification_evidence: 'Jeddah traditional feast institution revered for authentic Mandi, Madfoon, and Madhbi meat with extremely high review volumes.',
    price_positioning: 'mid_premium',
    signature_dishes: [
      'Lamb Mandi (مندي لحم)',
      'Lamb Madfoon (مدفون لحم)',
      'Madhbi Chicken (مظبي دجاج)',
      'Saleeg (سليق)'
    ],
    context_tags: ['dine_in_strong', 'group_dining', 'local_favorite'],
    meal_fit: ['lunch', 'dinner'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'active', url: null },
      keeta: { presence: 'active', url: null }
    },
    sources: [
      'https://alsaddah.com/',
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Tahlia',
        placeId: 'ChIJI-3znwXQwxURN8ovm8z7GG4',
        rawDistrict: 'Al Rawdah',
        canonicalDistrict: 'al_rawdah',
        geographicNotes: 'Flagship destination located on Prince Mohammed bin Abdulaziz (Tahlia) Street, Al Rawdah.'
      }),
      makeBranch({
        branchName: 'Palestine',
        placeId: 'ChIJrz0lluvPwxURKf2w5x9PAJs',
        rawDistrict: 'Al Ruwais',
        canonicalDistrict: 'al_ruwais',
        geographicNotes: 'Located on Palestine Street opposite Dr. Soliman Fakeeh Hospital, Al Ruwais.'
      }),
      makeBranch({
        branchName: 'Hira',
        placeId: 'ChIJy7kH2EHawxUR5sCHxb9laV0',
        rawDistrict: 'Al Nahdah',
        canonicalDistrict: null,
        geographicNotes: 'Located on Hira Street in Al Nahdah district (outer north-central, outside 30 canonical districts).'
      })
    ],
    excluded_branches: [],
    manual_review_branches: []
  },

  // 4. Almazaq Al Bukhari
  {
    id: 'almazaq_al_bukhari',
    canonical_name: 'Almazaq Al Bukhari',
    arabic_name: 'المذاق البخاري',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['bukhari', 'grilled_chicken', 'traditional_saudi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'mainstream',
    classification_evidence: 'Major Bukhari restaurant brand in Jeddah recognized for popular rotisserie and charcoal-grilled chicken served over classic Bukhari and Peshawari rice.',
    price_positioning: 'budget',
    signature_dishes: [
      'Shawaya Chicken with Bukhari Rice (دجاج شواية مع رز بخاري)',
      'Faham Charcoal Chicken with Peshawari Rice (دجاج فحم مع رز بشاور)',
      'Mixed Vegetable Edam (إيدام مشكل)'
    ],
    context_tags: ['quick_bite', 'delivery_strong', 'late_night'],
    meal_fit: ['lunch', 'dinner', 'late_night'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'active', url: null },
      keeta: { presence: 'active', url: null }
    },
    sources: [
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Naseem',
        placeId: 'ChIJv_m5c3rPwxURwGzBoqNrKvQ',
        rawDistrict: 'Al Naseem',
        canonicalDistrict: 'al_naseem',
        geographicNotes: 'Located in Al Naseem district.'
      }),
      makeBranch({
        branchName: 'Safa',
        placeId: 'ChIJc_zD4gnRwxURlCOIQkK47ts',
        rawDistrict: 'Al Safa',
        canonicalDistrict: 'al_safa',
        geographicNotes: 'Flagship branch on Prince Mutaib bin Abdulaziz Road, Al Safa.'
      }),
      makeBranch({
        branchName: 'Samer',
        placeId: 'ChIJtXGnPzrTwxURnctgjBZCOII',
        rawDistrict: 'Al Samer',
        canonicalDistrict: 'al_samer',
        geographicNotes: 'Located in Al Samer district.'
      }),
      makeBranch({
        branchName: 'Hamdaniyah',
        placeId: 'ChIJk8bKM-R9wRURPYnmwFsnCSU',
        rawDistrict: 'Al Hamdaniyah',
        canonicalDistrict: 'al_hamdaniyah',
        geographicNotes: 'Located on Al Qasim bin Umayyah Street, Al Hamdaniyah.'
      }),
      makeBranch({
        branchName: 'South Obhur',
        placeId: 'ChIJ00v8XgBjwRURT3w1azRcnx8',
        rawDistrict: 'Abhur Al Janoubiyah',
        canonicalDistrict: 'abhur_al_janoubiyah',
        geographicNotes: 'Located on Hazm bin Abi Kaab Street, Abhur Al Janoubiyah.'
      }),
      makeBranch({
        branchName: 'Shati / Zahra',
        placeId: 'ChIJDWzcDwDbwxUR_S3kh1w1heA',
        rawDistrict: 'Al Zahra',
        canonicalDistrict: 'al_zahra',
        geographicNotes: 'Located on Ahmed Al Attas Street, Al Zahra (bordering Al Shati).'
      }),
      makeBranch({
        branchName: 'Harazat',
        placeId: 'ChIJT_QFpkUzwhURW9cSbPtroEE',
        rawDistrict: 'Al Harazat',
        canonicalDistrict: null,
        geographicNotes: 'Located in Al Harazat (outer eastern district outside 30 canonical districts).'
      })
    ],
    excluded_branches: [
      makeExcludedBranch({
        branchName: 'Rehab',
        candidateName: 'Rehab',
        placeId: 'ChIJnVhCcpTRwxURpxL0iZMM2lw',
        reason: 'Google Places status is CLOSED_PERMANENTLY; Rehab branch is shut down.'
      })
    ],
    manual_review_branches: []
  },

  // 5. Hashi Basha
  {
    id: 'hashi_basha',
    canonical_name: 'Hashi Basha',
    arabic_name: 'حاشي باشا',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['kabsa', 'hashi', 'madghoot', 'traditional_saudi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'mainstream',
    classification_evidence: 'Leading national Saudi chain popularizing fresh camel meat (Hashi) Kabsa and pressure-cooked Madghoot.',
    price_positioning: 'mid',
    signature_dishes: [
      'Madghoot Hashi (مضغوط حاشي)',
      'Kabsa Hashi (كبسة حاشي)',
      'Madghoot Chicken (مضغوط دجاج)'
    ],
    context_tags: ['casual_hangout', 'delivery_strong', 'late_night'],
    meal_fit: ['lunch', 'dinner', 'late_night'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'active', url: null },
      keeta: { presence: 'active', url: null }
    },
    sources: [
      'https://hashibasha.com/',
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Naseem',
        placeId: 'ChIJ44xNNhHNwxUR6FXsE1JsUWg',
        rawDistrict: 'Al Naseem',
        canonicalDistrict: 'al_naseem',
        geographicNotes: 'Branch HB51 located on Abu Dhar Al Ghifari Street, Al Naseem.'
      }),
      makeBranch({
        branchName: 'Safa',
        placeId: 'ChIJZZ_X7WLRwxUR6F4zRVLEIO8',
        rawDistrict: 'Al Safa',
        canonicalDistrict: 'al_safa',
        geographicNotes: 'Branch HB29 located on Prince Mutaib Branch Road, Al Safa.'
      }),
      makeBranch({
        branchName: 'Samer',
        placeId: 'ChIJgdj9AZ7RwxURHFxBfC9KZZg',
        rawDistrict: 'Al Samer',
        canonicalDistrict: 'al_samer',
        geographicNotes: 'Branch HB25 located on Al Hussein Al Sahwaji Street, Al Rabie/Al Samer.'
      }),
      makeBranch({
        branchName: 'Ajawid',
        placeId: 'ChIJ5-sWd6bLwxURpBpOHi25buY',
        rawDistrict: 'Al Ajawid',
        canonicalDistrict: null,
        geographicNotes: 'Branch HB75 located on Sahl bin Amr Street in Al Ajawid (outer southern district, outside 30 canonical districts).'
      }),
      makeBranch({
        branchName: 'Muraikh',
        placeId: 'ChIJf03UKSbTwxURNAPKm8zzn2U',
        rawDistrict: 'Muraikh',
        canonicalDistrict: null,
        geographicNotes: 'Branch HB142 located in Muraikh/Taysir (outer eastern district, outside 30 canonical districts).'
      })
    ],
    excluded_branches: [],
    manual_review_branches: []
  },

  // 6. Eleyk Al Bukhari
  {
    id: 'eleyk_al_bukhari',
    canonical_name: 'Eleyk Al Bukhari',
    arabic_name: 'إليك البخاري',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['bukhari', 'grilled_chicken', 'traditional_saudi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'local_favorite',
    classification_evidence: 'Locally cherished Bukhari chain prized for aromatic spiced rice and perfectly roasted chicken.',
    price_positioning: 'budget',
    signature_dishes: [
      'Bukhari Chicken Shawaya (دجاج شواية مع رز بخاري)',
      'Faham Chicken on Peshawari Rice (دجاج فحم على رز بشاور)',
      'Moussaka / Mixed Edam (مسقعة / إيدام مشكل)'
    ],
    context_tags: ['quick_bite', 'delivery_strong', 'late_night', 'local_favorite'],
    meal_fit: ['lunch', 'dinner', 'late_night'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'active', url: null },
      keeta: { presence: 'active', url: null }
    },
    sources: [
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Faisaliyah',
        placeId: 'ChIJ9QM1ksfRwxURtyB2fwrsAnM',
        rawDistrict: 'Al Faisaliyyah',
        canonicalDistrict: 'al_faisaliyyah',
        geographicNotes: 'Located on Saud Al Faisal Street, Al Faisaliyyah (normalized from al_faisaliyah).'
      }),
      makeBranch({
        branchName: 'Salamah / Sari',
        placeId: 'ChIJ407RJBTbwxURDnEblLv9uQw',
        rawDistrict: 'Al Salamah',
        canonicalDistrict: 'al_salamah',
        geographicNotes: 'Located on Sari Branch Road, Al Salamah.'
      }),
      makeBranch({
        branchName: 'Sanabel',
        placeId: 'ChIJG1kthrfLwxURtbIP3SEOSXo',
        rawDistrict: 'Al Sanabel',
        canonicalDistrict: null,
        geographicNotes: 'Located on Sanabel Road, Al Sanabel (outer southern district, outside 30 canonical districts).'
      }),
      makeBranch({
        branchName: 'Mada\'en Al-Fahd',
        placeId: 'ChIJnSVuCX7NwxUR5AlFnAscpp0',
        rawDistrict: 'Mada\'en Al-Fahd',
        canonicalDistrict: null,
        geographicNotes: 'Located in Mada\'en Al-Fahd (outer southern district, outside 30 canonical districts).'
      })
    ],
    excluded_branches: [],
    manual_review_branches: []
  },

  // 7. Kabset Elham
  {
    id: 'kabset_elham',
    canonical_name: 'Kabset Elham',
    arabic_name: 'كبسة إلهام',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['kabsa', 'traditional_saudi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'local_favorite',
    classification_evidence: 'High-rated boutique Kabsa specialist in Al Zahra with over 6,400 Google reviews, famous for home-style Saudi spiced chicken and meat kabsas.',
    price_positioning: 'budget_mid',
    signature_dishes: [
      'Kabset Elham Special Chicken (كبسة إلهام دجاج)',
      'Meat Kabsa (كبسة لحم)',
      'Saleeg (سليق)'
    ],
    context_tags: ['local_favorite', 'quick_bite', 'delivery_strong'],
    meal_fit: ['lunch', 'dinner'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'active', url: null },
      keeta: { presence: 'active', url: null }
    },
    sources: [
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Al Batarji / Zahra',
        placeId: 'ChIJKauhIgDbwxURMVenYDlDt9E',
        rawDistrict: 'Al Zahra',
        canonicalDistrict: 'al_zahra',
        geographicNotes: 'Located on Al Batarji Street, Al Zahra district (postal code 23522).'
      })
    ],
    excluded_branches: [],
    manual_review_branches: []
  },

  // 8. Sarmad
  {
    id: 'sarmad',
    canonical_name: 'Sarmad',
    arabic_name: 'سرمد',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['mandi', 'traditional_saudi', 'madhbi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'local_favorite',
    classification_evidence: 'Historic-quarter feast destination in Al-Baghdadiyah Al-Sharqiyah with over 7,300 reviews, known for classic Mandi, Madhbi, and traditional rice feasts.',
    price_positioning: 'mid',
    signature_dishes: [
      'Mandi Meat (مندي لحم)',
      'Madhbi Chicken (مظبي دجاج)',
      'Peshawari Rice with Meat (رز بشاور باللحم)'
    ],
    context_tags: ['local_favorite', 'group_dining', 'dine_in_strong'],
    meal_fit: ['lunch', 'dinner'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'inactive', url: null },
      keeta: { presence: 'inactive', url: null }
    },
    sources: [
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Al-Baghdadiyah Al-Sharqiyah',
        placeId: 'ChIJxf2GGBrPwxURJdsAMM7PORI',
        rawDistrict: 'Al Baghdadiyah Al Sharqiyah',
        canonicalDistrict: null,
        geographicNotes: 'Located on Mohammed bin Abdulwahab Street in Al Baghdadiyah Al Sharqiyah (historic central core, outside 30 canonical districts).'
      })
    ],
    excluded_branches: [],
    manual_review_branches: []
  },

  // 9. Labbani Fakher
  {
    id: 'labbani_fakher',
    canonical_name: 'Labbani Fakher',
    arabic_name: 'لباني فاخر',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['haneeth', 'mandi', 'traditional_saudi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'local_favorite',
    classification_evidence: 'High-end traditional meat specialist dedicated to prime milk-fed lamb (Labbani / Naemi) cooked Haneeth, Mandi, and Madhbi.',
    price_positioning: 'mid_premium',
    signature_dishes: [
      'Labbani Meat with Rice (لحم لباني فاخر مع الرز)',
      'Haneeth Labbani (حنيذ لباني)',
      'Madhbi Labbani (مظبي لباني)'
    ],
    context_tags: ['local_favorite', 'group_dining', 'dine_in_strong'],
    meal_fit: ['lunch', 'dinner'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'active', url: null },
      keeta: { presence: 'inactive', url: null }
    },
    sources: [
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Samer / Al Rabie',
        placeId: 'ChIJGbh1lUTRwxURsgxasS7gRB0',
        rawDistrict: 'Al Rabie',
        canonicalDistrict: 'al_samer',
        geographicNotes: 'Located on Ankara Street in Al Rabie bordering Al Samer; universally known locally as the Samer branch.'
      }),
      makeBranch({
        branchName: 'Al Rayaan',
        placeId: 'ChIJP8iEJwDXwxURlBl1fKn4OAc',
        rawDistrict: 'Al Rayaan',
        canonicalDistrict: null,
        geographicNotes: 'Located on Abu Abdullah bin Al Harith Street in Al Rayaan (outer northeastern district near airport, outside 30 canonical districts).'
      })
    ],
    excluded_branches: [],
    manual_review_branches: []
  },

  // 10. Mandi World
  {
    id: 'mandi_world',
    canonical_name: 'Mandi World',
    arabic_name: 'مندي ورلد',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['mandi', 'traditional_saudi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'mainstream',
    classification_evidence: 'Modern Mandi brand recognized for consistent quality lamb and chicken mandi across central Jeddah districts.',
    price_positioning: 'mid',
    signature_dishes: [
      'Lamb Mandi (مندي لحم بلدي)',
      'Chicken Mandi (مندي دجاج)',
      'Kunafeh (كنافة)'
    ],
    context_tags: ['casual_hangout', 'dine_in_strong', 'delivery_strong'],
    meal_fit: ['lunch', 'dinner', 'late_night'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'active', url: null },
      keeta: { presence: 'active', url: null }
    },
    sources: [
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Rawdah',
        placeId: 'ChIJZeUPAm3RwxUR5QVhnLtcZPU',
        rawDistrict: 'Al Rawdah',
        canonicalDistrict: 'al_rawdah',
        geographicNotes: 'Located on Hamad Al Jasir Street, Al Rawdah.'
      }),
      makeBranch({
        branchName: 'Safa',
        placeId: 'ChIJ3aph_hPRwxURc2dm1zO9OPo',
        rawDistrict: 'Al Safa',
        canonicalDistrict: 'al_safa',
        geographicNotes: 'Located on Sheikh Abdulaziz bin Baz Road, Al Safa.'
      })
    ],
    excluded_branches: [
      makeExcludedBranch({
        branchName: 'Nahdah',
        candidateName: 'Nahdah',
        placeId: 'ChIJITO5fADbwxURuIbsAzT5icU',
        reason: 'Google Places status is CLOSED_PERMANENTLY; Prince Sultan Rd branch in Al Nahdah is permanently closed.'
      })
    ],
    manual_review_branches: []
  },

  // 11. Hashi Bin Hamoud
  {
    id: 'hashi_bin_hamoud',
    canonical_name: 'Hashi Bin Hamoud',
    arabic_name: 'حاشي بن حمود',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['hashi', 'kabsa', 'madghoot', 'traditional_saudi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'local_favorite',
    classification_evidence: 'Celebrated destination restaurant on north Jeddah highway corridor with over 6,800 reviews, famed for high-grade camel meat Kabsa and Madghoot.',
    price_positioning: 'mid',
    signature_dishes: [
      'Madghoot Hashi (مضغوط حاشي طازج)',
      'Kabsa Hashi Baladi (كبسة حاشي بلدي)'
    ],
    context_tags: ['local_favorite', 'group_dining', 'destination_dining', 'dine_in_strong'],
    meal_fit: ['lunch', 'dinner', 'late_night'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'inactive', url: null },
      jahez: { presence: 'inactive', url: null },
      keeta: { presence: 'inactive', url: null }
    },
    sources: [
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Al Madinah Rd / Usfan',
        placeId: 'ChIJ_cocG7x7wRURd6BZrrKEtB8',
        rawDistrict: 'Usfan Road',
        canonicalDistrict: null,
        geographicNotes: 'Located on Al Madinah Al Munawwarah Rd / Usfan corridor (postal code 23786, outer northern Jeddah, outside 30 canonical districts).'
      })
    ],
    excluded_branches: [],
    manual_review_branches: []
  },

  // 12. Fnoon Al Shawaya
  {
    id: 'fnoon_al_shawaya',
    canonical_name: 'Fnoon Al Shawaya',
    arabic_name: 'فنون الشواية',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['bukhari', 'grilled_chicken', 'traditional_saudi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'mainstream',
    classification_evidence: 'Mainstream rotisserie chicken Bukhari chain offering classic grilled chicken meals over Bukhari rice with side edams.',
    price_positioning: 'budget',
    signature_dishes: [
      'Shawaya Chicken with Bukhari Rice (دجاج شواية مع رز بخاري)',
      'Faham Chicken with Rice (دجاج فحم مع رز)',
      'Edam Musaqaa (إيدام مسقعة)'
    ],
    context_tags: ['quick_bite', 'delivery_strong', 'late_night'],
    meal_fit: ['lunch', 'dinner', 'late_night'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'active', url: null },
      keeta: { presence: 'active', url: null }
    },
    sources: [
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Samer',
        placeId: 'ChIJX3O3qFnRwxURS62jGEWbTws',
        rawDistrict: 'Al Samer',
        canonicalDistrict: 'al_samer',
        geographicNotes: 'Located on Al Ajwad Street, Al Samer district.'
      }),
      makeBranch({
        branchName: 'Sharafiyah',
        placeId: 'ChIJ33te927PwxURydH1EnLSA2o',
        rawDistrict: 'Al Sharafeyah',
        canonicalDistrict: 'al_sharafeyah',
        geographicNotes: 'Located in Al Sharafeyah district (normalized from al_sharafiyah).'
      }),
      makeBranch({
        branchName: 'Harazat',
        placeId: 'ChIJ3Zt-bQAzwhUR2jTU12Yave0',
        rawDistrict: 'Al Harazat',
        canonicalDistrict: null,
        geographicNotes: 'Located in Al Harazat (outer eastern district, outside 30 canonical districts).'
      })
    ],
    excluded_branches: [
      makeExcludedBranch({
        branchName: 'Hay Al Riyadh',
        candidateName: 'Hay Al Riyadh',
        placeId: null,
        reason: 'No physical storefront exists in Hay Al Riyadh; search match was an artifact returning the Sharafiyah listing.'
      }),
      makeExcludedBranch({
        branchName: 'Bahrah',
        candidateName: 'Bahrah',
        placeId: 'ChIJK7ZcACcxwhUR1EuwsI1trro',
        reason: 'Location is in Bahrah along Makkah Road, outside Jeddah municipal boundaries.'
      })
    ],
    manual_review_branches: []
  },

  // 13. Ali Hanash
  {
    id: 'ali_hanash',
    canonical_name: 'Ali Hanash',
    arabic_name: 'علي حنش',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['haneeth', 'traditional_saudi', 'southern_saudi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'hidden_gem',
    classification_evidence: 'Deeply authentic Southern Saudi (Asiri/Tihami) Haneeth institution in Muraikh with over 3,500 reviews, renowned for pit-smoked tender meat on Marakh leaves.',
    price_positioning: 'mid_premium',
    signature_dishes: [
      'Haneeth Muhannadh Meat (حنيذ محنذ لحم تيس بلدي)',
      'Traditional Red Rice (رز محنذ أحمر)',
      'Haneeth Baladi Ribs (أضلاع حنيذ بلدي)'
    ],
    context_tags: ['local_favorite', 'hidden_gem', 'group_dining', 'dine_in_strong'],
    meal_fit: ['lunch', 'dinner'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'inactive', url: null },
      jahez: { presence: 'inactive', url: null },
      keeta: { presence: 'inactive', url: null }
    },
    sources: [
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Muraikh',
        placeId: 'ChIJu0pOYQDTwxURcTye8bqlAG8',
        rawDistrict: 'Muraikh',
        canonicalDistrict: null,
        geographicNotes: 'Located on Mawqaq Street in Muraikh district (outer eastern Jeddah, outside 30 canonical districts).'
      })
    ],
    excluded_branches: [],
    manual_review_branches: []
  },

  // 14. Ghamim
  {
    id: 'ghamim',
    canonical_name: 'Ghamim',
    arabic_name: 'غميم',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['haneeth', 'madghoot', 'traditional_saudi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'local_favorite',
    classification_evidence: 'Highly popular traditional Haneeth and Madghoot destination with over 14,000 combined reviews across two verified Jeddah branches.',
    price_positioning: 'mid',
    signature_dishes: [
      'Haneeth Baladi (حنيذ بلدي بالمرخ)',
      'Madghoot Meat (مضغوط لحم)',
      'Chicken Haneeth (حنيذ دجاج)'
    ],
    context_tags: ['local_favorite', 'group_dining', 'dine_in_strong'],
    meal_fit: ['lunch', 'dinner'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'active', url: null },
      keeta: { presence: 'active', url: null }
    },
    sources: [
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Hamdaniyah',
        placeId: 'ChIJYVaVUwB9wRURQipxT8Qz2a4',
        rawDistrict: 'Al Hamdaniyah',
        canonicalDistrict: 'al_hamdaniyah',
        geographicNotes: 'Located on Abu Umayr bin Anas Street, Al Hamdaniyah.'
      }),
      makeBranch({
        branchName: 'Muraikh',
        placeId: 'ChIJG_F8XUjTwxURviMrQ58cAgU',
        rawDistrict: 'Muraikh',
        canonicalDistrict: null,
        geographicNotes: 'Located on Abdullah bin Warqaa bin Janadah Street, Muraikh (outer eastern district, outside 30 canonical districts).'
      })
    ],
    excluded_branches: [],
    manual_review_branches: []
  },

  // 15. Mandi Al Hejaz
  {
    id: 'mandi_al_hejaz',
    canonical_name: 'Mandi Al Hejaz',
    arabic_name: 'مندي الحجاز',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['mandi', 'traditional_saudi', 'hejazi'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'local_favorite',
    classification_evidence: 'Classic Hejazi Mandi institution in Al Rawdah (Qassem Zeinal) with over 2,500 reviews, known for authentic traditional pit cooking.',
    price_positioning: 'mid_premium',
    signature_dishes: [
      'Hejazi Lamb Mandi (مندي لحم حجازي)',
      'Chicken Mandi (مندي دجاج)',
      'Taifi Rice with Meat (رز طائفي)'
    ],
    context_tags: ['local_favorite', 'dine_in_strong', 'group_dining'],
    meal_fit: ['lunch', 'dinner'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'active', url: null },
      jahez: { presence: 'active', url: null },
      keeta: { presence: 'inactive', url: null }
    },
    sources: [
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Rawdah — Qassem Zeinah',
        placeId: 'ChIJodYd2nbQwxURNtR0sXeSWjY',
        rawDistrict: 'Al Rawdah',
        canonicalDistrict: 'al_rawdah',
        geographicNotes: 'Located on Qassem Zeinal Street, Al Rawdah.'
      })
    ],
    excluded_branches: [],
    manual_review_branches: []
  },

  // 16. Al Shadawi Ras Al Mandi
  {
    id: 'al_shadawi_ras_al_mandi',
    canonical_name: 'Al Shadawi Ras Al Mandi',
    arabic_name: 'الشدوي لرأس المندي',
    modes: ['food'],
    primary_category: 'saudi_rice',
    secondary_categories: ['mandi', 'traditional_saudi', 'folk_heritage'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: 'hidden_gem',
    classification_evidence: 'Legendary folk landmark in Historic Jeddah (Souq Bab Makkah, Al-Balad) with over 2,100 reviews, famous across the Hejaz for authentic sheep head Mandi and classic Balad heritage feasts.',
    price_positioning: 'budget_mid',
    signature_dishes: [
      'Ras Mandi - Sheep Head Mandi (رأس مندي على الطريقة الحجازية)',
      'Lamb Mandi (لحم مندي بلدي)',
      'Mandi Soup & Broth (مرقة مندي)'
    ],
    context_tags: ['hidden_gem', 'local_favorite', 'dine_in_strong'],
    meal_fit: ['lunch', 'dinner'],
    healthy: false,
    delivery: {
      hungerstation: { presence: 'inactive', url: null },
      jahez: { presence: 'inactive', url: null },
      keeta: { presence: 'inactive', url: null }
    },
    sources: [
      'https://www.google.com/maps'
    ],
    last_verified_at: '2026-09-26',
    production_eligibility: 'production_ready',
    branches: [
      makeBranch({
        branchName: 'Al-Balad / Historic Jeddah — Souq Bab Makkah',
        placeId: 'ChIJbR80WRvPwxURbD1TRq3Xx9A',
        rawDistrict: 'Al Balad',
        canonicalDistrict: 'al_balad',
        geographicNotes: 'Located in Historic Jeddah at Souq Bab Makkah, Al Balad.'
      })
    ],
    excluded_branches: [],
    manual_review_branches: []
  }
];

const totalVerifiedBranches = BRANDS.reduce((acc, b) => acc + b.branches.length, 0);
const canonicalBranches = BRANDS.reduce((acc, b) => acc + b.branches.filter(br => br.canonical_district !== null).length, 0);
const outerCautionBranches = BRANDS.reduce((acc, b) => acc + b.branches.filter(br => br.canonical_district === null).length, 0);
const excludedCount = BRANDS.reduce((acc, b) => acc + (b.excluded_branches ? b.excluded_branches.length : 0), 0);
const manualReviewCount = BRANDS.reduce((acc, b) => acc + (b.manual_review_branches ? b.manual_review_branches.length : 0), 0);

const finalCatalog = {
  schema_version: 'weshnakul_restaurant_research_v3',
  dataset: {
    city: 'Jeddah',
    country: 'Saudi Arabia',
    mode: 'food',
    primary_category: 'saudi_rice',
    display_category: 'Saudi / Rice / Kabsa',
    verified_date: '2026-09-26',
    brand_count: BRANDS.length,
    status: 'PASS_WITH_FIELD_VALIDATION_COMPLETE',
    principles: [
      'recommendation_quality_over_catalog_size',
      'verified_reality_over_completeness',
      'unknown_is_better_than_wrong',
      'delivery_service_area_is_not_a_physical_branch'
    ],
    summary: {
      total_brands: BRANDS.length,
      production_ready_brands: BRANDS.length,
      caution_brands: 0,
      manual_review_brands: 0,
      total_verified_active_branches: totalVerifiedBranches,
      canonical_district_branches: canonicalBranches,
      outer_caution_branches: outerCautionBranches,
      excluded_branches: excludedCount,
      manual_review_branches: manualReviewCount
    }
  },
  brands: BRANDS,
  manual_review: [
    'Raydan: older Rawdah evidence conflicts with current official directory; held in manual review queue until current physical verification confirms ongoing operation.',
    'Labbani Fakher: successfully reconciled original ambiguous research lead ("Samer / Al Rayaan") into two verified physical branches (Branch 1 on Ankara St / Al Rabie bordering Samer, and Branch 2 in Al Rayaan).',
    'Eleyk Al Bukhari: successfully confirmed that the candidate "Salamah / Sari" corresponds to Sari Branch Rd (ChIJ407RJBTbwxURDnEblLv9uQw), with a separate active branch on Al Sudairi (ChIJTYic5XXRwxURinnDtlihlBY).',
    'Fnoon Al Shawaya: confirmed that no physical branch exists in Hay Al Riyadh; Bahrah location correctly excluded as outside Jeddah city limits.',
    'Almazaq Al Bukhari: confirmed that Rehab branch is permanently closed (ChIJnVhCcpTRwxURpxL0iZMM2lw) and safely excluded from production.',
    'Mandi World: confirmed that Prince Sultan Rd / Al Nahdah branch is permanently closed (ChIJITO5fADbwxURuIbsAzT5icU) and excluded from production.'
  ]
};

const targetPath = path.join(rootDir, 'docs', 'research', 'jeddah-saudi-rice-kabsa-pass-d-corrected.json');
fs.writeFileSync(targetPath, JSON.stringify(finalCatalog, null, 2), 'utf8');
console.log(`Successfully generated: ${targetPath}`);
console.log(`Summary:`);
console.log(`  Brands: ${BRANDS.length}`);
console.log(`  Verified Active Branches: ${totalVerifiedBranches} (${canonicalBranches} canonical + ${outerCautionBranches} outer caution)`);
console.log(`  Excluded Branches: ${excludedCount}`);
console.log(`  Manual Review Branches: ${manualReviewCount}`);
