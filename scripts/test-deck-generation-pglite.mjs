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
    '20260928000100_jeddah_burger_expansion_and_deck_algorithm.sql',
    '20260928000100_jeddah_seafood_catalog.sql',
    '20260928000100_jeddah_sushi_catalog.sql',
    '20260928000100_jeddah_street_folk_food_catalog.sql',
    '20260928000200_jeddah_mexican_catalog.sql',
    '20260928000300_jeddah_asian_catalog.sql'
  ];

  for (const m of catalogMigrations) {
    await db.exec(migration(m));
  }

  console.log('Baseline migrations applied.');

  // Check if corrective migration exists, apply it
  if (fs.existsSync('supabase/migrations/20260928000400_category_taxonomy_corrections.sql')) {
    console.log('Applying 20260928000400_category_taxonomy_corrections.sql (1st pass)...');
    await db.exec(migration('20260928000400_category_taxonomy_corrections.sql'));
    console.log('Corrective migration applied successfully!');

    console.log('Testing idempotence: applying 20260928000400_category_taxonomy_corrections.sql (2nd pass)...');
    await db.exec(migration('20260928000400_category_taxonomy_corrections.sql'));
    console.log('SUCCESS: Migration is completely idempotent!');
  } else {
    console.log('Corrective migration does not exist yet. Testing baseline state.');
  }

  if (fs.existsSync('supabase/migrations/20260928000500_progressive_geography_widening.sql')) {
    console.log('Applying 20260928000500_progressive_geography_widening.sql...');
    await db.exec(migration('20260928000500_progressive_geography_widening.sql'));
  }

  if (fs.existsSync('supabase/migrations/20261001000100_expand_jeddah_shawarma_20_brands.sql')) {
    console.log('Applying 20261001000100_expand_jeddah_shawarma_20_brands.sql...');
    await db.exec(migration('20261001000100_expand_jeddah_shawarma_20_brands.sql'));
  }

  if (fs.existsSync('supabase/migrations/20261003000100_top5_wildcard_consensus_selection.sql')) {
    console.log('Applying 20261003000100_top5_wildcard_consensus_selection.sql...');
    await db.exec(migration('20261003000100_top5_wildcard_consensus_selection.sql'));
  }

  if (fs.existsSync('supabase/migrations/20261007000100_merge_broast_into_fried_chicken.sql')) {
    console.log('Applying 20261007000100_merge_broast_into_fried_chicken.sql...');
    await db.exec(migration('20261007000100_merge_broast_into_fried_chicken.sql'));
  }

  if (fs.existsSync('supabase/migrations/20261007000200_fried_chicken_deck_broast_rotation.sql')) {
    console.log('Applying 20261007000200_fried_chicken_deck_broast_rotation.sql...');
    await db.exec(migration('20261007000200_fried_chicken_deck_broast_rotation.sql'));
  }

  if (fs.existsSync('supabase/migrations/20261007000300_retire_al_najah_broast.sql')) {
    console.log('Applying 20261007000300_retire_al_najah_broast.sql...');
    await db.exec(migration('20261007000300_retire_al_najah_broast.sql'));
  }

  if (fs.existsSync('supabase/migrations/20261008000100_curated_grills_catalog_followup.sql')) {
    console.log('Applying 20261008000100_curated_grills_catalog_followup.sql...');
    await db.exec(migration('20261008000100_curated_grills_catalog_followup.sql'));
  }

  if (fs.existsSync('supabase/migrations/20261008000200_fix_texas_roadhouse_grill_taxonomy.sql')) {
    console.log('Applying 20261008000200_fix_texas_roadhouse_grill_taxonomy.sql...');
    await db.exec(migration('20261008000200_fix_texas_roadhouse_grill_taxonomy.sql'));
  }

  // Helper to test deck generation (15 real food categories, broast retired)
  const activeCategories = [
    'burger', 'shawarma', 'fried_chicken', 'rice', 'grill', 'pizza', 'sushi',
    'italian', 'asian', 'seafood', 'indian', 'fatayer', 'street_folk', 'mexican', 'sandwiches'
  ];

  console.log('\n======================================================');
  console.log('FOOD CATEGORY AUDIT');
  console.log('======================================================');
  for (const cat of activeCategories) {
    const res = await db.query(`
      SELECT 
        count(DISTINCT r.id) as rest_count,
        count(DISTINCT b.id) as branch_count,
        array_agg(DISTINCT r.id) as sample_ids
      FROM public.restaurants r
      JOIN public.restaurant_branches b ON b.restaurant_id = r.id AND b.branch_status NOT IN ('temporarily_closed','permanently_closed')
      WHERE lower(r.city) = 'jeddah'
        AND r.operating_status NOT IN ('temporarily_closed','permanently_closed')
        AND r.research_use IN ('production_ready','usable_with_caution')
        AND (
          r.primary_category = $1
          OR $1 = ANY(r.secondary_categories)
          OR $1 = ANY(r.categories)
        )
    `, [cat]);
    const row = res.rows[0];
    const sample = (row.sample_ids || []).slice(0, 4).join(', ');
    console.log(`${cat.padEnd(16)}: ${String(row.rest_count).padStart(2)} eligible brands, ${String(row.branch_count).padStart(3)} branches | sample: [${sample}]`);
  }

  // Setup test room for deck generation
  await db.exec(`
    CREATE OR REPLACE FUNCTION test_create_deck(p_category text, p_eating_mode text DEFAULT 'both', p_district text DEFAULT 'al_rawdah')
    RETURNS jsonb LANGUAGE plpgsql AS $$
    DECLARE
      v_room_id uuid := gen_random_uuid();
      v_host_id uuid := gen_random_uuid();
      v_token text := 'test_token_' || replace(gen_random_uuid()::text, '-', '');
      v_deck jsonb;
    BEGIN
      INSERT INTO public.rooms (
        id, code, stage, room_mode, city, neighborhood, eating_mode, winning_category, swiping_started_at
      ) VALUES (
        v_room_id, upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), 'swiping', 'food', 'jeddah', p_district, p_eating_mode, p_category, clock_timestamp()
      );

      INSERT INTO public.participants (id, room_id, nickname, session_token, is_host, player_color, player_shape, status)
      VALUES (v_host_id, v_room_id, 'Tester', v_token, true, '#FBBF24', 'circle', 'active');

      v_deck := private.create_restaurant_deck(v_room_id, v_host_id, v_token);
      RETURN v_deck;
    END;
    $$;
  `);

  console.log('\n======================================================');
  console.log('TESTING DECK GENERATION FOR ALL 15 CATEGORIES');
  console.log('======================================================');

  for (const cat of activeCategories) {
    try {
      const res = await db.query(`SELECT test_create_deck($1) as deck`, [cat]);
      const deck = res.rows[0].deck;
      const cards = deck.restaurants || deck.cards || [];
      const brandIds = cards.map(c => c.id || c.restaurant_id);
      console.log(`✓ ${cat.padEnd(16)}: generated ${cards.length} cards | brands: ${brandIds.join(', ')}`);
    } catch (err) {
      console.error(`✗ ${cat.padEnd(16)}: ERROR generating deck: ${err.message}`);
    }
  }

  console.log('\n======================================================');
  console.log('TESTING BREAKFAST MODE');
  console.log('======================================================');
  const breakfastTestCats = ['street_folk', 'sandwiches', 'fatayer', 'breakfast'];
  for (const cat of breakfastTestCats) {
    try {
      const res = await db.query(`
        SELECT test_create_deck($1, 'both', 'al_rawdah') as deck
      `, [cat]);
      const deck = res.rows[0].deck;
      const cards = deck.restaurants || deck.cards || [];
      const brandIds = cards.map(c => c.id || c.restaurant_id);
      console.log(`✓ Breakfast [${cat.padEnd(12)}]: generated ${cards.length} cards | brands: ${brandIds.join(', ')}`);
    } catch (err) {
      console.log(`ℹ Breakfast [${cat.padEnd(12)}]: ${err.message}`);
    }
  }

  console.log('\n======================================================');
  console.log('FOCUSED FRIED CHICKEN DECK COMPOSITION AUDIT (25 DRAWS)');
  console.log('======================================================');
  const rotationPool = ['rami_broast', 'broast_hanoo'];
  const seenRotationMembers = new Set();
  const seenPositions = new Set();

  for (let i = 1; i <= 25; i++) {
    try {
      const res = await db.query(`SELECT test_create_deck('fried_chicken', 'both', 'al_rawdah') as deck`);
      const deck = res.rows[0].deck;
      const cards = deck.restaurants || deck.cards || [];
      if (cards.length !== 7) throw new Error(`Draw ${i} expected 7 cards, got ${cards.length}`);

      const rotCards = cards.filter(c => rotationPool.includes(c.id));
      const genCards = cards.filter(c => !rotationPool.includes(c.id));

      if (rotCards.length !== 1) {
        throw new Error(`Draw ${i} expected 1 rotation card, got ${rotCards.length} (${rotCards.map(c => c.id)})`);
      }
      if (genCards.length !== 6) {
        throw new Error(`Draw ${i} expected 6 general cards, got ${genCards.length}`);
      }

      const rotCard = rotCards[0];
      seenRotationMembers.add(rotCard.id);
      const pos = cards.findIndex(c => c.id === rotCard.id);
      seenPositions.add(pos);
    } catch (err) {
      console.error(`Draw ${i} ERROR:`, err.message);
      throw err;
    }
  }

  console.log(`✓ All 25 Fried Chicken decks contain exactly 7 cards`);
  console.log(`✓ All 25 Fried Chicken decks contain exactly 1 rotation card + 6 general cards`);
  console.log(`✓ Rotation variety observed across draws: [${[...seenRotationMembers].join(', ')}]`);
  console.log(`✓ Shuffled positions observed across draws: [${[...seenPositions].sort().map(p => p+1).join(', ')}]`);
  if (seenRotationMembers.size < 2) throw new Error('Rotation pool should rotate across draws');
  if (seenPositions.size < 3) throw new Error('Rotation card position should be randomized');

  console.log('\n======================================================');
  console.log('OVERLAP ANALYSIS');
  console.log('======================================================');

  // Unified Fried Chicken Category Verification
  const friedBrands = await db.query(`
    SELECT DISTINCT r.id FROM public.restaurants r
    WHERE (r.primary_category = 'fried_chicken' OR 'fried_chicken' = ANY(r.categories))
      AND r.research_use IN ('production_ready', 'usable_with_caution')
  `);
  const broastPrimaryBrands = await db.query(`
    SELECT DISTINCT r.id FROM public.restaurants r
    WHERE r.primary_category = 'broast' OR 'broast' = ANY(r.categories)
  `);
  const traditionalBroastSubtypeBrands = await db.query(`
    SELECT DISTINCT r.id FROM public.restaurants r
    WHERE 'traditional_broast' = ANY(r.secondary_categories) OR 'traditional_broast' = ANY(r.subcategories)
  `);
  const fcBranches = await db.query(`
    SELECT count(rb.id)::int as branch_count
    FROM public.restaurant_branches rb
    JOIN public.restaurants r ON r.id = rb.restaurant_id
    WHERE r.primary_category = 'fried_chicken' AND rb.branch_status NOT IN ('temporarily_closed', 'permanently_closed')
  `);

  console.log(`Unified Fried Chicken brands: ${friedBrands.rows.length} (expected 18)`);
  console.log(`Unified Fried Chicken active branches: ${fcBranches.rows[0].branch_count} (expected 73)`);
  console.log(`Active user-facing 'broast' category brands: ${broastPrimaryBrands.rows.length} (expected 0)`);
  console.log(`Preserved 'traditional_broast' subtype intelligence brands: ${traditionalBroastSubtypeBrands.rows.length} (${traditionalBroastSubtypeBrands.rows.map(r => r.id).join(', ')})`);

  if (friedBrands.rows.length !== 18) throw new Error(`Expected 18 Fried Chicken brands, got ${friedBrands.rows.length}`);
  if (fcBranches.rows[0].branch_count !== 73) throw new Error(`Expected 73 Fried Chicken branches, got ${fcBranches.rows[0].branch_count}`);

  // Asian vs Sushi overlap
  const asianBrands = await db.query(`
    SELECT DISTINCT r.id FROM public.restaurants r
    WHERE r.primary_category = 'asian' OR 'asian' = ANY(r.categories) OR 'asian' = ANY(r.secondary_categories)
  `);
  const sushiBrands = await db.query(`
    SELECT DISTINCT r.id FROM public.restaurants r
    WHERE r.primary_category = 'sushi' OR 'sushi' = ANY(r.categories) OR 'sushi' = ANY(r.secondary_categories)
  `);
  const aSet = new Set(asianBrands.rows.map(r => r.id));
  const sSet = new Set(sushiBrands.rows.map(r => r.id));
  const asianSushiOverlap = [...aSet].filter(id => sSet.has(id));
  const asianOnly = [...aSet].filter(id => !sSet.has(id));
  const sushiOnly = [...sSet].filter(id => !aSet.has(id));
  console.log(`\nAsian brands count: ${aSet.size}`);
  console.log(`Sushi brands count: ${sSet.size}`);
  console.log(`Intentional Overlap count: ${asianSushiOverlap.length} (${asianSushiOverlap.join(', ')})`);
  console.log(`Asian-only brands (${asianOnly.length}): ${asianOnly.join(', ')}`);
  console.log(`Sushi-only brands (${sushiOnly.length}): ${sushiOnly.join(', ')}`);
}

main().catch(err => {
  console.error('TOP LEVEL ERROR:', err.message);
  process.exit(1);
});
