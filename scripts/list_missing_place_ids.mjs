import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));
const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));
const sweepById = new Set(sweep.map(p => p.id));

console.log('--- MISSING CANDIDATE PLACE IDS ---');
for (const brand of raw.brands) {
  for (const b of (brand.physical_jeddah_branches || [])) {
    if (b.google_place_id && !sweepById.has(b.google_place_id)) {
      console.log(`[${brand.canonical_name}] ${b.branch_name} | ID: ${b.google_place_id} | Addr: ${b.formatted_address}`);
    }
  }
}
