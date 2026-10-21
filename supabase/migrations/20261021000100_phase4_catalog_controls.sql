-- Phase 4: Catalog Controls & Safe Change Sets Migration
-- Implements isolated draft change sets, forward rollback linkage, and atomic publication.
-- Strictly preserves Phase 3 catalog_change_history and automated audit triggers.

BEGIN;

-- 1. Isolated Draft Change Sets Table
CREATE TABLE IF NOT EXISTS public.catalog_draft_changesets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'published', 'cancelled', 'rejected')),
  change_type text NOT NULL DEFAULT 'edit' CHECK (change_type IN ('edit', 'bulk_edit', 'emergency', 'rollback', 'restore')),
  target_entities jsonb NOT NULL DEFAULT '[]'::jsonb,
  validation_results jsonb,
  reason text,
  review_deadline timestamptz,
  related_history_id uuid REFERENCES public.catalog_change_history(id),
  created_by text NOT NULL DEFAULT 'admin',
  published_by text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Extend catalog_change_history with backward-compatible linkage columns
ALTER TABLE public.catalog_change_history
  ADD COLUMN IF NOT EXISTS changeset_id uuid REFERENCES public.catalog_draft_changesets(id),
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS rollback_of_id uuid REFERENCES public.catalog_change_history(id);

-- Ensure restaurants table has primary_category and last_verified_at columns,
-- and ensure catalog fields allow explicit NULL clearing where appropriate.
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS primary_category text,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz;

DO $$ BEGIN
  ALTER TABLE public.restaurants
    ALTER COLUMN dining_mode DROP NOT NULL,
    ALTER COLUMN tier DROP NOT NULL,
    ALTER COLUMN price_tier DROP NOT NULL,
    ALTER COLUMN rating DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 3. Indexes for performance and traceability
CREATE INDEX IF NOT EXISTS idx_catalog_drafts_status
  ON public.catalog_draft_changesets (status);

