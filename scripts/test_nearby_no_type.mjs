import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

async function testNearbyNoType(lat, lng, radius = 500) {
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
  console.log(`Found ${data.places?.length || 0} places:`);
  for (const p of (data.places || [])) {
    console.log(`  - ${p.displayName?.text} | ID: ${p.id} | Types: ${p.types?.join(',')} | Lat: ${p.location?.latitude}, Lng: ${p.location?.longitude}`);
  }
}

async function run() {
  console.log('Searching near King Abdulaziz Rd, Al Zahra (21.588, 39.123)...');
  await testNearbyNoType(21.588, 39.123, 500);

  console.log('\nSearching near Prince Abdulmajeed, Al Lulu (21.765, 39.105)...');
  await testNearbyNoType(21.765, 39.105, 500);
}

run();
