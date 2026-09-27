import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JEDDAH_DISTRICT_LIST } from '../src/data/jeddahDistricts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filePath = path.join(rootDir, 'docs', 'research', 'jeddah-sushi-pass-d-corrected.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));

// Load live catalog baseline dynamically
let liveBranches = [];
const liveBranchesFile = path.join(__dirname, 'db_all_live_branches_current.json');
if (fs.existsSync(liveBranchesFile)) {
  liveBranches = JSON.parse(fs.readFileSync(liveBranchesFile, 'utf8'));
} else {
  const legacyFile = path.join(__dirname, 'db_all_453_live_branches.json');
  if (fs.existsSync(legacyFile)) {
    liveBranches = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));
  }
}

const livePlaceIds = new Map();
const liveMapsUrls = new Map();
for (const lb of liveBranches) {
  if (lb.google_place_id) livePlaceIds.set(lb.google_place_id, lb);
  if (lb.google_maps_url) liveMapsUrls.set(lb.google_maps_url, lb);
}

const EXPECTED_CURATED_BRANDS = new Set([
  'Maki House',
  'Wakame',
  'Gold Sushi Club',
  'Sushiah',
  'SHiRO',
  'MYAZU',
  'Sakura Japanese Restaurant',
  'SushiArt',
  'Sushi Yoshi',
  'Kuuru',
  'Tanuki Sushi',
  'KIMONO',
  'Ikigai Sushi Restaurant',
  'Ashi Sushi',
  'Fuji Japanese Restaurant',
  'Ricci San'
]);

console.log('=====================================================');
console.log('======= WESHNAKUL SUSHI VALIDATION AUDIT PASS =======');
console.log('=====================================================');
console.log('Schema Version:', data.schema_version);
console.log('Dataset:', data.dataset?.display_category, `(${data.dataset?.primary_category})`);
console.log('Status:', data.dataset?.status);
console.log('Verified Date:', data.dataset?.verified_date);
console.log('Live DB Catalog Size Checked Against:', liveBranches.length, 'branches');

let integrityErrors = 0;

// 1. Brands Validation
const totalBrands = data.brands.length;
let prodReadyBrands = 0;
let cautionBrands = 0;
let manualReviewBrands = 0;
let excludedBrands = 0;

const brandIds = new Set();
const brandNames = new Set();

const validRecUseCases = new Set(['delivery', 'going_out', 'both']);
const recUseCaseCounts = { delivery: 0, going_out: 0, both: 0 };
let foodOnlyBrands = 0;
let asianOverlapBrands = 0;
let seafoodOverlapBrands = 0;
let healthyFilterBrands = 0;

if (totalBrands !== EXPECTED_CURATED_BRANDS.size) {
  console.error(`ERROR: Expected exactly ${EXPECTED_CURATED_BRANDS.size} curated brands, found ${totalBrands}!`);
  integrityErrors++;
}

