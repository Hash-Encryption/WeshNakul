-- 20261019000100_phase3_deep_analytics_and_catalog_history.sql
-- WeshNakul Phase 3: Deep Analytics, Algorithm Health & Forward-Only Catalog History
--
-- MANDATES & ACCEPTANCE GUARANTEES:
-- 1. Read-Only Admin Security:
--    RPC execution granted exclusively to `service_role`. Direct table access strictly denied.
-- 2. Performance & Bounded Queries:
--    Composite indexes on category, district, eating_mode, and room_mode.
-- 3. Metric Integrity:
--    - Separates generated candidates from displayed impressions.
--    - Response Approval Rate: YES / (YES + NO + LATER).
--    - Exposure-to-YES: YES / Impressions.
--    - Win Rate: Wins / Impressions (with explicit sample size exposure).
--    - Low-confidence threshold enforced: is_low_confidence = (impressions < 20).
-- 4. Forward-Only Catalog Change History:
--    - Base table tracking future catalog updates with auditable change records.
--    - Initial baseline record established with explicit start timestamp.
--    - Zero fabricated historical reconstruction.
-- 5. Safe & Non-Destructive:
--    - Does not modify operational room tables or past analytics events.

BEGIN;

-- 1. Composite Performance Indexes on public.analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_cat_time
  ON public.analytics_events (category, event_time DESC)
  WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_dist_time
  ON public.analytics_events (district, event_time DESC)
  WHERE district IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_mode_time
  ON public.analytics_events (room_mode, eating_mode, event_time DESC);

-- 2. Forward-Only Catalog Change History Table
CREATE TABLE IF NOT EXISTS public.catalog_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('restaurant', 'branch', 'deck_algorithm')),
  entity_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'retired', 'algorithm_updated')),
  changed_by text NOT NULL DEFAULT 'system',
  change_summary text NOT NULL,
  previous_state jsonb,
  new_state jsonb,
  effective_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_history_time
  ON public.catalog_change_history (effective_at DESC);

CREATE INDEX IF NOT EXISTS idx_catalog_history_entity
  ON public.catalog_change_history (entity_type, entity_id);

-- Enforce strict RLS on catalog change history
ALTER TABLE public.catalog_change_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.catalog_change_history FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.catalog_change_history TO service_role;

-- Insert explicit tracking-start marker for forward-only audit tracking
INSERT INTO public.catalog_change_history (
  entity_type,
  entity_id,
  action,
  changed_by,
  change_summary,
  previous_state,
  new_state,
  effective_at
) VALUES (
  'deck_algorithm',
  'system_baseline',
  'algorithm_updated',
  'system_phase3_init',
  'Tracking start marker: Phase 3 forward-only catalog audit established. Prior catalog revisions preserved in Git version control.',
  NULL,
  jsonb_build_object(
    'marker_type', 'tracking_start_marker',
    'baseline_version', '2.0.0-phase3',
    'status', 'active',
    'scope', 'forward_only_catalog_changes'
  ),
  now()
);

