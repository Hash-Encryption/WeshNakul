import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// 1. Load Corrected JSON
const jsonRaw = JSON.parse(fs.readFileSync('docs/research/jeddah-saudi-rice-kabsa-pass-d-corrected.json', 'utf8'));

// 2. Load Migration SQL and parse payload
const sql = fs.readFileSync('supabase/migrations/20260926000400_jeddah_saudi_rice_kabsa_catalog.sql', 'utf8');
const startTag = 'INSERT INTO _saudi_rice_catalog(payload) VALUES ($catalog$';
const endTag = '$catalog$::jsonb);';
const start = sql.indexOf(startTag);
const end = sql.indexOf(endTag, start);
if (start === -1 || end === -1) {
  console.error('Delimiters not found!');
  process.exit(1);
}
const sqlCatalog = JSON.parse(sql.substring(start + startTag.length, end));

// 3. Setup PGlite to read Local DB state
const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const { PGlite } = await import(pathToFileURL(runtime).href);
const db = new PGlite();
const migration = file => fs.readFileSync(`supabase/migrations/${file}`, 'utf8').replace(/^\uFEFF/, '');

await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');
const baseMigrations = [
  '20260902_initial_schema.sql', '002_food_consensus.sql', '003_restaurant_swipes.sql',
  '005_create_and_seed_restaurants.sql', '006_squad_order_scratchpad.sql', '007_room_expiration_and_cleanup.sql',
  '20260908000100_restaurant_intelligence.sql', '20260908000200_restaurant_legacy_provenance.sql', '20260908000300_room_host_coordinates.sql',
  '20260909000100_private_restaurant_decks.sql', '20260909000200_private_participant_sessions.sql', '20260910000100_jeddah_geography_intelligence.sql',
  '20260911000100_jeddah_burger_google_verified_catalog.sql', '20260911000200_remove_legacy_public_room_coordinates.sql',
  '20260911000300_phase3_authoritative_consensus.sql', '20260912000100_allow_voting_stage_joins.sql',
  '20260913000100_decision_game_and_tie_corrections.sql', '20260916000100_global_fair_draw_and_immediate_flow.sql'
];
for (const f of baseMigrations) {
  await db.exec(migration(f).replace('create extension if not exists "pgcrypto";', ''));
}
await db.exec(migration('20260917000100_harden_global_fair_draw.sql').replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '').replace(/DO \$\$[\s\S]*?END \$\$;/m, ''));
await db.exec(`CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea LANGUAGE sql VOLATILE AS $$ SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex') $$;`);
for (const f of ['20260918000100_room_modes_preferences_and_suggestions.sql', '20260919000100_clean_food_categories.sql']) {
  await db.exec(migration(f));
}
await db.exec(migration('20260919000200_repair_secure_fair_draw.sql').replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '').replace('DROP FUNCTION IF EXISTS public.gen_random_bytes(int);', '').replace(/DO \$\$[\s\S]*?END \$\$;/m, ''));
await db.exec(`CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea LANGUAGE sql VOLATILE AS $$ SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex') $$;`);
await db.exec(migration('20260926000100_expand_jeddah_geography_30_districts.sql'));
await db.exec(migration('20260926000200_jeddah_broast_fried_chicken_catalog.sql'));
await db.exec(migration('20260926000300_jeddah_shawarma_catalog.sql'));
await db.exec(migration('20260926000400_jeddah_saudi_rice_kabsa_catalog.sql'));

console.log('=== STEP 1: AUDIT OF 16 BRANDS AND PRODUCTION BRANCH COUNTS ===');

const saudiRiceBrandIds = [
  'raydan', 'al_romansiah', 'al_saddah', 'almazaq_al_bukhari',
  'hashi_basha', 'eleyk_al_bukhari', 'kabset_elham', 'sarmad',
  'labbani_fakher', 'mandi_world', 'hashi_bin_hamoud', 'fnoon_al_shawaya',
  'ali_hanash', 'ghamim', 'mandi_al_hejaz', 'al_shadawi_ras_al_mandi'
];

const brandCounts = [];
let totalJsonBranches = 0;
let totalMigBranches = 0;
let totalDbBranches = 0;

