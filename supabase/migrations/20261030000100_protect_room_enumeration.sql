BEGIN;

-- -------------------------------------------------------------
-- SEC-05: Prevent Anonymous Room Enumeration & Unauthorized Discovery
-- -------------------------------------------------------------

-- 1. Create table in private schema to track failed lookup attempts per client IP
CREATE TABLE IF NOT EXISTS private.room_lookup_attempts (
  client_key text PRIMARY KEY,
  failed_attempts int NOT NULL DEFAULT 1,
  first_failed_at timestamptz NOT NULL DEFAULT now(),
  last_failed_at timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz
);

REVOKE ALL ON private.room_lookup_attempts FROM PUBLIC, anon, authenticated;

-- 2. Create secure, enumeration-resistant lookup RPC function
-- Allows looking up a single room by its exact 4-character code without
-- exposing table-level scanning, code enumeration, or internal sensitive room state.
CREATE OR REPLACE FUNCTION public.get_room_by_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  v_clean_code text;
  v_room_row public.rooms%ROWTYPE;
  v_headers_raw text;
  v_headers jsonb;
  v_client_ip text;
  v_attempts_record private.room_lookup_attempts%ROWTYPE;
BEGIN
  v_clean_code := upper(trim(p_code));

  -- 2a. Strict input validation: reject malformed codes before DB querying
  IF v_clean_code IS NULL OR v_clean_code !~ '^[A-Z0-9]{4}$' THEN
    RETURN NULL;
  END IF;

  -- 2b. Extract client IP from PostgREST request headers if present
  v_headers_raw := current_setting('request.headers', true);
  IF v_headers_raw IS NOT NULL AND length(v_headers_raw) > 0 THEN
    BEGIN
      v_headers := v_headers_raw::jsonb;
      v_client_ip := coalesce(
        nullif(trim(v_headers->>'cf-connecting-ip'), ''),
        nullif(trim(v_headers->>'x-forwarded-for'), ''),
        nullif(trim(v_headers->>'x-real-ip'), '')
      );
    EXCEPTION WHEN OTHERS THEN
      v_client_ip := NULL;
    END;
  END IF;

  -- 2c. Abuse control: Check if client IP is currently blocked
  IF v_client_ip IS NOT NULL THEN
    SELECT * INTO v_attempts_record
    FROM private.room_lookup_attempts
    WHERE client_key = v_client_ip;

    IF FOUND AND v_attempts_record.blocked_until IS NOT NULL AND v_attempts_record.blocked_until > now() THEN
      RETURN NULL;
    END IF;
  END IF;

  -- 2d. Lookup single room
  SELECT * INTO v_room_row
  FROM public.rooms r
  WHERE r.code = v_clean_code
  LIMIT 1;

  IF NOT FOUND THEN
    -- 2e. Record failed lookup attempt for client IP
    IF v_client_ip IS NOT NULL THEN
      INSERT INTO private.room_lookup_attempts (client_key, failed_attempts, first_failed_at, last_failed_at, blocked_until)
      VALUES (
        v_client_ip,
        1,
        now(),
        now(),
        NULL
      )
      ON CONFLICT (client_key) DO UPDATE SET
        failed_attempts = CASE
          WHEN private.room_lookup_attempts.last_failed_at < now() - interval '5 minutes' THEN 1
          ELSE private.room_lookup_attempts.failed_attempts + 1
        END,
        first_failed_at = CASE
          WHEN private.room_lookup_attempts.last_failed_at < now() - interval '5 minutes' THEN now()
          ELSE private.room_lookup_attempts.first_failed_at
        END,
        last_failed_at = now(),
        blocked_until = CASE
          WHEN (CASE
            WHEN private.room_lookup_attempts.last_failed_at < now() - interval '5 minutes' THEN 1
            ELSE private.room_lookup_attempts.failed_attempts + 1
          END) >= 10 THEN now() + interval '10 minutes'
          ELSE NULL
        END;
    END IF;
    RETURN NULL;
  END IF;

  -- 2f. Successful lookup: Clear failed attempts for this client IP
  IF v_client_ip IS NOT NULL THEN
    UPDATE private.room_lookup_attempts
    SET failed_attempts = 0, blocked_until = NULL, last_failed_at = now()
    WHERE client_key = v_client_ip;
  END IF;

  -- 2g. Minimal response: Construct explicit JSON containing ONLY join/reconnect essentials.
  -- Strictly excludes: category_summary (participant votes), restaurant_summary (algorithm weights),
  -- last_mode_changed_by_* (internal participant UUIDs), winning_deck_id, coordinates, and unneeded state.
  RETURN jsonb_build_object(
    'id', v_room_row.id,
    'code', v_room_row.code,
    'status', v_room_row.status,
    'stage', v_room_row.stage,
    'current_stage', v_room_row.current_stage,
    'eating_mode', v_room_row.eating_mode,
    'room_mode', v_room_row.room_mode,
    'city', v_room_row.city,
    'neighborhood', v_room_row.neighborhood,
    'language', v_room_row.language,
    'host_participant_id', v_room_row.host_participant_id,
    'version', v_room_row.version,
    'created_at', v_room_row.created_at,
    'expires_at', v_room_row.expires_at,
    'winning_category', v_room_row.winning_category,
    'consensus_type', v_room_row.consensus_type,
    'tied_categories', v_room_row.tied_categories,
    'winning_restaurant_id', v_room_row.winning_restaurant_id,
    'restaurant_state', v_room_row.restaurant_state,
    'preferences', v_room_row.preferences
  );
END;
$$;

-- Explicitly revoke from PUBLIC and grant EXECUTE to anon, authenticated, service_role
REVOKE ALL ON FUNCTION public.get_room_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_room_by_code(text) TO anon, authenticated, service_role;

-- 3. Restrict SELECT privileges on public.rooms
-- Revoke full-table SELECT from anonymous and authenticated roles
REVOKE SELECT ON public.rooms FROM anon, authenticated;

-- Grant column-level SELECT on operational columns EXCLUDING 'code'
-- This completely prevents anonymous clients from executing `SELECT * FROM rooms`
-- or `SELECT code FROM rooms` to scrape active room codes, while preserving
-- Realtime updates by room id and connection health checks.
GRANT SELECT (
  id,
  status,
  stage,
  eating_mode,
  room_mode,
  preferences,
  last_mode_changed_by_participant_id,
  last_mode_changed_by_nickname,
  last_mode_changed_at,
  city,
  neighborhood,
  language,
  host_participant_id,
  current_stage,
  winning_category,
  consensus_type,
  tied_categories,
  winning_restaurant_id,
  swiping_started_at,
  version,
  category_summary,
  restaurant_state,
  restaurant_summary,
  winning_deck_id,
  winning_branch_id,
  winning_resolution_method,
  finalized_at,
  created_at,
  expires_at
) ON public.rooms TO anon, authenticated;

COMMIT;
