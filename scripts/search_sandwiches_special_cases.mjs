import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

async function searchPlaces(query) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.businessStatus,places.types'
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'en'
    })
  });
  const data = await res.json();
  return data.places || [];
}

async function searchNearby(lat, lng, radius = 500) {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.businessStatus,places.types'
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
  return data.places || [];
}

async function run() {
  console.log('=== 1. SEARCH CHARLEYS IN JEDDAH ===');
  const queriesCharleys = [
    'Charleys Cheesesteaks Jeddah',
    'Charleys Philly Steaks Jeddah',
    'Charleys Salam Mall Jeddah',
    'Charleys Red Sea Mall Jeddah',
    'تشارليز جدة',
    'تشارليز تشيز ستيكس جدة',
    'Charleys Mall of Arabia Jeddah'
  ];
  for (const q of queriesCharleys) {
    console.log(`\nQuery: "${q}"`);
    const results = await searchPlaces(q);
    console.log(`Found ${results.length} places:`);
    for (const p of results) {
      console.log(`  - [${p.id}] ${p.displayName?.text} | Rating: ${p.rating} (${p.userRatingCount}) | Status: ${p.businessStatus} | Addr: ${p.formattedAddress}`);
    }
  }

  console.log('\n=== 2. SEARCH ZED PRINCE NAIF / ASH SHIRAA ===');
  const queriesZed = [
    'ZED Prince Naif Jeddah',
    'ZED Ash Shiraa Jeddah',
    'زد الامير نايف جدة',
    'زد الشراع جدة',
    'ZED Obhur Jeddah',
    'GOA Prince Naif Jeddah'
  ];
  for (const q of queriesZed) {
    console.log(`\nQuery: "${q}"`);
    const results = await searchPlaces(q);
    console.log(`Found ${results.length} places:`);
    for (const p of results) {
      console.log(`  - [${p.id}] ${p.displayName?.text} | Rating: ${p.rating} (${p.userRatingCount}) | Status: ${p.businessStatus} | Addr: ${p.formattedAddress}`);
    }
  }

  console.log('\n=== 3. SEARCH NEARBY AT GOA COORDINATES (21.7714897, 39.0984787) ===');
  const nearbyGoa = await searchNearby(21.7714897, 39.0984787, 300);
  console.log(`Found ${nearbyGoa.length} places:`);
  for (const p of nearbyGoa) {
    console.log(`  - [${p.id}] ${p.displayName?.text} | Types: ${p.types?.join(', ')} | Status: ${p.businessStatus} | Addr: ${p.formattedAddress}`);
  }
}

run().catch(console.error);
