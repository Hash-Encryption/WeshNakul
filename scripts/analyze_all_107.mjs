import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));
const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));
const sweepById = new Map();
for (const p of sweep) {
  sweepById.set(p.id, p);
}

console.log(`Loaded ${raw.brands.length} brands, ${sweep.length} sweep places.`);

let totalCandidateBranches = 0;
let matchedInSweepById = 0;
let hasPlaceIdInRaw = 0;
let missingPlaceIdInRaw = 0;

const unresolved = [];

for (const brand of raw.brands) {
  const branches = brand.physical_jeddah_branches || brand.branches || [];
  totalCandidateBranches += branches.length;
  for (const b of branches) {
    if (b.google_place_id) {
      hasPlaceIdInRaw++;
      if (sweepById.has(b.google_place_id)) {
        matchedInSweepById++;
      } else {
        unresolved.push({
          brand: brand.canonical_name,
          branch: b.branch_name,
          place_id: b.google_place_id,
          address: b.formatted_address,
          maps_url: b.google_maps_url,
          reason: 'Has place_id in raw but not in sweep'
        });
      }
    } else {
      missingPlaceIdInRaw++;
      unresolved.push({
        brand: brand.canonical_name,
        branch: b.branch_name,
        place_id: null,
        address: b.formatted_address,
        maps_url: b.google_maps_url,
        reason: 'Missing place_id in raw'
      });
    }
  }
}

console.log(`Total candidate branches: ${totalCandidateBranches}`);
console.log(`Has Place ID in raw: ${hasPlaceIdInRaw}`);
console.log(`Missing Place ID in raw: ${missingPlaceIdInRaw}`);
console.log(`Matched directly in sweep by Place ID: ${matchedInSweepById}`);
console.log(`Unresolved or not in sweep: ${unresolved.length}`);

console.log('\nList of unresolved or not in sweep:');
for (const u of unresolved) {
  console.log(`- [${u.brand}] ${u.branch} | place_id: ${u.place_id || 'NONE'} | ${u.reason} | url: ${u.maps_url || 'NONE'}`);
}
