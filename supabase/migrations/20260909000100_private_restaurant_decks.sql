BEGIN;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE private.room_locations (
  room_id uuid PRIMARY KEY REFERENCES public.rooms(id) ON DELETE CASCADE,
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON private.room_locations FROM PUBLIC, anon, authenticated;

-- Move previously captured coordinates before removing them from the Realtime row.
DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'latitude'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'longitude'
  ) THEN
    EXECUTE $sql$
      INSERT INTO private.room_locations (room_id, latitude, longitude)
      SELECT id, latitude, longitude
      FROM public.rooms
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      ON CONFLICT (room_id) DO UPDATE
      SET latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          updated_at = now()
    $sql$;
  END IF;
END
$migration$;

ALTER TABLE public.rooms DROP COLUMN IF EXISTS latitude;
ALTER TABLE public.rooms DROP COLUMN IF EXISTS longitude;

CREATE TABLE private.room_restaurant_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  round_started_at timestamptz NOT NULL,
  category text NOT NULL,
  generation integer NOT NULL CHECK (generation >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, round_started_at, generation)
);

CREATE TABLE private.room_restaurant_deck_items (
  deck_id uuid NOT NULL REFERENCES private.room_restaurant_decks(id) ON DELETE CASCADE,
  position smallint NOT NULL CHECK (position BETWEEN 1 AND 7),
  restaurant_id text NOT NULL REFERENCES public.restaurants(id),
  branch_id uuid REFERENCES public.restaurant_branches(id),
  distance_km numeric(7,2) CHECK (distance_km >= 0),
  PRIMARY KEY (deck_id, position),
  UNIQUE (deck_id, restaurant_id)
);

CREATE INDEX room_restaurant_decks_room_round_idx
  ON private.room_restaurant_decks (room_id, round_started_at, generation DESC);
CREATE INDEX room_restaurant_deck_items_restaurant_idx
  ON private.room_restaurant_deck_items (restaurant_id);
REVOKE ALL ON private.room_restaurant_decks, private.room_restaurant_deck_items FROM PUBLIC, anon, authenticated;

CREATE TABLE private.district_geography (
  district_id text PRIMARY KEY,
  macrozone text NOT NULL,
  neighbors text[] NOT NULL DEFAULT '{}'
);
REVOKE ALL ON private.district_geography FROM PUBLIC, anon, authenticated;

INSERT INTO private.district_geography (district_id, macrozone, neighbors) VALUES
  ('al_rawdah', 'central_jeddah', ARRAY['al_zahra','al_khalidiyyah','al_salamah','al_andalus','al_faisaliyyah']),
  ('al_zahra', 'central_jeddah', ARRAY['al_shati','al_rawdah','al_salamah','al_naeem','al_khalidiyyah']),
  ('al_salamah', 'central_jeddah', ARRAY['al_zahra','al_rawdah','al_naeem','al_bawadi','al_faisaliyyah']),
  ('al_khalidiyyah', 'central_jeddah', ARRAY['al_rawdah','al_andalus','al_shati','al_zahra']),
  ('al_andalus', 'central_jeddah', ARRAY['al_khalidiyyah','al_rawdah','al_hamra','al_rehab']),
  ('al_shati', 'central_jeddah', ARRAY['al_zahra','al_khalidiyyah','al_mohammadiyyah','al_murjan']),
  ('al_hamra', 'central_jeddah', ARRAY['al_andalus']),
  ('al_mohammadiyyah', 'central_jeddah', ARRAY['al_basateen','al_naeem','al_shati','al_zahra','abhur_al_janoubiyah']),
  ('al_naeem', 'central_jeddah', ARRAY['al_zahra','al_salamah','al_mohammadiyyah','al_bawadi']),
  ('al_basateen', 'central_jeddah', ARRAY['al_mohammadiyyah','al_murjan','abhur_al_janoubiyah']),
  ('al_murjan', 'central_jeddah', ARRAY['al_basateen','al_shati','abhur_al_janoubiyah']),
  ('abhur_al_janoubiyah', 'central_jeddah', ARRAY['abhur_al_shamaliyah','al_basateen','al_mohammadiyyah','al_murjan']),
  ('abhur_al_shamaliyah', 'north_obhur', ARRAY['abhur_al_janoubiyah']),
  ('al_bawadi', 'central_jeddah', ARRAY['al_salamah','al_naeem','al_faisaliyyah','al_safa','al_marwah']),
  ('al_faisaliyyah', 'central_jeddah', ARRAY['al_rawdah','al_salamah','al_bawadi','al_rehab']),
  ('al_safa', 'central_jeddah', ARRAY['al_marwah','al_rehab','al_bawadi']),
  ('al_marwah', 'central_jeddah', ARRAY['al_safa','al_bawadi']),
  ('al_rehab', 'central_jeddah', ARRAY['al_safa','al_faisaliyyah','al_andalus']),
  ('al_naseem', 'south_jeddah', ARRAY['al_faiha']),
  ('al_faiha', 'south_jeddah', ARRAY['al_naseem'])
