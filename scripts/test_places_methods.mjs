import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

async function testLegacy(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total,business_status,opening_hours`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Legacy details status:', data.status, data.result ? {
    name: data.result.name,
    address: data.result.formatted_address,
    location: data.result.geometry?.location,
    status: data.result.business_status
  } : data);
}

async function testTextSearch(q) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.businessStatus'
    },
    body: JSON.stringify({ textQuery: q })
  });
  const data = await res.json();
  console.log('New Places searchText status:', res.status, data.places ? `Found ${data.places.length}` : data);
}

async function testLegacyFindPlace(q) {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(q)}&inputtype=textquery&fields=place_id,name,formatted_address,geometry,business_status,rating,user_ratings_total&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Legacy findplace status:', data.status, data.candidates ? `Found ${data.candidates.length}` : data);
}

async function run() {
  await testLegacy('ChIJiwLjuXXRwxUR9zR13OUp-ws');
  await testTextSearch('Domino\'s Pizza Al Safa Umm Al Qura Jeddah');
  await testLegacyFindPlace('Domino\'s Pizza Al Safa Umm Al Qura Jeddah');
}
run();
