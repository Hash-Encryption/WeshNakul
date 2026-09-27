import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function main() {
  const runtime = process.env.PGLITE_MODULE || path.join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
  const { PGlite } = await import(pathToFileURL(runtime).href);
  const db = new PGlite();
  const migration = f => fs.readFileSync(path.join(rootDir, 'supabase', 'migrations', f), 'utf8').replace(/^\uFEFF/, '');

  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');

  const mChain = [
    '20260902_initial_schema.sql',
    '002_food_consensus.sql',
    '003_restaurant_swipes.sql',
    '005_create_and_seed_restaurants.sql',
    '006_squad_order_scratchpad.sql',
    '007_room_expiration_and_cleanup.sql',
    '20260908000100_restaurant_intelligence.sql',
    '20260908000200_restaurant_legacy_provenance.sql',
    '20260908000300_room_host_coordinates.sql'
  ];
  for (const f of mChain) {
    await db.exec(migration(f).replace('create extension if not exists "pgcrypto";', ''));
  }
  await db.exec('ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE (room_id, session_token);');

  const mChain2 = [
    '20260909000100_private_restaurant_decks.sql',
    '20260909000200_private_participant_sessions.sql',
    '20260910000100_jeddah_geography_intelligence.sql',
    '20260911000100_jeddah_burger_google_verified_catalog.sql',
    '20260911000200_remove_legacy_public_room_coordinates.sql',
    '20260911000300_phase3_authoritative_consensus.sql',
    '20260912000100_allow_voting_stage_joins.sql',
    '20260913000100_decision_game_and_tie_corrections.sql',
    '20260916000100_global_fair_draw_and_immediate_flow.sql'
  ];
  for (const f of mChain2) {
    await db.exec(migration(f));
  }

  await db.exec(migration('20260917000100_harden_global_fair_draw.sql').replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '').replace(/DO \$\$[\s\S]*?END \$\$;/m, ''));
  await db.exec(`CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea LANGUAGE sql VOLATILE AS $$ SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex') $$;`);

  await db.exec(migration('20260918000100_room_modes_preferences_and_suggestions.sql'));
  await db.exec(migration('20260919000100_clean_food_categories.sql'));

  await db.exec(
    migration('20260919000200_repair_secure_fair_draw.sql')
      .replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '')
      .replace('DROP FUNCTION IF EXISTS public.gen_random_bytes(int);', '')
      .replace(/DO \$\$[\s\S]*?END \$\$;/m, '')
  );
  await db.exec(`CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea LANGUAGE sql VOLATILE AS $$ SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex') $$;`);

  await db.exec(migration('20260926000100_expand_jeddah_geography_30_districts.sql'));
  await db.exec(migration('20260926000200_jeddah_broast_fried_chicken_catalog.sql'));
  await db.exec(migration('20260926000300_jeddah_shawarma_catalog.sql'));
  await db.exec(migration('20260926000400_jeddah_saudi_rice_kabsa_catalog.sql'));
  await db.exec(migration('20260927000100_jeddah_pizza_catalog.sql'));
  await db.exec(migration('20260927000200_jeddah_grills_catalog.sql'));
  await db.exec(migration('20260927000300_jeddah_fatayer_catalog.sql'));
  await db.exec(migration('20260927000400_jeddah_sandwiches_catalog.sql'));
  await db.exec(migration('20260927000500_jeddah_indian_catalog.sql'));
  await db.exec(migration('20260927000600_jeddah_italian_catalog.sql'));

  const allRestaurants = await db.query('SELECT * FROM restaurants;');
  console.log('Columns in restaurants:', Object.keys(allRestaurants.rows[0]));
  const allBranches = await db.query('SELECT * FROM restaurant_branches;');
  console.log('Columns in restaurant_branches:', Object.keys(allBranches.rows[0]));

  console.log(`Total live restaurants in DB: ${allRestaurants.rows.length}`);
  console.log(`Total live branches in DB: ${allBranches.rows.length}`);

  const rawPath = path.join(rootDir, 'docs', 'research', 'jeddah-street-folk-food-raw-uploaded.json');
  const streetData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

  // Collisions check
  console.log('\n--- CHECKING BRAND COLLISIONS ---');
  for (const b of streetData.brands) {
    const idMatch = allRestaurants.rows.find(r => r.id === b.id);
    const nameMatch = allRestaurants.rows.find(r => r.name_en.toLowerCase() === b.name_en.toLowerCase());
    const arNameMatch = allRestaurants.rows.find(r => r.name_ar === b.name_ar);

    if (idMatch || nameMatch || arNameMatch) {
      console.log(`COLLISION BRAND: ${b.id} (${b.name_en})`);
      console.log('  Matches DB:', idMatch || nameMatch || arNameMatch);
    } else {
      console.log(`NEW BRAND: ${b.id} (${b.name_en})`);
    }
  }

  console.log('\n--- CHECKING BRANCH COLLISIONS (PLACE ID & MAPS URL & COORDS) ---');
  let branchCollisions = 0;
  for (const b of streetData.brands) {
    for (const br of (b.branches || [])) {
      if (!br.google_place_id) continue;
      const pidMatch = allBranches.rows.find(dbBr => dbBr.google_place_id === br.google_place_id);
      const urlMatch = allBranches.rows.find(dbBr => dbBr.google_maps_url === br.google_maps_url);

      if (pidMatch || urlMatch) {
        branchCollisions++;
        console.log(`COLLISION BRANCH: ${b.name_en} - ${br.name}`);
        console.log('  Matches DB Branch:', pidMatch || urlMatch);
      }
    }
  }
  console.log(`Total branch collisions found: ${branchCollisions}`);

  // Check Breakfast mode in DB
  console.log('\n--- CHECKING BREAKFAST RESTAURANTS IN DB ---');
  const breakfastRests = allRestaurants.rows.filter(r => (r.modes && r.modes.includes('breakfast')) || (r.secondary_categories && r.secondary_categories.includes('saudi_breakfast')) || r.serves_breakfast_menu);
  console.log(`Restaurants in DB with breakfast mode or saudi_breakfast or serves_breakfast_menu: ${breakfastRests.length}`);
  for (const r of breakfastRests) {
    console.log(`  - ${r.id} (${r.name_en}): serves_breakfast=${r.serves_breakfast_menu}, pri=${r.primary_category}, sec=${JSON.stringify(r.secondary_categories)}`);
  }
}

main().catch(console.error);
