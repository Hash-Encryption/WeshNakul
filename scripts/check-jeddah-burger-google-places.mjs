import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('--- Starting Jeddah Burger Google Places Dataset Validation ---');

const artifactPath = path.join(rootDir, 'docs/research/jeddah-burger-google-places-completion.json');
assert.ok(fs.existsSync(artifactPath), 'Research artifact must exist at docs/research/jeddah-burger-google-places-completion.json');

const branches = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

const CANONICAL_DISTRICTS = new Set([
  'al_sheraa', 'al_hamdaniyah', 'abhur_al_shamaliyah', 'abhur_al_janoubiyah',
  'al_murjan', 'al_basateen', 'al_mohammadiyyah', 'al_naeem', 'al_marwah',
  'al_shati', 'al_bawadi', 'al_salamah', 'al_zahra', 'al_safa', 'al_samer',
  'al_faisaliyyah', 'al_rawdah', 'al_khalidiyyah', 'al_rehab', 'al_andalus',
  'al_hamra', 'al_naseem', 'al_ruwais', 'al_faiha', 'al_balad', 'al_thaghr'
]);

const APPROVED_BRANDS = new Set([
  'Section-B',
  'The California Burger',
  'Century Burger',
  "Chef's Homemade Burger Gourmet",
  'Sign Burger',
  'Nora Burger',
  'WBJ',
  'Lou Burger',
  'PPLR',
  'Smash Me'
]);

const VALID_GOOGLE_IDENTITY_STATUS = new Set(['verified', 'secondary_only', 'ambiguous', 'not_found']);
const VALID_IDENTITY_CONFIDENCE = new Set(['high', 'medium', 'low', 'unknown']);
const VALID_COORDINATE_SOURCE = new Set(['google_places', 'google_maps', 'official_branch_link', 'verified_secondary', 'unknown']);
const VALID_COORDINATE_CONFIDENCE = new Set(['high', 'medium', 'unknown']);
const VALID_REPUTATION_SOURCE = new Set(['google_places', 'google_maps_direct', 'google_derived_secondary', 'unknown']);
const VALID_BUSINESS_STATUS_SOURCE = new Set(['google_places', 'google_maps', 'official', 'secondary', 'unknown']);
const VALID_BUSINESS_STATUS_VALS = new Set(['OPERATIONAL', 'CLOSED_TEMPORARILY', 'CLOSED_PERMANENTLY', 'open', 'unknown', null]);
const VALID_RECONCILIATION_ACTIONS = new Set(['keep', 'merge', 'manual_review']);

let passedChecks = 0;
function pass(desc) {
  passedChecks++;
  console.log(`  [PASS ${passedChecks.toString().padStart(2, '0')}] ${desc}`);
}

// 1. Canonical branch count = 37 unless proven reconciliation changes it
assert.strictEqual(branches.length, 37, 'Canonical branch count must equal 37');
pass('Canonical branch count is exactly 37');

// 2. No duplicate (brand_name, branch_name)
const brandBranchKeys = branches.map(b => `${b.brand_name}::${b.branch_name}`);
const uniqueBrandBranch = new Set(brandBranchKeys);
assert.strictEqual(uniqueBrandBranch.size, 37, 'All (brand_name, branch_name) pairs must be unique');
pass('No duplicate (brand_name, branch_name) pairs across all 37 branches');

// 3. No duplicate non-null Google Place IDs
const nonNullPlaceIds = branches.map(b => b.google_identity?.google_place_id).filter(Boolean);
const uniquePlaceIds = new Set(nonNullPlaceIds);
assert.strictEqual(uniquePlaceIds.size, nonNullPlaceIds.length, `Non-null Place IDs must be unique (found ${nonNullPlaceIds.length - uniquePlaceIds.size} duplicates)`);
pass(`No duplicate non-null Google Place IDs (${uniquePlaceIds.size} unique Place IDs)`);