-- 3. Forward-Only Automated Catalog Change Capture Triggers
-- Safe Catalog State Projection Helper: Restaurants
-- Retains approved catalog fields only; strictly excludes contact info, operational notes, review reasons, and credentials.
CREATE OR REPLACE FUNCTION public.project_restaurant_catalog_state(p_row jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_row IS NULL THEN NULL
    ELSE jsonb_strip_nulls(jsonb_build_object(
      'id', p_row->>'id',
      'name_en', p_row->>'name_en',
      'name_ar', p_row->>'name_ar',
      'categories', p_row->'categories',
      'dining_mode', p_row->>'dining_mode',
      'price_tier', p_row->>'price_tier',
      'rating', p_row->'rating',
      'operating_status', coalesce(p_row->>'operating_status', p_row->>'status'),
      'is_city_wide', (p_row->>'is_city_wide')::boolean,
      'tier', p_row->>'tier'
    ))
  END;
$$;

-- Safe Catalog State Projection Helper: Restaurant Branches
-- Retains approved catalog fields only; strictly excludes exact GPS coordinates (latitude, longitude), Google Place IDs, maps URLs, and operational sync timestamps.
CREATE OR REPLACE FUNCTION public.project_branch_catalog_state(p_row jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_row IS NULL THEN NULL
    ELSE jsonb_strip_nulls(jsonb_build_object(
      'id', p_row->>'id',
      'restaurant_id', p_row->>'restaurant_id',
      'branch_name_en', p_row->>'branch_name_en',
      'branch_name_ar', p_row->>'branch_name_ar',
      'district', p_row->>'district',
      'branch_status', coalesce(p_row->>'branch_status', p_row->>'status'),
      'branch_type', p_row->>'branch_type',
      'dine_in', (p_row->>'dine_in')::boolean,
      'takeaway', (p_row->>'takeaway')::boolean,
      'late_night', (p_row->>'late_night')::boolean,
      'is_24_hours', (p_row->>'is_24_hours')::boolean
    ))
  END;
$$;

-- Captures INSERT, UPDATE, and DELETE on public.restaurants
CREATE OR REPLACE FUNCTION public.trg_record_restaurant_catalog_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_action text;
  v_summary text;
  v_prev jsonb;
  v_new jsonb;
  v_id text;
  v_changed_by text;
  v_new_status text;
  v_old_status text;
BEGIN
  v_changed_by := coalesce(current_setting('request.jwt.claim.sub', true), current_user, 'system');

  IF TG_OP = 'INSERT' THEN
    v_new := public.project_restaurant_catalog_state(to_jsonb(NEW));
    v_id := coalesce(v_new->>'id', NEW.id::text, '');
    v_action := 'created';
    v_prev := NULL;
    v_summary := 'Restaurant created: ' || coalesce(v_new->>'name_en', v_new->>'name_ar', v_id);

  ELSIF TG_OP = 'UPDATE' THEN
    v_prev := public.project_restaurant_catalog_state(to_jsonb(OLD));
    v_new := public.project_restaurant_catalog_state(to_jsonb(NEW));
    v_id := coalesce(v_new->>'id', NEW.id::text, '');

    -- Suppress routine updates where approved catalog fields did not change
    -- (Operational metadata changes such as updated_at or sync timestamps are ignored)
    IF v_prev = v_new THEN
      RETURN NEW;
    END IF;

    v_new_status := coalesce(v_new->>'operating_status', '');
    v_old_status := coalesce(v_prev->>'operating_status', '');

    IF v_new_status = 'permanently_closed' AND (v_old_status IS DISTINCT FROM 'permanently_closed') THEN
      v_action := 'retired';
      v_summary := 'Restaurant retired: ' || coalesce(v_new->>'name_en', v_new->>'name_ar', v_id);
    ELSE
      v_action := 'updated';
      v_summary := 'Restaurant updated: ' || coalesce(v_new->>'name_en', v_new->>'name_ar', v_id);
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    v_prev := public.project_restaurant_catalog_state(to_jsonb(OLD));
    v_new := NULL;
    v_id := coalesce(v_prev->>'id', OLD.id::text, '');
    v_action := 'retired';
    v_summary := 'Restaurant deleted: ' || coalesce(v_prev->>'name_en', v_prev->>'name_ar', v_id);
  END IF;

  -- Transactionally atomic history insertion: failure here rolls back catalog change
  INSERT INTO public.catalog_change_history (
    entity_type,
    entity_id,
    action,
    changed_by,
    change_summary,
    previous_state,
    new_state,
    effective_at
  ) VALUES (
    'restaurant',
    v_id,
    v_action,
    v_changed_by,
    v_summary,
    v_prev,
    v_new,
    now()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Captures INSERT, UPDATE, and DELETE on public.restaurant_branches
CREATE OR REPLACE FUNCTION public.trg_record_branch_catalog_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_action text;
  v_summary text;
  v_prev jsonb;
  v_new jsonb;
  v_id text;
  v_changed_by text;
  v_new_status text;
  v_old_status text;
  v_rest_id text;
  v_name text;
BEGIN
  v_changed_by := coalesce(current_setting('request.jwt.claim.sub', true), current_user, 'system');

  IF TG_OP = 'INSERT' THEN
    v_new := public.project_branch_catalog_state(to_jsonb(NEW));
    v_id := coalesce(v_new->>'id', NEW.id::text, '');
    v_action := 'created';
    v_prev := NULL;
    v_rest_id := coalesce(v_new->>'restaurant_id', '');
    v_name := coalesce(v_new->>'branch_name_en', v_new->>'branch_name_ar', v_new->>'district', v_id);
    v_summary := 'Branch created: ' || v_name || CASE WHEN v_rest_id <> '' THEN ' (' || v_rest_id || ')' ELSE '' END;

  ELSIF TG_OP = 'UPDATE' THEN
    v_prev := public.project_branch_catalog_state(to_jsonb(OLD));
    v_new := public.project_branch_catalog_state(to_jsonb(NEW));
    v_id := coalesce(v_new->>'id', NEW.id::text, '');

    -- Suppress routine updates where approved catalog fields did not change
    -- (Operational metadata changes such as updated_at or sync timestamps are ignored)
    IF v_prev = v_new THEN
      RETURN NEW;
    END IF;

    v_new_status := coalesce(v_new->>'branch_status', '');
    v_old_status := coalesce(v_prev->>'branch_status', '');
    v_rest_id := coalesce(v_new->>'restaurant_id', '');
    v_name := coalesce(v_new->>'branch_name_en', v_new->>'branch_name_ar', v_new->>'district', v_id);

    IF v_new_status = 'permanently_closed' AND (v_old_status IS DISTINCT FROM 'permanently_closed') THEN
      v_action := 'retired';
      v_summary := 'Branch retired: ' || v_name || CASE WHEN v_rest_id <> '' THEN ' (' || v_rest_id || ')' ELSE '' END;
    ELSE
      v_action := 'updated';
      v_summary := 'Branch updated: ' || v_name || CASE WHEN v_rest_id <> '' THEN ' (' || v_rest_id || ')' ELSE '' END;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    v_prev := public.project_branch_catalog_state(to_jsonb(OLD));
    v_new := NULL;
    v_id := coalesce(v_prev->>'id', OLD.id::text, '');
    v_action := 'retired';
    v_rest_id := coalesce(v_prev->>'restaurant_id', '');
    v_name := coalesce(v_prev->>'branch_name_en', v_prev->>'branch_name_ar', v_prev->>'district', v_id);
    v_summary := 'Branch deleted: ' || v_name || CASE WHEN v_rest_id <> '' THEN ' (' || v_rest_id || ')' ELSE '' END;
  END IF;

  -- Transactionally atomic history insertion: failure here rolls back catalog change
  INSERT INTO public.catalog_change_history (
    entity_type,
    entity_id,
    action,
    changed_by,
    change_summary,
    previous_state,
    new_state,
    effective_at
  ) VALUES (
    'branch',
    v_id,
    v_action,
    v_changed_by,
    v_summary,
    v_prev,
    v_new,
    now()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Conditionally attach triggers when tables exist
DO $$
BEGIN
  IF to_regclass('public.restaurants') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_audit_restaurants_changes ON public.restaurants;
    CREATE TRIGGER trg_audit_restaurants_changes
      AFTER INSERT OR UPDATE OR DELETE ON public.restaurants
      FOR EACH ROW EXECUTE FUNCTION public.trg_record_restaurant_catalog_change();
  END IF;

  IF to_regclass('public.restaurant_branches') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS trg_audit_branches_changes ON public.restaurant_branches;
    CREATE TRIGGER trg_audit_branches_changes
      AFTER INSERT OR UPDATE OR DELETE ON public.restaurant_branches
      FOR EACH ROW EXECUTE FUNCTION public.trg_record_branch_catalog_change();
  END IF;
END $$;

-- 3. Authoritative Deep Analytics & Algorithm Health Function
CREATE OR REPLACE FUNCTION public.get_admin_deep_analytics(
  p_start_time timestamptz DEFAULT (now() - interval '30 days'),
  p_end_time timestamptz DEFAULT now(),
  p_category text DEFAULT NULL,
  p_district text DEFAULT NULL,
  p_eating_mode text DEFAULT NULL,
  p_room_mode text DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_summary jsonb;
  v_algorithm_health jsonb;
  v_brands jsonb;
  v_resolution_methods jsonb;
  v_catalog_changes jsonb;
  v_events_feed jsonb;
  v_total_filtered int;
  v_safe_limit int;
  v_safe_offset int;
BEGIN
  -- Safe boundary checks
  IF p_start_time IS NULL THEN
    p_start_time := now() - interval '30 days';
  END IF;
  IF p_end_time IS NULL THEN
    p_end_time := now();
  END IF;
  IF p_start_time > p_end_time THEN
    p_start_time := p_end_time - interval '30 days';
  END IF;

  v_safe_limit := coalesce(p_limit, 50);
  IF v_safe_limit < 1 OR v_safe_limit > 5000 THEN
    v_safe_limit := 50;
  END IF;

  v_safe_offset := coalesce(p_offset, 0);
  IF v_safe_offset < 0 THEN
    v_safe_offset := 0;
  END IF;

  -- 1. Filtered KPI Summary
  SELECT jsonb_build_object(
    'total_events', count(*),
    'unique_visitors', count(DISTINCT anonymous_id) FILTER (WHERE anonymous_id IS NOT NULL),
    'total_sessions', count(*) FILTER (WHERE event_type = 'app_session_start'),
    'rooms_created_success', count(*) FILTER (WHERE event_type = 'room_create_success'),
    'rooms_created_failed', count(*) FILTER (WHERE event_type = 'room_create_failed'),
    'rooms_joined_success', count(*) FILTER (WHERE event_type = 'room_join_success'),
    'rooms_joined_failed', count(*) FILTER (WHERE event_type = 'room_join_failed'),
    'total_card_impressions', count(*) FILTER (WHERE event_type = 'restaurant_card_impression'),
    'total_candidates_generated', coalesce(sum(coalesce((payload->>'candidateCount')::numeric, 0)) FILTER (WHERE event_type = 'deck_candidates_ready'), 0),
    'total_swipes', count(*) FILTER (WHERE event_type = 'restaurant_swipe'),
    'total_yes_votes', count(*) FILTER (WHERE event_type = 'restaurant_swipe' AND coalesce(payload->>'vote', '') = 'YES'),
    'total_no_votes', count(*) FILTER (WHERE event_type = 'restaurant_swipe' AND coalesce(payload->>'vote', '') = 'NO'),
    'total_later_votes', count(*) FILTER (WHERE event_type = 'restaurant_swipe' AND coalesce(payload->>'vote', '') = 'LATER'),
    'approval_rate_pct', CASE
      WHEN count(*) FILTER (WHERE event_type = 'restaurant_swipe') > 0
      THEN round((count(*) FILTER (WHERE event_type = 'restaurant_swipe' AND coalesce(payload->>'vote', '') = 'YES')::numeric / count(*) FILTER (WHERE event_type = 'restaurant_swipe')::numeric) * 100, 1)
      ELSE NULL
    END,
    'exposure_to_yes_pct', CASE
      WHEN count(*) FILTER (WHERE event_type = 'restaurant_card_impression') > 0
      THEN round((count(*) FILTER (WHERE event_type = 'restaurant_swipe' AND coalesce(payload->>'vote', '') = 'YES')::numeric / count(*) FILTER (WHERE event_type = 'restaurant_card_impression')::numeric) * 100, 1)
      ELSE NULL
    END,
    'total_matches', count(*) FILTER (WHERE event_type = 'decision_winner_matched'),
    'total_minigames_started', count(*) FILTER (WHERE event_type = 'minigame_started'),
    'total_minigames_completed', count(*) FILTER (WHERE event_type = 'minigame_completed'),
    'total_maps_clicks', count(*) FILTER (WHERE event_type = 'outbound_maps_click'),
    'total_delivery_clicks', count(*) FILTER (WHERE event_type = 'outbound_delivery_click'),
    'total_revotes', count(*) FILTER (WHERE event_type = 'revote_requested'),
    'total_technical_failures', count(*) FILTER (WHERE event_type = 'app_technical_failure'),
    'total_explicit_exits', count(*) FILTER (WHERE event_type = 'room_explicit_exit')
  )
  INTO v_summary
  FROM public.analytics_events
  WHERE event_time >= p_start_time AND event_time <= p_end_time
    AND (p_category IS NULL OR category = p_category)
    AND (p_district IS NULL OR district = p_district)
    AND (p_eating_mode IS NULL OR eating_mode = p_eating_mode)
    AND (p_room_mode IS NULL OR room_mode = p_room_mode);

  -- 2. Per-Brand Recommendation & Outcome Breakdown
  WITH brand_impressions AS (
    SELECT
      coalesce(payload->>'restaurantId', payload->>'restaurant_id') AS r_id,
      count(*)::bigint AS impression_cnt,
      array_agg(DISTINCT coalesce(payload->>'branchId', payload->>'branch_id')) FILTER (
        WHERE coalesce(payload->>'branchId', payload->>'branch_id') IS NOT NULL
      ) AS branches
    FROM public.analytics_events
    WHERE event_type = 'restaurant_card_impression'
      AND event_time >= p_start_time AND event_time <= p_end_time
      AND (p_category IS NULL OR category = p_category)
      AND (p_district IS NULL OR district = p_district)
      AND (p_eating_mode IS NULL OR eating_mode = p_eating_mode)
      AND (p_room_mode IS NULL OR room_mode = p_room_mode)
      AND coalesce(payload->>'restaurantId', payload->>'restaurant_id') IS NOT NULL
    GROUP BY coalesce(payload->>'restaurantId', payload->>'restaurant_id')
  ),
  brand_candidates AS (
    SELECT
      c_id AS r_id,
      count(*)::bigint AS candidate_cnt
    FROM public.analytics_events e,
      LATERAL jsonb_array_elements_text(coalesce(e.payload->'candidateIds', '[]'::jsonb)) AS c_id
    WHERE e.event_type = 'deck_candidates_ready'
      AND e.event_time >= p_start_time AND e.event_time <= p_end_time
      AND (p_category IS NULL OR e.category = p_category)
      AND (p_district IS NULL OR e.district = p_district)
      AND (p_eating_mode IS NULL OR e.eating_mode = p_eating_mode)
      AND (p_room_mode IS NULL OR e.room_mode = p_room_mode)
    GROUP BY c_id
  ),
  brand_swipes AS (
    SELECT
      coalesce(payload->>'restaurantId', payload->>'restaurant_id') AS r_id,
      count(*) FILTER (WHERE upper(coalesce(payload->>'vote', '')) = 'YES')::bigint AS yes_cnt,
      count(*) FILTER (WHERE upper(coalesce(payload->>'vote', '')) = 'NO')::bigint AS no_cnt,
      count(*) FILTER (WHERE upper(coalesce(payload->>'vote', '')) = 'LATER')::bigint AS later_cnt
    FROM public.analytics_events
    WHERE event_type = 'restaurant_swipe'
      AND event_time >= p_start_time AND event_time <= p_end_time
      AND (p_category IS NULL OR category = p_category)
      AND (p_district IS NULL OR district = p_district)
      AND (p_eating_mode IS NULL OR eating_mode = p_eating_mode)
      AND (p_room_mode IS NULL OR room_mode = p_room_mode)
      AND coalesce(payload->>'restaurantId', payload->>'restaurant_id') IS NOT NULL
    GROUP BY coalesce(payload->>'restaurantId', payload->>'restaurant_id')
  ),
  brand_wins AS (
    SELECT
      coalesce(payload->>'restaurantId', payload->>'restaurant_id') AS r_id,
      count(*)::bigint AS wins_cnt
    FROM public.analytics_events
    WHERE event_type = 'decision_winner_matched'
      AND event_time >= p_start_time AND event_time <= p_end_time
      AND (p_category IS NULL OR category = p_category)
      AND (p_district IS NULL OR district = p_district)
      AND (p_eating_mode IS NULL OR eating_mode = p_eating_mode)
      AND (p_room_mode IS NULL OR room_mode = p_room_mode)
      AND coalesce(payload->>'restaurantId', payload->>'restaurant_id') IS NOT NULL
    GROUP BY coalesce(payload->>'restaurantId', payload->>'restaurant_id')
  ),
  combined_brands AS (
    SELECT
      all_ids.r_id AS restaurant_id,
      coalesce(bc.candidate_cnt, 0) AS candidate_count,
      coalesce(bi.impression_cnt, 0) AS impression_count,
      coalesce(bi.impression_cnt, 0) AS impressions_count,
      coalesce(bs.yes_cnt, 0) AS yes_votes,
      coalesce(bs.no_cnt, 0) AS no_votes,
      coalesce(bs.later_cnt, 0) AS later_votes,
      (coalesce(bs.yes_cnt, 0) + coalesce(bs.no_cnt, 0) + coalesce(bs.later_cnt, 0)) AS total_votes,
      coalesce(bw.wins_cnt, 0) AS match_wins,
      coalesce(bw.wins_cnt, 0) AS wins_count,
      coalesce(bi.branches, '{}'::text[]) AS branch_ids,
      -- Low confidence flag: strictly tested at 19 vs 20 impressions threshold
      (coalesce(bi.impression_cnt, 0) < 20) AS is_low_confidence,
      -- Response approval rate: YES / (YES + NO + LATER)
      CASE
        WHEN (coalesce(bs.yes_cnt, 0) + coalesce(bs.no_cnt, 0) + coalesce(bs.later_cnt, 0)) > 0
        THEN round((coalesce(bs.yes_cnt, 0)::numeric / (coalesce(bs.yes_cnt, 0) + coalesce(bs.no_cnt, 0) + coalesce(bs.later_cnt, 0))) * 100, 1)
        ELSE NULL
      END AS approval_rate_pct,
      -- Exposure-to-YES: YES / Impressions
      CASE
        WHEN coalesce(bi.impression_cnt, 0) > 0
        THEN round((coalesce(bs.yes_cnt, 0)::numeric / bi.impression_cnt) * 100, 1)
        ELSE NULL
      END AS exposure_to_yes_pct,
      -- Win rate: Wins / Impressions (only reliable with confirmed impressions)
      CASE
        WHEN coalesce(bi.impression_cnt, 0) > 0
        THEN round((coalesce(bw.wins_cnt, 0)::numeric / bi.impression_cnt) * 100, 1)
        ELSE NULL
      END AS win_rate_pct
    FROM (
      SELECT r_id FROM brand_impressions
      UNION
      SELECT r_id FROM brand_candidates
      UNION
      SELECT r_id FROM brand_swipes
      UNION
      SELECT r_id FROM brand_wins
    ) all_ids
    LEFT JOIN brand_impressions bi ON all_ids.r_id = bi.r_id
    LEFT JOIN brand_candidates bc ON all_ids.r_id = bc.r_id
    LEFT JOIN brand_swipes bs ON all_ids.r_id = bs.r_id
    LEFT JOIN brand_wins bw ON all_ids.r_id = bw.r_id
  )
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_brands
  FROM (
    SELECT *
    FROM combined_brands
    ORDER BY impressions_count DESC, wins_count DESC, restaurant_id ASC
  ) t;

  -- 3. Overall Algorithm Health Totals & Exposure Diversity (HHI)
  WITH exposure_shares AS (
    SELECT
      coalesce(payload->>'restaurantId', payload->>'restaurant_id') AS r_id,
      count(*)::numeric AS cnt
    FROM public.analytics_events
    WHERE event_type = 'restaurant_card_impression'
      AND event_time >= p_start_time AND event_time <= p_end_time
      AND (p_category IS NULL OR category = p_category)
      AND (p_district IS NULL OR district = p_district)
      AND (p_eating_mode IS NULL OR eating_mode = p_eating_mode)
      AND (p_room_mode IS NULL OR room_mode = p_room_mode)
      AND coalesce(payload->>'restaurantId', payload->>'restaurant_id') IS NOT NULL
    GROUP BY coalesce(payload->>'restaurantId', payload->>'restaurant_id')
  ),
  total_exposure AS (
    SELECT
      coalesce(sum(cnt), 0)::numeric AS total_cnt,
      count(*)::int AS brand_count,
      coalesce(max(cnt), 0)::numeric AS max_cnt
    FROM exposure_shares
  ),
  hhi_calc AS (
    SELECT
      t.brand_count,
      t.total_cnt AS total_impressions,
      CASE
        WHEN t.total_cnt > 0
        THEN round((t.max_cnt / t.total_cnt) * 100, 1)
        ELSE 0
      END AS top_brand_share,
      CASE
        WHEN t.total_cnt > 0
        THEN round(sum(power((e.cnt / t.total_cnt) * 100, 2)), 1)
        ELSE NULL
      END AS hhi
    FROM total_exposure t
    LEFT JOIN exposure_shares e ON true
    GROUP BY t.brand_count, t.total_cnt, t.max_cnt
  )
  SELECT jsonb_build_object(
    'candidate_generation_count', (
      SELECT count(*) FROM public.analytics_events
      WHERE event_type = 'deck_candidates_ready'
        AND event_time >= p_start_time AND event_time <= p_end_time
        AND (p_category IS NULL OR category = p_category)
        AND (p_district IS NULL OR district = p_district)
        AND (p_eating_mode IS NULL OR eating_mode = p_eating_mode)
        AND (p_room_mode IS NULL OR room_mode = p_room_mode)
    ),
    'displayed_impressions_count', coalesce((SELECT total_impressions FROM hhi_calc), 0),
    'total_impressions', coalesce((SELECT total_impressions FROM hhi_calc), 0),
    'eligible_brands_count', coalesce((SELECT brand_count FROM hhi_calc), 0),
    'distinct_brands_shown', coalesce((SELECT brand_count FROM hhi_calc), 0),
    'top_brand_impression_share_pct', coalesce((SELECT top_brand_share FROM hhi_calc), 0),
    'exposure_concentration_hhi', (SELECT hhi FROM hhi_calc),
    'hhi_concentration_index', (SELECT hhi FROM hhi_calc),
    'hhi_interpretation', CASE
      WHEN (SELECT hhi FROM hhi_calc) IS NULL THEN 'no_data'
      WHEN (SELECT hhi FROM hhi_calc) < 1500 THEN 'unconcentrated_healthy'
      WHEN (SELECT hhi FROM hhi_calc) <= 2500 THEN 'moderately_concentrated'
      ELSE 'highly_concentrated_warning'
    END
  )
  INTO v_algorithm_health;

  -- 4. Resolution Methods Breakdown
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_resolution_methods
  FROM (
    SELECT
      coalesce(payload->>'resolutionMethod', payload->>'resolution_method', 'unspecified') AS method,
      count(*)::bigint AS count
    FROM public.analytics_events
    WHERE event_type = 'decision_winner_matched'
      AND event_time >= p_start_time AND event_time <= p_end_time
      AND (p_category IS NULL OR category = p_category)
      AND (p_district IS NULL OR district = p_district)
      AND (p_eating_mode IS NULL OR eating_mode = p_eating_mode)
      AND (p_room_mode IS NULL OR room_mode = p_room_mode)
    GROUP BY coalesce(payload->>'resolutionMethod', payload->>'resolution_method', 'unspecified')
    ORDER BY count DESC
  ) t;

  -- 5. Recent Forward-Only Catalog Change Records
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_catalog_changes
  FROM (
    SELECT
      id,
      entity_type,
      entity_id,
      action,
      changed_by,
      change_summary,
      previous_state,
      new_state,
      effective_at
    FROM public.catalog_change_history
    ORDER BY effective_at DESC
    LIMIT 20
  ) t;

  -- 6. Total count of filtered events for pagination
  SELECT count(*)
  INTO v_total_filtered
  FROM public.analytics_events
  WHERE event_time >= p_start_time AND event_time <= p_end_time
    AND (p_category IS NULL OR category = p_category)
    AND (p_district IS NULL OR district = p_district)
    AND (p_eating_mode IS NULL OR eating_mode = p_eating_mode)
    AND (p_room_mode IS NULL OR room_mode = p_room_mode);

  -- 7. Paginated Filtered Events Feed
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_events_feed
  FROM (
    SELECT
      id,
      event_id,
      event_type,
      event_time,
      room_code,
      category,
      eating_mode,
      room_mode,
      district,
      app_version,
      payload
    FROM public.analytics_events
    WHERE event_time >= p_start_time AND event_time <= p_end_time
      AND (p_category IS NULL OR category = p_category)
      AND (p_district IS NULL OR district = p_district)
      AND (p_eating_mode IS NULL OR eating_mode = p_eating_mode)
      AND (p_room_mode IS NULL OR room_mode = p_room_mode)
    ORDER BY event_time DESC
    LIMIT v_safe_limit
    OFFSET v_safe_offset
  ) t;

  RETURN jsonb_build_object(
    'success', true,
    'time_range', jsonb_build_object(
      'start_time', p_start_time,
      'end_time', p_end_time
    ),
    'filters', jsonb_build_object(
      'category', p_category,
      'district', p_district,
      'eating_mode', p_eating_mode,
      'room_mode', p_room_mode
    ),
    'kpis', v_summary,
    'algorithm_health', jsonb_build_object(
      'summary', v_algorithm_health,
      'brands', v_brands,
      'resolution_methods', v_resolution_methods
    ),
    'catalog_history', v_catalog_changes,
    'pagination', jsonb_build_object(
      'total', v_total_filtered,
      'limit', v_safe_limit,
      'offset', v_safe_offset,
      'has_more', (v_safe_offset + v_safe_limit) < v_total_filtered
    ),
    'events', v_events_feed
  );
END;
$$;

-- Revoke execute from public/anon/authenticated and grant strictly to service_role
REVOKE ALL ON FUNCTION public.get_admin_deep_analytics(timestamptz, timestamptz, text, text, text, text, int, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_deep_analytics(timestamptz, timestamptz, text, text, text, text, int, int) TO service_role;

COMMIT;
