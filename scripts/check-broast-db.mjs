import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { FOOD_CATEGORIES } from '../src/lib/consensus.ts';

const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const { PGlite } = await import(pathToFileURL(runtime).href);
const db = new PGlite();
const migration = file => readFileSync(`supabase/migrations/${file}`, 'utf8').replace(/^\uFEFF/, '');
const query = async sql => (await db.query(sql)).rows;
let checks = 0;
const check = (value, msg) => { assert(value, msg); checks++; };

const chickenBrandIds = [
  'albaik', 'raising_canes', 'kfc', 'texas_chicken', 'popeyes',
  'daves_hot_chicken', 'tndr', 'wingstop', 'crusted', 'crisper',
  'dabboos', 'sayakh', 'nashvilles_hot_chicken', 'tenders_cart',
  'rami_broast', 'chicken_mubeen', 'ktaykit', 'broast_hanoo'
];
const chickenIdsSql = chickenBrandIds.map(id => `'${id}'`).join(',');

const burgerBrandIds = ['section_b','california_burger','century_burger','chefs_burger','sign_burger','nora_burger','wbj','lou_burger','pplr','smash_me'];
const burgerIdsSql = burgerBrandIds.map(id => `'${id}'`).join(',');

try {
  console.log('1. Setting up PGlite database roles and initial schema...');
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');
  
  const migrationChain = [
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

  for (const file of migrationChain) {
    await db.exec(migration(file).replace('create extension if not exists "pgcrypto";', ''));
  }

  await db.exec('ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE (room_id, session_token);');

  const advancedMigrations1 = [
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

  for (const file of advancedMigrations1) {
    await db.exec(migration(file));
  }

  await db.exec(migration('20260917000100_harden_global_fair_draw.sql').replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '').replace(/DO \$\$[\s\S]*?END \$\$;/m, ''));
  await db.exec(`CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea LANGUAGE sql VOLATILE AS $$ SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex') $$;`);

  const advancedMigrations2 = [
    '20260918000100_room_modes_preferences_and_suggestions.sql',
    '20260919000100_clean_food_categories.sql'
  ];

  for (const file of advancedMigrations2) {
    await db.exec(migration(file));
  }

  await db.exec(
    migration('20260919000200_repair_secure_fair_draw.sql')
      .replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '')
      .replace('DROP FUNCTION IF EXISTS public.gen_random_bytes(int);', '')
      .replace(/DO \$\$[\s\S]*?END \$\$;/m, '')
  );
  await db.exec(`CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea LANGUAGE sql VOLATILE AS $$ SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex') $$;`);
  console.log('2. Base migrations applied successfully.');

  // Pre-catalog baseline assertions
  const preBurgers = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${burgerIdsSql})`))[0].n;
  check(preBurgers === 10, '10 burgers present before catalog import');
  const preBurgerBranches = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${burgerIdsSql})`))[0].n;
  check(preBurgerBranches === 33, '33 burger branches present before catalog import');

  // Verify geography state before expansion (26 districts)
  const preDistricts = (await query('SELECT count(*)::int n FROM private.district_geography'))[0].n;
  check(preDistricts === 26, '26 canonical districts present before expansion');

  console.log('3. Applying forward geography expansion migration...');
  await db.exec(migration('20260926000100_expand_jeddah_geography_30_districts.sql'));
  
  const postDistricts = (await query('SELECT count(*)::int n FROM private.district_geography'))[0].n;
  check(postDistricts === 30, '30 canonical districts present after expansion');

  const newDistrictIds = ['an_nuzhah', 'ar_rabwah', 'al_aziziyah', 'al_sharafeyah'];
  for (const dId of newDistrictIds) {
    const row = (await query(`SELECT district_id, name_en, name_ar, array_length(neighbors, 1) as neighbor_count FROM private.district_geography WHERE district_id = '${dId}'`))[0];
    check(row && row.neighbor_count > 0, `${dId} exists with neighbors`);
  }

  console.log('4. Applying remaining catalog migrations and taxonomy merge migration...');
  const remainingChain = [
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
    '20260928000100_jeddah_street_folk_food_catalog.sql',
    '20260928000100_jeddah_sushi_catalog.sql',
    '20260928000200_jeddah_mexican_catalog.sql',
    '20260928000300_jeddah_asian_catalog.sql',
    '20260928000400_category_taxonomy_corrections.sql',
    '20260928000500_progressive_geography_widening.sql',
    '20261001000100_expand_jeddah_shawarma_20_brands.sql',
    '20261003000100_top5_wildcard_consensus_selection.sql'
  ];

  for (const f of remainingChain) {
    await db.exec(migration(f));
  }

  // Pre-migration state setup for double-selection & tally regression test
  console.log('4b. Seeding pre-migration rooms with broast selections...');
  const migTestRoomActive = '11111111-0000-4000-8000-000000000001';
  const migTestPartA = '22222222-0000-4000-8000-000000000001';
  const migTestPartB = '22222222-0000-4000-8000-000000000002';
  const migTestRoomArchived = '11111111-0000-4000-8000-000000000002';

  await db.exec(`
    INSERT INTO rooms (id, code, status, stage, current_stage, eating_mode, room_mode, city, language, category_summary, tied_categories, version)
    VALUES ('${migTestRoomActive}', 'MIG1', 'category_selection', 'voting', 'voting', 'both', 'food', 'jeddah', 'ar',
      '{"status": "tie", "eligibleParticipantCount": 2, "submittedCount": 2, "tiedCategories": ["broast", "fried_chicken", "burger"], "tally": {"broast": 1, "fried_chicken": 1, "burger": 1}}'::jsonb,
      ARRAY['broast', 'fried_chicken', 'burger']::text[], 1);

    INSERT INTO participants (id, room_id, session_token, nickname, player_color, player_shape, is_host, status)
    VALUES
      ('${migTestPartA}', '${migTestRoomActive}', 'tok-miga', 'UserA', '#FF6B6B', 'star', true, 'active'),
      ('${migTestPartB}', '${migTestRoomActive}', 'tok-migb', 'UserB', '#4ECDC4', 'circle', false, 'active');

    INSERT INTO food_choices (room_id, participant_id, selected_categories, is_submitted, selection_version)
    VALUES
      ('${migTestRoomActive}', '${migTestPartA}', ARRAY['broast', 'fried_chicken']::text[], true, 1),
      ('${migTestRoomActive}', '${migTestPartB}', ARRAY['burger']::text[], true, 1);

    INSERT INTO rooms (id, code, status, stage, current_stage, eating_mode, room_mode, city, language, category_summary, winning_category, tied_categories, version)
    VALUES ('${migTestRoomArchived}', 'MIG2', 'completed', 'matched', 'matched', 'both', 'food', 'jeddah', 'ar',
      '{"status": "decided", "eligibleParticipantCount": 1, "submittedCount": 1, "winner": "broast", "tiedCategories": ["broast"], "tally": {"broast": 1, "fried_chicken": 1, "burger": 1}}'::jsonb,
      'broast', ARRAY['broast']::text[], 1);
  `);

  console.log('4c. Applying forward taxonomy merge migration (20261007000100)...');
  await db.exec(migration('20261007000100_merge_broast_into_fried_chicken.sql'));

  console.log('4d. Applying forward Fried Chicken deck Broast rotation migration (20261007000200)...');
  await db.exec(migration('20261007000200_fried_chicken_deck_broast_rotation.sql'));

  console.log('4e. Applying forward migration to retire Al Najah (20261007000300)...');
  await db.exec(migration('20261007000300_retire_al_najah_broast.sql'));

  // --- 15 MANDATORY ASSERTIONS FROM APPROVED SPECIFICATION ---

  // 1. Exactly 18 expected chicken brands still exist
  const brandCount = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${chickenIdsSql})`))[0].n;
  check(brandCount === 18, '1. Exactly 18 expected chicken brands still exist');

  // 2. Exactly 73 existing branches remain
  const branchCount = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${chickenIdsSql})`))[0].n;
  check(branchCount === 73, '2. Exactly 73 existing branches remain');

  // 3. All 18 have primary_category = 'fried_chicken'
  const fcPrimaryBrands = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE id IN (${chickenIdsSql})
      AND primary_category = 'fried_chicken'
  `))[0].n;
  check(fcPrimaryBrands === 18, '3. All 18 have primary_category = \'fried_chicken\'');

  // 4. All 18 are eligible for fried_chicken
  const fcEligibleBrands = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE id IN (${chickenIdsSql})
      AND 'fried_chicken' = ANY(categories)
  `))[0].n;
  check(fcEligibleBrands === 18, '4. All 18 are eligible for fried_chicken');

  // 5. No restaurant among these 18 uses exact 'broast' as primary category
  const broastPrimaryAmong18 = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE id IN (${chickenIdsSql})
      AND primary_category = 'broast'
  `))[0].n;
  check(broastPrimaryAmong18 === 0, '5. No restaurant among these 18 uses exact \'broast\' as primary category');

  // 6. No active user-facing restaurant category eligibility depends on exact 'broast'
  const anyBroastEligibility = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE (primary_category = 'broast' OR 'broast' = ANY(categories))
      AND research_use IN ('production_ready', 'usable_with_caution')
  `))[0].n;
  check(anyBroastEligibility === 0, '6. No active user-facing restaurant category eligibility depends on exact \'broast\'');

  // 7. Traditional Broast subtype intelligence remains present in 5 staple brands
  const traditionalBroastBrands = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE id IN ('albaik', 'rami_broast', 'chicken_mubeen', 'ktaykit', 'broast_hanoo')
      AND 'traditional_broast' = ANY(secondary_categories)
      AND 'traditional_broast' = ANY(subcategories)
  `))[0].n;
  check(traditionalBroastBrands === 5, '7a. Traditional Broast subtype intelligence remains present in 5 staple brands');

  // Al Najah is completely absent from database
  const najahInDb = (await query(`SELECT count(*)::int n FROM restaurants WHERE id = 'al_najah_broast'`))[0].n;
  check(najahInDb === 0, '7a-2. Al Najah Broast is completely absent from restaurants table');
  const najahBranchesInDb = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id = 'al_najah_broast'`))[0].n;
  check(najahBranchesInDb === 0, '7a-3. Al Najah Broast branches completely absent from restaurant_branches table');

  const musahabBrands = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE id IN ('albaik', 'ktaykit')
      AND 'musahab' = ANY(secondary_categories)
  `))[0].n;
  check(musahabBrands === 2, '7b. Musahab subtype intelligence preserved on ALBAIK and Ktaykit');

  const tendersBrands = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE id IN ('raising_canes', 'tndr', 'crisper', 'tenders_cart', 'crusted', 'daves_hot_chicken', 'dabboos')
      AND 'tenders' = ANY(secondary_categories)
  `))[0].n;
  check(tendersBrands === 7, '7c. Tenders subtype intelligence preserved across all 7 secondary_categories brands');

  const allTendersSub = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE id IN (${chickenIdsSql})
      AND 'tenders' = ANY(subcategories)
  `))[0].n;
  check(allTendersSub === 10, '7d. Tenders subcategories intelligence preserved across 10 chicken brands');

  const wingsBrand = (await query(`SELECT count(*)::int n FROM restaurants WHERE id = 'wingstop' AND 'wings' = ANY(secondary_categories)`))[0].n;
  check(wingsBrand === 1, '7e. Wings subtype preserved on Wingstop');

  const hotChickenBrands = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN ('daves_hot_chicken', 'crusted', 'nashvilles_hot_chicken') AND 'hot_chicken' = ANY(secondary_categories)`))[0].n;
  check(hotChickenBrands === 3, '7f. Hot chicken subtype preserved on Dave\'s, Crusted, Nashville\'s');

  const nashvilleBrands = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN ('daves_hot_chicken', 'crusted', 'nashvilles_hot_chicken') AND 'nashville' = ANY(secondary_categories)`))[0].n;
  check(nashvilleBrands === 3, '7g. Nashville subtype preserved on Dave\'s, Crusted, Nashville\'s');

  const chickenBurgersBrand = (await query(`SELECT count(*)::int n FROM restaurants WHERE id = 'dabboos' AND 'chicken_burgers' = ANY(secondary_categories)`))[0].n;
  check(chickenBurgersBrand === 1, '7h. Chicken burgers subtype preserved on Dabboos');

  const americanFcBrands = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN ('kfc', 'texas_chicken') AND 'american_fried_chicken' = ANY(secondary_categories)`))[0].n;
  check(americanFcBrands === 2, '7i. American fried chicken subtype preserved on KFC and Texas Chicken');

  const louisianaFcBrand = (await query(`SELECT count(*)::int n FROM restaurants WHERE id = 'popeyes' AND 'louisiana_fried_chicken' = ANY(secondary_categories)`))[0].n;
  check(louisianaFcBrand === 1, '7j. Louisiana fried chicken subtype preserved on Popeyes');

  const boneInBrands = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN ('kfc', 'texas_chicken', 'popeyes') AND 'bone_in' = ANY(subcategories)`))[0].n;
  check(boneInBrands === 3, '7k. Bone-in subcategory preserved on KFC, Texas Chicken, Popeyes');

  const stripsBrand = (await query(`SELECT count(*)::int n FROM restaurants WHERE id = 'kfc' AND 'strips' = ANY(subcategories)`))[0].n;
  check(stripsBrand === 1, '7l. Strips subcategory preserved on KFC');

  const fingersBrand = (await query(`SELECT count(*)::int n FROM restaurants WHERE id = 'raising_canes' AND 'chicken_fingers' = ANY(subcategories)`))[0].n;
  check(fingersBrand === 1, '7m. Chicken fingers subcategory preserved on Raising Cane\'s');

  const sayakhSubtypes = (await query(`SELECT count(*)::int n FROM restaurants WHERE id = 'sayakh' AND 'chicken_skewers' = ANY(subcategories) AND 'crispy_chicken' = ANY(subcategories)`))[0].n;
  check(sayakhSubtypes === 1, '7n. Chicken skewers and crispy chicken subcategories preserved on Sayakh');

  // 8. Fried Chicken deck generates 7 cards
  const roomFC = '50000000-0000-4000-8000-000000000001';
  const hostFC = '60000000-0000-4000-8000-000000000001';
  const tokenFC = 'fc-host-token';
  await db.exec(`
    INSERT INTO rooms (id, code, status, eating_mode, city, neighborhood, language, host_participant_id, current_stage, stage, winning_category, swiping_started_at)
    VALUES ('${roomFC}', 'FC99', 'restaurant_selection', 'dine_in', 'jeddah', 'Al Rawdah', 'ar', '${hostFC}', 'swiping', 'swiping', 'fried_chicken', '2026-10-07T12:00:00Z');
    INSERT INTO participants (id, room_id, session_token, nickname, player_color, player_shape, is_host)
    VALUES ('${hostFC}', '${roomFC}', '${tokenFC}', 'HostChicken', '#FF6B6B', 'star', true);
    SELECT public.set_room_location('${roomFC}', '${hostFC}', '${tokenFC}', 21.56, 39.16);
  `);

  await db.exec('SET ROLE anon');
  const deckFC = (await query(`SELECT public.get_or_create_restaurant_deck('${roomFC}', '${hostFC}', '${tokenFC}', NULL) deck`))[0].deck;
  check(deckFC.generation === 0 && deckFC.restaurants.length === 7, '8a. Fried Chicken deck generates 7 cards');
  check(deckFC.restaurants.every(r => r.categories.includes('fried_chicken')), 'All restaurants in deck are eligible for fried_chicken');
  check(deckFC.restaurants.every(r => r.selectedBranch && r.selectedBranch.googleMapsUrl && r.selectedBranch.distanceKm !== null), 'Branches have maps URLs and distance');

  const rotPool = ['rami_broast', 'broast_hanoo'];
  const rotInDeck = deckFC.restaurants.filter(r => rotPool.includes(r.id));
  const genInDeck = deckFC.restaurants.filter(r => !rotPool.includes(r.id));
  check(rotInDeck.length === 1, `8b. Exactly 1 card from rotation pool [rami_broast, broast_hanoo] (found: ${rotInDeck.map(r=>r.id)})`);
  check(genInDeck.length === 6, '8c. Exactly 6 cards from general pool');

  // Multi-draw verification
  await db.exec('RESET ROLE');
  const seenRotBrands = new Set();
  const seenRotPositions = new Set();
  for (let i = 1; i <= 20; i++) {
    const testRoom = `70000000-0000-4000-8000-${String(i).padStart(12, '0')}`;
    const testHost = `80000000-0000-4000-8000-${String(i).padStart(12, '0')}`;
    const testToken = `token-fc-draw-${i}`;
    await db.exec(`
      INSERT INTO rooms (id, code, status, eating_mode, city, neighborhood, language, host_participant_id, current_stage, stage, winning_category, swiping_started_at)
      VALUES ('${testRoom}', 'FC${String(i).padStart(2, '0')}', 'restaurant_selection', 'dine_in', 'jeddah', 'Al Rawdah', 'ar', '${testHost}', 'swiping', 'swiping', 'fried_chicken', '2026-10-07T12:00:00Z');
      INSERT INTO participants (id, room_id, session_token, nickname, player_color, player_shape, is_host)
      VALUES ('${testHost}', '${testRoom}', '${testToken}', 'User${i}', '#FF6B6B', 'star', true);
    `);
    await db.exec('SET ROLE anon');
    const d = (await query(`SELECT public.get_or_create_restaurant_deck('${testRoom}', '${testHost}', '${testToken}', NULL) deck`))[0].deck;
    await db.exec('RESET ROLE');
    check(d.restaurants.length === 7, `Draw ${i} length is 7`);
    const rCards = d.restaurants.filter(r => rotPool.includes(r.id));
    const gCards = d.restaurants.filter(r => !rotPool.includes(r.id));
    check(rCards.length === 1, `Draw ${i} has exactly 1 rotation card`);
    check(gCards.length === 6, `Draw ${i} has exactly 6 general cards`);
    seenRotBrands.add(rCards[0].id);
    const pos = d.restaurants.findIndex(r => r.id === rCards[0].id);
    seenRotPositions.add(pos);
  }
  check(seenRotBrands.size >= 2, '8d. Rotation pool rotates dynamically across draws');
  check(seenRotPositions.size >= 3, '8e. Rotation card position is randomized within the deck');

  // 9. private.allowed_categories('food') contains 'fried_chicken'
  const allowedFood = (await query(`SELECT private.allowed_categories('food') cats`))[0].cats;
  check(allowedFood.includes('fried_chicken'), '9. private.allowed_categories(\'food\') contains \'fried_chicken\'');

  // 10. private.allowed_categories('food') does NOT contain 'broast'
  check(!allowedFood.includes('broast'), '10. private.allowed_categories(\'food\') does NOT contain \'broast\'');
  check(allowedFood.length === 15, 'Food taxonomy has exactly 15 concrete categories');

  // 11. Frontend FOOD_CATEGORIES contains Fried Chicken once
  const fcCountFrontend = FOOD_CATEGORIES.filter(c => c.id === 'fried_chicken').length;
  check(fcCountFrontend === 1, '11. Frontend FOOD_CATEGORIES contains Fried Chicken once');

  // 12. Frontend FOOD_CATEGORIES contains no Broast card
  const broastInFrontend = FOOD_CATEGORIES.some(c => c.id === 'broast');
  check(!broastInFrontend, '12. Frontend FOOD_CATEGORIES contains no Broast card');

  // 13. Existing 73 Google Place IDs remain unchanged (75 minus 2 retired Al Najah branches)
  const jsonRaw = JSON.parse(readFileSync('docs/research/jeddah-broast-pass-d-corrected.json', 'utf8'));
  const jsonPlaceIds = new Set(
    jsonRaw.brands
      .filter(b => b.canonical_name !== 'Al Najah Broast')
      .flatMap(b => b.branches.map(br => br.google_place_id))
  );
  check(jsonPlaceIds.size === 73, 'Source JSON minus Al Najah contains exactly 73 unique place IDs');

  const dbPlaceIdRows = await query(`
    SELECT google_place_id
    FROM restaurant_branches
    WHERE restaurant_id IN (${chickenIdsSql})
  `);
  const dbPlaceIds = new Set(dbPlaceIdRows.map(r => r.google_place_id));
  const missingPlaceIds = [...jsonPlaceIds].filter(id => !dbPlaceIds.has(id));
  check(missingPlaceIds.length === 0, '13a. Zero missing Place IDs from original research JSON');
  const unexpectedPlaceIds = [...dbPlaceIds].filter(id => !jsonPlaceIds.has(id));
  check(unexpectedPlaceIds.length === 0, '13b. Zero unexpected Place IDs');

  // 14. No branch loss
  const totalChickenBranches = (await query(`
    SELECT count(*)::int n
    FROM restaurant_branches rb
    JOIN restaurants r ON r.id = rb.restaurant_id
    WHERE r.primary_category = 'fried_chicken'
  `))[0].n;
  check(totalChickenBranches === 73, '14. No branch loss (exactly 73 branches for fried_chicken primary brands)');

  // 15. Migration is safe/idempotent where appropriate
  console.log('5. Testing migration idempotence (re-applying 20261007000100, 20261007000200, and 20261007000300)...');
  await db.exec(migration('20261007000100_merge_broast_into_fried_chicken.sql'));
  await db.exec(migration('20261007000200_fried_chicken_deck_broast_rotation.sql'));
  await db.exec(migration('20261007000300_retire_al_najah_broast.sql'));

  const reBrandCount = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${chickenIdsSql}) AND primary_category = 'fried_chicken'`))[0].n;
  check(reBrandCount === 18, '15a. Idempotence: all 18 brands still fried_chicken');
  const reBranchCount = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${chickenIdsSql})`))[0].n;
  check(reBranchCount === 73, '15b. Idempotence: all 73 branches still intact');

  // Additional integrity checks
  const dupPlaceIds = await query(`
    SELECT google_place_id, count(*)::int n
    FROM restaurant_branches
    WHERE google_place_id IS NOT NULL
    GROUP BY google_place_id HAVING count(*) > 1
  `);
  check(dupPlaceIds.length === 0, 'Zero duplicate Google Place IDs across all branches in database');

  const dupMapsUrls = await query(`
    SELECT google_maps_url, count(*)::int n
    FROM restaurant_branches
    WHERE google_maps_url IS NOT NULL
    GROUP BY google_maps_url HAVING count(*) > 1
  `);
  check(dupMapsUrls.length === 0, 'Zero duplicate Google Maps URLs across all branches in database');

  const cautionBranches = await query(`
    SELECT restaurant_id, branch_name_en, google_place_id, geographic_notes
    FROM restaurant_branches
    WHERE restaurant_id IN (${chickenIdsSql}) AND district IS NULL
  `);
  check(cautionBranches.length === 3, 'Exactly 3 caution branches with district IS NULL (4 minus retired Al Najah Al Ajaweed branch)');

  console.log('6. Regression check: Double-selection migration correctness...');
  // Participant A food choices after migration
  const choiceA = (await query(`SELECT selected_categories FROM food_choices WHERE room_id = '${migTestRoomActive}' AND participant_id = '${migTestPartA}'`))[0];
  check(choiceA && choiceA.selected_categories.length === 1 && choiceA.selected_categories[0] === 'fried_chicken', 'Participant A selection deduplicated to exactly [fried_chicken]');

  // Room 1 tally after migration
  const room1 = (await query(`SELECT category_summary FROM rooms WHERE id = '${migTestRoomActive}'`))[0];
  const tally1 = room1.category_summary.tally;
  check(tally1.fried_chicken === 1, 'Participant A counted exactly ONCE toward Fried Chicken (tally is 1)');
  check(tally1.burger === 1, 'Participant B counted toward burger');
  check(tally1.broast === undefined, 'No broast key remains in active room tally');
  check(tally1.fried_chicken <= 2, 'fried_chicken tally <= eligibleParticipantCount');

  // Room 2 (archived room without food_choices rows)
  const room2 = (await query(`SELECT winning_category, tied_categories, category_summary FROM rooms WHERE id = '${migTestRoomArchived}'`))[0];
  check(room2.winning_category === 'fried_chicken', 'Archived room winning_category migrated to fried_chicken');
  check(room2.tied_categories.includes('fried_chicken') && !room2.tied_categories.includes('broast'), 'Archived room tied_categories migrated to fried_chicken');
  const tally2 = room2.category_summary.tally;
  check(tally2.fried_chicken === 1, 'Archived room tally clamped to eligibleParticipantCount: 1');
  check(tally2.broast === undefined, 'No broast key remains in archived room tally');

  console.log('7. Regression check: Al Tazaj isolation from fried chicken...');
  const alTazaj = (await query(`SELECT id, primary_category, categories, secondary_categories, subcategories FROM restaurants WHERE id = 'al_tazaj'`))[0];
  check(alTazaj, 'Al Tazaj exists in restaurants table');
  check(alTazaj.primary_category === 'rice', 'Al Tazaj primary_category is rice');
  check(alTazaj.categories.includes('rice') && alTazaj.categories.includes('grill') && alTazaj.categories.length === 2, 'Al Tazaj categories are [rice, grill]');
  check(!alTazaj.categories.includes('fried_chicken'), 'Al Tazaj is not eligible for fried_chicken');
  check(!chickenBrandIds.includes('al_tazaj'), 'Al Tazaj is not in 19-brand chicken catalog');

  console.log('8. Regression check: Authoritative DB functions contain zero standalone broast...');
  const dbProcs = await query(`
    SELECT n.nspname as schema, p.proname as name, p.prosrc as src
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname IN ('public', 'private')
  `);
  const procsWithBroast = [];
  for (const proc of dbProcs) {
    const stripped = proc.src.replace(/traditional_broast/gi, '');
    if (/\bbroast\b/i.test(stripped)) {
      procsWithBroast.push(`${proc.schema}.${proc.name}`);
    }
  }
  check(procsWithBroast.length === 0, `Zero DB functions in public/private contain retired 'broast' token (found: ${procsWithBroast.join(', ')})`);

  // Effective category_tally keys
  const effectiveTallyKeys = Object.keys(tally1);
  check(!effectiveTallyKeys.includes('broast'), 'Effective category_tally does NOT contain broast');
  check(effectiveTallyKeys.includes('fried_chicken'), 'Effective category_tally contains fried_chicken');
  check(effectiveTallyKeys.length === 15, 'Effective category_tally has exactly 15 categories');

  // Submit category validation rejects 'broast'
  await db.exec(`
    INSERT INTO rooms (id, code, status, stage, current_stage, eating_mode, room_mode, city, language, category_summary, version)
    VALUES ('33333333-0000-4000-8000-000000000001', 'REJ1', 'category_selection', 'voting', 'voting', 'both', 'food', 'jeddah', 'ar',
      '{"status": "pending", "eligibleParticipantCount": 1, "submittedCount": 0}'::jsonb, 1);
    INSERT INTO participants (id, room_id, session_token, nickname, player_color, player_shape, is_host, status)
    VALUES ('44444444-0000-4000-8000-000000000001', '33333333-0000-4000-8000-000000000001', 'tok-rej', 'RejectUser', '#FF6B6B', 'star', true, 'active');
  `);
  let submitFailed = false;
  try {
    await db.exec(`SELECT public.submit_category_selection('33333333-0000-4000-8000-000000000001', 'tok-rej', 1, ARRAY['broast']::text[])`);
  } catch (err) {
    submitFailed = true;
    check(err.message.includes('WSH_INVALID_CATEGORY_SELECTION'), 'submit_category_selection rejects [broast] with WSH_INVALID_CATEGORY_SELECTION');
  }
  check(submitFailed, 'submit_category_selection failed when broast was submitted');

  // resolve_category_tie winner staple pool does not contain broast
  const tiePoolCheck = (await query(`
    SELECT cat
    FROM unnest(ARRAY['burger', 'shawarma', 'fried_chicken', 'pizza', 'rice', 'seafood', 'asian']::text[]) cat
    WHERE cat = 'broast'
  `));
  check(tiePoolCheck.length === 0, 'resolve_category_tie winner staple array does not contain broast');

  console.log(`PASS: All ${checks} Chicken taxonomy DB verification checks passed successfully!`);
} finally {
  await db.close();
}
