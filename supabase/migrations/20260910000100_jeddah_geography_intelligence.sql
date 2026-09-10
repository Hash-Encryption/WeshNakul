BEGIN;

ALTER TABLE private.district_geography
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS aliases text[] NOT NULL DEFAULT '{}';

INSERT INTO private.district_geography (district_id, name_ar, name_en, aliases, macrozone, neighbors) VALUES
  ('al_sheraa', 'الشراع', 'Al Sheraa', ARRAY['Sheraa','Al-Sheraa','Al Shiraa'], 'north', ARRAY['abhur_al_shamaliyah']),
  ('al_hamdaniyah', 'الحمدانية', 'Al Hamdaniyah', ARRAY['Hamdaniyah','Al-Hamdaniyah','Al Hamadhnyah'], 'north', '{}'),
  ('abhur_al_shamaliyah', 'أبحر الشمالية', 'Abhur Al Shamaliyah', ARRAY['Obhur','Abhur','North Obhur','North Abhur','Obhur Al Shamaliyah','Abhur Al-Shamaliyah'], 'north', ARRAY['al_sheraa']),
  ('abhur_al_janoubiyah', 'أبحر الجنوبية', 'Abhur Al Janoubiyah', ARRAY['South Obhur','South Abhur','Obhur Al Janoubiyah','Abhur Al-Janoubiyah'], 'north', '{}'),
  ('al_murjan', 'المرجان', 'Al Murjan', ARRAY['Murjan','Al-Murjan','Al Marjan'], 'north_central', ARRAY['al_basateen','al_shati']),
  ('al_basateen', 'البساتين', 'Al Basateen', ARRAY['Basateen','Al-Basateen'], 'north_central', ARRAY['al_murjan','al_mohammadiyyah']),
  ('al_mohammadiyyah', 'المحمدية', 'Al Mohammadiyyah', ARRAY['Mohammadiyyah','Muhammadiyah','Al Muhammadiyah','Al-Mohammadiyyah','Al Mohammadeeyyah'], 'north_central', ARRAY['al_basateen','al_naeem','al_shati']),
  ('al_naeem', 'النعيم', 'Al Naeem', ARRAY['Naeem','Al-Naeem'], 'north_central', ARRAY['al_mohammadiyyah','al_salamah']),
  ('al_marwah', 'المروة', 'Al Marwah', ARRAY['Marwah','Al-Marwah'], 'north_central', ARRAY['al_safa']),
  ('al_shati', 'الشاطئ', 'Al Shati', ARRAY['Shati','Al-Shati','Al Shatee'], 'central', ARRAY['al_andalus','al_khalidiyyah','al_mohammadiyyah','al_murjan','al_zahra']),
  ('al_bawadi', 'البوادي', 'Al Bawadi', ARRAY['Bawadi','Al-Bawadi'], 'central', ARRAY['al_faisaliyyah','al_salamah']),
  ('al_salamah', 'السلامة', 'Al Salamah', ARRAY['Salamah','Al-Salamah'], 'central', ARRAY['al_bawadi','al_naeem','al_rawdah','al_zahra']),
  ('al_zahra', 'الزهراء', 'Al Zahra', ARRAY['Zahra','Al-Zahra','Al Zahrah'], 'central', ARRAY['al_khalidiyyah','al_salamah','al_shati']),
  ('al_safa', 'الصفا', 'Al Safa', ARRAY['Safa','Al-Safa'], 'central', ARRAY['al_faisaliyyah','al_marwah','al_rehab','al_samer']),
  ('al_samer', 'السامر', 'Al Samer', ARRAY['Samer','Al-Samer'], 'central', ARRAY['al_safa']),
  ('al_faisaliyyah', 'الفيصلية', 'Al Faisaliyyah', ARRAY['Faisaliyyah','Faisaliyah','Al-Faisaliyyah','Al Faisaleyyah'], 'central', ARRAY['al_bawadi','al_rawdah','al_safa']),
  ('al_rawdah', 'الروضة', 'Al Rawdah', ARRAY['Rawdah','Ar Rawdah','Al-Rawdah','Al Rawdhah'], 'central', ARRAY['al_andalus','al_faisaliyyah','al_khalidiyyah','al_salamah']),
  ('al_khalidiyyah', 'الخالدية', 'Al Khalidiyyah', ARRAY['Khalidiyyah','Al-Khalidiyyah','Al Khalideyyah'], 'central', ARRAY['al_andalus','al_rawdah','al_shati','al_zahra']),
  ('al_rehab', 'الرحاب', 'Al Rehab', ARRAY['Rehab','Al-Rehab'], 'central', ARRAY['al_safa']),
  ('al_andalus', 'الأندلس', 'Al Andalus', ARRAY['Andalus','Al-Andalus','Al Andulus'], 'south_central', ARRAY['al_hamra','al_khalidiyyah','al_rawdah','al_shati']),
  ('al_hamra', 'الحمراء', 'Al Hamra', ARRAY['Hamra','Al-Hamra','Al Hamrah'], 'south_central', ARRAY['al_andalus','al_ruwais']),
  ('al_naseem', 'النسيم', 'Al Naseem', ARRAY['Naseem','Al-Naseem'], 'south_central', ARRAY['al_faiha']),
  ('al_ruwais', 'الرويس', 'Al Ruwais', ARRAY['Ruwais','Al-Ruwais','Al Ruwase'], 'south_central', ARRAY['al_hamra']),
  ('al_faiha', 'الفيحاء', 'Al Faiha', ARRAY['Faiha','Fayha','Al-Faiha','Al Fayha'], 'south', ARRAY['al_naseem','al_thaghr']),
  ('al_balad', 'البلد', 'Al Balad', ARRAY['Balad','Al-Balad'], 'south', '{}'),
  ('al_thaghr', 'الثغر', 'Al Thaghr', ARRAY['Thaghr','Al-Thaghr','Al Thagur'], 'south', ARRAY['al_faiha'])
