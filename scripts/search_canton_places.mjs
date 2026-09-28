import fs from 'node:fs';

const envLocal = fs.readFileSync('.env.local', 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

async function searchPlace(query) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus,places.rating,places.userRatingCount,places.googleMapsUri,places.regularOpeningHours'
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
  const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-asian-raw-uploaded.json', 'utf8'));
  const canton = raw.brands.find(b => b.brand_name.toLowerCase().includes('canton'));
  
  console.log(`Checking ${canton.branches.length} Canton branches...`);
  const results = [];

  for (const b of canton.branches) {
    const q = `${b.branch_name} Jeddah`;
    console.log(`Searching for: ${q}...`);
    const places = await searchPlace(q);
    console.log(`  Found ${places.length} places`);
    if (places.length > 0) {
      const top = places[0];
      console.log(`  Top match: ${top.displayName?.text} | ID: ${top.id} | Status: ${top.businessStatus} | Addr: ${top.formattedAddress} | Coords: ${top.location?.latitude}, ${top.location?.longitude}`);
      results.push({
        branch: b.branch_name,
        original_eligibility: b.production_eligibility,
        original_coords: { lat: b.latitude, lng: b.longitude },
        found_place: top
      });
    } else {
      console.log(`  No place found`);
      results.push({
        branch: b.branch_name,
        original_eligibility: b.production_eligibility,
        original_coords: { lat: b.latitude, lng: b.longitude },
        found_place: null
      });
    }
    await new Promise(r => setTimeout(r, 300));
  }

  fs.writeFileSync('scripts/canton_search_results.json', JSON.stringify(results, null, 2));
}

main().catch(console.error);
