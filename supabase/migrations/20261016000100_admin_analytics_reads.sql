-- 20261016000100_admin_analytics_reads.sql
-- WeshNakul Phase 2: Secure Read-Only Admin Analytics
--
-- SECURITY & AUTHORIZATION MANDATE:
-- 1. Direct Table Access Prohibited:
--    Direct SELECT, INSERT, UPDATE, DELETE permissions on `public.analytics_events`
--    remain strictly REVOKED from PUBLIC, anon, and authenticated roles.
-- 2. Server-Side Execution Gate:
--    `public.get_admin_analytics_summary` is granted exclusively to `service_role`.
--    General users and anonymous participants are denied execution.
-- 3. Hardened Search Path:
--    Explicitly set `search_path = pg_catalog`. All application objects remain schema-qualified.
-- 4. Read-Only / Non-Destructive:
--    Computes aggregations without modifying or purging operational data.

BEGIN;

-- 1. Explicitly enforce table-level privilege isolation
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.analytics_events FROM PUBLIC, anon, authenticated;

-- 2. Hardened Read-Only Analytics Aggregation Function
CREATE OR REPLACE FUNCTION public.get_admin_analytics_summary(
  p_start_time timestamptz DEFAULT (now() - interval '30 days'),
  p_end_time timestamptz DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_summary jsonb;
  v_by_event_type jsonb;
  v_by_category jsonb;
  v_by_room_mode jsonb;
  v_by_eating_mode jsonb;
  v_swipes_by_vote jsonb;
  v_top_winners jsonb;
  v_minigames jsonb;
  v_join_failures jsonb;
  v_recent_events jsonb;
  v_timeline jsonb;
BEGIN
  -- Safe boundary check
  IF p_start_time IS NULL THEN
    p_start_time := now() - interval '30 days';
  END IF;
  IF p_end_time IS NULL THEN
    p_end_time := now();
  END IF;
  IF p_start_time > p_end_time THEN
    p_start_time := p_end_time - interval '30 days';
  END IF;

  -- 1. High-level KPI aggregations
  SELECT jsonb_build_object(
    'total_events', count(*),
    'unique_visitors', count(DISTINCT anonymous_id) FILTER (WHERE anonymous_id IS NOT NULL),
    'total_sessions', count(*) FILTER (WHERE event_type = 'app_session_start'),
    'rooms_created_success', count(*) FILTER (WHERE event_type = 'room_create_success'),
    'rooms_created_failed', count(*) FILTER (WHERE event_type = 'room_create_failed'),
    'rooms_joined_success', count(*) FILTER (WHERE event_type = 'room_join_success'),
    'rooms_joined_failed', count(*) FILTER (WHERE event_type = 'room_join_failed'),
    'total_swipes', count(*) FILTER (WHERE event_type = 'restaurant_swipe'),
    'total_matches', count(*) FILTER (WHERE event_type = 'decision_winner_matched'),
    'total_minigames_started', count(*) FILTER (WHERE event_type = 'minigame_started'),
    'total_minigames_completed', count(*) FILTER (WHERE event_type = 'minigame_completed'),
    'total_maps_clicks', count(*) FILTER (WHERE event_type = 'outbound_maps_click'),
    'total_delivery_clicks', count(*) FILTER (WHERE event_type = 'outbound_delivery_click'),
    'total_revotes', count(*) FILTER (WHERE event_type = 'revote_requested'),
    'total_technical_failures', count(*) FILTER (WHERE event_type = 'app_technical_failure')
  )
  INTO v_summary
  FROM public.analytics_events
  WHERE event_time >= p_start_time AND event_time <= p_end_time;

  -- 2. Breakdown by event type
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_by_event_type
  FROM (
    SELECT event_type, count(*)::bigint AS count
    FROM public.analytics_events
    WHERE event_time >= p_start_time AND event_time <= p_end_time
    GROUP BY event_type
    ORDER BY count DESC
  ) t;

  -- 3. Breakdown by food category
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_by_category
  FROM (
    SELECT category, count(*)::bigint AS count
    FROM public.analytics_events
    WHERE category IS NOT NULL AND event_time >= p_start_time AND event_time <= p_end_time
    GROUP BY category
    ORDER BY count DESC
  ) t;

  -- 4. Breakdown by room mode (food, breakfast, cafes)
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_by_room_mode
  FROM (
    SELECT room_mode, count(*)::bigint AS count
    FROM public.analytics_events
    WHERE room_mode IS NOT NULL AND event_time >= p_start_time AND event_time <= p_end_time
    GROUP BY room_mode
    ORDER BY count DESC
  ) t;

  -- 5. Breakdown by eating mode (delivery, dine_in, any)
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_by_eating_mode
  FROM (
    SELECT eating_mode, count(*)::bigint AS count
    FROM public.analytics_events
    WHERE eating_mode IS NOT NULL AND event_time >= p_start_time AND event_time <= p_end_time
    GROUP BY eating_mode
    ORDER BY count DESC
  ) t;

  -- 6. Swipes breakdown (YES / NO / LATER)
  -- Uses exact emitted payload key 'vote' (fallback to 'swipe_vote')
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_swipes_by_vote
  FROM (
    SELECT coalesce(payload->>'vote', payload->>'swipe_vote', 'UNKNOWN') AS vote, count(*)::bigint AS count
    FROM public.analytics_events
    WHERE event_type = 'restaurant_swipe' AND event_time >= p_start_time AND event_time <= p_end_time
    GROUP BY coalesce(payload->>'vote', payload->>'swipe_vote', 'UNKNOWN')
    ORDER BY count DESC
  ) t;

  -- 7. Top winning restaurants
  -- Uses exact emitted payload key 'restaurantId' (fallback to 'restaurant_id')
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_top_winners
  FROM (
    SELECT coalesce(payload->>'restaurantId', payload->>'restaurant_id', 'unknown') AS restaurant_id, count(*)::bigint AS wins_count
    FROM public.analytics_events
    WHERE event_type = 'decision_winner_matched' AND event_time >= p_start_time AND event_time <= p_end_time
    GROUP BY coalesce(payload->>'restaurantId', payload->>'restaurant_id', 'unknown')
    ORDER BY wins_count DESC
    LIMIT 15
  ) t;

  -- 8. Mini-games breakdown (started vs completed)
  -- Uses exact emitted payload key 'gameType' (fallback to 'game_type')
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_minigames
  FROM (
    SELECT
      coalesce(payload->>'gameType', payload->>'game_type', 'unknown') AS game_type,
      count(*) FILTER (WHERE event_type = 'minigame_started')::bigint AS started_count,
      count(*) FILTER (WHERE event_type = 'minigame_completed')::bigint AS completed_count
    FROM public.analytics_events
    WHERE event_type IN ('minigame_started', 'minigame_completed')
      AND event_time >= p_start_time AND event_time <= p_end_time
    GROUP BY coalesce(payload->>'gameType', payload->>'game_type', 'unknown')
    ORDER BY started_count DESC
  ) t;

  -- 9. Join failures breakdown
  -- Uses exact emitted payload key 'reason' (fallback to 'reasonClean', 'errorCode')
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_join_failures
  FROM (
    SELECT coalesce(payload->>'reason', payload->>'reasonClean', payload->>'errorCode', 'unknown') AS reason, count(*)::bigint AS count
    FROM public.analytics_events
    WHERE event_type = 'room_join_failed' AND event_time >= p_start_time AND event_time <= p_end_time
    GROUP BY coalesce(payload->>'reason', payload->>'reasonClean', payload->>'errorCode', 'unknown')
    ORDER BY count DESC
  ) t;

  -- 10. Activity timeline (hourly if range <= 2 days, else daily)
  IF (p_end_time - p_start_time) <= interval '2 days' THEN
    SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    INTO v_timeline
    FROM (
      SELECT
        date_trunc('hour', event_time) AS bucket_time,
        count(*)::bigint AS event_count,
        count(*) FILTER (WHERE event_type = 'app_session_start')::bigint AS session_count,
        count(*) FILTER (WHERE event_type = 'room_create_success')::bigint AS room_create_count,
        count(*) FILTER (WHERE event_type = 'restaurant_swipe')::bigint AS swipe_count,
        count(*) FILTER (WHERE event_type = 'decision_winner_matched')::bigint AS match_count
      FROM public.analytics_events
      WHERE event_time >= p_start_time AND event_time <= p_end_time
      GROUP BY date_trunc('hour', event_time)
      ORDER BY bucket_time ASC
    ) t;
  ELSE
    SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    INTO v_timeline
    FROM (
      SELECT
        date_trunc('day', event_time) AS bucket_time,
        count(*)::bigint AS event_count,
        count(*) FILTER (WHERE event_type = 'app_session_start')::bigint AS session_count,
        count(*) FILTER (WHERE event_type = 'room_create_success')::bigint AS room_create_count,
        count(*) FILTER (WHERE event_type = 'restaurant_swipe')::bigint AS swipe_count,
        count(*) FILTER (WHERE event_type = 'decision_winner_matched')::bigint AS match_count
      FROM public.analytics_events
      WHERE event_time >= p_start_time AND event_time <= p_end_time
      GROUP BY date_trunc('day', event_time)
      ORDER BY bucket_time ASC
    ) t;
  END IF;

  -- 11. Recent 50 events (district removed to preserve district-level data for deeper analytics)
  SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_recent_events
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
      app_version
    FROM public.analytics_events
    WHERE event_time >= p_start_time AND event_time <= p_end_time
    ORDER BY event_time DESC
    LIMIT 50
  ) t;

  RETURN jsonb_build_object(
    'success', true,
    'time_range', jsonb_build_object(
      'start_time', p_start_time,
      'end_time', p_end_time
    ),
    'summary', v_summary,
    'breakdowns', jsonb_build_object(
      'by_event_type', v_by_event_type,
      'by_category', v_by_category,
      'by_room_mode', v_by_room_mode,
      'by_eating_mode', v_by_eating_mode,
      'swipes_by_vote', v_swipes_by_vote,
      'top_winning_restaurants', v_top_winners,
      'minigames', v_minigames,
      'join_failures', v_join_failures,
      'activity_timeline', v_timeline
    ),
    'recent_events', v_recent_events
  );
END;
$$;

-- 3. Revoke execute from public/anon/authenticated and grant strictly to service_role
REVOKE ALL ON FUNCTION public.get_admin_analytics_summary(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_analytics_summary(timestamptz, timestamptz) TO service_role;

COMMIT;
