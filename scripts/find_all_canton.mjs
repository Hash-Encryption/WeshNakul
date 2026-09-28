import fs from 'node:fs';

const envLocal = fs.readFileSync('.env.local', 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

async function searchAll(query) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus,places.rating,places.userRatingCount,places.googleMapsUri'
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'en'
    })
  });
  const data = await res.json();
  return data.places || [];
}

async function main() {
  const queries = [
    'كانتون جدة',
    'Canton Jeddah',
    'Canton Chinese restaurant Jeddah'
  ];
  const allFound = new Map();
  for (const q of queries) {
    const places = await searchAll(q);
    for (const p of places) {
      if (!allFound.has(p.id)) {
        allFound.set(p.id, p);
      }
    }
  }
  console.log('Total unique Canton places across all queries:', allFound.size);
  const list = [...allFound.values()].map(p => ({
    name: p.displayName?.text,
    id: p.id,
    address: p.formattedAddress,
    lat: p.location?.latitude,
    lng: p.location?.longitude,
    rating: p.rating,
    reviews: p.userRatingCount,
    status: p.businessStatus
  }));
  console.table(list);
  fs.writeFileSync('scripts/canton_all_places_found.json', JSON.stringify(list, null, 2));
}

main().catch(console.error);
