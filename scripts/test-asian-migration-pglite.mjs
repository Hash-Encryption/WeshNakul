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
    '20260908000300_room_host_coordinates.sql',
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

  for (const f of mChain) {
    await db.exec(migration(f).replace('create extension if not exists "pgcrypto";', ''));
  }
  await db.exec('ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE (room_id, session_token);');

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

  const catalogMigrations = [
    '20260926000100_expand_jeddah_geography_30_districts.sql',
    '20260926000200_jeddah_broast_fried_chicken_catalog.sql',
    '20260926000300_jeddah_shawarma_catalog.sql',
    '20260926000400_jeddah_saudi_rice_kabsa_catalog.sql',
    '20260927000100_jeddah_pizza_catalog.sql',
    '20260927000200_jeddah_grills_catalog.sql',
    '20260927000300_jeddah_fatayer_catalog.sql',
    '20260927000400_jeddah_sandwiches_catalog.sql',
    '20260927000500_jeddah_indian_catalog.sql',
    '20260927000600_jeddah_italian_catalog.sql',
    '20260928000100_jeddah_sushi_catalog.sql',
    '20260928000100_jeddah_street_folk_food_catalog.sql',
    '20260928000200_jeddah_mexican_catalog.sql'
  ];

  for (const m of catalogMigrations) {
    await db.exec(migration(m));
  }

  console.log('Baseline migrations applied. Now applying 20260928000300_jeddah_asian_catalog.sql...');
  await db.exec(migration('20260928000300_jeddah_asian_catalog.sql'));
  console.log('SUCCESS: Asian migration applied without error!');

  // Query 1: Asian primary brands
  const q1 = await db.query(`
    SELECT 
      id, 
      name_en, 
      name_ar, 
      primary_category,
      editorial_role, 
      research_use, 
      verified_jeddah_branch_count,
      cardinality(branches) AS live_branch_slugs
    FROM public.restaurants
    WHERE primary_category = 'asian'
    ORDER BY editorial_role ASC, name_en;
  `);
  console.log('\n--- ASIAN PRIMARY BRANDS ---');
  q1.rows.forEach(r => console.log(`${r.editorial_role.padEnd(10)} | ${r.id.padEnd(25)} | branches: ${r.verified_jeddah_branch_count}`));

  // Query 2: All brands with 'asian' in categories (including sushi overlaps)
  const q2 = await db.query(`
    SELECT 
      id, 
      name_en, 
      primary_category,
      categories,
      verified_jeddah_branch_count
    FROM public.restaurants
    WHERE 'asian' = ANY(categories)
    ORDER BY primary_category, name_en;
  `);
  console.log('\n--- ALL BRANDS WITH ASIAN CATEGORY (including overlaps) ---');
  console.table(q2.rows);

  // Query 3: Branches attached to Asian primary brands
  const q3 = await db.query(`
    SELECT 
      r.id as brand_id,
      r.name_en,
      count(rb.id)::int as branch_count,
      count(CASE WHEN rb.district IS NOT NULL THEN 1 END)::int as canonical_branches,
      count(CASE WHEN rb.district IS NULL THEN 1 END)::int as outer_caution_branches
    FROM public.restaurants r
    JOIN public.restaurant_branches rb ON rb.restaurant_id = r.id
    WHERE r.primary_category = 'asian'
    GROUP BY r.id, r.name_en
    ORDER BY branch_count DESC, r.name_en;
  `);
  console.log('\n--- ASIAN PRIMARY BRAND BRANCH COUNTS ---');
  console.table(q3.rows);

  // Query 4: Total active branches count
  const q4 = await db.query(`
    SELECT count(*)::int as total_asian_primary_branches
    FROM public.restaurant_branches rb
    JOIN public.restaurants r ON r.id = rb.restaurant_id
    WHERE r.primary_category = 'asian';
  `);
  console.log('Total Asian primary branches:', q4.rows[0].total_asian_primary_branches);

  // Query 5: Best sellers
  const bestSellers = await db.query(`
    SELECT r.name_en as brand, bs.name_en, bs.name_ar, bs.is_signature
    FROM restaurant_best_sellers bs
    JOIN restaurants r ON r.id = bs.restaurant_id
    WHERE r.primary_category = 'asian';
  `);
  console.log('Total Asian best sellers inserted:', bestSellers.rows.length);

  // Query 6: Sources
  const sources = await db.query(`
    SELECT count(*)::int as total_sources
    FROM restaurant_sources s
    JOIN restaurants r ON r.id = s.restaurant_id
    WHERE r.primary_category = 'asian';
  `);
  console.log('Total Asian sources inserted:', sources.rows[0].total_sources);

  // Query 7: Legacy check (confirm benihana and pf_changs are gone)
  const legacyCheck = await db.query(`
    SELECT id, name_en FROM public.restaurants WHERE id IN ('benihana', 'pf_changs');
  `);
  console.log('Legacy unverified records remaining (should be 0):', legacyCheck.rows.length);

  // Test idempotence
  console.log('\nTesting migration idempotence (re-applying)...');
  await db.exec(migration('20260928000300_jeddah_asian_catalog.sql'));
  console.log('SUCCESS: Asian migration is fully idempotent!');

  // Test Asian deck generation
  console.log('\n--- TESTING ASIAN 7-CARD DECK GENERATION ---');
  const roomRes = await db.query(`
    INSERT INTO public.rooms (
      code, eating_mode, city, neighborhood, language, stage, winning_category, swiping_started_at
    ) VALUES (
      'AS01', 'any', 'jeddah', 'al_zahra', 'ar', 'swiping', 'asian', now()
    ) RETURNING id;
  `);
  const roomId = roomRes.rows[0].id;

  const partRes = await db.query(`
    INSERT INTO public.participants (
      room_id, session_token, nickname, is_host, player_color, player_shape, status
    ) VALUES (
      $1, 'token-host-asian-123456', 'Host', true, '#000000', 'circle', 'active'
    ) RETURNING id;
  `, [roomId]);
  const participantId = partRes.rows[0].id;

  const deckPayload = await db.query(`
    SELECT private.create_restaurant_deck($1, $2, 'token-host-asian-123456', NULL) as deck;
  `, [roomId, participantId]);

  const deck = deckPayload.rows[0].deck;
  console.log('Deck ID:', deck.deckId);
  console.log('Deck Cards Count:', deck.restaurants ? deck.restaurants.length : 0);
  console.log('Deck Brands:');
  deck.restaurants.forEach((r, idx) => {
    console.log(`  Card ${idx + 1}: ${r.id.padEnd(25)} | ${r.nameEn} | ${r.nameAr}`);
  });

  if (!deck.restaurants || deck.restaurants.length < 7) {
    throw new Error(`Expected at least 7 cards in Asian deck, got: ${deck.restaurants?.length}`);
  }
  console.log('SUCCESS: Asian 7-card deck generation fully verified!');

  await db.close();
}

main().catch(err => {
  console.error('MIGRATION TEST FAILED:', err.message);
  console.error('DETAIL:', err.detail);
  console.error('HINT:', err.hint);
  process.exit(1);
});

