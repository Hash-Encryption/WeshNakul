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

const original14BrandIds = [
  'shawarmer', 'shawarma_classic', 'shawarma_alrimal', 'shamiyat_haritna',
  'ayedh_shawarma', 'al_khal_al_dimashqi', 'shawarma_habteen', 'ziyada_toum',
  'shawarma_elak', 'shawarma_shakir_aljazeera', 'shawarma_abu_bahij',
  'radi_shawarma', 'shawarma_allosh', 'shawarma_marmasha'
];

const new6BrandIds = [
  'palm_beach',
  'ganat_al_shawarma',
  'shawarma_jalila',
  'samar_jeddah_shawarma',
  'professional_shawarma',
  'al_wazzan_restaurant'
];

const all20BrandIds = [...original14BrandIds, ...new6BrandIds];
const all20IdsSql = all20BrandIds.map(id => `'${id}'`).join(',');
const new6IdsSql = new6BrandIds.map(id => `'${id}'`).join(',');

async function run() {
  console.log('--- WESHNAKUL SHAWARMA EXPANSION DATABASE VERIFICATION ---');
  console.log('1. Initializing PGlite and applying migration chain through progressive geography widening...');
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');

  const baselineMigrations = [
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

  for (const file of baselineMigrations) {
    await db.exec(migration(file).replace('create extension if not exists "pgcrypto";', ''));
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

  const catalogs = [
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
    '20260928000500_progressive_geography_widening.sql'
  ];

  for (const c of catalogs) {
    await db.exec(migration(c));
  }

  // Pre-expansion checks
  console.log('2. Verifying pre-expansion Shawarma baseline (14 brands, 48 branches)...');
  const preShawarmaBrands = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE primary_category = 'shawarma' AND research_use IN ('production_ready', 'usable_with_caution')
  `))[0].n;
  check(preShawarmaBrands === 14, `exactly 14 approved shawarma brands before expansion (got ${preShawarmaBrands})`);

  const preShawarmaBranches = (await query(`
    SELECT count(*)::int n FROM restaurant_branches b
    JOIN restaurants r ON r.id = b.restaurant_id
    WHERE r.primary_category = 'shawarma' AND b.branch_status NOT IN ('temporarily_closed', 'permanently_closed')
  `))[0].n;
  check(preShawarmaBranches === 48, `exactly 48 shawarma branches before expansion (got ${preShawarmaBranches})`);

  // Burger catalog intact
  const burgerBrandIds = [
    'section_b', 'california_burger', 'century_burger', 'chefs_burger', 'sign_burger',
    'nora_burger', 'wbj', 'lou_burger', 'pplr', 'smash_me',
    'black_tap', 'fatt', 'burger_boutique', 'place', 'score',
    'smpl_brgr', 'bunco_burger', 'mmmm_burger', 'the_plan', 'im_hungry', 'brgr1983'
  ];
  const preBurgers = (await query(`SELECT count(*)::int n FROM restaurants WHERE id = ANY(ARRAY[${burgerBrandIds.map(id => `'${id}'`).join(',')}]::text[])`))[0].n;
  check(preBurgers === 21, `21 burgers intact before expansion`);

  console.log('3. Applying forward-only migration 20261001000100_expand_jeddah_shawarma_20_brands.sql...');
  await db.exec(migration('20261001000100_expand_jeddah_shawarma_20_brands.sql'));

  console.log('4. Verifying post-expansion catalog counts...');
  // Total shawarma brands = 20
  const postShawarmaBrands = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE primary_category = 'shawarma' AND research_use IN ('production_ready', 'usable_with_caution')
  `))[0].n;
  check(postShawarmaBrands === 20, `exactly 20 approved shawarma brands after expansion (got ${postShawarmaBrands})`);

  // All 20 brand IDs present
  const presentBrandIds = (await query(`
    SELECT id FROM restaurants
    WHERE primary_category = 'shawarma' AND research_use IN ('production_ready', 'usable_with_caution')
  `)).map(r => r.id);
  for (const expectedId of all20BrandIds) {
    check(presentBrandIds.includes(expectedId), `brand ${expectedId} present in catalog`);
  }

  // Total shawarma branches = 61
  const postShawarmaBranches = (await query(`
    SELECT count(*)::int n FROM restaurant_branches b
    JOIN restaurants r ON r.id = b.restaurant_id
    WHERE r.primary_category = 'shawarma' AND b.branch_status NOT IN ('temporarily_closed', 'permanently_closed')
  `))[0].n;
  check(postShawarmaBranches === 61, `exactly 61 physical shawarma branches after expansion (48 baseline + 13 new) (got ${postShawarmaBranches})`);

  // Newly added branches = exactly 13
  const newBranchesCount = (await query(`
    SELECT count(*)::int n FROM restaurant_branches
    WHERE restaurant_id IN (${new6IdsSql})
  `))[0].n;
  check(newBranchesCount === 13, `exactly 13 new physical branches imported for the 6 new brands (got ${newBranchesCount})`);

  console.log('5. Verifying brand-specific physical branch counts...');
  const branchCountsByBrand = (await query(`
    SELECT restaurant_id, count(*)::int n
    FROM restaurant_branches
    WHERE restaurant_id IN (${new6IdsSql})
    GROUP BY restaurant_id
  `));
  const countsMap = Object.fromEntries(branchCountsByBrand.map(r => [r.restaurant_id, r.n]));
  check(countsMap['palm_beach'] === 3, `Palm Beach has exactly 3 active branches (got ${countsMap['palm_beach']})`);
  check(countsMap['ganat_al_shawarma'] === 2, `Ganat Al Shawarma has exactly 2 active branches (got ${countsMap['ganat_al_shawarma']})`);
  check(countsMap['shawarma_jalila'] === 2, `Shawarma Jalila has exactly 2 active branches (got ${countsMap['shawarma_jalila']})`);
  check(countsMap['samar_jeddah_shawarma'] === 3, `Samar Jeddah Shawarma has exactly 3 active branches (got ${countsMap['samar_jeddah_shawarma']})`);
  check(countsMap['professional_shawarma'] === 2, `Professional Shawarma has exactly 2 active branches (got ${countsMap['professional_shawarma']})`);
  check(countsMap['al_wazzan_restaurant'] === 1, `Al-Wazzan Restaurant has exactly 1 active branch (got ${countsMap['al_wazzan_restaurant']})`);

  console.log('6. Verifying branch data integrity & Place IDs...');
  // 100% of new branches have valid Place IDs, coordinates, formatted address, maps URLs
  const invalidNewBranches = await query(`
    SELECT * FROM restaurant_branches
    WHERE restaurant_id IN (${new6IdsSql})
      AND (
        google_place_id IS NULL
        OR latitude IS NULL
        OR longitude IS NULL
        OR address_en IS NULL
        OR google_maps_url IS NULL
      )
  `);
  check(invalidNewBranches.length === 0, 'all 13 new branches have valid place_id, lat, lng, address, maps_url');

  // Zero duplicate Place IDs in entire database
  const dupePlaceIds = await query(`
    SELECT google_place_id, count(*)::int n
    FROM restaurant_branches
    GROUP BY google_place_id HAVING count(*) > 1
  `);
  check(dupePlaceIds.length === 0, 'zero duplicate Google Place IDs across entire database');

  // Zero duplicate Maps URLs in entire database
  const dupeMapsUrls = await query(`
    SELECT google_maps_url, count(*)::int n
    FROM restaurant_branches
    GROUP BY google_maps_url HAVING count(*) > 1
  `);
  check(dupeMapsUrls.length === 0, 'zero duplicate Google Maps URLs across entire database');

  console.log('7. Verifying canonical vs caution branches...');
  // Production ready branches must have valid canonical district
  const canonicalBranches = await query(`
    SELECT restaurant_id, branch_name_en, district
    FROM restaurant_branches
    WHERE restaurant_id IN (${new6IdsSql}) AND district IS NOT NULL
  `);
  check(canonicalBranches.length === 8, `exactly 8 canonical-district branches among new 13 branches (got ${canonicalBranches.length})`);

  const invalidDistricts = await query(`
    SELECT b.restaurant_id, b.branch_name_en, b.district
    FROM restaurant_branches b
    WHERE b.restaurant_id IN (${new6IdsSql})
      AND b.district IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id = b.district)
  `);
  check(invalidDistricts.length === 0, 'all non-null districts exist in private.district_geography');

  // Caution branches (district IS NULL) must have documented geographic_notes
  const cautionBranches = await query(`
    SELECT restaurant_id, branch_name_en, geographic_notes
    FROM restaurant_branches
    WHERE restaurant_id IN (${new6IdsSql}) AND district IS NULL
  `);
  check(cautionBranches.length === 5, `exactly 5 caution branches among new 13 branches (got ${cautionBranches.length})`);
  check(cautionBranches.every(b => b.geographic_notes && b.geographic_notes.length > 20), 'all 5 caution branches have detailed geographic notes');

  console.log('8. Verifying Pass D review sweep items...');
  // 1. Ganat Al Farouk candidate (ChIJb-sgAl7MwxURKVBMzVhClWA) must NOT be present
  const faroukBranch = await query(`SELECT * FROM restaurant_branches WHERE google_place_id = 'ChIJb-sgAl7MwxURKVBMzVhClWA'`);
  check(faroukBranch.length === 0, 'Ganat Al Farouk candidate excluded from active branches');

  // 2. Palm Beach closed branches must NOT be active
  const pbFaisaliyah = await query(`SELECT * FROM restaurant_branches WHERE google_place_id = 'ChIJrVgX_2vQwxURIqpyD6QI1G8'`);
  check(pbFaisaliyah.length === 0, 'Palm Beach Al Faisaliyah temporarily closed listing excluded from active branches');
  const pbKhalidiyah = await query(`SELECT * FROM restaurant_branches WHERE google_place_id = 'ChIJYxK0GIvbwxURIy4N8dOxUiI'`);
  check(pbKhalidiyah.length === 0, 'Palm Beach Al Khalidiyah permanently closed listing excluded from active branches');

  // 3. Professional Shawarma second branch has phone = null in research JSON
  const researchData = JSON.parse(readFileSync('docs/research/jeddah-shawarma-expansion-pass-d-corrected.json', 'utf8'));
  const profBrand = researchData.brands.find(b => b.brand_id === 'professional_shawarma');
  const profBaghdadiyah = profBrand.production_branches.find(br => br.branch_name_en === 'Al Baghdadiyah Al Sharqiyah');
  check(profBaghdadiyah && profBaghdadiyah.phone === null, 'Professional Shawarma second branch has phone = null in research dataset due to conflicting sources');

  // 4. Samar third branch (Hamdaniyah vicinity) has district = null and caution status
  const samarThird = (await query(`
    SELECT district, geographic_notes FROM restaurant_branches
    WHERE restaurant_id = 'samar_jeddah_shawarma' AND branch_name_en = 'North Jeddah / Hamdaniyah-area'
  `))[0];
  check(samarThird && samarThird.district === null, 'Samar third branch district is null');
  check(samarThird && samarThird.geographic_notes.includes('23761'), 'Samar third branch preserves physical postal code 23761 in notes');

  // 5. Al-Wazzan 24 hours open but NOT breakfast discovery eligible
  const wazzanRow = (await query(`
    SELECT is_24_hours, serves_breakfast_menu, time_slots FROM restaurants
    WHERE id = 'al_wazzan_restaurant'
  `))[0];
  check(wazzanRow.is_24_hours === true, 'Al-Wazzan is marked 24 hours');
  check(wazzanRow.serves_breakfast_menu === false, 'Al-Wazzan serves_breakfast_menu is false per V3 discovery requirements');
  check(!wazzanRow.time_slots.includes('breakfast'), 'Al-Wazzan time_slots do not include breakfast');

  // 6. Strict V3 Editorial Classifications for all 6 brands
  const brandClassRows = await query(`
    SELECT id, editorial_role, reputation_tags, trend_status FROM restaurants
    WHERE id IN (${new6IdsSql})
  `);
  const classMap = Object.fromEntries(brandClassRows.map(r => [r.id, r]));
  check(classMap['palm_beach'].reputation_tags.includes('local_favorite'), 'Palm Beach classified as local_favorite');
  check(classMap['ganat_al_shawarma'].reputation_tags.includes('local_favorite'), 'Ganat Al Shawarma classified as local_favorite');
  check(classMap['shawarma_jalila'].reputation_tags.includes('rising') && classMap['shawarma_jalila'].trend_status === 'rising', 'Shawarma Jalila classified as rising');
  check(classMap['samar_jeddah_shawarma'].reputation_tags.includes('local_favorite'), 'Samar Jeddah Shawarma classified as local_favorite');
  check(classMap['professional_shawarma'].reputation_tags.includes('hidden_gem'), 'Professional Shawarma classified as hidden_gem');
  check(classMap['al_wazzan_restaurant'].editorial_role === 'staple' && classMap['al_wazzan_restaurant'].reputation_tags.includes('jeddah_staple'), 'Al-Wazzan Restaurant classified as staple');

  // 7. Verified Best Sellers (3 per brand = 18 total)
  const sellersRows = await query(`
    SELECT restaurant_id, count(*)::int n, count(*) FILTER (WHERE is_signature)::int sig_count
    FROM restaurant_best_sellers
    WHERE restaurant_id IN (${new6IdsSql})
    GROUP BY restaurant_id
  `);
  check(sellersRows.length === 6, 'all 6 expansion brands have best sellers rows');
  for (const s of sellersRows) {
    check(s.n === 3, `brand ${s.restaurant_id} has exactly 3 verified best sellers (got ${s.n})`);
    check(s.sig_count === 1, `brand ${s.restaurant_id} has exactly 1 verified signature item`);
  }

  console.log('9. Verifying other restaurant categories remained completely untouched...');
  const postBurgers = (await query(`SELECT count(*)::int n FROM restaurants WHERE id = ANY(ARRAY[${burgerBrandIds.map(id => `'${id}'`).join(',')}]::text[])`))[0].n;
  check(postBurgers === 21, '21 burger brands completely untouched');
  const postBurgerBranches = (await query(`
    SELECT count(*)::int n FROM restaurant_branches
    WHERE restaurant_id = ANY(ARRAY[${burgerBrandIds.map(id => `'${id}'`).join(',')}]::text[])
  `))[0].n;
  check(postBurgerBranches === 47, '47 burger branches completely untouched');

  const postBroasts = (await query(`SELECT count(*)::int n FROM restaurants WHERE primary_category = 'broast'`))[0].n;
  check(postBroasts === 6, '6 broast brands completely untouched');

  console.log('10. Testing Shawarma 7-Card Deck Generation across diverse Jeddah districts...');
  const testDistricts = ['al_rawdah', 'al_safa', 'al_zahra', 'al_balad', 'abhur_al_shamaliyah', 'al_sharafeyah'];
  for (const dist of testDistricts) {
    const res = await db.query(`
      SELECT private.create_restaurant_deck(
        (SELECT id FROM public.rooms WHERE neighborhood = $1 LIMIT 1),
        (SELECT id FROM public.participants LIMIT 1),
        (SELECT session_token FROM public.participants LIMIT 1)
      ) as deck
    `, [dist]).catch(async () => {
      // Create a fresh test room in this district
      const roomId = (await query(`
        INSERT INTO public.rooms (code, stage, room_mode, city, neighborhood, eating_mode, winning_category, swiping_started_at)
        VALUES (upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), 'swiping', 'food', 'jeddah', '${dist}', 'both', 'shawarma', clock_timestamp())
        RETURNING id
      `))[0].id;
      const partId = (await query(`
        INSERT INTO public.participants (room_id, nickname, session_token, is_host, player_color, player_shape, status)
        VALUES ('${roomId}', 'Host', 'token_${dist}', true, '#FBBF24', 'circle', 'active')
        RETURNING id
      `))[0].id;
      return (await query(`
        SELECT private.create_restaurant_deck('${roomId}', '${partId}', 'token_${dist}') as deck
      `))[0].deck;
    });

    const deck = res.deck || res;
    const cards = deck.restaurants || deck.cards || [];
    check(cards.length === 7, `7 cards generated for Shawarma deck in district ${dist} (got ${cards.length})`);
    const cardBrandIds = cards.map(c => c.id || c.restaurant_id);
    const uniqueCards = new Set(cardBrandIds);
    check(uniqueCards.size === 7, `all 7 cards are distinct brands in district ${dist}`);
    console.log(`  ✓ ${dist.padEnd(22)}: 7 cards [${cardBrandIds.join(', ')}]`);
  }

  console.log('11. Testing migration idempotence (re-applying expansion migration a 2nd time)...');
  await db.exec(migration('20261001000100_expand_jeddah_shawarma_20_brands.sql'));
  const idempotenceBrands = (await query(`
    SELECT count(*)::int n FROM restaurants
    WHERE primary_category = 'shawarma' AND research_use IN ('production_ready', 'usable_with_caution')
  `))[0].n;
  check(idempotenceBrands === 20, `idempotence: still exactly 20 approved shawarma brands after 2nd pass`);
  const idempotenceBranches = (await query(`
    SELECT count(*)::int n FROM restaurant_branches b
    JOIN restaurants r ON r.id = b.restaurant_id
    WHERE r.primary_category = 'shawarma'
  `))[0].n;
  check(idempotenceBranches === 61, `idempotence: still exactly 61 physical branches after 2nd pass`);

  console.log(`\nALL ${checks} SHAWARMA EXPANSION DATABASE CHECKS PASSED SUCCESSFULLY!`);
}

run().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