ON CONFLICT (district_id) DO UPDATE
SET macrozone = EXCLUDED.macrozone, neighbors = EXCLUDED.neighbors;

CREATE FUNCTION private.normalize_district(value text) RETURNS text
LANGUAGE sql IMMUTABLE STRICT SET search_path = pg_catalog AS $$
  SELECT CASE lower(trim(value))
    WHEN 'north obhur' THEN 'abhur_al_shamaliyah'
    WHEN 'أبحر الشمالية' THEN 'abhur_al_shamaliyah'
    ELSE regexp_replace(lower(trim(value)), '[^a-z0-9]+', '_', 'g')
  END
$$;

CREATE FUNCTION private.haversine_km(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
RETURNS double precision LANGUAGE sql IMMUTABLE STRICT SET search_path = pg_catalog AS $$
  SELECT 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)
  ))
$$;

CREATE FUNCTION private.reputation_weight(rating numeric, review_count integer) RETURNS double precision
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog AS $$
  SELECT CASE WHEN rating IS NULL THEN 0.45 ELSE
    greatest(0.05, least(1.0,
      (((review_count::double precision * rating::double precision) + (250 * 4.2)) /
       (coalesce(review_count, 0) + 250) - 3.5) / 1.5
    ))
  END
$$;

CREATE FUNCTION private.meal_period(at_time timestamptz) RETURNS text
LANGUAGE sql IMMUTABLE STRICT SET search_path = pg_catalog AS $$
  SELECT CASE
    WHEN extract(hour FROM at_time AT TIME ZONE 'Asia/Riyadh') BETWEEN 6 AND 10 THEN 'breakfast'
    WHEN extract(hour FROM at_time AT TIME ZONE 'Asia/Riyadh') BETWEEN 11 AND 16 THEN 'lunch'
    WHEN extract(hour FROM at_time AT TIME ZONE 'Asia/Riyadh') BETWEEN 17 AND 22 THEN 'dinner'
    ELSE 'late_night'
  END
$$;

CREATE FUNCTION private.weighted_key(seed text, candidate text, weight double precision) RETURNS double precision
LANGUAGE sql IMMUTABLE STRICT SET search_path = pg_catalog AS $$
  SELECT -ln(greatest(1e-12,
    (('x' || substr(md5(seed || ':' || candidate), 1, 15))::bit(60)::bigint::double precision + 1) /
    1152921504606846977.0
  )) / greatest(weight, 0.01)
$$;