// 4. Place IDs have plausible Google format (ChIJ...)
for (const id of nonNullPlaceIds) {
  assert.match(id, /^ChIJ[A-Za-z0-9_-]{20,}$/, `Place ID ${id} must match plausible ChIJ format`);
}
pass('All Place IDs conform to valid Google Place ID format (ChIJ...)');

// 5. Every google_places coordinate source has both latitude and longitude
for (const b of branches) {
  if (b.location?.coordinate_source === 'google_places') {
    assert.ok(typeof b.location.latitude === 'number', `${b.brand_name} - ${b.branch_name} has numeric latitude`);
    assert.ok(typeof b.location.longitude === 'number', `${b.brand_name} - ${b.branch_name} has numeric longitude`);
  }
}
pass('All google_places coordinate sources have complete latitude and longitude pairs');

// 6. Coordinates numeric and geographically plausible for Jeddah (lat ~21.1-21.95, lng ~38.9-39.45)
for (const b of branches) {
  const { latitude, longitude } = b.location || {};
  if (latitude != null || longitude != null) {
    assert.ok(typeof latitude === 'number' && latitude >= 21.1 && latitude <= 21.95, `Latitude ${latitude} out of Jeddah bounds for ${b.brand_name} - ${b.branch_name}`);
    assert.ok(typeof longitude === 'number' && longitude >= 38.9 && longitude <= 39.45, `Longitude ${longitude} out of Jeddah bounds for ${b.brand_name} - ${b.branch_name}`);
  }
}
pass('All assigned coordinates fall within the verified Jeddah geographical bounding box');

// 7. No partial coordinate pairs
for (const b of branches) {
  const { latitude, longitude } = b.location || {};
  assert.ok((latitude == null && longitude == null) || (latitude != null && longitude != null), `Partial coordinate pair detected for ${b.brand_name} - ${b.branch_name}`);
}
pass('No partial coordinate pairs detected in dataset');

// 8. Ratings numeric and in [0.0, 5.0]
for (const b of branches) {
  const rating = b.google_reputation?.rating;
  if (rating != null) {
    assert.ok(typeof rating === 'number' && rating >= 0 && rating <= 5.0, `Invalid rating ${rating} for ${b.brand_name} - ${b.branch_name}`);
  }
}
pass('All reputation ratings are numeric and within 0.0 to 5.0');

// 9. Review counts integers >= 0
for (const b of branches) {
  const count = b.google_reputation?.review_count;
  if (count != null) {
    assert.ok(Number.isInteger(count) && count >= 0, `Review count ${count} must be non-negative integer for ${b.brand_name} - ${b.branch_name}`);
  }
}
pass('All review counts are valid non-negative integers');

// 10. Rating/review values belong to same record
for (const b of branches) {
  const { rating, review_count } = b.google_reputation || {};
  assert.ok((rating == null && review_count == null) || (rating != null && review_count != null), `Rating and review count must be paired for ${b.brand_name} - ${b.branch_name}`);
}
pass('Rating and review count fields are strictly paired across all branches');

// 11. Google Maps URLs are genuine URLs
for (const b of branches) {
  const url = b.google_identity?.google_maps_url;
  if (url != null) {
    assert.doesNotThrow(() => {
      const parsed = new URL(url);
      assert.ok(parsed.protocol === 'https:' || parsed.protocol === 'http:', 'URL must be http/https');
      assert.ok(parsed.hostname.includes('google.com') || parsed.hostname.includes('goo.gl'), 'URL host must be Google');
    }, `Invalid Google Maps URL ${url} for ${b.brand_name} - ${b.branch_name}`);
  }
}
pass('All Google Maps URLs are genuine and well-formed Google URLs');

