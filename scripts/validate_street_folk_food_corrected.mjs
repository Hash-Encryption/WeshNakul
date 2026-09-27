import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JEDDAH_DISTRICT_LIST } from '../src/data/jeddahDistricts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filePath = path.join(rootDir, 'docs', 'research', 'jeddah-street-folk-food-pass-d-corrected.json');
if (!fs.existsSync(filePath)) {
  console.error(`FATAL: File not found: ${filePath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));

console.log('=====================================================');
console.log('== WESHNAKUL STREET / FOLK FOOD VALIDATION AUDIT PASS =');
console.log('=====================================================');
console.log('Schema Version:', data.schema_version);
console.log('Dataset:', data.dataset?.display_category, `(${data.dataset?.primary_category})`);
console.log('Status:', data.dataset?.status);
console.log('Verified Date:', data.dataset?.verified_date);

let integrityErrors = 0;

// 1. Schema & Category Taxonomy Validation
if (data.schema_version !== 'weshnakul_restaurant_research_v3') {
  console.error(`ERROR: Unexpected schema_version '${data.schema_version}'`);
  integrityErrors++;
}

if (data.dataset?.primary_category !== 'street_folk_food') {
  console.error(`ERROR: Unexpected dataset.primary_category '${data.dataset?.primary_category}', expected 'street_folk_food'`);
  integrityErrors++;
}

if (data.taxonomy?.mode !== 'food' || data.taxonomy?.category !== 'street_folk_food') {
  console.error(`ERROR: Taxonomy mismatch: mode='${data.taxonomy?.mode}', category='${data.taxonomy?.category}'`);
  integrityErrors++;
}

const EXPECTED_SUBTYPES = new Set([
  'falafel',
  'foul',
  'tamees',
  'mutabbaq',
  'masoub',
  'areeka',
  'koshari',
  'kebda',
  'levant_street_food',
  'hijazi_food',
  'traditional_breakfast'
]);

for (const sub of (data.taxonomy?.subtypes || [])) {
  if (!EXPECTED_SUBTYPES.has(sub)) {
    console.error(`ERROR: Unrecognized taxonomy subtype '${sub}'`);
    integrityErrors++;
  }
}

// 2. Preserved Curated Brands Validation
const EXPECTED_BRANDS = [
  'abu_zaid',
  'banaemah',
  'am_qasim',
  'operation_falafel',
  'koshary_abu_tarek',
  'masoub_al_qadri',
  'kabdat_al_muallimi',
  'falafel_al_sham',
  'tamees_09',
  'al_qarmoshi',
  'koshary_el_tahrir',
  'al_hindawiyah',
  'foul_abbas',
  'tamees_house',
  'foul_fattah'
];

if (data.brands?.length !== EXPECTED_BRANDS.length) {
  console.error(`ERROR: Expected exactly ${EXPECTED_BRANDS.length} brands, got ${data.brands?.length}`);
  integrityErrors++;
}

const brandIds = new Set();
const brandNames = new Set();
const validRecUseCases = new Set(['delivery', 'going_out', 'both']);

for (const b of (data.brands || [])) {
  if (!EXPECTED_BRANDS.includes(b.id)) {
    console.error(`ERROR: Unauthorized brand '${b.id}' present in curated set!`);
    integrityErrors++;
  }

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

  // Subtypes check
  for (const s of (b.subtypes || [])) {
    if (!EXPECTED_SUBTYPES.has(s)) {
      console.error(`ERROR: Brand '${b.canonical_name}' has unrecognized subtype '${s}'`);
      integrityErrors++;
    }
  }

  // Multi-mode check
  if (!b.modes.includes('food')) {
    console.error(`ERROR: Brand '${b.canonical_name}' missing primary 'food' mode`);
    integrityErrors++;
  }

  // Breakfast mode check (koshari brands are food-only; 13 traditional brands include breakfast)
  if (['koshary_abu_tarek', 'koshary_el_tahrir'].includes(b.id)) {
    if (b.modes.includes('breakfast')) {
      console.error(`ERROR: Koshari brand '${b.canonical_name}' should not belong to breakfast mode`);
      integrityErrors++;
    }
  } else {
    if (!b.modes.includes('breakfast')) {
      console.error(`ERROR: Traditional folk brand '${b.canonical_name}' should include 'breakfast' mode`);
      integrityErrors++;
    }
  }

  // Recommendation use case check
  if (!validRecUseCases.has(b.recommendation_use_case)) {
    console.error(`ERROR: Brand '${b.canonical_name}' has invalid recommendation_use_case '${b.recommendation_use_case}'`);
    integrityErrors++;
  }

  // Static nearby ban
  const allTags = [...(b.context_tags || [])];
  if (allTags.some(t => t.toLowerCase().includes('nearby'))) {
    console.error(`ERROR: Static 'nearby' tag found on brand '${b.canonical_name}'. Nearby must remain dynamic!`);
    integrityErrors++;
  }

  // Healthy category ban
  if (b.primary_category === 'healthy' || (b.secondary_categories || []).includes('healthy')) {
    console.error(`ERROR: 'healthy' used as a category on brand '${b.canonical_name}'. Healthy must remain a filter!`);
    integrityErrors++;
  }

  // Bait Al Tamiya check
  if (b.canonical_name.toLowerCase().includes('tamiya') || b.id.includes('tamiya')) {
    console.error(`ERROR: Bait Al Tamiya should not be in this dataset!`);
    integrityErrors++;
  }
}

// 3. Anchor Rules Validation
const deckRules = data.deck_rules;
if (!deckRules || deckRules.deck_size !== 7 || deckRules.randomized !== true) {
  console.error(`ERROR: Deck rules corrupted: expected 7 randomized cards`);
  integrityErrors++;
}

if (!deckRules.anchor_groups || deckRules.anchor_groups.length !== 2) {
  console.error(`ERROR: Expected 2 anchor groups, got ${deckRules.anchor_groups?.length}`);
  integrityErrors++;
} else {
  const groupA = deckRules.anchor_groups.find(g => g.id === 'foul_tamees_anchor');
  const groupB = deckRules.anchor_groups.find(g => g.id === 'falafel_koshari_anchor');

  if (!groupA || !groupA.brands.includes('abu_zaid') || !groupA.brands.includes('banaemah')) {
    console.error(`ERROR: Anchor Group A corrupted: must include abu_zaid and banaemah`);
    integrityErrors++;
  }
  if (!groupB || !groupB.brands.includes('operation_falafel') || !groupB.brands.includes('koshary_abu_tarek')) {
    console.error(`ERROR: Anchor Group B corrupted: must include operation_falafel and koshary_abu_tarek`);
    integrityErrors++;
  }
}

if (!deckRules.no_forced_reroll_bias) {
  console.error(`ERROR: no_forced_reroll_bias must be true in deck_rules`);
  integrityErrors++;
}

// 4. Branches Validation
let totalActiveBranches = 0;
let prodReadyBranches = 0;
let cautionBranches = 0;
let totalManualReviewBranches = 0;
let totalExcludedBranches = 0;

let branchesWithPlaceId = 0;
let branchesWithCoords = 0;
let branchesWithMapsUrl = 0;
let branchesWithAddress = 0;
let branchesWithOperatingStatus = 0;
let branchesWithRating = 0;
let branchesWithReviewCount = 0;
let branchesWithHours = 0;

let canonicalDistrictActiveBranches = 0;
let outerCautionActiveBranches = 0;

const placeIds = [];
const mapsUrls = [];
const outOfBoundsCoords = [];
const nonJeddahBranches = [];
const permanentlyClosedBranches = [];
const outerBranchesMissingNotes = [];

for (const b of (data.brands || [])) {
  for (const br of (b.branches || [])) {
    totalActiveBranches++;

    if (br.production_eligibility === 'production_ready') {
      prodReadyBranches++;
    } else if (br.production_eligibility === 'usable_with_caution') {
      cautionBranches++;
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' has non-active eligibility '${br.production_eligibility}'!`);
      integrityErrors++;
    }

    // Place ID check
    if (br.google_place_id && br.google_place_id.trim().length > 0) {
      branchesWithPlaceId++;
      placeIds.push(br.google_place_id);
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing Google Place ID!`);
      integrityErrors++;
    }

    // Maps URL check
    if (br.google_maps_url && br.google_maps_url.startsWith('https://www.google.com/maps/search/?api=1&query_place_id=')) {
      branchesWithMapsUrl++;
      mapsUrls.push(br.google_maps_url);
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing standardized Google Maps URL!`);
      integrityErrors++;
    }

    // Coordinates check
    if (typeof br.latitude === 'number' && typeof br.longitude === 'number') {
      branchesWithCoords++;
      if (br.latitude < 21.0 || br.latitude > 22.0 || br.longitude > 39.5 || br.longitude < 39.0) {
        outOfBoundsCoords.push({ brand: b.canonical_name, branch: br.branch_name, lat: br.latitude, lng: br.longitude });
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
    if (br.operating_status === 'open' || br.operating_status === 'active') {
      branchesWithOperatingStatus++;
    } else {
      permanentlyClosedBranches.push({ brand: b.canonical_name, branch: br.branch_name, status: br.operating_status });
      integrityErrors++;
    }

    // Rating & reviews
    if (typeof br.google_rating === 'number') branchesWithRating++;
    if (typeof br.google_review_count === 'number') branchesWithReviewCount++;

    // Hours
    if (br.hours && br.hours.trim().length > 0) branchesWithHours++;

    // City
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
        console.error(`ERROR: Branch '${b.canonical_name} - ${br.branch_name}' has unrecognized canonical_district '${br.canonical_district}'!`);
        integrityErrors++;
      }
    } else {
      outerCautionActiveBranches++;
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

  // Count manual review branches
  for (const mr of (b.manual_review_branches || [])) {
    totalManualReviewBranches++;
    if (mr.production_eligibility !== 'manual_review') {
      console.error(`ERROR: Branch in manual_review_branches has wrong eligibility '${mr.production_eligibility}'`);
      integrityErrors++;
    }
    if (!mr.reason || mr.reason.trim().length === 0) {
      console.error(`ERROR: Manual review branch '${mr.branch_name}' missing quarantine reason!`);
      integrityErrors++;
    }
  }

  // Count excluded branches
  for (const ex of (b.excluded_branches || [])) {
    totalExcludedBranches++;
    if (ex.production_eligibility !== 'excluded') {
      console.error(`ERROR: Branch in excluded_branches has wrong eligibility '${ex.production_eligibility}'`);
      integrityErrors++;
    }
  }
}