ON CONFLICT (district_id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  aliases = EXCLUDED.aliases,
  macrozone = EXCLUDED.macrozone,
  neighbors = EXCLUDED.neighbors;

CREATE OR REPLACE FUNCTION private.normalize_district(value text) RETURNS text
LANGUAGE sql STABLE STRICT SET search_path = pg_catalog, private AS $$
  SELECT district.district_id
  FROM private.district_geography district
  CROSS JOIN LATERAL unnest(ARRAY[district.district_id, district.name_ar, district.name_en] || district.aliases) alias(alias_value)
  WHERE regexp_replace(lower(trim(alias.alias_value)), '[-_ ]+', ' ', 'g') =
        regexp_replace(lower(trim($1)), '[-_ ]+', ' ', 'g')
  ORDER BY district.district_id
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION private.district_tier(origin_id text, target_id text) RETURNS integer
LANGUAGE sql STABLE SET search_path = pg_catalog, private AS $$
  SELECT CASE
    WHEN origin.district_id IS NULL OR target.district_id IS NULL THEN 4
    WHEN origin.district_id = target.district_id THEN 0
    WHEN target.district_id = ANY(origin.neighbors) THEN 1
    WHEN EXISTS (
      SELECT 1
      FROM private.district_geography direct
      WHERE direct.district_id = ANY(origin.neighbors)
        AND target.district_id = ANY(direct.neighbors)
        AND target.district_id <> origin.district_id
        AND NOT target.district_id = ANY(origin.neighbors)
    ) THEN 2
    WHEN origin.macrozone = target.macrozone THEN 3
    ELSE 4
  END
  FROM (SELECT origin_id, target_id) input
  LEFT JOIN private.district_geography origin ON origin.district_id = input.origin_id
  LEFT JOIN private.district_geography target ON target.district_id = input.target_id
$$;

CREATE OR REPLACE FUNCTION private.district_weight(tier integer) RETURNS double precision
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog AS $$
  SELECT CASE tier WHEN 0 THEN 0.75 WHEN 1 THEN 0.4 WHEN 2 THEN 0.28 WHEN 3 THEN 0.18 ELSE 0 END
$$;

CREATE OR REPLACE FUNCTION public.get_or_create_restaurant_deck(
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
       private.district_weight(branch.geography_tier) +
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
    LEFT JOIN LATERAL (
      SELECT b.*,
        private.haversine_km(context.latitude, context.longitude, b.latitude, b.longitude) AS distance_km,
        private.district_tier(context.district_id, branch_geo.district_id) AS geography_tier
      FROM public.restaurant_branches b
      LEFT JOIN private.district_geography branch_geo ON branch_geo.district_id = private.normalize_district(b.district)
      WHERE b.restaurant_id = r.id
        AND b.branch_status NOT IN ('temporarily_closed','permanently_closed')
        AND (room_row.eating_mode <> 'dine_in' OR (
          b.dine_in IS DISTINCT FROM false AND b.branch_type NOT IN ('takeaway_only','delivery_only','kiosk')
        ))
      ORDER BY
        CASE WHEN context.latitude IS NOT NULL AND b.latitude IS NOT NULL THEN 0 ELSE 1 END,
        private.haversine_km(context.latitude, context.longitude, b.latitude, b.longitude) NULLS LAST,
        geography_tier,
        CASE b.branch_identity_confidence WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        private.reputation_weight(b.google_rating, b.google_review_count) DESC,
        private.weighted_key(seed_value, b.id::text, 1)
      LIMIT 1
    ) branch ON true
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

REVOKE ALL ON FUNCTION private.normalize_district(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.district_tier(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.district_weight(integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_or_create_restaurant_deck(uuid, uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_restaurant_deck(uuid, uuid, text, uuid) TO anon, authenticated;

COMMIT;
