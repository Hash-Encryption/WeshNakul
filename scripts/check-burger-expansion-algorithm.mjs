import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const { PGlite } = await import(pathToFileURL(runtime).href);
const db = new PGlite();
const migration = file => readFileSync(`supabase/migrations/${file}`, 'utf8').replace(/^\uFEFF/, '');
const query = async sql => (await db.query(sql)).rows;
let checks = 0;
const check = value => { assert(value); checks++; };

const CORE_BRAND_IDS = [
  'section_b', 'california_burger', 'century_burger', 'chefs_burger', 'sign_burger',
  'nora_burger', 'wbj', 'lou_burger', 'pplr', 'smash_me'
];

const EXPANSION_BRAND_IDS = [
  'black_tap', 'fatt', 'burger_boutique', 'place', 'score',
  'smpl_brgr', 'bunco_burger', 'mmmm_burger', 'the_plan', 'im_hungry', 'brgr1983'
];

const ALL_BURGER_BRAND_IDS = [...CORE_BRAND_IDS, ...EXPANSION_BRAND_IDS];

console.log('--- WESHNAKUL BURGER DECK ALGORITHM & EXPANSION VALIDATION ---');

try {
  // 1. Setup base database & run all migrations up to our new expansion migration
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');
  for (const file of [
    '20260902_initial_schema.sql',
    '002_food_consensus.sql',
    '003_restaurant_swipes.sql',
    '005_create_and_seed_restaurants.sql',
    '006_squad_order_scratchpad.sql',
    '007_room_expiration_and_cleanup.sql',
    '20260908000100_restaurant_intelligence.sql',
    '20260908000200_restaurant_legacy_provenance.sql',
    '20260908000300_room_host_coordinates.sql',
  ]) {
    await db.exec(migration(file).replace('create extension if not exists "pgcrypto";', ''));
  }
  await db.exec('ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE (room_id, session_token);');
  for (const file of [
    '20260909000100_private_restaurant_decks.sql',
    '20260909000200_private_participant_sessions.sql',
    '20260910000100_jeddah_geography_intelligence.sql',
    '20260911000100_jeddah_burger_google_verified_catalog.sql',
    '20260911000200_remove_legacy_public_room_coordinates.sql',
    '20260911000300_phase3_authoritative_consensus.sql',
    '20260912000100_allow_voting_stage_joins.sql',
    '20260913000100_decision_game_and_tie_corrections.sql',
    '20260916000100_global_fair_draw_and_immediate_flow.sql',
  ]) {
    await db.exec(migration(file));
  }
  await db.exec(
    migration('20260917000100_harden_global_fair_draw.sql')
      .replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '')
      .replace(/DO \$\$[\s\S]*?END \$\$;/m, '')
  );
  await db.exec(
    `CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea LANGUAGE sql VOLATILE AS $$ SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex') $$;`
  );
  for (const file of [
    '20260918000100_room_modes_preferences_and_suggestions.sql',
    '20260919000100_clean_food_categories.sql',
  ]) {
    await db.exec(migration(file));
  }
  await db.exec(
    migration('20260919000200_repair_secure_fair_draw.sql')
      .replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '')
      .replace(/DO \$\$[\s\S]*?END \$\$;/m, '')
  );
  for (const file of [
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
    '20260928000100_jeddah_burger_expansion_and_deck_algorithm.sql'
  ]) {
    await db.exec(migration(file));
  }

  // -------------------------------------------------------------
  // TEST SECTION 1: Catalog Integrity & Brand Classification
  // -------------------------------------------------------------
  console.log('1. Validating 21 Burger Brands & Core/Expansion Classification...');
  const burgerRows = await query(`SELECT id, core_status, primary_category, operating_status, research_use FROM restaurants WHERE id = ANY(ARRAY[${ALL_BURGER_BRAND_IDS.map(id => `'${id}'`).join(',')}]::text[])`);
  check(burgerRows.length === 21);

  const coreRows = burgerRows.filter(r => r.core_status === 'core');
  const expansionRows = burgerRows.filter(r => r.core_status === 'expansion');
  check(coreRows.length === 10);
  check(expansionRows.length === 11);
  check(CORE_BRAND_IDS.every(id => coreRows.some(r => r.id === id)));
  check(EXPANSION_BRAND_IDS.every(id => expansionRows.some(r => r.id === id)));

  // All 21 are open and production ready / usable with caution
  check(burgerRows.every(r => r.primary_category === 'burger' && r.operating_status === 'open' && ['production_ready', 'usable_with_caution'].includes(r.research_use)));

  // -------------------------------------------------------------
  // TEST SECTION 2: Branch Geographies & Best Sellers
  // -------------------------------------------------------------
  console.log('2. Validating Physical Branch Geographies (47 total branches)...');
  const coreBranchCount = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id = ANY(ARRAY[${CORE_BRAND_IDS.map(id => `'${id}'`).join(',')}]::text[])`))[0].n;
  const expansionBranchCount = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id = ANY(ARRAY[${EXPANSION_BRAND_IDS.map(id => `'${id}'`).join(',')}]::text[])`))[0].n;
  check(coreBranchCount === 33);
  check(expansionBranchCount === 14);

  // Check verified attributes for all expansion branches
  const expansionBranches = await query(`
    SELECT b.*
    FROM restaurant_branches b
    WHERE b.restaurant_id = ANY(ARRAY[${EXPANSION_BRAND_IDS.map(id => `'${id}'`).join(',')}]::text[])
  `);
  check(expansionBranches.length === 14);
  check(expansionBranches.every(b =>
    b.google_place_id &&
    b.google_maps_url &&
    b.latitude != null &&
    b.longitude != null &&
    b.address_en &&
    b.google_rating != null &&
    b.google_review_count > 0 &&
    b.district
  ));

  // Verify signature best sellers exist for expansion brands
  const expansionBestSellers = await query(`
    SELECT count(DISTINCT restaurant_id)::int n
    FROM restaurant_best_sellers
    WHERE restaurant_id = ANY(ARRAY[${EXPANSION_BRAND_IDS.map(id => `'${id}'`).join(',')}]::text[]) AND is_signature = true
  `);
  check(expansionBestSellers[0].n === 11);

  // -------------------------------------------------------------
  // TEST SECTION 3: Hard Burger Rule (>=1 Core Brand Guarantee)
  // -------------------------------------------------------------
  console.log('3. Validating Hard Burger Rule Across 120 Draws in Central Jeddah...');
  const testRoomId = '10000000-0000-4000-8000-000000000021';
  const testHostId = '20000000-0000-4000-8000-000000000021';
  const testToken = 'burger-eval-host';

  // Al-Rawdah room (central Jeddah where multiple core and expansion brands have branches)
  await db.exec(`
    INSERT INTO rooms(id, code, status, eating_mode, city, neighborhood, language, host_participant_id, current_stage, stage, winning_category, swiping_started_at)
    VALUES ('${testRoomId}', 'B021', 'restaurant_selection', 'any', 'jeddah', 'Al-Rawdah', 'en', '${testHostId}', 'swiping', 'swiping', 'burger', '2026-09-28T12:00:00Z');
    INSERT INTO participants(id, room_id, session_token, nickname, player_color, player_shape, is_host)
    VALUES ('${testHostId}', '${testRoomId}', '${testToken}', 'Host', '#55B96A', 'circle', true);
    SELECT public.set_room_location('${testRoomId}', '${testHostId}', '${testToken}', 21.56, 39.16);
  `);

  let zeroCoreCount = 0;
  let singleCoreCount = 0;
  let multiCoreCount = 0; // >= 2 core brands
  const coreBrandOccurrences = new Map(CORE_BRAND_IDS.map(id => [id, 0]));
  const expansionBrandOccurrences = new Map(EXPANSION_BRAND_IDS.map(id => [id, 0]));
  const corePositionHistogram = [0, 0, 0, 0, 0, 0, 0]; // 0-indexed positions 0..6

  await db.exec('SET ROLE anon');

  for (let i = 0; i < 120; i++) {
    // Generate fresh room to test first-deck generation randomness
    const sampleRoom = `30000000-0000-4000-8000-${String(i).padStart(12, '0')}`;
    const sampleHost = `40000000-0000-4000-8000-${String(i).padStart(12, '0')}`;
    await db.exec(`
      RESET ROLE;
      INSERT INTO rooms(id, code, status, eating_mode, city, neighborhood, language, host_participant_id, current_stage, stage, winning_category, swiping_started_at)
      VALUES ('${sampleRoom}', 'R${i}', 'restaurant_selection', 'any', 'jeddah', 'Al-Rawdah', 'en', '${sampleHost}', 'swiping', 'swiping', 'burger', now());
      INSERT INTO participants(id, room_id, session_token, nickname, player_color, player_shape, is_host)
      VALUES ('${sampleHost}', '${sampleRoom}', 'tok-${i}', 'Host', '#55B96A', 'circle', true);
      SELECT public.set_room_location('${sampleRoom}', '${sampleHost}', 'tok-${i}', 21.56, 39.16);
      SET ROLE anon;
    `);

    const deckResult = (await query(`SELECT public.get_or_create_restaurant_deck('${sampleRoom}', '${sampleHost}', 'tok-${i}', NULL) deck`))[0].deck;

    if (deckResult.restaurants.length !== 7) {
      console.log('Deck result on iteration', i, 'had length', deckResult.restaurants.length, deckResult.restaurants);
    }
    // Deck size must be exactly 7
    check(deckResult.restaurants.length === 7);

    // All restaurants must have unique IDs
    const deckIds = deckResult.restaurants.map(r => r.id);
    check(new Set(deckIds).size === 7);

    const coreInDeck = deckResult.restaurants.filter(r => r.coreStatus === 'core' || CORE_BRAND_IDS.includes(r.id));
    const expansionInDeck = deckResult.restaurants.filter(r => r.coreStatus === 'expansion' || EXPANSION_BRAND_IDS.includes(r.id));

    if (coreInDeck.length === 0) {
      console.log('ZERO CORE DETECTED on iteration', i, deckResult.restaurants);
      zeroCoreCount++;
    } else if (coreInDeck.length === 1) {
      singleCoreCount++;
    } else {
      multiCoreCount++;
    }

    coreInDeck.forEach(c => {
      coreBrandOccurrences.set(c.id, (coreBrandOccurrences.get(c.id) || 0) + 1);
      const pos = deckResult.restaurants.findIndex(r => r.id === c.id);
      if (pos >= 0 && pos < 7) {
        corePositionHistogram[pos]++;
      }
    });

    expansionInDeck.forEach(e => {
      expansionBrandOccurrences.set(e.id, (expansionBrandOccurrences.get(e.id) || 0) + 1);
    });

    // Privacy check: No latitude or longitude leaked in deck payload
    const deckJson = JSON.stringify(deckResult);
    check(!deckJson.match(/latitude|longitude/i));
  }

  await db.exec('RESET ROLE');

  console.log(`Core Distribution over 120 draws:`);
  console.log(`- Zero Core: ${zeroCoreCount} (Must be 0)`);
  console.log(`- Exactly 1 Core: ${singleCoreCount}`);
  console.log(`- Multi-Core (>=2): ${multiCoreCount}`);
  console.log(`- Core Position Histogram [Pos 1..7]: ${JSON.stringify(corePositionHistogram)}`);

  // HARD BURGER RULE: 0 core is strictly banned when eligible core brands exist
  check(zeroCoreCount === 0);

  // Deck can naturally contain > 1 core brand (e.g. 2, 3, 4 core brands) — not restricted to exactly 1
  check(multiCoreCount > 0);

  // Core brands are not hard-coded to a single brand: check variety among core brands
  const selectedCoreBrands = [...coreBrandOccurrences.entries()].filter(([_, count]) => count > 0);
  console.log(`Selected Core Brand Count: ${selectedCoreBrands.length} of ${CORE_BRAND_IDS.length}`);
  check(selectedCoreBrands.length >= 8); // At least 8 of the 10 core brands were drawn across 120 draws

  // Expansion brands appear normally
  const selectedExpansionBrands = [...expansionBrandOccurrences.entries()].filter(([_, count]) => count > 0);
  console.log(`Selected Expansion Brand Count: ${selectedExpansionBrands.length} of ${EXPANSION_BRAND_IDS.length}`);
  check(selectedExpansionBrands.length >= 8); // At least 8 of the 11 expansion brands were drawn

  // Core brand position is shuffled and distributed across positions 1..7 (not pinned to position 0)
  check(corePositionHistogram.every(count => count > 0)); // Every position 1..7 received core cards

  // -------------------------------------------------------------
  // TEST SECTION 4: Location & Use-case Distance Limits
  // -------------------------------------------------------------
  console.log('4. Validating Use-Case Distance Limits & Distance Bounds...');
  // Check delivery mode: radius <= 14km (or <= 8km if nearby filter is active)
  const deliveryRoom = '50000000-0000-4000-8000-000000000001';
  const deliveryHost = '60000000-0000-4000-8000-000000000001';
  await db.exec(`
    INSERT INTO rooms(id, code, status, eating_mode, city, preferences, host_participant_id, current_stage, stage, winning_category, swiping_started_at)
    VALUES ('${deliveryRoom}', 'DEL1', 'restaurant_selection', 'delivery', 'jeddah', ARRAY['nearby']::text[], '${deliveryHost}', 'swiping', 'swiping', 'burger', now());
    INSERT INTO participants(id, room_id, session_token, nickname, player_color, player_shape, is_host)
    VALUES ('${deliveryHost}', '${deliveryRoom}', 'tok-del', 'Host', '#55B96A', 'circle', true);
    SELECT public.set_room_location('${deliveryRoom}', '${deliveryHost}', 'tok-del', 21.56, 39.16);
  `);
  await db.exec('SET ROLE anon');
  const deliveryDeck = (await query(`SELECT public.get_or_create_restaurant_deck('${deliveryRoom}', '${deliveryHost}', 'tok-del', NULL) deck`))[0].deck;
  await db.exec('RESET ROLE');

  check(deliveryDeck.restaurants.length === 7);
  console.log('Delivery deck distances:', deliveryDeck.restaurants.map(r => ({ id: r.id, dist: r.selectedBranch?.distanceKm })));
  // All selected branches in delivery + nearby must be <= 8.0 km
  check(deliveryDeck.restaurants.every(r => r.selectedBranch && r.selectedBranch.distanceKm <= 8.0));

  // -------------------------------------------------------------
  // TEST SECTION 5: Edge Case — Zero Eligible Core Available
  // -------------------------------------------------------------
  console.log('5. Validating Edge Case: 0 Eligible Core Brands Available (Safety Fallback)...');
  // Synthetic room location far in North Obhur (lat: 21.85, lon: 39.05) with tight nearby delivery (<= 8km)
  // where only local northern expansion brands like Bunco Burger / The Plan exist, but 0 core brands reach.
  const remoteRoom = '50000000-0000-4000-8000-000000000002';
  const remoteHost = '60000000-0000-4000-8000-000000000002';
  await db.exec(`
    INSERT INTO rooms(id, code, status, eating_mode, city, preferences, host_participant_id, current_stage, stage, winning_category, swiping_started_at)
    VALUES ('${remoteRoom}', 'FAR1', 'restaurant_selection', 'delivery', 'jeddah', ARRAY['nearby']::text[], '${remoteHost}', 'swiping', 'swiping', 'burger', now());
    INSERT INTO participants(id, room_id, session_token, nickname, player_color, player_shape, is_host)
    VALUES ('${remoteHost}', '${remoteRoom}', 'tok-far', 'Host', '#55B96A', 'circle', true);
    -- 21.80 is far north (North Obhur / Al Murjan)
    SELECT public.set_room_location('${remoteRoom}', '${remoteHost}', 'tok-far', 21.75, 39.12);
  `);
  await db.exec('SET ROLE anon');
  const remoteDeck = (await query(`SELECT public.get_or_create_restaurant_deck('${remoteRoom}', '${remoteHost}', 'tok-far', NULL) deck`))[0].deck;
  await db.exec('RESET ROLE');

  console.log('Remote deck restaurants:', remoteDeck.restaurants.map(r => ({ id: r.id, core: r.coreStatus, dist: r.selectedBranch?.distanceKm })));
  check(remoteDeck.restaurants.length > 0);
  check(remoteDeck.restaurants.every(r => r.selectedBranch && r.selectedBranch.distanceKm <= 8.0));
  // Ineligible far core branches must NOT be included merely to satisfy core guarantee
  const farCoreBranches = remoteDeck.restaurants.filter(r => r.coreStatus === 'core' && r.selectedBranch.distanceKm > 8.0);
  check(farCoreBranches.length === 0);

  // -------------------------------------------------------------
  // TEST SECTION 6: Redraw & Repeat Protection
  // -------------------------------------------------------------
  console.log('6. Validating Consecutive Redraw & Repeat Protection...');
  const redrawRoom = '50000000-0000-4000-8000-000000000003';
  const redrawHost = '60000000-0000-4000-8000-000000000003';
  await db.exec(`
    INSERT INTO rooms(id, code, status, eating_mode, city, host_participant_id, current_stage, stage, winning_category, swiping_started_at)
    VALUES ('${redrawRoom}', 'RED1', 'restaurant_selection', 'any', 'jeddah', '${redrawHost}', 'swiping', 'swiping', 'burger', now());
    INSERT INTO participants(id, room_id, session_token, nickname, player_color, player_shape, is_host)
    VALUES ('${redrawHost}', '${redrawRoom}', 'tok-red', 'Host', '#55B96A', 'circle', true);
    SELECT public.set_room_location('${redrawRoom}', '${redrawHost}', 'tok-red', 21.56, 39.16);
  `);

  await db.exec('SET ROLE anon');
  const gen0 = (await query(`SELECT public.get_or_create_restaurant_deck('${redrawRoom}', '${redrawHost}', 'tok-red', NULL) deck`))[0].deck;
  await db.exec('RESET ROLE');
  const gen1 = (await query(`SELECT private.create_restaurant_deck('${redrawRoom}', '${redrawHost}', 'tok-red', '${gen0.deckId}') deck`))[0].deck;

  check(gen0.generation === 0 && gen0.restaurants.length === 7);
  check(gen1.generation === 1 && gen1.restaurants.length === 7);

  // In gen1, candidates not in gen0 should be preferred
  const gen0Ids = new Set(gen0.restaurants.map(r => r.id));
  const newInGen1 = gen1.restaurants.filter(r => !gen0Ids.has(r.id));
  console.log(`Gen 1 new unseen brands: ${newInGen1.length} of 7`);
  check(newInGen1.length >= 5); // At least 5 of 7 cards in gen 1 are fresh unseen brands

  // -------------------------------------------------------------
  // TEST SECTION 7: Non-Burger Categories Unaffected
  // -------------------------------------------------------------
  console.log('7. Validating Non-Burger Categories (e.g. Shawarma, Pizza, Broast)...');
  const shawarmaRoom = '50000000-0000-4000-8000-000000000004';
  const shawarmaHost = '60000000-0000-4000-8000-000000000004';
  await db.exec(`
    INSERT INTO rooms(id, code, status, eating_mode, city, host_participant_id, current_stage, stage, winning_category, swiping_started_at)
    VALUES ('${shawarmaRoom}', 'SHW1', 'restaurant_selection', 'any', 'jeddah', '${shawarmaHost}', 'swiping', 'swiping', 'shawarma', now());
    INSERT INTO participants(id, room_id, session_token, nickname, player_color, player_shape, is_host)
    VALUES ('${shawarmaHost}', '${shawarmaRoom}', 'tok-shw', 'Host', '#55B96A', 'circle', true);
    SELECT public.set_room_location('${shawarmaRoom}', '${shawarmaHost}', 'tok-shw', 21.56, 39.16);
  `);
  await db.exec('SET ROLE anon');
  const shawarmaDeck = (await query(`SELECT public.get_or_create_restaurant_deck('${shawarmaRoom}', '${shawarmaHost}', 'tok-shw', NULL) deck`))[0].deck;
  await db.exec('RESET ROLE');

  check(shawarmaDeck.restaurants.length === 7);
  check(shawarmaDeck.restaurants.every(r => r.categories.includes('shawarma')));

  // -------------------------------------------------------------
  // TEST SECTION 8: Database Payload Delivery of coreStatus & Selected Branch
  // -------------------------------------------------------------
  console.log('8. Validating Database Payload Delivery of coreStatus...');
  check(gen0.restaurants.length === 7);
  check(gen0.restaurants.some(r => r.coreStatus === 'core'));
  check(gen0.restaurants.every(r => r.coreStatus === 'core' || r.coreStatus === 'expansion' || r.coreStatus === null));
  check(gen0.restaurants.every(r => r.selectedBranch && r.selectedBranch.id && r.selectedBranch.googleMapsUrl && r.selectedBranch.distanceKm != null));
  check(!JSON.stringify(gen0).match(/latitude|longitude/i));

  console.log(`\nALL CHECKS PASSED: ${checks} checks verified across catalog, algorithm, distance, diversity, repeats, non-burger isolation, and payload contract.`);

} finally {
  await db.close();
}
