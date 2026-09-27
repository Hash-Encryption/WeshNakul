import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

async function searchNearbyPizzas(lat, lng, radius = 2000) {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus'
    },
    body: JSON.stringify({
      includedTypes: ['pizza_restaurant'],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius
        }
      }
    })
  });
  const data = await res.json();
  return data.places || [];
}

async function test() {
  console.log('Searching pizza restaurants near Al Faisaliyyah (21.56, 39.18)...');
  const places = await searchNearbyPizzas(21.56, 39.18, 2500);
  console.log(`Found ${places.length} pizza places:`);
  for (const p of places) {
    console.log(`  - ${p.displayName?.text} | ID: ${p.id} | Rating: ${p.rating} (${p.userRatingCount}) | Lat: ${p.location?.latitude}, Lng: ${p.location?.longitude} | Addr: ${p.formattedAddress}`);
  }
}

test();
