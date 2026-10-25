-- ============================================================================
-- WeshNakul Phase 5: Algorithm Controls, Preview, Versioning & Rollback
-- Migration: 20261023000100_phase5_algorithm_controls.sql
--
-- Implements:
-- 1. Immutable published algorithm versions table (public.algorithm_published_versions)
-- 2. Isolated algorithm draft table (public.algorithm_drafts)
-- 3. Algorithm versioning linkage in private.room_restaurant_decks
-- 4. Authoritative settings resolution with category/mode overrides
-- 5. Safe, atomic publish and rollback RPCs with optimistic concurrency
-- 6. Side-effect-free preview evaluation RPC (private.preview_algorithm_deck)
-- 7. Production recommendation runtime integration in private.create_restaurant_deck
-- ============================================================================

BEGIN;

-- 1. Immutable Published Algorithm Versions Table
CREATE TABLE IF NOT EXISTS public.algorithm_published_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number integer NOT NULL UNIQUE,
  config_schema_version text NOT NULL DEFAULT 'v1.0.0',
  settings jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  published_by text NOT NULL DEFAULT 'system',
  published_at timestamptz NOT NULL DEFAULT now(),
  change_summary text,
  reason text,
  rollback_of_version integer REFERENCES public.algorithm_published_versions(version_number)
);

