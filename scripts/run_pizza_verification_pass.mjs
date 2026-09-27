import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

if (!API_KEY) {
  console.error('ERROR: No GOOGLE_MAPS_KEY in .env.local');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));

// Resolved coordinates for the 7 Maestro goo.gl URLs
const MAESTRO_GOOGL_COORDS = {
  'Hamra': { lat: 21.5171545, lng: 39.1654843, q: 'Maestro Pizza Al Hamra Jeddah Al Maadi' },
  'Muhammadiyah': { lat: 21.657145, lng: 39.1339831, q: 'Maestro Pizza Al Mohammadiyyah Jeddah' },
  'Taiba': { lat: 21.7998724, lng: 39.1425908, q: 'Maestro Pizza Taiba Jeddah' },
  'Marwah': { lat: 21.6229801, lng: 39.2020016, q: 'Maestro Pizza Al Marwah Jeddah' },
  'Samer': { lat: 21.5913337, lng: 39.2320491, q: 'Maestro Pizza Al Samer Jeddah' },
  'Noor / Abhur South': { lat: 21.7511078, lng: 39.1484959, q: 'Maestro Pizza Abhur Al Janoubiyah Jeddah' },
  'Ajaweed': { lat: 21.4149667, lng: 39.3000456, q: 'Maestro Pizza Al Ajaweed Jeddah' }
};

async function searchPlaces(query, locationBias = null) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const body = {
    textQuery: query,
    languageCode: 'en'
  };
  if (locationBias) {
    body.locationBias = {
      circle: {
        center: {
          latitude: locationBias.lat,
          longitude: locationBias.lng
        },
        radius: 1000.0 // 1 km radius bias
      }
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.businessStatus,places.regularOpeningHours,places.addressComponents'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    return { error: `${res.status} ${txt}` };
  }
  const data = await res.json();
  return { places: data.places || [] };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyAllBranches() {
  const results = {};
  let processed = 0;
  let matches = 0;
  let mismatchedPlaceIds = [];
  let missingMatches = [];

  for (const brand of raw.brands) {
    const brandName = brand.canonical_name;
    const branches = brand.physical_jeddah_branches || [];
    results[brandName] = [];

    console.log(`\n========================================`);
    console.log(`Processing ${brandName} (${branches.length} branches)...`);

    for (const b of branches) {
      processed++;
      let query = '';
      let locationBias = null;

      if (brandName === 'Maestro Pizza' && MAESTRO_GOOGL_COORDS[b.branch_name]) {
        const info = MAESTRO_GOOGL_COORDS[b.branch_name];
        query = info.q;
        locationBias = { lat: info.lat, lng: info.lng };
      } else if (b.formatted_address && b.formatted_address.trim().length > 0) {
        // Build targeted query
        // E.g. "Domino's Pizza 7156 Umm Al Qoura, Al Safa, Jeddah"
        query = `${brandName} ${b.formatted_address}`;
      } else {
        query = `${brandName} ${b.branch_name} Jeddah`;
      }

      console.log(`[${processed}/${107}] Querying: "${query}"...`);
      const searchRes = await searchPlaces(query, locationBias);
      await delay(250); // Be respectful of API rate limit

      if (searchRes.error) {
        console.error(`  ERROR querying "${query}": ${searchRes.error}`);
        results[brandName].push({
          candidate_branch: b,
          matched_place: null,
          error: searchRes.error
        });
        missingMatches.push({ brand: brandName, branch: b.branch_name, reason: searchRes.error });
        continue;
      }

      const places = searchRes.places || [];
      if (places.length === 0) {
        // Try fallback query with Arabic / short name
        console.log(`  No results for "${query}", trying fallback...`);
        const fallbackQuery = `${brand.arabic_name || brandName} ${b.branch_name} جدة`;
        const fbRes = await searchPlaces(fallbackQuery, locationBias);
        await delay(250);
        const fbPlaces = fbRes.places || [];
        if (fbPlaces.length > 0) {
          places.push(...fbPlaces);
        }
      }

      if (places.length === 0) {
        console.warn(`  ⚠️ NO PLACES FOUND for ${brandName} — ${b.branch_name}`);
        results[brandName].push({
          candidate_branch: b,
          matched_place: null,
          note: 'no_search_results'
        });
        missingMatches.push({ brand: brandName, branch: b.branch_name, reason: 'no_search_results' });
        continue;
      }

      // Find best matching place
      let matched = null;
      if (b.google_place_id) {
        matched = places.find(p => p.id === b.google_place_id);
      }
      if (!matched) {
        matched = places[0]; // Top ranked
      }

      const placeIdMatch = b.google_place_id ? (b.google_place_id === matched.id) : 'new_match';
      if (b.google_place_id && b.google_place_id !== matched.id) {
        console.warn(`  ⚠️ PLACE ID MISMATCH for ${b.branch_name}: candidate=${b.google_place_id} vs top_result=${matched.id} (${matched.displayName?.text})`);
        mismatchedPlaceIds.push({
          brand: brandName,
          branch: b.branch_name,
          candidate_place_id: b.google_place_id,
          matched_place_id: matched.id,
          matched_name: matched.displayName?.text,
          matched_address: matched.formattedAddress
        });
      }

      matches++;
      console.log(`  ✓ Matched: ${matched.displayName?.text} | ID: ${matched.id} | Status: ${matched.businessStatus} | Lat/Lng: ${matched.location?.latitude}, ${matched.location?.longitude}`);

      results[brandName].push({
        candidate_branch: b,
        matched_place: matched,
        place_id_status: placeIdMatch,
        all_places_count: places.length
      });
    }
  }

  console.log(`\n========================================`);
  console.log(`SUMMARY OF GOOGLE PLACES PASS:`);
  console.log(`Total candidate branches queried: ${processed}`);
  console.log(`Matches found: ${matches}`);
  console.log(`Mismatched Place IDs: ${mismatchedPlaceIds.length}`);
  console.log(`Missing Matches: ${missingMatches.length}`);

  fs.writeFileSync('scripts/pizza_google_places_responses.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('scripts/pizza_mismatched_place_ids.json', JSON.stringify(mismatchedPlaceIds, null, 2));
  fs.writeFileSync('scripts/pizza_missing_matches.json', JSON.stringify(missingMatches, null, 2));
  console.log(`Results saved to scripts/pizza_google_places_responses.json`);
}

verifyAllBranches().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
