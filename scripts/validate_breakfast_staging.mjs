import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JEDDAH_DISTRICT_LIST } from '../src/data/jeddahDistricts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filePath = path.join(rootDir, 'tmp', 'staging_breakfast_v3.json');
if (!fs.existsSync(filePath)) {
  console.error(`FATAL: File not found: ${filePath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map((d) => d.id));

console.log('=====================================================');
console.log('== WESHNAKUL BREAKFAST STAGING V3 & INTEGRITY AUDIT ==');
console.log('=====================================================');
console.log('Schema Version:', data.schema_version);
console.log('Dataset:', data.dataset?.display_category, `(${data.dataset?.primary_category})`);
console.log('Mode:', data.dataset?.mode);
console.log('Status:', data.dataset?.status);
console.log('Verified Date:', data.dataset?.verified_date);
console.log('-----------------------------------------------------');

let integrityErrors = 0;

// 1. Schema & Dataset Metadata
if (data.schema_version !== 'weshnakul_restaurant_research_v3') {
  console.error(`ERROR: Unexpected schema_version '${data.schema_version}'`);
  integrityErrors++;
}

if (data.dataset?.mode !== 'breakfast') {
  console.error(`ERROR: Unexpected dataset.mode '${data.dataset?.mode}', expected 'breakfast'`);
  integrityErrors++;
}

if (data.dataset?.primary_category !== 'breakfast') {
  console.error(`ERROR: Unexpected dataset.primary_category '${data.dataset?.primary_category}', expected 'breakfast'`);
  integrityErrors++;
}

// 2. Controlled Enums and Vocabularies
const VALID_EDITORIAL_CLASSIFICATIONS = new Set([
  'staple',
  'mainstream',
  'local_favorite',
  'rising',
  'hidden_gem'
]);

const VALID_PRICE_POSITIONINGS = new Set([
  'budget',
  'affordable',
  'mid_range',
  'premium'
]);

const VALID_APP_PRICE_TIERS = new Set(['$', '$$', '$$$']);
const VALID_APP_TIER_TYPES = new Set(['staple', 'trend']);

const CONTROLLED_CONTEXT_TAGS = new Set([
  'broad_coverage',
  'budget',
  'casual_hangout',
  'delivery_strong',
  'destination_dining',
  'dine_in_strong',
  'family_friendly',
  'group_dining',
  'group_friendly',
  'heritage',
  'hidden_gem',
  'high_energy',
  'historic_balad',
  'hot_chicken',
  'late_night',
  'local',
  'local_favorite',
  'open_24_hours',
  'popular',
  'premium',
  'quick_bite',
  'rising',
  'traditional_broast',
  'trending',
  'waterfront_view'
]);

const VALID_MEAL_FIT = new Set(['breakfast', 'lunch', 'dinner', 'late_night']);

// Secondary categories must be genuine catalog/cuisine terms, never invented
const VALID_SECONDARY_CATEGORIES = new Set([
  'bakery',
  'turkish',
  'american',
  'sandwiches',
  'breakfast_sandwiches',
  'fatayer',
  'street_folk'
]);

const PAUL_EXPECTED_BRANCHES = {
  branch_paul_red_sea_mall: 'al_shati',
  branch_paul_jeddah_park: 'al_aziziyah',
  branch_paul_vibes_andalus: 'al_andalus',
  branch_paul_sultan_zahra: 'al_zahra'
};

// 3. Brands Validation
if (!Array.isArray(data.brands) || data.brands.length !== 12) {
  console.error(`ERROR: Expected exactly 12 brands, found ${data.brands?.length}`);
  integrityErrors++;
}

const seenBrandIds = new Set();
const seenBranchIds = new Set();
const seenPlaceIds = new Set();

let totalBranches = 0;

for (const b of data.brands || []) {
  if (seenBrandIds.has(b.id)) {
    console.error(`ERROR: Duplicate brand ID '${b.id}'`);
    integrityErrors++;
  }
  seenBrandIds.add(b.id);

  // Category & mode validation
  if (b.primary_category !== 'breakfast') {
    console.error(`ERROR: Brand '${b.id}' primary_category '${b.primary_category}' !== 'breakfast'`);
    integrityErrors++;
  }

  if (!Array.isArray(b.modes) || !b.modes.includes('breakfast')) {
    console.error(`ERROR: Brand '${b.id}' modes must include 'breakfast'`);
    integrityErrors++;
  }

  // Editorial classification
  if (!VALID_EDITORIAL_CLASSIFICATIONS.has(b.editorial_classification)) {
    console.error(`ERROR: Brand '${b.id}' has invalid editorial_classification '${b.editorial_classification}'`);
    integrityErrors++;
  }

  // Price positioning
  if (!VALID_PRICE_POSITIONINGS.has(b.price_positioning)) {
    console.error(`ERROR: Brand '${b.id}' has invalid price_positioning '${b.price_positioning}'`);
    integrityErrors++;
  }

  // App tier & price tier mapping checks
  if (b.app_tier && !VALID_APP_TIER_TYPES.has(b.app_tier)) {
    console.error(`ERROR: Brand '${b.id}' has invalid app_tier '${b.app_tier}'`);
    integrityErrors++;
  }

  if (b.app_price_tier && !VALID_APP_PRICE_TIERS.has(b.app_price_tier)) {
    console.error(`ERROR: Brand '${b.id}' has invalid app_price_tier '${b.app_price_tier}'`);
    integrityErrors++;
  }

  // Context tags
  for (const tag of b.context_tags || []) {
    if (!CONTROLLED_CONTEXT_TAGS.has(tag)) {
      console.error(`ERROR: Brand '${b.id}' has unsupported context_tag '${tag}'`);
      integrityErrors++;
    }
    if (tag.toLowerCase().includes('nearby')) {
      console.error(`ERROR: Brand '${b.id}' has static 'nearby' in context_tags`);
      integrityErrors++;
    }
  }

  // Meal fit
  for (const meal of b.meal_fit || []) {
    if (!VALID_MEAL_FIT.has(meal)) {
      console.error(`ERROR: Brand '${b.id}' has unsupported meal_fit '${meal}'`);
      integrityErrors++;
    }
  }

  // Secondary categories
  for (const sec of b.secondary_categories || []) {
    if (!VALID_SECONDARY_CATEGORIES.has(sec)) {
      console.error(`ERROR: Brand '${b.id}' has unsupported secondary_category '${sec}'`);
      integrityErrors++;
    }
    if (sec === 'healthy') {
      console.error(`ERROR: Brand '${b.id}' has 'healthy' as secondary category`);
      integrityErrors++;
    }
  }

  // Healthy must not be category
  if (b.primary_category === 'healthy') {
    console.error(`ERROR: Brand '${b.id}' has 'healthy' as primary category`);
    integrityErrors++;
  }

  // Image licensing firewall
  if (b.image_asset?.reuse_status !== 'REQUIRES_PERMISSION') {
    console.error(`ERROR: Brand '${b.id}' image reuse_status is '${b.image_asset?.reuse_status}', expected 'REQUIRES_PERMISSION'`);
    integrityErrors++;
  }

  // Branches
  for (const br of b.branches || []) {
    totalBranches++;

    if (seenBranchIds.has(br.branch_id)) {
      console.error(`ERROR: Duplicate branch ID '${br.branch_id}'`);
      integrityErrors++;
    }
    seenBranchIds.add(br.branch_id);

    // Place ID is optional per requirements
    if (br.google_place_id) {
      if (seenPlaceIds.has(br.google_place_id)) {
        console.error(`ERROR: Duplicate Google Place ID '${br.google_place_id}'`);
        integrityErrors++;
      }
      seenPlaceIds.add(br.google_place_id);
    }

    // Required fields: branch_name, address, canonical_district, operating_status, provenance
    if (!br.branch_name || !br.branch_name.trim()) {
      console.error(`ERROR: Branch '${br.branch_id}' missing required branch_name`);
      integrityErrors++;
    }
    if (!br.formatted_address || !br.formatted_address.trim()) {
      console.error(`ERROR: Branch '${br.branch_id}' missing required formatted_address`);
      integrityErrors++;
    }
    if (!br.canonical_district || !CANONICAL_30.has(br.canonical_district)) {
      console.error(`ERROR: Branch '${br.branch_id}' has missing or non-canonical district '${br.canonical_district}'`);
      integrityErrors++;
    }
    if (!br.source_provenance || br.source_provenance.length === 0) {
      console.error(`ERROR: Branch '${br.branch_id}' missing required source_provenance`);
      integrityErrors++;
    }
    if (!br.last_verified_at) {
      console.error(`ERROR: Branch '${br.branch_id}' missing required last_verified_at`);
      integrityErrors++;
    }

    // Coordinates bounding box [21.0 - 22.0, 39.0 - 39.5] (optional, but if present must be in Jeddah)
    if (typeof br.latitude === 'number' && typeof br.longitude === 'number') {
      if (br.latitude < 21.0 || br.latitude > 22.0 || br.longitude < 39.0 || br.longitude > 39.5) {
        console.error(`ERROR: Branch '${br.branch_id}' coordinates [${br.latitude}, ${br.longitude}] out of Jeddah bounds`);
        integrityErrors++;
      }
    }

    // Maps URL (optional, but if present must be https)
    if (br.google_maps_url && !br.google_maps_url.startsWith('https://')) {
      console.error(`ERROR: Branch '${br.branch_id}' invalid Google Maps URL '${br.google_maps_url}'`);
      integrityErrors++;
    }

    // Operating status
    if (br.operating_status !== 'open' && br.operating_status !== 'OPERATIONAL') {
      console.error(`ERROR: Branch '${br.branch_id}' operating_status is '${br.operating_status}', expected active`);
      integrityErrors++;
    }

    // PAUL Guardrail check
    if (b.id === 'paul') {
      const expectedDistrict = PAUL_EXPECTED_BRANCHES[br.branch_id];
      if (expectedDistrict !== br.canonical_district) {
        console.error(`ERROR: PAUL guardrail violation on '${br.branch_id}': expected '${expectedDistrict}', got '${br.canonical_district}'`);
        integrityErrors++;
      }
    }
  }
}

if (totalBranches !== 18) {
  console.error(`ERROR: Expected exactly 18 physical branches, found ${totalBranches}`);
  integrityErrors++;
}

// 4. Existing Catalog Preservation Check
const existingAudit = data.quarantine_records?.existing_catalog_reverified || [];
if (data.dataset?.summary?.existing_catalog_branches_preserved !== 36) {
  console.error(`ERROR: Existing catalog branch preservation count is ${data.dataset?.summary?.existing_catalog_branches_preserved}, expected 36`);
  integrityErrors++;
}

const prodBreakfastImgDir = path.join(rootDir, 'public', 'images', 'restaurants', 'breakfast');
if (fs.existsSync(prodBreakfastImgDir)) {
  console.error(`ERROR: Production image directory '${prodBreakfastImgDir}' exists! Firewall breached!`);
  integrityErrors++;
}

console.log('-----------------------------------------------------');
console.log(`Validation Completed. Total Integrity Errors: ${integrityErrors}`);
if (integrityErrors === 0) {
  console.log('✓ PASS: All 12 brands and 18 branches comply with V3 and application schema constraints.');
} else {
  console.error(`✗ FAIL: ${integrityErrors} validation errors detected.`);
  process.exit(1);
}
