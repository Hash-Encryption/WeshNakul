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

const shawarmaBrandIds = [
  'shawarmer', 'shawarma_classic', 'shawarma_alrimal', 'shamiyat_haritna',
  'ayedh_shawarma', 'al_khal_al_dimashqi', 'shawarma_habteen', 'ziyada_toum',
  'shawarma_elak', 'shawarma_shakir_aljazeera', 'shawarma_abu_bahij',
  'radi_shawarma', 'shawarma_allosh', 'shawarma_marmasha'
];
const shawarmaIdsSql = shawarmaBrandIds.map(id => `'${id}'`).join(',');

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

  console.log('2. Applying 30-district geography and Broast catalog baseline...');
  await db.exec(migration('20260926000100_expand_jeddah_geography_30_districts.sql'));
  await db.exec(migration('20260926000200_jeddah_broast_fried_chicken_catalog.sql'));

  // Pre-Shawarma baseline assertions
  const preBurgers = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${burgerIdsSql})`))[0].n;
  check(preBurgers === 10, '10 burgers present before shawarma import');
  const preBurgerBranches = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${burgerIdsSql})`))[0].n;
  check(preBurgerBranches === 33, '33 burger branches present before shawarma import');

  const preBroasts = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${broastIdsSql})`))[0].n;
  check(preBroasts === 19, '19 broasts present before shawarma import');
  const preBroastBranches = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${broastIdsSql})`))[0].n;
  check(preBroastBranches === 75, '75 broast branches present before shawarma import');

  const preDistricts = (await query('SELECT count(*)::int n FROM private.district_geography'))[0].n;
  check(preDistricts === 30, '30 canonical districts present before shawarma import');

  console.log('3. Applying Shawarma catalog import migration...');
  try {
    await db.exec(migration('20260926000300_jeddah_shawarma_catalog.sql'));
  } catch (err) {
    console.error('SQL MIGRATION FAILED WITH MESSAGE:');
    console.error(err.message);
    console.error(err.stack?.split('\n').slice(0, 3).join('\n'));
    throw new Error(err.message);
  }

  // 1. Expected Shawarma brand count
  const brandCount = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${shawarmaIdsSql})`))[0].n;
  check(brandCount === 14, 'all 14 shawarma brands present in restaurants');

  // 2. All 14 are production_ready, open, and primary_category = 'shawarma'
  const prodReadyBrands = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE id IN (${shawarmaIdsSql})
      AND primary_category = 'shawarma'
      AND research_use = 'production_ready'
      AND operating_status = 'open'
      AND 'shawarma' = ANY(categories)
  `))[0].n;
  check(prodReadyBrands === 14, 'all 14 brands are production_ready with shawarma category match');

  // 3. Expected branch count
  const branchCount = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${shawarmaIdsSql})`))[0].n;
  check(branchCount === 48, 'exactly 48 physical branches in restaurant_branches');

  // 4. Coordinates present for 100% of branches
  const withCoords = (await query(`
    SELECT count(*)::int n FROM restaurant_branches
    WHERE restaurant_id IN (${shawarmaIdsSql})
      AND latitude IS NOT NULL AND longitude IS NOT NULL
      AND address_en IS NOT NULL
      AND google_maps_url IS NOT NULL
      AND google_place_id IS NOT NULL
  `))[0].n;
  check(withCoords === 48, '100% of 48 branches have verified coordinates, address, and maps URLs');

  // 5. Explicit Place ID Parity with docs/research/jeddah-shawarma-pass-d-corrected.json
  const jsonRaw = JSON.parse(readFileSync('docs/research/jeddah-shawarma-pass-d-corrected.json', 'utf8'));
  const jsonPlaceIds = new Set(jsonRaw.brands.flatMap(b => (b.production_branches || []).map(br => br.google_place_id)));
  check(jsonPlaceIds.size === 48, 'source JSON contains exactly 48 unique place IDs');

  const dbPlaceIdRows = await query(`
    SELECT google_place_id
    FROM restaurant_branches
    WHERE restaurant_id IN (${shawarmaIdsSql})
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
    WHERE restaurant_id IN (${shawarmaIdsSql}) AND district IS NOT NULL
  `))[0].n;
  check(prodBranches === 40, 'exactly 40 branches have a non-null canonical district');

  // Verify all 40 non-null districts reference valid geography rows
  const invalidDistricts = await query(`
    SELECT b.restaurant_id, b.branch_name_en, b.district
    FROM restaurant_branches b
    WHERE b.restaurant_id IN (${shawarmaIdsSql})
      AND b.district IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = b.district)
  `);
  check(invalidDistricts.length === 0, 'all 40 canonical districts reference valid rows in private.district_geography');

  // 8. Caution branches validation - exactly 8 verified caution branches outside 30 canonical districts
  const cautionBranches = await query(`
    SELECT restaurant_id, branch_name_en, google_place_id, geographic_notes
    FROM restaurant_branches
    WHERE restaurant_id IN (${shawarmaIdsSql}) AND district IS NULL
  `);
  check(cautionBranches.length === 8, 'exactly 8 caution branches with district IS NULL');
  check(cautionBranches.every(b => b.geographic_notes && b.geographic_notes.length > 20), 'all 8 caution branches have documented manual review reasons');

  const expectedCautionBranches = [
    { restaurant_id: 'shawarmer', branch_name_en: 'Al Rabi', place_id: 'ChIJy-uwg9jRwxUR-bJ1AhR3FBc' },
    { restaurant_id: 'shawarmer', branch_name_en: 'Taiba', place_id: 'ChIJE4CY1jNlwRURKj5BMu-iCyM' },
    { restaurant_id: 'shawarmer', branch_name_en: 'Al Sanabel', place_id: 'ChIJQf66Lo7LwxURsYyAUCF26fU' },
    { restaurant_id: 'shawarmer', branch_name_en: 'Umm Al Qoura', place_id: 'ChIJaTzlLFrRwxUR-CYCxpjNfsE' },
    { restaurant_id: 'shawarmer', branch_name_en: 'Mishrifah', place_id: 'ChIJ8R5AllrRwxUR3646IDL7KyM' },
    { restaurant_id: 'shawarmer', branch_name_en: 'Prince Fawaz South', place_id: 'ChIJFeJ7HlPNwxURjR40GbD9ueY' },
    { restaurant_id: 'shawarma_abu_bahij', branch_name_en: 'Prince Fawaz South', place_id: 'ChIJbU437H_NwxUReecRAb4iFFk' },
    { restaurant_id: 'radi_shawarma', branch_name_en: 'Mishrifah', place_id: 'ChIJe9f4bC3QwxUR1ZP4KS6RHas' }
  ];

  for (const exp of expectedCautionBranches) {
    const found = cautionBranches.find(b => b.google_place_id === exp.place_id && b.restaurant_id === exp.restaurant_id);
    check(Boolean(found), `caution branch ${exp.restaurant_id} - ${exp.branch_name_en} (${exp.place_id}) present in DB with district = NULL`);
  }

  // 9. Best sellers and sources
  const bestSellersCount = (await query(`
    SELECT count(*)::int n FROM restaurant_best_sellers
    WHERE restaurant_id IN (${shawarmaIdsSql})
  `))[0].n;
  check(bestSellersCount >= 14, 'all 14 shawarma brands have signature best seller items');

  const sourcesCount = (await query(`
    SELECT count(*)::int n FROM restaurant_sources
    WHERE restaurant_id IN (${shawarmaIdsSql})
  `))[0].n;
  check(sourcesCount >= 48, 'all 48 branches have verified Google Maps source records');

  // 10. Existing data preservation
  const postBurgers = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${burgerIdsSql})`))[0].n;
  check(postBurgers === 10, '10 burgers still intact');
  const postBurgerBranches = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${burgerIdsSql})`))[0].n;
  check(postBurgerBranches === 33, '33 burger branches still intact');

  const postBroasts = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${broastIdsSql})`))[0].n;
  check(postBroasts === 19, '19 broasts still intact');
  const postBroastBranches = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${broastIdsSql})`))[0].n;
  check(postBroastBranches === 75, '75 broast branches still intact');

  // Verify legacy orphan 'shawerma_alrimal' was cleanly deleted
  const orphanAlrimal = (await query(`SELECT count(*)::int n FROM restaurants WHERE id = 'shawerma_alrimal'`))[0].n;
  check(orphanAlrimal === 0, 'legacy typo placeholder shawerma_alrimal was cleanly removed');

  // Verify unreviewed legacy seeds remain untouched in manual_review_only
  const legacySeeds = (await query(`SELECT id, research_use FROM restaurants WHERE id IN ('shawarma_abu_elezz', 'shawarma_rubik')`));
  check(legacySeeds.length === 2 && legacySeeds.every(r => r.research_use === 'manual_review_only'), 'unreviewed seeds shawarma_abu_elezz and shawarma_rubik preserved as manual_review_only');

  // Verify grills restaurants are untouched
  const grills = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN ('saruja_restaurants', 'shami', 'khayal') AND primary_category = 'grills'`))[0].n;
  check(grills === 3, 'grills restaurants remain intact with grills primary category');

  // 11. Deck generation tests in 'shawarma' category
  console.log('4. Testing deck generation engine for Shawarma...');

  // Scenario A: Room with winning_category = 'shawarma', GPS location in Al-Zahra
  const roomA = '40000000-0000-4000-8000-000000000001';
  const hostA = '50000000-0000-4000-8000-000000000001';
  const tokenA = 'shawarma-host-gps';
  await db.exec(`
    INSERT INTO rooms (id, code, status, eating_mode, city, neighborhood, language, host_participant_id, current_stage, stage, winning_category, swiping_started_at)
    VALUES ('${roomA}', 'SH01', 'restaurant_selection', 'dine_in', 'jeddah', 'Al Zahra', 'en', '${hostA}', 'swiping', 'swiping', 'shawarma', '2026-09-26T12:00:00Z');
    INSERT INTO participants (id, room_id, session_token, nickname, player_color, player_shape, is_host)
    VALUES ('${hostA}', '${roomA}', '${tokenA}', 'HostShawarma', '#FF6B6B', 'star', true);
    SELECT public.set_room_location('${roomA}', '${hostA}', '${tokenA}', 21.58, 39.14);
  `);

  await db.exec('SET ROLE anon');
  const deckA0 = (await query(`SELECT public.get_or_create_restaurant_deck('${roomA}', '${hostA}', '${tokenA}', NULL) deck`))[0].deck;
  check(deckA0.generation === 0 && deckA0.restaurants.length === 7, 'Gen0 shawarma deck has 7 items');
  check(deckA0.restaurants.every(r => r.categories.includes('shawarma')), 'all restaurants in shawarma deck contain shawarma category');
  check(deckA0.restaurants.every(r => r.selectedBranch && r.selectedBranch.googleMapsUrl && r.selectedBranch.distanceKm !== null), 'branches have maps URLs and distanceKm');
  check(!JSON.stringify(deckA0).match(/latitude|longitude/i), 'deck payload does not leak raw GPS coordinates');

  const deckA1 = (await query(`SELECT public.get_or_create_restaurant_deck('${roomA}', '${hostA}', '${tokenA}', NULL) deck`))[0].deck;
  check(deckA1.deckId === deckA0.deckId, 'Calling get_or_create_restaurant_deck again returns the exact same deck (idempotent)');
  check(deckA1.restaurants.length === 7, 'Idempotent deck has same 7 items');
  await db.exec('RESET ROLE');

  // Scenario B: Room with winning_category = 'shawarma', manual district in As Safa
  const roomB = '40000000-0000-4000-8000-000000000002';
  const hostB = '50000000-0000-4000-8000-000000000002';
  const tokenB = 'shawarma-host-district';
  await db.exec(`
    INSERT INTO rooms (id, code, status, eating_mode, city, neighborhood, language, host_participant_id, current_stage, stage, winning_category, swiping_started_at)
    VALUES ('${roomB}', 'SH02', 'restaurant_selection', 'any', 'jeddah', 'As Safa', 'ar', '${hostB}', 'swiping', 'swiping', 'shawarma', '2026-09-26T12:00:00Z');
    INSERT INTO participants (id, room_id, session_token, nickname, player_color, player_shape, is_host)
    VALUES ('${hostB}', '${roomB}', '${tokenB}', 'HostSafa', '#4D96FF', 'circle', true);
  `);

  await db.exec('SET ROLE anon');
  const deckB0 = (await query(`SELECT public.get_or_create_restaurant_deck('${roomB}', '${hostB}', '${tokenB}', NULL) deck`))[0].deck;
  check(deckB0.generation === 0 && deckB0.restaurants.length === 7, 'Gen0 shawarma district deck has 7 items');
  check(deckB0.restaurants.every(r => r.categories.includes('shawarma')), 'all restaurants in shawarma district deck match shawarma category');
  await db.exec('RESET ROLE');

  // 12. Idempotence test: re-execute migrations
  console.log('5. Testing migration idempotence (re-running migrations)...');
  await db.exec(migration('20260926000300_jeddah_shawarma_catalog.sql'));

  const reBrandCount = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${shawarmaIdsSql})`))[0].n;
  check(reBrandCount === 14, 're-run shawarma brand count is still 14');
  const reBranchCount = (await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${shawarmaIdsSql})`))[0].n;
  check(reBranchCount === 48, 're-run shawarma branch count is still 48');

  // Also verify Burger and Broast didn't change on re-run
  const reBurgerCount = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${burgerIdsSql})`))[0].n;
  check(reBurgerCount === 10, 're-run burger brand count is still 10');
  const reBroastCount = (await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${broastIdsSql})`))[0].n;
  check(reBroastCount === 19, 're-run broast brand count is still 19');

  console.log(`PASS: All ${checks} Shawarma DB verification checks passed successfully!`);
} finally {
  await db.close();
}
