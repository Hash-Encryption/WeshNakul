import fs from 'node:fs';

const rawJson = JSON.parse(fs.readFileSync('docs/research/jeddah-broast-pass-d-corrected.json', 'utf8'));
const sql = fs.readFileSync('supabase/migrations/20260926000200_jeddah_broast_fried_chicken_catalog.sql', 'utf8');

const startTag = 'INSERT INTO _broast_catalog(payload) VALUES ($catalog$';
const endTag = '$catalog$::jsonb);';
const start = sql.indexOf(startTag);
const end = sql.indexOf(endTag, start);
const catalog = JSON.parse(sql.substring(start + startTag.length, end));

console.log('Comparing all 75 branches...');
const BRAND_MAP = {
  'ALBAIK': 'albaik',
  'Raising Cane\'s': 'raising_canes',
  'KFC': 'kfc',
  'Texas Chicken': 'texas_chicken',
  'Popeyes': 'popeyes',
  'Dave\'s Hot Chicken': 'daves_hot_chicken',
  'TNDR': 'tndr',
  'Wingstop': 'wingstop',
  'Crusted': 'crusted',
  'Crisper': 'crisper',
  'Dabboos': 'dabboos',
  'Sayakh': 'sayakh',
  'Nashville\'s Hot Chicken': 'nashvilles_hot_chicken',
  'Tenders Cart': 'tenders_cart',
  'Rami Broast': 'rami_broast',
  'Chicken Mubeen': 'chicken_mubeen',
  'Ktaykit': 'ktaykit',
  'Al Najah Broast': 'al_najah_broast',
  'Broast Hanoo': 'broast_hanoo'
};

const jsonBranchesByPlaceId = new Map();
for (const brand of rawJson.brands) {
  for (const b of brand.branches) {
    jsonBranchesByPlaceId.set(b.google_place_id, {
      expectedBrandId: BRAND_MAP[brand.canonical_name],
      brandName: brand.canonical_name,
      ...b
    });
  }
}

const migBranchesByPlaceId = new Map();
for (const brand of catalog.brands) {
  for (const b of brand.branches) {
    migBranchesByPlaceId.set(b.google_place_id, {
      brandId: brand.brand_id,
      ...b
    });
  }
}

let mismatches = 0;
for (const [placeId, jb] of jsonBranchesByPlaceId) {
  const mb = migBranchesByPlaceId.get(placeId);
  if (!mb) {
    console.error('MISSING IN MIGRATION:', placeId, jb.brandName, jb.branch_name);
    mismatches++;
    continue;
  }
  if (mb.restaurant_id !== jb.expectedBrandId) {
    console.error('BRAND MISMATCH:', placeId, mb.restaurant_id, 'vs', jb.expectedBrandId);
    mismatches++;
  }
  if (mb.branch_name_en !== jb.branch_name) {
    console.error('NAME MISMATCH:', placeId, mb.branch_name_en, 'vs', jb.branch_name);
    mismatches++;
  }
  if (mb.district !== jb.canonical_district) {
    console.error('DISTRICT MISMATCH:', placeId, mb.district, 'vs', jb.canonical_district);
    mismatches++;
  }
  if (mb.address_en !== jb.formatted_address) {
    console.error('ADDRESS MISMATCH:', placeId, mb.address_en, 'vs', jb.formatted_address);
    mismatches++;
  }
  if (mb.latitude !== jb.latitude || mb.longitude !== jb.longitude) {
    console.error('COORDINATES MISMATCH:', placeId, mb.latitude, jb.latitude, mb.longitude, jb.longitude);
    mismatches++;
  }
  if (mb.production_branch_status !== jb.production_branch_status) {
    console.error('STATUS MISMATCH:', placeId, mb.production_branch_status, 'vs', jb.production_branch_status);
    mismatches++;
  }
  if (mb.geographic_notes !== jb.manual_review_reason) {
    console.error('NOTES MISMATCH:', placeId, mb.geographic_notes, 'vs', jb.manual_review_reason);
    mismatches++;
  }
}

console.log('Total mismatches across all 75 branches:', mismatches);

// Verify ALBAIK and KFC representative branch sets match exactly
const albaikJsonBranches = rawJson.brands.find(b => b.canonical_name === 'ALBAIK').branches.map(b => b.google_place_id).sort();
const albaikMigBranches = catalog.brands.find(b => b.brand_id === 'albaik').branches.map(b => b.google_place_id).sort();
console.log('ALBAIK Place IDs match:', JSON.stringify(albaikJsonBranches) === JSON.stringify(albaikMigBranches), `(${albaikJsonBranches.length} branches)`);

const kfcJsonBranches = rawJson.brands.find(b => b.canonical_name === 'KFC').branches.map(b => b.google_place_id).sort();
const kfcMigBranches = catalog.brands.find(b => b.brand_id === 'kfc').branches.map(b => b.google_place_id).sort();
console.log('KFC Place IDs match:', JSON.stringify(kfcJsonBranches) === JSON.stringify(kfcMigBranches), `(${kfcJsonBranches.length} branches)`);
