import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load API key securely without logging or exposing it
function getApiKey() {
  if (process.env.GOOGLE_MAPS_KEY) return process.env.GOOGLE_MAPS_KEY.trim();
  const envLocalPath = path.join(rootDir, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const match = fs.readFileSync(envLocalPath, 'utf8').match(/^GOOGLE_MAPS_KEY=(.+)$/m);
    if (match) return match[1].trim();
  }
  return null;
}

const API_KEY = getApiKey();
if (!API_KEY) {
  console.error('ERROR: GOOGLE_MAPS_KEY is not set in environment or .env.local');
  process.exit(1);
}

// Canonical Jeddah districts from src/data/jeddahDistricts.ts
const CANONICAL_DISTRICTS = new Set([
  'al_sheraa', 'al_hamdaniyah', 'abhur_al_shamaliyah', 'abhur_al_janoubiyah',
  'al_murjan', 'al_basateen', 'al_mohammadiyyah', 'al_naeem', 'al_marwah',
  'al_shati', 'al_bawadi', 'al_salamah', 'al_zahra', 'al_safa', 'al_samer',
  'al_faisaliyyah', 'al_rawdah', 'al_khalidiyyah', 'al_rehab', 'al_andalus',
  'al_hamra', 'al_naseem', 'al_ruwais', 'al_faiha', 'al_balad', 'al_thaghr'
]);

const ALIAS_MAP = new Map([
  ['rawdah', 'al_rawdah'], ['ar rawdah', 'al_rawdah'], ['al rawdah', 'al_rawdah'], ['الروضة', 'al_rawdah'],
  ['zahra', 'al_zahra'], ['al zahra', 'al_zahra'], ['الزهراء', 'al_zahra'],
  ['salamah', 'al_salamah'], ['al salamah', 'al_salamah'], ['السلامة', 'al_salamah'],
  ['khalidiyyah', 'al_khalidiyyah'], ['al khalidiyyah', 'al_khalidiyyah'], ['الخالدية', 'al_khalidiyyah'],
  ['andalus', 'al_andalus'], ['al andalus', 'al_andalus'], ['الأندلس', 'al_andalus'],
  ['shati', 'al_shati'], ['ash shati', 'al_shati'], ['al shati', 'al_shati'], ['الشاطئ', 'al_shati'],
  ['hamra', 'al_hamra'], ['al hamra', 'al_hamra'], ['الحمراء', 'al_hamra'],
  ['mohammadiyyah', 'al_mohammadiyyah'], ['muhammadiyyah', 'al_mohammadiyyah'], ['al mohammadiyyah', 'al_mohammadiyyah'], ['al muhammadiyyah', 'al_mohammadiyyah'], ['المحمدية', 'al_mohammadiyyah'],
  ['naeem', 'al_naeem'], ['al naeem', 'al_naeem'], ['an naeem', 'al_naeem'], ['an naim', 'al_naeem'], ['النعيم', 'al_naeem'],
  ['basateen', 'al_basateen'], ['al basateen', 'al_basateen'], ['البساتين', 'al_basateen'],
  ['murjan', 'al_murjan'], ['al murjan', 'al_murjan'], ['المرجان', 'al_murjan'],
  ['south obhur', 'abhur_al_janoubiyah'], ['abhur al janoubiyah', 'abhur_al_janoubiyah'], ['obhur al janoubiyah', 'abhur_al_janoubiyah'], ['أبحر الجنوبية', 'abhur_al_janoubiyah'],
  ['obhur', 'abhur_al_shamaliyah'], ['north obhur', 'abhur_al_shamaliyah'], ['abhur al shamaliyah', 'abhur_al_shamaliyah'], ['obhur al shamaliyah', 'abhur_al_shamaliyah'], ['أبحر الشمالية', 'abhur_al_shamaliyah'],
  ['bawadi', 'al_bawadi'], ['al bawadi', 'al_bawadi'], ['البوادي', 'al_bawadi'],
  ['faisaliyyah', 'al_faisaliyyah'], ['al faisaliyyah', 'al_faisaliyyah'], ['الفيصلية', 'al_faisaliyyah'],
  ['safa', 'al_safa'], ['al safa', 'al_safa'], ['الصفا', 'al_safa'],
  ['samer', 'al_samer'], ['al samer', 'al_samer'], ['السامر', 'al_samer'],
  ['marwah', 'al_marwah'], ['al marwah', 'al_marwah'], ['المروة', 'al_marwah'],
  ['rehab', 'al_rehab'], ['al rehab', 'al_rehab'], ['الرحاب', 'al_rehab'],
  ['naseem', 'al_naseem'], ['al naseem', 'al_naseem'], ['النسيم', 'al_naseem'],
  ['ruwais', 'al_ruwais'], ['al ruwais', 'al_ruwais'], ['الرويس', 'al_ruwais'],
  ['faiha', 'al_faiha'], ['fayha', 'al_faiha'], ['al faiha', 'al_faiha'], ['al fayha', 'al_faiha'], ['الفيحاء', 'al_faiha'],
  ['balad', 'al_balad'], ['al balad', 'al_balad'], ['البلد', 'al_balad'],
  ['thaghr', 'al_thaghr'], ['al thaghr', 'al_thaghr'], ['الثغر', 'al_thaghr'],
  ['sheraa', 'al_sheraa'], ['al sheraa', 'al_sheraa'], ['al shiraa', 'al_sheraa'], ['الشراع', 'al_sheraa'],
]);

