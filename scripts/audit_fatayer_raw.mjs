import fs from 'node:fs';

const rawData = JSON.parse(fs.readFileSync('docs/research/jeddah-fatayer-raw-uploaded.json', 'utf8'));

console.log('=== PHASE C — PROGRAMMATIC AUDIT OF RAW FATAYER DATASET ===');
console.log('Dataset Name:', rawData.dataset_name);
console.log('Total Brands reported:', rawData.brand_count);
console.log('Actual Brands in array:', rawData.brands.length);

let totalBranchRecords = 0;
let activeProposedBranches = 0;
let prodReadyBranches = 0;
let usableCautionBranches = 0;
let manualReviewBranches = 0;
let excludedBranches = 0;

let openBranches = 0;
let tempClosedBranches = 0;
let permClosedBranches = 0;
let unknownStatusBranches = 0;

let placeIdCount = 0;
let mapsUrlCount = 0;
let coordinateCount = 0;
let addressCount = 0;
let ratingCount = 0;
let reviewCount = 0;
let hoursCount = 0;
let canonicalDistrictCount = 0;
let unknownDistrictCount = 0;

const placeIds = [];
const mapsUrls = [];

const issues = [];

for (const b of rawData.brands) {
  for (const br of (b.branches || [])) {
    totalBranchRecords++;

    // Eligibility
    if (br.production_eligibility === 'production_ready') {
      prodReadyBranches++;
      activeProposedBranches++;
    } else if (br.production_eligibility === 'usable_with_caution') {
      usableCautionBranches++;
      activeProposedBranches++;
    } else if (br.production_eligibility === 'manual_review') {
      manualReviewBranches++;
    } else if (br.production_eligibility === 'excluded') {
      excludedBranches++;
    }

    // Operating status
    if (br.operating_status === 'open') {
      openBranches++;
    } else if (br.operating_status === 'temporarily_closed') {
      tempClosedBranches++;
    } else if (br.operating_status === 'permanently_closed') {
      permClosedBranches++;
    } else {
      unknownStatusBranches++;
    }

    // Completeness
    if (br.google_place_id && br.google_place_id.trim()) {
      placeIdCount++;
      placeIds.push(br.google_place_id);
    }
    if (br.google_maps_url && br.google_maps_url.trim()) {
      mapsUrlCount++;
      mapsUrls.push(br.google_maps_url);
    }
    if (typeof br.latitude === 'number' && typeof br.longitude === 'number') {
      coordinateCount++;
    }
    if (br.formatted_address && br.formatted_address.trim()) {
      addressCount++;
    }
    if (typeof br.google_rating === 'number') {
      ratingCount++;
    }
    if (typeof br.google_review_count === 'number') {
      reviewCount++;
    }
    if (br.hours && br.hours.trim()) {
      hoursCount++;
    }
    if (br.canonical_district && br.canonical_district.trim() && br.canonical_district !== 'unknown') {
      canonicalDistrictCount++;
    } else {
      unknownDistrictCount++;
    }

    // Identify active/production-ready with missing production requirements
    if (br.production_eligibility === 'production_ready' || br.production_eligibility === 'usable_with_caution') {
      const missing = [];
      if (!br.google_place_id) missing.push('place_id');
      if (!br.google_maps_url) missing.push('maps_url');
      if (typeof br.latitude !== 'number' || typeof br.longitude !== 'number') missing.push('coordinates');
      if (!br.formatted_address) missing.push('address');
      if (!br.operating_status || br.operating_status !== 'open') missing.push(`operating_status=${br.operating_status}`);
      if (missing.length > 0) {
        issues.push({
          brand: b.canonical_name,
          branch: br.branch_name,
          eligibility: br.production_eligibility,
          missing
        });
      }
    }
  }
}

const dupPlaceIds = placeIds.filter((id, i) => placeIds.indexOf(id) !== i);
const dupMapsUrls = mapsUrls.filter((u, i) => mapsUrls.indexOf(u) !== i);

console.log('\n--- COUNTS ---');
console.log('Total Brands:', rawData.brands.length);
console.log('Total Branch Records:', totalBranchRecords);
console.log('Active/Proposed Branches:', activeProposedBranches);
console.log('  - Production Ready:', prodReadyBranches);
console.log('  - Usable With Caution:', usableCautionBranches);
console.log('Manual Review Branches:', manualReviewBranches);
console.log('Excluded Branches:', excludedBranches);
console.log('Open Branches:', openBranches);
console.log('Temporarily Closed Branches:', tempClosedBranches);
console.log('Permanently Closed Branches:', permClosedBranches);
console.log('Unknown Status Branches:', unknownStatusBranches);

console.log('\n--- FIELD COMPLETENESS (across all', totalBranchRecords, 'records) ---');
console.log(`Place ID: ${(placeIdCount / totalBranchRecords * 100).toFixed(1)}% (${placeIdCount}/${totalBranchRecords})`);
console.log(`Maps URL: ${(mapsUrlCount / totalBranchRecords * 100).toFixed(1)}% (${mapsUrlCount}/${totalBranchRecords})`);
console.log(`Coordinates: ${(coordinateCount / totalBranchRecords * 100).toFixed(1)}% (${coordinateCount}/${totalBranchRecords})`);
console.log(`Formatted Address: ${(addressCount / totalBranchRecords * 100).toFixed(1)}% (${addressCount}/${totalBranchRecords})`);
console.log(`Ratings: ${(ratingCount / totalBranchRecords * 100).toFixed(1)}% (${ratingCount}/${totalBranchRecords})`);
console.log(`Review Counts: ${(reviewCount / totalBranchRecords * 100).toFixed(1)}% (${reviewCount}/${totalBranchRecords})`);
console.log(`Hours: ${(hoursCount / totalBranchRecords * 100).toFixed(1)}% (${hoursCount}/${totalBranchRecords})`);
console.log(`Canonical District: ${(canonicalDistrictCount / totalBranchRecords * 100).toFixed(1)}% (${canonicalDistrictCount}/${totalBranchRecords})`);
console.log(`Unknown District: ${(unknownDistrictCount / totalBranchRecords * 100).toFixed(1)}% (${unknownDistrictCount}/${totalBranchRecords})`);

console.log('\n--- DUPLICATES ---');
console.log('Duplicate Place IDs in raw:', dupPlaceIds);
console.log('Duplicate Maps URLs in raw:', dupMapsUrls);

console.log('\n--- ACTIVE/PROPOSED BRANCHES MISSING PRODUCTION REQUIREMENTS (Total:', issues.length, ') ---');
for (const iss of issues) {
  console.log(`- [${iss.eligibility}] ${iss.brand} - ${iss.branch}: missing [${iss.missing.join(', ')}]`);
}
