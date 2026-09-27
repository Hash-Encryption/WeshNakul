import fs from 'node:fs';
import { fetchPlaceByIdDirect } from './fetch_place_by_id_direct.mjs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));
const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));

// Build lookup map from sweep by place ID
const sweepById = new Map();
for (const p of sweep) {
  sweepById.set(p.id, p);
}

// Master map of verified branch data
// Key: brandName + ':::' + branchName
// Value: verified place data
const verifiedPlaces = new Map();

// Helper to add verified place
function recordVerified(brand, branch, placeData) {
  verifiedPlaces.set(`${brand}:::${branch}`, placeData);
}

// Let's populate from exact place ID matches in sweep
for (const brand of raw.brands) {
  const brandName = brand.canonical_name;
  for (const b of (brand.physical_jeddah_branches || [])) {
    if (b.google_place_id && sweepById.has(b.google_place_id)) {
      const p = sweepById.get(b.google_place_id);
      recordVerified(brandName, b.branch_name, {
        source: 'sweep_exact_id',
        place_id: p.id,
        name: p.displayName?.text,
        formatted_address: p.formattedAddress,
        latitude: p.location?.latitude,
        longitude: p.location?.longitude,
        rating: p.rating,
        user_rating_count: p.userRatingCount,
        operating_status: p.businessStatus?.toLowerCase() === 'operational' ? 'open' : (p.businessStatus?.toLowerCase() || 'open'),
        address_components: p.addressComponents
      });
    }
  }
}

console.log(`Phase 1: Matched by exact Place ID from sweep: ${verifiedPlaces.size} / 107`);

// Now let's list every candidate branch that is NOT yet in verifiedPlaces
const pending = [];
for (const brand of raw.brands) {
  const brandName = brand.canonical_name;
  for (const b of (brand.physical_jeddah_branches || [])) {
    if (!verifiedPlaces.has(`${brandName}:::${b.branch_name}`)) {
      pending.push({
        brand: brandName,
        branch: b.branch_name,
        candidate_place_id: b.google_place_id,
        address: b.formatted_address,
        maps_url: b.google_maps_url
      });
    }
  }
}

console.log(`Remaining to resolve: ${pending.length}`);
console.log(JSON.stringify(pending, null, 2));

fs.writeFileSync('scripts/pending_branches.json', JSON.stringify(pending, null, 2));
