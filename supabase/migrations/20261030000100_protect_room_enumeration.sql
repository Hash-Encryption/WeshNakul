BEGIN;

-- -------------------------------------------------------------
-- SEC-05: Prevent Anonymous Room Enumeration & Unauthorized Discovery
-- -------------------------------------------------------------

-- 1. Create secure lookup RPC function
-- Allows looking up a single room by its exact 4-character code without
-- exposing table-level scanning or code enumeration to unauthenticated clients.
CREATE OR REPLACE FUNCTION public.get_room_by_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_room jsonb;
BEGIN
  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT to_jsonb(r) INTO v_room
  FROM public.rooms r
  WHERE upper(trim(r.code)) = upper(trim(p_code))
  LIMIT 1;

  RETURN v_room;
END;
$$;

-- Explicitly revoke from PUBLIC and grant EXECUTE to anon, authenticated, service_role
REVOKE ALL ON FUNCTION public.get_room_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_room_by_code(text) TO anon, authenticated, service_role;

-- 2. Restrict SELECT privileges on public.rooms
-- Revoke full-table SELECT from anonymous and authenticated roles
REVOKE SELECT ON public.rooms FROM anon, authenticated;

-- Grant column-level SELECT on all operational columns EXCLUDING 'code'
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