for (const b of data.brands) {
  // Brand curated check
  if (!EXPECTED_CURATED_BRANDS.has(b.canonical_name)) {
    console.error(`ERROR: Unexpected brand '${b.canonical_name}' in Sushi dataset!`);
    integrityErrors++;
  }

  // Unique brand identities
  if (brandIds.has(b.id)) {
    console.error(`ERROR: Duplicate brand id '${b.id}'`);
    integrityErrors++;
  }
  brandIds.add(b.id);

  if (brandNames.has(b.canonical_name)) {
    console.error(`ERROR: Duplicate brand name '${b.canonical_name}'`);
    integrityErrors++;
  }
  brandNames.add(b.canonical_name);

  // Production eligibility
  if (b.production_eligibility === 'production_ready') {
    prodReadyBrands++;
  } else if (b.production_eligibility === 'usable_with_caution') {
    cautionBrands++;
  } else if (b.production_eligibility === 'manual_review') {
    manualReviewBrands++;
  } else if (b.production_eligibility === 'excluded') {
    excludedBrands++;
  }

  // Modes & Taxonomy
  if (!b.modes || !b.modes.includes('food')) {
    console.error(`ERROR: Brand '${b.canonical_name}' must include 'food' mode.`);
    integrityErrors++;
  } else {
    foodOnlyBrands++;
  }

  if (b.primary_category !== 'sushi') {
    console.error(`ERROR: Primary category for '${b.canonical_name}' must be 'sushi', got '${b.primary_category}'`);
    integrityErrors++;
  }

  // Secondary categories
  if ((b.secondary_categories || []).includes('asian')) {
    asianOverlapBrands++;
  }
  if ((b.secondary_categories || []).includes('seafood')) {
    seafoodOverlapBrands++;
  }

  // Healthy filter audit
  if (b.healthy === true) {
    healthyFilterBrands++;
    if (!b.healthy_evidence) {
      console.error(`ERROR: Brand '${b.canonical_name}' marked healthy without healthy_evidence!`);
      integrityErrors++;
    }
  }

  // Ensure Healthy is not treated as a category
  if (b.primary_category === 'healthy' || (b.secondary_categories || []).includes('healthy')) {
    console.error(`ERROR: 'healthy' used as a category on brand '${b.canonical_name}'. Healthy must remain a filter!`);
    integrityErrors++;
  }

  // Recommendation Use Case
  if (!validRecUseCases.has(b.recommendation_use_case)) {
    console.error(`ERROR: Invalid recommendation_use_case '${b.recommendation_use_case}' on brand '${b.canonical_name}'`);
    integrityErrors++;
  } else {
    recUseCaseCounts[b.recommendation_use_case]++;
  }

  // Distance behavior audit
  if (b.recommendation_use_case === 'delivery' || b.recommendation_use_case === 'both') {
    if (!b.distance_behavior?.delivery?.includes('nearby')) {
      console.error(`ERROR: Delivery brand '${b.canonical_name}' lacks strict nearby delivery distance behavior.`);
      integrityErrors++;
    }
  }
  if (b.recommendation_use_case === 'going_out' || b.recommendation_use_case === 'both') {
    if (!b.distance_behavior?.going_out?.includes('destination')) {
      console.error(`ERROR: Going-out brand '${b.canonical_name}' lacks destination going-out distance behavior.`);
      integrityErrors++;
    }
  }

  // Ensure "nearby" is not stored as a static tag in context_tags
  const allTags = b.context_tags || [];
  if (allTags.some(t => t.toLowerCase().includes('nearby'))) {
    console.error(`ERROR: Static 'nearby' tag found on brand '${b.canonical_name}'. Nearby must remain dynamic!`);
    integrityErrors++;
  }

  // Specific brand reconciliation checks
  if (b.id === 'wakame') {
    if (b.cross_category_reconciliation?.status !== 'intentional_existing_identity_reused') {
      console.error(`ERROR: Wakame must have status 'intentional_existing_identity_reused'!`);
      integrityErrors++;
    }
    if (b.cross_category_reconciliation?.reused_restaurant_id !== 'wakame') {
      console.error(`ERROR: Wakame must reuse restaurant_id 'wakame'!`);
      integrityErrors++;
    }
  }

  if (b.id === 'sushiah') {
    if (b.delivery_platforms?.hungerstation?.presence !== 'yes' ||
        b.delivery_platforms?.jahez?.presence !== 'yes' ||
        b.delivery_platforms?.keeta?.presence !== 'yes') {
      console.error(`ERROR: Sushiah must have all 3 delivery platforms confirmed!`);
      integrityErrors++;
    }
  }
}

// 2. Branches Validation
let totalActiveBranches = 0;
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
let branchesWithHours = 0;

let canonicalDistrictActiveBranches = 0;
let nullDistrictActiveBranches = 0;
let invalidDistrictCount = 0;

const placeIds = [];
const mapsUrls = [];
const branchCoordKeys = [];
const accidentalPlaceCollisions = [];
const accidentalMapsCollisions = [];
const outOfBoundsCoords = [];
const nonJeddahBranches = [];
const nonOpenActiveBranches = [];
const outerBranchesMissingNotes = [];