-- Ensure strictly ONE active published version exists at any given time
CREATE UNIQUE INDEX IF NOT EXISTS idx_algorithm_active_version
  ON public.algorithm_published_versions (is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_algorithm_published_versions_num
  ON public.algorithm_published_versions (version_number DESC);

-- 2. Algorithm Drafts Table (isolated draft editing)
CREATE TABLE IF NOT EXISTS public.algorithm_drafts (
  id text PRIMARY KEY DEFAULT 'current',
  settings jsonb NOT NULL,
  updated_by text NOT NULL DEFAULT 'admin',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Link algorithm version to private.room_restaurant_decks
ALTER TABLE private.room_restaurant_decks
  ADD COLUMN IF NOT EXISTS algorithm_version integer
  REFERENCES public.algorithm_published_versions(version_number) ON DELETE SET NULL;

-- 4. RLS & Permissions
ALTER TABLE public.algorithm_published_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.algorithm_drafts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.algorithm_published_versions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.algorithm_drafts FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.algorithm_published_versions TO service_role;
GRANT ALL ON TABLE public.algorithm_published_versions TO service_role;
GRANT ALL ON TABLE public.algorithm_drafts TO service_role;

-- 5. Helper Function: Baseline Algorithm Configuration (Safe Hardcoded Fallback)
CREATE OR REPLACE FUNCTION private.baseline_algorithm_settings()
RETURNS jsonb
LANGUAGE sql IMMUTABLE
AS $$
  SELECT '{
    "schema_version": "v1.0.0",
    "global": {
      "reputation_weight_factor": 1.45,
      "editorial_staple_boost": 0.24,
      "editorial_popular_boost": 0.20,
      "editorial_discovery_boost": 0.10,
      "trend_boost": 0.16,
      "confidence_boost": 0.18,
      "distance_proximity_weight": 1.00,
      "distance_decay_km": 8.0,
      "district_proximity_weight": 1.00,
      "progressive_widening_tier_penalty": 0.20,
      "repetition_penalty": 1.00,
      "diversity_style_weight": 0.15,
      "diversity_price_weight": 0.12,
      "diversity_editorial_weight": 0.10,
      "pizza_crossover_probability": 0.50
    },
    "overrides": {}
  }'::jsonb;
$$;

-- 6. Helper Function: Get Active Algorithm Settings (authoritative lookup)
CREATE OR REPLACE FUNCTION private.get_active_algorithm_settings()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
  SELECT coalesce(
    (SELECT settings FROM public.algorithm_published_versions WHERE is_active = true LIMIT 1),
    private.baseline_algorithm_settings()
  );
$$;

-- 7. Helper Function: Get Active Algorithm Version Number
CREATE OR REPLACE FUNCTION private.get_active_algorithm_version_number()
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
  SELECT coalesce(
    (SELECT version_number FROM public.algorithm_published_versions WHERE is_active = true LIMIT 1),
    1
  );
$$;

-- 8. Helper Function: Resolve Effective Settings for Scope (Global + Mode + Category Overrides)
CREATE OR REPLACE FUNCTION public.get_effective_algorithm_settings(
  p_config jsonb,
  p_mode text DEFAULT NULL,
  p_category text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  v_res jsonb;
  v_overrides jsonb;
  v_mode_key text;
  v_cat_key text;
BEGIN
  IF p_config IS NULL OR NOT (p_config ? 'global') THEN
    p_config := private.baseline_algorithm_settings();
  END IF;

  v_res := p_config->'global';
  v_overrides := coalesce(p_config->'overrides', '{}'::jsonb);

  -- 1. Apply mode override if present
  IF p_mode IS NOT NULL THEN
    v_mode_key := 'mode:' || lower(trim(p_mode));
    IF v_overrides ? v_mode_key THEN
      v_res := v_res || (v_overrides->v_mode_key);
    END IF;
  END IF;

  -- 2. Apply category override if present (takes precedence over mode)
  IF p_category IS NOT NULL THEN
    v_cat_key := 'category:' || lower(trim(p_category));
    IF v_overrides ? v_cat_key THEN
      v_res := v_res || (v_overrides->v_cat_key);
    END IF;
  END IF;

  RETURN v_res;
END;
$$;

-- 9. Authoritative Publish RPC
CREATE OR REPLACE FUNCTION public.publish_algorithm_settings(
  p_settings jsonb,
  p_admin_id text,
  p_reason text DEFAULT NULL,
  p_expected_active_version integer DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  v_current_active_version integer;
  v_next_version integer;
  v_new_id uuid;
  v_published_at timestamptz := now();
  v_summary text;
  v_schema_version text;
BEGIN
  -- Concurrency check: pg_advisory_xact_lock to ensure atomic serial publication
  PERFORM pg_advisory_xact_lock(hashtextextended('wsh_algorithm_publish_lock', 0));

  SELECT version_number INTO v_current_active_version
  FROM public.algorithm_published_versions
  WHERE is_active = true
  LIMIT 1;

  -- Verify optimistic concurrency if expected version was provided
  IF p_expected_active_version IS NOT NULL AND v_current_active_version IS DISTINCT FROM p_expected_active_version THEN
    RAISE EXCEPTION 'WSH_ALGORITHM_CONCURRENCY_CONFLICT: Active algorithm version is % but expected %',
      v_current_active_version, p_expected_active_version
      USING ERRCODE = 'P0001';
  END IF;

  v_schema_version := coalesce(p_settings->>'schema_version', 'v1.0.0');
  IF v_schema_version <> 'v1.0.0' THEN
    RAISE EXCEPTION 'WSH_INVALID_SCHEMA_VERSION: Unsupported schema version %', v_schema_version
      USING ERRCODE = '22023';
  END IF;

  IF p_settings->'global' IS NULL OR NOT (p_settings ? 'global') THEN
    RAISE EXCEPTION 'WSH_INVALID_SETTINGS: Missing global configuration object'
      USING ERRCODE = '22023';
  END IF;

  v_next_version := coalesce(
    (SELECT max(version_number) FROM public.algorithm_published_versions),
    0
  ) + 1;

  v_summary := coalesce(
    p_reason,
    'Published algorithm configuration v' || v_next_version::text
  );

  -- Deactivate previous active version
  UPDATE public.algorithm_published_versions
  SET is_active = false
  WHERE is_active = true;

  -- Insert new active published version
  INSERT INTO public.algorithm_published_versions (
    version_number,
    config_schema_version,
    settings,
    is_active,
    published_by,
    published_at,
    change_summary,
    reason
  ) VALUES (
    v_next_version,
    v_schema_version,
    p_settings,
    true,
    coalesce(p_admin_id, 'admin'),
    v_published_at,
    v_summary,
    p_reason
  ) RETURNING id INTO v_new_id;

  -- Synchronize draft storage
  INSERT INTO public.algorithm_drafts (id, settings, updated_by, updated_at)
  VALUES ('current', p_settings, coalesce(p_admin_id, 'admin'), v_published_at)
  ON CONFLICT (id) DO UPDATE
  SET settings = EXCLUDED.settings,
      updated_by = EXCLUDED.updated_by,
      updated_at = EXCLUDED.updated_at;

  -- Record audit log in catalog_change_history
  BEGIN
    INSERT INTO public.catalog_change_history (
      entity_type,
      entity_id,
      action,
      change_summary,
      previous_state,
      new_state,
      changed_by,
      reason,
      effective_at
    ) VALUES (
      'deck_algorithm',
      'v' || v_next_version::text,
      'algorithm_updated',
      v_summary,
      CASE WHEN v_current_active_version IS NOT NULL THEN jsonb_build_object('version', v_current_active_version) ELSE NULL END,
      jsonb_build_object('version', v_next_version, 'schema', v_schema_version),
      coalesce(p_admin_id, 'admin'),
      p_reason,
      v_published_at
    );
  EXCEPTION WHEN OTHERS THEN
    -- Resilient audit fallback
    NULL;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_new_id,
    'version_number', v_next_version,
    'published_at', v_published_at,
    'published_by', coalesce(p_admin_id, 'admin'),
    'summary', v_summary
  );
END;
$$;

-- 10. Authoritative Rollback RPC
CREATE OR REPLACE FUNCTION public.rollback_algorithm_settings(
  p_target_version integer,
  p_admin_id text,
  p_reason text DEFAULT NULL,
  p_expected_active_version integer DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  v_target_row public.algorithm_published_versions%ROWTYPE;
  v_current_active_version integer;
  v_next_version integer;
  v_new_id uuid;
  v_published_at timestamptz := now();
  v_summary text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('wsh_algorithm_publish_lock', 0));

  SELECT version_number INTO v_current_active_version
  FROM public.algorithm_published_versions
  WHERE is_active = true
  LIMIT 1;

  IF p_expected_active_version IS NOT NULL AND v_current_active_version IS DISTINCT FROM p_expected_active_version THEN
    RAISE EXCEPTION 'WSH_ALGORITHM_CONCURRENCY_CONFLICT: Active algorithm version is % but expected %',
      v_current_active_version, p_expected_active_version
      USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_target_row
  FROM public.algorithm_published_versions
  WHERE version_number = p_target_version;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'WSH_TARGET_VERSION_NOT_FOUND: Algorithm version % does not exist', p_target_version
      USING ERRCODE = '22023';
  END IF;

  v_next_version := coalesce(
    (SELECT max(version_number) FROM public.algorithm_published_versions),
    0
  ) + 1;

  v_summary := coalesce(
    p_reason,
    'Rollback to configuration v' || p_target_version::text
  );

  UPDATE public.algorithm_published_versions
  SET is_active = false
  WHERE is_active = true;

  INSERT INTO public.algorithm_published_versions (
    version_number,
    config_schema_version,
    settings,
    is_active,
    published_by,
    published_at,
    change_summary,
    reason,
    rollback_of_version
  ) VALUES (
    v_next_version,
    v_target_row.config_schema_version,
    v_target_row.settings,
    true,
    coalesce(p_admin_id, 'admin'),
    v_published_at,
    v_summary,
    p_reason,
    p_target_version
  ) RETURNING id INTO v_new_id;

  INSERT INTO public.algorithm_drafts (id, settings, updated_by, updated_at)
  VALUES ('current', v_target_row.settings, coalesce(p_admin_id, 'admin'), v_published_at)
  ON CONFLICT (id) DO UPDATE
  SET settings = EXCLUDED.settings,
      updated_by = EXCLUDED.updated_by,
      updated_at = EXCLUDED.updated_at;

  BEGIN
    INSERT INTO public.catalog_change_history (
      entity_type,
      entity_id,
      action,
      change_summary,
      previous_state,
      new_state,
      changed_by,
      reason,
      effective_at
    ) VALUES (
      'deck_algorithm',
      'v' || v_next_version::text,
      'algorithm_updated',
      v_summary,
      CASE WHEN v_current_active_version IS NOT NULL THEN jsonb_build_object('version', v_current_active_version) ELSE NULL END,
      jsonb_build_object('version', v_next_version, 'restored_from_version', p_target_version),
      coalesce(p_admin_id, 'admin'),
      p_reason,
      v_published_at
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_new_id,
    'version_number', v_next_version,
    'rollback_of_version', p_target_version,
    'published_at', v_published_at,
    'published_by', coalesce(p_admin_id, 'admin'),
    'summary', v_summary
  );
END;
$$;

-- 11. Seed Baseline Published Version 1 & Initial Draft if table is empty
DO $$
DECLARE
  v_baseline jsonb := private.baseline_algorithm_settings();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.algorithm_published_versions) THEN
    INSERT INTO public.algorithm_published_versions (
      version_number,
      config_schema_version,
      settings,
      is_active,
      published_by,
      published_at,
      change_summary,
      reason
    ) VALUES (
      1,
      'v1.0.0',
      v_baseline,
      true,
      'system',
      now(),
      'Initial baseline recommendation algorithm configuration',
      'Initial system bootstrap'
    );
  END IF;

  INSERT INTO public.algorithm_drafts (id, settings, updated_by, updated_at)
  VALUES ('current', v_baseline, 'system', now())
  ON CONFLICT (id) DO NOTHING;
END $$;

-- 12. Pure, Side-Effect-Free Preview Evaluation RPCs
CREATE OR REPLACE FUNCTION private.assemble_preview_deck(
  p_city text,
  p_mode text,
  p_category text,
  p_district text,
  p_lat double precision,
  p_lng double precision,
  p_eating_mode text,
  p_preferences text[],
  p_effective_settings jsonb,
  p_seed text
) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  v_rep_weight double precision;
  v_dist_weight double precision;
  v_dist_decay double precision;
  v_geo_weight double precision;
  v_staple_boost double precision;
  v_popular_boost double precision;
  v_discovery_boost double precision;
  v_trend_boost double precision;
  v_confidence_boost double precision;
  v_widening_penalty double precision;
  v_style_div_weight double precision;
  v_price_div_weight double precision;
  v_editorial_div_weight double precision;
  v_pizza_crossover_prob double precision;

  v_district_id text;
  has_nearby_pref boolean;
  has_healthy_pref boolean;
  eligible_core_count integer := 0;
  eligible_broast_rotation_count integer := 0;
  eligible_pizza_crossover_count integer := 0;
  v_result_cards jsonb;
BEGIN
  v_rep_weight := coalesce((p_effective_settings->>'reputation_weight_factor')::double precision, 1.45);
  v_dist_weight := coalesce((p_effective_settings->>'distance_proximity_weight')::double precision, 1.00);
  v_dist_decay := coalesce((p_effective_settings->>'distance_decay_km')::double precision, 8.0);
  v_geo_weight := coalesce((p_effective_settings->>'district_proximity_weight')::double precision, 1.00);
  v_staple_boost := coalesce((p_effective_settings->>'editorial_staple_boost')::double precision, 0.24);
  v_popular_boost := coalesce((p_effective_settings->>'editorial_popular_boost')::double precision, 0.20);
  v_discovery_boost := coalesce((p_effective_settings->>'editorial_discovery_boost')::double precision, 0.10);
  v_trend_boost := coalesce((p_effective_settings->>'trend_boost')::double precision, 0.16);
  v_confidence_boost := coalesce((p_effective_settings->>'confidence_boost')::double precision, 0.18);
  v_widening_penalty := coalesce((p_effective_settings->>'progressive_widening_tier_penalty')::double precision, 0.20);
  v_style_div_weight := coalesce((p_effective_settings->>'diversity_style_weight')::double precision, 0.15);
  v_price_div_weight := coalesce((p_effective_settings->>'diversity_price_weight')::double precision, 0.12);
  v_editorial_div_weight := coalesce((p_effective_settings->>'diversity_editorial_weight')::double precision, 0.10);
  v_pizza_crossover_prob := coalesce((p_effective_settings->>'pizza_crossover_probability')::double precision, 0.50);

  v_district_id := private.normalize_district(p_district);
  has_nearby_pref := coalesce('nearby' = ANY(p_preferences), false);
  has_healthy_pref := coalesce('healthy' = ANY(p_preferences), false);

  CREATE TEMP TABLE IF NOT EXISTS _preview_candidates (
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
    name_ar text,
    name_en text,
    branch_name_ar text,
    branch_name_en text,
    editorial_role text,
    rep_comp double precision,
    dist_comp double precision,
    geo_comp double precision,
    edit_comp double precision,
    trend_comp double precision,
    conf_comp double precision
  ) ON COMMIT DROP;
  TRUNCATE _preview_candidates;

  CREATE TEMP TABLE IF NOT EXISTS _preview_chosen (
    restaurant_id text PRIMARY KEY,
    branch_id uuid,
    distance_km double precision,
    core_status text,
    selection_order integer
  ) ON COMMIT DROP;
  TRUNCATE _preview_chosen;

  WITH eligible_branches AS (
    SELECT
      r.id AS restaurant_id,
      r.name_ar,
      r.name_en,
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
      b.branch_name_ar,
      b.branch_name_en,
      b.district AS branch_district,
      b.latitude AS branch_latitude,
      b.longitude AS branch_longitude,
      b.google_rating AS branch_google_rating,
      b.google_review_count AS branch_google_review_count,
      b.rating_source AS branch_rating_source,
      b.branch_identity_confidence,
      private.haversine_km(p_lat, p_lng, b.latitude, b.longitude) AS dist_km,
      private.district_tier(v_district_id, branch_geo.district_id) AS geo_tier,
      CASE
        WHEN p_eating_mode = 'delivery' THEN 'delivery'
        WHEN p_eating_mode = 'dine_in' THEN 'going_out'
        WHEN r.dining_mode_summary = 'delivery_only' THEN 'delivery'
        WHEN r.dining_mode_summary = 'dine_in_only' THEN 'going_out'
        ELSE 'both'
      END AS use_case
    FROM public.restaurants r
    JOIN public.restaurant_branches b ON b.restaurant_id = r.id
    LEFT JOIN private.district_geography branch_geo ON branch_geo.district_id = private.normalize_district(b.district)
    WHERE lower(r.city) = lower(p_city)
      AND r.operating_status NOT IN ('temporarily_closed','permanently_closed')
      AND r.research_use IN ('production_ready','usable_with_caution')
      AND (
        r.primary_category = p_category
        OR p_category = ANY(r.secondary_categories)
        OR p_category = ANY(r.categories)
      )
      AND (NOT has_healthy_pref OR ('healthy' = ANY(r.categories) OR 'healthy' = ANY(r.context_tags) OR r.primary_category = 'healthy'))
      AND b.branch_status NOT IN ('temporarily_closed','permanently_closed')
      AND (
        p_eating_mode <> 'dine_in' OR (
          b.dine_in IS DISTINCT FROM false AND b.branch_type NOT IN ('takeaway_only','delivery_only','kiosk')
        )
      )
      AND (
        (p_eating_mode = 'dine_in' AND coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','dine_in_only'))
        OR (p_eating_mode = 'delivery' AND (
          coalesce(nullif(r.dining_mode_summary::text, 'unknown'), r.dining_mode) IN ('both','delivery_only')
          OR EXISTS (SELECT 1 FROM public.delivery_platform_listings dl WHERE dl.restaurant_id = r.id AND dl.status IN ('verified','probable'))
        ))
        OR (coalesce(p_eating_mode, 'any') NOT IN ('dine_in', 'delivery'))
      )
  ),
  branches_with_proximity AS (
    SELECT eb.*,
      CASE
        WHEN p_lat IS NOT NULL AND eb.branch_latitude IS NOT NULL THEN
          CASE
            WHEN eb.dist_km <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 8.0 WHEN 'going_out' THEN 18.0 ELSE 12.0 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 14.0 WHEN 'going_out' THEN 35.0 ELSE 25.0 END
              END
            ) THEN 0::smallint
            WHEN eb.dist_km <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 15.0 WHEN 'going_out' THEN 35.0 ELSE 22.0 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 22.0 WHEN 'going_out' THEN 50.0 ELSE 35.0 END
              END
            ) THEN 1::smallint
            ELSE 2::smallint
          END
        WHEN v_district_id IS NOT NULL THEN
          CASE
            WHEN eb.geo_tier IS NOT NULL AND eb.geo_tier <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 1 WHEN 'going_out' THEN 3 ELSE 2 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 2 WHEN 'going_out' THEN 4 ELSE 3 END
              END
            ) THEN 0::smallint
            WHEN eb.geo_tier IS NOT NULL AND eb.geo_tier <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 3 WHEN 'going_out' THEN 5 ELSE 4 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 4 WHEN 'going_out' THEN 6 ELSE 5 END
              END
            ) THEN 1::smallint
            ELSE 2::smallint
          END
        ELSE 0::smallint
      END AS proximity_tier
    FROM eligible_branches eb
  ),
  best_branch_per_restaurant AS (
    SELECT DISTINCT ON (bwp.restaurant_id)
      bwp.restaurant_id,
      bwp.name_ar,
      bwp.name_en,
      bwp.core_status,
      bwp.branch_id,
      bwp.branch_name_ar,
      bwp.branch_name_en,
      bwp.branch_district,
      bwp.dist_km,
      bwp.editorial_role,
      bwp.reputation_tags,
      bwp.trend_status,
      bwp.context_tags,
      bwp.price_position,
      bwp.proximity_tier,
      (private.reputation_weight(coalesce(bwp.branch_google_rating, bwp.rating), bwp.branch_google_review_count) *
        v_rep_weight *
        CASE bwp.branch_rating_source WHEN 'google_maps_direct' THEN 1.0 WHEN 'google_derived_secondary' THEN 0.82 ELSE 0.68 END)::double precision AS rep_comp,
      (CASE WHEN bwp.dist_km IS NOT NULL AND p_lat IS NOT NULL THEN v_dist_weight / (1.0 + bwp.dist_km / v_dist_decay) ELSE 0.0 END)::double precision AS dist_comp,
      (v_geo_weight * private.district_weight(bwp.geo_tier))::double precision AS geo_comp,
      (CASE bwp.editorial_role
        WHEN 'staple' THEN v_staple_boost
        WHEN 'popular' THEN v_popular_boost
        WHEN 'discovery' THEN v_discovery_boost
        ELSE 0.0
      END)::double precision AS edit_comp,
      (CASE WHEN bwp.trend_status IN ('rising','trending') AND bwp.trend_confidence IN ('high','medium') THEN v_trend_boost ELSE 0.0 END)::double precision AS trend_comp,
      (CASE WHEN bwp.overall_confidence = 'high' THEN v_confidence_boost
            WHEN bwp.overall_confidence = 'medium' THEN (v_confidence_boost * (4.0 / 9.0))
            ELSE 0.0 END)::double precision AS conf_comp
    FROM branches_with_proximity bwp
    ORDER BY
      bwp.restaurant_id,
      bwp.proximity_tier ASC,
      CASE WHEN p_lat IS NOT NULL AND bwp.branch_latitude IS NOT NULL THEN 0 ELSE 1 END,
      bwp.dist_km NULLS LAST,
      bwp.geo_tier ASC,
      CASE bwp.branch_identity_confidence WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      private.reputation_weight(bwp.branch_google_rating, bwp.branch_google_review_count) DESC,
      private.weighted_key(p_seed, bwp.branch_id::text, 1)
  )
  INSERT INTO _preview_candidates
  SELECT
    bbr.restaurant_id,
    bbr.core_status,
    bbr.branch_id,
    bbr.branch_district,
    bbr.dist_km,
    (0.55 + bbr.rep_comp + bbr.dist_comp + bbr.geo_comp + bbr.edit_comp + bbr.trend_comp + bbr.conf_comp)::double precision AS weight,
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
    bbr.name_ar,
    bbr.name_en,
    bbr.branch_name_ar,
    bbr.branch_name_en,
    bbr.editorial_role::text,
    bbr.rep_comp,
    bbr.dist_comp,
    bbr.geo_comp,
    bbr.edit_comp,
    bbr.trend_comp,
    bbr.conf_comp
  FROM best_branch_per_restaurant bbr;

  IF p_category = 'burger' THEN
    SELECT count(*)::int INTO eligible_core_count FROM _preview_candidates WHERE core_status = 'core';
    IF eligible_core_count > 0 THEN
      WITH core_pool AS (
        SELECT c.*,
          private.weighted_key(p_seed || ':core', c.restaurant_id, c.weight) AS core_key
        FROM _preview_candidates c
        WHERE c.core_status = 'core'
      )
      INSERT INTO _preview_chosen (restaurant_id, branch_id, distance_km, core_status, selection_order)
      SELECT c.restaurant_id, c.selected_branch_id, c.distance_km, c.core_status, 1
      FROM core_pool c
      ORDER BY c.proximity_tier ASC, c.core_key ASC
      LIMIT 1;
    END IF;

    WITH remaining_pool AS (
      SELECT c.*,
        private.weighted_key(p_seed || ':fill', c.restaurant_id, c.weight) AS fill_key,
        row_number() OVER (
          PARTITION BY (CASE WHEN 'smash' = ANY(c.context_tags) THEN 'smash' WHEN 'wagyu' = ANY(c.context_tags) THEN 'wagyu' ELSE 'classic' END)
          ORDER BY private.weighted_key(p_seed || ':style', c.restaurant_id, c.weight)
        ) AS style_rank,
        row_number() OVER (
          PARTITION BY c.price_position
          ORDER BY private.weighted_key(p_seed || ':price', c.restaurant_id, c.weight)
        ) AS price_rank,
        row_number() OVER (
          PARTITION BY c.editorial_classification
          ORDER BY private.weighted_key(p_seed || ':editorial', c.restaurant_id, c.weight)
        ) AS editorial_rank
      FROM _preview_candidates c
      WHERE NOT EXISTS (SELECT 1 FROM _preview_chosen cur WHERE cur.restaurant_id = c.restaurant_id)
    ),
    diverse_ranked AS (
      SELECT rp.*,
        rp.fill_key * (
          1.0 +
          greatest(rp.style_rank - 3, 0) * v_style_div_weight +
          greatest(rp.price_rank - 3, 0) * v_price_div_weight +
          greatest(rp.editorial_rank - 3, 0) * v_editorial_div_weight
        ) AS diverse_key
      FROM remaining_pool rp
    )
    INSERT INTO _preview_chosen (restaurant_id, branch_id, distance_km, core_status, selection_order)
    SELECT dr.restaurant_id, dr.selected_branch_id, dr.distance_km, dr.core_status,
      coalesce((SELECT count(*)::int FROM _preview_chosen), 0) + (row_number() OVER (ORDER BY dr.proximity_tier ASC, dr.diverse_key ASC))::integer
    FROM diverse_ranked dr
    ORDER BY dr.proximity_tier ASC, dr.diverse_key ASC
    LIMIT (7 - (SELECT count(*)::int FROM _preview_chosen));

  ELSIF p_category = 'fried_chicken' THEN
    SELECT count(*)::int INTO eligible_broast_rotation_count
    FROM _preview_candidates
    WHERE restaurant_id = ANY(ARRAY['rami_broast', 'broast_hanoo']);

    IF eligible_broast_rotation_count > 0 THEN
      WITH broast_pool AS (
        SELECT c.*,
          private.weighted_key(p_seed || ':broast_rotation', c.restaurant_id, c.weight) AS rotation_key
        FROM _preview_candidates c
        WHERE c.restaurant_id = ANY(ARRAY['rami_broast', 'broast_hanoo'])
      )
      INSERT INTO _preview_chosen (restaurant_id, branch_id, distance_km, core_status, selection_order)
      SELECT bp.restaurant_id, bp.selected_branch_id, bp.distance_km, bp.core_status, 1
      FROM broast_pool bp
      ORDER BY (bp.rotation_key * (1.0 + bp.proximity_tier * v_widening_penalty)) ASC
      LIMIT 1;
    END IF;

    WITH general_pool AS (
      SELECT c.*,
        private.weighted_key(p_seed || ':fc_general', c.restaurant_id, c.weight) AS selection_key,
        row_number() OVER (PARTITION BY c.price_position ORDER BY private.weighted_key(p_seed || ':fc_price', c.restaurant_id, c.weight)) AS price_rank,
        row_number() OVER (PARTITION BY private.normalize_district(c.selected_district) ORDER BY private.weighted_key(p_seed || ':fc_district', c.restaurant_id, c.weight)) AS district_rank
      FROM _preview_candidates c
      WHERE NOT (c.restaurant_id = ANY(ARRAY['rami_broast', 'broast_hanoo']))
        AND NOT EXISTS (SELECT 1 FROM _preview_chosen cur WHERE cur.restaurant_id = c.restaurant_id)
    ),
    ranked_general AS (
      SELECT gp.*,
        selection_key * (1.0 + greatest(price_rank - 3, 0) * v_price_div_weight + greatest(district_rank - 3, 0) * v_editorial_div_weight) AS diverse_key
      FROM general_pool gp
    )
    INSERT INTO _preview_chosen (restaurant_id, branch_id, distance_km, core_status, selection_order)
    SELECT rg.restaurant_id, rg.selected_branch_id, rg.distance_km, rg.core_status,
      coalesce((SELECT count(*)::int FROM _preview_chosen), 0) + (row_number() OVER (ORDER BY rg.proximity_tier ASC, rg.diverse_key ASC))::integer
    FROM ranked_general rg
    ORDER BY rg.proximity_tier ASC, rg.diverse_key ASC
    LIMIT (7 - (SELECT count(*)::int FROM _preview_chosen));

    IF (SELECT count(*)::int FROM _preview_chosen) < 7 THEN
      INSERT INTO _preview_chosen (restaurant_id, branch_id, distance_km, core_status, selection_order)
      SELECT c.restaurant_id, c.selected_branch_id, c.distance_km, c.core_status,
        coalesce((SELECT count(*)::int FROM _preview_chosen), 0) + (row_number() OVER (ORDER BY c.proximity_tier ASC, private.weighted_key(p_seed || ':fc_fallback', c.restaurant_id, c.weight) ASC))::integer
      FROM _preview_candidates c
      WHERE NOT EXISTS (SELECT 1 FROM _preview_chosen cur WHERE cur.restaurant_id = c.restaurant_id)
      ORDER BY c.proximity_tier ASC, private.weighted_key(p_seed || ':fc_fallback', c.restaurant_id, c.weight) ASC
      LIMIT (7 - (SELECT count(*)::int FROM _preview_chosen));
    END IF;

  ELSIF p_category = 'pizza' THEN
    SELECT count(*)::int INTO eligible_pizza_crossover_count
    FROM _preview_candidates c
    WHERE c.restaurant_id IN (SELECT restaurant_id FROM private.pizza_approved_crossovers);

    IF eligible_pizza_crossover_count > 0 AND (private.weighted_key(p_seed || ':pizza_crossover_slot', 'crossover_chance', 1) < v_pizza_crossover_prob) THEN
      WITH crossover_pool AS (
        SELECT c.*,
          private.weighted_key(p_seed || ':pizza_crossover', c.restaurant_id, c.weight) AS crossover_key
        FROM _preview_candidates c
        WHERE c.restaurant_id IN (SELECT restaurant_id FROM private.pizza_approved_crossovers)
      )
      INSERT INTO _preview_chosen (restaurant_id, branch_id, distance_km, core_status, selection_order)
      SELECT cp.restaurant_id, cp.selected_branch_id, cp.distance_km, cp.core_status, 1
      FROM crossover_pool cp
      ORDER BY (cp.crossover_key * (1.0 + cp.proximity_tier * v_widening_penalty)) ASC
      LIMIT 1;
    END IF;

    WITH primary_pool AS (
      SELECT c.*,
        private.weighted_key(p_seed || ':pizza_primary', c.restaurant_id, c.weight) AS selection_key,
        row_number() OVER (PARTITION BY c.price_position ORDER BY private.weighted_key(p_seed || ':pizza_price', c.restaurant_id, c.weight)) AS price_rank,
        row_number() OVER (PARTITION BY private.normalize_district(c.selected_district) ORDER BY private.weighted_key(p_seed || ':pizza_district', c.restaurant_id, c.weight)) AS district_rank
      FROM _preview_candidates c
      WHERE c.restaurant_id IN (SELECT id FROM public.restaurants WHERE primary_category = 'pizza')
        AND NOT EXISTS (SELECT 1 FROM _preview_chosen cur WHERE cur.restaurant_id = c.restaurant_id)
    ),
    ranked_primary AS (
      SELECT pp.*,
        pp.selection_key * (1.0 + greatest(pp.price_rank - 3, 0) * v_price_div_weight + greatest(pp.district_rank - 3, 0) * v_editorial_div_weight) AS diverse_key
      FROM primary_pool pp
    )
    INSERT INTO _preview_chosen (restaurant_id, branch_id, distance_km, core_status, selection_order)
    SELECT rp.restaurant_id, rp.selected_branch_id, rp.distance_km, rp.core_status,
      coalesce((SELECT count(*)::int FROM _preview_chosen), 0) + (row_number() OVER (ORDER BY rp.proximity_tier ASC, rp.diverse_key ASC))::integer
    FROM ranked_primary rp
    ORDER BY rp.proximity_tier ASC, rp.diverse_key ASC
    LIMIT (7 - (SELECT count(*)::int FROM _preview_chosen));

    IF (SELECT count(*)::int FROM _preview_chosen) < 7 THEN
      INSERT INTO _preview_chosen (restaurant_id, branch_id, distance_km, core_status, selection_order)
      SELECT c.restaurant_id, c.selected_branch_id, c.distance_km, c.core_status,
        coalesce((SELECT count(*)::int FROM _preview_chosen), 0) + (row_number() OVER (ORDER BY c.proximity_tier ASC, private.weighted_key(p_seed || ':pizza_fallback', c.restaurant_id, c.weight) ASC))::integer
      FROM _preview_candidates c
      WHERE NOT EXISTS (SELECT 1 FROM _preview_chosen cur WHERE cur.restaurant_id = c.restaurant_id)
        AND (
          c.restaurant_id IN (SELECT id FROM public.restaurants WHERE primary_category = 'pizza')
          OR (
            c.restaurant_id IN (SELECT restaurant_id FROM private.pizza_approved_crossovers)
            AND (SELECT count(*)::int FROM _preview_chosen WHERE restaurant_id IN (SELECT restaurant_id FROM private.pizza_approved_crossovers)) = 0
          )
        )
      ORDER BY c.proximity_tier ASC, private.weighted_key(p_seed || ':pizza_fallback', c.restaurant_id, c.weight) ASC
      LIMIT (7 - (SELECT count(*)::int FROM _preview_chosen));
    END IF;

  ELSE
    WITH non_burger_pool AS (
      SELECT c.*,
        private.weighted_key(p_seed, c.restaurant_id, c.weight) AS selection_key,
        row_number() OVER (PARTITION BY c.price_position ORDER BY private.weighted_key(p_seed, c.restaurant_id, c.weight)) AS price_rank,
        row_number() OVER (PARTITION BY private.normalize_district(c.selected_district) ORDER BY private.weighted_key(p_seed, c.restaurant_id, c.weight)) AS district_rank
      FROM _preview_candidates c
    ),
    ranked AS (
      SELECT nbp.*,
        selection_key * (1.0 + greatest(price_rank - 3, 0) * v_price_div_weight + greatest(district_rank - 3, 0) * v_editorial_div_weight) AS diverse_key
      FROM non_burger_pool nbp
    )
    INSERT INTO _preview_chosen (restaurant_id, branch_id, distance_km, core_status, selection_order)
    SELECT r.restaurant_id, r.selected_branch_id, r.distance_km, r.core_status,
      (row_number() OVER (ORDER BY r.proximity_tier ASC, r.diverse_key ASC))::integer
    FROM ranked r
    ORDER BY r.proximity_tier ASC, r.diverse_key ASC
    LIMIT 7;
  END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', ch.restaurant_id,
    'nameAr', can.name_ar,
    'nameEn', can.name_en,
    'branchNameAr', can.branch_name_ar,
    'branchNameEn', can.branch_name_en,
    'district', can.selected_district,
    'distanceKm', round(ch.distance_km::numeric, 2),
    'score', round(can.weight::numeric, 3),
    'scoreBreakdown', jsonb_build_object(
      'base', 0.55,
      'reputation', round(can.rep_comp::numeric, 3),
      'distance', round(can.dist_comp::numeric, 3),
      'district', round(can.geo_comp::numeric, 3),
      'editorial', round(can.edit_comp::numeric, 3),
      'trend', round(can.trend_comp::numeric, 3),
      'confidence', round(can.conf_comp::numeric, 3),
      'totalWeight', round(can.weight::numeric, 3)
    ),
    'tier', can.editorial_role,
    'coreStatus', ch.core_status,
    'isCrossover', (ch.restaurant_id IN (SELECT restaurant_id FROM private.pizza_approved_crossovers))
  ) ORDER BY ch.selection_order ASC), '[]'::jsonb)
  INTO v_result_cards
  FROM _preview_chosen ch
  JOIN _preview_candidates can ON can.restaurant_id = ch.restaurant_id;

  RETURN v_result_cards;
