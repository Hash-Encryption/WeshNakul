import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));
const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));
const sweepById = new Set(sweep.map(p => p.id));

console.log('--- THE 17 UNMATCHED CANDIDATE BRANCHES ---');
for (const brand of raw.brands) {
  for (const b of (brand.physical_jeddah_branches || [])) {
    if (!sweepById.has(b.google_place_id)) {
      // Also check if fuzzy matched
      // Let's print candidate details
      console.log(`[${brand.canonical_name}] ${b.branch_name}`);
      console.log(`  Candidate ID: ${b.google_place_id}`);
      console.log(`  Candidate Addr: ${b.formatted_address}`);
      console.log(`  Candidate Maps: ${b.google_maps_url}`);
    }
  }
}
