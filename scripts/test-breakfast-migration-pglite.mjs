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
  await db.exec(migration('20260927000300_jeddah_fatayer_catalog.sql'));
  await db.exec(migration('20260927000400_jeddah_sandwiches_catalog.sql'));
  await db.exec(migration('20260927000500_jeddah_indian_catalog.sql'));
  await db.exec(migration('20260927000600_jeddah_italian_catalog.sql'));

  // Inspect pre-migration state for lazy_cat
  const preLazyCat = await db.query(`SELECT id, signature_dish_ar, signature_dish_en, platforms FROM restaurants WHERE id = 'lazy_cat';`);
  console.log('Pre-migration lazy_cat:', preLazyCat.rows[0]);

  console.log('--- EXECUTING BREAKFAST MIGRATION ---');
  try {
    await db.exec(migration('20261018000100_jeddah_breakfast_catalog.sql'));
    console.log('BREAKFAST MIGRATION EXECUTED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('Migration execution failed:');
    console.error('Message:', err.message);
    console.error('Detail:', err.detail);
    console.error('Hint:', err.hint);
    console.error('Code:', err.code);
    console.error('Position:', err.position);
    if (err.position) {
      const sql = migration('20261018000100_jeddah_breakfast_catalog.sql');
      const pos = parseInt(err.position, 10);
      console.error('Near SQL:', sql.slice(Math.max(0, pos - 150), Math.min(sql.length, pos + 150)));
    }
    process.exit(1);
  }

  console.log('--- POST-BREAKFAST CATALOG STATS ACROSS CATEGORIES ---');
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

  console.log('--- BREAKFAST BRANDS & PLATFORMS AUDIT ---');
  const bList = await db.query(`
    SELECT 
      r.id,
      r.name_en,
      r.primary_category,
      r.platforms,
      r.signature_dish_ar,
      r.signature_dish_en,
      count(rb.id)::int as branch_count
    FROM restaurants r
    JOIN restaurant_branches rb ON rb.restaurant_id = r.id
    WHERE r.primary_category = 'breakfast'
    GROUP BY r.id, r.name_en, r.primary_category, r.platforms, r.signature_dish_ar, r.signature_dish_en
    ORDER BY r.name_en;
  `);
  console.table(bList.rows.map(r => ({
    id: r.id,
    name_en: r.name_en,
    hungerstation: r.platforms?.hungerstation,
    jahez: r.platforms?.jahez,
    keeta: r.platforms?.keeta,
    sig_en: r.signature_dish_en,
    branches: r.branch_count
  })));

  // Assertions on Delivery Platforms
  const verifiedHS = bList.rows.filter(r => r.platforms?.hungerstation === true).map(r => r.id);
  const unverifiedHS = bList.rows.filter(r => r.platforms?.hungerstation === false).map(r => r.id);
  const anyJahez = bList.rows.filter(r => r.platforms?.jahez === true).map(r => r.id);
  const anyKeeta = bList.rows.filter(r => r.platforms?.keeta === true).map(r => r.id);

  console.log(`Verified HungerStation count: ${verifiedHS.length} (expected 7)`);
  console.log(`Unverified HungerStation count: ${unverifiedHS.length} (expected 5)`);
  console.log(`Jahez enabled count: ${anyJahez.length} (expected 0)`);
  console.log(`Keeta enabled count: ${anyKeeta.length} (expected 0)`);

  if (verifiedHS.length !== 7 || unverifiedHS.length !== 5 || anyJahez.length !== 0 || anyKeeta.length !== 0) {
    throw new Error('Delivery platform audit failed: verified count mismatch');
  }

  // Assertions on lazy_cat preservation
  const postLazyCat = await db.query(`SELECT id, signature_dish_ar, signature_dish_en, platforms FROM restaurants WHERE id = 'lazy_cat';`);
  console.log('Post-migration lazy_cat:', postLazyCat.rows[0]);
  if (postLazyCat.rows[0].signature_dish_en !== preLazyCat.rows[0].signature_dish_en) {
    throw new Error('lazy_cat signature dish was altered!');
  }
  if (postLazyCat.rows[0].platforms.jahez !== false || postLazyCat.rows[0].platforms.keeta !== false) {
    throw new Error('lazy_cat unverified platforms were not reconciled!');
  }

  console.log('--- PAUL BRANCHES AUDIT ---');
  const paulBranches = await db.query(`
    SELECT 
      rb.branch_name_en,
      rb.district,
      rb.google_place_id,
      rb.branch_status
    FROM restaurant_branches rb
    WHERE rb.restaurant_id = 'paul'
    ORDER BY rb.district;
  `);
  console.table(paulBranches.rows);

  console.log('--- IDEMPOTENCY TEST: RE-EXECUTING BREAKFAST MIGRATION ---');
  try {
    await db.exec(migration('20261018000100_jeddah_breakfast_catalog.sql'));
    console.log('RE-EXECUTION PASSED IDEMPOTENCY CHECK CLEANLY!\n');
  } catch (err) {
    console.error('Re-execution failed:', err.message);
    process.exit(1);
  }

  console.log('--- TESTING BRANCH UPSERT WITH OPTIONAL PLACE ID (NULL Place ID) ---');
  // Test that a branch without a google_place_id can be upserted idempotently using the deterministic UUID
  const testBranchId = 'branch_test_optional_place_id';
  const testRestaurantId = 'ext_seventeen';
  const testDistrict = 'al_zahra';
  const testAddress = 'Test Address Without Place ID, Al Zahra';
  const testUuidSql = `
    INSERT INTO public.restaurant_branches (
      id, restaurant_id, branch_name_en, branch_status, branch_status_confidence, branch_type,
      district, address_en, maps_lookup_status, rating_source, branch_identity_confidence, last_verified_at
    ) VALUES (
      md5('weshnakul_branch:' || '${testBranchId}')::uuid,
      '${testRestaurantId}',
      'Test Branch No Place ID',
      'open',
      'high',
      'full_dine_in',
      '${testDistrict}',
      '${testAddress}',
      'unknown',
      'unknown',
      'high',
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      address_en = EXCLUDED.address_en;
  `;
  await db.exec(testUuidSql);
  // Re-run the same insert to test idempotency
  await db.exec(testUuidSql);
  const insertedBranch = await db.query(`SELECT id, restaurant_id, google_place_id, address_en FROM public.restaurant_branches WHERE id = md5('weshnakul_branch:${testBranchId}')::uuid;`);
  console.log('Inserted branch with NULL Place ID:', insertedBranch.rows[0]);
  if (insertedBranch.rows[0].google_place_id !== null) {
    throw new Error('Expected google_place_id to be null for optional place id branch');
  }
  // Cleanup test branch
  await db.exec(`DELETE FROM public.restaurant_branches WHERE id = md5('weshnakul_branch:${testBranchId}')::uuid;`);
  console.log('✓ Optional Place ID test passed successfully!\n');

  console.log('ALL BREAKFAST MIGRATION & RECONCILIATION CHECKS PASSED SUCCESSFULLY!');
}

main().catch(console.error);
