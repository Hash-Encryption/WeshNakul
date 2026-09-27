import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

async function testGeocode(placeId) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Geocode place_id status:', data.status);
  if (data.results && data.results.length > 0) {
    console.log('Result formatted address:', data.results[0].formatted_address);
    console.log('Location:', data.results[0].geometry.location);
    console.log('Address components:', data.results[0].address_components);
  } else {
    console.log('Full data:', data);
  }
}

async function testGeocodeAddress(addr) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Geocode address status:', data.status);
  if (data.results && data.results.length > 0) {
    console.log('Address result place_id:', data.results[0].place_id);
    console.log('Address result location:', data.results[0].geometry.location);
    console.log('Address result formatted:', data.results[0].formatted_address);
  } else {
    console.log('Full data:', data);
  }
}

async function testNearbySearch() {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus'
    },
    body: JSON.stringify({
      includedTypes: ['restaurant', 'pizza_restaurant'],
      maxResultCount: 5,
      locationRestriction: {
        circle: {
          center: { latitude: 21.5840517, longitude: 39.1575148 },
          radius: 500.0
        }
      }
    })
  });
  const data = await res.json();
  console.log('searchNearby status:', res.status, data.places ? `Found ${data.places.length}` : data);
}

async function run() {
  await testGeocode('ChIJiwLjuXXRwxUR9zR13OUp-ws');
  await testGeocodeAddress("Domino's Pizza 7515 Al Imam Abdul Aziz St, Al Faisaliyyah, Jeddah");
  await testNearbySearch();
}
run();
