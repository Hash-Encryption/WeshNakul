import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));
const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));

console.log(`Loaded ${sweep.length} sweep places.`);
const sweepById = new Map();
for (const p of sweep) {
  sweepById.set(p.id, p);
}

// Check how many of our 89 candidate place IDs are in the sweep
let matchedByPlaceId = 0;
let missingCandidatePlaceIds = [];

let totalCandidateBranches = 0;
for (const brand of raw.brands) {
  for (const b of (brand.physical_jeddah_branches || [])) {
    totalCandidateBranches++;
    if (b.google_place_id) {
      if (sweepById.has(b.google_place_id)) {
        matchedByPlaceId++;
      } else {
        missingCandidatePlaceIds.push({
          brand: brand.canonical_name,
          branch: b.branch_name,
          place_id: b.google_place_id,
          address: b.formatted_address
        });
      }
    }
  }
}

console.log(`Candidate branches: ${totalCandidateBranches}`);
console.log(`Matched directly by Place ID in sweep: ${matchedByPlaceId} / 89`);
console.log(`Candidate Place IDs not yet in sweep: ${missingCandidatePlaceIds.length}`);

// Group sweep places by brand
console.log('\nSweep places count for key pizza brands:');
const brands = [
  "Domino's", "Maestro", "Papa Johns", "Little Caesars", "Pizza Hut",
  "White Wood", "il Postino", "Verra", "NAPOLI BLU", "Lenuo", "Blu Pizzeri",
  "Mazencito", "Impasto Seven", "Locos Pizza", "Jon & Vinny", "Bread Ahead",
  "Pizzalio", "Pastola"
];

for (const bName of brands) {
  const matches = sweep.filter(p => {
    const text = (p.displayName?.text || '') + ' ' + (p.formattedAddress || '');
    return text.toLowerCase().includes(bName.toLowerCase());
  });
  console.log(`  - ${bName}: ${matches.length} listings in sweep`);
}
