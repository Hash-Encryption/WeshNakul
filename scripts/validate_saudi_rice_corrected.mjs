import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filePath = path.join(rootDir, 'docs', 'research', 'jeddah-saudi-rice-kabsa-pass-d-corrected.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const CANONICAL_30 = new Set([
  'al_sheraa', 'al_hamdaniyah', 'abhur_al_shamaliyah', 'abhur_al_janoubiyah',
  'al_murjan', 'al_basateen', 'al_mohammadiyyah', 'al_naeem', 'al_marwah',
  'an_nuzhah', 'al_shati', 'al_bawadi', 'al_salamah', 'al_zahra', 'al_safa',
  'al_samer', 'ar_rabwah', 'al_faisaliyyah', 'al_aziziyah', 'al_rawdah',
  'al_khalidiyyah', 'al_rehab', 'al_andalus', 'al_hamra', 'al_sharafeyah',
  'al_naseem', 'al_ruwais', 'al_faiha', 'al_balad', 'al_thaghr'
]);

console.log('=====================================================');
console.log('=== WESHNAKUL SAUDI RICE / KABSA VALIDATION AUDIT ===');
console.log('=====================================================');
console.log('Schema Version:', data.schema_version);
console.log('Category:', data.dataset.display_category, `(${data.dataset.primary_category})`);
console.log('Status:', data.dataset.status);
console.log('Verified Date:', data.dataset.verified_date);

const totalBrands = data.brands.length;
let prodReadyBrands = 0;
let cautionBrands = 0;
let manualReviewBrands = 0;

let totalProdBranches = 0;
let totalExcludedBranches = 0;
let totalManualReviewBranches = 0;

let branchesWithPlaceId = 0;
let branchesWithCoords = 0;
let branchesWithMapsUrl = 0;
let branchesWithAddress = 0;
let branchesMappedToCanonical = 0;
let branchesOutsideCanonical = 0;

const placeIds = [];
const mapsUrls = [];
const missingRequiredFields = [];
const nonCanonicalBranchDetails = [];

for (const b of data.brands) {
  if (b.production_eligibility === 'production_ready') {
    prodReadyBrands++;
  } else if (b.production_eligibility === 'usable_with_caution') {
    cautionBrands++;
  } else {
    manualReviewBrands++;
  }

  // Active branches
  for (const br of (b.branches || [])) {
    totalProdBranches++;

    // Place ID check
    if (br.google_place_id && br.google_place_id.trim().length > 0) {
      branchesWithPlaceId++;
      placeIds.push(br.google_place_id);
    } else {
      missingRequiredFields.push({ brand: b.canonical_name, branch: br.branch_name, field: 'google_place_id' });
    }

    // Coords check
    if (typeof br.latitude === 'number' && typeof br.longitude === 'number' &&
        br.latitude >= 20.0 && br.latitude <= 23.0 &&
        br.longitude >= 38.5 && br.longitude <= 40.5) {
      branchesWithCoords++;
    } else {
      missingRequiredFields.push({ brand: b.canonical_name, branch: br.branch_name, field: 'coordinates' });
    }

    // Maps URL check
    if (br.google_maps_url && br.google_maps_url.startsWith('https://www.google.com/maps/')) {
      branchesWithMapsUrl++;
      mapsUrls.push(br.google_maps_url);
    } else {
      missingRequiredFields.push({ brand: b.canonical_name, branch: br.branch_name, field: 'google_maps_url' });
    }

    // Address check
    if (br.formatted_address && br.formatted_address.trim().length > 0) {
      branchesWithAddress++;
    } else {
      missingRequiredFields.push({ brand: b.canonical_name, branch: br.branch_name, field: 'formatted_address' });
    }

    // Operating status check
    if (br.operating_status !== 'open') {
      missingRequiredFields.push({ brand: b.canonical_name, branch: br.branch_name, field: 'operating_status_not_open' });
    }

    // District check
    if (br.canonical_district) {
      if (CANONICAL_30.has(br.canonical_district)) {
        branchesMappedToCanonical++;
      } else {
        missingRequiredFields.push({ brand: b.canonical_name, branch: br.branch_name, field: `invalid_canonical_district_${br.canonical_district}` });
      }
    } else {
      branchesOutsideCanonical++;
      nonCanonicalBranchDetails.push({
        brand: b.canonical_name,
        branch: br.branch_name,
        raw_district: br.raw_district,
        coordinates: `${br.latitude}, ${br.longitude}`,
        notes: br.geographic_notes
      });
    }

    // Rating & reviews check
    if (typeof br.google_rating !== 'number' || typeof br.google_review_count !== 'number') {
      missingRequiredFields.push({ brand: b.canonical_name, branch: br.branch_name, field: 'rating_or_review_count' });
    }

    // Hours & phone check
    if (!br.hours) {
      missingRequiredFields.push({ brand: b.canonical_name, branch: br.branch_name, field: 'hours' });
    }
  }

  // Excluded branches
  if (Array.isArray(b.excluded_branches)) {
    totalExcludedBranches += b.excluded_branches.length;
  }

  // Manual review branches
  if (Array.isArray(b.manual_review_branches)) {
    totalManualReviewBranches += b.manual_review_branches.length;
  }
}

