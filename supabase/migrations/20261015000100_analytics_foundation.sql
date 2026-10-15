-- 20261015000100_analytics_foundation.sql
-- WeshNakul Analytics Foundation: Version 1 Ingestion, Schema, and Security Gate
--
-- SECURITY & PRIVACY MANDATE:
-- 1. Direct Table Access Prohibited:
--    Direct INSERT, UPDATE, DELETE, and SELECT permissions on `public.analytics_events`
--    are strictly REVOKED from anon and authenticated roles.
-- 2. Ingestion via Trusted Gate:
--    Ingestion occurs exclusively via `public.record_analytics_events` (SECURITY DEFINER)
--    with fixed search_path and rigorous payload validation.
-- 3. Strict Boundary Validation:
--    Only explicitly allowlisted event types, bounded payload sizes, and validated
--    identifiers are accepted. Unbounded client JSON and sensitive fields are stripped.
-- 4. Explicit Deduplication:
--    Client-generated UUID event_id guarantees safe, idempotent retries via ON CONFLICT DO NOTHING.
-- 5. Isolated Retention:
--    Purging is limited strictly to `analytics_events` without affecting operational room data.

BEGIN;

-- 1. Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  schema_version SMALLINT NOT NULL DEFAULT 1,
  event_type TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  server_received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  anonymous_id TEXT,
  room_id UUID,
  room_code TEXT,
  participant_id UUID,
  category TEXT,
  eating_mode TEXT,
  room_mode TEXT,
  district TEXT,
  app_version TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT unique_analytics_event_id UNIQUE (event_id)
);

