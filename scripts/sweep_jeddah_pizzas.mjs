import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

// Grid centers for Jeddah districts covering our 107 candidate branches
const GRID_POINTS = [
  // North / Obhur / Hamdaniyah / Taiba / Falah / Lulu / Sheraa
  { name: 'Obhur North / Yaqout / Lulu / Sheraa', lat: 21.755, lng: 39.115, r: 4000 },
  { name: 'Taiba / Rehily', lat: 21.800, lng: 39.142, r: 4000 },
  { name: 'Al Hamdaniyah / Falah', lat: 21.785, lng: 39.195, r: 4000 },
  { name: 'Abhur Al Janoubiyah / Asalah', lat: 21.720, lng: 39.140, r: 4000 },
  { name: 'Al Murjan / Basateen', lat: 21.685, lng: 39.115, r: 3500 },
  { name: 'Airport (KAIA)', lat: 21.670, lng: 39.165, r: 3500 },
  
  // North Central / Mohammadiyyah / Nahdah / Naeem / Shati
  { name: 'Al Mohammadiyyah / Nahdah', lat: 21.645, lng: 39.135, r: 3000 },
  { name: 'Ash Shati North', lat: 21.615, lng: 39.115, r: 3000 },
  { name: 'Ash Shati South / Zahra West', lat: 21.585, lng: 39.115, r: 3000 },
  { name: 'Al Naeem', lat: 21.625, lng: 39.150, r: 2500 },
  { name: 'Al Zahra / Batarji', lat: 21.595, lng: 39.135, r: 2500 },
  { name: 'Al Salamah / Saqr Quraish', lat: 21.585, lng: 39.155, r: 2500 },
  { name: 'Al Bawadi', lat: 21.590, lng: 39.170, r: 2500 },
  { name: 'An Nuzhah / Mall of Arabia', lat: 21.630, lng: 39.165, r: 2500 },
  { name: 'Al Marwah North', lat: 21.625, lng: 39.205, r: 2500 },
  { name: 'Al Marwah South', lat: 21.610, lng: 39.205, r: 2500 },
  
  // Central / Rawdah / Khalidiyyah / Andalus / Faisaliyyah / Safa / Rabwah / Samer
  { name: 'Al Rawdah / Kayal', lat: 21.565, lng: 39.160, r: 2500 },
  { name: 'Al Khalidiyyah / Sari', lat: 21.560, lng: 39.135, r: 2500 },
  { name: 'Al Andalus / Tahlia', lat: 21.545, lng: 39.160, r: 2500 },
  { name: 'Al Faisaliyyah', lat: 21.570, lng: 39.180, r: 2500 },
  { name: 'Ar Rabwah', lat: 21.595, lng: 39.185, r: 2500 },
  { name: 'Al Safa North', lat: 21.600, lng: 39.200, r: 2500 },
  { name: 'Al Safa South (Umm Al Qura)', lat: 21.575, lng: 39.215, r: 2500 },
  { name: 'Al Samer / Ajawad', lat: 21.595, lng: 39.235, r: 3000 },
  { name: 'Al Rehab', lat: 21.540, lng: 39.210, r: 2500 },
  { name: 'Al Aziziyah / Mishrifah', lat: 21.540, lng: 39.190, r: 2500 },
  
  // South Central & South / Ruwais / Hamra / Sharafeyah / Naseem / Faiha / Balad / Sulaymaniyah
  { name: 'Al Hamra / Ruwais', lat: 21.515, lng: 39.165, r: 2500 },
  { name: 'Al Sharafeyah / Baghdadiyah', lat: 21.500, lng: 39.185, r: 2500 },
  { name: 'Al Naseem', lat: 21.500, lng: 39.225, r: 2500 },
  { name: 'Al Faiha / Andalus Mall', lat: 21.495, lng: 39.245, r: 2500 },
  { name: 'Al Sulaymaniyah', lat: 21.510, lng: 39.250, r: 2500 },
  { name: 'Abruq Ar Rughamah', lat: 21.515, lng: 39.275, r: 3000 },
  { name: 'Al Balad', lat: 21.485, lng: 39.190, r: 2500 },
  { name: 'Madaen Al Fahd / Thaghr', lat: 21.465, lng: 39.225, r: 3000 },
  
  // South Outer / Amir Fawwaz / Ajaweed / Fadeylah / Sanabel
  { name: 'Al Amir Fawwaz', lat: 21.430, lng: 39.260, r: 3500 },
  { name: 'Al Ajaweed', lat: 21.415, lng: 39.300, r: 3500 },
  { name: 'Al Fadeylah', lat: 21.360, lng: 39.270, r: 4000 }
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
  console.log(`Starting sweep across ${GRID_POINTS.length} grid points in Jeddah...`);
  const placesById = new Map();

  for (let i = 0; i < GRID_POINTS.length; i++) {
    const pt = GRID_POINTS[i];
    console.log(`[${i + 1}/${GRID_POINTS.length}] Sweeping ${pt.name} (r=${pt.r}m)...`);

    // 1. Pizza restaurants
    const pizzas = await searchNearby(pt.lat, pt.lng, pt.r, ['pizza_restaurant']);
    for (const p of pizzas) {
      placesById.set(p.id, p);
    }
    await delay(200);

    // 2. Italian restaurants
    const italians = await searchNearby(pt.lat, pt.lng, pt.r, ['italian_restaurant']);
    for (const p of italians) {
      placesById.set(p.id, p);
    }
    await delay(200);
    
    console.log(`  Current unique places collected: ${placesById.size}`);
  }

  const allPlaces = Array.from(placesById.values());
  console.log(`\n========================================`);
  console.log(`SWEEP COMPLETE!`);
  console.log(`Total unique places collected: ${allPlaces.length}`);
  fs.writeFileSync('scripts/jeddah_sweep_places.json', JSON.stringify(allPlaces, null, 2));
  console.log(`Saved to scripts/jeddah_sweep_places.json`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
