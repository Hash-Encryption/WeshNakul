import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

async function testNearby() {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus'
    },
    body: JSON.stringify({
      includedTypes: ['restaurant', 'meal_takeaway', 'meal_delivery'],
      maxResultCount: 10,
      locationRestriction: {
        circle: {
          center: { latitude: 21.5840517, longitude: 39.1575148 },
          radius: 200.0
        }
      }
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

testNearby();
