import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JEDDAH_DISTRICT_LIST } from '../src/data/jeddahDistricts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filePath = path.join(rootDir, 'docs', 'research', 'jeddah-seafood-pass-d-corrected.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));
const dbBranches = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_live_branches.json'), 'utf8'));
const dbPlaceIds = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_place_ids.json'), 'utf8')));
const dbMapsUrls = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_maps_urls.json'), 'utf8')));
const dbBrandIds = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_brands.json'), 'utf8')).map(b => b.id));

console.log('=====================================================');
console.log('====== WESHNAKUL SEAFOOD VALIDATION AUDIT PASS ======');
console.log('=====================================================');
console.log('Schema Version:', data.schema_version);
console.log('Dataset:', data.dataset.display_category, `(${data.dataset.primary_category})`);
console.log('Status:', data.dataset.status);
console.log('Verified Date:', data.dataset.verified_date);

let integrityErrors = 0;

// 1. Dataset Top-Level & Deck Rule Validation
if (data.dataset.primary_category !== 'seafood') {
  console.error(`ERROR: Top-level primary_category is '${data.dataset.primary_category}', expected 'seafood'`);
  integrityErrors++;
}
if (!data.dataset.sushi_excluded) {
  console.error(`ERROR: sushi_excluded flag must be true!`);
  integrityErrors++;
}

const deckRule = data.dataset.seafood_deck_rule;
if (!deckRule) {
  console.error(`ERROR: Missing seafood_deck_rule at dataset level!`);
  integrityErrors++;
} else {
  if (deckRule.deck_size !== 7) {
    console.error(`ERROR: deck_size must be 7, got ${deckRule.deck_size}`);
    integrityErrors++;
  }
  if (deckRule.guaranteed_anchor_count !== 1) {
    console.error(`ERROR: guaranteed_anchor_count must be 1, got ${deckRule.guaranteed_anchor_count}`);
    integrityErrors++;
  }
  const anchors = deckRule.anchor_candidates || [];
  if (anchors.length !== 2 || !anchors.includes('Shrimp Zone') || !anchors.includes('Shrimp Anatomy')) {
    console.error(`ERROR: anchor_candidates must be exactly ['Shrimp Zone', 'Shrimp Anatomy'], got:`, anchors);
    integrityErrors++;
  }
  if (deckRule.initial_anchor_probability_each !== 0.5) {
    console.error(`ERROR: initial_anchor_probability_each must be 0.5, got ${deckRule.initial_anchor_probability_each}`);
    integrityErrors++;
  }
}

// 2. Brands Validation
const totalBrands = data.brands.length;
let prodReadyBrands = 0;
let cautionBrands = 0;
let manualReviewBrands = 0;
let excludedBrands = 0;

const brandIds = new Set();
const brandNames = new Set();
const validRecUseCases = new Set(['delivery', 'going_out', 'both']);
const recUseCaseCounts = { delivery: 0, going_out: 0, both: 0 };
const anchorBrandsFound = new Set();

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

  // Check collision with DB brands
  if (dbBrandIds.has(b.id)) {
    console.error(`ERROR: Brand id '${b.id}' collides with live database!`);
    integrityErrors++;
  }

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

  // Modes & Category
  if (!b.modes || !b.modes.includes('food')) {
    console.error(`ERROR: Brand '${b.canonical_name}' must include 'food' mode.`);
    integrityErrors++;
  }
  if (b.primary_category !== 'seafood') {
    console.error(`ERROR: Brand '${b.canonical_name}' primary_category is '${b.primary_category}', expected 'seafood'`);
    integrityErrors++;
  }

  // Sushi exclusion check
  const allBrandText = `${b.canonical_name} ${b.arabic_name || ''} ${(b.secondary_categories || []).join(' ')} ${(b.signature_dishes || []).join(' ')}`.toLowerCase();
  if (allBrandText.includes('sushi') || allBrandText.includes('sashimi') || allBrandText.includes('سوشي')) {
    console.error(`ERROR: Brand '${b.canonical_name}' contains sushi terms, violating sushi exclusion rule!`);
    integrityErrors++;
  }

  // Healthy is NOT a category check
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
  if (b.recommendation_use_case === 'delivery') {
    if (!b.distance_behavior?.delivery?.includes('nearby')) {
      console.error(`ERROR: Delivery brand '${b.canonical_name}' lacks strict nearby delivery distance behavior.`);
      integrityErrors++;
    }
  }
  if (b.recommendation_use_case === 'going_out') {
    if (!b.distance_behavior?.going_out?.includes('destination')) {
      console.error(`ERROR: Going-out brand '${b.canonical_name}' lacks destination going-out distance behavior.`);
      integrityErrors++;
    }
  }
  if (b.recommendation_use_case === 'both') {
    if (!b.distance_behavior?.delivery?.includes('nearby') || !b.distance_behavior?.going_out?.includes('destination')) {
      console.error(`ERROR: 'Both' brand '${b.canonical_name}' lacks complete delivery & going-out distance behavior.`);
      integrityErrors++;
    }
  }

  // Ensure "nearby" is not stored statically in context_tags
  const allTags = [...(b.context_tags || [])];
  if (allTags.some(t => t.toLowerCase().includes('nearby'))) {
    console.error(`ERROR: Static 'nearby' tag found on brand '${b.canonical_name}'. Nearby must remain dynamic!`);
    integrityErrors++;
  }

  // Seafood anchor check
  if (b.deck_rule?.seafood_anchor) {
    anchorBrandsFound.add(b.canonical_name);
    if (!['Shrimp Zone', 'Shrimp Anatomy'].includes(b.canonical_name)) {
      console.error(`ERROR: Brand '${b.canonical_name}' has seafood_anchor=true but is not Shrimp Zone or Shrimp Anatomy!`);
      integrityErrors++;
    }
    if (b.deck_rule.initial_anchor_probability !== 0.5) {
      console.error(`ERROR: Anchor '${b.canonical_name}' initial_anchor_probability must be 0.5!`);
      integrityErrors++;
    }
    if (b.canonical_name === 'Shrimp Zone' && b.deck_rule.mutually_exclusive_with !== 'Shrimp Anatomy') {
      console.error(`ERROR: Shrimp Zone must be mutually exclusive with Shrimp Anatomy!`);
      integrityErrors++;
    }
    if (b.canonical_name === 'Shrimp Anatomy' && b.deck_rule.mutually_exclusive_with !== 'Shrimp Zone') {
      console.error(`ERROR: Shrimp Anatomy must be mutually exclusive with Shrimp Zone!`);
      integrityErrors++;
    }
  }
}

