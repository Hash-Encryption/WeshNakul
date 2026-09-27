import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));
const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));

// Build lookup maps
const sweepById = new Map();
for (const p of sweep) {
  sweepById.set(p.id, p);
}

console.log('================================================================');
console.log('--- PIZZA BRANCH MATCH AUDIT AGAINST SWEEP (662 PLACES) ---');
console.log('================================================================\n');

let totalBranches = 0;
let exactPlaceIdMatches = 0;
let fuzzyBrandDistrictMatches = 0;
let unmatched = [];

for (const brand of raw.brands) {
  const brandName = brand.canonical_name;
  const branches = brand.physical_jeddah_branches || [];
  console.log(`\n### ${brandName} (${branches.length} branches)`);

  for (const b of branches) {
    totalBranches++;
    let match = null;
    let matchType = '';

    // 1. Direct Place ID match
    if (b.google_place_id && sweepById.has(b.google_place_id)) {
      match = sweepById.get(b.google_place_id);
      matchType = 'exact_place_id';
      exactPlaceIdMatches++;
    } else {
      // 2. Search in sweep by brand name + branch name or district or street
      const brandLower = brandName.toLowerCase();
      const bNameLower = b.branch_name.toLowerCase();
      const distLower = (b.physical_district || '').toLowerCase();

      // Filter sweep places for this brand
      const brandCandidates = sweep.filter(p => {
        const text = ((p.displayName?.text || '') + ' ' + (p.formattedAddress || '')).toLowerCase();
        return text.includes(brandLower) || (brand.arabic_name && text.includes(brand.arabic_name));
      });

      // Try matching branch name keywords
      const branchKeywords = bNameLower.split(/[\s—\-\/]+/).filter(w => w.length > 3 && !['pizza', 'branch', 'jeddah'].includes(w));
      
      let bestCandidate = null;
      for (const cand of brandCandidates) {
        const candText = ((cand.displayName?.text || '') + ' ' + (cand.formattedAddress || '')).toLowerCase();
        // Check if any keyword matches
        const matchesKeyword = branchKeywords.some(kw => candText.includes(kw));
        const matchesDist = distLower.length > 2 && candText.includes(distLower);
        if (matchesKeyword || matchesDist) {
          bestCandidate = cand;
          break;
        }
      }

      if (bestCandidate) {
        match = bestCandidate;
        matchType = 'fuzzy_name_district';
        fuzzyBrandDistrictMatches++;
      }
    }

    if (match) {
      console.log(`  ✓ [${matchType}] ${b.branch_name}`);
      console.log(`    Matched: ${match.displayName?.text} | ID: ${match.id}`);
      console.log(`    Address: ${match.formattedAddress}`);
      console.log(`    Coords: ${match.location?.latitude}, ${match.location?.longitude} | Status: ${match.businessStatus}`);
      console.log(`    Rating: ${match.rating} (${match.userRatingCount} reviews)`);
    } else {
      console.log(`  ❌ UNMATCHED: ${b.branch_name}`);
      console.log(`    Candidate ID: ${b.google_place_id || 'null'}`);
      console.log(`    Address: ${b.formatted_address}`);
      unmatched.push({ brand: brandName, branch: b.branch_name, candidate_id: b.google_place_id, address: b.formatted_address });
    }
  }
}

console.log('\n================================================================');
console.log(`TOTAL BRANCHES: ${totalBranches}`);
console.log(`EXACT PLACE ID MATCHES: ${exactPlaceIdMatches}`);
console.log(`FUZZY BRAND/DISTRICT MATCHES: ${fuzzyBrandDistrictMatches}`);
console.log(`TOTAL MATCHED: ${exactPlaceIdMatches + fuzzyBrandDistrictMatches} / ${totalBranches}`);
console.log(`UNMATCHED: ${unmatched.length}`);
console.log('================================================================');
