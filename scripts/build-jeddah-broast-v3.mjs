import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CANONICAL_DISTRICTS = new Set([
  'al_sheraa', 'al_hamdaniyah', 'abhur_al_shamaliyah', 'abhur_al_janoubiyah',
  'al_murjan', 'al_basateen', 'al_mohammadiyyah', 'al_naeem', 'al_marwah',
  'al_shati', 'al_bawadi', 'al_salamah', 'al_zahra', 'al_safa', 'al_samer',
  'al_faisaliyyah', 'al_rawdah', 'al_khalidiyyah', 'al_rehab', 'al_andalus',
  'al_hamra', 'al_naseem', 'al_ruwais', 'al_faiha', 'al_balad', 'al_thaghr'
]);

const existingCoords = JSON.parse(fs.readFileSync(path.join(rootDir, 'tmp/broast-existing-branch-coords.json'), 'utf8'));

// Helper to construct Maps URL
function makeMapsUrl(placeId) {
  return `https://www.google.com/maps/search/?api=1&query_place_id=${placeId}`;
}

// Helper to determine status and reason
function branchStatus(canonicalDistrict) {
  if (canonicalDistrict && CANONICAL_DISTRICTS.has(canonicalDistrict)) {
    return {
      status: 'production_ready',
      reason: null
    };
  }
  return {
    status: 'usable_with_caution',
    reason: 'Exact physical branch is verified, but canonical WeshNakul district is not safely resolved from the controlled whitelist.'
  };
}