-- 2. Performance and Retention Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_time
  ON public.analytics_events (event_type, event_time DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_room_time
  ON public.analytics_events (room_id, event_time DESC)
  WHERE room_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_anon_time
  ON public.analytics_events (anonymous_id, event_time DESC)
  WHERE anonymous_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_retention
  ON public.analytics_events (server_received_at);

-- 3. Row Level Security & Strict Permissions
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.analytics_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.analytics_events TO service_role;

-- 4. Authoritative Ingestion Gate (RPC)
CREATE OR REPLACE FUNCTION public.record_analytics_events(p_events jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions
AS $$
DECLARE
  v_count int;
  v_inserted int := 0;
  v_item jsonb;
  v_event_id text;
  v_event_uuid uuid;
  v_schema_ver int;
  v_event_type text;
  v_event_time_raw text;
  v_event_time timestamptz;
  v_anon_id text;
  v_room_id text;
  v_room_uuid uuid;
  v_room_code text;
  v_participant_id text;
  v_participant_uuid uuid;
  v_category text;
  v_eating_mode text;
  v_room_mode text;
  v_district text;
  v_app_version text;
  v_payload jsonb;
  v_clean_payload jsonb;
BEGIN
  -- Batch structure check
  IF p_events IS NULL OR jsonb_typeof(p_events) <> 'array' THEN
    RAISE EXCEPTION 'WSH_INVALID_ANALYTICS_BATCH' USING ERRCODE = '22023';
  END IF;

  v_count := jsonb_array_length(p_events);
  IF v_count = 0 OR v_count > 25 THEN
    RAISE EXCEPTION 'WSH_ANALYTICS_BATCH_SIZE_EXCEEDED' USING ERRCODE = '22023';
  END IF;

  -- Bounded payload size check (max 32KB per batch)
  IF pg_column_size(p_events) > 32768 THEN
    RAISE EXCEPTION 'WSH_ANALYTICS_PAYLOAD_TOO_LARGE' USING ERRCODE = '22023';
  END IF;

  -- Process and validate each event
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_events) LOOP
    IF jsonb_typeof(v_item) <> 'object' THEN
      CONTINUE;
    END IF;

    -- 1. Validate event_id (required UUID v4)
    v_event_id := nullif(trim(v_item->>'eventId'), '');
    IF v_event_id IS NULL THEN
      v_event_id := nullif(trim(v_item->>'event_id'), '');
    END IF;
    IF v_event_id IS NULL OR v_event_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
      CONTINUE;
    END IF;
    v_event_uuid := v_event_id::uuid;

    -- 2. Validate schema_version
    v_schema_ver := coalesce((v_item->>'schemaVersion')::int, (v_item->>'schema_version')::int, 1);
    IF v_schema_ver < 1 OR v_schema_ver > 1 THEN
      CONTINUE;
    END IF;

    -- 3. Validate event_type against explicit allowlist
    v_event_type := nullif(trim(v_item->>'eventType'), '');
    IF v_event_type IS NULL THEN
      v_event_type := nullif(trim(v_item->>'event_type'), '');
    END IF;
    IF v_event_type NOT IN (
      'app_session_start',
      'room_create_success',
      'room_create_failed',
      'room_join_success',
      'room_join_failed',
      'room_stage_changed',
      'deck_candidates_ready',
      'restaurant_card_impression',
      'restaurant_swipe',
      'decision_winner_matched',
      'revote_requested',
      'outbound_maps_click',
      'outbound_delivery_click',
      'minigame_started',
      'minigame_completed',
      'room_explicit_exit',
      'app_technical_failure'
    ) THEN
      CONTINUE;
    END IF;

    -- 4. Validate event_time (UTC timestamp bounds check)
    v_event_time_raw := nullif(trim(v_item->>'eventTime'), '');
    IF v_event_time_raw IS NULL THEN
      v_event_time_raw := nullif(trim(v_item->>'event_time'), '');
    END IF;
    BEGIN
      IF v_event_time_raw IS NOT NULL THEN
        v_event_time := v_event_time_raw::timestamptz;
        -- Reject impossible timestamps: far future (> 1 hour ahead) or far past (> 30 days ago)
        IF v_event_time > (now() + interval '1 hour') OR v_event_time < (now() - interval '30 days') THEN
          v_event_time := now();
        END IF;
      ELSE
        v_event_time := now();
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_event_time := now();
    END;

    -- 5. Validate contextual identifiers and dimensions
    v_anon_id := nullif(trim(coalesce(v_item->>'anonymousId', v_item->>'anonymous_id')), '');
    IF v_anon_id IS NOT NULL AND (length(v_anon_id) > 64 OR v_anon_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$') THEN
      v_anon_id := NULL;
    END IF;

    v_room_id := nullif(trim(coalesce(v_item->>'roomId', v_item->>'room_id')), '');
    v_room_uuid := NULL;
    IF v_room_id IS NOT NULL AND v_room_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
      v_room_uuid := v_room_id::uuid;
    END IF;

    v_room_code := upper(nullif(trim(coalesce(v_item->>'roomCode', v_item->>'room_code')), ''));
    IF v_room_code IS NOT NULL AND v_room_code !~ '^[A-Z0-9]{4}$' THEN
      v_room_code := NULL;
    END IF;

    v_participant_id := nullif(trim(coalesce(v_item->>'participantId', v_item->>'participant_id')), '');
    v_participant_uuid := NULL;
    IF v_participant_id IS NOT NULL AND v_participant_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
      v_participant_uuid := v_participant_id::uuid;
    END IF;

    v_category := nullif(trim(v_item->>'category'), '');
    IF v_category IS NOT NULL AND length(v_category) > 32 THEN
      v_category := NULL;
    END IF;

    v_eating_mode := nullif(trim(coalesce(v_item->>'eatingMode', v_item->>'eating_mode')), '');
    IF v_eating_mode NOT IN ('delivery', 'dine_in', 'any') THEN
      v_eating_mode := NULL;
    END IF;

    v_room_mode := nullif(trim(coalesce(v_item->>'roomMode', v_item->>'room_mode')), '');
    IF v_room_mode NOT IN ('food', 'breakfast', 'cafes') THEN
      v_room_mode := NULL;
    END IF;

    v_district := nullif(trim(v_item->>'district'), '');
    IF v_district IS NOT NULL AND length(v_district) > 64 THEN
      v_district := substr(v_district, 1, 64);
    END IF;

    v_app_version := nullif(trim(coalesce(v_item->>'appVersion', v_item->>'app_version')), '');
    IF v_app_version IS NOT NULL AND length(v_app_version) > 32 THEN
      v_app_version := substr(v_app_version, 1, 32);
    END IF;

    -- 6. Validate and sanitize payload
    v_payload := v_item->'payload';
    IF v_payload IS NULL OR jsonb_typeof(v_payload) <> 'object' THEN
      v_clean_payload := '{}'::jsonb;
    ELSE
      -- Disallow oversized individual event payload (max 2KB)
      IF pg_column_size(v_payload) > 2048 THEN
        v_clean_payload := jsonb_build_object('payload_truncated', true);
      ELSE
        -- Strictly strip potential credential or location leaks
        v_clean_payload := v_payload - 'session_token' - 'sessionToken' - 'token'
          - 'password' - 'latitude' - 'longitude' - 'email' - 'phone';
      END IF;
    END IF;

    -- 7. Insert with explicit deduplication
    INSERT INTO public.analytics_events (
      event_id,
      schema_version,
      event_type,
      event_time,
      server_received_at,
      anonymous_id,
      room_id,
      room_code,
      participant_id,
      category,
      eating_mode,
      room_mode,
      district,
      app_version,
      payload
    ) VALUES (
      v_event_uuid,
      v_schema_ver,
      v_event_type,
      v_event_time,
      now(),
      v_anon_id,
      v_room_uuid,
      v_room_code,
      v_participant_uuid,
      v_category,
      v_eating_mode,
      v_room_mode,
      v_district,
      v_app_version,
      v_clean_payload
    )
    ON CONFLICT (event_id) DO NOTHING;

    IF FOUND THEN
      v_inserted := v_inserted + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'received', v_count,
    'inserted', v_inserted
  );
END;
$$;

-- 5. Revoke execution from PUBLIC, anon, authenticated and grant strictly to service_role
-- Only the trusted Cloudflare Pages Function edge gateway holding the server-only service_role key can ingest events.
-- Direct public/browser execution is completely denied.
REVOKE ALL ON FUNCTION public.record_analytics_events(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_analytics_events(jsonb) TO service_role;

-- 6. Retention and Cleanup Procedure (Private Schema - Admin/Cron Only)
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.purge_expired_analytics_events(
  p_retention_days int DEFAULT 365,
  p_batch_limit int DEFAULT 5000
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_deleted int := 0;
BEGIN
  IF p_retention_days < 30 THEN
    RAISE EXCEPTION 'WSH_INVALID_RETENTION_PERIOD' USING ERRCODE = '22023';
  END IF;

  WITH to_delete AS (
    SELECT id FROM public.analytics_events
    WHERE server_received_at < (now() - (p_retention_days || ' days')::interval)
    LIMIT p_batch_limit
  )
  DELETE FROM public.analytics_events
  WHERE id IN (SELECT id FROM to_delete);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION private.purge_expired_analytics_events(int, int) FROM PUBLIC, anon, authenticated;

COMMIT;
