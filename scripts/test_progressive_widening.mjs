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

  console.log('Database ready. Now testing progressive widening algorithm...');

  // Let's create an updated version of private.create_restaurant_deck with progressive widening
  // and see how it performs
  await db.exec(`
CREATE OR REPLACE FUNCTION private.create_restaurant_deck(
  p_room_id uuid,
  p_participant_id uuid,
  p_session_token text,
  p_after_deck_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  room_row public.rooms%ROWTYPE;
  latest_deck private.room_restaurant_decks%ROWTYPE;
  new_deck_id uuid;
  next_generation integer;
  draw_salt text;
  draw_seed text;
  prev_deck_restaurants text[];
  all_prev_deck_restaurants text[];
  core_guaranteed_id text := NULL;
  eligible_core_count integer := 0;
  total_eligible_count integer := 0;
  has_nearby_pref boolean;
  has_healthy_pref boolean;
BEGIN
  -- Authorization check
  IF NOT EXISTS (
    SELECT 1 FROM public.participants p
    WHERE p.id = p_participant_id AND p.room_id = p_room_id AND p.session_token = p_session_token
  ) THEN
    RAISE EXCEPTION 'Room membership required' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));
  SELECT * INTO room_row FROM public.rooms WHERE id = p_room_id FOR UPDATE;
  IF NOT FOUND OR room_row.stage <> 'swiping' OR room_row.winning_category IS NULL OR room_row.swiping_started_at IS NULL THEN
    RAISE EXCEPTION 'Room is not ready for restaurant swiping' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO latest_deck
  FROM private.room_restaurant_decks
  WHERE room_id = p_room_id AND round_started_at = room_row.swiping_started_at
  ORDER BY generation DESC LIMIT 1;

  IF p_after_deck_id IS NULL AND FOUND THEN
    RETURN private.deck_payload(latest_deck.id);
  END IF;

  IF p_after_deck_id IS NOT NULL THEN
    IF latest_deck.id IS NULL OR NOT EXISTS (
      SELECT 1 FROM private.room_restaurant_decks d
      WHERE d.id = p_after_deck_id AND d.room_id = p_room_id
        AND d.round_started_at = room_row.swiping_started_at
    ) THEN
      RAISE EXCEPTION 'Invalid prior deck' USING ERRCODE = '22023';
    END IF;
    IF latest_deck.id <> p_after_deck_id THEN
      RETURN private.deck_payload(latest_deck.id);
    END IF;
    next_generation := latest_deck.generation + 1;
  ELSE
    next_generation := 0;
  END IF;

  INSERT INTO private.room_restaurant_decks (room_id, round_started_at, category, generation)
  VALUES (p_room_id, room_row.swiping_started_at, room_row.winning_category, next_generation)
  RETURNING id INTO new_deck_id;

  draw_salt := replace(gen_random_uuid()::text, '-', '');
  draw_seed := p_room_id::text || ':' || room_row.winning_category || ':' || next_generation::text || ':' || draw_salt;

  has_nearby_pref := coalesce('nearby' = ANY(room_row.preferences), false);
  has_healthy_pref := coalesce('healthy' = ANY(room_row.preferences), false);

  IF latest_deck.id IS NOT NULL THEN
    SELECT coalesce(array_agg(restaurant_id), '{}'::text[]) INTO prev_deck_restaurants
    FROM private.room_restaurant_deck_items
    WHERE deck_id = latest_deck.id;
  ELSE
    prev_deck_restaurants := '{}'::text[];
  END IF;

  SELECT coalesce(array_agg(DISTINCT i.restaurant_id), '{}'::text[]) INTO all_prev_deck_restaurants
  FROM private.room_restaurant_deck_items i
  JOIN private.room_restaurant_decks d ON d.id = i.deck_id
  WHERE d.room_id = p_room_id;

  CREATE TEMP TABLE IF NOT EXISTS _deck_candidates (
    restaurant_id text PRIMARY KEY,
    core_status text,
    selected_branch_id uuid,
    selected_district text,
    distance_km double precision,
    weight double precision,
    editorial_classification text,
    price_position text,
    context_tags text[],
    proximity_tier smallint,
    is_immediate_repeat boolean,
    is_historical_repeat boolean
  ) ON COMMIT DROP;
  TRUNCATE _deck_candidates;

  WITH context AS (
    SELECT private.normalize_district(room_row.neighborhood) AS district_id, l.latitude, l.longitude
    FROM (SELECT 1) x LEFT JOIN private.room_locations l ON l.room_id = p_room_id
  ),
  eligible_branches AS (
    SELECT
      r.id AS restaurant_id,
      coalesce(r.core_status, CASE WHEN r.editorial_role = 'staple' THEN 'core' ELSE 'expansion' END) AS core_status,
      r.editorial_role,
      r.reputation_tags,
      r.context_tags,
      r.price_position,
      r.dining_mode_summary,
      r.rating,
      r.trend_status,
      r.trend_confidence,
      r.overall_confidence,
      b.id AS branch_id,
      b.district AS branch_district,
      b.latitude AS branch_latitude,
      b.longitude AS branch_longitude,
      b.google_rating AS branch_google_rating,
      b.google_review_count AS branch_google_review_count,
      b.rating_source AS branch_rating_source,
      b.branch_identity_confidence,
      private.haversine_km(context.latitude, context.longitude, b.latitude, b.longitude) AS dist_km,
      private.district_tier(context.district_id, branch_geo.district_id) AS geo_tier,
      CASE
        WHEN room_row.eating_mode = 'delivery' THEN 'delivery'
        WHEN room_row.eating_mode = 'dine_in' THEN 'going_out'
        WHEN r.dining_mode_summary = 'delivery_only' THEN 'delivery'
        WHEN r.dining_mode_summary = 'dine_in_only' THEN 'going_out'
        ELSE 'both'
      END AS use_case
    FROM public.restaurants r
    CROSS JOIN context
    JOIN public.restaurant_branches b ON b.restaurant_id = r.id
    LEFT JOIN private.district_geography branch_geo ON branch_geo.district_id = private.normalize_district(b.district)
    WHERE lower(r.city) = lower(room_row.city)
      AND r.operating_status NOT IN ('temporarily_closed','permanently_closed')
      AND r.research_use IN ('production_ready','usable_with_caution')
      AND (
        r.primary_category = room_row.winning_category
        OR room_row.winning_category = ANY(r.secondary_categories)
        OR room_row.winning_category = ANY(r.categories)
      )
      AND (NOT has_healthy_pref OR ('healthy' = ANY(r.categories) OR 'healthy' = ANY(r.context_tags) OR r.primary_category = 'healthy'))
      AND b.branch_status NOT IN ('temporarily_closed','permanently_closed')
      AND (
        room_row.eating_mode <> 'dine_in' OR (
          b.dine_in IS DISTINCT FROM false AND b.branch_type NOT IN ('takeaway_only','delivery_only','kiosk')
        )
      )
      AND (
        (room_row.eating_mode = 'dine_in' AND coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','dine_in_only'))
        OR (room_row.eating_mode = 'delivery' AND (
          coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','delivery_only')
          OR EXISTS (SELECT 1 FROM public.delivery_platform_listings dl WHERE dl.restaurant_id = r.id AND dl.status IN ('verified','probable'))
        ))
        OR (coalesce(room_row.eating_mode, 'any') NOT IN ('dine_in', 'delivery'))
      )
  ),
  branches_with_proximity AS (
    SELECT eb.*,
      CASE
        -- When GPS coordinates are present
        WHEN context.latitude IS NOT NULL AND eb.branch_latitude IS NOT NULL THEN
          CASE
            -- Tier 0: Normal proximity
            WHEN eb.dist_km <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 8.0 WHEN 'going_out' THEN 18.0 ELSE 12.0 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 14.0 WHEN 'going_out' THEN 35.0 ELSE 25.0 END
              END
            ) THEN 0::smallint
            -- Tier 1: Expanded radius
            WHEN eb.dist_km <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 15.0 WHEN 'going_out' THEN 35.0 ELSE 22.0 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 22.0 WHEN 'going_out' THEN 50.0 ELSE 35.0 END
              END
            ) THEN 1::smallint
            -- Tier 2: Citywide fallback
            ELSE 2::smallint
          END
        -- When only district is present
        WHEN context.district_id IS NOT NULL THEN
          CASE
            -- Tier 0: Normal district tier
            WHEN eb.geo_tier IS NOT NULL AND eb.geo_tier <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 1 WHEN 'going_out' THEN 3 ELSE 2 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 2 WHEN 'going_out' THEN 4 ELSE 3 END
              END
            ) THEN 0::smallint
            -- Tier 1: Expanded district tier
            WHEN eb.geo_tier IS NOT NULL AND eb.geo_tier <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 3 WHEN 'going_out' THEN 5 ELSE 4 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 4 WHEN 'going_out' THEN 6 ELSE 5 END
              END
            ) THEN 1::smallint
            -- Tier 2: Citywide fallback
            ELSE 2::smallint
          END
        -- No location context: all branches are Tier 0
        ELSE 0::smallint
      END AS proximity_tier
    FROM eligible_branches eb
    CROSS JOIN context
  ),
  best_branch_per_restaurant AS (
    SELECT DISTINCT ON (bwp.restaurant_id)
      bwp.restaurant_id,
      bwp.core_status,
      bwp.branch_id,
      bwp.branch_district,
      bwp.dist_km,
      bwp.editorial_role,
      bwp.reputation_tags,
      bwp.trend_status,
      bwp.context_tags,
      bwp.price_position,
      bwp.proximity_tier,
      (
        0.55 +
        private.reputation_weight(coalesce(bwp.branch_google_rating, bwp.rating), bwp.branch_google_review_count) * 1.45 *
          CASE bwp.branch_rating_source WHEN 'google_maps_direct' THEN 1.0 WHEN 'google_derived_secondary' THEN 0.82 ELSE 0.68 END +
        CASE WHEN bwp.dist_km IS NOT NULL THEN 1.0 / (1.0 + bwp.dist_km / 8.0) ELSE 0.0 END +
        private.district_weight(bwp.geo_tier) +
        CASE bwp.editorial_role WHEN 'staple' THEN 0.24 WHEN 'popular' THEN 0.2 WHEN 'discovery' THEN 0.1 ELSE 0.0 END +
        CASE WHEN bwp.trend_status IN ('rising','trending') AND bwp.trend_confidence IN ('high','medium') THEN 0.16 ELSE 0.0 END +
        CASE WHEN bwp.overall_confidence = 'high' THEN 0.18 WHEN bwp.overall_confidence = 'medium' THEN 0.08 ELSE 0.0 END
      )::double precision AS weight
    FROM branches_with_proximity bwp
    CROSS JOIN context
    ORDER BY
      bwp.restaurant_id,
      bwp.proximity_tier ASC,
      CASE WHEN context.latitude IS NOT NULL AND bwp.branch_latitude IS NOT NULL THEN 0 ELSE 1 END,
      bwp.dist_km NULLS LAST,
      bwp.geo_tier ASC,
      CASE bwp.branch_identity_confidence WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      private.reputation_weight(bwp.branch_google_rating, bwp.branch_google_review_count) DESC,
      private.weighted_key(draw_seed, bwp.branch_id::text, 1)
  )
  INSERT INTO _deck_candidates
  SELECT
    bbr.restaurant_id,
    bbr.core_status,
    bbr.branch_id,
    bbr.branch_district,
    bbr.dist_km,
    bbr.weight,
    CASE
      WHEN 'jeddah_staple' = ANY(bbr.reputation_tags) OR bbr.editorial_role = 'staple' THEN 'staple'
      WHEN 'local_favorite' = ANY(bbr.reputation_tags) THEN 'local_favorite'
      WHEN 'rising' = ANY(bbr.reputation_tags) OR bbr.trend_status IN ('rising','trending') THEN 'rising'
      WHEN 'hidden_gem' = ANY(bbr.reputation_tags) THEN 'hidden_gem'
      ELSE 'mainstream'
    END,
    bbr.price_position::text,
    bbr.context_tags,
    bbr.proximity_tier,
    bbr.restaurant_id = ANY(prev_deck_restaurants),
    bbr.restaurant_id = ANY(all_prev_deck_restaurants)
  FROM best_branch_per_restaurant bbr;

  SELECT count(*)::int INTO total_eligible_count FROM _deck_candidates;
  SELECT count(*)::int INTO eligible_core_count FROM _deck_candidates WHERE core_status = 'core';

  CREATE TEMP TABLE IF NOT EXISTS _chosen_cards (
    restaurant_id text PRIMARY KEY,
    branch_id uuid,
    distance_km double precision,
    core_status text
  ) ON COMMIT DROP;
  TRUNCATE _chosen_cards;

  IF room_row.winning_category = 'burger' THEN
    IF eligible_core_count > 0 THEN
      WITH core_pool AS (
        SELECT c.*,
          private.weighted_key(draw_seed || ':core', c.restaurant_id, c.weight) AS core_key,
          CASE
            WHEN c.is_immediate_repeat THEN 2
            WHEN c.is_historical_repeat THEN 1
            ELSE 0
          END AS repeat_tier
        FROM _deck_candidates c
        WHERE c.core_status = 'core'
      )
      SELECT restaurant_id INTO core_guaranteed_id
      FROM core_pool
      ORDER BY proximity_tier ASC, repeat_tier ASC, core_key ASC
      LIMIT 1;

      INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
      SELECT c.restaurant_id, c.selected_branch_id, c.distance_km, c.core_status
      FROM _deck_candidates c
      WHERE c.restaurant_id = core_guaranteed_id;
    END IF;

    WITH remaining_pool AS (
      SELECT c.*,
        private.weighted_key(draw_seed || ':fill', c.restaurant_id, c.weight) AS fill_key,
        CASE
          WHEN c.is_immediate_repeat THEN 2
          WHEN c.is_historical_repeat THEN 1
          ELSE 0
        END AS repeat_tier,
        row_number() OVER (
          PARTITION BY (CASE WHEN 'smash' = ANY(c.context_tags) THEN 'smash' WHEN 'wagyu' = ANY(c.context_tags) THEN 'wagyu' ELSE 'classic' END)
          ORDER BY (CASE WHEN c.is_immediate_repeat THEN 1 ELSE 0 END), private.weighted_key(draw_seed || ':style', c.restaurant_id, c.weight)
        ) AS style_rank,
        row_number() OVER (
          PARTITION BY c.price_position
          ORDER BY (CASE WHEN c.is_immediate_repeat THEN 1 ELSE 0 END), private.weighted_key(draw_seed || ':price', c.restaurant_id, c.weight)
        ) AS price_rank,
        row_number() OVER (
          PARTITION BY c.editorial_classification
          ORDER BY (CASE WHEN c.is_immediate_repeat THEN 1 ELSE 0 END), private.weighted_key(draw_seed || ':editorial', c.restaurant_id, c.weight)
        ) AS editorial_rank
      FROM _deck_candidates c
      WHERE NOT EXISTS (SELECT 1 FROM _chosen_cards cur WHERE cur.restaurant_id = c.restaurant_id)
    ),
    diverse_ranked AS (
      SELECT rp.*,
        rp.fill_key * (
          1.0 +
          greatest(rp.style_rank - 3, 0) * 0.15 +
          greatest(rp.price_rank - 3, 0) * 0.12 +
          greatest(rp.editorial_rank - 3, 0) * 0.10
        ) AS diverse_key
      FROM remaining_pool rp
    )
    INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
    SELECT dr.restaurant_id, dr.selected_branch_id, dr.distance_km, dr.core_status
    FROM diverse_ranked dr
    ORDER BY dr.proximity_tier ASC, dr.repeat_tier ASC, dr.diverse_key ASC
    LIMIT (7 - (SELECT count(*)::int FROM _chosen_cards));

  ELSE
    WITH non_burger_pool AS (
      SELECT c.*,
        private.weighted_key(draw_seed, c.restaurant_id, c.weight) AS selection_key,
        CASE WHEN c.is_historical_repeat THEN 1 ELSE 0 END AS repeat_tier,
        row_number() OVER (PARTITION BY c.price_position ORDER BY private.weighted_key(draw_seed, c.restaurant_id, c.weight)) AS price_rank,
        row_number() OVER (PARTITION BY private.normalize_district(c.selected_district) ORDER BY private.weighted_key(draw_seed, c.restaurant_id, c.weight)) AS district_rank
      FROM _deck_candidates c
    ),
    ranked AS (
      SELECT nbp.*,
        selection_key * (1 + greatest(price_rank - 3, 0) * 0.12 + greatest(district_rank - 3, 0) * 0.1) AS diverse_key
      FROM non_burger_pool nbp
    )
    INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
    SELECT r.restaurant_id, r.selected_branch_id, r.distance_km, r.core_status
    FROM ranked r
    ORDER BY r.proximity_tier ASC, r.repeat_tier ASC, r.diverse_key ASC
    LIMIT 7;
  END IF;

  INSERT INTO private.room_restaurant_deck_items (deck_id, position, restaurant_id, branch_id, distance_km)
  SELECT
    new_deck_id,
    row_number() OVER (ORDER BY private.weighted_key(draw_seed || ':shuffle', c.restaurant_id, 1))::smallint AS position,
    c.restaurant_id,
    c.branch_id,
    round(c.distance_km::numeric, 2)
  FROM _chosen_cards c;

  RETURN private.deck_payload(new_deck_id);
END;
$$;
  `);

  console.log('Updated create_restaurant_deck with progressive widening loaded.');

  // Now let's test deck generation for Mexican across all districts and modes!
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
  console.log('TESTING MEXICAN DECK GENERATION WITH PROGRESSIVE WIDENING');
  console.log('========================================================================================');

  // Helper function to test deck generation
  const testRoomDeck = async (districtId, eatingMode, useGps, lat, lng, prefs = []) => {
    const roomId = (await db.query(`
      INSERT INTO public.rooms (
        code, stage, room_mode, city, neighborhood, eating_mode, preferences, winning_category, swiping_started_at
      ) VALUES (
        upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), 'swiping', 'food', 'jeddah', $1, $2, $3, 'mexican', clock_timestamp()
      ) RETURNING id;
    `, [districtId, eatingMode, prefs])).rows[0].id;

    if (useGps) {
      await db.query(`
        INSERT INTO private.room_locations (room_id, latitude, longitude)
        VALUES ($1, $2, $3);
      `, [roomId, lat, lng]);
    }

    const hostId = (await db.query(`
      INSERT INTO public.participants (room_id, session_token, nickname, is_host, player_color, player_shape, status)
      VALUES ($1, 'token_' || replace(gen_random_uuid()::text, '-', ''), 'Host', true, '#FBBF24', 'circle', 'active')
      RETURNING id, session_token;
    `, [roomId])).rows[0];

    const deckRes = await db.query(`
      SELECT private.create_restaurant_deck($1, $2, $3, NULL) as deck;
    `, [roomId, hostId.id, hostId.session_token]);

    return deckRes.rows[0].deck;
  };

  for (const dist of testDistricts) {
    console.log(`\nLocation: ${dist.name}`);
    for (const mode of eatingModes) {
      // Test District-only (no GPS)
      const deckDist = await testRoomDeck(dist.id, mode, false);
      const cardsDist = deckDist.restaurants || [];
      const distBrands = cardsDist.map(c => c.id).join(', ');
      console.log(`  [Mode: ${mode.padEnd(8)}] District-Only: ${cardsDist.length} cards | [${distBrands}]`);

      // Test with GPS
      const deckGps = await testRoomDeck(dist.id, mode, true, dist.lat, dist.lng);
      const cardsGps = deckGps.restaurants || [];
      const gpsBrands = cardsGps.map(c => c.id).join(', ');
      console.log(`  [Mode: ${mode.padEnd(8)}] With GPS     : ${cardsGps.length} cards | [${gpsBrands}]`);
    }
  }

  // Also test all 16 categories in Al Balad, Abhur, Al Rawdah to ensure no regression!
  const activeCategories = [
    'burger', 'shawarma', 'fried_chicken', 'broast', 'rice', 'grill', 'pizza', 'sushi',
    'italian', 'asian', 'seafood', 'indian', 'fatayer', 'street_folk', 'mexican', 'sandwiches'
  ];

  console.log('\n========================================================================================');
  console.log('REGRESSION TEST ALL 16 CATEGORIES IN SOUTH JEDDAH (AL BALAD)');
  console.log('========================================================================================');
  for (const cat of activeCategories) {
    const roomId = (await db.query(`
      INSERT INTO public.rooms (
        code, stage, room_mode, city, neighborhood, eating_mode, winning_category, swiping_started_at
      ) VALUES (
        upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), 'swiping', 'food', 'jeddah', 'al_balad', 'both', 'mexican', clock_timestamp()
      ) RETURNING id;
    `)).rows[0].id;
    await db.query(`UPDATE public.rooms SET winning_category = $1 WHERE id = $2;`, [cat, roomId]);

    const hostId = (await db.query(`
      INSERT INTO public.participants (room_id, session_token, nickname, is_host, player_color, player_shape, status)
      VALUES ($1, 'token_' || replace(gen_random_uuid()::text, '-', ''), 'Host', true, '#FBBF24', 'circle', 'active')
      RETURNING id, session_token;
    `, [roomId])).rows[0];

    const deckRes = await db.query(`
      SELECT private.create_restaurant_deck($1, $2, $3, NULL) as deck;
    `, [roomId, hostId.id, hostId.session_token]);

    const deck = deckRes.rows[0].deck;
    const cards = deck.restaurants || [];
    console.log(`✓ ${cat.padEnd(16)}: ${cards.length} cards in Al Balad`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
