import fs from 'node:fs';

const rawData = JSON.parse(fs.readFileSync('docs/research/jeddah-indian-raw-uploaded.json', 'utf8'));

console.log('=== PHASE 4: PROGRAMMATIC AUDIT OF RAW INDIAN DATASET ===\n');

const brands = rawData.brands || [];
const brandCount = brands.length;

let prodReadyBrands = 0;
let cautionBrands = 0;
let manualReviewBrands = 0;
let excludedBrands = 0;

let totalBranches = 0;
let prodReadyBranches = 0;
let cautionBranches = 0;
let manualReviewBranches = 0;
let excludedBranches = 0;

let openBranches = 0;
let tempClosedBranches = 0;
let permClosedBranches = 0;

let placeIdCount = 0;
let mapsUrlCount = 0;
let coordCount = 0;
let addressCount = 0;
let districtCount = 0;
let ratingCount = 0;
let reviewCount = 0;
let hoursCount = 0;

const placeIds = [];
const mapsUrls = [];

const failingActiveBranches = [];

for (const b of brands) {
  if (b.production_eligibility === 'production_ready') prodReadyBrands++;
  else if (b.production_eligibility === 'usable_with_caution') cautionBrands++;
  else if (b.production_eligibility === 'manual_review') manualReviewBrands++;
  else if (b.production_eligibility === 'excluded') excludedBrands++;

  for (const br of (b.branches || [])) {
    totalBranches++;
    
    // Check branch eligibility (or inherit from brand if not set at branch level)
    const brElig = br.production_eligibility || b.production_eligibility;
    if (brElig === 'production_ready') prodReadyBranches++;
    else if (brElig === 'usable_with_caution') cautionBranches++;
    else if (brElig === 'manual_review') manualReviewBranches++;
    else if (brElig === 'excluded') excludedBranches++;

    if (br.operating_status === 'open') openBranches++;
    else if (br.operating_status === 'temporarily_closed') tempClosedBranches++;
    else if (br.operating_status === 'permanently_closed') permClosedBranches++;

    if (br.google_place_id && br.google_place_id.trim().length > 0) {
      placeIdCount++;
      placeIds.push(br.google_place_id);
    }
    if (br.google_maps_url && br.google_maps_url.trim().length > 0) {
      mapsUrlCount++;
      mapsUrls.push(br.google_maps_url);
    }
    if (typeof br.latitude === 'number' && typeof br.longitude === 'number') {
      coordCount++;
    }
    if (br.formatted_address && br.formatted_address.trim().length > 0) {
      addressCount++;
    }
    if (br.canonical_district && br.canonical_district.trim().length > 0) {
      districtCount++;
    }
    if (typeof br.google_rating === 'number') {
      ratingCount++;
    }
    if (typeof br.google_review_count === 'number') {
      reviewCount++;
    }
    if (br.hours && (typeof br.hours === 'object' || (typeof br.hours === 'string' && br.hours.trim().length > 0))) {
      hoursCount++;
    }

    // Active failure check: if it's proposed active (i.e. brand or branch is production_ready or usable_with_caution)
    const isActive = brElig === 'production_ready' || brElig === 'usable_with_caution';
    if (isActive) {
      const issues = [];
      if (!br.google_place_id) issues.push('missing Place ID');
      if (!br.google_maps_url) issues.push('missing Maps URL');
      if (typeof br.latitude !== 'number' || typeof br.longitude !== 'number') issues.push('missing coordinates');
      if (!br.formatted_address) issues.push('missing address');
      if (br.operating_status !== 'open') issues.push(`status is ${br.operating_status}`);
      if (issues.length > 0) {
        failingActiveBranches.push({
          brand: b.canonical_name,
          branch: br.branch_name,
          eligibility: brElig,
          issues
        });
      }
    }
  }
}

const dupPlaceIds = placeIds.filter((p, i) => placeIds.indexOf(p) !== i);
const dupMapsUrls = mapsUrls.filter((u, i) => mapsUrls.indexOf(u) !== i);

console.log('Brand Count:', brandCount);
console.log('Branch Count:', totalBranches);
console.log('Production-Ready Brands:', prodReadyBrands);
console.log('Usable-With-Caution Brands:', cautionBrands);
console.log('Manual-Review Brands:', manualReviewBrands);
console.log('Excluded Brands:', excludedBrands);

console.log('\nBranch Status & Eligibility:');
console.log('Production-Ready Branches:', prodReadyBranches);
console.log('Caution Branches:', cautionBranches);
console.log('Manual-Review Branches:', manualReviewBranches);
console.log('Excluded Branches:', excludedBranches);
console.log('Open Branches:', openBranches);
console.log('Temporarily Closed Branches:', tempClosedBranches);
console.log('Permanently Closed Branches:', permClosedBranches);

console.log('\nCompleteness (out of ' + totalBranches + ' branches):');
console.log(`Place ID Completeness: ${(placeIdCount / totalBranches * 100).toFixed(1)}% (${placeIdCount}/${totalBranches})`);
console.log(`Maps URL Completeness: ${(mapsUrlCount / totalBranches * 100).toFixed(1)}% (${mapsUrlCount}/${totalBranches})`);
console.log(`Coordinate Completeness: ${(coordCount / totalBranches * 100).toFixed(1)}% (${coordCount}/${totalBranches})`);
console.log(`Address Completeness: ${(addressCount / totalBranches * 100).toFixed(1)}% (${addressCount}/${totalBranches})`);
console.log(`District Completeness: ${(districtCount / totalBranches * 100).toFixed(1)}% (${districtCount}/${totalBranches})`);
console.log(`Rating Completeness: ${(ratingCount / totalBranches * 100).toFixed(1)}% (${ratingCount}/${totalBranches})`);
console.log(`Review Count Completeness: ${(reviewCount / totalBranches * 100).toFixed(1)}% (${reviewCount}/${totalBranches})`);
console.log(`Hours Completeness: ${(hoursCount / totalBranches * 100).toFixed(1)}% (${hoursCount}/${totalBranches})`);

console.log('\nDuplicates within Raw Dataset:');
console.log('Duplicate Place IDs:', dupPlaceIds.length, dupPlaceIds);
console.log('Duplicate Maps URLs:', dupMapsUrls.length, dupMapsUrls);

console.log('\nActive Branches Failing Current Production Requirements:');
console.log(`Total failing active branches: ${failingActiveBranches.length}`);
for (const f of failingActiveBranches) {
  console.log(`  - [${f.brand} - ${f.branch}] (${f.eligibility}): ${f.issues.join(', ')}`);
}
