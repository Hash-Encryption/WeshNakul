import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

async function main() {
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

  const previousCatalogs = [
    '20260926000100_expand_jeddah_geography_30_districts.sql',
    '20260926000200_jeddah_broast_fried_chicken_catalog.sql',
    '20260926000300_jeddah_shawarma_catalog.sql',
    '20260926000400_jeddah_saudi_rice_kabsa_catalog.sql',
    '20260927000100_jeddah_pizza_catalog.sql',
    '20260927000200_jeddah_grills_catalog.sql',
    '20260927000300_jeddah_fatayer_catalog.sql',
    '20260927000400_jeddah_sandwiches_catalog.sql',
    '20260927000500_jeddah_indian_catalog.sql',
    '20260927000600_jeddah_italian_catalog.sql'
  ];

  for (const m of previousCatalogs) {
    await db.exec(migration(m));
  }

  console.log('Previous migrations applied. Now applying 20260928000200_jeddah_mexican_catalog.sql...');
  await db.exec(migration('20260928000200_jeddah_mexican_catalog.sql'));
  console.log('SUCCESS: Mexican migration applied without error!');

  const q1 = await db.query(`
    SELECT 
      id, 
      name_en, 
      name_ar, 
      editorial_role, 
      research_use, 
      verified_jeddah_branch_count,
      cardinality(branches) AS live_branch_slugs
    FROM public.restaurants
    WHERE primary_category = 'mexican'
    ORDER BY editorial_role ASC, name_en;
  `);
  q1.rows.forEach(r => console.log(`${r.editorial_role} | ${r.id.padEnd(25)} | branches: ${r.verified_jeddah_branch_count}`));

  const q3 = await db.query(`
    SELECT 
      primary_category,
      count(DISTINCT id) AS total_brands,
      sum(verified_jeddah_branch_count) AS total_verified_branches
    FROM public.restaurants
    WHERE primary_category = 'mexican'
    GROUP BY primary_category;
  `);
  console.log('\n--- QUERY 3: MEXICAN TOTALS ---');
  console.table(q3.rows);

  const mexBranches = await db.query(`
    SELECT rb.id, r.name_en as brand, rb.branch_name_en, rb.district, rb.google_place_id, rb.google_rating, rb.google_review_count
    FROM restaurant_branches rb
    JOIN restaurants r ON r.id = rb.restaurant_id
    WHERE r.primary_category = 'mexican'
    ORDER BY r.name_en, rb.branch_name_en;
  `);
  console.log('\n--- INSERTED MEXICAN BRANCHES ---');
  console.table(mexBranches.rows);

  const bestSellers = await db.query(`
    SELECT r.name_en as brand, bs.name_en, bs.name_ar, bs.is_signature
    FROM restaurant_best_sellers bs
    JOIN restaurants r ON r.id = bs.restaurant_id
    WHERE r.primary_category = 'mexican';
  `);
  console.log('\nTotal best sellers inserted:', bestSellers.rows.length);

  const sources = await db.query(`
    SELECT count(*)::int as total_sources
    FROM restaurant_sources s
    JOIN restaurants r ON r.id = s.restaurant_id
    WHERE r.primary_category = 'mexican';
  `);
  console.log('Total sources inserted:', sources.rows[0].total_sources);

  const total = await db.query(`SELECT count(distinct id) as total_brands from restaurants;`);
  const totalBr = await db.query(`SELECT count(distinct id) as total_branches from restaurant_branches;`);
  console.log(`\n========================================`);
  console.log(`TOTAL DATABASE STATE: ${total.rows[0].total_brands} brands, ${totalBr.rows[0].total_branches} branches`);
  console.log(`========================================\n`);

  // Test idempotence
  console.log('\nTesting migration idempotence (re-applying)...');
  await db.exec(migration('20260928000200_jeddah_mexican_catalog.sql'));
  console.log('SUCCESS: Migration is fully idempotent!');

  await db.close();
}

main().catch(err => {
  console.error('MIGRATION TEST FAILED:', err.message);
  console.error('DETAIL:', err.detail);
  console.error('HINT:', err.hint);
  console.error('WHERE:', err.where);
  process.exit(1);
});