for (const b of data.brands) {
  for (const br of (b.branches || [])) {
    totalActiveBranches++;

    if (br.production_eligibility === 'production_ready') {
      prodReadyBranches++;
    } else if (br.production_eligibility === 'usable_with_caution') {
      cautionBranches++;
    } else {
      console.error(`ERROR: Branch '${br.branch_name}' under active catalog has non-active eligibility '${br.production_eligibility}'!`);
      integrityErrors++;
    }

    // Place ID check
    if (br.google_place_id && br.google_place_id.trim().length > 0) {
      branchesWithPlaceId++;
      placeIds.push(br.google_place_id);

      // Check collision with live catalog
      if (livePlaceIds.has(br.google_place_id)) {
        const liveMatch = livePlaceIds.get(br.google_place_id);
        accidentalPlaceCollisions.push({
          brand: b.canonical_name,
          branch: br.branch_name,
          place_id: br.google_place_id,
          collides_with: `${liveMatch.brand_name_en} - ${liveMatch.branch_name_en} (${liveMatch.primary_category})`
        });
        integrityErrors++;
      }
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing Google Place ID!`);
      integrityErrors++;
    }

    // Maps URL check
    if (br.google_maps_url && br.google_maps_url.includes('query_place_id=')) {
      branchesWithMapsUrl++;
      mapsUrls.push(br.google_maps_url);

      if (liveMapsUrls.has(br.google_maps_url)) {
        const liveMatch = liveMapsUrls.get(br.google_maps_url);
        accidentalMapsCollisions.push({
          brand: b.canonical_name,
          branch: br.branch_name,
          url: br.google_maps_url,
          collides_with: `${liveMatch.brand_name_en} - ${liveMatch.branch_name_en} (${liveMatch.primary_category})`
        });
        integrityErrors++;
      }
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing standardized Google Maps URL!`);
      integrityErrors++;
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

      // Check for exact coordinate duplicates between different branches
      const coordKey = `${br.latitude.toFixed(6)},${br.longitude.toFixed(6)}`;
      branchCoordKeys.push({ brand: b.canonical_name, branch: br.branch_name, key: coordKey });
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing exact coordinates!`);
      integrityErrors++;
    }

    // Address check
    if (br.formatted_address && br.formatted_address.trim().length > 0) {
      branchesWithAddress++;
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing address!`);
      integrityErrors++;
    }

    // Operating status check
    if (br.operating_status) {
      branchesWithOperatingStatus++;
      if (br.operating_status !== 'open') {
        nonOpenActiveBranches.push({ brand: b.canonical_name, branch: br.branch_name, status: br.operating_status });
        integrityErrors++;
      }
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing operating status!`);
      integrityErrors++;
    }

    // Rating & reviews check
    if (typeof br.google_rating === 'number' && br.google_rating >= 1.0 && br.google_rating <= 5.0) {
      branchesWithRating++;
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing valid google_rating!`);
      integrityErrors++;
    }
    if (typeof br.google_review_count === 'number' && br.google_review_count > 0) {
      branchesWithReviewCount++;
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing valid google_review_count!`);
      integrityErrors++;
    }

    // Hours check
    if (br.hours && br.hours.trim().length > 0) {
      branchesWithHours++;
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing hours!`);
      integrityErrors++;
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
        if (br.production_eligibility !== 'production_ready') {
          console.error(`ERROR: Canonical branch '${b.canonical_name} - ${br.branch_name}' must be production_ready!`);
          integrityErrors++;
        }
      } else {
        invalidDistrictCount++;
        console.error(`ERROR: Branch '${b.canonical_name} - ${br.branch_name}' has invalid canonical district '${br.canonical_district}'!`);
        integrityErrors++;
      }
    } else {
      nullDistrictActiveBranches++;
      if (br.production_eligibility !== 'usable_with_caution') {
        console.error(`ERROR: Outer branch '${b.canonical_name} - ${br.branch_name}' must be usable_with_caution!`);
        integrityErrors++;
      }
      if (!br.geographic_notes || br.geographic_notes.trim().length === 0) {
        outerBranchesMissingNotes.push({ brand: b.canonical_name, branch: br.branch_name });
        integrityErrors++;
      }
    }
  }

  // Count brand-level excluded branches
  if (Array.isArray(b.excluded_branches)) {
    totalExcludedBranches += b.excluded_branches.length;
    for (const ex of b.excluded_branches) {
      if (ex.production_eligibility !== 'excluded') {
        console.error(`ERROR: Excluded branch '${ex.branch_name}' in '${b.canonical_name}' has wrong eligibility '${ex.production_eligibility}'!`);
        integrityErrors++;
      }
    }
  }

  // Count brand-level manual review branches
  if (Array.isArray(b.manual_review_branches)) {
    totalManualReviewBranches += b.manual_review_branches.length;
    for (const mr of b.manual_review_branches) {
      if (mr.production_eligibility !== 'manual_review') {
        console.error(`ERROR: Manual review branch '${mr.branch_name}' in '${b.canonical_name}' has wrong eligibility '${mr.production_eligibility}'!`);
        integrityErrors++;
      }
    }
  }
}

// Duplicate checks within Sushi
const duplicatePlaceIds = placeIds.filter((item, index) => placeIds.indexOf(item) !== index);
const duplicateMapsUrls = mapsUrls.filter((item, index) => mapsUrls.indexOf(item) !== index);
if (duplicatePlaceIds.length > 0) {
  console.error('ERROR: Duplicate Place IDs found within Sushi:', duplicatePlaceIds);
  integrityErrors += duplicatePlaceIds.length;
}
if (duplicateMapsUrls.length > 0) {
  console.error('ERROR: Duplicate Maps URLs found within Sushi:', duplicateMapsUrls);
  integrityErrors += duplicateMapsUrls.length;
}

// Duplicate coordinates check
const seenCoords = new Set();
const duplicateCoords = [];
for (const c of branchCoordKeys) {
  if (seenCoords.has(c.key)) {
    duplicateCoords.push(c);
  }
  seenCoords.add(c.key);
}
if (duplicateCoords.length > 0) {
  console.error('ERROR: Duplicate branch coordinates detected:', duplicateCoords);
  integrityErrors += duplicateCoords.length;
}

