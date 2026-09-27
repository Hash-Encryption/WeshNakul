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

  console.log('--- EXECUTING PIZZA MIGRATION ---');
  try {
    await db.exec(migration('20260927000100_jeddah_pizza_catalog.sql'));
    console.log('PIZZA MIGRATION EXECUTED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('Migration execution failed with message:', err.message);
    console.error('Migration detail:', err.detail);
    console.error('Migration hint:', err.hint);
    console.error('Migration code:', err.code);
    throw err;
  }

  console.log('--- POST-PIZZA CATALOG STATS (MATCHING SCREENSHOT) ---');
  const catStats = await db.query(`
    SELECT 
      r.primary_category, 
      count(DISTINCT r.id)::int as brands, 
      count(rb.id)::int as total_branches,
      count(CASE WHEN rb.district IS NOT NULL THEN 1 END)::int as canonical_branches,
      count(CASE WHEN rb.district IS NULL THEN 1 END)::int as caution_branches
    FROM restaurants r
    LEFT JOIN restaurant_branches rb ON rb.restaurant_id = r.id
    WHERE r.research_use IN ('production_ready', 'usable_with_caution')
    GROUP BY r.primary_category
    ORDER BY r.primary_category;
  `);
  console.table(catStats.rows);

  const totalStats = await db.query(`
    SELECT count(DISTINCT r.id)::int as total_brands,
           count(rb.id)::int as total_branches
    FROM restaurants r
    LEFT JOIN restaurant_branches rb ON rb.restaurant_id = r.id
    WHERE r.research_use IN ('production_ready', 'usable_with_caution')
  `);
  console.log('Total live catalog across all categories:', totalStats.rows[0]);

  // Check Pizza specific branches
  const pizzaBranches = await db.query(`
    SELECT count(*)::int as count,
           count(google_place_id)::int as with_place_id,
           count(google_maps_url)::int as with_maps_url,
           count(latitude)::int as with_latitude,
           count(longitude)::int as with_longitude,
           count(district)::int as canonical_district_count
    FROM restaurant_branches rb
    JOIN restaurants r ON r.id = rb.restaurant_id
    WHERE r.primary_category = 'pizza'
  `);
  console.log('Pizza branch details:', pizzaBranches.rows[0]);

  // Place ID uniqueness check
  const dupes = await db.query(`
    SELECT google_place_id, count(*)
    FROM restaurant_branches
    WHERE google_place_id IS NOT NULL
    GROUP BY google_place_id
    HAVING count(*) > 1
  `);
  console.log('Duplicate Place IDs across entire database:', dupes.rows.length);

  await db.close();
}

main().catch(err => {
  console.error('Migration execution failed with MESSAGE:', err.message);
  process.exit(1);
});
