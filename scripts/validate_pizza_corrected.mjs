import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filePath = path.join(rootDir, 'docs', 'research', 'jeddah-pizza-pass-d-corrected.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const CANONICAL_30 = new Set([
  'al_sheraa', 'al_hamdaniyah', 'abhur_al_shamaliyah', 'abhur_al_janoubiyah',
  'al_murjan', 'al_basateen', 'al_mohammadiyyah', 'al_naeem', 'al_marwah',
  'an_nuzhah', 'al_shati', 'al_bawadi', 'al_salamah', 'al_zahra', 'al_safa',
  'al_samer', 'ar_rabwah', 'al_faisaliyyah', 'al_aziziyah', 'al_rawdah',
  'al_khalidiyyah', 'al_rehab', 'al_andalus', 'al_hamra', 'al_sharafeyah',
  'al_naseem', 'al_ruwais', 'al_faiha', 'al_balad', 'al_thaghr'
]);

const dbPlaceIds = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'db_existing_place_ids.json'), 'utf8')));

console.log('=====================================================');
console.log('======= WESHNAKUL PIZZA VALIDATION AUDIT PASS =======');
console.log('=====================================================');
console.log('Schema Version:', data.schema_version);
console.log('Dataset:', data.dataset.display_category, `(${data.dataset.primary_category})`);
console.log('Status:', data.dataset.status);
console.log('Verified Date:', data.dataset.verified_date);

let integrityErrors = 0;

// Brands
const totalBrands = data.brands.length;
let prodReadyBrands = 0;
let cautionBrands = 0;
let manualReviewBrands = 0;
let excludedBrands = 0;

for (const b of data.brands) {
  if (b.production_eligibility === 'production_ready') {
    prodReadyBrands++;
  } else if (b.production_eligibility === 'usable_with_caution') {
    cautionBrands++;
  } else if (b.production_eligibility === 'manual_review') {
    manualReviewBrands++;
  } else if (b.production_eligibility === 'excluded') {
    excludedBrands++;
  }
}

// Branches
let totalActiveBranches = 0; // branches in b.branches
let prodReadyBranches = 0;
let cautionBranches = 0;
let totalExcludedBranches = 0;
let totalManualReviewBranches = 0;

let branchesWithPlaceId = 0;
let branchesWithCoords = 0;
let branchesWithMapsUrl = 0;
let branchesWithAddress = 0;
let branchesWithOperatingStatus = 0;
let branchesWithRating = 0;
let branchesWithReviewCount = 0;

let canonicalDistrictActiveBranches = 0;
let nullDistrictActiveBranches = 0;
let invalidDistrictCount = 0;

const placeIds = [];
const mapsUrls = [];
const crossCategoryCollisions = [];
const outOfBoundsCoords = [];
const nonJeddahBranches = [];
const permanentlyClosedBranches = [];

for (const b of data.brands) {
  // Check active branches (production_ready + usable_with_caution)
  for (const br of (b.branches || [])) {
    totalActiveBranches++;

    if (br.production_eligibility === 'production_ready') {
      prodReadyBranches++;
    } else if (br.production_eligibility === 'usable_with_caution') {
      cautionBranches++;
    }

    // Place ID check
    if (br.google_place_id && br.google_place_id.trim().length > 0) {
      branchesWithPlaceId++;
      placeIds.push(br.google_place_id);

      if (dbPlaceIds.has(br.google_place_id)) {
        crossCategoryCollisions.push({
          brand: b.canonical_name,
          branch: br.branch_name,
          place_id: br.google_place_id
        });
        integrityErrors++;
      }
    }

    // Coordinates check
    if (typeof br.latitude === 'number' && typeof br.longitude === 'number') {
      branchesWithCoords++;
      // Check Jeddah bounding box [21.0 - 22.0, 39.0 - 39.5]
      if (br.latitude < 21.0 || br.latitude > 22.0 || br.longitude < 39.0 || br.longitude > 39.5) {
        outOfBoundsCoords.push({
          brand: b.canonical_name,
          branch: br.branch_name,
          lat: br.latitude,
          lng: br.longitude
        });
        integrityErrors++;
      }
    }

    // Maps URL check
    if (br.google_maps_url && br.google_maps_url.startsWith('https://www.google.com/maps/search/?api=1&query_place_id=')) {
      branchesWithMapsUrl++;
      mapsUrls.push(br.google_maps_url);
    }

    // Address check
    if (br.formatted_address && br.formatted_address.trim().length > 0) {
      branchesWithAddress++;
    }

    // Operating status check
    if (br.operating_status) {
      branchesWithOperatingStatus++;
      if (br.operating_status === 'permanently_closed') {
        permanentlyClosedBranches.push({ brand: b.canonical_name, branch: br.branch_name });
        integrityErrors++;
      }
    }

    // Rating & reviews check
    if (typeof br.google_rating === 'number') {
      branchesWithRating++;
    }
    if (typeof br.google_review_count === 'number') {
      branchesWithReviewCount++;
    }

    // City check
    if (br.city !== 'Jeddah') {
      nonJeddahBranches.push({ brand: b.canonical_name, branch: br.branch_name, city: br.city });
      integrityErrors++;
    }

    // District check
    if (br.canonical_district) {
      if (CANONICAL_30.has(br.canonical_district)) {
        canonicalDistrictActiveBranches++;
      } else {
        invalidDistrictCount++;
        integrityErrors++;
      }
    } else {
      nullDistrictActiveBranches++;
    }
  }

  // Count brand-level excluded branches
  if (Array.isArray(b.excluded_branches)) {
    totalExcludedBranches += b.excluded_branches.length;
  }

  // Count brand-level manual review branches
  if (Array.isArray(b.manual_review_branches)) {
    totalManualReviewBranches += b.manual_review_branches.length;
  }
}