// 1. ALBAIK
const albaik = {
  canonical_name: "ALBAIK",
  arabic_name: "البيك",
  modes: ["food"],
  primary_category: "broast",
  secondary_categories: ["traditional_broast", "fried_chicken", "musahab"],
  operating_status: "open",
  jeddah_presence: true,
  editorial_classification: "staple",
  classification_evidence: "Jeddah-founded Saudi fried chicken/broast institution with a very dense citywide footprint and exceptionally strong local recognition.",
  rotation_bucket: "anchor",
  coverage_strength: "ubiquitous",
  branch_list_complete: false,
  branch_research_strategy: "representative_verified_sample",
  healthy: false,
  context_tags: ["quick_bite", "delivery_strong", "late_night"],
  meal_fit: ["lunch", "dinner", "late_night"],
  price_positioning: "budget_affordable",
  signature_dishes: ["broast chicken", "chicken musahab", "garlic sauce"],
  confidence: "high",
  production_eligibility: "production_ready",
  sources: [
    "https://www.albaik.com/",
    "https://www.albaik.com/branches"
  ],
  last_verified_at: "2026-09-26",
  branches: [
    {
      branch_name: "Al Sharafiyah – King Abdullah Rd",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "King Abdullah Rd, Al Sharafeyah, Jeddah 22234, Saudi Arabia",
      raw_district: "Al Sharafeyah",
      canonical_district: null,
      google_place_id: "ChIJe8s_Y7DPwxURnq35SRzMRpo",
      google_maps_url: makeMapsUrl("ChIJe8s_Y7DPwxURnq35SRzMRpo"),
      google_maps_url_method: "exact_google_place_id",
      latitude: existingCoords["ChIJe8s_Y7DPwxURnq35SRzMRpo"]?.lat ?? null,
      longitude: existingCoords["ChIJe8s_Y7DPwxURnq35SRzMRpo"]?.lng ?? null,
      google_rating: 4.4,
      google_review_count: 13097,
      operating_status: "open",
      hours: "07:30–02:00",
      phone: "+9668002442245",
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification"],
      ...branchStatus(null)
    },
    {
      branch_name: "Al Muhammadiyyah",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "Al-Madinah Al-Munawarah Rd, Al Mohammadiyyah, Jeddah 23624, Saudi Arabia",
      raw_district: "Al Mohammadiyyah",
      canonical_district: "al_mohammadiyyah",
      google_place_id: "ChIJD-9adirQwxURzfEDl0QI_yE",
      google_maps_url: makeMapsUrl("ChIJD-9adirQwxURzfEDl0QI_yE"),
      google_maps_url_method: "exact_google_place_id",
      latitude: existingCoords["ChIJD-9adirQwxURzfEDl0QI_yE"]?.lat ?? null,
      longitude: existingCoords["ChIJD-9adirQwxURzfEDl0QI_yE"]?.lng ?? null,
      google_rating: 4.4,
      google_review_count: 10080,
      operating_status: "open",
      hours: "09:00–02:00",
      phone: "+9668002442245",
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification"],
      ...branchStatus("al_mohammadiyyah")
    },
    {
      branch_name: "Obhur Al Shamaliyah",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "Aabir Al Qarath St, Obhur Al-Shamaliyah, Jeddah 23817, Saudi Arabia",
      raw_district: "Al Qarath",
      canonical_district: "abhur_al_shamaliyah",
      google_place_id: "ChIJzSoP9gJjwRUR_zcZJhPLrrw",
      google_maps_url: makeMapsUrl("ChIJzSoP9gJjwRUR_zcZJhPLrrw"),
      google_maps_url_method: "exact_google_place_id",
      latitude: existingCoords["ChIJzSoP9gJjwRUR_zcZJhPLrrw"]?.lat ?? null,
      longitude: existingCoords["ChIJzSoP9gJjwRUR_zcZJhPLrrw"]?.lng ?? null,
      google_rating: 4.3,
      google_review_count: 8220,
      operating_status: "open",
      hours: "07:00–02:30",
      phone: "+9668002442245",
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification"],
      ...branchStatus("abhur_al_shamaliyah")
    },
    {
      branch_name: "Al Safa",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "7753 3293 Prince Mutaib bin Abdulaziz Rd, Al-Safa, Jeddah 23456, Saudi Arabia",
      raw_district: null,
      canonical_district: "al_safa",
      google_place_id: "ChIJYZ1fGiPRwxURQXIwfgS8b3Y",
      google_maps_url: makeMapsUrl("ChIJYZ1fGiPRwxURQXIwfgS8b3Y"),
      google_maps_url_method: "exact_google_place_id",
      latitude: existingCoords["ChIJYZ1fGiPRwxURQXIwfgS8b3Y"]?.lat ?? null,
      longitude: existingCoords["ChIJYZ1fGiPRwxURQXIwfgS8b3Y"]?.lng ?? null,
      google_rating: 4.3,
      google_review_count: 12693,
      operating_status: "open",
      hours: "09:00–02:00",
      phone: "+9668002442245",
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification"],
      ...branchStatus("al_safa")
    },
    {
      branch_name: "King Abdulaziz International Airport T1",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "King Abdulaziz International Airport, Terminal 1, Jeddah 23631, Saudi Arabia",
      raw_district: null,
      canonical_district: null,
      google_place_id: "ChIJCQwA0vHXwxURrRfzuvODqn8",
      google_maps_url: makeMapsUrl("ChIJCQwA0vHXwxURrRfzuvODqn8"),
      google_maps_url_method: "exact_google_place_id",
      latitude: existingCoords["ChIJCQwA0vHXwxURrRfzuvODqn8"]?.lat ?? null,
      longitude: existingCoords["ChIJCQwA0vHXwxURrRfzuvODqn8"]?.lng ?? null,
      google_rating: 4.2,
      google_review_count: 3587,
      operating_status: "open",
      hours: "24 hours",
      phone: "+9668002442245",
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification"],
      ...branchStatus(null)
    },
    {
      branch_name: "Al Baghdadiyah Al Sharqiyah",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "King Khalid Road, Al-Baghdadiyah Al-Sharqiyah, Jeddah 22241, Saudi Arabia",
      raw_district: null,
      canonical_district: null,
      google_place_id: "ChIJbT4rKq3PwxURGSunZl-GxrM",
      google_maps_url: makeMapsUrl("ChIJbT4rKq3PwxURGSunZl-GxrM"),
      google_maps_url_method: "exact_google_place_id",
      latitude: existingCoords["ChIJbT4rKq3PwxURGSunZl-GxrM"]?.lat ?? null,
      longitude: existingCoords["ChIJbT4rKq3PwxURGSunZl-GxrM"]?.lng ?? null,
      google_rating: 4.3,
      google_review_count: 6789,
      operating_status: "open",
      hours: null,
      phone: null,
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification"],
      ...branchStatus(null)
    }
  ],
  manual_review_notes: [
    "Do not interpret the sampled branch list as the full ALBAIK footprint.",
    "Add more exact branch addresses/Maps URLs only when needed for Nearby coverage gaps."
  ],
  delivery_platform_presence: {
    hungerstation: {
      investigated: true,
      presence: "yes",
      direct_url: "https://hungerstation.com/sa-ar/restaurants/regions/%D8%AC%D8%AF%D9%87/%D8%A7%D9%84%D9%82%D8%B1%D9%8A%D9%86%D9%8A%D8%A9/%D8%A7%D9%84%D8%A8%D9%8A%D9%83-119725",
      verification_date: "2026-09-26"
    },
    jahez: { investigated: true, presence: "unknown", direct_url: null, verification_date: "2026-09-26" },
    keeta: { investigated: true, presence: "unknown", direct_url: null, verification_date: "2026-09-26" }
  },
  is_city_wide: true
};

