import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

const rawPath = path.join(rootDir, 'docs', 'research', 'jeddah-street-folk-food-raw-uploaded.json');
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

async function resolveAllPlaceIds() {
  const branchesToFetch = [];
  for (const brand of raw.brands) {
    for (const br of (brand.branches || [])) {
      if (br.google_place_id) {
        branchesToFetch.push({
          brandId: brand.id,
          brandName: brand.name_en,
          branchName: br.name,
          placeId: br.google_place_id,
          currentAddress: br.address,
          currentDistrict: br.district,
          rawBranch: br
        });
      }
    }
  }

  console.log(`Total branches with Place ID to fetch: ${branchesToFetch.length}`);

  const results = [];
  for (const b of branchesToFetch) {
    const url = `https://places.googleapis.com/v1/places/${b.placeId}`;
    try {
      const res = await fetch(url, {
        headers: {
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,googleMapsUri,businessStatus,regularOpeningHours,currentOpeningHours'
        }
      });
      const data = await res.json();
      results.push({
        ...b,
        status: res.status,
        data
      });
      console.log(`Fetched [${res.status}] ${b.brandName} - ${b.branchName}: ${data.displayName?.text} | ${data.location?.latitude},${data.location?.longitude} | Status: ${data.businessStatus}`);
    } catch (err) {
      console.error(`Error fetching ${b.placeId}:`, err);
      results.push({ ...b, error: err.message });
    }
  }

  fs.writeFileSync(path.join(__dirname, 'street_folk_places_resolved.json'), JSON.stringify(results, null, 2));
  console.log(`Saved results to scripts/street_folk_places_resolved.json`);
}

resolveAllPlaceIds();
