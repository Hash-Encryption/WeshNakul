import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

async function searchPlaces(query, lat = null, lng = null, radius = 5000) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const body = {
    textQuery: query,
    languageCode: 'en'
  };
  if (lat && lng) {
    body.locationBias = {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radius
      }
    };
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.businessStatus,places.regularOpeningHours,places.nationalPhoneNumber,places.types'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return data.places || [];
}

const queries = [
  { name: 'Noto Jeddah Walk', query: 'Noto Jeddah Walk Tahlia' },
  { name: 'San Carlo Cicchetti Rawdah', query: 'San Carlo Cicchetti Jeddah Prince Mohammed Bin Abdulaziz' },
  { name: 'Piatto Etoile Al Zahra', query: 'Piatto Etoile Center Al Zahra Jeddah' },
  { name: 'Piatto Prince Sultan Mohammadiyyah', query: 'Piatto Prince Sultan Road Al Mohammadiyyah Jeddah' },
  { name: 'Piatto Emaar Square Al Fayha', query: 'Piatto Emaar Square Al Fayha Jeddah' },
  { name: 'Piatto The Village Al Asalah', query: 'Piatto The Village Al Asalah Jeddah' },
  { name: 'Piatto Mall of Arabia', query: 'Piatto Mall of Arabia Jeddah' },
  { name: 'Olive Garden Atelier LaVie', query: 'Olive Garden Atelier LaVie King Abdulaziz Road Jeddah' },
  { name: 'Eataly Jeddah Vibes', query: 'Eataly Jeddah Vibes Prince Mohammed Bin Abdulaziz' },
  { name: 'IL Vero Al Andalus', query: 'IL Vero Al Bouraidi Al Andalus Jeddah' },
  { name: 'IL Vero second listing', query: 'IL Vero Jeddah' },
  { name: 'Portofino Ar Rawdah', query: 'Portofino Prince Saud Al Faisal Ar Rawdah Jeddah' },
  { name: 'Vivaci Al Zahra', query: 'Vivaci Ahmad Al Khatib Al Zahra Jeddah' },
  { name: 'Salernoo Al Zahra', query: 'Salernoo Fahed Bei Zouair Al Zahra Jeddah' },
  { name: 'IL Castello Al Sharafeyah', query: 'IL Castello Asad Allah Al Sharafeyah Jeddah' }
];

async function run() {
  const results = {};
  for (const item of queries) {
    console.log(`\n========================================`);
    console.log(`Searching for: ${item.name} (${item.query})`);
    const places = await searchPlaces(item.query);
    console.log(`Found ${places.length} places:`);
    places.forEach((p, idx) => {
      console.log(`  [${idx}] ${p.displayName?.text} | ID: ${p.id} | Rating: ${p.rating} (${p.userRatingCount})`);
      console.log(`      Address: ${p.formattedAddress}`);
      console.log(`      Coords: ${p.location?.latitude}, ${p.location?.longitude}`);
      console.log(`      Status: ${p.businessStatus}`);
      if (p.regularOpeningHours?.weekdayDescriptions) {
        console.log(`      Hours: ${p.regularOpeningHours.weekdayDescriptions.slice(0, 2).join(' | ')} ...`);
      }
    });
    results[item.name] = places;
  }
  fs.writeFileSync('scripts/resolved_italian_places_raw.json', JSON.stringify(results, null, 2));
  console.log('\nSaved all search results to scripts/resolved_italian_places_raw.json');
}

run();
