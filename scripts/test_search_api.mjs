import fs from 'node:fs';

const envLocal = fs.readFileSync('.env.local', 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

async function test() {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus'
    },
    body: JSON.stringify({ textQuery: 'Ginger Leaf Jeddah Hilton' })
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

test();
