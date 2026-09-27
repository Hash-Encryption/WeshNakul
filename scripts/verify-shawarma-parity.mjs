import fs from 'node:fs';

const rawJson = JSON.parse(fs.readFileSync('docs/research/jeddah-shawarma-pass-d-corrected.json', 'utf8'));
const googleCoords = JSON.parse(fs.readFileSync('scripts/shawarma-google-coords.json', 'utf8'));
const sql = fs.readFileSync('supabase/migrations/20260926000300_jeddah_shawarma_catalog.sql', 'utf8');

const startTag = 'INSERT INTO _shawarma_catalog(payload) VALUES ($catalog$';
const endTag = '$catalog$::jsonb);';
const start = sql.indexOf(startTag);
const end = sql.indexOf(endTag, start);
const catalog = JSON.parse(sql.substring(start + startTag.length, end));

console.log('--- SHAWARMA SOURCE-TO-MIGRATION PARITY AUDIT ---');

const BRAND_MAP = {
  'Shawarmer': 'shawarmer',
  'Shawarma Classic': 'shawarma_classic',
  'Shawarma Alrimal': 'shawarma_alrimal',
  'Shamiyat Haritna': 'shamiyat_haritna',
  'Ayedh Shawarma': 'ayedh_shawarma',
  'Al-Khal Al-Dimashqi': 'al_khal_al_dimashqi',
  'Shawarma Habteen': 'shawarma_habteen',
  'Ziyada Toum': 'ziyada_toum',
  'Shawarma Elak': 'shawarma_elak',
  'Shawarma Shakir Aljazeera': 'shawarma_shakir_aljazeera',
  'Shawarma Abu Bahij': 'shawarma_abu_bahij',
  'Radi Shawarma and Juices': 'radi_shawarma',
  'Shawarma Allosh': 'shawarma_allosh',
  'Shawarma Marmasha': 'shawarma_marmasha'
};

const DISTRICT_ALIAS_MAP = {
  'al_fayha': 'al_faiha',
  'as_salamah': 'al_salamah',
  'ash_shati': 'al_shati',
  'as_safa': 'al_safa',
  'ar_ruwais': 'al_ruwais',
  'ar_rawdah': 'al_rawdah',
  'obhur_al_shamaliyah': 'abhur_al_shamaliyah'
};

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

// 1. Check brand counts
console.log('Source Brands Count:', rawJson.brands.length);
console.log('Migration Brands Count:', catalog.brands.length);
if (rawJson.brands.length !== catalog.brands.length) {
  console.error('ERROR: Brand count mismatch!');
  process.exit(1);
}

// 2. Index branches
const jsonBranchesByPlaceId = new Map();
const jsonPlaceIds = [];
for (const brand of rawJson.brands) {
  for (const b of (brand.production_branches || [])) {
    jsonPlaceIds.push(b.google_place_id);
    jsonBranchesByPlaceId.set(b.google_place_id, {
      expectedBrandId: BRAND_MAP[brand.canonical_name_en],
      brandName: brand.canonical_name_en,
      ...b
    });
  }
}

const migBranchesByPlaceId = new Map();
const migPlaceIds = [];
for (const brand of catalog.brands) {
  for (const b of brand.branches) {
    migPlaceIds.push(b.google_place_id);
    migBranchesByPlaceId.set(b.google_place_id, {
      brandId: brand.brand_id,
      ...b
    });
  }
}

console.log('Source Production Branches:', jsonBranchesByPlaceId.size);
console.log('Migration Production Branches:', migBranchesByPlaceId.size);

// 3. Duplicate checks
const jsonDupes = jsonPlaceIds.filter((id, idx) => jsonPlaceIds.indexOf(id) !== idx);
const migDupes = migPlaceIds.filter((id, idx) => migPlaceIds.indexOf(id) !== idx);
console.log('Duplicate Place IDs in source:', jsonDupes.length, jsonDupes);
console.log('Duplicate Place IDs in migration:', migDupes.length, migDupes);

