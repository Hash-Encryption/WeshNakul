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
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.regularOpeningHours,places.businessStatus,places.addressComponents'
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'en'
    })
  });
  const data = await res.json();
  return data.places || [];
}

const queries = [
  // FireGrill
  { key: 'firegrill_zahra', brand: 'FireGrill', branch: 'Al Zahra', q: 'FireGrill King Abdul Aziz Rd Al Zahra Jeddah' },
  { key: 'firegrill_naeem', brand: 'FireGrill', branch: 'Al Naeem', q: 'FireGrill Prince Sultan Rd Al Naeem Jeddah' },
  { key: 'firegrill_ruwais', brand: 'FireGrill', branch: 'Al Ruwais', q: 'FireGrill Liwan Center King Abdullah Rd Al Ruwais Jeddah' },
  { key: 'firegrill_shati', brand: 'FireGrill', branch: 'Ash Shati', q: 'FireGrill Ash Shati Jeddah' },
  { key: 'firegrill_asalah', brand: 'FireGrill', branch: 'Al Asalah', q: 'FireGrill Prince Talal Bin Mansour Rd Al Asalah Jeddah' },
  { key: 'firegrill_mall_of_arabia', brand: 'FireGrill', branch: 'Mall of Arabia', q: 'FireGrill Mall of Arabia Jeddah' },
  { key: 'firegrill_shiraa', brand: 'FireGrill', branch: 'Al Shiraa', q: 'FireGrill Prince Naif Rd Al Shiraa Jeddah' },
  { key: 'firegrill_fayha', brand: 'FireGrill', branch: 'Al Fayha (closed audit)', q: 'FireGrill Al Fayha Jeddah' },

  // Cocina La Cantina
  { key: 'cocina_zahra', brand: 'Cocina La Cantina', branch: 'Al Zahra', q: 'Cocina La Cantina Sari Branch Rd Al Zahra Jeddah' },

  // ED'S Taco
  { key: 'eds_taco_zahra', brand: "ED'S Taco", branch: 'Al Zahra', q: "ED'S Taco Al Batarji Al Zahra Jeddah" },

  // Speakeasy
  { key: 'speakeasy_naeem', brand: 'Speakeasy', branch: 'Al Naeem', q: 'Speakeasy Amna Bint Wahb St Al Naeem Jeddah' },
  { key: 'speakeasy_khalidiyyah', brand: 'Speakeasy', branch: 'Al Khalidiyyah', q: 'Speakeasy Prince Sultan Rd Al Khalidiyyah Jeddah' },
  { key: 'speakeasy_obhur', brand: 'Speakeasy', branch: 'Obhur', q: 'Speakeasy Obhur Jeddah' },

  // Chili's
  { key: 'chilis_hamra', brand: "Chili's", branch: 'Al Hamra', q: "Chili's Palestine St Al Hamra Jeddah" },
  { key: 'chilis_roshan_mall', brand: "Chili's", branch: 'Roshan Mall (closed audit)', q: "Chili's Roshan Mall Jeddah" },

  // Taqado
  { key: 'taqado_jeddah_1', brand: 'Taqado Mexican Kitchen', branch: 'Storefront check', q: 'Taqado Mexican Kitchen Jeddah' },
  { key: 'taqado_jeddah_2', brand: 'Taqado Mexican Kitchen', branch: 'Storefront check Zahra', q: 'Taqado Mexican Kitchen Al Zahra Jeddah' },

  // Casa Twist
  { key: 'casa_twist_muhammadiyyah', brand: 'Casa Twist', branch: 'Al Muhammadiyyah', q: 'Casa Twist Al Muhammadiyyah Jeddah' },

  // Chiii
  { key: 'chiii_naeem', brand: 'Chiii', branch: 'Al Naeem', q: 'Chiii Amna Bint Wahb St Al Naeem Jeddah' },

  // Chalcos Mexican Grill
  { key: 'chalcos_zahra', brand: 'Chalcos Mexican Grill', branch: 'Al Zahra', q: 'Chalcos Mexican Grill Al Batarji Al Zahra Jeddah' },

  // Tacomole
  { key: 'tacomole_shati', brand: 'Tacomole', branch: 'Ash Shati', q: 'Tacomole Ash Shati Jeddah' },

  // EL TACO LOCO
  { key: 'el_taco_loco_qryniah', brand: 'EL TACO LOCO', branch: 'Al Qryniah', q: 'EL TACO LOCO Prince Mishaal bin Abdulaziz Al Qryniah Jeddah' },

  // Gyb Taco
  { key: 'gyb_taco_rehab', brand: 'Gyb Taco', branch: 'Al Rehab', q: 'Gyb Taco Sharurah Al Rehab Jeddah' },

  // Taco In
  { key: 'taco_in_naseem', brand: 'Taco In', branch: 'An Naseem', q: 'Taco In Al Naseem St Jeddah' },

  // KAKT
  { key: 'kakt_uwalk', brand: 'KAKT', branch: 'U Walk', q: 'KAKT U Walk Prince Sultan Rd Al Zahra Jeddah' }
];

async function run() {
  console.log('Resolving Mexican Places via Google Places API (New)...');
  const results = {};

  for (const item of queries) {
    console.log(`Searching [${item.brand} - ${item.branch}]: query="${item.q}"`);
    const places = await searchPlaces(item.q);
    results[item.key] = {
      query: item.q,
      count: places.length,
      places: places.map(p => ({
        id: p.id,
        displayName: p.displayName?.text,
        formattedAddress: p.formattedAddress,
        location: p.location,
        rating: p.rating,
        userRatingCount: p.userRatingCount,
        businessStatus: p.businessStatus,
        googleMapsUri: p.googleMapsUri,
        regularOpeningHours: p.regularOpeningHours?.weekdayDescriptions
      }))
    };
    // sleep 100ms
    await new Promise(r => setTimeout(r, 100));
  }

  fs.writeFileSync(path.join(__dirname, 'mexican_places_search_results.json'), JSON.stringify(results, null, 2));
  console.log('Search complete. Results written to scripts/mexican_places_search_results.json');
}

run().catch(console.error);
