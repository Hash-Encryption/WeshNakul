import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

const TARGETS = [
  // Bread Ahead
  { label: 'Bread Ahead Zahra', lat: 21.595, lng: 39.135, r: 1500, types: ['bakery', 'cafe', 'restaurant'] },
  { label: 'Bread Ahead Red Sea Mall / King College', lat: 21.625, lng: 39.110, r: 1500, types: ['bakery', 'cafe', 'restaurant'] },
  { label: 'Bread Ahead Obhur', lat: 21.745, lng: 39.120, r: 1500, types: ['bakery', 'cafe', 'restaurant'] },
  
  // Jon & Vinny's
  { label: 'Jon & Vinnys Salamah', lat: 21.585, lng: 39.145, r: 1500, types: ['restaurant', 'american_restaurant', 'italian_restaurant'] },

  // Impasto Seven
  { label: 'Impasto Seven Lulu', lat: 21.765, lng: 39.105, r: 1500, types: ['restaurant', 'pizza_restaurant', 'italian_restaurant'] },

  // Verra Obhur
  { label: 'Verra Obhur', lat: 21.755, lng: 39.120, r: 1500, types: ['pizza_restaurant', 'restaurant', 'italian_restaurant'] },

  // Maestro Hamra
  { label: 'Maestro Hamra', lat: 21.5171545, lng: 39.1654843, r: 500, types: ['restaurant', 'pizza_restaurant', 'meal_takeaway'] },

  // Pizza Hut Saud Bin Abdulaziz
  { label: 'Pizza Hut Saud Bin Abdulaziz', lat: 21.800, lng: 39.135, r: 2000, types: ['pizza_restaurant', 'restaurant', 'meal_takeaway'] },

  // Pizza Hut Al Falah
  { label: 'Pizza Hut Al Falah', lat: 21.785, lng: 39.210, r: 2000, types: ['pizza_restaurant', 'restaurant', 'meal_takeaway'] },

  // Pizza Hut Al Yaqout
  { label: 'Pizza Hut Al Yaqout', lat: 21.750, lng: 39.115, r: 2000, types: ['pizza_restaurant', 'restaurant', 'meal_takeaway'] },

  // Papa Johns Tahlia / Rehab
  { label: 'Papa Johns Tahlia / Rehab', lat: 21.545, lng: 39.210, r: 1500, types: ['pizza_restaurant', 'restaurant', 'meal_takeaway'] },

  // Domino's Village Mall Al Asalah
  { label: 'Dominos Village Mall Al Asalah', lat: 21.720, lng: 39.145, r: 2000, types: ['pizza_restaurant', 'restaurant', 'meal_takeaway'] },

  // Domino's Al Murjan
  { label: 'Dominos Al Murjan', lat: 21.685, lng: 39.110, r: 2000, types: ['pizza_restaurant', 'restaurant', 'meal_takeaway'] },

  // Domino's Al Mohammadiyyah (2120 Prince Sultan)
  { label: 'Dominos Al Mohammadiyyah', lat: 21.650, lng: 39.135, r: 2000, types: ['pizza_restaurant', 'restaurant', 'meal_takeaway'] },

  // Domino's Al Fadeylah
  { label: 'Dominos Al Fadeylah', lat: 21.360, lng: 39.270, r: 3000, types: ['pizza_restaurant', 'restaurant', 'meal_takeaway'] }
];

async function searchNearby(lat, lng, radius, types) {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus,places.googleMapsUri,places.addressComponents'
    },
    body: JSON.stringify({
      includedTypes: types,
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius
        }
      }
    })
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`Error (${res.status}): ${txt}`);
    return [];
  }
  const data = await res.json();
  return data.places || [];
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const existingSweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));
  const placesMap = new Map();
  for (const p of existingSweep) {
    placesMap.set(p.id, p);
  }

  console.log(`Starting targeted sweep for ${TARGETS.length} specific targets...`);
  for (const t of TARGETS) {
    console.log(`Sweeping ${t.label} (r=${t.r}m, types: ${t.types.join(',')})...`);
    const places = await searchNearby(t.lat, t.lng, t.r, t.types);
    for (const p of places) {
      placesMap.set(p.id, p);
    }
    console.log(`  Found ${places.length} places (total unique: ${placesMap.size})`);
    await delay(250);
  }

  const updated = Array.from(placesMap.values());
  fs.writeFileSync('scripts/jeddah_sweep_places.json', JSON.stringify(updated, null, 2));
  console.log(`Updated sweep saved! Total unique places: ${updated.length}`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
