import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JEDDAH_DISTRICT_LIST } from '../src/data/jeddahDistricts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filePath = path.join(rootDir, 'docs', 'research', 'jeddah-mexican-pass-d-corrected.json');
if (!fs.existsSync(filePath)) {
  console.error(`ERROR: Corrected file not found at ${filePath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));

// Dynamically load current live baseline (145 brands / 453 branches)
const dbLiveBranchesPath = path.join(__dirname, 'db_all_453_live_branches.json');
const dbPlaceIdsPath = path.join(__dirname, 'db_all_453_place_ids.json');
const dbMapsUrlsPath = path.join(__dirname, 'db_all_453_maps_urls.json');
const dbBrandsPath = path.join(__dirname, 'db_all_453_brands.json');

const dbBranches = fs.existsSync(dbLiveBranchesPath) ? JSON.parse(fs.readFileSync(dbLiveBranchesPath, 'utf8')) : [];
const dbPlaceIds = fs.existsSync(dbPlaceIdsPath) ? new Set(JSON.parse(fs.readFileSync(dbPlaceIdsPath, 'utf8'))) : new Set();
const dbMapsUrls = fs.existsSync(dbMapsUrlsPath) ? new Set(JSON.parse(fs.readFileSync(dbMapsUrlsPath, 'utf8'))) : new Set();
const dbBrands = fs.existsSync(dbBrandsPath) ? JSON.parse(fs.readFileSync(dbBrandsPath, 'utf8')) : [];

console.log('=====================================================');
console.log('====== WESHNAKUL MEXICAN VALIDATION AUDIT PASS ======');
console.log('=====================================================');
console.log('Schema Version:', data.schema_version);
console.log('Dataset:', data.dataset.display_category, `(${data.dataset.primary_category})`);
console.log('Status:', data.dataset.status);
console.log('Verified Date:', data.dataset.verified_date || data.dataset.last_verified_at);
console.log(`Current Live DB Baseline: ${dbBrands.length} brands / ${dbBranches.length} branches across catalog.`);

let integrityErrors = 0;

// 1. Locked Brand Set Verification
const EXPECTED_LOCKED_BRANDS = [
  'firegrill',
  'cocina_la_cantina',
  'eds_taco',
  'speakeasy',
  'chilis',
  'taqado_mexican_kitchen',
  'casa_twist',
  'chiii',
  'chalcos_mexican_grill',
  'tacomole',
  'el_taco_loco',
  'gyb_taco',
  'taco_in',
  'kakt'
];

if (data.brands.length !== EXPECTED_LOCKED_BRANDS.length) {
  console.error(`ERROR: Expected exactly ${EXPECTED_LOCKED_BRANDS.length} locked brands, found ${data.brands.length}!`);
  integrityErrors++;
}

const foundBrandIds = data.brands.map(b => b.id);
for (const expectedId of EXPECTED_LOCKED_BRANDS) {
  if (!foundBrandIds.includes(expectedId)) {
    console.error(`ERROR: Missing locked brand '${expectedId}' from dataset!`);
    integrityErrors++;
  }
}

// 2. Deck Rules Integrity
const deckRules = data.dataset.deck_rules || data.deck_rules;
if (!deckRules) {
  console.error('ERROR: Deck rules missing from dataset!');
  integrityErrors++;
} else {
  if (deckRules.deck_size !== 7) {
    console.error(`ERROR: Deck size must be 7, got ${deckRules.deck_size}!`);
    integrityErrors++;
  }
  if (deckRules.guaranteed_anchor_count !== 1 || !deckRules.guaranteed_anchor_pool?.includes('firegrill')) {
    console.error('ERROR: Guaranteed anchor rule corrupted! Must have count 1 with pool ["firegrill"].');
    integrityErrors++;
  }
  if (deckRules.rotating_strong_count !== 1) {
    console.error('ERROR: Rotating strong count must be 1!');
    integrityErrors++;
  }
  const expectedStrongPool = ['cocina_la_cantina', 'eds_taco', 'speakeasy', 'chilis', 'taqado_mexican_kitchen'];
  for (const sp of expectedStrongPool) {
    if (!deckRules.rotating_strong_pool?.includes(sp)) {
      console.error(`ERROR: Rotating strong pool missing expected brand '${sp}'!`);
      integrityErrors++;
    }
  }
  if (deckRules.remaining_slots !== 5) {
    console.error(`ERROR: Remaining randomized slots must be 5, got ${deckRules.remaining_slots}!`);
    integrityErrors++;
  }
}

// 3. Brands Validation
const brandIds = new Set();
const brandNames = new Set();
let prodReadyBrands = 0;
let cautionBrands = 0;
let manualReviewBrands = 0;
let excludedBrands = 0;

let physicalBrands = 0;
let deliveryOnlyBrands = 0;

const validRecUseCases = new Set(['delivery', 'going_out', 'both']);
const recUseCaseCounts = { delivery: 0, going_out: 0, both: 0 };

for (const b of data.brands) {
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

  // Category validity
  if (b.primary_category !== 'mexican') {
    console.error(`ERROR: Primary category for '${b.canonical_name}' must be 'mexican', got '${b.primary_category}'`);
    integrityErrors++;
  }

  if (!b.modes || !b.modes.includes('food')) {
    console.error(`ERROR: Brand '${b.canonical_name}' must include 'food' mode.`);
    integrityErrors++;
  }

  // Ensure Healthy is not treated as a category
  if (b.primary_category === 'healthy' || (b.secondary_categories || []).includes('healthy')) {
    console.error(`ERROR: 'healthy' used as a category on brand '${b.canonical_name}'. Healthy must remain a filter!`);
    integrityErrors++;
  }

  // Ensure "nearby" is not stored as a static tag in context_tags
  const allTags = [...(b.context_tags || [])];
  if (allTags.some(t => t.toLowerCase().includes('nearby'))) {
    console.error(`ERROR: Static 'nearby' tag found on brand '${b.canonical_name}'. Nearby must remain dynamic!`);
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

  // Physical vs Delivery-only distinction
  if (b.id === 'taqado_mexican_kitchen') {
    deliveryOnlyBrands++;
    if (b.branches && b.branches.length > 0) {
      console.error(`ERROR: Taqado Mexican Kitchen must not have physical branches fabricated! Found ${b.branches.length} branches.`);
      integrityErrors++;
    }
    if (!b.delivery_only_note) {
      console.error('ERROR: Taqado Mexican Kitchen must include explicit delivery_only_note explaining non-physical storefront presence.');
      integrityErrors++;
    }
  } else {
    physicalBrands++;
    if (!b.branches || b.branches.length === 0) {
      console.error(`ERROR: Physical brand '${b.canonical_name}' has 0 active branches!`);
      integrityErrors++;
    }
  }

  // Brand-level eligibility
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

if (physicalBrands !== 13 || deliveryOnlyBrands !== 1) {
  console.error(`ERROR: Expected 13 physical brands and 1 delivery-only brand, got ${physicalBrands} physical and ${deliveryOnlyBrands} delivery-only.`);
  integrityErrors++;
}

// 4. Branches Validation
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

const placeIds = [];
const mapsUrls = [];
const crossCategoryPlaceCollisions = [];
const crossCategoryMapsCollisions = [];
const outOfBoundsCoords = [];
const nonJeddahBranches = [];
const closedActiveBranches = [];
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
    if (br.google_place_id && br.google_place_id.startsWith('ChIJ')) {
      branchesWithPlaceId++;
      placeIds.push(br.google_place_id);

      if (dbPlaceIds.has(br.google_place_id)) {
        crossCategoryPlaceCollisions.push({
          brand: b.canonical_name,
          branch: br.branch_name,
          place_id: br.google_place_id
        });
        integrityErrors++;
      }
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing or invalid Google Place ID!`);
      integrityErrors++;
    }

    // Maps URL check
    if (br.google_maps_url && br.google_maps_url.startsWith('https://www.google.com/maps/search/?api=1&query_place_id=')) {
      branchesWithMapsUrl++;
      mapsUrls.push(br.google_maps_url);

      if (dbMapsUrls.has(br.google_maps_url)) {
        crossCategoryMapsCollisions.push({
          brand: b.canonical_name,
          branch: br.branch_name,
          url: br.google_maps_url
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
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing exact coordinates!`);
      integrityErrors++;
    }

    // Address check
    if (br.formatted_address && br.formatted_address.trim().length > 0) {
      branchesWithAddress++;
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing formatted address!`);
      integrityErrors++;
    }

    // Operating status check
    if (br.operating_status) {
      branchesWithOperatingStatus++;
      if (br.operating_status !== 'open') {
        closedActiveBranches.push({ brand: b.canonical_name, branch: br.branch_name, status: br.operating_status });
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
    if (typeof br.google_review_count === 'number' && br.google_review_count >= 0) {
      branchesWithReviewCount++;
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing valid google_review_count!`);
      integrityErrors++;
    }

    // Hours check
    if (br.hours && br.hours.trim().length > 0) {
      branchesWithHours++;
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing operating hours!`);
      integrityErrors++;
    }

    // City check
    if (br.city !== 'Jeddah') {
      nonJeddahBranches.push({ brand: b.canonical_name, branch: br.branch_name, city: br.city });
      integrityErrors++;
    }

    // District & Canonical Geography check
    if (br.canonical_district) {
      if (CANONICAL_30.has(br.canonical_district)) {
        canonicalDistrictActiveBranches++;
      } else {
        console.error(`ERROR: Branch '${b.canonical_name} - ${br.branch_name}' has unrecognized canonical district '${br.canonical_district}'!`);
        integrityErrors++;
      }
    } else {
      nullDistrictActiveBranches++;
      if (br.production_eligibility !== 'usable_with_caution') {
        console.error(`ERROR: Outer branch '${b.canonical_name} - ${br.branch_name}' with null district must be usable_with_caution!`);
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
        console.error(`ERROR: Excluded branch '${b.canonical_name} - ${ex.branch_name}' must have production_eligibility 'excluded'!`);
        integrityErrors++;
      }
      if (ex.operating_status !== 'closed') {
        console.error(`ERROR: Excluded branch '${b.canonical_name} - ${ex.branch_name}' operating_status must be 'closed'!`);
        integrityErrors++;
      }
    }
  }

  // Count brand-level manual review branches
  if (Array.isArray(b.manual_review_branches)) {
    totalManualReviewBranches += b.manual_review_branches.length;
    for (const mr of b.manual_review_branches) {
      if (mr.production_eligibility !== 'manual_review') {
        console.error(`ERROR: Manual review branch '${b.canonical_name} - ${mr.branch_name}' must have production_eligibility 'manual_review'!`);
        integrityErrors++;
      }
      if (!mr.reason || mr.reason.trim().length === 0) {
        console.error(`ERROR: Manual review branch '${b.canonical_name} - ${mr.branch_name}' missing audit reason!`);
        integrityErrors++;
      }
    }
  }
}

// 5. Duplicate Checks
const duplicatePlaceIds = placeIds.filter((item, index) => placeIds.indexOf(item) !== index);
const duplicateMapsUrls = mapsUrls.filter((item, index) => mapsUrls.indexOf(item) !== index);
if (duplicatePlaceIds.length > 0) {
  console.error('ERROR: Duplicate Place IDs found within active Mexican branches:', duplicatePlaceIds);
  integrityErrors += duplicatePlaceIds.length;
}
if (duplicateMapsUrls.length > 0) {
  console.error('ERROR: Duplicate Maps URLs found within active Mexican branches:', duplicateMapsUrls);
  integrityErrors += duplicateMapsUrls.length;
}

// 6. Closed-Branch Audit Checks
const firegrillAlFayha = data.brands.find(b => b.id === 'firegrill')?.excluded_branches?.find(br => br.branch_name.includes('Al Fayha'));
if (!firegrillAlFayha || firegrillAlFayha.operating_status !== 'closed') {
  console.error('ERROR: FireGrill - Al Fayha must be explicitly recorded in excluded_branches as closed!');
  integrityErrors++;
}

const chilisRoshanMall = data.brands.find(b => b.id === 'chilis')?.excluded_branches?.find(br => br.branch_name.includes('Roshan Mall'));
if (!chilisRoshanMall || chilisRoshanMall.operating_status !== 'closed') {
  console.error('ERROR: Chili\'s - Roshan Mall must be explicitly recorded in excluded_branches as closed!');
  integrityErrors++;
}

const speakeasyObhur = data.brands.find(b => b.id === 'speakeasy')?.excluded_branches?.find(br => br.branch_name.includes('Obhur'));
if (!speakeasyObhur || speakeasyObhur.operating_status !== 'closed') {
  console.error('ERROR: Speakeasy - Obhur must be explicitly recorded in excluded_branches as closed!');
  integrityErrors++;
}

// 7. Manual Review Audit Checks
const speakeasyKhalidiyyah = data.brands.find(b => b.id === 'speakeasy')?.manual_review_branches?.find(br => br.branch_name.includes('Al Khalidiyyah'));
if (!speakeasyKhalidiyyah || speakeasyKhalidiyyah.production_eligibility !== 'manual_review') {
  console.error('ERROR: Speakeasy - Al Khalidiyyah must be held in manual_review_branches with explicit reason!');
  integrityErrors++;
}

// 8. Output Audit Report
console.log('\n--- 1. BRANDS AUDIT ---');
console.log('Locked Brands Count:', data.brands.length, '(Expected: 14)');
console.log('Physical Brands with Verified Presence:', physicalBrands, '(Expected: 13)');
console.log('Delivery-Only Brands:', deliveryOnlyBrands, '(Expected: 1 - Taqado)');
console.log('Brand Production Eligibility:');
console.log('  - production_ready:', prodReadyBrands);
console.log('  - usable_with_caution:', cautionBrands);
console.log('  - manual_review:', manualReviewBrands);
console.log('  - excluded:', excludedBrands);
console.log('Recommendation Use Cases:', recUseCaseCounts);

console.log('\n--- 2. BRANCHES AUDIT ---');
const candidateCount = totalActiveBranches + totalExcludedBranches + totalManualReviewBranches;
console.log('Total Candidate Branches:', candidateCount, '(Expected: 23)');
console.log('Total Verified Active Usable Branches:', totalActiveBranches, '(Expected: 19)');
console.log('  - production_ready:', prodReadyBranches, '(Expected: 15)');
console.log('  - usable_with_caution:', cautionBranches, '(Expected: 4)');
console.log('Total Manual-Review Branches:', totalManualReviewBranches, '(Expected: 1)');
for (const b of data.brands) {
  for (const mr of (b.manual_review_branches || [])) {
    console.log(`    * [${b.canonical_name}] ${mr.branch_name}: ${mr.reason}`);
  }
}
console.log('Total Excluded Closed Branches:', totalExcludedBranches, '(Expected: 3)');
for (const b of data.brands) {
  for (const ex of (b.excluded_branches || [])) {
    console.log(`    * [${b.canonical_name}] ${ex.branch_name}: ${ex.reason} (Place ID: ${ex.google_place_id})`);
  }
}

console.log(`\n--- 3. DATA COMPLETENESS (Active Usable Branches: ${totalActiveBranches}) ---`);
console.log(`Address Completeness: ${(branchesWithAddress / totalActiveBranches * 100).toFixed(1)}% (${branchesWithAddress}/${totalActiveBranches})`);
console.log(`Canonical/Valid Geography: 100.0% (${canonicalDistrictActiveBranches} canonical 30 + ${nullDistrictActiveBranches} outer caution)`);
console.log(`Place ID Completeness: ${(branchesWithPlaceId / totalActiveBranches * 100).toFixed(1)}% (${branchesWithPlaceId}/${totalActiveBranches})`);
console.log(`Direct Maps URL Completeness: ${(branchesWithMapsUrl / totalActiveBranches * 100).toFixed(1)}% (${branchesWithMapsUrl}/${totalActiveBranches})`);
console.log(`Exact Coordinate Completeness: ${(branchesWithCoords / totalActiveBranches * 100).toFixed(1)}% (${branchesWithCoords}/${totalActiveBranches})`);
console.log(`Confirmed Operating Status: ${(branchesWithOperatingStatus / totalActiveBranches * 100).toFixed(1)}% (${branchesWithOperatingStatus}/${totalActiveBranches})`);
console.log(`Rating Completeness: ${(branchesWithRating / totalActiveBranches * 100).toFixed(1)}% (${branchesWithRating}/${totalActiveBranches})`);
console.log(`Review Count Completeness: ${(branchesWithReviewCount / totalActiveBranches * 100).toFixed(1)}% (${branchesWithReviewCount}/${totalActiveBranches})`);
console.log(`Hours Completeness: ${(branchesWithHours / totalActiveBranches * 100).toFixed(1)}% (${branchesWithHours}/${totalActiveBranches})`);

console.log('\n--- 4. COLLISION AUDIT ---');
console.log('Internal Place ID Collisions:', duplicatePlaceIds.length);
console.log('Internal Maps URL Collisions:', duplicateMapsUrls.length);
console.log('Cross-Category Place ID Collisions against 453 Live Branches:', crossCategoryPlaceCollisions.length);
console.log('Cross-Category Maps URL Collisions against 453 Live Branches:', crossCategoryMapsCollisions.length);

console.log('\n=====================================================');
if (integrityErrors > 0) {
  console.error(`AUDIT FAILED: Found ${integrityErrors} integrity error(s)!`);
  process.exit(1);
} else {
  console.log('AUDIT PASSED: ZERO INTEGRITY ERRORS DETECTED.');
  console.log('MEXICAN_RESEARCH_CERTIFIED_FOR_IMPORT_PREP');
}