// Duplicate checks
const duplicatePlaceIds = placeIds.filter((item, index) => placeIds.indexOf(item) !== index);
const duplicateMapsUrls = mapsUrls.filter((item, index) => mapsUrls.indexOf(item) !== index);
if (duplicatePlaceIds.length > 0) integrityErrors += duplicatePlaceIds.length;
if (duplicateMapsUrls.length > 0) integrityErrors += duplicateMapsUrls.length;

console.log('\n--- 1. BRANDS AUDIT ---');
console.log('Original Brands:', totalBrands);
console.log('Certified Production Brands:', prodReadyBrands);
console.log('Caution Brands:', cautionBrands);
console.log('Manual-Review Brands:', manualReviewBrands);
console.log('Excluded Brands:', excludedBrands);

console.log('\n--- 2. BRANCHES AUDIT ---');
console.log('Total Candidate Branches:', totalActiveBranches + totalExcludedBranches + totalManualReviewBranches);
console.log('Total Verified Active Branches (Production Catalog):', totalActiveBranches);
console.log('  - Production-Ready Branches (Canonical 30):', prodReadyBranches);
console.log('  - Usable-With-Caution Branches (Outer Jeddah):', cautionBranches);
console.log('Total Manual-Review Branches:', totalManualReviewBranches);
for (const b of data.brands) {
  if (b.manual_review_branches && b.manual_review_branches.length > 0) {
    for (const mr of b.manual_review_branches) {
      console.log(`    * [${b.canonical_name}] ${mr.branch_name}: ${mr.reason}`);
    }
  }
}
console.log('Total Excluded Branches:', totalExcludedBranches);

console.log('\n--- 3. PRODUCTION-DATA COMPLETENESS (Active Branches: 105) ---');
console.log(`Place ID Completeness: ${(branchesWithPlaceId / totalActiveBranches * 100).toFixed(1)}% (${branchesWithPlaceId}/${totalActiveBranches})`);
console.log(`Maps URL Completeness: ${(branchesWithMapsUrl / totalActiveBranches * 100).toFixed(1)}% (${branchesWithMapsUrl}/${totalActiveBranches})`);
console.log(`Coordinates Completeness: ${(branchesWithCoords / totalActiveBranches * 100).toFixed(1)}% (${branchesWithCoords}/${totalActiveBranches})`);
console.log(`Address Completeness: ${(branchesWithAddress / totalActiveBranches * 100).toFixed(1)}% (${branchesWithAddress}/${totalActiveBranches})`);
console.log(`Operating Status Completeness: ${(branchesWithOperatingStatus / totalActiveBranches * 100).toFixed(1)}% (${branchesWithOperatingStatus}/${totalActiveBranches})`);
console.log(`Rating Completeness: ${(branchesWithRating / totalActiveBranches * 100).toFixed(1)}% (${branchesWithRating}/${totalActiveBranches})`);
console.log(`Review Count Completeness: ${(branchesWithReviewCount / totalActiveBranches * 100).toFixed(1)}% (${branchesWithReviewCount}/${totalActiveBranches})`);

console.log('\n--- 4. GEOGRAPHY AUDIT ---');
console.log('Canonical 30-District Active Branches:', canonicalDistrictActiveBranches);
console.log('Null-District Outer Active Branches:', nullDistrictActiveBranches);
console.log('Invalid District Count:', invalidDistrictCount);

console.log('\n--- 5. INTEGRITY & COLLISION AUDIT ---');
console.log('Duplicate Place IDs within Pizza:', duplicatePlaceIds.length, duplicatePlaceIds);
console.log('Duplicate Maps URLs within Pizza:', duplicateMapsUrls.length, duplicateMapsUrls);
console.log('Cross-Category Collisions (with 201 live DB branches):', crossCategoryCollisions.length, crossCategoryCollisions);
console.log('Coordinates Out of Bounds:', outOfBoundsCoords.length, outOfBoundsCoords);
console.log('Wrong-City Branches:', nonJeddahBranches.length, nonJeddahBranches);
console.log('Permanently Closed Branches Retained:', permanentlyClosedBranches.length, permanentlyClosedBranches);

console.log('\n=====================================================');
console.log(`TOTAL INTEGRITY ERRORS: ${integrityErrors}`);
if (integrityErrors === 0) {
  console.log('VERIFICATION VERDICT: PASSED (Zero integrity violations)');
} else {
  console.error('VERIFICATION VERDICT: FAILED (Integrity violations detected)');
  process.exit(1);
}
console.log('=====================================================');
