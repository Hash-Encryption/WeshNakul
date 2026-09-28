import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

async function check() {
  const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
  const { PGlite } = await import(pathToFileURL(runtime).href);
  const db = new PGlite();
  const migration = f => fs.readFileSync('supabase/migrations/' + f, 'utf8').replace(/^\uFEFF/, '');

  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');
  const mChain = [
    '20260902_initial_schema.sql','002_food_consensus.sql','003_restaurant_swipes.sql','005_create_and_seed_restaurants.sql',
    '006_squad_order_scratchpad.sql','007_room_expiration_and_cleanup.sql','20260908000100_restaurant_intelligence.sql',
    '20260908000200_restaurant_legacy_provenance.sql','20260908000300_room_host_coordinates.sql',
    '20260909000100_private_restaurant_decks.sql','20260909000200_private_participant_sessions.sql',
    '20260910000100_jeddah_geography_intelligence.sql','20260911000100_jeddah_burger_google_verified_catalog.sql',
    '20260911000200_remove_legacy_public_room_coordinates.sql','20260911000300_phase3_authoritative_consensus.sql',
    '20260912000100_allow_voting_stage_joins.sql','20260913000100_decision_game_and_tie_corrections.sql',
    '20260916000100_global_fair_draw_and_immediate_flow.sql'
  ];
  for (const f of mChain) await db.exec(migration(f).replace('create extension if not exists "pgcrypto";', ''));
  await db.exec('ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE (room_id, session_token);');
  await db.exec(migration('20260917000100_harden_global_fair_draw.sql').replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '').replace(/DO \$\$[\s\S]*?END \$\$;/m, ''));
  await db.exec(`CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea LANGUAGE sql VOLATILE AS $$ SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex') $$;`);
  await db.exec(migration('20260918000100_room_modes_preferences_and_suggestions.sql'));
  await db.exec(migration('20260919000100_clean_food_categories.sql'));
  await db.exec(migration('20260919000200_repair_secure_fair_draw.sql').replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '').replace('DROP FUNCTION IF EXISTS public.gen_random_bytes(int);', '').replace(/DO \$\$[\s\S]*?END \$\$;/m, ''));
  await db.exec(`CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea LANGUAGE sql VOLATILE AS $$ SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex') $$;`);

  const catalog = [
    '20260926000100_expand_jeddah_geography_30_districts.sql','20260926000200_jeddah_broast_fried_chicken_catalog.sql',
    '20260926000300_jeddah_shawarma_catalog.sql','20260926000400_jeddah_saudi_rice_kabsa_catalog.sql',
    '20260927000100_jeddah_pizza_catalog.sql','20260927000200_jeddah_grills_catalog.sql',
    '20260927000300_jeddah_fatayer_catalog.sql','20260927000400_jeddah_sandwiches_catalog.sql',
    '20260927000500_jeddah_indian_catalog.sql','20260927000600_jeddah_italian_catalog.sql',
    '20260928000100_jeddah_burger_expansion_and_deck_algorithm.sql','20260928000100_jeddah_seafood_catalog.sql',
    '20260928000100_jeddah_sushi_catalog.sql','20260928000100_jeddah_street_folk_food_catalog.sql',
    '20260928000200_jeddah_mexican_catalog.sql','20260928000300_jeddah_asian_catalog.sql',
    '20260928000400_category_taxonomy_corrections.sql','20260928000500_progressive_geography_widening.sql'
  ];
  for (const m of catalog) await db.exec(migration(m));

  const locations = [
    { name: 'Central: Al Zahra', id: 'al_zahra', lat: 21.5833, lng: 39.1333 },
    { name: 'Central: Al Rawdah', id: 'al_rawdah', lat: 21.5625, lng: 39.1625 },
    { name: 'South: Al Balad', id: 'al_balad', lat: 21.4858, lng: 39.1867 },
    { name: 'North: Abhur Al Shamaliyah', id: 'abhur_al_shamaliyah', lat: 21.7583, lng: 39.1234 },
    { name: 'East: Al Safa', id: 'al_safa', lat: 21.5794, lng: 39.2014 }
  ];

  console.log('TIER BREAKDOWN ANALYSIS (WITH GPS & DISTRICT-ONLY):');
  for (const loc of locations) {
    console.log('\n--- ' + loc.name + ' ---');
    for (const cat of ['mexican', 'burger', 'shawarma', 'broast']) {
      for (const mode of ['both', 'delivery', 'dine_in']) {
        const queryGps = await db.query(`
          WITH context AS (
            SELECT $1::text AS district_id, $2::double precision AS latitude, $3::double precision AS longitude
          ),
          eligible_branches AS (
            SELECT
              r.id AS restaurant_id,
              b.id AS branch_id,
              b.district AS branch_district,
              private.haversine_km(context.latitude, context.longitude, b.latitude, b.longitude) AS dist_km,
              private.district_tier(context.district_id, branch_geo.district_id) AS geo_tier,
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
            LEFT JOIN private.district_geography branch_geo ON branch_geo.district_id = private.normalize_district(b.district)
            WHERE lower(r.city) = 'jeddah'
              AND r.operating_status NOT IN ('temporarily_closed','permanently_closed')
              AND r.research_use IN ('production_ready','usable_with_caution')
              AND (r.primary_category = $5 OR $5 = ANY(r.secondary_categories) OR $5 = ANY(r.categories))
              AND b.branch_status NOT IN ('temporarily_closed','permanently_closed')
              AND ($4 <> 'dine_in' OR (b.dine_in IS DISTINCT FROM false AND b.branch_type NOT IN ('takeaway_only','delivery_only','kiosk')))
              AND (
                ($4 = 'dine_in' AND coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','dine_in_only'))
                OR ($4 = 'delivery' AND (
                  coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','delivery_only')
                  OR EXISTS (SELECT 1 FROM public.delivery_platform_listings dl WHERE dl.restaurant_id = r.id AND dl.status IN ('verified','probable'))
                ))
                OR (coalesce($4, 'any') NOT IN ('dine_in', 'delivery'))
              )
          ),
          branches_with_proximity AS (
            SELECT eb.*,
              CASE
                WHEN context.latitude IS NOT NULL AND eb.dist_km IS NOT NULL THEN
                  CASE
                    WHEN eb.dist_km <= (CASE eb.use_case WHEN 'delivery' THEN 14.0 WHEN 'going_out' THEN 35.0 ELSE 25.0 END) THEN 0::smallint
                    WHEN eb.dist_km <= (CASE eb.use_case WHEN 'delivery' THEN 22.0 WHEN 'going_out' THEN 50.0 ELSE 35.0 END) THEN 1::smallint
                    ELSE 2::smallint
                  END
                WHEN context.district_id IS NOT NULL THEN
                  CASE
                    WHEN eb.geo_tier IS NOT NULL AND eb.geo_tier <= (CASE eb.use_case WHEN 'delivery' THEN 2 WHEN 'going_out' THEN 4 ELSE 3 END) THEN 0::smallint
                    WHEN eb.geo_tier IS NOT NULL AND eb.geo_tier <= (CASE eb.use_case WHEN 'delivery' THEN 4 WHEN 'going_out' THEN 6 ELSE 5 END) THEN 1::smallint
                    ELSE 2::smallint
                  END
                ELSE 0::smallint
              END AS proximity_tier
            FROM eligible_branches eb
            CROSS JOIN context
          ),
          best_per_brand AS (
            SELECT DISTINCT ON (restaurant_id) restaurant_id, proximity_tier
            FROM branches_with_proximity
            ORDER BY restaurant_id, proximity_tier ASC, dist_km NULLS LAST
          )
          SELECT
            count(*) FILTER (WHERE proximity_tier = 0) AS t0,
            count(*) FILTER (WHERE proximity_tier = 1) AS t1,
            count(*) FILTER (WHERE proximity_tier = 2) AS t2,
            count(*) AS total
          FROM best_per_brand;
        `, [loc.id, loc.lat, loc.lng, mode, cat]);
        const rGps = queryGps.rows[0];

        // District only (no GPS)
        const queryDist = await db.query(`
          WITH context AS (
            SELECT $1::text AS district_id, NULL::double precision AS latitude, NULL::double precision AS longitude
          ),
          eligible_branches AS (
            SELECT
              r.id AS restaurant_id,
              b.id AS branch_id,
              b.district AS branch_district,
              private.haversine_km(context.latitude, context.longitude, b.latitude, b.longitude) AS dist_km,
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
              AND (r.primary_category = $3 OR $3 = ANY(r.secondary_categories) OR $3 = ANY(r.categories))
              AND b.branch_status NOT IN ('temporarily_closed','permanently_closed')
              AND ($2 <> 'dine_in' OR (b.dine_in IS DISTINCT FROM false AND b.branch_type NOT IN ('takeaway_only','delivery_only','kiosk')))
              AND (
                ($2 = 'dine_in' AND coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','dine_in_only'))
                OR ($2 = 'delivery' AND (
                  coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','delivery_only')
                  OR EXISTS (SELECT 1 FROM public.delivery_platform_listings dl WHERE dl.restaurant_id = r.id AND dl.status IN ('verified','probable'))
                ))
                OR (coalesce($2, 'any') NOT IN ('dine_in', 'delivery'))
              )
          ),
          branches_with_proximity AS (
            SELECT eb.*,
              CASE
                WHEN context.latitude IS NOT NULL AND eb.dist_km IS NOT NULL THEN
                  CASE
                    WHEN eb.dist_km <= (CASE eb.use_case WHEN 'delivery' THEN 14.0 WHEN 'going_out' THEN 35.0 ELSE 25.0 END) THEN 0::smallint
                    WHEN eb.dist_km <= (CASE eb.use_case WHEN 'delivery' THEN 22.0 WHEN 'going_out' THEN 50.0 ELSE 35.0 END) THEN 1::smallint
                    ELSE 2::smallint
                  END
                WHEN context.district_id IS NOT NULL THEN
                  CASE
                    WHEN eb.geo_tier IS NOT NULL AND eb.geo_tier <= (CASE eb.use_case WHEN 'delivery' THEN 2 WHEN 'going_out' THEN 4 ELSE 3 END) THEN 0::smallint
                    WHEN eb.geo_tier IS NOT NULL AND eb.geo_tier <= (CASE eb.use_case WHEN 'delivery' THEN 4 WHEN 'going_out' THEN 6 ELSE 5 END) THEN 1::smallint
                    ELSE 2::smallint
                  END
                ELSE 0::smallint
              END AS proximity_tier
            FROM eligible_branches eb
            CROSS JOIN context
          ),
          best_per_brand AS (
            SELECT DISTINCT ON (restaurant_id) restaurant_id, proximity_tier
            FROM branches_with_proximity
            ORDER BY restaurant_id, proximity_tier ASC, dist_km NULLS LAST
          )
          SELECT
            count(*) FILTER (WHERE proximity_tier = 0) AS t0,
            count(*) FILTER (WHERE proximity_tier = 1) AS t1,
            count(*) FILTER (WHERE proximity_tier = 2) AS t2,
            count(*) AS total
          FROM best_per_brand;
        `, [loc.id, mode, cat]);
        const rDist = queryDist.rows[0];

        console.log(`  ${cat.padEnd(9)} [${mode.padEnd(8)}]: GPS(T0=${rGps.t0}, T1=${rGps.t1}, T2=${rGps.t2} -> Tot=${rGps.total}) | DistOnly(T0=${rDist.t0}, T1=${rDist.t1}, T2=${rDist.t2} -> Tot=${rDist.total})`);
      }
    }
  }
}
check().catch(console.error);