if (anchorBrandsFound.size !== 2 || !anchorBrandsFound.has('Shrimp Zone') || !anchorBrandsFound.has('Shrimp Anatomy')) {
  console.error(`ERROR: Exactly Shrimp Zone and Shrimp Anatomy must be marked as anchors. Found:`, Array.from(anchorBrandsFound));
  integrityErrors++;
}

// 3. Branches Validation
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
let outerCautionBranches = 0;
let invalidDistrictCount = 0;

const placeIds = [];
const mapsUrls = [];
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

      if (dbPlaceIds.has(br.google_place_id)) {
        accidentalPlaceCollisions.push({
          brand: b.canonical_name,
          branch: br.branch_name,
          place_id: br.google_place_id
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

      if (dbMapsUrls.has(br.google_maps_url)) {
        accidentalMapsCollisions.push({
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
      // Jeddah bounding box: lat ~21.1 to 22.1, lng ~39.0 to 39.4
      if (br.latitude < 21.1 || br.latitude > 22.1 || br.longitude < 39.0 || br.longitude > 39.4) {
        outOfBoundsCoords.push({
          brand: b.canonical_name,
          branch: br.branch_name,
          lat: br.latitude,
          lng: br.longitude
        });
        integrityErrors++;
      }
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing numeric coordinates!`);
      integrityErrors++;
    }

    // Formatted Address check
    if (br.formatted_address && br.formatted_address.trim().length > 0) {
      branchesWithAddress++;
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing formatted address!`);
      integrityErrors++;
    }

    // City check
    if (br.city !== 'Jeddah') {
      nonJeddahBranches.push({
        brand: b.canonical_name,
        branch: br.branch_name,
        city: br.city
      });
      integrityErrors++;
    }

    // Operating Status check
    if (br.operating_status === 'open') {
      branchesWithOperatingStatus++;
    } else {
      nonOpenActiveBranches.push({
        brand: b.canonical_name,
        branch: br.branch_name,
        status: br.operating_status
      });
      integrityErrors++;
    }

    // Rating & Reviews check
    if (typeof br.google_rating === 'number' && br.google_rating >= 1.0 && br.google_rating <= 5.0) {
      branchesWithRating++;
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing valid rating!`);
      integrityErrors++;
    }

    if (typeof br.google_review_count === 'number' && br.google_review_count >= 0) {
      branchesWithReviewCount++;
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing valid review count!`);
      integrityErrors++;
    }

    // Hours check
    if (br.hours && br.hours.trim().length > 0) {
      branchesWithHours++;
    } else {
      console.error(`ERROR: Active branch '${b.canonical_name} - ${br.branch_name}' missing operational hours!`);
      integrityErrors++;
    }

    // District handling
    if (br.canonical_district) {
      if (CANONICAL_30.has(br.canonical_district)) {
        canonicalDistrictActiveBranches++;
        if (br.production_eligibility !== 'production_ready') {
          console.error(`ERROR: Canonical district branch '${b.canonical_name} - ${br.branch_name}' must be production_ready!`);
          integrityErrors++;
        }
      } else {
        console.error(`ERROR: Branch '${b.canonical_name} - ${br.branch_name}' has non-canonical district id '${br.canonical_district}'!`);
        invalidDistrictCount++;
        integrityErrors++;
      }
    } else {
      // Outer caution branch
      outerCautionBranches++;
      if (br.production_eligibility !== 'usable_with_caution') {
        console.error(`ERROR: Null-district branch '${b.canonical_name} - ${br.branch_name}' must be usable_with_caution!`);
        integrityErrors++;
      }
      if (!br.geographic_notes || br.geographic_notes.trim().length === 0) {
        outerBranchesMissingNotes.push({ brand: b.canonical_name, branch: br.branch_name });
        integrityErrors++;
      }
    }
  }

  // Count manual review / excluded locations
  if (b.unresolved_candidate_locations) {
    for (const loc of b.unresolved_candidate_locations) {
      if (loc.status === 'manual_review') totalManualReviewBranches++;
      else if (loc.status === 'excluded_from_physical_catalog') totalExcludedBranches++;
    }
  }
}

// 4. Duplicate checks within Seafood
const dupPlaceIds = placeIds.filter((item, index) => placeIds.indexOf(item) !== index);
const dupMapsUrls = mapsUrls.filter((item, index) => mapsUrls.indexOf(item) !== index);

if (dupPlaceIds.length > 0) {
  console.error('ERROR: Duplicate Place IDs found within Seafood dataset:', dupPlaceIds);
  integrityErrors += dupPlaceIds.length;
}

if (dupMapsUrls.length > 0) {
  console.error('ERROR: Duplicate Google Maps URLs found within Seafood dataset:', dupMapsUrls);
  integrityErrors += dupMapsUrls.length;
}

// 5. Verification Output
console.log('\n--- 1. BRAND AUDIT SUMMARY ---');
console.log(`Total Brands: ${totalBrands}`);
console.log(`Production Ready Brands: ${prodReadyBrands}`);
console.log(`Usable With Caution Brands: ${cautionBrands}`);
console.log(`Manual Review Brands: ${manualReviewBrands}`);
console.log(`Excluded Brands: ${excludedBrands}`);
console.log('Recommendation Use Cases:', recUseCaseCounts);
console.log('Anchors Verified:', Array.from(anchorBrandsFound).join(', '));

console.log('\n--- 2. BRANCH AUDIT SUMMARY ---');
console.log(`Total Active Branches: ${totalActiveBranches}`);
console.log(`Production Ready Branches: ${prodReadyBranches}`);
console.log(`Usable With Caution Branches: ${cautionBranches}`);
console.log(`Canonical 30-District Active Branches: ${canonicalDistrictActiveBranches}`);
console.log(`Outer Caution Branches: ${outerCautionBranches}`);
console.log(`Manual Review Candidate Locations: ${totalManualReviewBranches}`);
console.log(`Excluded Candidate Locations: ${totalExcludedBranches}`);

console.log('\n--- 3. COMPLETENESS METRICS ---');
console.log(`Place ID Completeness: ${(branchesWithPlaceId / totalActiveBranches * 100).toFixed(1)}% (${branchesWithPlaceId}/${totalActiveBranches})`);
console.log(`Coordinates Completeness: ${(branchesWithCoords / totalActiveBranches * 100).toFixed(1)}% (${branchesWithCoords}/${totalActiveBranches})`);
console.log(`Maps URL Completeness: ${(branchesWithMapsUrl / totalActiveBranches * 100).toFixed(1)}% (${branchesWithMapsUrl}/${totalActiveBranches})`);
console.log(`Address Completeness: ${(branchesWithAddress / totalActiveBranches * 100).toFixed(1)}% (${branchesWithAddress}/${totalActiveBranches})`);
console.log(`Operating Status Completeness: ${(branchesWithOperatingStatus / totalActiveBranches * 100).toFixed(1)}% (${branchesWithOperatingStatus}/${totalActiveBranches})`);
console.log(`Rating Completeness: ${(branchesWithRating / totalActiveBranches * 100).toFixed(1)}% (${branchesWithRating}/${totalActiveBranches})`);
console.log(`Review Count Completeness: ${(branchesWithReviewCount / totalActiveBranches * 100).toFixed(1)}% (${branchesWithReviewCount}/${totalActiveBranches})`);
console.log(`Hours Completeness: ${(branchesWithHours / totalActiveBranches * 100).toFixed(1)}% (${branchesWithHours}/${totalActiveBranches})`);

console.log('\n--- 4. INTEGRITY & COLLISION AUDIT ---');
console.log(`Internal Duplicate Place IDs: ${dupPlaceIds.length}`);
console.log(`Internal Duplicate Maps URLs: ${dupMapsUrls.length}`);
console.log(`Cross-Category Collisions with Live Database (453 branches): ${accidentalPlaceCollisions.length}`);
console.log(`Out-of-Bounds Coordinates: ${outOfBoundsCoords.length}`);
console.log(`Non-Jeddah Branches: ${nonJeddahBranches.length}`);
console.log(`Non-Open Branches: ${nonOpenActiveBranches.length}`);
console.log(`Outer Branches Missing Notes: ${outerBranchesMissingNotes.length}`);

console.log('\n=====================================================');
console.log(`TOTAL INTEGRITY ERRORS: ${integrityErrors}`);

if (integrityErrors === 0) {
  console.log('STATUS: SEAFOOD_RESEARCH_CERTIFIED_FOR_IMPORT_PREP');
  process.exit(0);
} else {
  console.log('STATUS: SEAFOOD_RESEARCH_REQUIRES_ATTENTION');
  process.exit(1);
}