END;
$$;

-- 12b. Public Side-Effect-Free Preview Evaluation RPC (PostgREST Exposed)
CREATE OR REPLACE FUNCTION public.preview_algorithm_deck(
  p_city text DEFAULT 'jeddah',
  p_mode text DEFAULT 'food',
  p_category text DEFAULT 'burger',
  p_district text DEFAULT 'al_rawdah',
  p_lat double precision DEFAULT 21.5728,
  p_lng double precision DEFAULT 39.1558,
  p_eating_mode text DEFAULT 'any',
  p_preferences text[] DEFAULT '{}'::text[],
  p_proposed_settings jsonb DEFAULT NULL,
  p_seed text DEFAULT 'preview-seed'
) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  v_published_config jsonb;
  v_proposed_config jsonb;
  v_pub_effective jsonb;
  v_prop_effective jsonb;
  v_pub_cards jsonb;
  v_prop_cards jsonb;
BEGIN
  v_published_config := private.get_active_algorithm_settings();
  v_proposed_config := coalesce(p_proposed_settings, v_published_config);

  v_pub_effective := public.get_effective_algorithm_settings(v_published_config, p_mode, p_category);
  v_prop_effective := public.get_effective_algorithm_settings(v_proposed_config, p_mode, p_category);

  v_pub_cards := private.assemble_preview_deck(
    p_city, p_mode, p_category, p_district, p_lat, p_lng, p_eating_mode, p_preferences,
    v_pub_effective, p_seed || ':pub'
  );

  v_prop_cards := private.assemble_preview_deck(
    p_city, p_mode, p_category, p_district, p_lat, p_lng, p_eating_mode, p_preferences,
    v_prop_effective, p_seed || ':prop'
  );

  RETURN jsonb_build_object(
    'publishedDeck', v_pub_cards,
    'proposedDeck', v_prop_cards,
    'activeVersionNumber', private.get_active_algorithm_version_number()
  );
