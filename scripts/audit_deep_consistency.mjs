import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// 1. Load Corrected JSON
const jsonRaw = JSON.parse(fs.readFileSync('docs/research/jeddah-saudi-rice-kabsa-pass-d-corrected.json', 'utf8'));

// 2. Load Migration SQL
const sql = fs.readFileSync('supabase/migrations/20260926000400_jeddah_saudi_rice_kabsa_catalog.sql', 'utf8');
const startTag = 'INSERT INTO _saudi_rice_catalog(payload) VALUES ($catalog$';
const endTag = '$catalog$::jsonb);';
const start = sql.indexOf(startTag);
const end = sql.indexOf(endTag, start);
const sqlCatalog = JSON.parse(sql.substring(start + startTag.length, end));

// 3. Connect to PGlite with full schema up to Saudi Rice
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

console.log('================================================================');
console.log('AUDIT REPORT 1: BRAND BRANCH COUNTS TABLE');
console.log('================================================================');

const saudiRiceBrandIds = [
  'raydan', 'al_romansiah', 'al_saddah', 'almazaq_al_bukhari',
  'hashi_basha', 'eleyk_al_bukhari', 'kabset_elham', 'sarmad',
  'labbani_fakher', 'mandi_world', 'hashi_bin_hamoud', 'fnoon_al_shawaya',
  'ali_hanash', 'ghamim', 'mandi_al_hejaz', 'al_shadawi_ras_al_mandi'
];

let sumJson = 0;
let sumMig = 0;
let sumDb = 0;

console.log('| Brand | Corrected JSON | Migration | Local DB | Match? |');
console.log('| :--- | :---: | :---: | :---: | :---: |');

for (const bId of saudiRiceBrandIds) {
  const jBrand = jsonRaw.brands.find(b => b.id === bId);
  const mBrand = sqlCatalog.brands.find(b => b.brand_id === bId);
  const dbRows = (await db.query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id = '${bId}'`)).rows[0].n;

  const jCount = jBrand ? (jBrand.branches || []).length : 0;
  const mCount = mBrand ? (mBrand.branches || []).length : 0;
  sumJson += jCount;
  sumMig += mCount;
  sumDb += dbRows;

  const match = (jCount === mCount && mCount === dbRows) ? 'YES' : 'NO';
  console.log(`| ${jBrand.canonical_name} (\`${bId}\`) | ${jCount} | ${mCount} | ${dbRows} | ${match} |`);
}

console.log(`\nTotals: Corrected JSON = ${sumJson} | Migration = ${sumMig} | Local DB = ${sumDb}`);

// Canonical vs Null counts in DB
const dbCanonical = (await db.query(`
  SELECT count(*)::int n FROM restaurant_branches
  WHERE restaurant_id IN (${saudiRiceBrandIds.map(id => `'${id}'`).join(',')})
    AND district IS NOT NULL
`)).rows[0].n;

const dbNull = (await db.query(`
  SELECT count(*)::int n FROM restaurant_branches
  WHERE restaurant_id IN (${saudiRiceBrandIds.map(id => `'${id}'`).join(',')})
    AND district IS NULL
`)).rows[0].n;

console.log(`Local DB Canonical District Branches: ${dbCanonical} (Expected: 31)`);
console.log(`Local DB Null District (Caution) Branches: ${dbNull} (Expected: 14)`);

console.log('\n================================================================');
console.log('AUDIT REPORT 2: CROSS-BRAND PLACE ID COLLISION CHECK (ENTIRE DB)');
console.log('================================================================');

const allBranches = (await db.query(`
  SELECT b.google_place_id, b.restaurant_id, b.branch_name_en, r.name_en AS restaurant_name, r.primary_category
  FROM restaurant_branches b
  JOIN restaurants r ON r.id = b.restaurant_id
`)).rows;

console.log(`Total active branches across ALL categories in DB: ${allBranches.length}`);

const placeIdMap = new Map();
let collisions = 0;
for (const b of allBranches) {
  if (placeIdMap.has(b.google_place_id)) {
    const existing = placeIdMap.get(b.google_place_id);
    console.error(`COLLISION DETECTED for Place ID ${b.google_place_id}:`);
    console.error(`  - Existing: [${existing.primary_category}] ${existing.restaurant_name} (${existing.restaurant_id}) - ${existing.branch_name_en}`);
    console.error(`  - Conflict: [${b.primary_category}] ${b.restaurant_name} (${b.restaurant_id}) - ${b.branch_name_en}`);
    collisions++;
  } else {
    placeIdMap.set(b.google_place_id, b);
  }
}

if (collisions === 0) {
  console.log(`PASS: Zero Place ID collisions detected across all ${allBranches.length} branches in the entire database!`);
} else {
  console.error(`FAIL: ${collisions} collisions detected!`);
  process.exit(1);
}

console.log('\n================================================================');
console.log('AUDIT REPORT 3: DEEP COMPARISON OF ALL 14 CAUTION BRANCHES');
console.log('================================================================');

const jsonCaution = [];
for (const b of jsonRaw.brands) {
  for (const br of (b.branches || [])) {
    if (br.canonical_district === null) {
      jsonCaution.push({
        brandId: b.id,
        brandName: b.canonical_name,
        branchName: br.branch_name,
        placeId: br.google_place_id,
        lat: br.latitude,
        lng: br.longitude,
        address: br.formatted_address,
        notes: br.geographic_notes
      });
    }
  }
}

console.log(`Identified ${jsonCaution.length} caution branches in Corrected JSON:`);
let cautionMismatches = 0;

for (let i = 0; i < jsonCaution.length; i++) {
  const jc = jsonCaution[i];

  // Lookup in Migration SQL
  const mBrand = sqlCatalog.brands.find(b => b.brand_id === jc.brandId);
  const mb = mBrand?.branches.find(b => b.google_place_id === jc.placeId);

  // Lookup in Local DB
  const dbRow = (await db.query(`
    SELECT * FROM restaurant_branches WHERE google_place_id = '${jc.placeId}'
  `)).rows[0];

  if (!mb) {
    console.error(`Caution branch ${jc.placeId} missing in Migration SQL!`);
    cautionMismatches++;
    continue;
  }
  if (!dbRow) {
    console.error(`Caution branch ${jc.placeId} missing in Local DB!`);
    cautionMismatches++;
    continue;
  }

  // Validate exact values
  const latDiff = Math.abs(dbRow.latitude - jc.lat);
  const lngDiff = Math.abs(dbRow.longitude - jc.lng);
  const notesMatch = (dbRow.geographic_notes === jc.notes && mb.geographic_notes === jc.notes);
  const nullDistMatch = (dbRow.district === null && mb.district === null);
  const addrMatch = (dbRow.address_en === jc.address && mb.address_en === jc.address);

  if (latDiff > 0.00001 || lngDiff > 0.00001 || !notesMatch || !nullDistMatch || !addrMatch) {
    console.error(`Caution branch mismatch on ${jc.placeId}`);
    cautionMismatches++;
  } else {
    console.log(`${i + 1}. [${jc.brandId}] ${jc.branchName}`);
    console.log(`   Place ID: ${jc.placeId}`);
    console.log(`   Coords:   (${jc.lat}, ${jc.lng}) [DB Exact Match: YES]`);
    console.log(`   Address:  ${jc.address} [DB Exact Match: YES]`);
    console.log(`   Notes:    ${jc.notes} [DB Exact Match: YES]`);
    console.log(`   District: NULL [DB Exact Match: YES]`);
  }
}

console.log(`Total Caution Mismatches: ${cautionMismatches}`);

await db.close();