// Global manual review count
if (Array.isArray(data.manual_review)) {
  totalManualReviewBranches += data.manual_review.length;
}

// Duplicate detection
const duplicatePlaceIds = placeIds.filter((item, index) => placeIds.indexOf(item) !== index);
const duplicateMapsUrls = mapsUrls.filter((item, index) => mapsUrls.indexOf(item) !== index);

console.log('\n--- BRAND METRICS ---');
console.log('Total Brands:', totalBrands);
console.log('Production-Ready Brands:', prodReadyBrands);
console.log('Caution Brands:', cautionBrands);
console.log('Manual-Review / Research-Only Brands:', manualReviewBrands);

console.log('\n--- BRANCH METRICS ---');
console.log('Total Verified Production Branches:', totalProdBranches);
console.log('Manual-Review Branches (Brand-level + Notes):', totalManualReviewBranches);
console.log('Excluded Branches:', totalExcludedBranches);

console.log('\n--- FIELD COMPLETENESS (out of ' + totalProdBranches + ') ---');
console.log('Production Branches with Place IDs:', branchesWithPlaceId, `(${((branchesWithPlaceId / totalProdBranches) * 100).toFixed(1)}%)`);
console.log('Production Branches with Coordinates:', branchesWithCoords, `(${((branchesWithCoords / totalProdBranches) * 100).toFixed(1)}%)`);
console.log('Production Branches with Maps URLs:', branchesWithMapsUrl, `(${((branchesWithMapsUrl / totalProdBranches) * 100).toFixed(1)}%)`);
console.log('Production Branches with Addresses:', branchesWithAddress, `(${((branchesWithAddress / totalProdBranches) * 100).toFixed(1)}%)`);
console.log('Production Branches Mapped to Canonical Districts:', branchesMappedToCanonical, `(${((branchesMappedToCanonical / totalProdBranches) * 100).toFixed(1)}%)`);
console.log('Production Branches Outside Canonical Geography (canonical_district = null):', branchesOutsideCanonical, `(${((branchesOutsideCanonical / totalProdBranches) * 100).toFixed(1)}%)`);

console.log('\n--- UNIQUENESS & INTEGRITY ---');
console.log('Duplicate Place IDs:', duplicatePlaceIds.length, duplicatePlaceIds);
console.log('Duplicate Maps URLs:', duplicateMapsUrls.length, duplicateMapsUrls);
console.log('Missing Required Fields / Exceptions:', missingRequiredFields.length);
if (missingRequiredFields.length > 0) {
  console.log(JSON.stringify(missingRequiredFields, null, 2));
}

console.log('\n--- NON-CANONICAL BRANCHES DETAIL (' + nonCanonicalBranchDetails.length + ') ---');
console.log(JSON.stringify(nonCanonicalBranchDetails, null, 2));

if (duplicatePlaceIds.length === 0 && duplicateMapsUrls.length === 0 && missingRequiredFields.length === 0 && prodReadyBrands === 16) {
  console.log('\n>>> VALIDATION PASSED: DATASET IS FULLY CERTIFIED FOR IMPORT PREP <<<');
} else {
  console.log('\n>>> VALIDATION FAILED: ATTENTION REQUIRED <<<');
}