// 12. Required enumeration values are valid
for (const b of branches) {
  assert.ok(VALID_GOOGLE_IDENTITY_STATUS.has(b.google_identity?.status), `Invalid google_identity.status: ${b.google_identity?.status}`);
  assert.ok(VALID_IDENTITY_CONFIDENCE.has(b.google_identity?.identity_confidence), `Invalid identity_confidence: ${b.google_identity?.identity_confidence}`);
  assert.ok(VALID_COORDINATE_SOURCE.has(b.location?.coordinate_source), `Invalid coordinate_source: ${b.location?.coordinate_source}`);
  assert.ok(VALID_COORDINATE_CONFIDENCE.has(b.location?.coordinate_confidence), `Invalid coordinate_confidence: ${b.location?.coordinate_confidence}`);
  assert.ok(VALID_REPUTATION_SOURCE.has(b.google_reputation?.source), `Invalid google_reputation.source: ${b.google_reputation?.source}`);
  assert.ok(VALID_BUSINESS_STATUS_SOURCE.has(b.business_status?.source), `Invalid business_status.source: ${b.business_status?.source}`);
  assert.ok(VALID_BUSINESS_STATUS_VALS.has(b.business_status?.status), `Invalid business_status.status: ${b.business_status?.status}`);
  assert.ok(VALID_RECONCILIATION_ACTIONS.has(b.branch_reconciliation?.action), `Invalid branch_reconciliation.action: ${b.branch_reconciliation?.action}`);
  if (b.location?.district_normalized != null) {
    assert.ok(CANONICAL_DISTRICTS.has(b.location.district_normalized), `district_normalized ${b.location.district_normalized} must be in canonical 26 districts`);
  }
}
pass('All enumeration values and normalized districts comply with specification');

// 13. Mandatory score calculation is correct for each branch
for (const b of branches) {
  const gaps = [];
  if (!b.google_identity?.google_place_id) gaps.push('google_place_id');
  if (!b.google_identity?.google_maps_url) gaps.push('google_maps_url');
  if (b.location?.latitude == null) gaps.push('latitude');
  if (b.location?.longitude == null) gaps.push('longitude');
  if (!b.location?.formatted_address) gaps.push('formatted_address');
  if (!b.location?.district_normalized || !CANONICAL_DISTRICTS.has(b.location.district_normalized)) gaps.push('district_normalized');
  if (b.google_reputation?.rating == null) gaps.push('google_rating');
  if (b.google_reputation?.review_count == null) gaps.push('google_review_count');
  if (!b.business_status?.status) gaps.push('business_status');
  if (b.google_identity?.status !== 'verified') gaps.push('exact_google_identity_verified');

  const expectedCompleted = 10 - gaps.length;
  const expectedPct = expectedCompleted * 10;
  assert.strictEqual(b.mandatory_completion.completed_fields, expectedCompleted, `Completed fields mismatch for ${b.brand_name} - ${b.branch_name}`);
  assert.strictEqual(b.mandatory_completion.total_fields, 10, 'Total fields per branch must be 10');
  assert.strictEqual(b.mandatory_completion.percentage, expectedPct, `Percentage mismatch for ${b.brand_name} - ${b.branch_name}`);
  assert.deepStrictEqual(b.remaining_mandatory_gaps, gaps, `Gaps mismatch for ${b.brand_name} - ${b.branch_name}`);
}
pass('Mandatory score calculations and gap tracking are mathematically verified per branch');

// 14. Overall score calculation is correct
const totalScore = branches.reduce((sum, b) => sum + b.mandatory_completion.completed_fields, 0);
const maxPossibleScore = 370;
const overallPct = ((totalScore / maxPossibleScore) * 100).toFixed(2);
assert.ok(totalScore >= 340, `Total score ${totalScore} is unexpectedly low`);
console.log(`      -> Actual Total Points: ${totalScore} / ${maxPossibleScore} (${overallPct}%)`);
pass(`Overall score calculation matches branch sum: ${totalScore} / ${maxPossibleScore} (${overallPct}%)`);

// 15. No API key appears anywhere in tracked files or git diff
const gitTrackedFiles = execSync('git ls-files', { encoding: 'utf8', cwd: rootDir }).trim().split('\n').map(s => s.trim()).filter(Boolean);
const apiKeyRegex = /AIzaSy[A-Za-z0-9_-]{33}/;

for (const relFile of gitTrackedFiles) {
  const fullPath = path.join(rootDir, relFile);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    if (/\.(png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot)$/i.test(relFile)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.ok(!apiKeyRegex.test(content), `CRITICAL SECURITY VIOLATION: API Key found in tracked file ${relFile}`);
  }
}