// Duplicate Place IDs
const duplicatePlaceIds = [];
const seenPlaceIds = new Set();
for (const pid of placeIds) {
  if (seenPlaceIds.has(pid)) {
    duplicatePlaceIds.push(pid);
    integrityErrors++;
  }
  seenPlaceIds.add(pid);
}

// Duplicate Maps URLs
const duplicateMapsUrls = [];
const seenMapsUrls = new Set();
for (const url of mapsUrls) {
  if (seenMapsUrls.has(url)) {
    duplicateMapsUrls.push(url);
    integrityErrors++;
  }
  seenMapsUrls.add(url);
}

console.log('\n--- AUDIT METRICS ---');
console.log(`Total Curated Brands: ${data.brands?.length}`);
console.log(`Total Candidate Branches: ${totalActiveBranches + totalManualReviewBranches + totalExcludedBranches}`);
console.log(`Total Verified Active Branches: ${totalActiveBranches}`);
console.log(`  - Production Ready (Canonical): ${prodReadyBranches}`);
console.log(`  - Usable with Caution (Outer): ${cautionBranches}`);
console.log(`  - Manual Review: ${totalManualReviewBranches}`);
console.log(`  - Excluded: ${totalExcludedBranches}`);
console.log('');
console.log(`Place ID Completeness: ${branchesWithPlaceId}/${totalActiveBranches} (${((branchesWithPlaceId/totalActiveBranches)*100).toFixed(1)}%)`);
console.log(`Exact Coordinates Completeness: ${branchesWithCoords}/${totalActiveBranches} (${((branchesWithCoords/totalActiveBranches)*100).toFixed(1)}%)`);
console.log(`Standard Maps URL Completeness: ${branchesWithMapsUrl}/${totalActiveBranches} (${((branchesWithMapsUrl/totalActiveBranches)*100).toFixed(1)}%)`);
console.log(`Address Completeness: ${branchesWithAddress}/${totalActiveBranches} (${((branchesWithAddress/totalActiveBranches)*100).toFixed(1)}%)`);
console.log(`Operating Status Completeness: ${branchesWithOperatingStatus}/${totalActiveBranches} (${((branchesWithOperatingStatus/totalActiveBranches)*100).toFixed(1)}%)`);
console.log(`Rating Completeness: ${branchesWithRating}/${totalActiveBranches} (${((branchesWithRating/totalActiveBranches)*100).toFixed(1)}%)`);
console.log(`Review Count Completeness: ${branchesWithReviewCount}/${totalActiveBranches} (${((branchesWithReviewCount/totalActiveBranches)*100).toFixed(1)}%)`);
console.log(`Hours Completeness: ${branchesWithHours}/${totalActiveBranches} (${((branchesWithHours/totalActiveBranches)*100).toFixed(1)}%)`);
console.log('');
console.log(`Duplicate Place IDs: ${duplicatePlaceIds.length}`);
console.log(`Duplicate Maps URLs: ${duplicateMapsUrls.length}`);
console.log(`Out of Bounds Coordinates: ${outOfBoundsCoords.length}`);
console.log(`Non-Jeddah Branches: ${nonJeddahBranches.length}`);
console.log(`Permanently Closed Branches: ${permanentlyClosedBranches.length}`);
console.log(`Outer Branches Missing Notes: ${outerBranchesMissingNotes.length}`);

console.log('\n=====================================================');
if (integrityErrors === 0) {
  console.log('>>> VERDICT: STREET_FOLK_FOOD_RESEARCH_CERTIFIED_FOR_IMPORT_PREP <<<');
  console.log('All integrity, coordinate, taxonomy, geography, and anchor checks passed.');
  console.log('=====================================================');
  process.exit(0);
} else {
  console.error(`>>> VERDICT: STREET_FOLK_FOOD_RESEARCH_REQUIRES_ATTENTION (${integrityErrors} errors) <<<`);
  console.log('=====================================================');
  process.exit(1);
}
