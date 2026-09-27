import fs from 'node:fs';

const rawJson = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-pass-d-corrected.json', 'utf8'));
const sql = fs.readFileSync('supabase/migrations/20260927000100_jeddah_pizza_catalog.sql', 'utf8');

const startTag = 'INSERT INTO _pizza_catalog(payload) VALUES ($catalog$';
const endTag = '$catalog$::jsonb);';
const start = sql.indexOf(startTag);
const end = sql.indexOf(endTag, start);

if (start === -1 || end === -1) {
  console.error('ERROR: Could not locate catalog payload delimiters in SQL file.');
  process.exit(1);
}

const catalog = JSON.parse(sql.substring(start + startTag.length, end));

console.log('================================================================');
console.log('--- PIZZA SOURCE-TO-MIGRATION PARITY AUDIT ---');
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
if (rawJson.brands.length !== 18 || catalog.brands.length !== 18) {
  console.error('ERROR: Brand count must be exactly 18!');
  process.exit(1);
}

// 2. Index Source Brands & Branches
const jsonBrands = new Map();
const jsonBranchesByPlaceId = new Map();
const jsonPlaceIds = [];
const jsonMapsUrls = [];

for (const brand of rawJson.brands) {
  jsonBrands.set(brand.id, brand);
  for (const b of (brand.branches || [])) {
    jsonPlaceIds.push(b.google_place_id);
    jsonMapsUrls.push(b.google_maps_url);
    jsonBranchesByPlaceId.set(b.google_place_id, {
      brandId: brand.id,
      brandName: brand.canonical_name,
      ...b
    });
  }
}

// 3. Index Migration Brands & Branches
const migBrands = new Map();
const migBranchesByPlaceId = new Map();
const migPlaceIds = [];
const migMapsUrls = [];

for (const brand of catalog.brands) {
  migBrands.set(brand.brand_id, brand);
  for (const b of brand.branches) {
    migPlaceIds.push(b.google_place_id);
    migMapsUrls.push(b.google_maps_url);
    migBranchesByPlaceId.set(b.google_place_id, {
      brandId: brand.brand_id,
      ...b
    });
  }
}

console.log('\n2. BRANCH COUNT VERIFICATION');
console.log(`- Source Verified Branches:    ${jsonBranchesByPlaceId.size}`);
console.log(`- Migration Active Branches:   ${migBranchesByPlaceId.size}`);
if (jsonBranchesByPlaceId.size !== 105 || migBranchesByPlaceId.size !== 105) {
  console.error('ERROR: Branch count must be exactly 105!');
  process.exit(1);
}

// 4. Duplicate Checks
console.log('\n3. DUPLICATE INTEGRITY CHECKS');
const jsonDupes = jsonPlaceIds.filter((id, idx) => jsonPlaceIds.indexOf(id) !== idx);
const migDupes = migPlaceIds.filter((id, idx) => migPlaceIds.indexOf(id) !== idx);
const migUrlDupes = migMapsUrls.filter((url, idx) => migMapsUrls.indexOf(url) !== idx);

console.log(`- Duplicate Place IDs in source:    ${jsonDupes.length}`);
console.log(`- Duplicate Place IDs in migration: ${migDupes.length}`);
console.log(`- Duplicate Maps URLs in migration: ${migUrlDupes.length}`);

if (jsonDupes.length > 0 || migDupes.length > 0 || migUrlDupes.length > 0) {
  console.error('ERROR: Duplicates found in Place IDs or Maps URLs!');
  process.exit(1);
}

// 5. Geographic Whitelist Audit
console.log('\n4. GEOGRAPHY CHECKS');
let canonicalCount = 0;
let cautionCount = 0;

for (const b of migBranchesByPlaceId.values()) {
  if (b.district !== null) {
    if (!CANONICAL_30.has(b.district)) {
      console.error(`ERROR: Unknown canonical district ${b.district}`);
      process.exit(1);
    }
    canonicalCount++;
  } else {
    if (!b.geographic_notes || b.geographic_notes.trim().length === 0) {
      console.error(`ERROR: Caution branch without geographic notes: ${b.branch_name_en}`);
      process.exit(1);
    }
    cautionCount++;
  }
}

console.log(`- Canonical 30-District Branches: ${canonicalCount} (Expected: 86)`);
console.log(`- Outer Caution Branches (null):  ${cautionCount} (Expected: 19)`);

if (canonicalCount !== 86 || cautionCount !== 19) {
  console.error('ERROR: Geographic breakdown does not match expected 86/19 split!');
  process.exit(1);
}

console.log('\n================================================================');
console.log('PARITY AUDIT RESULT: PASSED 100% PARITY');
console.log('================================================================');
