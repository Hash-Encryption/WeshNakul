import fs from 'node:fs';

const envLocal = fs.readFileSync('.env.local', 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

async function test() {
  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus,places.types'
    },
    body: JSON.stringify({
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: 21.640772, longitude: 39.10134 },
          radius: 1500
        }
      }
    })
  });
  const data = await res.json();
  console.log('Places near J4R2+6GQ Ash Shati:');
  for (const p of (data.places || [])) {
    console.log(p.displayName?.text + ' --- ' + p.formattedAddress + ' --- ' + p.id);
  }
}
test();