// 2. Chicken Mubeen
const chickenMubeen = {
  canonical_name: "Chicken Mubeen",
  arabic_name: "دجاج مبين",
  modes: ["food"],
  primary_category: "broast",
  secondary_categories: ["traditional_broast", "fried_chicken"],
  operating_status: "open",
  jeddah_presence: true,
  editorial_classification: "staple",
  classification_evidence: "Pioneering Jeddah broast institution founded in 1985 (over 40 years of continuous operation), centered on Macarona Rd with multi-district presence.",
  rotation_bucket: "anchor",
  coverage_strength: "multi_location",
  branch_list_complete: true,
  branch_research_strategy: "substantial_current_list",
  healthy: false,
  context_tags: ["traditional_broast", "local", "quick_bite", "delivery_strong", "late_night"],
  meal_fit: ["lunch", "dinner", "late_night"],
  price_positioning: "affordable",
  signature_dishes: ["traditional broast chicken", "crispy spicy broast", "garlic sauce"],
  confidence: "high",
  production_eligibility: "production_ready",
  sources: [
    "https://chickenmubeen.com/",
    "https://chickenmubeen.com/branches"
  ],
  last_verified_at: "2026-09-26",
  branches: [
    {
      branch_name: "Ar Rabwah – Macarona Rd (Flagship)",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "Al Makarunah Rd, Ar Rabwah, Jeddah 23449, Saudi Arabia",
      raw_district: "Ar Rabwah",
      canonical_district: null,
      google_place_id: "ChIJU-UMp8PQwxURVWFNc06Gd1I",
      google_maps_url: makeMapsUrl("ChIJU-UMp8PQwxURVWFNc06Gd1I"),
      google_maps_url_method: "exact_google_place_id",
      latitude: 21.6020975,
      longitude: 39.1829156,
      google_rating: 4.4,
      google_review_count: 2258,
      operating_status: "open",
      hours: "13:00–03:00",
      phone: "+966126780000",
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification", "Official brand website"],
      ...branchStatus(null)
    },
    {
      branch_name: "Al Safa",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "Prince Mutaib bin Abdulaziz Rd, Al-Safa, Jeddah 23433, Saudi Arabia",
      raw_district: "Al-Safa",
      canonical_district: "al_safa",
      google_place_id: "ChIJiVvkzsLRwxURE9y4GXC76zk",
      google_maps_url: makeMapsUrl("ChIJiVvkzsLRwxURE9y4GXC76zk"),
      google_maps_url_method: "exact_google_place_id",
      latitude: 21.5920938,
      longitude: 39.2044745,
      google_rating: 4.3,
      google_review_count: 1462,
      operating_status: "open",
      hours: "13:00–03:00",
      phone: "+966126780000",
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification", "Official brand website"],
      ...branchStatus("al_safa")
    },
    {
      branch_name: "An Nuzhah – Hira St",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "Hira St, An Nuzhah, Jeddah 23433, Saudi Arabia",
      raw_district: "An Nuzhah",
      canonical_district: null,
      google_place_id: "ChIJj9AP0nLRwxURpVsCyFm3p-4",
      google_maps_url: makeMapsUrl("ChIJj9AP0nLRwxURpVsCyFm3p-4"),
      google_maps_url_method: "exact_google_place_id",
      latitude: 21.6175749,
      longitude: 39.1736708,
      google_rating: 4.3,
      google_review_count: 1506,
      operating_status: "open",
      hours: "13:00–03:00",
      phone: "+966126780000",
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification", "Official brand website"],
      ...branchStatus(null)
    },
    {
      branch_name: "Al Bawadi",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "7077 Yahya Husayn, Al Bawadi, Jeddah 23443, Saudi Arabia",
      raw_district: "Al Bawadi",
      canonical_district: "al_bawadi",
      google_place_id: "ChIJM6rwFQDRwxURGzwQG_Lmauc",
      google_maps_url: makeMapsUrl("ChIJM6rwFQDRwxURGzwQG_Lmauc"),
      google_maps_url_method: "exact_google_place_id",
      latitude: 21.5894822,
      longitude: 39.1653022,
      google_rating: 4.3,
      google_review_count: 180,
      operating_status: "open",
      hours: "13:00–03:00",
      phone: "+966126780000",
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification", "Official brand website"],
      ...branchStatus("al_bawadi")
    },
    {
      branch_name: "Al Sheraa – Prince Nayef Rd",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "7925 Prince Nayef Rd, Al Sheraa, Jeddah 23816, Saudi Arabia",
      raw_district: "Al Sheraa",
      canonical_district: "al_sheraa",
      google_place_id: "ChIJffZlcQBjwRURUxv7LEAGQXs",
      google_maps_url: makeMapsUrl("ChIJffZlcQBjwRURUxv7LEAGQXs"),
      google_maps_url_method: "exact_google_place_id",
      latitude: 21.7721779,
      longitude: 39.1005906,
      google_rating: 4.4,
      google_review_count: 709,
      operating_status: "open",
      hours: "13:00–03:00",
      phone: "+966126780000",
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification", "Official brand website"],
      ...branchStatus("al_sheraa")
    },
    {
      branch_name: "Al Hamdaniyah",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "Al Qasim Ibn Umayyah, Al Hamadaniyyah, Jeddah 29288, Saudi Arabia",
      raw_district: "Al Hamadaniyyah",
      canonical_district: "al_hamdaniyah",
      google_place_id: "ChIJdX-GLHV9wRURqolRJNdpkZA",
      google_maps_url: makeMapsUrl("ChIJdX-GLHV9wRURqolRJNdpkZA"),
      google_maps_url_method: "exact_google_place_id",
      latitude: 21.7582758,
      longitude: 39.1895399,
      google_rating: 4.2,
      google_review_count: 1256,
      operating_status: "open",
      hours: "13:00–03:00",
      phone: "+966126780000",
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification", "Official brand website"],
      ...branchStatus("al_hamdaniyah")
    },
    {
      branch_name: "Al Marwah",
      physical_existence: "verified",
      city: "Jeddah",
      formatted_address: "8243 Hira St, Al Marwah, Jeddah 23541, Saudi Arabia",
      raw_district: "Al Marwah",
      canonical_district: "al_marwah",
      google_place_id: "ChIJ89NsNgDXwxURFALBePqQvq0",
      google_maps_url: makeMapsUrl("ChIJ89NsNgDXwxURFALBePqQvq0"),
      google_maps_url_method: "exact_google_place_id",
      latitude: 21.6201984,
      longitude: 39.1894411,
      google_rating: 4.2,
      google_review_count: 310,
      operating_status: "open",
      hours: "13:00–03:00",
      phone: "+966126780000",
      verification_date: "2026-09-26",
      provenance: ["Google business/location verification", "Official brand website"],
      ...branchStatus("al_marwah")
    }
  ],
  delivery_platform_presence: {
    hungerstation: {
      investigated: true,
      presence: "yes",
      direct_url: "https://hungerstation.com/sa-ar/restaurants/regions/%D8%AC%D8%AF%D9%87/%D8%A7%D9%84%D8%B1%D8%A8%D9%88%D8%A9/%D8%AF%D8%AC%D8%A7%D8%AC-%D9%85%D8%A8%D9%8A%D9%86-10492",
      verification_date: "2026-09-26"
    },
    jahez: { investigated: true, presence: "unknown", direct_url: null, verification_date: "2026-09-26" },
    keeta: { investigated: true, presence: "unknown", direct_url: null, verification_date: "2026-09-26" }
  },
  is_city_wide: false
};

// Write builder file and execute
fs.writeFileSync(path.join(rootDir, 'tmp/broast-builder-partial.json'), JSON.stringify({ albaik, chickenMubeen }, null, 2));
console.log('Partial builder written successfully');