function normalizeDistrict(text) {
  if (!text) return null;
  const key = text.trim().toLowerCase().replace(/[-_\s]+/g, ' ');
  if (CANONICAL_DISTRICTS.has(key)) return key;
  return ALIAS_MAP.get(key) || null;
}

function extractDistrictFromComponents(components) {
  if (!Array.isArray(components)) return null;
  const priorityTypes = ['sublocality_level_1', 'sublocality', 'neighborhood', 'administrative_area_level_3'];
  for (const pType of priorityTypes) {
    for (const c of components) {
      if (c.types && c.types.includes(pType)) {
        const norm = normalizeDistrict(c.longText || c.shortText);
        if (norm) return norm;
      }
    }
  }
  for (const c of components) {
    const norm = normalizeDistrict(c.longText || c.shortText);
    if (norm) return norm;
  }
  return null;
}

// Local cache management
const cachePath = path.join(rootDir, 'tmp/google-places-pass-j-cache.json');
let cache = {};
if (fs.existsSync(cachePath)) {
  try {
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch {
    cache = {};
  }
}

function saveCache() {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
}

let apiStats = {
  detailsAttempted: 0,
  detailsSuccessful: 0,
  textAttempted: 0,
  textSuccessful: 0,
  failed: 0,
  retriesRequired: 0,
  cacheHits: 0
};

async function fetchPlaceDetails(placeId) {
  const cacheKey = `details:${placeId}`;
  if (cache[cacheKey]) {
    apiStats.cacheHits++;
    return cache[cacheKey];
  }

  apiStats.detailsAttempted++;
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,googleMapsUri,businessStatus,addressComponents'
    }
  });

  if (!res.ok) {
    apiStats.failed++;
    const errText = await res.text();
    console.error(`Details error for ${placeId}: ${res.status} ${errText}`);
    return null;
  }

  apiStats.detailsSuccessful++;
  const data = await res.json();
  cache[cacheKey] = data;
  saveCache();
  return data;
}

