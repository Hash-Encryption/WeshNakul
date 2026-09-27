import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

async function searchNearbySpot(name, lat, lng, radius = 500) {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus,places.types'
    },
    body: JSON.stringify({
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
  console.log(`\n=== Spot: ${name} ===`);
  for (const p of (data.places || [])) {
    if ((p.displayName?.text || '').toLowerCase().includes('pizza') || (p.displayName?.text || '').toLowerCase().includes('papa') || (p.displayName?.text || '').includes('بيتزا') || (p.displayName?.text || '').toLowerCase().includes('hut')) {
      console.log(`  MATCH: ${p.displayName?.text} | ID: ${p.id} | Rating: ${p.rating} (${p.userRatingCount}) | Addr: ${p.formattedAddress} | Lat: ${p.location?.latitude}, Lng: ${p.location?.longitude}`);
    }
  }
}

async function run() {
  await searchNearbySpot('Papa Johns Rehab', 21.545, 39.210, 800);
  await searchNearbySpot('Pizza Hut Al Falah', 21.786, 39.215, 800);
}

run();
