import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JEDDAH_DISTRICT_LIST } from '../src/data/jeddahDistricts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filePath = path.join(rootDir, 'docs', 'research', 'jeddah-asian-pass-d-corrected.json');
if (!fs.existsSync(filePath)) {
  console.error(`ERROR: Corrected file not found at ${filePath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));

// Dynamically load current live baseline
let liveBranches = [];
const liveBranchesFile = path.join(__dirname, 'db_all_live_branches_current.json');
if (fs.existsSync(liveBranchesFile)) {
  liveBranches = JSON.parse(fs.readFileSync(liveBranchesFile, 'utf8'));
} else {
  const legacyFile = path.join(__dirname, 'db_all_481_live_branches.json');
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

const EXPECTED_LOCKED_BRANDS = [
  'da_bao',
  'chan',
  'togarashi',
  'wakame',
  'shiro',
  'myazu',
  'kuuru',
  'toki',
  'sura',
  'hwaro',
  'koreana',
  'thai_fortune',
  'thai_lee',
  'sakura_japanese_restaurant',
  'sushiah',
  'shang_palace',
  'canton',
  'baytoti',
  'denden'
];

console.log('=====================================================');
console.log('======= WESHNAKUL ASIAN VALIDATION AUDIT PASS =======');
console.log('=====================================================');
console.log('Schema Version:', data.schema_version);
console.log('Dataset:', data.dataset?.display_category, `(${data.dataset?.primary_category})`);
console.log('Status:', data.dataset?.status);
console.log('Verified Date:', data.dataset?.verified_date || data.dataset?.last_verified_at);
console.log(`Live DB Catalog Size Checked Against: ${liveBranches.length} branches.`);

let integrityErrors = 0;

// 1. Locked Brands Verification
const totalBrands = data.brands.length;
if (totalBrands !== EXPECTED_LOCKED_BRANDS.length) {
  console.error(`ERROR: Expected exactly ${EXPECTED_LOCKED_BRANDS.length} locked brands, found ${totalBrands}!`);
  integrityErrors++;
}

const foundBrandIds = data.brands.map(b => b.id);
for (const expectedId of EXPECTED_LOCKED_BRANDS) {
  if (!foundBrandIds.includes(expectedId)) {
    console.error(`ERROR: Missing locked brand '${expectedId}' from dataset!`);
    integrityErrors++;
  }
}

// 2. Brand Level Audit
let prodReadyBrands = 0;
let cautionBrands = 0;
let manualReviewBrands = 0;
let excludedBrands = 0;

const brandIds = new Set();
const brandNames = new Set();
const validRecUseCases = new Set(['delivery', 'going_out', 'both']);
const recUseCaseCounts = { delivery: 0, going_out: 0, both: 0 };

const SUSHI_REUSED_BRANDS = new Set([
  'wakame',
  'shiro',
  'myazu',
  'kuuru',
  'sakura_japanese_restaurant',
  'sushiah'
]);

for (const b of data.brands) {
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
  }

  // Primary and secondary category check
  if (SUSHI_REUSED_BRANDS.has(b.id)) {
    if (b.primary_category !== 'sushi' && b.primary_category !== 'asian') {
      console.error(`ERROR: Reused brand '${b.canonical_name}' has invalid primary category '${b.primary_category}'`);
      integrityErrors++;
    }
    if (!(b.secondary_categories || []).includes('asian') && b.primary_category !== 'asian') {
      console.error(`ERROR: Reused sushi brand '${b.canonical_name}' must include 'asian' in secondary_categories.`);
      integrityErrors++;
    }
  } else {
    if (b.primary_category !== 'asian') {
      console.error(`ERROR: Primary category for '${b.canonical_name}' must be 'asian', got '${b.primary_category}'`);
      integrityErrors++;
    }
  }

  // Healthy filter audit
  if (b.healthy === true) {
    if (!b.healthy_evidence) {
      console.error(`ERROR: Brand '${b.canonical_name}' marked healthy without healthy_evidence!`);
      integrityErrors++;
    }
  }
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
  if (SUSHI_REUSED_BRANDS.has(b.id)) {
    if (b.cross_category_reconciliation?.status !== 'intentional_existing_identity_reused') {
      console.error(`ERROR: Overlapping sushi brand '${b.canonical_name}' must have status 'intentional_existing_identity_reused'!`);
      integrityErrors++;
    }
    if (b.cross_category_reconciliation?.reused_restaurant_id !== b.id) {
      console.error(`ERROR: Brand '${b.canonical_name}' must reuse its existing restaurant_id '${b.id}'!`);
      integrityErrors++;
    }
  }

  if (b.id === 'chan') {
    if (b.cross_category_reconciliation?.status !== 'intentional_existing_identity_reused') {
      console.error(`ERROR: CHAN must have status 'intentional_existing_identity_reused'!`);
      integrityErrors++;
    }
    if (b.cross_category_reconciliation?.reused_restaurant_id !== 'chan') {
      console.error(`ERROR: CHAN must reuse restaurant_id 'chan'!`);
      integrityErrors++;
    }
  }
}

// 3. Branches Validation
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

const ALLOWED_REUSED_RESTAURANTS = new Set([
  'wakame',
  'shiro',
  'myazu',
  'kuuru',
  'sakura_japanese_restaurant',
  'sushiah',
  'chan'
]);

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

      if (livePlaceIds.has(br.google_place_id)) {
        const matched = livePlaceIds.get(br.google_place_id);
        if (!ALLOWED_REUSED_RESTAURANTS.has(matched.restaurant_id)) {
          crossCategoryPlaceCollisions.push({
            brand: b.canonical_name,
            branch: br.branch_name,
            place_id: br.google_place_id,
            collided_with: matched.restaurant_id
          });
          integrityErrors++;
        }
      }
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing or invalid Google Place ID!`);
      integrityErrors++;
    }

    // Maps URL check
    if (br.google_maps_url && (br.google_maps_url.includes('google.com/maps') || br.google_maps_url.includes('maps.google.com'))) {
      branchesWithMapsUrl++;
      mapsUrls.push(br.google_maps_url);
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing standardized Google Maps URL!`);
      integrityErrors++;
    }

    // Coordinates check
    if (typeof br.latitude === 'number' && typeof br.longitude === 'number') {
      branchesWithCoords++;
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
  }

  // Count brand-level manual review branches
  if (Array.isArray(b.manual_review_branches)) {
    totalManualReviewBranches += b.manual_review_branches.length;
    for (const mb of b.manual_review_branches) {
      if (mb.latitude != null || mb.longitude != null) {
        console.error(`ERROR: Manual review branch '${mb.branch_name}' must not have coordinates!`);
        integrityErrors++;
      }
    }
  }
}

// Internal duplicate check
const dupPlaceIds = placeIds.filter((p, i) => placeIds.indexOf(p) !== i);
if (dupPlaceIds.length > 0) {
  console.error('ERROR: Duplicate Google Place IDs detected within dataset:', dupPlaceIds);
  integrityErrors++;
}

const dupMapsUrls = mapsUrls.filter((u, i) => mapsUrls.indexOf(u) !== i);
if (dupMapsUrls.length > 0) {
  console.error('ERROR: Duplicate Google Maps URLs detected within dataset:', dupMapsUrls);
  integrityErrors++;
}

// Source total branch accounts
const expectedSourceTotalBranches = 51;
const actualTotalBranches = totalActiveBranches + totalManualReviewBranches + totalExcludedBranches;
if (actualTotalBranches !== expectedSourceTotalBranches) {
  console.error(`ERROR: Branch total mismatch! Expected ${expectedSourceTotalBranches}, got ${actualTotalBranches} (Active: ${totalActiveBranches}, Manual: ${totalManualReviewBranches}, Excluded: ${totalExcludedBranches})`);
  integrityErrors++;
}

console.log('\n---------------- AUDIT RESULTS ----------------');
console.log(`Locked Brands: ${totalBrands} / 19`);
console.log(`Active Branches: ${totalActiveBranches}`);
console.log(`  - Production Ready: ${prodReadyBranches}`);
console.log(`  - Usable with Caution (Outer Geography): ${cautionBranches}`);
console.log(`Manual Review Branches (Excluded from deck): ${totalManualReviewBranches}`);
console.log(`Excluded Branches: ${totalExcludedBranches}`);
console.log(`Total Source Branches Accounted For: ${actualTotalBranches} / 51`);
console.log(`Canonical 30 District Branches: ${canonicalDistrictActiveBranches}`);
console.log(`Outer District Branches: ${nullDistrictActiveBranches}`);
console.log(`Place ID Completeness: ${(branchesWithPlaceId / totalActiveBranches * 100).toFixed(1)}% (${branchesWithPlaceId}/${totalActiveBranches})`);
console.log(`Coordinates Completeness: ${(branchesWithCoords / totalActiveBranches * 100).toFixed(1)}% (${branchesWithCoords}/${totalActiveBranches})`);
console.log(`Maps URL Completeness: ${(branchesWithMapsUrl / totalActiveBranches * 100).toFixed(1)}% (${branchesWithMapsUrl}/${totalActiveBranches})`);
console.log(`Address Completeness: ${(branchesWithAddress / totalActiveBranches * 100).toFixed(1)}% (${branchesWithAddress}/${totalActiveBranches})`);
console.log(`Operating Status Completeness: ${(branchesWithOperatingStatus / totalActiveBranches * 100).toFixed(1)}% (${branchesWithOperatingStatus}/${totalActiveBranches})`);
console.log(`Rating Completeness: ${(branchesWithRating / totalActiveBranches * 100).toFixed(1)}% (${branchesWithRating}/${totalActiveBranches})`);
console.log(`Review Count Completeness: ${(branchesWithReviewCount / totalActiveBranches * 100).toFixed(1)}% (${branchesWithReviewCount}/${totalActiveBranches})`);
console.log(`Hours Completeness: ${(branchesWithHours / totalActiveBranches * 100).toFixed(1)}% (${branchesWithHours}/${totalActiveBranches})`);
console.log(`Unintended Cross-Category Collisions: ${crossCategoryPlaceCollisions.length}`);
console.log(`Internal Duplicate Place IDs: ${dupPlaceIds.length}`);
console.log(`Internal Duplicate Maps URLs: ${dupMapsUrls.length}`);
console.log(`Closed Branches in Active Catalog: ${closedActiveBranches.length}`);
console.log('------------------------------------------------\n');

if (integrityErrors > 0) {
  console.error(`FAILED: ${integrityErrors} integrity errors detected! STOPPING.`);
  process.exit(1);
} else {
  console.log('SUCCESS: All Asian certification checks passed cleanly!');
}