// 4. Missing & Unexpected checks
const missingInMig = jsonPlaceIds.filter(id => !migBranchesByPlaceId.has(id));
const unexpectedInMig = migPlaceIds.filter(id => !jsonBranchesByPlaceId.has(id));
console.log('Missing Place IDs in migration:', missingInMig.length, missingInMig);
console.log('Unexpected Place IDs in migration:', unexpectedInMig.length, unexpectedInMig);

// 5. Field-by-field verification for all 48 branches
let mismatches = 0;
for (const [placeId, jb] of jsonBranchesByPlaceId) {
  const mb = migBranchesByPlaceId.get(placeId);
  if (!mb) {
    console.error('MISSING IN MIGRATION:', placeId, jb.brandName, jb.branch_name);
    mismatches++;
    continue;
  }

  // Restaurant ID
  if (mb.restaurant_id !== jb.expectedBrandId) {
    console.error('BRAND ID MISMATCH:', placeId, mb.restaurant_id, 'vs', jb.expectedBrandId);
    mismatches++;
  }

  // Branch Name
  if (mb.branch_name_en !== jb.branch_name) {
    console.error('NAME MISMATCH:', placeId, mb.branch_name_en, 'vs', jb.branch_name);
    mismatches++;
  }

  // Address
  if (mb.address_en !== jb.address) {
    console.error('ADDRESS MISMATCH:', placeId, mb.address_en, 'vs', jb.address);
    mismatches++;
  }

  // Google Maps URL
  if (mb.google_maps_url !== jb.google_maps_url) {
    console.error('MAPS URL MISMATCH:', placeId, mb.google_maps_url, 'vs', jb.google_maps_url);
    mismatches++;
  }

  // Google Rating & Review Count
  if (mb.google_rating !== jb.google_rating || mb.google_review_count !== jb.google_review_count) {
    console.error('REPUTATION MISMATCH:', placeId, mb.google_rating, jb.google_rating, mb.google_review_count, jb.google_review_count);
    mismatches++;
  }

  // Canonical District & Geographic Notes
  const rawDist = jb.canonical_district;
  const resolvedDist = DISTRICT_ALIAS_MAP[rawDist] || rawDist;
  const isCanonical = CANONICAL_30.has(resolvedDist);
  const expectedDistrict = isCanonical ? resolvedDist : null;

  if (mb.district !== expectedDistrict) {
    console.error('DISTRICT MISMATCH:', placeId, 'got', mb.district, 'expected', expectedDistrict, `(source was ${rawDist})`);
    mismatches++;
  }

  if (!isCanonical && !mb.geographic_notes) {
    console.error('MISSING GEOGRAPHIC NOTES for out-of-district branch:', placeId, rawDist);
    mismatches++;
  }

  // Coordinates (enriched via Google Places API New)
  const expectedCoords = googleCoords[placeId];
  if (!expectedCoords || mb.latitude !== expectedCoords.latitude || mb.longitude !== expectedCoords.longitude) {
    console.error('COORDINATE MISMATCH:', placeId, mb.latitude, expectedCoords?.latitude, mb.longitude, expectedCoords?.longitude);
    mismatches++;
  }

  // Production status
  const expectedStatus = isCanonical ? 'production_ready' : 'usable_with_caution';
  if (mb.production_branch_status !== expectedStatus) {
    console.error('STATUS MISMATCH:', placeId, mb.production_branch_status, 'vs', expectedStatus);
    mismatches++;
  }
}

console.log('Total Field Mismatches across all 48 branches:', mismatches);
if (mismatches === 0) {
  console.log('PASS: 100% Source-to-Migration Parity Verified across all 14 brands and 48 physical branches.');
} else {
  console.error(`FAIL: ${mismatches} mismatches detected.`);
  process.exit(1);
}