const gitDiff = execSync('git diff', { encoding: 'utf8', cwd: rootDir });
assert.ok(!apiKeyRegex.test(gitDiff), 'CRITICAL SECURITY VIOLATION: API Key found in git diff');
pass('Secret scan: Zero Google Maps API keys detected in git tracked files or working tree diff');

// 16. No new restaurant brands were introduced
for (const b of branches) {
  assert.ok(APPROVED_BRANDS.has(b.brand_name), `Unknown restaurant brand ${b.brand_name} introduced`);
}
assert.strictEqual(new Set(branches.map(b => b.brand_name)).size, 10, 'Must contain all 10 approved brands');
pass('Exactly 10 approved brands present; no unauthorized brands introduced');

// 17. No delivery-area-only physical branches were introduced
const forbiddenDeliveryKeywords = ['islamic seaport', 'seaport', 'delivery', 'dark kitchen', 'cloud kitchen'];
for (const b of branches) {
  const nameLower = b.branch_name.toLowerCase();
  for (const kw of forbiddenDeliveryKeywords) {
    assert.ok(!nameLower.includes(kw), `Delivery-only candidate found in canonical branches: ${b.brand_name} - ${b.branch_name}`);
  }
}
pass('No delivery-area-only service labels or phantom kitchens treated as physical branches');

// 18. Red Sea Mall Place ID is restaurant-specific
const centuryRedSeaMall = branches.find(b => b.brand_name === 'Century Burger' && b.branch_name === 'Red Sea Mall');
assert.ok(centuryRedSeaMall, 'Century Burger Red Sea Mall branch must exist');
assert.strictEqual(centuryRedSeaMall.google_identity.google_place_id, 'ChIJ97vtaM3bwxUR3mbHQZ9pzTA', 'Century Burger Red Sea Mall must use restaurant-specific Place ID');
pass('Century Burger Red Sea Mall Place ID is confirmed restaurant-specific');

// 19. KAIA Place ID is restaurant-specific
const centuryKaia = branches.find(b => b.brand_name === 'Century Burger' && b.branch_name === 'King Abdulaziz International Airport');
assert.ok(centuryKaia, 'Century Burger KAIA branch must exist');
assert.strictEqual(centuryKaia.google_identity.google_place_id, 'ChIJXw7KLmbXwxURRPeNM_tNTsU', 'Century Burger KAIA must use restaurant-specific Place ID');
pass('Century Burger KAIA Place ID is confirmed restaurant-specific');

// 20. Section-B reconciliation is explicit
const sectionBBranches = branches.filter(b => b.brand_name === 'Section-B');
assert.strictEqual(sectionBBranches.length, 6, 'Section-B must contain exactly 6 approved branches');
const sSquare = sectionBBranches.find(b => b.branch_name === 'S Square');
const tahlia = sectionBBranches.find(b => b.branch_name === 'Tahlia');
const hiraa = sectionBBranches.find(b => b.branch_name === 'Hiraa');
assert.ok(sSquare && tahlia && hiraa, 'Section-B must include S Square, Tahlia, and Hiraa');
assert.notStrictEqual(sSquare.google_identity.google_place_id, tahlia.google_identity.google_place_id, 'S Square and Tahlia must have distinct Place IDs');
assert.notStrictEqual(sSquare.google_identity.google_place_id, hiraa.google_identity.google_place_id, 'S Square and Hiraa must have distinct Place IDs');
assert.ok(sSquare.branch_reconciliation.reason.length > 0, 'S Square reconciliation reason must be explicit');
assert.ok(tahlia.branch_reconciliation.reason.length > 0, 'Tahlia reconciliation reason must be explicit');
pass('Section-B reconciliation is explicit: S Square, Tahlia, and Hiraa are distinct physical locations');

console.log('\n======================================================');
console.log('ALL 20 JEDDAH BURGER GOOGLE PLACES VALIDATIONS PASSED');
console.log('======================================================\n');
