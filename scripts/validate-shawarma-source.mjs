import fs from 'node:fs';

const filePath = 'docs/research/jeddah-shawarma-pass-d-corrected.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('--- SHAWARMA SOURCE AUDIT ---');
console.log('Schema Version:', data.schema_version);
console.log('Dataset Name:', data.dataset);
console.log('Verification Date:', data.verified_at);
console.log('Status:', data.status);
console.log('Total Brands:', data.brands.length);

let prodReadyBrands = 0;
let cautionBrands = 0;
let totalProdBranches = 0;
let totalManualReviewBranches = 0;
let missingCoords = 0;
let missingPlaceIds = 0;
let nullCanonicalDistrict = 0;
const placeIds = [];

for (const b of data.brands) {
  if (b.production_eligibility === 'production_ready') {
    prodReadyBrands++;
  } else {
    cautionBrands++;
  }

  if (Array.isArray(b.production_branches)) {
    totalProdBranches += b.production_branches.length;
    for (const br of b.production_branches) {
      if (br.latitude === null || br.longitude === null) {
        missingCoords++;
      }
      if (!br.google_place_id) {
        missingPlaceIds++;
      } else {
        placeIds.push(br.google_place_id);
      }
      if (br.canonical_district === null) {
        nullCanonicalDistrict++;
      }
    }
  }

  if (Array.isArray(b.manual_review_branches)) {
    totalManualReviewBranches += b.manual_review_branches.length;
  }
}

const uniquePlaceIds = new Set(placeIds);
const duplicates = placeIds.filter((item, index) => placeIds.indexOf(item) !== index);

console.log('Production Ready Brands:', prodReadyBrands);
console.log('Usable with Caution / Other Brands:', cautionBrands);
console.log('Total Verified Production Branches:', totalProdBranches);
console.log('Total Manual Review Branches:', totalManualReviewBranches);
console.log('Branches Missing Coordinates:', missingCoords);
console.log('Branches Missing Place IDs:', missingPlaceIds);
console.log('Duplicate Google Place IDs:', duplicates.length, duplicates);
console.log('Branches with canonical_district = null:', nullCanonicalDistrict);
