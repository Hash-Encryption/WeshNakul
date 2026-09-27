import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('tmp/saudi_rice_places_raw.json', 'utf8'));

for (const [bId, data] of Object.entries(raw)) {
  if (!['raydan', 'al_romansiah'].includes(bId)) continue;
  console.log('====================================');
  console.log(`=== ${bId.toUpperCase()} (${data.generalPlaces?.length || 0} general places) ===`);
  const seen = new Set();
  for (const p of (data.generalPlaces || [])) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    console.log(`  [${p.businessStatus}] ${p.displayName?.text} | ID: ${p.id} | Rating: ${p.rating} (${p.userRatingCount}) | Addr: ${p.formattedAddress}`);
  }
}