CREATE FUNCTION private.deck_payload(requested_deck_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
  SELECT jsonb_build_object(
    'deckId', d.id,
    'generation', d.generation,
    'restaurants', coalesce(jsonb_agg(jsonb_build_object(
      'id', r.id,
      'nameAr', r.name_ar,
      'nameEn', r.name_en,
      'categories', r.categories,
      'isCityWide', r.is_city_wide,
      'branches', CASE WHEN b.district IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(b.district) END,
      'diningMode', r.dining_mode,
      'timeSlots', r.time_slots,
      'closingTimeAr', r.closing_time_ar,
      'isOpenLate', r.is_open_late,
      'is24Hours', r.is_24_hours,
      'avgPrepMinutes', r.avg_prep_minutes,
      'tier', r.tier,
      'priceTier', r.price_tier,
      'signatureDishAr', coalesce(bs.name_ar, r.signature_dish_ar),
      'signatureDishEn', coalesce(bs.name_en, r.signature_dish_en),
      'vibeTagsAr', r.vibe_tags_ar,
      'vibeTagsEn', r.vibe_tags_en,
      'rating', coalesce(b.google_rating, r.rating),
      'platforms', r.platforms,
      'links', r.links || CASE WHEN b.google_maps_url IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('googleMaps', b.google_maps_url) END,
      'selectedBranch', CASE WHEN b.id IS NULL THEN NULL ELSE jsonb_build_object(
        'id', b.id,
        'nameAr', b.branch_name_ar,
        'nameEn', b.branch_name_en,
        'district', b.district,
        'addressAr', b.address_ar,
        'addressEn', b.address_en,
        'googleMapsUrl', b.google_maps_url,
        'distanceKm', i.distance_km,
        'rating', b.google_rating,
        'reviewCount', b.google_review_count
      ) END
    ) ORDER BY i.position) FILTER (WHERE i.position IS NOT NULL), '[]'::jsonb)
  )
  FROM private.room_restaurant_decks d
  LEFT JOIN private.room_restaurant_deck_items i ON i.deck_id = d.id
  LEFT JOIN public.restaurants r ON r.id = i.restaurant_id
  LEFT JOIN public.restaurant_branches b ON b.id = i.branch_id
  LEFT JOIN LATERAL (
    SELECT s.name_ar, s.name_en
    FROM public.restaurant_best_sellers s
    WHERE s.restaurant_id = r.id AND s.is_signature
    ORDER BY s.sort_order, s.id
    LIMIT 1
  ) bs ON true
  WHERE d.id = requested_deck_id
  GROUP BY d.id, d.generation
$$;

-- Participant presence is public room UI data; session credentials are not.
REVOKE SELECT ON public.participants FROM anon, authenticated;
GRANT SELECT (id, room_id, nickname, player_color, player_shape, is_host, status, joined_at, last_seen_at)
  ON public.participants TO anon, authenticated;

CREATE FUNCTION public.get_room_participants(
  p_room_id uuid,
  p_session_token text,
  p_legacy_session_token text DEFAULT NULL
) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', p.id,
    'room_id', p.room_id,
    'session_token', CASE WHEN p.session_token IN (p_session_token, p_legacy_session_token) THEN p.session_token ELSE '' END,
    'nickname', p.nickname,
    'player_color', p.player_color,
    'player_shape', p.player_shape,
    'is_host', p.is_host,
    'status', p.status,
    'joined_at', p.joined_at,
    'last_seen_at', p.last_seen_at
  ) ORDER BY p.joined_at), '[]'::jsonb)
  FROM public.participants p
  WHERE p.room_id = p_room_id
$$;