console.log('\n--- 1. BRANDS AUDIT ---');
console.log('Total Retained Brands:', totalBrands);
console.log('Certified Production-Ready Brands:', prodReadyBrands);
console.log('Certified Usable-With-Caution Brands:', cautionBrands);
console.log('Manual-Review Brands:', manualReviewBrands);
console.log('Excluded Brands:', excludedBrands);
console.log('Food-Only Brands:', foodOnlyBrands);
console.log('Sushi + Asian Overlap Brands:', asianOverlapBrands);
console.log('Sushi + Seafood Overlap Brands:', seafoodOverlapBrands);
console.log('Healthy Filter Brands:', healthyFilterBrands);
console.log('Recommendation Use Cases:', recUseCaseCounts);

console.log('\n--- 2. BRANCHES AUDIT ---');
const candidateCount = totalActiveBranches + totalExcludedBranches + totalManualReviewBranches;
console.log('Total Candidate Branches:', candidateCount);
console.log('Total Verified Active Branches (Production Catalog):', totalActiveBranches);
console.log('  - Production-Ready Branches (Canonical 30):', prodReadyBranches);
console.log('  - Usable-With-Caution Branches (Outer Jeddah):', cautionBrands);
console.log('Total Manual-Review Branches:', totalManualReviewBranches);
console.log('Total Excluded Branches:', totalExcludedBranches);

console.log(`\n--- 3. PRODUCTION-DATA COMPLETENESS (Active Branches: ${totalActiveBranches}) ---`);
console.log(`Place ID Completeness: ${(branchesWithPlaceId / totalActiveBranches * 100).toFixed(1)}% (${branchesWithPlaceId}/${totalActiveBranches})`);
console.log(`Maps URL Completeness: ${(branchesWithMapsUrl / totalActiveBranches * 100).toFixed(1)}% (${branchesWithMapsUrl}/${totalActiveBranches})`);
console.log(`Coordinates Completeness: ${(branchesWithCoords / totalActiveBranches * 100).toFixed(1)}% (${branchesWithCoords}/${totalActiveBranches})`);
console.log(`Address Completeness: ${(branchesWithAddress / totalActiveBranches * 100).toFixed(1)}% (${branchesWithAddress}/${totalActiveBranches})`);
console.log(`Operating Status Completeness: ${(branchesWithOperatingStatus / totalActiveBranches * 100).toFixed(1)}% (${branchesWithOperatingStatus}/${totalActiveBranches})`);
console.log(`Rating Completeness: ${(branchesWithRating / totalActiveBranches * 100).toFixed(1)}% (${branchesWithRating}/${totalActiveBranches})`);
console.log(`Review Count Completeness: ${(branchesWithReviewCount / totalActiveBranches * 100).toFixed(1)}% (${branchesWithReviewCount}/${totalActiveBranches})`);
console.log(`Hours Completeness: ${(branchesWithHours / totalActiveBranches * 100).toFixed(1)}% (${branchesWithHours}/${totalActiveBranches})`);

console.log('\n--- 4. GEOGRAPHY AUDIT ---');
console.log('Canonical 30-District Active Branches:', canonicalDistrictActiveBranches);
console.log('Null-District Outer Active Branches:', nullDistrictActiveBranches);
console.log('Invalid District Count:', invalidDistrictCount);

console.log('\n--- 5. INTEGRITY & COLLISION AUDIT ---');
console.log('Duplicate Place IDs within Sushi:', duplicatePlaceIds.length);
console.log('Duplicate Maps URLs within Sushi:', duplicateMapsUrls.length);
console.log('Duplicate Coordinates within Sushi:', duplicateCoords.length);
console.log('Accidental Cross-Category Place ID Collisions:', accidentalPlaceCollisions.length);
console.log('Accidental Cross-Category Maps URL Collisions:', accidentalMapsCollisions.length);
console.log('Coordinates Out of Bounds:', outOfBoundsCoords.length);
console.log('Wrong-City Branches:', nonJeddahBranches.length);
console.log('Non-Open Branches in Active Pool:', nonOpenActiveBranches.length);
console.log('Outer Branches Missing Geographic Notes:', outerBranchesMissingNotes.length);

console.log('\n=====================================================');
console.log(`TOTAL INTEGRITY ERRORS: ${integrityErrors}`);
if (integrityErrors === 0) {
  console.log('VERIFICATION VERDICT: PASSED (Zero integrity violations)');
} else {
  console.error('VERIFICATION VERDICT: FAILED (Integrity violations detected)');
  process.exit(1);
}
console.log('=====================================================');
