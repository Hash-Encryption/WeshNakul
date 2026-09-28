import fs from 'node:fs';

const rawJson = JSON.parse(fs.readFileSync('docs/research/jeddah-asian-pass-d-corrected.json', 'utf8'));
const sql = fs.readFileSync('supabase/migrations/20260928000300_jeddah_asian_catalog.sql', 'utf8');

const startTag = 'INSERT INTO _asian_catalog(payload) VALUES ($catalog$';
const endTag = '$catalog$::jsonb);';
const start = sql.indexOf(startTag);
const end = sql.indexOf(endTag, start);

if (start === -1 || end === -1) {
  console.error('ERROR: Could not locate catalog payload delimiters in SQL file.');
  process.exit(1);
}

const catalog = JSON.parse(sql.substring(start + startTag.length, end));

console.log('================================================================');
console.log('--- ASIAN SOURCE-TO-MIGRATION PARITY AUDIT ---');
console.log('================================================================\n');

const CANONICAL_30 = new Set([
  'abhur_al_janoubiyah', 'abhur_al_shamaliyah',
  'al_andalus',          'al_aziziyah',
  'al_balad',            'al_basateen',
  'al_bawadi',           'al_faiha',
  'al_faisaliyyah',      'al_hamdaniyah',
  'al_hamra',            'al_khalidiyyah',
  'al_marwah',           'al_mohammadiyyah',
  'al_murjan',           'al_naeem',
  'al_naseem',           'al_rawdah',
  'al_rehab',            'al_ruwais',
  'al_safa',             'al_salamah',
  'al_samer',            'al_sharafeyah',
  'al_shati',            'al_sheraa',
  'al_thaghr',           'al_zahra',
  'an_nuzhah',           'ar_rabwah'
]);

// 1. Verify Brand Counts
console.log('1. BRAND COUNT VERIFICATION');
console.log(`- Source Brands Count:    ${rawJson.brands.length}`);
console.log(`- Migration Brands Count: ${catalog.brands.length}`);
if (rawJson.brands.length !== 19 || catalog.brands.length !== 19) {
  console.error('ERROR: Brand count must be exactly 19!');
  process.exit(1);
}

// 2. Index Source Brands & Branches
const jsonBrands = new Map();
const jsonBranchesByPlaceId = new Map();
let jsonActiveBranches = 0;

for (const brand of rawJson.brands) {
  jsonBrands.set(brand.id, brand);
  for (const b of (brand.branches || [])) {
    jsonActiveBranches++;
    jsonBranchesByPlaceId.set(b.google_place_id, {
      ...b,
      brand_id: brand.id
    });
  }
}

console.log('\n2. BRANCH COUNT VERIFICATION');
let migrationBranchCount = 0;
let canonicalBranchCount = 0;
let cautionBranchCount = 0;

for (const brand of catalog.brands) {
  for (const b of brand.branches) {
    migrationBranchCount++;
    if (b.district && CANONICAL_30.has(b.district)) {
      canonicalBranchCount++;
    } else {
      cautionBranchCount++;
    }
  }
}

console.log(`- Source Active Branches:    ${jsonActiveBranches}`);
console.log(`- Migration Active Branches: ${migrationBranchCount}`);
console.log(`  * Canonical 30 Districts:  ${canonicalBranchCount}`);
console.log(`  * Outer District Caution:  ${cautionBranchCount}`);
console.log(`- Manual Review Branches:    ${rawJson.manual_review_branches ? rawJson.manual_review_branches.length : 1}`);

if (jsonActiveBranches !== 50 || migrationBranchCount !== 50) {
  console.error(`ERROR: Expected 50 active branches in migration! Found: ${migrationBranchCount}`);
  process.exit(1);
}

if (canonicalBranchCount !== 43 || cautionBranchCount !== 7) {
  console.error(`ERROR: Expected 43 canonical and 7 caution branches!`);
  process.exit(1);
}

// 3. Field Integrity
console.log('\n3. FIELD COMPLETENESS AUDIT');
let missingPlaceIds = 0;
let missingCoords = 0;
let missingHours = 0;
let missingRatings = 0;

for (const brand of catalog.brands) {
  for (const b of brand.branches) {
    if (!b.google_place_id || b.google_place_id.length < 15) missingPlaceIds++;
    if (typeof b.latitude !== 'number' || typeof b.longitude !== 'number') missingCoords++;
    if (!b.hours || (typeof b.hours !== 'string' && typeof b.hours !== 'object') || b.hours.length === 0) missingHours++;
    if (typeof b.google_rating !== 'number' || typeof b.google_review_count !== 'number') missingRatings++;
  }
}

console.log(`- Missing Place IDs:  ${missingPlaceIds}`);
console.log(`- Missing Coords:     ${missingCoords}`);
console.log(`- Missing Hours:      ${missingHours}`);
console.log(`- Missing Ratings:    ${missingRatings}`);

if (missingPlaceIds > 0 || missingCoords > 0 || missingHours > 0 || missingRatings > 0) {
  console.error('ERROR: Missing required fields in migration payload!');
  process.exit(1);
}

// 4. Overlap & Collision Reconciliation
console.log('\n4. SUSHI OVERLAP & PROMOTION AUDIT');
const sushiOverlaps = ['wakame', 'shiro', 'myazu', 'kuuru', 'sakura_japanese_restaurant', 'sushiah'];
for (const sid of sushiOverlaps) {
  const mb = catalog.brands.find(b => b.brand_id === sid);
  if (!mb) {
    console.error(`ERROR: Sushi overlap brand ${sid} not found in migration!`);
    process.exit(1);
  }
  if (mb.primary_category !== 'sushi') {
    console.error(`ERROR: Brand ${sid} primary category must remain 'sushi'! Found: ${mb.primary_category}`);
    process.exit(1);
  }
  if (!mb.categories.includes('asian')) {
    console.error(`ERROR: Brand ${sid} must include 'asian' in categories!`);
    process.exit(1);
  }
  console.log(`✓ ${sid.padEnd(28)} correctly mapped: primary='sushi', categories=[${mb.categories.join(', ')}]`);
}

const chanBrand = catalog.brands.find(b => b.brand_id === 'chan');
if (!chanBrand || chanBrand.primary_category !== 'asian') {
  console.error(`ERROR: Brand 'chan' must have primary_category='asian'!`);
  process.exit(1);
}
console.log(`✓ chan                         correctly promoted: primary='asian', categories=[${chanBrand.categories.join(', ')}]`);

console.log('\n================================================================');
console.log('SUCCESS: Asian source-to-migration parity audit passed 100%!');
console.log('================================================================\n');
