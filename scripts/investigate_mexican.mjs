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
    '20260928000300_jeddah_asian_catalog.sql',
    '20260928000400_category_taxonomy_corrections.sql'
  ];

  for (const m of catalogMigrations) {
    await db.exec(migration(m));
  }

  console.log('All migrations up to 20260928000400 applied.');

  // 1. Inspect all Mexican brands and their branches
  const brandsRes = await db.query(`
    SELECT r.id, r.name_en, r.primary_category, r.categories, r.dining_mode, r.dining_mode_summary, r.research_use, r.operating_status,
           count(b.id) as branch_count,
           array_agg(b.district) as branch_districts
    FROM public.restaurants r
    LEFT JOIN public.restaurant_branches b ON b.restaurant_id = r.id
    WHERE r.primary_category = 'mexican' OR 'mexican' = ANY(r.categories)
    GROUP BY r.id, r.name_en, r.primary_category, r.categories, r.dining_mode, r.dining_mode_summary, r.research_use, r.operating_status
    ORDER BY r.id
  `);
  console.log('\n--- ALL MEXICAN BRANDS IN DB ---');
  console.table(brandsRes.rows);

  const branchesRes = await db.query(`
    SELECT b.id, b.restaurant_id, r.name_en, b.branch_name_en, b.district, b.latitude, b.longitude, b.branch_type, b.dine_in, b.branch_status
    FROM public.restaurant_branches b
    JOIN public.restaurants r ON r.id = b.restaurant_id
    WHERE r.primary_category = 'mexican' OR 'mexican' = ANY(r.categories)
    ORDER BY b.district, r.id
  `);
  console.log('\n--- ALL MEXICAN BRANCHES (19 TOTAL) ---');
  console.table(branchesRes.rows);

  // 2. Now let's trace Mexican filtering for different districts and eating modes
  const testDistricts = [
    { name: 'North: Abhur Al Shamaliyah', id: 'abhur_al_shamaliyah', lat: 21.7583, lng: 39.1234 },
    { name: 'North: Al Mohammadiyyah', id: 'al_mohammadiyyah', lat: 21.6425, lng: 39.1415 },
    { name: 'Central: Al Rawdah', id: 'al_rawdah', lat: 21.5625, lng: 39.1625 },
    { name: 'Central: Al Zahra', id: 'al_zahra', lat: 21.5833, lng: 39.1333 },
    { name: 'South: Al Balad', id: 'al_balad', lat: 21.4858, lng: 39.1867 },
    { name: 'South/East: Al Fayhaa', id: 'al_fayhaa', lat: 21.5012, lng: 39.2215 },
    { name: 'East: Al Safa', id: 'al_safa', lat: 21.5794, lng: 39.2014 },
    { name: 'North: Al Basateen', id: 'al_basateen', lat: 21.6850, lng: 39.1220 }
  ];

  const eatingModes = ['both', 'delivery', 'dine_in'];

  console.log('\n========================================================================================');
  console.log('TRACE MEXICAN CANDIDATE COUNTS ACROSS DISTRICTS AND MODES');
  console.log('========================================================================================');

  for (const dist of testDistricts) {
    console.log(`\n>>> Testing Location: ${dist.name} (id: ${dist.id}) <<<`);
    for (const mode of eatingModes) {
      // Trace using district_id only
      const qDist = await db.query(`
        WITH context AS (
          SELECT private.normalize_district($1) AS district_id, NULL::float AS latitude, NULL::float AS longitude
        ),
        stage1_eligible AS (
          SELECT r.id AS restaurant_id, b.id AS branch_id, b.district,
            private.district_tier(context.district_id, branch_geo.district_id) AS geo_tier,
            CASE
              WHEN $2 = 'delivery' THEN 'delivery'
              WHEN $2 = 'dine_in' THEN 'going_out'
              WHEN r.dining_mode_summary = 'delivery_only' THEN 'delivery'
              WHEN r.dining_mode_summary = 'dine_in_only' THEN 'going_out'
              ELSE 'both'
            END AS use_case
          FROM public.restaurants r
          CROSS JOIN context
          JOIN public.restaurant_branches b ON b.restaurant_id = r.id
          LEFT JOIN private.district_geography branch_geo ON branch_geo.district_id = private.normalize_district(b.district)
          WHERE lower(r.city) = 'jeddah'
            AND r.operating_status NOT IN ('temporarily_closed','permanently_closed')
            AND r.research_use IN ('production_ready','usable_with_caution')
            AND (
              r.primary_category = 'mexican'
              OR 'mexican' = ANY(r.secondary_categories)
              OR 'mexican' = ANY(r.categories)
            )
            AND b.branch_status NOT IN ('temporarily_closed','permanently_closed')
            AND (
              $2 <> 'dine_in' OR (
                b.dine_in IS DISTINCT FROM false AND b.branch_type NOT IN ('takeaway_only','delivery_only','kiosk')
              )
            )
            AND (
              ($2 = 'dine_in' AND coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','dine_in_only'))
              OR ($2 = 'delivery' AND (
                coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','delivery_only')
                OR EXISTS (SELECT 1 FROM public.delivery_platform_listings dl WHERE dl.restaurant_id = r.id AND dl.status IN ('verified','probable'))
              ))
              OR (coalesce($2, 'any') NOT IN ('dine_in', 'delivery'))
            )
        ),
        stage2_geo_filtered AS (
          SELECT eb.*
          FROM stage1_eligible eb
          CROSS JOIN context
          WHERE
            CASE
              WHEN context.district_id IS NOT NULL THEN
                CASE eb.use_case
                  WHEN 'delivery' THEN eb.geo_tier <= 2
                  WHEN 'going_out' THEN eb.geo_tier <= 4
                  ELSE eb.geo_tier <= 3
                END
              ELSE true
            END
        )
        SELECT 
          (SELECT count(DISTINCT restaurant_id) FROM stage1_eligible) as s1_unique_brands,
          (SELECT count(DISTINCT restaurant_id) FROM stage2_geo_filtered) as s2_unique_brands,
          (SELECT array_agg(DISTINCT restaurant_id) FROM stage2_geo_filtered) as s2_brands
      `, [dist.id, mode]);

      const rDist = qDist.rows[0];

      // Trace using GPS coords
      const qGps = await db.query(`
        WITH context AS (
          SELECT private.normalize_district($1) AS district_id, $2::float AS latitude, $3::float AS longitude
        ),
        stage1_eligible AS (
          SELECT r.id AS restaurant_id, b.id AS branch_id, b.district,
            private.haversine_km(context.latitude, context.longitude, b.latitude, b.longitude) AS dist_km,
            CASE
              WHEN $4 = 'delivery' THEN 'delivery'
              WHEN $4 = 'dine_in' THEN 'going_out'
              WHEN r.dining_mode_summary = 'delivery_only' THEN 'delivery'
              WHEN r.dining_mode_summary = 'dine_in_only' THEN 'going_out'
              ELSE 'both'
            END AS use_case
          FROM public.restaurants r
          CROSS JOIN context
          JOIN public.restaurant_branches b ON b.restaurant_id = r.id
          WHERE lower(r.city) = 'jeddah'
            AND r.operating_status NOT IN ('temporarily_closed','permanently_closed')
            AND r.research_use IN ('production_ready','usable_with_caution')
            AND (
              r.primary_category = 'mexican'
              OR 'mexican' = ANY(r.secondary_categories)
              OR 'mexican' = ANY(r.categories)
            )
            AND b.branch_status NOT IN ('temporarily_closed','permanently_closed')
            AND (
              $4 <> 'dine_in' OR (
                b.dine_in IS DISTINCT FROM false AND b.branch_type NOT IN ('takeaway_only','delivery_only','kiosk')
              )
            )
            AND (
              ($4 = 'dine_in' AND coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','dine_in_only'))
              OR ($4 = 'delivery' AND (
                coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','delivery_only')
                OR EXISTS (SELECT 1 FROM public.delivery_platform_listings dl WHERE dl.restaurant_id = r.id AND dl.status IN ('verified','probable'))
              ))
              OR (coalesce($4, 'any') NOT IN ('dine_in', 'delivery'))
            )
        ),
        stage2_geo_filtered AS (
          SELECT eb.*
          FROM stage1_eligible eb
          WHERE
            eb.dist_km <= (
              CASE eb.use_case
                WHEN 'delivery' THEN 14.0
                WHEN 'going_out' THEN 35.0
                ELSE 25.0
              END
            )
        )
        SELECT 
          (SELECT count(DISTINCT restaurant_id) FROM stage1_eligible) as s1_unique_brands,
          (SELECT count(DISTINCT restaurant_id) FROM stage2_geo_filtered) as s2_unique_brands,
          (SELECT array_agg(DISTINCT restaurant_id) FROM stage2_geo_filtered) as s2_brands
      `, [dist.id, dist.lat, dist.lng, mode]);

      const rGps = qGps.rows[0];

      console.log(`  Mode [${mode.padEnd(8)}]:`);
      console.log(`    District Filter: S1(before geo)=${rDist.s1_unique_brands} -> S2(after geo)=${rDist.s2_unique_brands} brands [${(rDist.s2_brands||[]).join(', ')}]`);
      console.log(`    GPS Filter     : S1(before geo)=${rGps.s1_unique_brands} -> S2(after geo)=${rGps.s2_unique_brands} brands [${(rGps.s2_brands||[]).join(', ')}]`);
    }
  }

  // Also check if takeaway_only branches are excluded in delivery mode
  const takeawayCheck = await db.query(`
    SELECT b.restaurant_id, r.name_en, b.branch_name_en, b.branch_type, b.dine_in
    FROM public.restaurant_branches b
    JOIN public.restaurants r ON r.id = b.restaurant_id
    WHERE (r.primary_category = 'mexican' OR 'mexican' = ANY(r.categories))
      AND b.branch_type IN ('takeaway_only', 'delivery_only', 'kiosk')
  `);
  console.log('\n--- MEXICAN TAKEAWAY / DELIVERY ONLY BRANCHES ---');
  console.table(takeawayCheck.rows);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
