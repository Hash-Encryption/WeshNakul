import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';

console.log('--- WESHNAKUL PIZZA CONTROLLED CROSSOVER ALGORITHM VERIFICATION ---');

const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  const { normalizeRestaurantDeck } = await viteServer.ssrLoadModule('/src/lib/restaurantNormalization.ts');
  const { getPizzaBrandImage } = await viteServer.ssrLoadModule('/src/data/pizzaBrandImages.ts');

  const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
  const { PGlite } = await import(pathToFileURL(runtime).href);
  const db = new PGlite();
  const migration = (f) => fs.readFileSync(`supabase/migrations/${f}`, 'utf8').replace(/^\uFEFF/, '');

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
    '20260916000100_global_fair_draw_and_immediate_flow.sql',
    '20260917000100_harden_global_fair_draw.sql',
    '20260918000100_room_modes_preferences_and_suggestions.sql',
    '20260919000100_clean_food_categories.sql',
    '20260919000200_repair_secure_fair_draw.sql',
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
    '20260928000300_jeddah_asian_catalog.sql',
    '20260928000400_category_taxonomy_corrections.sql',
    '20260928000500_progressive_geography_widening.sql',
    '20261001000100_expand_jeddah_shawarma_20_brands.sql',
    '20261003000100_top5_wildcard_consensus_selection.sql',
    '20261007000100_merge_broast_into_fried_chicken.sql',
    '20261007000200_fried_chicken_deck_broast_rotation.sql',
    '20261007000300_retire_al_najah_broast.sql',
    '20261008000100_curated_grills_catalog_followup.sql',
    '20261008000200_fix_texas_roadhouse_grill_taxonomy.sql',
    '20261008000300_pizza_controlled_crossover_selection.sql',
  ];

  for (const f of mChain) {
    let sql = migration(f).replace(/create extension if not exists "pgcrypto";/gi, '');
    if (f === '20260917000100_harden_global_fair_draw.sql' || f === '20260919000200_repair_secure_fair_draw.sql') {
      sql = sql.replace(/DO \$\$[\s\S]*?END \$\$;/m, '');
    }
    await db.exec(sql);
    if (f === '005_create_and_seed_restaurants.sql') {
      await db.exec('ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE (room_id, session_token);');
    }
    if (f === '20260917000100_harden_global_fair_draw.sql' || f === '20260919000200_repair_secure_fair_draw.sql') {
      await db.exec(`CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea LANGUAGE sql VOLATILE AS $$ SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex') $$;`);
    }
  }

  // Setup deck creation helper
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

  const primaryIdsRes = await db.query(`SELECT id FROM public.restaurants WHERE primary_category = 'pizza'`);
  const primaryIdSet = new Set(primaryIdsRes.rows.map((r) => r.id));

  // --- CHECK 1: Production state (no crossovers approved yet) ---
  // When no crossovers have approved images, generate all 7 cards from the 18 primary Pizza brands.
  let deck7PrimaryCount = 0;
  const drawnRestaurantIds = new Set();

  for (let i = 1; i <= 50; i++) {
    const rawRes = await db.query(`SELECT test_create_deck('pizza') as deck`);
    const rawDeck = rawRes.rows[0].deck;
    const normDeck = normalizeRestaurantDeck(rawDeck);

    assert.ok(normDeck, `Draw #${i}: normalizeRestaurantDeck must return valid deck`);
    assert.equal(normDeck.restaurants.length, 7, `Draw #${i}: Every Pizza deck must contain exactly 7 cards`);

    const crossovers = [];
    normDeck.restaurants.forEach((card) => {
      drawnRestaurantIds.add(card.id);

      // Verify image exists, is non-empty, and belongs to one of the 18 approved primary brands
      assert.ok(card.imageUrl, `Draw #${i}, Card ${card.id}: Must have non-null imageUrl`);
      const fullPath = join('public', card.imageUrl.replace(/^\//, ''));
      assert.ok(fs.existsSync(fullPath), `Draw #${i}, Card ${card.id}: Image file must exist on disk: ${fullPath}`);

      if (!primaryIdSet.has(card.id)) {
        crossovers.push(card.id);
      }
    });

    assert.equal(crossovers.length, 0, `Draw #${i}: While no crossover is approved, deck must contain 0 crossovers. Found: ${crossovers.join(', ')}`);
    deck7PrimaryCount++;
  }

  console.log(`✓ 50 Pizza draws in production state: Exactly 7 cards in all 50 decks`);
  console.log(`✓ 100% primary Pizza brands: ${deck7PrimaryCount} / 50 decks drew strictly from the 18 primary Pizza brands`);
  console.log(`✓ Zero unapproved crossovers: 0 crossovers appeared across 350 drawn cards`);
  console.log(`✓ No missing food images: 350 / 350 cards across 50 draws had valid local images`);
  assert.ok(drawnRestaurantIds.size >= 12, `Fair brand variety; observed ${drawnRestaurantIds.size} unique brands across draws`);

  // --- CHECK 2: Future crossover capability (at most 1 optional crossover when approved) ---
  // Temporarily approve a crossover candidate in DB to verify algorithm enforcement
  await db.exec(`INSERT INTO private.pizza_approved_crossovers (restaurant_id, notes) VALUES ('san_carlo_cicchetti', 'test') ON CONFLICT DO NOTHING;`);
  let testCrossoverDeckCount = 0;
  let testPurePrimaryDeckCount = 0;
  const observedCrossoverPositions = new Set();

  for (let i = 1; i <= 50; i++) {
    const rawRes = await db.query(`SELECT test_create_deck('pizza') as deck`);
    const rawDeck = rawRes.rows[0].deck;
    const normDeck = normalizeRestaurantDeck(rawDeck);
    assert.equal(normDeck.restaurants.length, 7);

    const crossovers = [];
    normDeck.restaurants.forEach((card, pos) => {
      if (!primaryIdSet.has(card.id)) {
        crossovers.push({ id: card.id, position: pos + 1 });
        observedCrossoverPositions.add(pos + 1);
      }
    });

    // Rule: At most 1 crossover per deck, never 2+
    assert.ok(crossovers.length <= 1, `Draw #${i}: Never allow 2+ crossovers in a Pizza deck! Got ${crossovers.length}`);
    if (crossovers.length === 1) {
      testCrossoverDeckCount++;
      assert.equal(crossovers[0].id, 'san_carlo_cicchetti');
    } else {
      testPurePrimaryDeckCount++;
    }
  }

  console.log(`✓ Future crossover capability verified: at most 1 optional crossover per 7-card deck`);
  console.log(`  - Decks with 6 Pizza + 1 crossover: ${testCrossoverDeckCount} / 50`);
  console.log(`  - Decks with 7 primary Pizza cards: ${testPurePrimaryDeckCount} / 50`);
  console.log(`  - Never 2+ crossovers: 0 violations across 50 draws`);
  assert.ok(testCrossoverDeckCount > 0, 'Must produce decks with crossover when approved');
  assert.ok(testPurePrimaryDeckCount > 0, 'Must produce decks with 7 primary Pizza cards (crossover is optional)');
  assert.ok(observedCrossoverPositions.size >= 3, `Crossover position must be shuffled fairly; observed positions: [${[...observedCrossoverPositions].sort().join(', ')}]`);

  // Restore production state (empty crossover table)
  await db.exec(`TRUNCATE private.pizza_approved_crossovers;`);
  
  const testDistricts = ['al_rawdah', 'al_shati', 'al_mohammadiyyah', 'al_samer', 'al_marwah'];
  for (const dist of testDistricts) {
    const rawRes = await db.query(`SELECT test_create_deck('pizza', 'both', $1) as deck`, [dist]);
    const normDeck = normalizeRestaurantDeck(rawRes.rows[0].deck);
    assert.equal(normDeck.restaurants.length, 7, `District ${dist} must generate full 7 cards via progressive widening`);
  }
  console.log(`✓ Progressive geography widening preserved across 5 sample districts`);

  // --- CHECK 4: No regressions to other categories ---
  const otherCategories = ['burger', 'shawarma', 'fried_chicken', 'rice', 'grill', 'sushi', 'italian'];
  for (const cat of otherCategories) {
    const rawRes = await db.query(`SELECT test_create_deck($1) as deck`, [cat]);
    const normDeck = normalizeRestaurantDeck(rawRes.rows[0].deck);
    assert.equal(normDeck.restaurants.length, 7, `Category ${cat} must continue generating 7 cards`);
  }
  console.log(`✓ No regressions to other categories (Burger, Shawarma, Fried Chicken, Grills, Rice, Sushi, Italian all passed)`);

  console.log('\nALL PIZZA DECK ALGORITHM VERIFICATION CHECKS PASSED!');
} finally {
  await viteServer.close();
}
