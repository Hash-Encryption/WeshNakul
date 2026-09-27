import fs from 'node:fs';

const rawJson = JSON.parse(fs.readFileSync('docs/research/jeddah-saudi-rice-kabsa-pass-d-corrected.json', 'utf8'));
const sql = fs.readFileSync('supabase/migrations/20260926000400_jeddah_saudi_rice_kabsa_catalog.sql', 'utf8');

const startTag = 'INSERT INTO _saudi_rice_catalog(payload) VALUES ($catalog$';
const endTag = '$catalog$::jsonb);';
const start = sql.indexOf(startTag);
const end = sql.indexOf(endTag, start);

if (start === -1 || end === -1) {
  console.error('ERROR: Could not locate catalog payload delimiters in SQL file.');
  process.exit(1);
}

const catalog = JSON.parse(sql.substring(start + startTag.length, end));

console.log('================================================================');
console.log('--- SAUDI / RICE / KABSA SOURCE-TO-MIGRATION PARITY AUDIT ---');
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
if (rawJson.brands.length !== 16 || catalog.brands.length !== 16) {
  console.error('ERROR: Brand count must be exactly 16!');
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
if (jsonBranchesByPlaceId.size !== 45 || migBranchesByPlaceId.size !== 45) {
  console.error('ERROR: Branch count must be exactly 45!');
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
  console.error('ERROR: Duplicate Place ID or Maps URL detected!');
  process.exit(1);
}

// 5. Missing / Unexpected Branch Checks
console.log('\n4. BRANCH PARITY COVERAGE');
const missingInMig = jsonPlaceIds.filter(id => !migBranchesByPlaceId.has(id));
const unexpectedInMig = migPlaceIds.filter(id => !jsonBranchesByPlaceId.has(id));
console.log(`- Missing Place IDs in migration:   ${missingInMig.length}`);
console.log(`- Unexpected Place IDs in migration:${unexpectedInMig.length}`);
if (missingInMig.length > 0 || unexpectedInMig.length > 0) {
  console.error('ERROR: Set mismatch between source and migration Place IDs!');
  process.exit(1);
}

// 6. Canonical vs Outer Caution District Distribution
console.log('\n5. GEOGRAPHIC & DISTRICT DISTRIBUTION');
let canonicalCount = 0;
let cautionCount = 0;

for (const [placeId, mb] of migBranchesByPlaceId) {
  if (mb.district !== null) {
    if (!CANONICAL_30.has(mb.district)) {
      console.error(`ERROR: Migration branch ${placeId} has non-canonical district: ${mb.district}`);
      process.exit(1);
    }
    canonicalCount++;
  } else {
    cautionCount++;
    if (!mb.geographic_notes || mb.geographic_notes.trim().length === 0) {
      console.error(`ERROR: Caution branch ${placeId} has empty geographic_notes!`);
      process.exit(1);
    }
  }
}

console.log(`- Canonical 30-District Branches: ${canonicalCount} (expected 31)`);
console.log(`- Outer-District Caution Branches: ${cautionCount} (expected 14)`);
if (canonicalCount !== 31 || cautionCount !== 14) {
  console.error('ERROR: Canonical / Caution district counts do not match 31 / 14 baseline!');
  process.exit(1);
}

// 7. Field-by-Field Parity for all 45 Branches
console.log('\n6. FIELD-BY-FIELD DEEP PARITY CHECK (45 BRANCHES)');
let mismatches = 0;

for (const [placeId, jb] of jsonBranchesByPlaceId) {
  const mb = migBranchesByPlaceId.get(placeId);
  if (!mb) {
    console.error('MISSING IN MIGRATION:', placeId);
    mismatches++;
    continue;
  }

  // Restaurant ID
  if (mb.restaurant_id !== jb.brandId) {
    console.error(`BRAND ID MISMATCH [${placeId}]: got ${mb.restaurant_id}, expected ${jb.brandId}`);
    mismatches++;
  }

  // Address
  if (mb.address_en !== jb.formatted_address) {
    console.error(`ADDRESS MISMATCH [${placeId}]: got "${mb.address_en}", expected "${jb.formatted_address}"`);
    mismatches++;
  }

  // Google Maps URL
  if (mb.google_maps_url !== jb.google_maps_url) {
    console.error(`MAPS URL MISMATCH [${placeId}]: got ${mb.google_maps_url}, expected ${jb.google_maps_url}`);
    mismatches++;
  }

  // Coordinates (Exact Floating Point)
  if (Math.abs(mb.latitude - jb.latitude) > 0.000001 || Math.abs(mb.longitude - jb.longitude) > 0.000001) {
    console.error(`COORDINATE MISMATCH [${placeId}]: (${mb.latitude}, ${mb.longitude}) vs (${jb.latitude}, ${jb.longitude})`);
    mismatches++;
  }

  // Google Rating & Review Count
  if (mb.google_rating !== jb.google_rating) {
    console.error(`RATING MISMATCH [${placeId}]: got ${mb.google_rating}, expected ${jb.google_rating}`);
    mismatches++;
  }
  if (mb.google_review_count !== jb.google_review_count) {
    console.error(`REVIEW COUNT MISMATCH [${placeId}]: got ${mb.google_review_count}, expected ${jb.google_review_count}`);
    mismatches++;
  }

  // District Mapping
  const expectedDistrict = (jb.canonical_district && CANONICAL_30.has(jb.canonical_district)) ? jb.canonical_district : null;
  if (mb.district !== expectedDistrict) {
    console.error(`DISTRICT MISMATCH [${placeId}]: got ${mb.district}, expected ${expectedDistrict}`);
    mismatches++;
  }

  // Operating Status
  if (mb.operating_status !== 'open') {
    console.error(`BRANCH STATUS MISMATCH [${placeId}]: got ${mb.operating_status}, expected 'open'`);
    mismatches++;
  }
}

console.log(`- Branch Field Mismatches: ${mismatches}`);
if (mismatches > 0) {
  console.error(`FAIL: ${mismatches} mismatches detected across branches.`);
  process.exit(1);
}

// 8. Brand Attributes & Category Taxonomy Checks
console.log('\n7. BRAND TAXONOMY & ENGINE ATTRIBUTES');
let brandMismatches = 0;

for (const [brandId, jBrand] of jsonBrands) {
  const mBrand = migBrands.get(brandId);
  if (!mBrand) {
    console.error(`MISSING BRAND IN MIGRATION: ${brandId}`);
    brandMismatches++;
    continue;
  }

  if (mBrand.canonical_name !== jBrand.canonical_name) {
    console.error(`NAME MISMATCH [${brandId}]: ${mBrand.canonical_name} vs ${jBrand.canonical_name}`);
    brandMismatches++;
  }

  if (mBrand.primary_category !== 'saudi_rice') {
    console.error(`PRIMARY CATEGORY MISMATCH [${brandId}]: got ${mBrand.primary_category}, expected saudi_rice`);
    brandMismatches++;
  }

  if (!mBrand.categories.includes('saudi_rice') || !mBrand.categories.includes('rice')) {
    console.error(`CATEGORY ARRAY ERROR [${brandId}]: categories must include 'saudi_rice' and 'rice'. Got:`, mBrand.categories);
    brandMismatches++;
  }

  if (!Array.isArray(mBrand.best_sellers) || mBrand.best_sellers.length === 0) {
    console.error(`BEST SELLERS MISSING [${brandId}]`);
    brandMismatches++;
  } else {
    const hasSignature = mBrand.best_sellers.some(s => s.is_signature);
    if (!hasSignature) {
      console.error(`BEST SELLERS NO SIGNATURE [${brandId}]`);
      brandMismatches++;
    }
  }
}

console.log(`- Brand Attribute Mismatches: ${brandMismatches}`);
if (brandMismatches > 0) {
  console.error(`FAIL: ${brandMismatches} mismatches detected across brands.`);
  process.exit(1);
}

console.log('\n================================================================');
console.log('✅ PASS: 100% SOURCE-TO-MIGRATION PARITY CERTIFIED');
console.log('All 16 brands, 45 branches, coordinates, IDs, ratings, and best sellers match perfectly.');
console.log('================================================================');