for (const bId of saudiRiceBrandIds) {
  const jBrand = jsonRaw.brands.find(b => b.id === bId);
  const mBrand = sqlCatalog.brands.find(b => b.brand_id === bId);
  const dbRows = (await db.query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id = '${bId}'`)).rows[0].n;

  const jCount = jBrand ? (jBrand.branches || []).length : 0;
  const mCount = mBrand ? (mBrand.branches || []).length : 0;
  totalJsonBranches += jCount;
  totalMigBranches += mCount;
  totalDbBranches += dbRows;

  brandCounts.push({
    brandId: bId,
    canonicalName: jBrand?.canonical_name,
    jsonCount: jCount,
    migCount: mCount,
    dbCount: dbRows,
    match: (jCount === mCount && mCount === dbRows)
  });
}

console.table(brandCounts);
console.log(`Totals -> Corrected JSON: ${totalJsonBranches} | Migration SQL: ${totalMigBranches} | Local DB: ${totalDbBranches}`);

console.log('\n=== STEP 2: ALL 45 BRANCHES IN CORRECTED JSON (AUTHORITATIVE ORDER) ===');
const jsonBranches = [];
for (const b of jsonRaw.brands) {
  for (const br of (b.branches || [])) {
    jsonBranches.push({
      brandId: b.id,
      brandName: b.canonical_name,
      branchName: br.branch_name,
      canonicalDistrict: br.canonical_district,
      rawDistrict: br.raw_district,
      placeId: br.google_place_id,
      rating: br.google_rating,
      reviews: br.google_review_count,
      lat: br.latitude,
      lng: br.longitude,
      address: br.formatted_address,
      mapsUrl: br.google_maps_url,
      notes: br.geographic_notes,
      status: br.operating_status,
      eligibility: br.production_eligibility
    });
  }
}

jsonBranches.forEach((b, i) => {
  console.log(
    `${String(i + 1).padStart(2)}: [${b.brandId}] ${b.branchName.padEnd(28)} | District: ${(b.canonicalDistrict || 'NULL (' + b.rawDistrict + ')').padEnd(25)} | Place ID: ${b.placeId}`
  );
});

console.log('\n=== STEP 3: COMPARISON JSON vs MIGRATION vs LOCAL DB FOR ALL 45 BRANCHES ===');
let mismatches = 0;
for (let i = 0; i < jsonBranches.length; i++) {
  const jb = jsonBranches[i];
  
  // Find in SQL catalog
  const mBrand = sqlCatalog.brands.find(b => b.brand_id === jb.brandId);
  const mb = mBrand?.branches.find(b => b.google_place_id === jb.placeId);
  
  // Find in DB
  const dbRow = (await db.query(`
    SELECT * FROM restaurant_branches WHERE google_place_id = '${jb.placeId}'
  `)).rows[0];

  if (!mb) {
    console.error(`MISMATCH: Branch ${jb.placeId} (${jb.brandId} - ${jb.branchName}) missing in Migration SQL!`);
    mismatches++;
    continue;
  }
  if (!dbRow) {
    console.error(`MISMATCH: Branch ${jb.placeId} (${jb.brandId} - ${jb.branchName}) missing in Local DB!`);
    mismatches++;
    continue;
  }

  // Check field equality across all 3
  if (mb.restaurant_id !== jb.brandId || dbRow.restaurant_id !== jb.brandId) {
    console.error(`MISMATCH on restaurant_id for ${jb.placeId}`);
    mismatches++;
  }
  if (mb.branch_name_en !== jb.branchName || dbRow.branch_name_en !== jb.branchName) {
    console.error(`MISMATCH on branch_name for ${jb.placeId}: JSON="${jb.branchName}", SQL="${mb.branch_name_en}", DB="${dbRow.branch_name_en}"`);
    mismatches++;
  }
  if (mb.google_maps_url !== jb.mapsUrl || dbRow.google_maps_url !== jb.mapsUrl) {
    console.error(`MISMATCH on mapsUrl for ${jb.placeId}`);
    mismatches++;
  }
  if (Math.abs(mb.latitude - jb.lat) > 0.00001 || Math.abs(dbRow.latitude - jb.lat) > 0.00001) {
    console.error(`MISMATCH on latitude for ${jb.placeId}`);
    mismatches++;
  }
  if (Math.abs(mb.longitude - jb.lng) > 0.00001 || Math.abs(dbRow.longitude - jb.lng) > 0.00001) {
    console.error(`MISMATCH on longitude for ${jb.placeId}`);
    mismatches++;
  }
  const expectedDist = jb.canonicalDistrict || null;
  if (mb.district !== expectedDist || dbRow.district !== expectedDist) {
    console.error(`MISMATCH on district for ${jb.placeId}: JSON="${expectedDist}", SQL="${mb.district}", DB="${dbRow.district}"`);
    mismatches++;
  }
  if (mb.google_rating !== jb.rating || Number(dbRow.google_rating) !== jb.rating) {
    console.error(`MISMATCH on rating for ${jb.placeId}: JSON=${jb.rating}, SQL=${mb.google_rating}, DB=${dbRow.google_rating}`);
    mismatches++;
  }
  if (mb.google_review_count !== jb.reviews || dbRow.google_review_count !== jb.reviews) {
    console.error(`MISMATCH on review_count for ${jb.placeId}: JSON=${jb.reviews}, SQL=${mb.google_review_count}, DB=${dbRow.google_review_count}`);
    mismatches++;
  }
}
console.log(`Total 3-Layer Mismatches: ${mismatches}`);

console.log('\n=== STEP 4: AUTHORITATIVE 14 NULL-DISTRICT CAUTION BRANCHES ===');
const cautionBranches = jsonBranches.filter(b => b.canonicalDistrict === null);
console.log(`Found exactly ${cautionBranches.length} caution branches:`);
cautionBranches.forEach((cb, idx) => {
  console.log(`${idx + 1}. [${cb.brandId}] ${cb.branchName} (Raw: ${cb.rawDistrict})`);
  console.log(`   Place ID: ${cb.placeId}`);
  console.log(`   Coords:   (${cb.lat}, ${cb.lng})`);
  console.log(`   Address:  ${cb.address}`);
  console.log(`   Notes:    ${cb.notes}`);
});

await db.close();
