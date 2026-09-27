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

  await db.exec(migration('20260926000100_expand_jeddah_geography_30_districts.sql'));
  await db.exec(migration('20260926000200_jeddah_broast_fried_chicken_catalog.sql'));
  await db.exec(migration('20260926000300_jeddah_shawarma_catalog.sql'));
  await db.exec(migration('20260926000400_jeddah_saudi_rice_kabsa_catalog.sql'));
  await db.exec(migration('20260927000100_jeddah_pizza_catalog.sql'));
  await db.exec(migration('20260927000200_jeddah_grills_catalog.sql'));

  console.log('Baseline before Indian applied successfully.');

  // Now apply the Indian catalog migration
  console.log('Applying 20260927000500_jeddah_indian_catalog.sql...');
  await db.exec(migration('20260927000500_jeddah_indian_catalog.sql'));
  console.log('Applied 20260927000500_jeddah_indian_catalog.sql successfully!');

  // Query Indian catalog verification
  const indianBrands = await db.query(`
    SELECT id, name_en, name_ar, primary_category, categories, research_use, verified_jeddah_branch_count, serves_breakfast_menu
    FROM public.restaurants
    WHERE primary_category = 'indian'
    ORDER BY name_en;
  `);
  console.log('Indian brands inserted:', indianBrands.rows.length, indianBrands.rows.map(r => r.id));

  const indianBranches = await db.query(`
    SELECT rb.id, r.name_en as brand, rb.branch_name_en, rb.district, rb.google_place_id, rb.google_maps_url, rb.latitude, rb.longitude
    FROM public.restaurant_branches rb
    JOIN public.restaurants r ON r.id = rb.restaurant_id
    WHERE r.primary_category = 'indian'
    ORDER BY r.name_en, rb.branch_name_en;
  `);
  console.log('Indian branches inserted:', indianBranches.rows.length);

  const canonicalBranches = indianBranches.rows.filter(b => b.district !== null);
  const outerBranches = indianBranches.rows.filter(b => b.district === null);
  console.log('Canonical branches:', canonicalBranches.length);
  console.log('Outer branches:', outerBranches.length);

  // Overall database totals
  const totalLive = await db.query(`
    SELECT count(DISTINCT r.id) as brands, count(rb.id) as branches
    FROM public.restaurants r
    JOIN public.restaurant_branches rb ON rb.restaurant_id = r.id
    WHERE r.research_use IN ('production_ready', 'usable_with_caution');
  `);
  console.log('\nNew Total Live Production Catalog:');
  console.log('Total Brands:', totalLive.rows[0].brands);
  console.log('Total Branches:', totalLive.rows[0].branches);

  await db.close();
}

main().catch(err => {
  console.error('Migration Test Failed Message:', err.message);
  console.error('Detail:', err.detail);
  console.error('Hint:', err.hint);
  console.error('Position:', err.position);
  console.error('Where:', err.where);
  process.exit(1);
});