CREATE FUNCTION public.set_room_location(
  p_room_id uuid,
  p_participant_id uuid,
  p_session_token text,
  p_latitude double precision,
  p_longitude double precision
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.participants p
    WHERE p.id = p_participant_id AND p.room_id = p_room_id
      AND p.session_token = p_session_token AND p.is_host
  ) THEN
    RAISE EXCEPTION 'Host session required' USING ERRCODE = '42501';
  END IF;

  IF p_latitude IS NULL AND p_longitude IS NULL THEN
    DELETE FROM private.room_locations WHERE room_id = p_room_id;
    RETURN;
  ELSIF p_latitude IS NULL OR p_longitude IS NULL THEN
    RAISE EXCEPTION 'Latitude and longitude must be provided together' USING ERRCODE = '22023';
  END IF;

  INSERT INTO private.room_locations (room_id, latitude, longitude)
  VALUES (p_room_id, p_latitude, p_longitude)
  ON CONFLICT (room_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, updated_at = now();
END
$$;

CREATE FUNCTION public.get_or_create_restaurant_deck(
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
  seed_value text;
BEGIN
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
  seed_value := p_room_id::text || ':' || room_row.winning_category || ':' || next_generation::text;

  INSERT INTO private.room_restaurant_deck_items (deck_id, position, restaurant_id, branch_id, distance_km)
  WITH context AS (
    SELECT private.normalize_district(room_row.neighborhood) AS district_id, l.latitude, l.longitude
    FROM (SELECT 1) x LEFT JOIN private.room_locations l ON l.room_id = p_room_id
  ),
  candidates AS (
    SELECT r.*,
      branch.id AS selected_branch_id,
      branch.district AS selected_district,
      branch.distance_km,
      branch.google_rating,
      branch.google_review_count,
      CASE
        WHEN r.editorial_role = 'staple' THEN 'anchor'
        WHEN r.trend_status IN ('rising','trending') AND r.trend_confidence IN ('high','medium')
          AND (SELECT count(DISTINCT ts.source_id) >= 2 FROM public.restaurant_trend_signals ts
               WHERE ts.restaurant_id = r.id AND ts.confidence IN ('high','medium')
                 AND ts.observed_at >= room_row.swiping_started_at - interval '90 days') THEN 'trend'
        WHEN r.editorial_role = 'discovery' AND r.overall_confidence IN ('high','medium') THEN 'discovery'
        WHEN r.editorial_role = 'popular' THEN 'popular'
        ELSE 'flex'
      END AS pool,
      (0.55 +
       private.reputation_weight(coalesce(branch.google_rating, r.rating), branch.google_review_count) * 1.45 *
         CASE branch.rating_source WHEN 'google_maps_direct' THEN 1.0 WHEN 'google_derived_secondary' THEN 0.82 ELSE 0.68 END +
       CASE WHEN branch.distance_km IS NOT NULL THEN 1.0 / (1.0 + branch.distance_km / 8.0) ELSE 0 END +
       CASE WHEN private.normalize_district(branch.district) = context.district_id THEN 0.75
            WHEN private.normalize_district(branch.district) = ANY(coalesce(geo.neighbors, '{}')) THEN 0.4
            WHEN branch_geo.macrozone = geo.macrozone AND geo.macrozone IS NOT NULL THEN 0.18 ELSE 0 END +
       CASE r.editorial_role WHEN 'staple' THEN 0.24 WHEN 'popular' THEN 0.2 WHEN 'discovery' THEN 0.1 ELSE 0 END +
       CASE WHEN r.trend_status IN ('rising','trending') AND r.trend_confidence IN ('high','medium')
              AND (SELECT count(DISTINCT ts.source_id) >= 2 FROM public.restaurant_trend_signals ts
                   WHERE ts.restaurant_id = r.id AND ts.confidence IN ('high','medium')
                     AND ts.observed_at >= room_row.swiping_started_at - interval '90 days') THEN 0.16 ELSE 0 END +
       CASE coalesce(r.meal_period_strength ->> private.meal_period(room_row.swiping_started_at), 'unknown')
         WHEN 'strong' THEN 0.16 WHEN 'moderate' THEN 0.07 WHEN 'weak' THEN -0.06 ELSE 0 END +
       CASE WHEN r.overall_confidence = 'high' THEN 0.18 WHEN r.overall_confidence = 'medium' THEN 0.08 ELSE 0 END
      )::double precision AS weight
    FROM public.restaurants r
    CROSS JOIN context
    LEFT JOIN private.district_geography geo ON geo.district_id = context.district_id
    LEFT JOIN LATERAL (
      SELECT b.*,
        private.haversine_km(context.latitude, context.longitude, b.latitude, b.longitude) AS distance_km
      FROM public.restaurant_branches b
      LEFT JOIN private.district_geography bg ON bg.district_id = private.normalize_district(b.district)
      WHERE b.restaurant_id = r.id
        AND b.branch_status NOT IN ('temporarily_closed','permanently_closed')
        AND (room_row.eating_mode <> 'dine_in' OR (
          b.dine_in IS DISTINCT FROM false AND b.branch_type NOT IN ('takeaway_only','delivery_only','kiosk')
        ))
      ORDER BY
        CASE WHEN context.latitude IS NOT NULL AND b.latitude IS NOT NULL THEN 0 ELSE 1 END,
        private.haversine_km(context.latitude, context.longitude, b.latitude, b.longitude) NULLS LAST,
        CASE WHEN private.normalize_district(b.district) = context.district_id THEN 0
             WHEN private.normalize_district(b.district) = ANY(coalesce(geo.neighbors, '{}')) THEN 1
             WHEN bg.macrozone = geo.macrozone AND geo.macrozone IS NOT NULL THEN 2 ELSE 3 END,
        CASE b.branch_identity_confidence WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        private.reputation_weight(b.google_rating, b.google_review_count) DESC,
        private.weighted_key(seed_value, b.id::text, 1)
      LIMIT 1
    ) branch ON true
    LEFT JOIN private.district_geography branch_geo ON branch_geo.district_id = private.normalize_district(branch.district)
    WHERE lower(r.city) = lower(room_row.city)
      AND r.operating_status NOT IN ('temporarily_closed','permanently_closed')
      AND r.research_use IN ('production_ready','usable_with_caution')
      AND (r.primary_category = room_row.winning_category
        OR room_row.winning_category = ANY(r.secondary_categories)
        OR room_row.winning_category = ANY(r.categories))
      AND NOT EXISTS (
        SELECT 1 FROM private.room_restaurant_deck_items old_i
        JOIN private.room_restaurant_decks old_d ON old_d.id = old_i.deck_id
        WHERE old_d.room_id = p_room_id AND old_d.round_started_at = room_row.swiping_started_at
          AND old_i.restaurant_id = r.id
      )
      AND (
        (room_row.eating_mode = 'dine_in' AND branch.id IS NOT NULL
          AND coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','dine_in_only'))
        OR (room_row.eating_mode = 'delivery' AND (
          coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','delivery_only')
          OR EXISTS (SELECT 1 FROM public.delivery_platform_listings dl
                     WHERE dl.restaurant_id = r.id AND dl.status IN ('verified','probable'))
        ))
        OR (room_row.eating_mode = 'any' AND (branch.id IS NOT NULL OR EXISTS (
          SELECT 1 FROM public.delivery_platform_listings dl
          WHERE dl.restaurant_id = r.id AND dl.status IN ('verified','probable')
        )))
      )
  ),
  randomized AS (
    SELECT c.*,
      private.weighted_key(seed_value, c.id, c.weight) AS selection_key,
      row_number() OVER (PARTITION BY c.pool ORDER BY private.weighted_key(seed_value, c.id, c.weight)) AS pool_rank,
      row_number() OVER (PARTITION BY c.price_position ORDER BY private.weighted_key(seed_value, c.id, c.weight)) AS price_rank,
      row_number() OVER (PARTITION BY private.normalize_district(c.selected_district) ORDER BY private.weighted_key(seed_value, c.id, c.weight)) AS district_rank
    FROM candidates c
  ),
  ranked AS (
    SELECT x.*,
      CASE WHEN (pool = 'anchor' AND pool_rank <= 2)
             OR (pool = 'popular' AND pool_rank <= 2)
             OR (pool IN ('trend','discovery') AND pool_rank <= 1)
           THEN 0 ELSE 1 END AS composition_rank,
      selection_key * (1 + greatest(price_rank - 3, 0) * 0.12 + greatest(district_rank - 3, 0) * 0.1) AS diverse_key
    FROM randomized x
  ),
  chosen AS (
    SELECT * FROM ranked
    ORDER BY composition_rank, diverse_key, id
    LIMIT 7
  ),
  ordered AS (
    SELECT c.*, row_number() OVER (ORDER BY private.weighted_key(seed_value || ':display', c.id, 1)) AS position
    FROM chosen c
  )
  SELECT new_deck_id, position, id, selected_branch_id, round(distance_km::numeric, 2)
  FROM ordered;

  RETURN private.deck_payload(new_deck_id);
END
$$;

REVOKE ALL ON FUNCTION public.set_room_location(uuid, uuid, text, double precision, double precision) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_or_create_restaurant_deck(uuid, uuid, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_room_participants(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_room_location(uuid, uuid, text, double precision, double precision) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_restaurant_deck(uuid, uuid, text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_room_participants(uuid, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION private.normalize_district(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.haversine_km(double precision, double precision, double precision, double precision) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.reputation_weight(numeric, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.meal_period(timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.weighted_key(text, text, double precision) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.deck_payload(uuid) FROM PUBLIC, anon, authenticated;

COMMIT;
