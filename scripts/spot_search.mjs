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
  console.log(`\n=== Spot: ${name} (${lat}, ${lng}, r=${radius}m) ===`);
  console.log(`Found ${data.places?.length || 0} places:`);
  for (const p of (data.places || [])) {
    console.log(`  - ${p.displayName?.text} | ID: ${p.id} | Rating: ${p.rating} (${p.userRatingCount}) | Addr: ${p.formattedAddress} | Lat: ${p.location?.latitude}, Lng: ${p.location?.longitude}`);
  }
  return data.places || [];
}

async function run() {
  // 1. Papa Johns Tahlia / Rehab (Prince Mohammed Bin Abdulaziz St, Al Rehab)
  await searchNearbySpot('Papa Johns Rehab', 21.545, 39.210, 500);

  // 2. Pizza Hut Al Falah (Al Falah, Jeddah)
  await searchNearbySpot('Pizza Hut Al Falah', 21.786, 39.215, 600);

  // 3. Pizza Hut Saud Bin Abdulaziz (Saud Bin Abdulaziz, Jeddah)
  await searchNearbySpot('Pizza Hut Saud Bin Abdulaziz', 21.795, 39.135, 600);

  // 4. Pizza Hut Obhur North — Al Yaqout
  await searchNearbySpot('Pizza Hut Al Yaqout', 21.750, 39.110, 600);
}

run();
