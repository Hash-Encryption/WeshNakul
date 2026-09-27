import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-street-folk-food-raw-uploaded.json', 'utf8'));
console.log('Top-level keys:', Object.keys(raw));
console.log('Dataset:', JSON.stringify(raw.dataset, null, 2));
console.log('Taxonomy:', JSON.stringify(raw.taxonomy, null, 2));
console.log('Deck rules:', JSON.stringify(raw.deck_rules, null, 2));
console.log('Brands count:', raw.brands?.length);
for (const b of raw.brands || []) {
  console.log(`- ${b.id} (${b.name_en || b.canonical_name}): ${(b.branches || []).length} branches, status: ${b.production_eligibility}`);
  for (const br of (b.branches || [])) {
    console.log(`    * ${br.name || br.branch_name} | dist: ${br.district} | place_id: ${br.google_place_id ? 'YES' : 'NO'} | coords: ${br.latitude},${br.longitude} | elig: ${br.production_eligibility}`);
  }
}