END;
$$;

-- 13. Update Production private.create_restaurant_deck to Read Authoritative Settings
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

  -- Phase 5 Authoritative Algorithm Configuration
  v_active_config jsonb;
  v_active_version integer;
  v_effective_settings jsonb;

  -- Parameterized weights
  v_rep_weight double precision;
  v_dist_weight double precision;
  v_dist_decay double precision;
  v_geo_weight double precision;
  v_staple_boost double precision;
  v_popular_boost double precision;
  v_discovery_boost double precision;
  v_trend_boost double precision;
  v_confidence_boost double precision;
  v_widening_penalty double precision;
  v_repeat_penalty double precision;
  v_style_div_weight double precision;
  v_price_div_weight double precision;
  v_editorial_div_weight double precision;
  v_pizza_crossover_prob double precision;
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

  -- Read active algorithm configuration and resolve mode/category overrides
  v_active_config := private.get_active_algorithm_settings();
  v_active_version := private.get_active_algorithm_version_number();
  v_effective_settings := public.get_effective_algorithm_settings(
    v_active_config,
    room_row.room_mode,
    room_row.winning_category
  );

  v_rep_weight := coalesce((v_effective_settings->>'reputation_weight_factor')::double precision, 1.45);
  v_dist_weight := coalesce((v_effective_settings->>'distance_proximity_weight')::double precision, 1.00);
  v_dist_decay := coalesce((v_effective_settings->>'distance_decay_km')::double precision, 8.0);
  v_geo_weight := coalesce((v_effective_settings->>'district_proximity_weight')::double precision, 1.00);
  v_staple_boost := coalesce((v_effective_settings->>'editorial_staple_boost')::double precision, 0.24);
  v_popular_boost := coalesce((v_effective_settings->>'editorial_popular_boost')::double precision, 0.20);
  v_discovery_boost := coalesce((v_effective_settings->>'editorial_discovery_boost')::double precision, 0.10);
  v_trend_boost := coalesce((v_effective_settings->>'trend_boost')::double precision, 0.16);
  v_confidence_boost := coalesce((v_effective_settings->>'confidence_boost')::double precision, 0.18);
  v_widening_penalty := coalesce((v_effective_settings->>'progressive_widening_tier_penalty')::double precision, 0.20);
  v_repeat_penalty := coalesce((v_effective_settings->>'repetition_penalty')::double precision, 1.00);
  v_style_div_weight := coalesce((v_effective_settings->>'diversity_style_weight')::double precision, 0.15);
  v_price_div_weight := coalesce((v_effective_settings->>'diversity_price_weight')::double precision, 0.12);
  v_editorial_div_weight := coalesce((v_effective_settings->>'diversity_editorial_weight')::double precision, 0.10);
  v_pizza_crossover_prob := coalesce((v_effective_settings->>'pizza_crossover_probability')::double precision, 0.50);

  INSERT INTO private.room_restaurant_decks (room_id, round_started_at, category, generation, algorithm_version)
  VALUES (p_room_id, room_row.swiping_started_at, room_row.winning_category, next_generation, v_active_version)
  RETURNING id INTO new_deck_id;

  -- True cryptographic randomness for the draw seed
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
        WHEN context.latitude IS NOT NULL AND eb.branch_latitude IS NOT NULL THEN
          CASE
            WHEN eb.dist_km <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 8.0 WHEN 'going_out' THEN 18.0 ELSE 12.0 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 14.0 WHEN 'going_out' THEN 35.0 ELSE 25.0 END
              END
            ) THEN 0::smallint
            WHEN eb.dist_km <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 15.0 WHEN 'going_out' THEN 35.0 ELSE 22.0 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 22.0 WHEN 'going_out' THEN 50.0 ELSE 35.0 END
              END
            ) THEN 1::smallint
            ELSE 2::smallint
          END

        WHEN context.district_id IS NOT NULL THEN
          CASE
            WHEN eb.geo_tier IS NOT NULL AND eb.geo_tier <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 1 WHEN 'going_out' THEN 3 ELSE 2 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 2 WHEN 'going_out' THEN 4 ELSE 3 END
              END
            ) THEN 0::smallint
            WHEN eb.geo_tier IS NOT NULL AND eb.geo_tier <= (
              CASE
                WHEN has_nearby_pref THEN
                  CASE eb.use_case WHEN 'delivery' THEN 3 WHEN 'going_out' THEN 5 ELSE 4 END
                ELSE
                  CASE eb.use_case WHEN 'delivery' THEN 4 WHEN 'going_out' THEN 6 ELSE 5 END
              END
            ) THEN 1::smallint
            ELSE 2::smallint
          END

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
        private.reputation_weight(coalesce(bwp.branch_google_rating, bwp.rating), bwp.branch_google_review_count) *
          v_rep_weight *
          CASE bwp.branch_rating_source WHEN 'google_maps_direct' THEN 1.0 WHEN 'google_derived_secondary' THEN 0.82 ELSE 0.68 END +
        CASE WHEN bwp.dist_km IS NOT NULL THEN v_dist_weight / (1.0 + bwp.dist_km / v_dist_decay) ELSE 0.0 END +
        v_geo_weight * private.district_weight(bwp.geo_tier) +
        CASE bwp.editorial_role
          WHEN 'staple' THEN v_staple_boost
          WHEN 'popular' THEN v_popular_boost
          WHEN 'discovery' THEN v_discovery_boost
          ELSE 0.0
        END +
        CASE WHEN bwp.trend_status IN ('rising','trending') AND bwp.trend_confidence IN ('high','medium') THEN v_trend_boost ELSE 0.0 END +
        CASE WHEN bwp.overall_confidence = 'high' THEN v_confidence_boost
             WHEN bwp.overall_confidence = 'medium' THEN (v_confidence_boost * (4.0 / 9.0))
             ELSE 0.0 END
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
    IF eligible_core_count > 0 THEN
      WITH core_pool AS (
        SELECT c.*,
          private.weighted_key(draw_seed || ':core', c.restaurant_id, c.weight) AS core_key,
          CASE
            WHEN c.is_immediate_repeat THEN (2.0 * v_repeat_penalty)
            WHEN c.is_historical_repeat THEN (1.0 * v_repeat_penalty)
            ELSE 0.0
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
          WHEN c.is_immediate_repeat THEN (2.0 * v_repeat_penalty)
          WHEN c.is_historical_repeat THEN (1.0 * v_repeat_penalty)
          ELSE 0.0
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
          greatest(rp.style_rank - 3, 0) * v_style_div_weight +
          greatest(rp.price_rank - 3, 0) * v_price_div_weight +
          greatest(rp.editorial_rank - 3, 0) * v_editorial_div_weight
        ) AS diverse_key
      FROM remaining_pool rp
    )
    INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
    SELECT dr.restaurant_id, dr.selected_branch_id, dr.distance_km, dr.core_status
    FROM diverse_ranked dr
    ORDER BY dr.proximity_tier ASC, dr.repeat_tier ASC, dr.diverse_key ASC
    LIMIT (7 - (SELECT count(*)::int FROM _chosen_cards));

  ELSIF room_row.winning_category = 'fried_chicken' THEN
    SELECT count(*)::int INTO eligible_broast_rotation_count
    FROM _deck_candidates
    WHERE restaurant_id = ANY(ARRAY['rami_broast', 'broast_hanoo']);

    IF eligible_broast_rotation_count > 0 THEN
      WITH broast_pool AS (
        SELECT c.*,
          private.weighted_key(draw_seed || ':broast_rotation', c.restaurant_id, c.weight) AS rotation_key,
          CASE
            WHEN c.is_immediate_repeat THEN (2.0 * v_repeat_penalty)
            WHEN c.is_historical_repeat THEN (1.0 * v_repeat_penalty)
            ELSE 0.0
          END AS repeat_tier
        FROM _deck_candidates c
        WHERE c.restaurant_id = ANY(ARRAY['rami_broast', 'broast_hanoo'])
      )
      INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
      SELECT bp.restaurant_id, bp.selected_branch_id, bp.distance_km, bp.core_status
      FROM broast_pool bp
      ORDER BY bp.repeat_tier ASC, (bp.rotation_key * (1.0 + bp.proximity_tier * v_widening_penalty)) ASC
      LIMIT 1;
    END IF;

    WITH general_pool AS (
      SELECT c.*,
        private.weighted_key(draw_seed || ':fc_general', c.restaurant_id, c.weight) AS selection_key,
        CASE
          WHEN c.is_immediate_repeat THEN (2.0 * v_repeat_penalty)
          WHEN c.is_historical_repeat THEN (1.0 * v_repeat_penalty)
          ELSE 0.0
        END AS repeat_tier,
        row_number() OVER (PARTITION BY c.price_position ORDER BY private.weighted_key(draw_seed || ':fc_price', c.restaurant_id, c.weight)) AS price_rank,
        row_number() OVER (PARTITION BY private.normalize_district(c.selected_district) ORDER BY private.weighted_key(draw_seed || ':fc_district', c.restaurant_id, c.weight)) AS district_rank
      FROM _deck_candidates c
      WHERE NOT (c.restaurant_id = ANY(ARRAY['rami_broast', 'broast_hanoo']))
        AND NOT EXISTS (SELECT 1 FROM _chosen_cards cur WHERE cur.restaurant_id = c.restaurant_id)
    ),
    ranked_general AS (
      SELECT gp.*,
        selection_key * (1.0 + greatest(price_rank - 3, 0) * v_price_div_weight + greatest(district_rank - 3, 0) * v_editorial_div_weight) AS diverse_key
      FROM general_pool gp
    )
    INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
    SELECT rg.restaurant_id, rg.selected_branch_id, rg.distance_km, rg.core_status
    FROM ranked_general rg
    ORDER BY rg.proximity_tier ASC, rg.repeat_tier ASC, rg.diverse_key ASC
    LIMIT (7 - (SELECT count(*)::int FROM _chosen_cards));

    IF (SELECT count(*)::int FROM _chosen_cards) < 7 THEN
      INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
      SELECT c.restaurant_id, c.selected_branch_id, c.distance_km, c.core_status
      FROM _deck_candidates c
      WHERE NOT EXISTS (SELECT 1 FROM _chosen_cards cur WHERE cur.restaurant_id = c.restaurant_id)
      ORDER BY c.proximity_tier ASC, private.weighted_key(draw_seed || ':fc_fallback', c.restaurant_id, c.weight) ASC
      LIMIT (7 - (SELECT count(*)::int FROM _chosen_cards));
    END IF;

  ELSIF room_row.winning_category = 'pizza' THEN
    SELECT count(*)::int INTO eligible_pizza_crossover_count
    FROM _deck_candidates c
    WHERE c.restaurant_id IN (SELECT restaurant_id FROM private.pizza_approved_crossovers);

    -- Configurable crossover slot probability
    IF eligible_pizza_crossover_count > 0 AND (private.weighted_key(draw_seed || ':pizza_crossover_slot', 'crossover_chance', 1) < v_pizza_crossover_prob) THEN
      WITH crossover_pool AS (
        SELECT c.*,
          private.weighted_key(draw_seed || ':pizza_crossover', c.restaurant_id, c.weight) AS crossover_key,
          CASE
            WHEN c.is_immediate_repeat THEN (2.0 * v_repeat_penalty)
            WHEN c.is_historical_repeat THEN (1.0 * v_repeat_penalty)
            ELSE 0.0
          END AS repeat_tier
        FROM _deck_candidates c
        WHERE c.restaurant_id IN (SELECT restaurant_id FROM private.pizza_approved_crossovers)
      )
      INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
      SELECT cp.restaurant_id, cp.selected_branch_id, cp.distance_km, cp.core_status
      FROM crossover_pool cp
      ORDER BY cp.repeat_tier ASC, (cp.crossover_key * (1.0 + cp.proximity_tier * v_widening_penalty)) ASC
      LIMIT 1;
    END IF;

    WITH primary_pool AS (
      SELECT c.*,
        private.weighted_key(draw_seed || ':pizza_primary', c.restaurant_id, c.weight) AS selection_key,
        CASE
          WHEN c.is_immediate_repeat THEN (2.0 * v_repeat_penalty)
          WHEN c.is_historical_repeat THEN (1.0 * v_repeat_penalty)
          ELSE 0.0
        END AS repeat_tier,
        row_number() OVER (PARTITION BY c.price_position ORDER BY private.weighted_key(draw_seed || ':pizza_price', c.restaurant_id, c.weight)) AS price_rank,
        row_number() OVER (PARTITION BY private.normalize_district(c.selected_district) ORDER BY private.weighted_key(draw_seed || ':pizza_district', c.restaurant_id, c.weight)) AS district_rank
      FROM _deck_candidates c
      WHERE c.restaurant_id IN (SELECT id FROM public.restaurants WHERE primary_category = 'pizza')
        AND NOT EXISTS (SELECT 1 FROM _chosen_cards cur WHERE cur.restaurant_id = c.restaurant_id)
    ),
    ranked_primary AS (
      SELECT pp.*,
        pp.selection_key * (1.0 + greatest(pp.price_rank - 3, 0) * v_price_div_weight + greatest(pp.district_rank - 3, 0) * v_editorial_div_weight) AS diverse_key
      FROM primary_pool pp
    )
    INSERT INTO _chosen_cards (restaurant_id, branch_id, distance_km, core_status)
    SELECT rp.restaurant_id, rp.selected_branch_id, rp.distance_km, rp.core_status
    FROM ranked_primary rp
    ORDER BY rp.proximity_tier ASC, rp.repeat_tier ASC, rp.diverse_key ASC
    LIMIT (7 - (SELECT count(*)::int FROM _chosen_cards));

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
    WITH non_burger_pool AS (
      SELECT c.*,
        private.weighted_key(draw_seed, c.restaurant_id, c.weight) AS selection_key,
        CASE
          WHEN c.is_immediate_repeat THEN (2.0 * v_repeat_penalty)
          WHEN c.is_historical_repeat THEN (1.0 * v_repeat_penalty)
          ELSE 0.0
        END AS repeat_tier,
        row_number() OVER (PARTITION BY c.price_position ORDER BY private.weighted_key(draw_seed, c.restaurant_id, c.weight)) AS price_rank,
        row_number() OVER (PARTITION BY private.normalize_district(c.selected_district) ORDER BY private.weighted_key(draw_seed, c.restaurant_id, c.weight)) AS district_rank
      FROM _deck_candidates c
    ),
    ranked AS (
      SELECT nbp.*,
        selection_key * (1.0 + greatest(price_rank - 3, 0) * v_price_div_weight + greatest(district_rank - 3, 0) * v_editorial_div_weight) AS diverse_key
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

REVOKE ALL ON FUNCTION private.create_restaurant_deck(uuid, uuid, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.assemble_preview_deck(text, text, text, text, double precision, double precision, text, text[], jsonb, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.preview_algorithm_deck(text, text, text, text, double precision, double precision, text, text[], jsonb, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.publish_algorithm_settings(jsonb, text, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rollback_algorithm_settings(integer, text, text, integer) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION private.assemble_preview_deck(text, text, text, text, double precision, double precision, text, text[], jsonb, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.preview_algorithm_deck(text, text, text, text, double precision, double precision, text, text[], jsonb, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.publish_algorithm_settings(jsonb, text, text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.rollback_algorithm_settings(integer, text, text, integer) TO service_role;

COMMIT;
