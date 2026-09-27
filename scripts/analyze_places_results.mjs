import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('tmp/saudi_rice_places_raw.json', 'utf8'));

for (const [brandId, data] of Object.entries(raw)) {
  console.log('====================================');
  console.log(`BRAND: ${brandId} - ${data.brand.en} (${data.brand.ar})`);
  for (const [candName, places] of Object.entries(data.candidates)) {
    console.log(`  Candidate: "${candName}"`);
    if (!places || places.length === 0) {
      console.log('    -> NO PLACES FOUND');
    } else {
      for (const p of places.slice(0, 3)) {
        console.log(`    -> [${p.businessStatus}] ${p.displayName?.text} | ID: ${p.id} | Rating: ${p.rating} (${p.userRatingCount}) | Addr: ${p.formattedAddress}`);
      }
    }
  }
}
