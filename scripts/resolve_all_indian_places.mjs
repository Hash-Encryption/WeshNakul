import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

const rawData = JSON.parse(fs.readFileSync('docs/research/jeddah-indian-raw-uploaded.json', 'utf8'));

async function fetchPlaceFromAPI(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,googleMapsUri,businessStatus,regularOpeningHours,internationalPhoneNumber,nationalPhoneNumber,types,addressComponents'
      }
    });
    if (!res.ok) {
      const errText = await res.text();
      return { error: `HTTP ${res.status}: ${errText}` };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { error: err.message };
  }
}

async function searchPlacesAPI(query) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.businessStatus,places.types,places.regularOpeningHours'
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'en'
      })
    });
    const data = await res.json();
    return data.places || [];
  } catch (err) {
    return [];
  }
}

async function main() {
  console.log('=== VERIFYING ALL 16 INDIAN BRANCHES WITH GOOGLE PLACES API ===\n');

  const resolved = [];

  for (const b of rawData.brands) {
    for (const br of (b.branches || [])) {
      console.log(`Checking [${b.canonical_name} - ${br.branch_name}]...`);
      if (br.google_place_id) {
        const res = await fetchPlaceFromAPI(br.google_place_id);
        if (res.success) {
          const d = res.data;
          console.log(`  Found: ${d.displayName?.text}`);
          console.log(`  Address: ${d.formattedAddress}`);
          console.log(`  Coords: ${d.location?.latitude}, ${d.location?.longitude}`);
          console.log(`  Rating: ${d.rating}, Reviews: ${d.userRatingCount}`);
          console.log(`  Status: ${d.businessStatus}`);
          resolved.push({
            brand: b.canonical_name,
            branch_name: br.branch_name,
            place_id: br.google_place_id,
            api_data: d
          });
        } else {
          console.error(`  Error fetching place ${br.google_place_id}:`, res.error);
        }
      } else {
        console.log(`  Branch has no Place ID!`);
      }
    }
  }

  fs.writeFileSync('scripts/resolved_indian_places.json', JSON.stringify(resolved, null, 2));

  console.log('\n=== SEARCHING FOR GINGER LEAF ===');
  const glResults = await searchPlacesAPI('Ginger Leaf Jeddah Hilton');
  console.log('Results for "Ginger Leaf Jeddah Hilton":', glResults.length);
  for (const p of glResults) {
    console.log(`- ${p.displayName?.text} | ID: ${p.id} | Status: ${p.businessStatus} | Addr: ${p.formattedAddress} | Coords: ${p.location?.latitude}, ${p.location?.longitude} | Rating: ${p.rating} (${p.userRatingCount})`);
  }

  const glResults2 = await searchPlacesAPI('Ginger Leaf Indian Restaurant Jeddah');
  console.log('Results for "Ginger Leaf Indian Restaurant Jeddah":', glResults2.length);
  for (const p of glResults2) {
    console.log(`- ${p.displayName?.text} | ID: ${p.id} | Status: ${p.businessStatus} | Addr: ${p.formattedAddress} | Coords: ${p.location?.latitude}, ${p.location?.longitude} | Rating: ${p.rating} (${p.userRatingCount})`);
  }

  console.log('\n=== SEARCHING FOR SHEHNAI SECOND BRANCH (SHARAFIYAH) ===');
  const shehnaiResults = await searchPlacesAPI('Shehnai Restaurant Sharafiyah Jeddah');
  console.log('Results for "Shehnai Restaurant Sharafiyah Jeddah":', shehnaiResults.length);
  for (const p of shehnaiResults) {
    console.log(`- ${p.displayName?.text} | ID: ${p.id} | Status: ${p.businessStatus} | Addr: ${p.formattedAddress}`);
  }

  const shehnaiAll = await searchPlacesAPI('Shehnai Restaurant Jeddah');
  console.log('Results for "Shehnai Restaurant Jeddah":', shehnaiAll.length);
  for (const p of shehnaiAll) {
    console.log(`- ${p.displayName?.text} | ID: ${p.id} | Status: ${p.businessStatus} | Addr: ${p.formattedAddress}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