// Exact 37 Approved Canonical Branches Definition
const APPROVED_BRANCHES = [
  // 1-6: Section-B
  {
    brand_name: "Section-B",
    branch_name: "S Square",
    known_place_id: "ChIJXYv7rVPawxURq9tp8iVXvQU",
    known_district: "al_shati",
    reconciliation: { action: "keep", reason: "Physically distinct flagship location at S Square on Hira Street in Ash Shati." }
  },
  {
    brand_name: "Section-B",
    branch_name: "Tahlia",
    known_place_id: "ChIJIf4HeczFwxUR7--yVh3sdTQ",
    known_district: "al_rawdah",
    reconciliation: { action: "keep", reason: "Physically distinct branch located at Fayfa Avenue on Prince Sultan Rd / Tahlia corridor, 6.4km south of S Square." }
  },
  {
    brand_name: "Section-B",
    branch_name: "Hiraa",
    known_place_id: "ChIJYRlUaADbwxURxSYPglOTQqw",
    known_district: "al_shati",
    reconciliation: { action: "keep", reason: "Original Hiraa / Behind Hilton location in Ash Shati, distinct from S Square." }
  },
  {
    brand_name: "Section-B",
    branch_name: "Obhur",
    known_place_id: "ChIJcSxas8PZwxURGFMKn_l_xSM",
    known_district: "abhur_al_janoubiyah",
    reconciliation: { action: "keep", reason: "Obhur branch on Prince Abdullah Al Faisal St in Abhur Al Janoubiyah." }
  },
  {
    brand_name: "Section-B",
    branch_name: "Al Faisaliyyah",
    known_place_id: "ChIJe8h28QDRwxURjt3oMZeDt6w",
    known_district: "al_faisaliyyah",
    reconciliation: { action: "keep", reason: "BOH pickup/delivery kitchen in Al Faisaliyyah." }
  },
  {
    brand_name: "Section-B",
    branch_name: "Al Murjan",
    known_place_id: "ChIJBYiGaiTZwxURV7u8ZZ838Jg",
    known_district: "al_murjan",
    reconciliation: { action: "manual_review", reason: "Candidate listed in older directory, verified physical listing on Google Places." }
  },

  // 7-9: The California Burger
  {
    brand_name: "The California Burger",
    branch_name: "Khalidiyyah",
    known_place_id: "ChIJb-U82bDawxURLQMsTI8xk1U",
    known_district: "al_khalidiyyah",
    reconciliation: { action: "keep", reason: "Confirmed physical branch on Prince Saud Al Faisal St." }
  },
  {
    brand_name: "The California Burger",
    branch_name: "Muhammadiyyah",
    known_place_id: "ChIJaRQT16TZwxURsne__gycq6M",
    known_district: "al_mohammadiyyah",
    reconciliation: { action: "keep", reason: "Confirmed physical branch on Prince Sultan Branch Rd." }
  },
  {
    brand_name: "The California Burger",
    branch_name: "Al Marwah / Hira Street",
    known_place_id: "ChIJV4JrDtfWwxURcb-1hYI-7-Q",
    known_district: "al_marwah",
    reconciliation: { action: "keep", reason: "Confirmed physical branch opposite Mandarin Avenue in Al Marwah." }
  },

  // 10-16: Century Burger
  {
    brand_name: "Century Burger",
    branch_name: "Muhammadiyyah",
    known_place_id: "ChIJK3j3HNvZwxURw2BfjRFcnDo",
    known_district: "al_mohammadiyyah",
    reconciliation: { action: "keep", reason: "Official storefront on Prince Sultan Branch Rd." }
  },
  {
    brand_name: "Century Burger",
    branch_name: "Rawdah",
    known_place_id: "ChIJL9fpbrLawxURkzvsBWdEPV4",
    known_district: "al_rawdah",
    reconciliation: { action: "keep", reason: "Flagship branch in Al Rawdah on Prince Sultan Rd." }
  },
  {
    brand_name: "Century Burger",
    branch_name: "Red Sea Mall",
    known_place_id: "ChIJ97vtaM3bwxUR3mbHQZ9pzTA",
    known_district: "al_shati",
    reconciliation: { action: "keep", reason: "Restaurant-specific food court unit in Red Sea Mall." }
  },
  {
    brand_name: "Century Burger",
    branch_name: "Obhur Plaza",
    known_place_id: "ChIJ1WB-XoRjwRURlMetn79Bz8Q",
    known_district: "abhur_al_shamaliyah",
    reconciliation: { action: "keep", reason: "Storefront at Obhur Plaza on Aabir Al Qarath St in North Obhur." }
  },
  {
    brand_name: "Century Burger",
    branch_name: "King Abdulaziz International Airport",
    known_place_id: "ChIJXw7KLmbXwxURRPeNM_tNTsU",
    known_district: null,
    reconciliation: { action: "keep", reason: "Restaurant-specific branch inside King Abdulaziz International Airport terminal; district null outside municipal catalog." }
  },
  {
    brand_name: "Century Burger",
    branch_name: "Jeddah Park",
    known_place_id: "ChIJTYhSq_LRwxURKXuDXjsVkc4",
    known_district: null,
    reconciliation: { action: "keep", reason: "Restaurant-specific unit in Jeddah Park complex; district null outside municipal catalog." }
  },
  {
    brand_name: "Century Burger",
    branch_name: "Al Fayha",
    known_place_id: "ChIJMRcGBwDPwxUR_EBJHsXuiJg",
    known_district: "al_faiha",
    reconciliation: { action: "keep", reason: "South Jeddah branch on Abdullah Suleiman Branch St in Al Fayha." }
  },

  // 17-19: Chef's Homemade Burger Gourmet
  {
    brand_name: "Chef's Homemade Burger Gourmet",
    branch_name: "Sari Road",
    known_place_id: "ChIJAaO4eTTbwxURzAzORGCvlIo",
    known_district: "al_zahra",
    reconciliation: { action: "keep", reason: "Storefront on Sari Road in Al Zahra corridor." }
  },
  {
    brand_name: "Chef's Homemade Burger Gourmet",
    branch_name: "Prince Sultan Road",
    known_place_id: "ChIJnz7V_3bZwxURGti6VJjD8uA",
    known_district: "al_mohammadiyyah",
    reconciliation: { action: "keep", reason: "Storefront on Prince Sultan Road in Al Muhammadiyyah." }
  },
  {
    brand_name: "Chef's Homemade Burger Gourmet",
    branch_name: "Al Ruwais",
    known_place_id: "ChIJo1uDjmrPwxURbkRN9JTjs4U",
    known_district: "al_ruwais",
    reconciliation: { action: "keep", reason: "Storefront on King Abdullah Rd in Al Ruwais." }
  },

  // 20-27: Sign Burger
  {
    brand_name: "Sign Burger",
    branch_name: "Obhur",
    known_place_id: "ChIJX5D-EwBjwRURQt-yfrn_xtQ",
    known_district: "abhur_al_shamaliyah",
    reconciliation: { action: "keep", reason: "North Obhur branch on Aber Al Qarat St." }
  },
  {
    brand_name: "Sign Burger",
    branch_name: "Al Thaghr / Abdullah Suleiman",
    known_place_id: "ChIJXXQ5GQDNwxURjJlLXQDlKoE",
    known_district: "al_thaghr",
    reconciliation: { action: "keep", reason: "Al Thaghr branch on Abdullah Sulayman St near KAU." }
  },
  {
    brand_name: "Sign Burger",
    branch_name: "Al Zahra",
    unverified: true,
    official_address: "Ahmed Al Attas, Al Zahra, Jeddah",
    known_district: "al_zahra",
    official_status: "unknown",
    reconciliation: { action: "keep", reason: "Official locator branch on Ahmed Al Attas in Al Zahra; unverified on Google Places." }
  },
  {
    brand_name: "Sign Burger",
    branch_name: "Corniche",
    known_place_id: "ChIJWRksoQ7bwxURKWwHjz8iutQ",
    known_district: "al_shati",
    reconciliation: { action: "keep", reason: "Jeddah Corniche branch in Ash Shati." }
  },
  {
    brand_name: "Sign Burger",
    branch_name: "Al Balad",
    unverified: true,
    official_address: "Bab Jadeed, Al Balad, Jeddah",
    known_district: "al_balad",
    official_status: "unknown",
    reconciliation: { action: "keep", reason: "Official locator branch in historic Bab Jadeed, Al Balad; unverified on Google Places." }
  },
  {
    brand_name: "Sign Burger",
    branch_name: "Al Hamdaniyah",
    known_place_id: "ChIJeWOe2kx9wRUR6mhEV5ZRBls",
    known_district: "al_hamdaniyah",
    reconciliation: { action: "keep", reason: "North-east Jeddah branch in Al Hamdaniyah." }
  },
  {
    brand_name: "Sign Burger",
    branch_name: "Al Bawadi",
    known_place_id: "ChIJMcIDdTXRwxUR13YaNc6VY7I",
    known_district: "al_bawadi",
    reconciliation: { action: "keep", reason: "Branch on King Fahd Rd in Al Bawadi." }
  },
  {
    brand_name: "Sign Burger",
    branch_name: "Al Muhammadiyyah",
    known_place_id: "ChIJA-s4bTXZwxUR-oILNZt2NPc",
    known_district: "al_mohammadiyyah",
    reconciliation: { action: "keep", reason: "Branch on Prince Sultan Branch Rd in Al Muhammadiyyah." }
  },

  // 28-29: Nora Burger
  {
    brand_name: "Nora Burger",
    branch_name: "Rawdah",
    known_place_id: "ChIJzUvkcADbwxURdhzQI192mCs",
    known_district: "al_rawdah",
    reconciliation: { action: "keep", reason: "Rawdah branch on Imam Malik St." }
  },
  {
    brand_name: "Nora Burger",
    branch_name: "Abhur",
    unverified: true,
    official_address: "King Abdulaziz Branch Rd, Abhur Al Janoubiyah, Jeddah",
    known_district: "abhur_al_janoubiyah",
    official_status: "open",
    google_maps_url: "https://maps.app.goo.gl/kRAnnGDQM2RnyjGK8",
    reconciliation: { action: "keep", reason: "Official branch link points toward King Abdulaziz Branch Rd, but pin redirects to Al Mohammadiyyah rather than a distinct Abhur storefront." }
  },

  // 30-32: WBJ
  {
    brand_name: "WBJ",
    branch_name: "Al Zahra",
    known_place_id: "ChIJdXODDQDbwxURMprErPxcdZA",
    known_district: "al_zahra",
    reconciliation: { action: "keep", reason: "WBJ branch on Prince Sultan Rd in Al Zahra." }
  },
  {
    brand_name: "WBJ",
    branch_name: "Abhur",
    known_place_id: "ChIJh6NBPABjwRUR2J7qkihn5ZA",
    known_district: "abhur_al_janoubiyah",
    reconciliation: { action: "keep", reason: "WBJ branch on King Abdulaziz Rd in Abhur Al Janoubiyah." }
  },
  {
    brand_name: "WBJ",
    branch_name: "Al Hamdaniyah",
    known_place_id: "ChIJ5YGoIwB9wRURBfdRIt_DL-k",
    known_district: "al_hamdaniyah",
    reconciliation: { action: "keep", reason: "WBJ branch on Al Hamdaniyah Branch St." }
  },

  // 33-34: Lou Burger
  {
    brand_name: "Lou Burger",
    branch_name: "Al Andalus",
    known_place_id: "ChIJz5WXPQDFwxURrnvjQpZYHiU",
    known_district: "al_andalus",
    reconciliation: { action: "keep", reason: "Flagship storefront at Al Khayat Centre in Al Andalus." }
  },
  {
    brand_name: "Lou Burger",
    branch_name: "Al Shera'a",
    known_place_id: "ChIJ_Q7U0epjwRURHCXYMCGpfeo",
    known_district: "al_sheraa",
    reconciliation: { action: "manual_review", reason: "Physical storefront verified on Prince Mishaal Ibn Majid in Al Sheraa." }
  },

  // 35: PPLR
  {
    brand_name: "PPLR",
    branch_name: "Rawdah",
    known_place_id: "ChIJ44H7RgDbwxURnuuuzb7m5iY",
    known_district: "al_rawdah",
    reconciliation: { action: "keep", reason: "Physical storefront on Abdulsamad Khoja in Al Rawdah." }
  },

  // 36-37: Smash Me
  {
    brand_name: "Smash Me",
    branch_name: "Al Naeem",
    known_place_id: "ChIJpTCKfADbwxUR2FepmjWNfRM",
    known_district: "al_naeem",
    reconciliation: { action: "keep", reason: "First Jeddah branch on Prince Sultan Branch Rd in Al Naeem." }
  },
  {
    brand_name: "Smash Me",
    branch_name: "Rawdah",
    unverified: true,
    official_address: "Qassem Zeinah, Al Rawdah, Jeddah",
    known_district: "al_rawdah",
    official_status: "open",
    reconciliation: { action: "keep", reason: "Second Jeddah location on Qassem Zeinah St in Al Rawdah; unverified on Google Places." }
  }
];


