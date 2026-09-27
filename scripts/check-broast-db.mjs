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
const check = (value, msg) => { assert(value, msg); checks++; };

const broastBrandIds = [
  'albaik', 'raising_canes', 'kfc', 'texas_chicken', 'popeyes',
  'daves_hot_chicken', 'tndr', 'wingstop', 'crusted', 'crisper',
  'dabboos', 'sayakh', 'nashvilles_hot_chicken', 'tenders_cart',
  'rami_broast', 'chicken_mubeen', 'ktaykit', 'al_najah_broast', 'broast_hanoo'
];
const broastIdsSql = broastBrandIds.map(id => `'${id}'`).join(',');

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

  // Pre-Broast baseline assertions
  const preBurgers = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${burgerIdsSql})`))[0].n;
  check(preBurgers === 10, '10 burgers present before broast import');
  const preBurgerBranches = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${burgerIdsSql})`))[0].n;
  check(preBurgerBranches === 33, '33 burger branches present before broast import');

  // Verify geography state before expansion (26 districts)
  const preDistricts = (await query('SELECT count(*)::int n FROM private.district_geography'))[0].n;
  check(preDistricts === 26, '26 canonical districts present before expansion');

  console.log('3. Applying forward geography expansion migration...');
  await db.exec(migration('20260926000100_expand_jeddah_geography_30_districts.sql'));
  
  const postDistricts = (await query('SELECT count(*)::int n FROM private.district_geography'))[0].n;
  check(postDistricts === 30, '30 canonical districts present after expansion');

  // Check 4 new districts are present
  const newDistrictIds = ['an_nuzhah', 'ar_rabwah', 'al_aziziyah', 'al_sharafeyah'];
  for (const dId of newDistrictIds) {
    const row = (await query(`SELECT district_id, name_en, name_ar, array_length(neighbors, 1) as neighbor_count FROM private.district_geography WHERE district_id = '${dId}'`))[0];
    check(row && row.neighbor_count > 0, `${dId} exists with neighbors`);
  }

  console.log('4. Applying Broast / Fried Chicken catalog import migration...');
  await db.exec(migration('20260926000200_jeddah_broast_fried_chicken_catalog.sql'));

  // 1. Expected Broast brand count
  const brandCount = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${broastIdsSql})`))[0].n;
  check(brandCount === 19, 'all 19 broast brands present in restaurants');

  // 2. All 19 are production_ready and primary_category = 'broast'
  const prodReadyBrands = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE id IN (${broastIdsSql})
      AND primary_category = 'broast'
      AND research_use = 'production_ready'
      AND operating_status = 'open'
      AND 'fried_chicken' = ANY(categories)
  `))[0].n;
  check(prodReadyBrands === 19, 'all 19 brands are production_ready with dual broast/fried_chicken category match');

  // 3. Expected branch count
  const branchCount = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${broastIdsSql})`))[0].n;
  check(branchCount === 75, 'exactly 75 physical branches in restaurant_branches');

  // 4. Coordinates present for 100% of branches
  const withCoords = (await query(`
    SELECT count(*)::int n FROM restaurant_branches
    WHERE restaurant_id IN (${broastIdsSql})
      AND latitude IS NOT NULL AND longitude IS NOT NULL
      AND address_en IS NOT NULL
      AND google_maps_url IS NOT NULL
      AND google_place_id IS NOT NULL
  `))[0].n;
  check(withCoords === 75, '100% of 75 branches have verified coordinates, address, and maps URLs');

  // 5. Explicit Place ID Parity with docs/research/jeddah-broast-pass-d-corrected.json
  const jsonRaw = JSON.parse(readFileSync('docs/research/jeddah-broast-pass-d-corrected.json', 'utf8'));
  const jsonPlaceIds = new Set(jsonRaw.brands.flatMap(b => b.branches.map(br => br.google_place_id)));
  check(jsonPlaceIds.size === 75, 'source JSON contains exactly 75 unique place IDs');

  const dbPlaceIdRows = await query(`
    SELECT google_place_id
    FROM restaurant_branches
    WHERE restaurant_id IN (${broastIdsSql})
  `);
  const dbPlaceIds = new Set(dbPlaceIdRows.map(r => r.google_place_id));

  // Check 5a: Zero missing Place IDs
  const missingPlaceIds = [...jsonPlaceIds].filter(id => !dbPlaceIds.has(id));
  check(missingPlaceIds.length === 0, `zero missing Place IDs from JSON (missing: ${missingPlaceIds.join(', ')})`);

  // Check 5b: Zero unexpected Place IDs
  const unexpectedPlaceIds = [...dbPlaceIds].filter(id => !jsonPlaceIds.has(id));
  check(unexpectedPlaceIds.length === 0, `zero unexpected Place IDs not in JSON (unexpected: ${unexpectedPlaceIds.join(', ')})`);

  // Check 5c: Zero duplicate Google Place IDs across the entire database
  const dupPlaceIds = await query(`
    SELECT google_place_id, count(*)::int n
    FROM restaurant_branches
    WHERE google_place_id IS NOT NULL
    GROUP BY google_place_id HAVING count(*) > 1
  `);
  check(dupPlaceIds.length === 0, 'zero duplicate Google Place IDs across all branches in database');

  // 6. Zero duplicate Google Maps URLs across the entire database
  const dupMapsUrls = await query(`
    SELECT google_maps_url, count(*)::int n
    FROM restaurant_branches
    WHERE google_maps_url IS NOT NULL
    GROUP BY google_maps_url HAVING count(*) > 1
  `);
  check(dupMapsUrls.length === 0, 'zero duplicate Google Maps URLs across all branches in database');

  // 7. Canonical districts validation
  const prodBranches = (await query(`
    SELECT count(*)::int n FROM restaurant_branches
    WHERE restaurant_id IN (${broastIdsSql}) AND district IS NOT NULL
  `))[0].n;
  check(prodBranches === 71, 'exactly 71 branches have a non-null canonical district');

  // Verify all non-null districts reference valid geography rows
  const invalidDistricts = await query(`
    SELECT b.restaurant_id, b.branch_name_en, b.district
    FROM restaurant_branches b
    WHERE b.restaurant_id IN (${broastIdsSql})
      AND b.district IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = b.district)
  `);
  check(invalidDistricts.length === 0, 'all 71 canonical districts reference valid rows in private.district_geography');

  // 8. Caution branches validation - exactly 4 verified caution branches
  const cautionBranches = await query(`
    SELECT restaurant_id, branch_name_en, google_place_id, geographic_notes
    FROM restaurant_branches
    WHERE restaurant_id IN (${broastIdsSql}) AND district IS NULL
  `);
  check(cautionBranches.length === 4, 'exactly 4 caution branches with district IS NULL');
  check(cautionBranches.every(b => b.geographic_notes && b.geographic_notes.length > 20), 'all 4 caution branches have documented manual review reasons');

  const expectedCautionBranches = [
    { restaurant_id: 'crusted', branch_name_en: 'Al Sanabel', place_id: 'ChIJ79XtBQDLwxUR2vfthAk2kfw' },
    { restaurant_id: 'al_najah_broast', branch_name_en: 'Al Ajaweed', place_id: 'ChIJ9Qgj04PLwxURGDMs8mD6tPE' },
    { restaurant_id: 'albaik', branch_name_en: 'Al Baghdadiyah Al Sharqiyah', place_id: 'ChIJbT4rKq3PwxURGSunZl-GxrM' },
    { restaurant_id: 'albaik', branch_name_en: 'King Abdulaziz International Airport T1', place_id: 'ChIJCQwA0vHXwxURrRfzuvODqn8' }
  ];

  for (const exp of expectedCautionBranches) {
    const found = cautionBranches.find(b => b.google_place_id === exp.place_id && b.restaurant_id === exp.restaurant_id);
    check(Boolean(found), `caution branch ${exp.restaurant_id} - ${exp.branch_name_en} (${exp.place_id}) present in DB with district = NULL`);
  }

  // 9. Subtype / secondary taxonomy preservation
  const wingsBrands = (await query(`SELECT count(*)::int n FROM restaurants WHERE id = 'wingstop' AND 'wings' = ANY(secondary_categories)`))[0].n;
  check(wingsBrands === 1, 'Wingstop preserves wings secondary taxonomy');

  const tendersBrands = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN ('raising_canes', 'tndr') AND 'tenders' = ANY(secondary_categories)`))[0].n;
  check(tendersBrands === 2, 'Raising Canes and TNDR preserve tenders secondary taxonomy');

  const nashvilleBrands = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN ('daves_hot_chicken', 'nashvilles_hot_chicken') AND 'nashville' = ANY(secondary_categories)`))[0].n;
  check(nashvilleBrands === 2, 'Daves Hot Chicken and Nashvilles Hot Chicken preserve nashville secondary taxonomy');

  const musahabBrands = (await query(`SELECT count(*)::int n FROM restaurants WHERE id = 'albaik' AND 'musahab' = ANY(secondary_categories)`))[0].n;
  check(musahabBrands === 1, 'ALBAIK preserves musahab secondary taxonomy');

  // 10. ALBAIK & KFC representative-footprint behavior
  const albaikRow = (await query(`SELECT is_city_wide, branch_list_completeness, verified_jeddah_branch_count FROM restaurants WHERE id = 'albaik'`))[0];
  check(albaikRow.is_city_wide === true, 'ALBAIK is_city_wide is true');
  check(albaikRow.branch_list_completeness === 'partial', 'ALBAIK branch_list_completeness is partial');
  check(albaikRow.verified_jeddah_branch_count === 6, 'ALBAIK has 6 representative branches');

  const albaikDbPlaceIds = (await query(`SELECT google_place_id FROM restaurant_branches WHERE restaurant_id = 'albaik'`)).map(r => r.google_place_id).sort();
  const albaikJsonPlaceIds = jsonRaw.brands.find(b => b.canonical_name === 'ALBAIK').branches.map(b => b.google_place_id).sort();
  check(JSON.stringify(albaikDbPlaceIds) === JSON.stringify(albaikJsonPlaceIds), 'ALBAIK representative branch set matches JSON exactly (6 branches)');

  const kfcRow = (await query(`SELECT is_city_wide, branch_list_completeness, verified_jeddah_branch_count FROM restaurants WHERE id = 'kfc'`))[0];
  check(kfcRow.is_city_wide === true, 'KFC is_city_wide is true');
  check(kfcRow.branch_list_completeness === 'partial', 'KFC branch_list_completeness is partial');
  check(kfcRow.verified_jeddah_branch_count === 4, 'KFC has 4 representative branches');

  const kfcDbPlaceIds = (await query(`SELECT google_place_id FROM restaurant_branches WHERE restaurant_id = 'kfc'`)).map(r => r.google_place_id).sort();
  const kfcJsonPlaceIds = jsonRaw.brands.find(b => b.canonical_name === 'KFC').branches.map(b => b.google_place_id).sort();
  check(JSON.stringify(kfcDbPlaceIds) === JSON.stringify(kfcJsonPlaceIds), 'KFC representative branch set matches JSON exactly (4 branches)');

  const crustedRow = (await query(`SELECT is_city_wide, branch_list_completeness FROM restaurants WHERE id = 'crusted'`))[0];
  check(crustedRow.is_city_wide === false, 'Crusted is_city_wide is false');
  check(crustedRow.branch_list_completeness === 'complete', 'Crusted branch_list_completeness is complete');

  // 11. Existing data preservation
  const postBurgers = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${burgerIdsSql})`))[0].n;
  check(postBurgers === 10, '10 burgers still intact');
  const postBurgerBranches = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${burgerIdsSql})`))[0].n;
  check(postBurgerBranches === 33, '33 burger branches still intact');

  // 12. Deck generation tests in both 'broast' and 'fried_chicken' categories
  console.log('5. Testing deck generation engine for Broast / Fried Chicken...');
  
  // Scenario A: Room with winning_category = 'broast', GPS location in Al-Rawdah
  const roomA = '30000000-0000-4000-8000-000000000001';
  const hostA = '40000000-0000-4000-8000-000000000001';
  const tokenA = 'broast-host-gps';
  await db.exec(`
    INSERT INTO rooms (id, code, status, eating_mode, city, neighborhood, language, host_participant_id, current_stage, stage, winning_category, swiping_started_at)
    VALUES ('${roomA}', 'BR01', 'restaurant_selection', 'dine_in', 'jeddah', 'Al Rawdah', 'en', '${hostA}', 'swiping', 'swiping', 'broast', '2026-09-26T12:00:00Z');
    INSERT INTO participants (id, room_id, session_token, nickname, player_color, player_shape, is_host)
    VALUES ('${hostA}', '${roomA}', '${tokenA}', 'Host', '#FF6B6B', 'star', true);
    SELECT public.set_room_location('${roomA}', '${hostA}', '${tokenA}', 21.56, 39.16);
  `);

  await db.exec('SET ROLE anon');
  const deckA0 = (await query(`SELECT public.get_or_create_restaurant_deck('${roomA}', '${hostA}', '${tokenA}', NULL) deck`))[0].deck;
  check(deckA0.generation === 0 && deckA0.restaurants.length === 7, 'Gen0 broast deck has 7 items');
  check(deckA0.restaurants.every(r => r.categories.includes('broast')), 'all restaurants in broast deck contain broast category');
  check(deckA0.restaurants.every(r => r.selectedBranch && r.selectedBranch.googleMapsUrl && r.selectedBranch.distanceKm !== null), 'branches have maps URLs and distanceKm');
  check(!JSON.stringify(deckA0).match(/latitude|longitude/i), 'deck payload does not leak raw GPS coordinates');

  const deckA1 = (await query(`SELECT public.get_or_create_restaurant_deck('${roomA}', '${hostA}', '${tokenA}', NULL) deck`))[0].deck;
  check(deckA1.deckId === deckA0.deckId, 'Calling get_or_create_restaurant_deck again returns the exact same deck (idempotent)');
  check(deckA1.restaurants.length === 7, 'Idempotent deck has same 7 items');
  await db.exec('RESET ROLE');

  // Scenario B: Room with winning_category = 'fried_chicken', manual district in Ar Rabwah
  const roomB = '30000000-0000-4000-8000-000000000002';
  const hostB = '40000000-0000-4000-8000-000000000002';
  const tokenB = 'fc-host-district';
  await db.exec(`
    INSERT INTO rooms (id, code, status, eating_mode, city, neighborhood, language, host_participant_id, current_stage, stage, winning_category, swiping_started_at)
    VALUES ('${roomB}', 'FC01', 'restaurant_selection', 'any', 'jeddah', 'Ar Rabwah', 'ar', '${hostB}', 'swiping', 'swiping', 'fried_chicken', '2026-09-26T12:00:00Z');
    INSERT INTO participants (id, room_id, session_token, nickname, player_color, player_shape, is_host)
    VALUES ('${hostB}', '${roomB}', '${tokenB}', 'HostFC', '#4D96FF', 'circle', true);
  `);

  await db.exec('SET ROLE anon');
  const deckB0 = (await query(`SELECT public.get_or_create_restaurant_deck('${roomB}', '${hostB}', '${tokenB}', NULL) deck`))[0].deck;
  check(deckB0.generation === 0 && deckB0.restaurants.length === 7, 'Gen0 fried_chicken deck has 7 items');
  check(deckB0.restaurants.every(r => r.categories.includes('fried_chicken')), 'all restaurants in fried_chicken deck match fried_chicken category');
  await db.exec('RESET ROLE');

  // 13. Idempotence test: re-execute migrations
  console.log('6. Testing migration idempotence (re-running migrations)...');
  await db.exec(migration('20260926000100_expand_jeddah_geography_30_districts.sql'));
  await db.exec(migration('20260926000200_jeddah_broast_fried_chicken_catalog.sql'));

  const reBrandCount = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${broastIdsSql})`))[0].n;
  check(reBrandCount === 19, 're-run brand count is still 19');
  const reBranchCount = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${broastIdsSql})`))[0].n;
  check(reBranchCount === 75, 're-run branch count is still 75');

  console.log(`PASS: All ${checks} Broast DB verification checks passed successfully!`);
} finally {
  await db.close();
}
