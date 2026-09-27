import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

if (!API_KEY) {
  console.error('ERROR: No GOOGLE_MAPS_KEY in .env.local');
  process.exit(1);
}

// Test fetching one place details
async function fetchPlaceDetails(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,addressComponents,location,rating,userRatingCount,googleMapsUri,businessStatus,regularOpeningHours,nationalPhoneNumber'
    }
  });
  if (!res.ok) {
    const txt = await res.text();
    return { error: `${res.status} ${txt}` };
  }
  return await res.json();
}

async function test() {
  console.log('Testing Google Places API...');
  const sample = await fetchPlaceDetails('ChIJiwLjuXXRwxUR9zR13OUp-ws'); // Domino's Al Safa
  console.log('Sample result:', JSON.stringify(sample, null, 2));
}

test();