async function runEnrichment() {
  console.log(`Starting Google Places enrichment for ${APPROVED_BRANCHES.length} branches...`);
  const enrichedResults = [];
  const retrievalDate = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < APPROVED_BRANCHES.length; i++) {
    const branch = APPROVED_BRANCHES[i];
    console.log(`[${i + 1}/${APPROVED_BRANCHES.length}] Processing ${branch.brand_name} - ${branch.branch_name}...`);

    if (branch.unverified) {
      console.log(`  -> Unverified branch on Google Places. Preserving official locator record.`);
      const record = {
        brand_name: branch.brand_name,
        branch_name: branch.branch_name,
        google_identity: {
          status: "secondary_only",
          google_place_id: null,
          google_maps_url: branch.google_maps_url || null,
          google_business_name: null,
          identity_confidence: branch.google_maps_url ? "low" : "unknown"
        },
        location: {
          formatted_address: branch.official_address,
          district_normalized: branch.known_district,
          latitude: null,
          longitude: null,
          coordinate_source: branch.google_maps_url ? "official_branch_link" : "unknown",
          coordinate_confidence: "unknown"
        },
        google_reputation: {
          rating: null,
          review_count: null,
          source: "unknown",
          retrieved_at: retrievalDate
        },
        business_status: {
          status: branch.official_status,
          source: "official",
          retrieved_at: retrievalDate
        },
        branch_reconciliation: {
          action: branch.reconciliation.action,
          reason: branch.reconciliation.reason
        },
        evidence: {
          primary_source_url: null,
          secondary_source_urls: branch.google_maps_url ? [branch.google_maps_url] : [],
          match_reason: branch.google_maps_url
            ? "Official branch link exists but conflicts with independent storefront identity."
            : "Storefront absent from Google Places search; preserved from official first-party locator.",
          conflicts: branch.google_maps_url
            ? ["Official branch link redirects to an Al Mohammadiyyah pin rather than a distinct Abhur storefront."]
            : [`Branch listed on official restaurant locator but has no distinct Google Places storefront in ${branch.known_district}.`]
        },
        mandatory_completion: {
          completed_fields: 0,
          total_fields: 10,
          percentage: 0
        },
        remaining_mandatory_gaps: []
      };

      const gaps = [];
      if (!record.google_identity.google_place_id) gaps.push('google_place_id');
      if (!record.google_identity.google_maps_url) gaps.push('google_maps_url');
      if (record.location.latitude == null) gaps.push('latitude');
      if (record.location.longitude == null) gaps.push('longitude');
      if (!record.location.formatted_address) gaps.push('formatted_address');
      if (!record.location.district_normalized || !CANONICAL_DISTRICTS.has(record.location.district_normalized)) gaps.push('district_normalized');
      if (record.google_reputation.rating == null) gaps.push('google_rating');
      if (record.google_reputation.review_count == null) gaps.push('google_review_count');
      if (!record.business_status.status) gaps.push('business_status');
      if (record.google_identity.status !== 'verified') gaps.push('exact_google_identity_verified');

      record.mandatory_completion.completed_fields = 10 - gaps.length;
      record.mandatory_completion.percentage = ((10 - gaps.length) / 10) * 100;
      record.remaining_mandatory_gaps = gaps;

      enrichedResults.push(record);
      continue;
    }

    console.log(`  -> Using Place ID: ${branch.known_place_id}`);
    const place = await fetchPlaceDetails(branch.known_place_id);
    if (!place) {
      console.error(`  ! ERROR: Failed to resolve Place ID: ${branch.known_place_id}`);
      process.exit(1);
    }

    let districtNorm = null;
    if (branch.known_district && CANONICAL_DISTRICTS.has(branch.known_district)) {
      districtNorm = branch.known_district;
    } else if (place.addressComponents) {
      districtNorm = extractDistrictFromComponents(place.addressComponents);
    }

    const record = {
      brand_name: branch.brand_name,
      branch_name: branch.branch_name,
      google_identity: {
        status: "verified",
        google_place_id: place.id,
        google_maps_url: place.googleMapsUri || null,
        google_business_name: place.displayName?.text || null,
        identity_confidence: "high"
      },
      location: {
        formatted_address: place.formattedAddress || null,
        district_normalized: districtNorm,
        latitude: place.location?.latitude ?? null,
        longitude: place.location?.longitude ?? null,
        coordinate_source: "google_places",
        coordinate_confidence: "high"
      },
      google_reputation: {
        rating: place.rating ?? null,
        review_count: place.userRatingCount ?? null,
        source: "google_places",
        retrieved_at: retrievalDate
      },
      business_status: {
        status: place.businessStatus || "OPERATIONAL",
        source: "google_places",
        retrieved_at: retrievalDate
      },
      branch_reconciliation: {
        action: branch.reconciliation.action,
        reason: branch.reconciliation.reason
      },
      evidence: {
        primary_source_url: place.googleMapsUri || null,
        secondary_source_urls: [],
        match_reason: `Authoritative Google Places match for ${place.displayName?.text}`,
        conflicts: []
      },
      mandatory_completion: {
        completed_fields: 0,
        total_fields: 10,
        percentage: 0
      },
      remaining_mandatory_gaps: []
    };

    const gaps = [];
    if (!record.google_identity.google_place_id) gaps.push('google_place_id');
    if (!record.google_identity.google_maps_url) gaps.push('google_maps_url');
    if (record.location.latitude == null) gaps.push('latitude');
    if (record.location.longitude == null) gaps.push('longitude');
    if (!record.location.formatted_address) gaps.push('formatted_address');
    if (!record.location.district_normalized || !CANONICAL_DISTRICTS.has(record.location.district_normalized)) gaps.push('district_normalized');
    if (record.google_reputation.rating == null) gaps.push('google_rating');
    if (record.google_reputation.review_count == null) gaps.push('google_review_count');
    if (!record.business_status.status) gaps.push('business_status');
    if (record.google_identity.status !== 'verified') gaps.push('exact_google_identity_verified');

    record.mandatory_completion.completed_fields = 10 - gaps.length;
    record.mandatory_completion.percentage = ((10 - gaps.length) / 10) * 100;
    record.remaining_mandatory_gaps = gaps;

    enrichedResults.push(record);
  }

  const totalCompletedPoints = enrichedResults.reduce((sum, r) => sum + r.mandatory_completion.completed_fields, 0);
  const totalPossiblePoints = 370;
  const globalCompletionPct = ((totalCompletedPoints / totalPossiblePoints) * 100).toFixed(2);

  console.log('\n=============================================');
  console.log(`ENRICHMENT SUMMARY`);
  console.log(`Total branches: ${enrichedResults.length}`);
  console.log(`Mandatory points: ${totalCompletedPoints} / ${totalPossiblePoints} (${globalCompletionPct}%)`);
  console.log(`Details calls attempted: ${apiStats.detailsAttempted}, success: ${apiStats.detailsSuccessful}`);
  console.log(`Text calls attempted: ${apiStats.textAttempted}, success: ${apiStats.textSuccessful}`);
  console.log(`Cache hits: ${apiStats.cacheHits}`);
  console.log(`Failed calls: ${apiStats.failed}`);
  console.log('=============================================\n');

  const artifactPath = path.join(rootDir, 'docs/research/jeddah-burger-google-places-completion.json');
  fs.writeFileSync(artifactPath, JSON.stringify(enrichedResults, null, 2), 'utf8');
  console.log(`Artifact saved to ${artifactPath}`);
}

runEnrichment().catch(err => {
  console.error('Fatal error during enrichment:', err);
  process.exit(1);
});
