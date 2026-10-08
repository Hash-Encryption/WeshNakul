-- ============================================================================
-- WeshNakul — Pizza Deck Controlled Cross-Category Selection Algorithm
-- Migration: 20261008000300_pizza_controlled_crossover_selection.sql
--
-- Approved Rules:
-- 1. A Pizza deck contains exactly 7 cards.
-- 2. Prioritize restaurants with primary_category = 'pizza'.
-- 3. Allow at most ONE cross-category restaurant per deck (such as an Italian restaurant tagged with pizza).
-- 4. The crossover is optional, not mandatory. Some decks contain 7 primary Pizza restaurants.
-- 5. Never let secondary-category restaurants dominate a deck.
-- 6. Preserve all restaurant category tags and existing taxonomy.
-- 7. Keep normal location, operating-status, and fair-randomization rules.
-- 8. A crossover restaurant must have an approved food image before it becomes eligible.
-- 9. If no eligible crossover has an approved image, fill all 7 slots with primary Pizza restaurants.
-- 10. Preserve the existing progressive geography-widening behavior so decks don't become empty unnecessarily.
-- ============================================================================

BEGIN;

-- 1. Table for approved cross-category restaurants with verified imagery
CREATE TABLE IF NOT EXISTS private.pizza_approved_crossovers (
  restaurant_id text PRIMARY KEY REFERENCES public.restaurants(id) ON DELETE CASCADE,
  approved_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- Ensure unapproved crossovers are excluded until authentic food images are approved.
-- Potential crossovers (such as San Carlo Cicchetti) are preserved in taxonomy, but excluded
-- from selection until an authentic food image specifically from that restaurant is verified.
-- When this table is empty, all 7 cards in every Pizza deck are drawn from the 18 primary Pizza brands.
DELETE FROM private.pizza_approved_crossovers WHERE restaurant_id = 'san_carlo_cicchetti';

-- 2. Update private.create_restaurant_deck with Pizza controlled crossover selection
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
  eligible_broast_rotation_count integer := 0;
  eligible_pizza_crossover_count integer := 0;
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

  -- True cryptographic randomness for the draw seed to eliminate row-order bias
  draw_salt := replace(gen_random_uuid()::text, '-', '');
  draw_seed := p_room_id::text || ':' || room_row.winning_category || ':' || next_generation::text || ':' || draw_salt;

  has_nearby_pref := coalesce('nearby' = ANY(room_row.preferences), false);
  has_healthy_pref := coalesce('healthy' = ANY(room_row.preferences), false);

  -- Track recently served restaurant brands for repeat protection
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

  -- Temporary table to hold eligible candidates with proximity tiers
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
      -- Healthy preference filter
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
        -- 1. When GPS coordinates are available
        WHEN context.latitude IS NOT NULL AND eb.branch_latitude IS NOT NULL THEN
          CASE
            -- Tier 0: Normal local proximity (strict radius, honoring nearby preference)
            WHEN eb.dist_km <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 8.0 WHEN 'going_out' THEN 18.0 ELSE 12.0 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 14.0 WHEN 'going_out' THEN 35.0 ELSE 25.0 END
              END
            ) THEN 0::smallint
            -- Tier 1: Expanded surrounding zone
            WHEN eb.dist_km <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 15.0 WHEN 'going_out' THEN 35.0 ELSE 22.0 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 22.0 WHEN 'going_out' THEN 50.0 ELSE 35.0 END
              END
            ) THEN 1::smallint
            -- Tier 2: Citywide verified fallback
            ELSE 2::smallint
          END

        -- 2. When only district is specified (dropdown / no GPS permission)
        WHEN context.district_id IS NOT NULL THEN
          CASE
            -- Tier 0: Normal district proximity
            WHEN eb.geo_tier IS NOT NULL AND eb.geo_tier <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 1 WHEN 'going_out' THEN 3 ELSE 2 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 2 WHEN 'going_out' THEN 4 ELSE 3 END
              END
            ) THEN 0::smallint
            -- Tier 1: Expanded district proximity
            WHEN eb.geo_tier IS NOT NULL AND eb.geo_tier <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 3 WHEN 'going_out' THEN 5 ELSE 4 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 4 WHEN 'going_out' THEN 6 ELSE 5 END
              END
            ) THEN 1::smallint
            -- Tier 2: Citywide verified fallback
            ELSE 2::smallint
          END

        -- 3. Citywide room with no district/GPS: all branches belong to Tier 0
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

  -- Debug output if core guarantee cannot be satisfied due to real location/availability constraints
  IF room_row.winning_category = 'burger' AND eligible_core_count = 0 AND total_eligible_count > 0 THEN
    RAISE WARNING 'WSH_BURGER_CORE_UNAVAILABLE: No eligible core Burger brand found for room % constraints (total eligible: %)',
      p_room_id, total_eligible_count;
  END IF;

  CREATE TEMP TABLE IF NOT EXISTS _chosen_cards (
    restaurant_id text PRIMARY KEY,
    branch_id uuid,
    distance_km double precision,
    core_status text
  ) ON COMMIT DROP;
  TRUNCATE _chosen_cards;

  IF room_row.winning_category = 'burger' THEN
    -- Guarantee >=1 random eligible core restaurant (if at least one eligible core exists)
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

    -- Fill remaining deck positions: Tier 0 first, then Tier 1, then Tier 2
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

  ELSIF room_row.winning_category = 'fried_chicken' THEN
    -- WeshNakul Fried Chicken composition rule:
    -- Exactly 1 restaurant from the 2-brand traditional_broast rotation pool ('rami_broast', 'broast_hanoo')
    -- when at least one pool member is eligible.
    SELECT count(*)::int INTO eligible_broast_rotation_count
    FROM _deck_candidates
    WHERE restaurant_id = ANY(ARRAY['rami_broast', 'broast_hanoo']);

    IF eligible_broast_rotation_count > 0 THEN
      WITH broast_pool AS (
        SELECT c.*,
          private.weighted_key(draw_seed || ':broast_rotation', c.restaurant_id, c.weight) AS rotation_key,
          CASE
            WHEN c.is_immediate_repeat THEN 2
            WHEN c.is_historical_repeat THEN 1
            ELSE 0
          END AS repeat_tier
        FROM _deck_candidates c
        WHERE c.restaurant_id = ANY(ARRAY['rami_broast', 'broast_hanoo'])
      )
      INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
      SELECT bp.restaurant_id, bp.selected_branch_id, bp.distance_km, bp.core_status
      FROM broast_pool bp
      ORDER BY bp.repeat_tier ASC, (bp.rotation_key * (1.0 + bp.proximity_tier * 0.2)) ASC
      LIMIT 1;
    END IF;

    -- Draw remaining cards from general pool
    WITH general_pool AS (
      SELECT c.*,
        private.weighted_key(draw_seed || ':fc_general', c.restaurant_id, c.weight) AS selection_key,
        CASE
          WHEN c.is_immediate_repeat THEN 2
          WHEN c.is_historical_repeat THEN 1
          ELSE 0
        END AS repeat_tier,
        row_number() OVER (PARTITION BY c.price_position ORDER BY private.weighted_key(draw_seed || ':fc_price', c.restaurant_id, c.weight)) AS price_rank,
        row_number() OVER (PARTITION BY private.normalize_district(c.selected_district) ORDER BY private.weighted_key(draw_seed || ':fc_district', c.restaurant_id, c.weight)) AS district_rank
      FROM _deck_candidates c
      WHERE NOT (c.restaurant_id = ANY(ARRAY['rami_broast', 'broast_hanoo']))
        AND NOT EXISTS (SELECT 1 FROM _chosen_cards cur WHERE cur.restaurant_id = c.restaurant_id)
    ),
    ranked_general AS (
      SELECT gp.*,
        selection_key * (1 + greatest(price_rank - 3, 0) * 0.12 + greatest(district_rank - 3, 0) * 0.1) AS diverse_key
      FROM general_pool gp
    )
    INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
    SELECT rg.restaurant_id, rg.selected_branch_id, rg.distance_km, rg.core_status
    FROM ranked_general rg
    ORDER BY rg.proximity_tier ASC, rg.repeat_tier ASC, rg.diverse_key ASC
    LIMIT (7 - (SELECT count(*)::int FROM _chosen_cards));

    -- Safety backfill if general pool candidates were constrained
    IF (SELECT count(*)::int FROM _chosen_cards) < 7 THEN
      INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
      SELECT c.restaurant_id, c.selected_branch_id, c.distance_km, c.core_status
      FROM _deck_candidates c
      WHERE NOT EXISTS (SELECT 1 FROM _chosen_cards cur WHERE cur.restaurant_id = c.restaurant_id)
      ORDER BY c.proximity_tier ASC, private.weighted_key(draw_seed || ':fc_fallback', c.restaurant_id, c.weight) ASC
      LIMIT (7 - (SELECT count(*)::int FROM _chosen_cards));
    END IF;

  ELSIF room_row.winning_category = 'pizza' THEN
    -- WeshNakul Pizza Controlled Cross-Category Selection Rules:
    -- 1. A Pizza deck contains exactly 7 cards.
    -- 2. Prioritize restaurants with primary_category = 'pizza'.
    -- 3. Allow at most ONE cross-category restaurant per deck (such as an Italian restaurant tagged with pizza).
    -- 4. The crossover is optional, not mandatory. Some decks contain 7 primary Pizza restaurants.
    -- 5. Never let secondary-category restaurants dominate a deck.
    -- 6. Preserve all restaurant category tags and existing taxonomy.
    -- 7. Keep normal location, operating-status, and fair-randomization rules.
    -- 8. A crossover restaurant must have an approved food image before it becomes eligible.
    -- 9. If no eligible crossover has an approved image, fill all 7 slots with primary Pizza restaurants.
    -- 10. Preserve progressive geography-widening behavior so decks don't become empty.

    -- Check if any crossover restaurant with an approved image is eligible in this location/room
    SELECT count(*)::int INTO eligible_pizza_crossover_count
    FROM _deck_candidates c
    WHERE c.restaurant_id IN (SELECT restaurant_id FROM private.pizza_approved_crossovers);

    -- 50% fair probability to activate crossover slot when an approved crossover is eligible
    IF eligible_pizza_crossover_count > 0 AND (private.weighted_key(draw_seed || ':pizza_crossover_slot', 'crossover_chance', 1) < 0.5) THEN
      WITH crossover_pool AS (
        SELECT c.*,
          private.weighted_key(draw_seed || ':pizza_crossover', c.restaurant_id, c.weight) AS crossover_key,
          CASE
            WHEN c.is_immediate_repeat THEN 2
            WHEN c.is_historical_repeat THEN 1
            ELSE 0
          END AS repeat_tier
        FROM _deck_candidates c
        WHERE c.restaurant_id IN (SELECT restaurant_id FROM private.pizza_approved_crossovers)
      )
      INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
      SELECT cp.restaurant_id, cp.selected_branch_id, cp.distance_km, cp.core_status
      FROM crossover_pool cp
      ORDER BY cp.repeat_tier ASC, (cp.crossover_key * (1.0 + cp.proximity_tier * 0.2)) ASC
      LIMIT 1;
    END IF;

    -- Fill remaining deck positions (6 or 7) from primary Pizza restaurants
    WITH primary_pool AS (
      SELECT c.*,
        private.weighted_key(draw_seed || ':pizza_primary', c.restaurant_id, c.weight) AS selection_key,
        CASE
          WHEN c.is_immediate_repeat THEN 2
          WHEN c.is_historical_repeat THEN 1
          ELSE 0
        END AS repeat_tier,
        row_number() OVER (PARTITION BY c.price_position ORDER BY private.weighted_key(draw_seed || ':pizza_price', c.restaurant_id, c.weight)) AS price_rank,
        row_number() OVER (PARTITION BY private.normalize_district(c.selected_district) ORDER BY private.weighted_key(draw_seed || ':pizza_district', c.restaurant_id, c.weight)) AS district_rank
      FROM _deck_candidates c
      WHERE c.restaurant_id IN (SELECT id FROM public.restaurants WHERE primary_category = 'pizza')
        AND NOT EXISTS (SELECT 1 FROM _chosen_cards cur WHERE cur.restaurant_id = c.restaurant_id)
    ),
    ranked_primary AS (
      SELECT pp.*,
        pp.selection_key * (1.0 + greatest(pp.price_rank - 3, 0) * 0.12 + greatest(pp.district_rank - 3, 0) * 0.10) AS diverse_key
      FROM primary_pool pp
    )
    INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
    SELECT rp.restaurant_id, rp.selected_branch_id, rp.distance_km, rp.core_status
    FROM ranked_primary rp
    ORDER BY rp.proximity_tier ASC, rp.repeat_tier ASC, rp.diverse_key ASC
    LIMIT (7 - (SELECT count(*)::int FROM _chosen_cards));

    -- Safety backfill: If primary candidates were constrained, backfill from remaining candidates
    -- (at most 1 crossover total can ever be selected)
    IF (SELECT count(*)::int FROM _chosen_cards) < 7 THEN
      INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
      SELECT c.restaurant_id, c.selected_branch_id, c.distance_km, c.core_status
      FROM _deck_candidates c
      WHERE NOT EXISTS (SELECT 1 FROM _chosen_cards cur WHERE cur.restaurant_id = c.restaurant_id)
        AND (
          c.restaurant_id IN (SELECT id FROM public.restaurants WHERE primary_category = 'pizza')
          OR (
            c.restaurant_id IN (SELECT restaurant_id FROM private.pizza_approved_crossovers)
            AND (SELECT count(*)::int FROM _chosen_cards WHERE restaurant_id IN (SELECT restaurant_id FROM private.pizza_approved_crossovers)) = 0
          )
        )
      ORDER BY c.proximity_tier ASC, private.weighted_key(draw_seed || ':pizza_fallback', c.restaurant_id, c.weight) ASC
      LIMIT (7 - (SELECT count(*)::int FROM _chosen_cards));
    END IF;

  ELSE
    -- Non-Burger / Non-Fried Chicken / Non-Pizza categories: Tier 0 first, Tier 1 second, Tier 2 third
    -- Weighted randomization and diversity preserved within each tier
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

  -- Step 9 & 10: Shuffle the completed deck so guaranteed rotation / core / crossover position is private
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

REVOKE ALL ON FUNCTION private.create_restaurant_deck(uuid, uuid, text, uuid) FROM PUBLIC, anon, authenticated;

COMMIT;