CREATE INDEX IF NOT EXISTS idx_catalog_drafts_created_at
  ON public.catalog_draft_changesets (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_catalog_history_changeset
  ON public.catalog_change_history (changeset_id);

CREATE INDEX IF NOT EXISTS idx_catalog_history_rollback
  ON public.catalog_change_history (rollback_of_id);

-- 4. Strict Row-Level Security
ALTER TABLE public.catalog_draft_changesets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.catalog_draft_changesets FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.catalog_draft_changesets TO service_role;

-- 5. Helper Function: Touch Updated Timestamp
CREATE OR REPLACE FUNCTION public.touch_catalog_draft_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $touch$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$touch$;

DROP TRIGGER IF EXISTS trg_catalog_draft_updated_at ON public.catalog_draft_changesets;
CREATE TRIGGER trg_catalog_draft_updated_at
  BEFORE UPDATE ON public.catalog_draft_changesets
  FOR EACH ROW EXECUTE FUNCTION public.touch_catalog_draft_updated_at();

-- 6. Trigger Function Updates for Direct & Trustworthy Changeset Attribution
CREATE OR REPLACE FUNCTION public.trg_record_restaurant_catalog_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $trg_rest$
DECLARE
  v_action text;
  v_summary text;
  v_prev jsonb;
  v_new jsonb;
  v_id text;
  v_changed_by text;
  v_new_status text;
  v_old_status text;
  v_changeset_id uuid;
  v_changeset_reason text;
  v_rollback_of_id uuid;
  v_context text;
BEGIN
  -- Retrieve call stack context to verify origin
  GET DIAGNOSTICS v_context = PG_CONTEXT;

  -- Anti-Spoofing Guard:
  -- Attribution is only trusted when the update originates directly from within
  -- the authorized publish_catalog_changeset() function frame.
  -- Direct writes, nested calls, spoofed schemas, or lingering GUC settings are strictly audited with null attribution.
  IF v_context ~ E'(\\n|^)SQL statement "UPDATE (public\\.)?restaurants[^"]*"\\nPL/pgSQL function (public\\.)?publish_catalog_changeset[(]uuid,\\s*text,\\s*text[)] line [0-9]+ at SQL statement(\\n|$)' THEN
    BEGIN
      v_changeset_id := nullif(current_setting('wsh.current_changeset_id', true), '')::uuid;
    EXCEPTION WHEN OTHERS THEN
      v_changeset_id := NULL;
    END;

    IF v_changeset_id IS NOT NULL THEN
      -- Authoritatively verify changeset status, entity membership, and fetch reason & rollback linkage
      SELECT
        c.id,
        coalesce(nullif(current_setting('wsh.current_changeset_reason', true), ''), c.reason),
        c.related_history_id
      INTO
        v_changeset_id,
        v_changeset_reason,
        v_rollback_of_id
      FROM public.catalog_draft_changesets c,
      LATERAL jsonb_array_elements(c.target_entities) elem
      WHERE c.id = v_changeset_id
        AND c.status IN ('draft', 'validated')
        AND elem->>'entity_type' = 'restaurant'
        AND elem->>'entity_id' = coalesce(NEW.id::text, OLD.id::text)
      LIMIT 1;

      IF NOT FOUND THEN
        v_changeset_id := NULL;
        v_changeset_reason := NULL;
        v_rollback_of_id := NULL;
      END IF;
    ELSE
      v_changeset_reason := NULL;
      v_rollback_of_id := NULL;
    END IF;

    -- Inside the authorized publish_catalog_changeset frame, record the authenticated administrator
    v_changed_by := coalesce(
      nullif(trim(current_setting('wsh.current_admin_id', true)), ''),
      coalesce(current_setting('request.jwt.claim.sub', true), current_user, 'system')
    );
  ELSE
    v_changeset_id := NULL;
    v_changeset_reason := NULL;
    v_rollback_of_id := NULL;
    -- Outside authorized frame, GUCs are strictly untrusted; record authentic caller role
    v_changed_by := coalesce(current_setting('request.jwt.claim.sub', true), current_user, 'system');
  END IF;

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

  -- Transactionally atomic history insertion with exact changeset attribution
  INSERT INTO public.catalog_change_history (
    entity_type,
    entity_id,
    action,
    changed_by,
    change_summary,
    previous_state,
    new_state,
    effective_at,
    changeset_id,
    reason,
    rollback_of_id
  ) VALUES (
    'restaurant',
    v_id,
    v_action,
    v_changed_by,
    v_summary,
    v_prev,
    v_new,
    now(),
    v_changeset_id,
    v_changeset_reason,
    v_rollback_of_id
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$trg_rest$;

CREATE OR REPLACE FUNCTION public.trg_record_branch_catalog_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $trg_branch$
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
  v_changeset_id uuid;
  v_changeset_reason text;
  v_rollback_of_id uuid;
  v_context text;
BEGIN
  -- Retrieve call stack context to verify origin
  GET DIAGNOSTICS v_context = PG_CONTEXT;

  -- Anti-Spoofing Guard:
  -- Attribution is only trusted when the update originates directly from within
  -- the authorized publish_catalog_changeset() function frame.
  -- Direct writes, nested calls, spoofed schemas, or lingering GUC settings are strictly audited with null attribution.
  IF v_context ~ E'(\\n|^)SQL statement "UPDATE (public\\.)?restaurant_branches[^"]*"\\nPL/pgSQL function (public\\.)?publish_catalog_changeset[(]uuid,\\s*text,\\s*text[)] line [0-9]+ at SQL statement(\\n|$)' THEN
    BEGIN
      v_changeset_id := nullif(current_setting('wsh.current_changeset_id', true), '')::uuid;
    EXCEPTION WHEN OTHERS THEN
      v_changeset_id := NULL;
    END;

    IF v_changeset_id IS NOT NULL THEN
      -- Authoritatively verify changeset status, entity membership, and fetch reason & rollback linkage
      SELECT
        c.id,
        coalesce(nullif(current_setting('wsh.current_changeset_reason', true), ''), c.reason),
        c.related_history_id
      INTO
        v_changeset_id,
        v_changeset_reason,
        v_rollback_of_id
      FROM public.catalog_draft_changesets c,
      LATERAL jsonb_array_elements(c.target_entities) elem
      WHERE c.id = v_changeset_id
        AND c.status IN ('draft', 'validated')
        AND elem->>'entity_type' = 'branch'
        AND elem->>'entity_id' = coalesce(NEW.id::text, OLD.id::text)
      LIMIT 1;

      IF NOT FOUND THEN
        v_changeset_id := NULL;
        v_changeset_reason := NULL;
        v_rollback_of_id := NULL;
      END IF;
    ELSE
      v_changeset_reason := NULL;
      v_rollback_of_id := NULL;
    END IF;

    -- Inside the authorized publish_catalog_changeset frame, record the authenticated administrator
    v_changed_by := coalesce(
      nullif(trim(current_setting('wsh.current_admin_id', true)), ''),
      coalesce(current_setting('request.jwt.claim.sub', true), current_user, 'system')
    );
  ELSE
    v_changeset_id := NULL;
    v_changeset_reason := NULL;
    v_rollback_of_id := NULL;
    -- Outside authorized frame, GUCs are strictly untrusted; record authentic caller role
    v_changed_by := coalesce(current_setting('request.jwt.claim.sub', true), current_user, 'system');
  END IF;

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

  -- Transactionally atomic history insertion with exact changeset attribution
  INSERT INTO public.catalog_change_history (
    entity_type,
    entity_id,
    action,
    changed_by,
    change_summary,
    previous_state,
    new_state,
    effective_at,
    changeset_id,
    reason,
    rollback_of_id
  ) VALUES (
    'branch',
    v_id,
    v_action,
    v_changed_by,
    v_summary,
    v_prev,
    v_new,
    now(),
    v_changeset_id,
    v_changeset_reason,
    v_rollback_of_id
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$trg_branch$;

-- 7. Authoritative Atomic Publication RPC Function
CREATE OR REPLACE FUNCTION public.publish_catalog_changeset(
  p_changeset_id uuid,
  p_admin_id text,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $publish$
DECLARE
  v_changeset public.catalog_draft_changesets%ROWTYPE;
  v_item jsonb;
  v_entity_type text;
  v_entity_id text;
  v_base_version text;
  v_changes jsonb;
  v_action text;
  v_current_updated_at timestamptz;
  v_published_count integer := 0;
  v_reason text;
  v_now timestamptz := now();
  v_brand_name_ar text;
  v_brand_name_en text;
  v_brand_categories text[];
  v_brand_rating numeric;
  v_branch_district text;
  v_branch_addr_ar text;
  v_branch_addr_en text;
  v_branch_status text;
  v_lat double precision;
  v_lng double precision;
  v_maps_url text;
  v_target_key text;
  v_target_prop text;
  v_base_ver_str text;
  v_seen_targets text[] := '{}';
  v_key text;
  v_elem text;
  v_reason_elem jsonb;
  v_parsed_ts timestamptz;
BEGIN
  -- 1. Lock and load change set row
  SELECT * INTO v_changeset
  FROM public.catalog_draft_changesets
  WHERE id = p_changeset_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'WSH_CHANGESET_NOT_FOUND: Change set % does not exist', p_changeset_id USING ERRCODE = 'P0002';
  END IF;

  IF v_changeset.status NOT IN ('draft', 'validated') THEN
    RAISE EXCEPTION 'WSH_CHANGESET_NOT_PUBLISHABLE: Change set % has status % and cannot be published',
      p_changeset_id, v_changeset.status USING ERRCODE = '22023';
  END IF;

  -- 2. Validate reason requirement for sensitive actions
  v_reason := coalesce(nullif(trim(p_reason), ''), v_changeset.reason);
  IF v_changeset.change_type IN ('emergency', 'rollback', 'restore') AND coalesce(length(trim(v_reason)), 0) < 3 THEN
    RAISE EXCEPTION 'WSH_REASON_REQUIRED: A valid non-empty reason is strictly required for % operations',
      v_changeset.change_type USING ERRCODE = '22023';
  END IF;

  -- 3. Validate target_entities shape: must be non-empty JSON array
  IF jsonb_typeof(v_changeset.target_entities) <> 'array' OR jsonb_array_length(v_changeset.target_entities) = 0 THEN
    RAISE EXCEPTION 'WSH_EMPTY_CHANGESET: Change set % contains no target entities to publish',
      p_changeset_id USING ERRCODE = '22023';
  END IF;

  -- ====================================================================
  -- PASS 1: COMPLETE PRE-FLIGHT CONTRACT & FIELD ALLOWLIST VALIDATION
  -- ====================================================================
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_changeset.target_entities)
  LOOP
    IF jsonb_typeof(v_item) <> 'object' THEN
      RAISE EXCEPTION 'WSH_MALFORMED_TARGET: Target entity must be a JSON object' USING ERRCODE = '22023';
    END IF;

    -- Reject unsupported top-level target properties
    FOR v_target_prop IN SELECT jsonb_object_keys(v_item)
    LOOP
      IF v_target_prop NOT IN ('entity_type', 'entity_id', 'action', 'base_version', 'changes') THEN
        RAISE EXCEPTION 'WSH_UNSUPPORTED_TARGET_KEY: Key "%" is not allowed on target entity', v_target_prop USING ERRCODE = '22023';
      END IF;
    END LOOP;

    v_entity_type := v_item->>'entity_type';
    IF v_entity_type NOT IN ('restaurant', 'branch') THEN
      RAISE EXCEPTION 'WSH_UNSUPPORTED_ENTITY_TYPE: Unsupported entity type "%"', v_entity_type USING ERRCODE = '22023';
    END IF;

    v_entity_id := trim(coalesce(v_item->>'entity_id', ''));
    IF length(v_entity_id) = 0 THEN
      RAISE EXCEPTION 'WSH_INVALID_ENTITY_ID: Entity ID cannot be empty' USING ERRCODE = '22023';
    END IF;

    IF v_entity_type = 'branch' THEN
      IF v_entity_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
        RAISE EXCEPTION 'WSH_INVALID_ENTITY_ID: Branch ID "%" must be a valid UUID', v_entity_id USING ERRCODE = '22023';
      END IF;
    END IF;

    -- Duplicate target check
    v_target_key := v_entity_type || ':' || v_entity_id;
    IF v_target_key = ANY(v_seen_targets) THEN
      RAISE EXCEPTION 'WSH_DUPLICATE_TARGET: Target "%" appears multiple times in changeset', v_target_key USING ERRCODE = '22023';
    END IF;
    v_seen_targets := array_append(v_seen_targets, v_target_key);

    -- Action check: must be update or edit
    IF v_item ? 'action' THEN
      IF jsonb_typeof(v_item->'action') <> 'string' THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Target action must be a string' USING ERRCODE = '22023';
      END IF;
      v_action := coalesce(v_item->>'action', 'update');
      IF v_action NOT IN ('update', 'edit') THEN
        RAISE EXCEPTION 'WSH_UNSUPPORTED_ACTION: Action "%" is not supported for entity %', v_action, v_entity_id USING ERRCODE = '22023';
      END IF;
    END IF;

    -- Validate base_version before locking row
    IF v_item ? 'base_version' THEN
      IF jsonb_typeof(v_item->'base_version') NOT IN ('string', 'null') THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Target base_version must be a string or null' USING ERRCODE = '22023';
      END IF;
      IF jsonb_typeof(v_item->'base_version') = 'string' THEN
        v_base_ver_str := trim(v_item->>'base_version');
        IF v_base_ver_str !~* '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}([.][0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})$' THEN
          RAISE EXCEPTION 'WSH_INVALID_TIMESTAMP: Target base_version must be an ISO 8601 timestamp with explicit timezone' USING ERRCODE = '22023';
        END IF;
        BEGIN
          v_parsed_ts := v_base_ver_str::timestamptz;
        EXCEPTION WHEN OTHERS THEN
          RAISE EXCEPTION 'WSH_INVALID_TIMESTAMP: Target base_version is not a valid ISO timestamp' USING ERRCODE = '22023';
        END;
      END IF;
    END IF;

    -- Changes object check
    v_changes := v_item->'changes';
    IF v_changes IS NULL OR jsonb_typeof(v_changes) <> 'object' THEN
      RAISE EXCEPTION 'WSH_MALFORMED_CHANGES: Changes for target % must be a JSON object', v_target_key USING ERRCODE = '22023';
    END IF;

    IF (SELECT count(*) FROM jsonb_object_keys(v_changes)) = 0 THEN
      RAISE EXCEPTION 'WSH_EMPTY_CHANGES: Changes for target % cannot be empty', v_target_key USING ERRCODE = '22023';
    END IF;

    -- Field allowlist & type validation
    IF v_entity_type = 'restaurant' THEN
      FOR v_key IN SELECT jsonb_object_keys(v_changes)
      LOOP
        IF v_key = 'primary_category' THEN
          RAISE EXCEPTION 'WSH_UNSUPPORTED_FIELD: Field "primary_category" is derived from categories[1] and cannot be directly edited. Edit "categories" instead' USING ERRCODE = '22023';
        END IF;
        IF v_key NOT IN (
          'name_ar', 'name_en', 'categories', 'dining_mode',
          'tier', 'price_tier', 'rating', 'operating_status', 'research_use',
          'price_position', 'editorial_role', 'manual_review_required',
          'manual_review_reasons', 'last_verified_at'
        ) THEN
          RAISE EXCEPTION 'WSH_UNSUPPORTED_FIELD: Field "%" is not allowed for restaurant', v_key USING ERRCODE = '22023';
        END IF;
      END LOOP;

      -- Validate restaurant field types and constraints
      IF v_changes ? 'name_ar' AND jsonb_typeof(v_changes->'name_ar') NOT IN ('string', 'null') THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "name_ar" on brand % must be a string or null', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'name_en' AND jsonb_typeof(v_changes->'name_en') NOT IN ('string', 'null') THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "name_en" on brand % must be a string or null', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'categories' THEN
        IF jsonb_typeof(v_changes->'categories') <> 'array' THEN
          RAISE EXCEPTION 'WSH_INVALID_CATEGORIES: Field "categories" on brand % must be a JSON array', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF jsonb_array_length(v_changes->'categories') = 0 THEN
          RAISE EXCEPTION 'WSH_BRAND_READINESS_FAILED: Brand % must have at least one category', v_entity_id USING ERRCODE = '22023';
        END IF;
        FOR v_elem IN SELECT jsonb_array_elements_text(v_changes->'categories')
        LOOP
          IF v_elem NOT IN (
            'burger','shawarma','fried_chicken','pizza','kabsa','grills','grill','rice','broast',
            'saudi_kabsa','fatayer','sandwiches','indian','italian','seafood','street_folk','sushi',
            'mexican','asian','breakfast','bakery','cafe_dessert','healthy','dessert','coffee',
            'traditional','pastry','falafel','foul','mutabbaq','masoub','tea','middle_eastern',
            'american','lebanese','yemeni','syrian','turkish','japanese','chinese','thai','korean',
            'international'
          ) THEN
            RAISE EXCEPTION 'WSH_INVALID_CATEGORY: Category "%" is not an approved catalog category', v_elem USING ERRCODE = '22023';
          END IF;
        END LOOP;
      END IF;

      IF v_changes ? 'primary_category' AND jsonb_typeof(v_changes->'primary_category') NOT IN ('string', 'null') THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "primary_category" on brand % must be a string or null', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'dining_mode' THEN
        IF jsonb_typeof(v_changes->'dining_mode') NOT IN ('string', 'null') THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "dining_mode" on brand % must be a string or null', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF v_changes->>'dining_mode' IS NOT NULL AND v_changes->>'dining_mode' NOT IN ('both', 'delivery_only', 'dine_in_only', 'unknown') THEN
          RAISE EXCEPTION 'WSH_INVALID_DINING_MODE: Invalid dining_mode "%"', v_changes->>'dining_mode' USING ERRCODE = '22023';
        END IF;
      END IF;

      IF v_changes ? 'tier' THEN
        IF jsonb_typeof(v_changes->'tier') NOT IN ('string', 'null') THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "tier" on brand % must be a string or null', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF v_changes->>'tier' IS NOT NULL AND v_changes->>'tier' NOT IN ('staple', 'trend', 'discovery') THEN
          RAISE EXCEPTION 'WSH_INVALID_TIER: Invalid tier "%"', v_changes->>'tier' USING ERRCODE = '22023';
        END IF;
      END IF;

      IF v_changes ? 'price_tier' THEN
        IF jsonb_typeof(v_changes->'price_tier') NOT IN ('string', 'null') THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "price_tier" on brand % must be a string or null', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF v_changes->>'price_tier' IS NOT NULL AND v_changes->>'price_tier' NOT IN ('$', '$$', '$$$', '$$$$') THEN
          RAISE EXCEPTION 'WSH_INVALID_PRICE_TIER: Invalid price_tier "%"', v_changes->>'price_tier' USING ERRCODE = '22023';
        END IF;
      END IF;

      IF v_changes ? 'rating' THEN
        IF jsonb_typeof(v_changes->'rating') NOT IN ('number', 'null') THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "rating" on brand % must be a number or null', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF jsonb_typeof(v_changes->'rating') = 'number' THEN
          v_brand_rating := (v_changes->>'rating')::numeric;
          IF v_brand_rating < 0.0 OR v_brand_rating > 5.0 THEN
            RAISE EXCEPTION 'WSH_INVALID_RATING: Rating % is outside valid range [0.0, 5.0]', v_brand_rating USING ERRCODE = '22023';
          END IF;
        END IF;
      END IF;

      IF v_changes ? 'operating_status' THEN
        IF jsonb_typeof(v_changes->'operating_status') <> 'string' THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "operating_status" on brand % must be a string', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF v_changes->>'operating_status' NOT IN ('open', 'temporarily_closed', 'permanently_closed', 'unknown') THEN
          RAISE EXCEPTION 'WSH_INVALID_STATUS: Invalid operating_status "%"', v_changes->>'operating_status' USING ERRCODE = '22023';
        END IF;
      END IF;

      IF v_changes ? 'research_use' THEN
        IF jsonb_typeof(v_changes->'research_use') <> 'string' THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "research_use" on brand % must be a string', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF v_changes->>'research_use' NOT IN ('production_ready', 'usable_with_caution', 'manual_review_only', 'rejected') THEN
          RAISE EXCEPTION 'WSH_INVALID_RESEARCH_USE: Invalid research_use "%"', v_changes->>'research_use' USING ERRCODE = '22023';
        END IF;
      END IF;

      IF v_changes ? 'price_position' THEN
        IF jsonb_typeof(v_changes->'price_position') <> 'string' THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "price_position" on brand % must be a string', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF v_changes->>'price_position' NOT IN ('budget', 'standard', 'premium', 'unknown') THEN
          RAISE EXCEPTION 'WSH_INVALID_PRICE_POSITION: Invalid price_position "%"', v_changes->>'price_position' USING ERRCODE = '22023';
        END IF;
      END IF;

      IF v_changes ? 'editorial_role' THEN
        IF jsonb_typeof(v_changes->'editorial_role') NOT IN ('string', 'null') THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "editorial_role" on brand % must be a string or null', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF v_changes->>'editorial_role' IS NOT NULL AND v_changes->>'editorial_role' NOT IN ('staple', 'popular', 'discovery') THEN
          RAISE EXCEPTION 'WSH_INVALID_EDITORIAL_ROLE: Invalid editorial_role "%"', v_changes->>'editorial_role' USING ERRCODE = '22023';
        END IF;
      END IF;

      IF v_changes ? 'manual_review_required' AND jsonb_typeof(v_changes->'manual_review_required') <> 'boolean' THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "manual_review_required" on brand % must be a boolean', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'manual_review_reasons' THEN
        IF jsonb_typeof(v_changes->'manual_review_reasons') NOT IN ('array', 'null') THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "manual_review_reasons" on brand % must be a JSON array or null', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF jsonb_typeof(v_changes->'manual_review_reasons') = 'array' THEN
          IF jsonb_array_length(v_changes->'manual_review_reasons') > 20 THEN
            RAISE EXCEPTION 'WSH_FIELD_LIMIT_EXCEEDED: manual_review_reasons on brand % cannot exceed 20 items', v_entity_id USING ERRCODE = '22023';
          END IF;
          FOR v_reason_elem IN SELECT * FROM jsonb_array_elements(v_changes->'manual_review_reasons')
          LOOP
            IF jsonb_typeof(v_reason_elem) <> 'string' THEN
              RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Elements in manual_review_reasons on brand % must be strings', v_entity_id USING ERRCODE = '22023';
            END IF;
            v_elem := v_reason_elem #>> '{}';
            IF length(trim(v_elem)) = 0 OR length(v_elem) > 200 THEN
              RAISE EXCEPTION 'WSH_INVALID_FIELD_VALUE: Element in manual_review_reasons on brand % must be a non-empty string between 1 and 200 characters', v_entity_id USING ERRCODE = '22023';
            END IF;
          END LOOP;
        END IF;
      END IF;

      IF v_changes ? 'last_verified_at' THEN
        IF jsonb_typeof(v_changes->'last_verified_at') NOT IN ('string', 'null') THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "last_verified_at" on brand % must be a string or null', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF jsonb_typeof(v_changes->'last_verified_at') = 'string' THEN
          IF (v_changes->>'last_verified_at') !~* '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}([.][0-9]+)?(Z|[+-]((0[0-9]|1[0-3]):[0-5][0-9]|14:00))$' THEN
            RAISE EXCEPTION 'WSH_INVALID_TIMESTAMP: Field "last_verified_at" on brand % must be an ISO 8601 timestamp with explicit timezone', v_entity_id USING ERRCODE = '22023';
          END IF;
          BEGIN
            v_parsed_ts := (v_changes->>'last_verified_at')::timestamptz;
          EXCEPTION WHEN OTHERS THEN
            RAISE EXCEPTION 'WSH_INVALID_TIMESTAMP: Field "last_verified_at" on brand % is not a valid ISO timestamp', v_entity_id USING ERRCODE = '22023';
          END;
        END IF;
      END IF;

    ELSIF v_entity_type = 'branch' THEN
      FOR v_key IN SELECT jsonb_object_keys(v_changes)
      LOOP
        IF v_key NOT IN (
          'branch_name_ar', 'branch_name_en', 'district', 'address_ar', 'address_en',
          'latitude', 'longitude', 'google_maps_url', 'branch_status', 'branch_type',
          'dine_in', 'takeaway', 'late_night', 'is_24_hours', 'last_verified_at'
        ) THEN
          RAISE EXCEPTION 'WSH_UNSUPPORTED_FIELD: Field "%" is not allowed for branch', v_key USING ERRCODE = '22023';
        END IF;
      END LOOP;

      -- Validate branch field types and constraints
      IF v_changes ? 'branch_name_ar' AND jsonb_typeof(v_changes->'branch_name_ar') NOT IN ('string', 'null') THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "branch_name_ar" on branch % must be a string or null', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'branch_name_en' AND jsonb_typeof(v_changes->'branch_name_en') NOT IN ('string', 'null') THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "branch_name_en" on branch % must be a string or null', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'district' THEN
        IF jsonb_typeof(v_changes->'district') <> 'string' THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "district" on branch % must be a string', v_entity_id USING ERRCODE = '22023';
        END IF;
        v_branch_district := lower(trim(v_changes->>'district'));
        IF length(v_branch_district) = 0 THEN
          RAISE EXCEPTION 'WSH_BRANCH_READINESS_FAILED: Branch % is missing required canonical district', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF v_branch_district NOT IN (
          'al_sheraa','al_hamdaniyah','abhur_al_shamaliyah','abhur_al_janoubiyah','al_murjan',
          'al_basateen','al_mohammadiyyah','al_naeem','al_marwah','an_nuzhah','al_shati',
          'al_bawadi','al_salamah','al_zahra','al_safa','al_samer','ar_rabwah','al_faisaliyyah',
          'al_aziziyah','al_rawdah','al_khalidiyyah','al_rehab','al_andalus','al_hamra',
          'al_sharafeyah','al_naseem','al_ruwais','al_faiha','al_balad','al_thaghr'
        ) THEN
          RAISE EXCEPTION 'WSH_NON_CANONICAL_DISTRICT: District "%" is not an approved canonical Jeddah district', v_branch_district USING ERRCODE = '22023';
        END IF;
      END IF;

      IF v_changes ? 'address_ar' AND jsonb_typeof(v_changes->'address_ar') NOT IN ('string', 'null') THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "address_ar" on branch % must be a string or null', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'address_en' AND jsonb_typeof(v_changes->'address_en') NOT IN ('string', 'null') THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "address_en" on branch % must be a string or null', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'latitude' AND jsonb_typeof(v_changes->'latitude') NOT IN ('number', 'null') THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "latitude" on branch % must be a number or null', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'longitude' AND jsonb_typeof(v_changes->'longitude') NOT IN ('number', 'null') THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "longitude" on branch % must be a number or null', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF (v_changes ? 'latitude') AND (v_changes ? 'longitude') THEN
        IF (jsonb_typeof(v_changes->'latitude') = 'null') <> (jsonb_typeof(v_changes->'longitude') = 'null') THEN
          RAISE EXCEPTION 'WSH_COORDINATE_PARITY: Latitude and longitude must both be provided or both be null' USING ERRCODE = '22023';
        END IF;
        IF jsonb_typeof(v_changes->'latitude') = 'number' AND jsonb_typeof(v_changes->'longitude') = 'number' THEN
          v_lat := (v_changes->>'latitude')::double precision;
          v_lng := (v_changes->>'longitude')::double precision;
          IF v_lat < 21.0 OR v_lat > 22.0 OR v_lng < 39.0 OR v_lng > 39.5 THEN
            RAISE EXCEPTION 'WSH_COORDINATES_OUT_OF_BOUNDS: Coordinates [%, %] outside Jeddah boundaries', v_lat, v_lng USING ERRCODE = '22023';
          END IF;
        END IF;
      ELSIF (v_changes ? 'latitude') <> (v_changes ? 'longitude') THEN
        RAISE EXCEPTION 'WSH_COORDINATE_PARITY: Latitude and longitude must both be provided or both be null' USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'google_maps_url' THEN
        IF jsonb_typeof(v_changes->'google_maps_url') NOT IN ('string', 'null') THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "google_maps_url" on branch % must be a string or null', v_entity_id USING ERRCODE = '22023';
        END IF;
        v_maps_url := trim(coalesce(v_changes->>'google_maps_url', ''));
        IF length(v_maps_url) > 0 THEN
          -- Shared Policy: Strict HTTPS scheme only
          IF v_maps_url !~* '^https://' THEN
            RAISE EXCEPTION 'WSH_INVALID_MAPS_URL: Google Maps URL on branch % must start with https://', v_entity_id USING ERRCODE = '22023';
          END IF;
          -- Shared Policy: Reject userinfo credentials in authority (user:pass@)
          IF v_maps_url ~* '^https://[^/?#]*@' THEN
            RAISE EXCEPTION 'WSH_INVALID_MAPS_URL: Google Maps URL on branch % contains forbidden userinfo', v_entity_id USING ERRCODE = '22023';
          END IF;
          -- Shared Policy: Reject explicit port specifications (including :443 and :8080)
          IF v_maps_url ~* '^https://[^/?#]+:[0-9]+' THEN
            RAISE EXCEPTION 'WSH_INVALID_MAPS_URL: Google Maps URL on branch % contains forbidden port', v_entity_id USING ERRCODE = '22023';
          END IF;
          -- Shared Policy: Permitted hosts and paths only (maps.google, google.com/maps, short links)
          IF NOT (
            v_maps_url ~* '^https://maps\.google\.(com|com\.sa)(/.*|[?].*)?$' OR
            v_maps_url ~* '^https://(www\.)?google\.(com|com\.sa)/maps([/?].*)?$' OR
            v_maps_url ~* '^https://maps\.app\.goo\.gl/[A-Za-z0-9_-]+([?].*)?$' OR
            v_maps_url ~* '^https://goo\.gl/maps/[A-Za-z0-9_-]+([?].*)?$'
          ) THEN
            RAISE EXCEPTION 'WSH_INVALID_MAPS_URL: Google Maps URL on branch % must be a valid Google Maps URL', v_entity_id USING ERRCODE = '22023';
          END IF;
        END IF;
      END IF;

      IF v_changes ? 'branch_status' THEN
        IF jsonb_typeof(v_changes->'branch_status') <> 'string' THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "branch_status" on branch % must be a string', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF v_changes->>'branch_status' NOT IN ('open', 'temporarily_closed', 'permanently_closed', 'unknown') THEN
          RAISE EXCEPTION 'WSH_INVALID_STATUS: Invalid branch_status "%"', v_changes->>'branch_status' USING ERRCODE = '22023';
        END IF;
      END IF;

      IF v_changes ? 'branch_type' THEN
        IF jsonb_typeof(v_changes->'branch_type') <> 'string' THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "branch_type" on branch % must be a string', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF v_changes->>'branch_type' NOT IN ('full_dine_in', 'takeaway_only', 'delivery_only', 'mall_foodcourt', 'airport', 'kiosk', 'unknown') THEN
          RAISE EXCEPTION 'WSH_INVALID_BRANCH_TYPE: Invalid branch_type "%"', v_changes->>'branch_type' USING ERRCODE = '22023';
        END IF;
      END IF;

      IF v_changes ? 'dine_in' AND jsonb_typeof(v_changes->'dine_in') <> 'boolean' THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "dine_in" on branch % must be a boolean', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'takeaway' AND jsonb_typeof(v_changes->'takeaway') <> 'boolean' THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "takeaway" on branch % must be a boolean', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'late_night' AND jsonb_typeof(v_changes->'late_night') <> 'boolean' THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "late_night" on branch % must be a boolean', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'is_24_hours' AND jsonb_typeof(v_changes->'is_24_hours') <> 'boolean' THEN
        RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "is_24_hours" on branch % must be a boolean', v_entity_id USING ERRCODE = '22023';
      END IF;

      IF v_changes ? 'last_verified_at' THEN
        IF jsonb_typeof(v_changes->'last_verified_at') NOT IN ('string', 'null') THEN
          RAISE EXCEPTION 'WSH_INVALID_FIELD_TYPE: Field "last_verified_at" on branch % must be a string or null', v_entity_id USING ERRCODE = '22023';
        END IF;
        IF jsonb_typeof(v_changes->'last_verified_at') = 'string' THEN
          IF (v_changes->>'last_verified_at') !~* '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}([.][0-9]+)?(Z|[+-]((0[0-9]|1[0-3]):[0-5][0-9]|14:00))$' THEN
            RAISE EXCEPTION 'WSH_INVALID_TIMESTAMP: Field "last_verified_at" on branch % must be an ISO 8601 timestamp with explicit timezone', v_entity_id USING ERRCODE = '22023';
          END IF;
          BEGIN
            v_parsed_ts := (v_changes->>'last_verified_at')::timestamptz;
          EXCEPTION WHEN OTHERS THEN
            RAISE EXCEPTION 'WSH_INVALID_TIMESTAMP: Field "last_verified_at" on branch % is not a valid ISO timestamp', v_entity_id USING ERRCODE = '22023';
          END;
        END IF;
      END IF;
    END IF;
  END LOOP;

  -- ====================================================================
  -- PASS 2: CONCURRENCY LOCK, READINESS CHECKS & LIVE APPLICATION
  -- ====================================================================

  -- Set transaction-local configuration for direct audit trigger attribution
  PERFORM set_config('wsh.current_changeset_id', p_changeset_id::text, true);
  PERFORM set_config('wsh.current_changeset_reason', coalesce(v_reason, ''), true);
  PERFORM set_config('wsh.current_admin_id', coalesce(nullif(trim(p_admin_id), ''), 'system'), true);
  IF v_changeset.related_history_id IS NOT NULL THEN
    PERFORM set_config('wsh.current_rollback_of_id', v_changeset.related_history_id::text, true);
  ELSE
    PERFORM set_config('wsh.current_rollback_of_id', '', true);
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_changeset.target_entities)
  LOOP
    v_entity_type := v_item->>'entity_type';
    v_entity_id := v_item->>'entity_id';
    v_base_version := v_item->>'base_version';
    v_changes := v_item->'changes';

    IF v_entity_type = 'restaurant' THEN
      -- Concurrency check on brand
      SELECT updated_at, name_ar, name_en, categories, rating
      INTO v_current_updated_at, v_brand_name_ar, v_brand_name_en, v_brand_categories, v_brand_rating
      FROM public.restaurants
      WHERE id = v_entity_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'WSH_BRAND_NOT_FOUND: Target brand % does not exist', v_entity_id USING ERRCODE = 'P0002';
      END IF;

      IF v_base_version IS NOT NULL AND v_current_updated_at IS NOT NULL THEN
        IF v_current_updated_at > v_base_version::timestamptz THEN
          RAISE EXCEPTION 'WSH_STALE_DRAFT_CONFLICT: Brand % was modified after draft creation (base: %, current: %)',
            v_entity_id, v_base_version, v_current_updated_at::text USING ERRCODE = '40001';
        END IF;
      END IF;

      -- Resolve projected values for brand readiness checks
      v_brand_name_ar := CASE
        WHEN NOT (v_changes ? 'name_ar') THEN v_brand_name_ar
        WHEN jsonb_typeof(v_changes->'name_ar') = 'null' THEN NULL
        ELSE v_changes->>'name_ar'
      END;

      v_brand_name_en := CASE
        WHEN NOT (v_changes ? 'name_en') THEN v_brand_name_en
        WHEN jsonb_typeof(v_changes->'name_en') = 'null' THEN NULL
        ELSE v_changes->>'name_en'
      END;

      IF v_changes ? 'categories' THEN
        SELECT coalesce(array_agg(elem::text), '{}'::text[])
        INTO v_brand_categories
        FROM jsonb_array_elements_text(v_changes->'categories') elem;
      END IF;

      -- Brand validation: Name requirement
      IF coalesce(length(trim(v_brand_name_ar)), 0) = 0 AND coalesce(length(trim(v_brand_name_en)), 0) = 0 THEN
        RAISE EXCEPTION 'WSH_BRAND_READINESS_FAILED: Brand % must have at least an Arabic or English name',
          v_entity_id USING ERRCODE = '22023';
      END IF;

      -- Brand validation: Category requirement
      IF coalesce(array_length(v_brand_categories, 1), 0) = 0 THEN
        RAISE EXCEPTION 'WSH_BRAND_READINESS_FAILED: Brand % must have at least one category',
          v_entity_id USING ERRCODE = '22023';
      END IF;

      -- Apply valid restaurant changes
      UPDATE public.restaurants
      SET
        name_ar = v_brand_name_ar,
        name_en = v_brand_name_en,
        categories = v_brand_categories,
        primary_category = CASE
          WHEN array_length(v_brand_categories, 1) > 0 THEN v_brand_categories[1]
          ELSE primary_category
        END,
        dining_mode = CASE
          WHEN NOT (v_changes ? 'dining_mode') THEN dining_mode
          WHEN jsonb_typeof(v_changes->'dining_mode') = 'null' THEN NULL
          ELSE v_changes->>'dining_mode'
        END,
        tier = CASE
          WHEN NOT (v_changes ? 'tier') THEN tier
          WHEN jsonb_typeof(v_changes->'tier') = 'null' THEN NULL
          ELSE v_changes->>'tier'
        END,
        price_tier = CASE
          WHEN NOT (v_changes ? 'price_tier') THEN price_tier
          WHEN jsonb_typeof(v_changes->'price_tier') = 'null' THEN NULL
          ELSE v_changes->>'price_tier'
        END,
        rating = CASE
          WHEN NOT (v_changes ? 'rating') THEN rating
          WHEN jsonb_typeof(v_changes->'rating') = 'null' THEN NULL
          ELSE (v_changes->>'rating')::numeric(2,1)
        END,
        operating_status = CASE
          WHEN v_changes ? 'operating_status' THEN (v_changes->>'operating_status')::public.operating_status
          ELSE operating_status
        END,
        research_use = CASE
          WHEN v_changes ? 'research_use' THEN (v_changes->>'research_use')::public.research_use
          ELSE research_use
        END,
        price_position = CASE
          WHEN v_changes ? 'price_position' THEN (v_changes->>'price_position')::public.price_position
          ELSE price_position
        END,
        editorial_role = CASE
          WHEN NOT (v_changes ? 'editorial_role') THEN editorial_role
          WHEN jsonb_typeof(v_changes->'editorial_role') = 'null' THEN NULL
          ELSE (v_changes->>'editorial_role')::public.editorial_role
        END,
        manual_review_required = CASE
          WHEN v_changes ? 'manual_review_required' THEN (v_changes->>'manual_review_required')::boolean
          ELSE manual_review_required
        END,
        manual_review_reasons = CASE
          WHEN NOT (v_changes ? 'manual_review_reasons') THEN manual_review_reasons
          WHEN jsonb_typeof(v_changes->'manual_review_reasons') = 'null' THEN '{}'::text[]
          ELSE (SELECT coalesce(array_agg(elem::text), '{}'::text[]) FROM jsonb_array_elements_text(v_changes->'manual_review_reasons') elem)
        END,
        last_verified_at = CASE
          WHEN NOT (v_changes ? 'last_verified_at') THEN last_verified_at
          WHEN jsonb_typeof(v_changes->'last_verified_at') = 'null' THEN NULL
          ELSE (v_changes->>'last_verified_at')::timestamptz
        END,
        updated_at = v_now
      WHERE id = v_entity_id;

      v_published_count := v_published_count + 1;

    ELSIF v_entity_type = 'branch' THEN
      -- Concurrency check on branch
      SELECT updated_at, district, address_ar, address_en, branch_status, latitude, longitude, google_maps_url
      INTO v_current_updated_at, v_branch_district, v_branch_addr_ar, v_branch_addr_en, v_branch_status, v_lat, v_lng, v_maps_url
      FROM public.restaurant_branches
      WHERE id = v_entity_id::uuid
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'WSH_BRANCH_NOT_FOUND: Target branch % does not exist', v_entity_id USING ERRCODE = 'P0002';
      END IF;

      IF v_base_version IS NOT NULL AND v_current_updated_at IS NOT NULL THEN
        IF v_current_updated_at > v_base_version::timestamptz THEN
          RAISE EXCEPTION 'WSH_STALE_DRAFT_CONFLICT: Branch % was modified after draft creation (base: %, current: %)',
            v_entity_id, v_base_version, v_current_updated_at::text USING ERRCODE = '40001';
        END IF;
      END IF;

      -- Resolve projected values for readiness checks
      IF v_changes ? 'district' THEN
        v_branch_district := lower(trim(coalesce(v_changes->>'district', '')));
      END IF;

      v_branch_addr_ar := CASE
        WHEN NOT (v_changes ? 'address_ar') THEN v_branch_addr_ar
        WHEN jsonb_typeof(v_changes->'address_ar') = 'null' THEN NULL
        ELSE v_changes->>'address_ar'
      END;

      v_branch_addr_en := CASE
        WHEN NOT (v_changes ? 'address_en') THEN v_branch_addr_en
        WHEN jsonb_typeof(v_changes->'address_en') = 'null' THEN NULL
        ELSE v_changes->>'address_en'
      END;

      -- Readiness hard constraint: District required
      IF coalesce(length(trim(v_branch_district)), 0) = 0 THEN
        RAISE EXCEPTION 'WSH_BRANCH_READINESS_FAILED: Branch % is missing required canonical district',
          v_entity_id USING ERRCODE = '22023';
      END IF;

      -- Strict Canonical 30 Jeddah districts check
      IF v_branch_district NOT IN (
        'al_sheraa','al_hamdaniyah','abhur_al_shamaliyah','abhur_al_janoubiyah','al_murjan',
        'al_basateen','al_mohammadiyyah','al_naeem','al_marwah','an_nuzhah','al_shati',
        'al_bawadi','al_salamah','al_zahra','al_safa','al_samer','ar_rabwah','al_faisaliyyah',
        'al_aziziyah','al_rawdah','al_khalidiyyah','al_rehab','al_andalus','al_hamra',
        'al_sharafeyah','al_naseem','al_ruwais','al_faiha','al_balad','al_thaghr'
      ) THEN
        RAISE EXCEPTION 'WSH_NON_CANONICAL_DISTRICT: District "%" is not an approved canonical Jeddah district',
          v_branch_district USING ERRCODE = '22023';
      END IF;

      -- Readiness hard constraint: Address required
      IF coalesce(length(trim(v_branch_addr_ar)), 0) = 0 AND coalesce(length(trim(v_branch_addr_en)), 0) = 0 THEN
        RAISE EXCEPTION 'WSH_BRANCH_READINESS_FAILED: Branch % is missing required address',
          v_entity_id USING ERRCODE = '22023';
      END IF;

      -- Apply valid branch changes
      UPDATE public.restaurant_branches
      SET
        branch_name_ar = CASE
          WHEN NOT (v_changes ? 'branch_name_ar') THEN branch_name_ar
          WHEN jsonb_typeof(v_changes->'branch_name_ar') = 'null' THEN NULL
          ELSE v_changes->>'branch_name_ar'
        END,
        branch_name_en = CASE
          WHEN NOT (v_changes ? 'branch_name_en') THEN branch_name_en
          WHEN jsonb_typeof(v_changes->'branch_name_en') = 'null' THEN NULL
          ELSE v_changes->>'branch_name_en'
        END,
        district = v_branch_district,
        address_ar = v_branch_addr_ar,
        address_en = v_branch_addr_en,
        latitude = CASE
          WHEN NOT (v_changes ? 'latitude') THEN latitude
          WHEN jsonb_typeof(v_changes->'latitude') = 'null' THEN NULL
          ELSE (v_changes->>'latitude')::double precision
        END,
        longitude = CASE
          WHEN NOT (v_changes ? 'longitude') THEN longitude
          WHEN jsonb_typeof(v_changes->'longitude') = 'null' THEN NULL
          ELSE (v_changes->>'longitude')::double precision
        END,
        google_maps_url = CASE
          WHEN NOT (v_changes ? 'google_maps_url') THEN google_maps_url
          WHEN jsonb_typeof(v_changes->'google_maps_url') = 'null' THEN NULL
          ELSE v_changes->>'google_maps_url'
        END,
        branch_status = CASE
          WHEN v_changes ? 'branch_status' THEN (v_changes->>'branch_status')::public.operating_status
          ELSE branch_status
        END,
        branch_type = CASE
          WHEN v_changes ? 'branch_type' THEN (v_changes->>'branch_type')::public.branch_type
          ELSE branch_type
        END,
        dine_in = CASE WHEN v_changes ? 'dine_in' THEN (v_changes->>'dine_in')::boolean ELSE dine_in END,
        takeaway = CASE WHEN v_changes ? 'takeaway' THEN (v_changes->>'takeaway')::boolean ELSE takeaway END,
        late_night = CASE WHEN v_changes ? 'late_night' THEN (v_changes->>'late_night')::boolean ELSE late_night END,
        is_24_hours = CASE WHEN v_changes ? 'is_24_hours' THEN (v_changes->>'is_24_hours')::boolean ELSE is_24_hours END,
        last_verified_at = CASE
          WHEN NOT (v_changes ? 'last_verified_at') THEN last_verified_at
          WHEN jsonb_typeof(v_changes->'last_verified_at') = 'null' THEN NULL
          ELSE (v_changes->>'last_verified_at')::timestamptz
        END,
        updated_at = v_now
      WHERE id = v_entity_id::uuid;

      v_published_count := v_published_count + 1;
    END IF;
  END LOOP;

  -- 5. Mark changeset as published
  UPDATE public.catalog_draft_changesets
  SET
    status = 'published',
    published_by = p_admin_id,
    published_at = v_now,
    reason = v_reason,
    updated_at = v_now
  WHERE id = p_changeset_id;

  -- 6. Clear transaction-local configuration
  PERFORM set_config('wsh.current_changeset_id', '', true);
  PERFORM set_config('wsh.current_changeset_reason', '', true);
  PERFORM set_config('wsh.current_admin_id', '', true);
  PERFORM set_config('wsh.current_rollback_of_id', '', true);

  RETURN jsonb_build_object(
    'success', true,
    'changeset_id', p_changeset_id,
    'published_entities_count', v_published_count,
    'published_at', v_now,
    'published_by', p_admin_id,
    'reason', v_reason
  );
END;
$publish$;

-- 8. Restrict publication RPC strictly to service_role
REVOKE ALL ON FUNCTION public.publish_catalog_changeset(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_catalog_changeset(uuid, text, text) TO service_role;

-- 9. Explicit Privilege Hardening on Catalog Functions:
-- Direct invocation of internal trigger functions is revoked from untrusted roles.
REVOKE ALL ON FUNCTION public.touch_catalog_draft_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touch_catalog_draft_updated_at() TO service_role;

REVOKE ALL ON FUNCTION public.trg_record_restaurant_catalog_change() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trg_record_restaurant_catalog_change() TO service_role;

REVOKE ALL ON FUNCTION public.trg_record_branch_catalog_change() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trg_record_branch_catalog_change() TO service_role;

-- 10. Explicit Privilege Hardening on Catalog Tables:
-- Untrusted roles (PUBLIC, anon, authenticated) are strictly restricted to SELECT.
-- Direct data modification (INSERT, UPDATE, DELETE, TRUNCATE) is strictly revoked from untrusted roles.
REVOKE ALL ON TABLE public.restaurants FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.restaurants TO anon, authenticated;
GRANT ALL ON TABLE public.restaurants TO service_role;

REVOKE ALL ON TABLE public.restaurant_branches FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.restaurant_branches TO anon, authenticated;
GRANT ALL ON TABLE public.restaurant_branches TO service_role;

COMMIT;
