import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

async function test() {
  const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
  const { PGlite } = await import(pathToFileURL(runtime).href);
  const db = new PGlite();
  const migration = f => fs.readFileSync(`supabase/migrations/${f}`, 'utf8').replace(/^\uFEFF/, '');

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

  const burgers = (await db.query(`SELECT count(*)::int n FROM restaurants WHERE primary_category = 'burger'`)).rows[0].n;
  const burgerBranches = (await db.query(`SELECT count(*)::int n FROM restaurant_branches rb JOIN restaurants r ON r.id = rb.restaurant_id WHERE r.primary_category = 'burger'`)).rows[0].n;

  const broasts = (await db.query(`SELECT count(*)::int n FROM restaurants WHERE primary_category = 'broast'`)).rows[0].n;
  const broastBranches = (await db.query(`SELECT count(*)::int n FROM restaurant_branches rb JOIN restaurants r ON r.id = rb.restaurant_id WHERE r.primary_category = 'broast'`)).rows[0].n;

  const shawarmas = (await db.query(`SELECT count(*)::int n FROM restaurants WHERE primary_category = 'shawarma'`)).rows[0].n;
  const shawarmaBranches = (await db.query(`SELECT count(*)::int n FROM restaurant_branches rb JOIN restaurants r ON r.id = rb.restaurant_id WHERE r.primary_category = 'shawarma'`)).rows[0].n;

  const districts = (await db.query(`SELECT count(*)::int n FROM private.district_geography`)).rows[0].n;

  console.log('--- POST-SHAWARMA BASELINE ---');
  console.log('Burgers:', burgers, 'brands,', burgerBranches, 'branches');
  console.log('Broasts:', broasts, 'brands,', broastBranches, 'branches');
  console.log('Shawarmas:', shawarmas, 'brands,', shawarmaBranches, 'branches');
  console.log('Districts in private.district_geography:', districts);

  // Check what rows currently exist for our 16 rice brands or saudi_kabsa
  const riceRows = (await db.query(`SELECT id, name_en, primary_category, research_use FROM restaurants WHERE id IN ('raydan', 'al_romansiah', 'al_saddah', 'almazaq_al_bukhari', 'hashi_basha', 'eleyk_al_bukhari', 'kabset_elham', 'sarmad', 'labbani_fakher', 'mandi_world', 'hashi_bin_hamoud', 'fnoon_al_shawaya', 'ali_hanash', 'ghamim', 'mandi_al_hejaz', 'al_shadawi_ras_al_mandi', 'matam_baladi')`)).rows;
  console.log('\nExisting rice rows in restaurants table before migration:', riceRows.length);
  for (const r of riceRows) {
    console.log(`  [${r.id}] ${r.name_en} | primary_category: ${r.primary_category} | research_use: ${r.research_use}`);
  }

  // Check if any branches exist for those IDs
  const riceBranches = (await db.query(`SELECT rb.restaurant_id, count(*)::int n FROM restaurant_branches rb WHERE rb.restaurant_id IN ('raydan', 'al_romansiah', 'al_saddah', 'almazaq_al_bukhari', 'hashi_basha', 'eleyk_al_bukhari', 'kabset_elham', 'sarmad', 'labbani_fakher', 'mandi_world', 'hashi_bin_hamoud', 'fnoon_al_shawaya', 'ali_hanash', 'ghamim', 'mandi_al_hejaz', 'al_shadawi_ras_al_mandi', 'matam_baladi') GROUP BY rb.restaurant_id`)).rows;
  console.log('Existing branches for those IDs:', riceBranches.length);

  await db.close();
}
test();
