import fs from 'node:fs';

const rawData = JSON.parse(fs.readFileSync('docs/research/jeddah-sandwiches-raw-uploaded.json', 'utf8'));

console.log('--- RAW SANDWICHES RESEARCH AUDIT ---');
console.log('Dataset:', rawData.dataset);
console.log('Version:', rawData.version);
console.log('Original Brand Count reported:', rawData.brand_count);
console.log('Actual Brands in array:', rawData.brands.length);

let totalProdBranches = 0;
let placeIdCount = 0;
let mapsUrlCount = 0;
let coordsCount = 0;
let addressCount = 0;
let ratingCount = 0;
let reviewCount = 0;
let hoursCount = 0;
const placeIds = [];
const mapsUrls = [];

console.log('\n--- BRANDS & PROPOSED PRODUCTION BRANCHES ---');
for (const b of rawData.brands) {
  const branches = b.branches || [];
  totalProdBranches += branches.length;
  console.log(`- ${b.brand_name} (${b.arabic_name || 'NO ARABIC'}) [${branches.length} branches]`);
  for (const br of branches) {
    if (br.google_place_id) {
      placeIdCount++;
      placeIds.push(br.google_place_id);
    }
    if (br.google_maps_url) {
      mapsUrlCount++;
      mapsUrls.push(br.google_maps_url);
    }
    if (typeof br.latitude === 'number' && typeof br.longitude === 'number') coordsCount++;
    if (br.address) addressCount++;
    if (typeof br.rating === 'number') ratingCount++;
    if (typeof br.review_count === 'number') reviewCount++;
    if (br.hours) hoursCount++;

    if (!br.google_place_id) {
      console.log(`  * MISSING PLACE ID: ${br.branch_name} (${br.district}) - ${br.address}`);
    }
    if (!br.latitude || !br.longitude) {
      // check if coords are missing
      console.log(`  * MISSING COORDS: ${br.branch_name} (${br.district})`);
    }
  }
}

const manualReviewCandidates = rawData.manual_review_candidates || [];
console.log(`\nManual Review Candidates count: ${manualReviewCandidates.length}`);
for (const mr of manualReviewCandidates) {
  console.log(`- [${mr.brand}] ${mr.branch_name} (${mr.district}): ${mr.manual_review}`);
}

const totalCandidates = totalProdBranches + manualReviewCandidates.length;

console.log('\n--- TOTAL COUNTS & COMPLETENESS ---');
console.log(`Total candidate branches: ${totalCandidates}`);
console.log(`Proposed production branches: ${totalProdBranches}`);
console.log(`Place ID completeness: ${(placeIdCount / totalProdBranches * 100).toFixed(1)}% (${placeIdCount}/${totalProdBranches})`);
console.log(`Maps URL completeness: ${(mapsUrlCount / totalProdBranches * 100).toFixed(1)}% (${mapsUrlCount}/${totalProdBranches})`);
console.log(`Coordinate completeness: ${(coordsCount / totalProdBranches * 100).toFixed(1)}% (${coordsCount}/${totalProdBranches})`);
console.log(`Address completeness: ${(addressCount / totalProdBranches * 100).toFixed(1)}% (${addressCount}/${totalProdBranches})`);
console.log(`Rating completeness: ${(ratingCount / totalProdBranches * 100).toFixed(1)}% (${ratingCount}/${totalProdBranches})`);
console.log(`Review count completeness: ${(reviewCount / totalProdBranches * 100).toFixed(1)}% (${reviewCount}/${totalProdBranches})`);
console.log(`Hours completeness: ${(hoursCount / totalProdBranches * 100).toFixed(1)}% (${hoursCount}/${totalProdBranches})`);

const dupPlaceIds = placeIds.filter((id, i) => placeIds.indexOf(id) !== i);
console.log('Duplicate Place IDs in raw proposed production:', dupPlaceIds);
