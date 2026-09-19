-- 20260918000100_room_modes_preferences_and_suggestions.sql
-- Room Modes (Food, Breakfast, Cafes), Shared Preferences & Guest Suggestions Foundation:
-- 1. Add room_mode, preferences, and mode audit fields to public.rooms.
-- 2. Create private.room_suggestions table with RLS and private authorization.
-- 3. Define authoritative category mode membership & mode-aware validation.
-- 4. Implement mode-aware category consensus (supporting Any Breakfast wildcard).
-- 5. Authoritative host RPC switch_room_mode with strict clearing rules.
-- 6. Authoritative host RPC set_room_preference with suggestion auto-clearing.
-- 7. Authoritative participant RPC toggle_room_suggestion for social guest intent.
-- 8. Allow guest joins during Cafes mode (stage = 'swiping').

BEGIN;

-- 1. Extend rooms table with authoritative room_mode and preferences
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS room_mode text NOT NULL DEFAULT 'food'
    CHECK (room_mode IN ('food', 'breakfast', 'cafes')),
  ADD COLUMN IF NOT EXISTS preferences text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_mode_changed_by_participant_id uuid REFERENCES public.participants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_mode_changed_by_nickname text,
  ADD COLUMN IF NOT EXISTS last_mode_changed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_rooms_room_mode ON public.rooms(room_mode);

-- 2. Create private.room_suggestions table
CREATE TABLE IF NOT EXISTS private.room_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  target text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT room_suggestions_target_len CHECK (length(target) BETWEEN 1 AND 64),
  CONSTRAINT room_suggestions_unique_target UNIQUE (room_id, participant_id, target)
);

CREATE INDEX IF NOT EXISTS idx_room_suggestions_room ON private.room_suggestions(room_id);
CREATE INDEX IF NOT EXISTS idx_room_suggestions_participant ON private.room_suggestions(participant_id);

REVOKE ALL ON TABLE private.room_suggestions FROM PUBLIC, anon, authenticated;

-- 3. Authoritative category mode membership & validation
-- First drop any old constraint and 1-argument function to avoid signature conflicts
ALTER TABLE public.food_choices DROP CONSTRAINT IF EXISTS food_choices_valid_categories;
DROP FUNCTION IF EXISTS private.valid_category_selection(text[]);
DROP FUNCTION IF EXISTS private.valid_category_selection(text[], text);

CREATE OR REPLACE FUNCTION private.allowed_categories(p_mode text) RETURNS text[]
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog AS $$
  SELECT CASE
    WHEN p_mode = 'breakfast' THEN
      ARRAY['street_folk', 'sandwiches', 'fatayer', 'breakfast']::text[]
    WHEN p_mode = 'food' THEN
      ARRAY[
        'burger','shawarma','fried_chicken','broast','rice','grill','pizza','sushi',
        'italian','asian','seafood','breakfast','healthy','coffee','dessert','indian',
        'fatayer','street_folk','mexican','sandwiches'
      ]::text[]
    ELSE
      ARRAY[]::text[]
  END;
$$;

-- Mode-aware category selection validation
CREATE OR REPLACE FUNCTION private.valid_category_selection(value text[], p_room_mode text DEFAULT 'food'::text) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public, private AS $$
DECLARE
  allowed text[];
  wildcard text;
BEGIN
  IF value IS NULL OR coalesce(cardinality(value), 0) < 1 OR cardinality(value) > 21 THEN
    RETURN false;
  END IF;

  -- Ensure uniqueness
  IF cardinality(value) <> (SELECT count(DISTINCT item) FROM unnest(value) item) THEN
    RETURN false;
  END IF;

  IF p_room_mode = 'food' THEN
    allowed := private.allowed_categories('food');
    wildcard := 'flexible';
  ELSIF p_room_mode = 'breakfast' THEN
    allowed := private.allowed_categories('breakfast');
    wildcard := 'any_breakfast';
  ELSE
    -- Cafes or invalid mode: no category voting allowed
    RETURN false;
  END IF;

  -- Wildcard exclusivity: if wildcard is present, cardinality must be 1
  IF wildcard = ANY(value) AND cardinality(value) > 1 THEN
    RETURN false;
  END IF;

  -- All items must either be the mode wildcard or belong to allowed categories for this mode
  RETURN NOT EXISTS (
    SELECT 1 FROM unnest(value) item
    WHERE item IS NULL OR (item <> wildcard AND NOT (item = ANY(allowed)))
  );
END;
$$;

-- Clean up expired historical rooms and reconcile legacy submitted choices before applying check constraint
DELETE FROM public.rooms WHERE created_at < (now() - interval '30 minutes');
DELETE FROM public.food_choices WHERE room_id NOT IN (SELECT id FROM public.rooms);

UPDATE public.food_choices
SET is_submitted = false
WHERE is_submitted
  AND NOT (
    coalesce(private.valid_category_selection(selected_categories, 'food'::text), false)
    OR coalesce(private.valid_category_selection(selected_categories, 'breakfast'::text), false)
  );

-- Add row-level check constraint on food_choices to allow food or breakfast selections
ALTER TABLE public.food_choices ADD CONSTRAINT food_choices_valid_categories
  CHECK (NOT is_submitted OR (private.valid_category_selection(selected_categories, 'food'::text) OR private.valid_category_selection(selected_categories, 'breakfast'::text)))
  NOT VALID;

-- 4. Mode-aware category tally
CREATE OR REPLACE FUNCTION private.category_tally(requested_room_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  v_mode text;
  v_allowed text[];
  v_wildcard text;
  v_result jsonb;
BEGIN
  SELECT coalesce(room_mode, 'food') INTO v_mode FROM public.rooms WHERE id = requested_room_id;
  IF v_mode = 'breakfast' THEN
    v_allowed := private.allowed_categories('breakfast');
    v_wildcard := 'any_breakfast';
  ELSE
    v_allowed := private.allowed_categories('food');
    v_wildcard := 'flexible';
  END IF;

  WITH categories(category, sort_order) AS (
    SELECT c, ord FROM unnest(v_allowed) WITH ORDINALITY AS t(c, ord)
  ), tallied AS (
    SELECT c.category, c.sort_order,
      count(p.id) FILTER (WHERE c.category = ANY(fc.selected_categories) OR v_wildcard = ANY(fc.selected_categories))::int acceptance
    FROM categories c
    LEFT JOIN public.participants p ON p.room_id = requested_room_id AND p.status = 'active'
    LEFT JOIN public.food_choices fc ON fc.room_id = requested_room_id AND fc.participant_id = p.id AND fc.is_submitted
    GROUP BY c.category, c.sort_order
  )
  SELECT jsonb_object_agg(category, acceptance ORDER BY sort_order) INTO v_result FROM tallied;

  RETURN coalesce(v_result, '{}'::jsonb);
END;
$$;

-- 5. Updated private.room_state including suggestions
CREATE OR REPLACE FUNCTION private.room_state(requested_room_id uuid, requested_participant_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
  SELECT jsonb_build_object(
    'room', to_jsonb(r),
    'myCategorySelection', (
      SELECT jsonb_build_object('id',fc.id,'room_id',fc.room_id,'participant_id',fc.participant_id,
        'selected_categories',fc.selected_categories,'is_submitted',fc.is_submitted,
        'submitted_at',fc.submitted_at,'created_at',fc.created_at,'updated_at',fc.updated_at)
      FROM public.food_choices fc WHERE fc.room_id=r.id AND fc.participant_id=requested_participant_id
    ),
    'myVotes', coalesce((
      SELECT jsonb_object_agg(s.restaurant_id, s.vote)
      FROM public.restaurant_swipes s
      JOIN private.room_restaurant_decks d ON d.id=s.deck_id
      WHERE s.room_id=r.id AND s.participant_id=requested_participant_id
        AND d.round_started_at=r.swiping_started_at
        AND d.generation=(SELECT max(x.generation) FROM private.room_restaurant_decks x WHERE x.room_id=r.id AND x.round_started_at=r.swiping_started_at)
    ), '{}'::jsonb),
    'suggestions', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'target', s.target,
        'participant_id', s.participant_id,
        'nickname', p.nickname,
        'player_color', p.player_color,
        'player_shape', p.player_shape
      ) ORDER BY s.created_at)
      FROM private.room_suggestions s
      JOIN public.participants p ON p.id = s.participant_id
      WHERE s.room_id = r.id AND p.status = 'active'
    ), '[]'::jsonb)
  ) FROM public.rooms r WHERE r.id=requested_room_id
$$;

-- 6. Mode-aware submit_category_selection
CREATE OR REPLACE FUNCTION public.submit_category_selection(
  p_room_id uuid,p_session_token text,p_expected_version bigint,p_categories text[]
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  current_participant_id uuid; room_row public.rooms%ROWTYPE; active_count int; submitted_count int; tally jsonb;
  max_acceptance int; winners text[]; category_status text; winner text;
  is_all_wildcard boolean := false; derived_categories text[];
  v_mode text; v_wildcard text; v_allowed text[];
BEGIN
  current_participant_id:=private.room_participant(p_room_id,p_session_token,false);
  SELECT * INTO room_row FROM public.rooms WHERE id=p_room_id FOR UPDATE;
  IF room_row.version<>p_expected_version THEN RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE='PT409'; END IF;
  IF room_row.stage<>'voting' THEN RAISE EXCEPTION 'WSH_INVALID_ROOM_STAGE' USING ERRCODE='PT409'; END IF;

  v_mode := coalesce(room_row.room_mode, 'food');
  IF v_mode = 'cafes' THEN
    RAISE EXCEPTION 'WSH_CATEGORIES_NOT_ALLOWED_IN_CAFES' USING ERRCODE='22023';
  END IF;

  IF NOT private.valid_category_selection(p_categories, v_mode) THEN
    RAISE EXCEPTION 'WSH_INVALID_CATEGORY_SELECTION' USING ERRCODE='22023';
  END IF;

  v_wildcard := CASE WHEN v_mode = 'breakfast' THEN 'any_breakfast' ELSE 'flexible' END;
  v_allowed := private.allowed_categories(v_mode);

  INSERT INTO public.food_choices(room_id,participant_id,selected_categories,is_submitted,submitted_at,updated_at,selection_version)
  VALUES(p_room_id,current_participant_id,p_categories,true,now(),now(),p_expected_version+1)
  ON CONFLICT(room_id,participant_id) DO UPDATE SET selected_categories=excluded.selected_categories,is_submitted=true,
    submitted_at=now(),updated_at=now(),selection_version=excluded.selection_version;

  SELECT count(*)::int INTO active_count FROM public.participants WHERE room_id=p_room_id AND status='active';
  SELECT count(*)::int INTO submitted_count FROM public.food_choices fc JOIN public.participants p ON p.id=fc.participant_id
    WHERE fc.room_id=p_room_id AND fc.is_submitted AND p.status='active';
  tally:=private.category_tally(p_room_id);
  category_status:='pending'; winners:='{}'; winner:=NULL;

  IF submitted_count=active_count AND active_count>0 THEN
    -- Check if all active submitted participants chose the mode wildcard exclusively
    is_all_wildcard := NOT EXISTS (
      SELECT 1 FROM public.food_choices fc
      JOIN public.participants p ON p.id=fc.participant_id
      WHERE fc.room_id=p_room_id AND fc.is_submitted AND p.status='active'
        AND (fc.selected_categories IS NULL OR fc.selected_categories <> ARRAY[v_wildcard]::text[])
    );

    IF is_all_wildcard THEN
      IF v_mode = 'breakfast' THEN
        -- Breakfast wildcard derives only active breakfast categories
        derived_categories := v_allowed;
      ELSE
        -- Food wildcard authoritatively derives active valid real categories for this room's city
        SELECT array_agg(DISTINCT cat ORDER BY cat) INTO derived_categories
        FROM (
          SELECT unnest(r.categories) AS cat
          FROM public.restaurants r
          WHERE lower(r.city) = lower(room_row.city)
            AND r.operating_status NOT IN ('temporarily_closed', 'permanently_closed')
            AND r.research_use IN ('production_ready', 'usable_with_caution')
        ) sub
        WHERE cat <> 'flexible'
          AND cat = ANY(v_allowed);

        IF derived_categories IS NULL OR cardinality(derived_categories) < 2 THEN
          derived_categories := v_allowed;
        END IF;
      END IF;

      category_status := 'tie';
      winners := derived_categories;
      UPDATE public.rooms SET stage='tiebreaker',current_stage='tiebreaker',winning_category=NULL,
        consensus_type=NULL,tied_categories=winners,version=version+1 WHERE id=p_room_id;
    ELSE
      SELECT max(value::text::int) INTO max_acceptance FROM jsonb_each(tally);
      SELECT array_agg(key ORDER BY array_position(v_allowed, key)) INTO winners
      FROM jsonb_each(tally) WHERE value::text::int=max_acceptance;

      IF cardinality(winners)=1 THEN
        winner:=winners[1];category_status:='decided';
        UPDATE public.rooms SET stage='consensus',current_stage='consensus',winning_category=winner,
          consensus_type=CASE WHEN max_acceptance=active_count THEN 'unanimous' ELSE 'majority_tiebreak' END,
          tied_categories='{}',version=version+1 WHERE id=p_room_id;
      ELSE
        category_status:='tie';
        UPDATE public.rooms SET stage='tiebreaker',current_stage='tiebreaker',winning_category=NULL,
          consensus_type=NULL,tied_categories=winners,version=version+1 WHERE id=p_room_id;
      END IF;
    END IF;
  ELSE
    UPDATE public.rooms SET version=version+1 WHERE id=p_room_id;
  END IF;

  UPDATE public.rooms SET category_summary=jsonb_build_object(
    'status',category_status,
    'eligibleParticipantCount',active_count,
    'submittedCount',submitted_count,
    'submittedParticipantIds',coalesce((SELECT jsonb_agg(p.id ORDER BY p.id) FROM public.food_choices fc JOIN public.participants p ON p.id=fc.participant_id WHERE fc.room_id=p_room_id AND fc.is_submitted AND p.status='active'),'[]'::jsonb),
    'tally',tally,
    'winner',winner,
    'tiedCategories',coalesce(winners,'{}'),
    'allWildcard',is_all_wildcard
  ) WHERE id=p_room_id;

  RETURN private.room_state(p_room_id,current_participant_id);
END;
$$;

-- 7. Authoritative host RPC: switch_room_mode
CREATE OR REPLACE FUNCTION public.switch_room_mode(
  p_room_id uuid,
  p_session_token text,
  p_expected_version bigint,
  p_new_mode text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  host_id uuid;
  room_row public.rooms%ROWTYPE;
  host_nickname text;
BEGIN
  host_id := private.room_participant(p_room_id, p_session_token, true);
  SELECT * INTO room_row FROM public.rooms WHERE id = p_room_id FOR UPDATE;

  IF room_row.version <> p_expected_version THEN
    RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE = 'PT409';
  END IF;

  IF p_new_mode NOT IN ('food', 'breakfast', 'cafes') THEN
    RAISE EXCEPTION 'WSH_INVALID_ROOM_MODE' USING ERRCODE = '22023';
  END IF;

  -- Idempotent no-op check
  IF room_row.room_mode = p_new_mode THEN
    RETURN private.room_state(p_room_id, host_id);
  END IF;

  SELECT nickname INTO host_nickname FROM public.participants WHERE id = host_id;

  -- Strict Mode Switching Clearing Rules:
  -- Clear old category selections, old swipes, room preferences, and guest suggestions
  DELETE FROM public.food_choices WHERE room_id = p_room_id;
  DELETE FROM public.restaurant_swipes WHERE room_id = p_room_id;
  DELETE FROM private.room_suggestions WHERE room_id = p_room_id;

  IF p_new_mode IN ('food', 'breakfast') THEN
    UPDATE public.rooms SET
      room_mode = p_new_mode,
      preferences = '{}',
      stage = 'voting',
      current_stage = 'voting',
      status = 'food_selection',
      winning_category = NULL,
      consensus_type = NULL,
      tied_categories = '{}',
      winning_restaurant_id = NULL,
      winning_deck_id = NULL,
      winning_branch_id = NULL,
      winning_resolution_method = NULL,
      finalized_at = NULL,
      swiping_started_at = NULL,
      restaurant_state = 'idle',
      restaurant_summary = '{}',
      last_mode_changed_by_participant_id = host_id,
      last_mode_changed_by_nickname = host_nickname,
      last_mode_changed_at = now(),
      version = version + 1
    WHERE id = p_room_id;

    UPDATE public.rooms SET
      category_summary = private.category_state(p_room_id)
    WHERE id = p_room_id;
  ELSIF p_new_mode = 'cafes' THEN
    -- In Cafes mode: immediately enters swiping without normal food deck generation
    UPDATE public.rooms SET
      room_mode = 'cafes',
      preferences = '{}',
      stage = 'swiping',
      current_stage = 'swiping',
      status = 'restaurant_selection',
      winning_category = NULL,
      consensus_type = NULL,
      tied_categories = '{}',
      winning_restaurant_id = NULL,
      winning_deck_id = NULL,
      winning_branch_id = NULL,
      winning_resolution_method = NULL,
      finalized_at = NULL,
      swiping_started_at = now(),
      restaurant_state = 'voting',
      category_summary = '{}',
      restaurant_summary = '{}',
      last_mode_changed_by_participant_id = host_id,
      last_mode_changed_by_nickname = host_nickname,
      last_mode_changed_at = now(),
      version = version + 1
    WHERE id = p_room_id;
  END IF;

  RETURN private.room_state(p_room_id, host_id);
END;
$$;

-- 8. Authoritative host RPC: set_room_preference
CREATE OR REPLACE FUNCTION public.set_room_preference(
  p_room_id uuid,
  p_session_token text,
  p_expected_version bigint,
  p_preference text,
  p_enabled boolean
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  host_id uuid;
  room_row public.rooms%ROWTYPE;
  new_preferences text[];
BEGIN
  host_id := private.room_participant(p_room_id, p_session_token, true);
  SELECT * INTO room_row FROM public.rooms WHERE id = p_room_id FOR UPDATE;

  IF room_row.version <> p_expected_version THEN
    RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE = 'PT409';
  END IF;

  IF p_preference NOT IN ('healthy', 'nearby') THEN
    RAISE EXCEPTION 'WSH_INVALID_PREFERENCE' USING ERRCODE = '22023';
  END IF;

  IF p_enabled THEN
    SELECT array_agg(DISTINCT item) INTO new_preferences
    FROM unnest(array_append(coalesce(room_row.preferences, '{}'), p_preference)) item;
    -- Automatically clear any matching guest suggestion for this applied preference
    DELETE FROM private.room_suggestions
    WHERE room_id = p_room_id AND target = ('preference:' || p_preference);
  ELSE
    SELECT array_agg(item) INTO new_preferences
    FROM unnest(coalesce(room_row.preferences, '{}')) item
    WHERE item <> p_preference;
  END IF;

  UPDATE public.rooms SET
    preferences = coalesce(new_preferences, '{}'),
    version = version + 1
  WHERE id = p_room_id;

  RETURN private.room_state(p_room_id, host_id);
END;
$$;

-- 9. Authoritative guest RPC: toggle_room_suggestion
CREATE OR REPLACE FUNCTION public.toggle_room_suggestion(
  p_room_id uuid,
  p_session_token text,
  p_target text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  part_id uuid;
  is_host_participant boolean;
  existing_id uuid;
BEGIN
  part_id := private.room_participant(p_room_id, p_session_token, false);

  -- Host does not suggest: host triggers authoritative actions
  SELECT is_host INTO is_host_participant FROM public.participants WHERE id = part_id;
  IF is_host_participant THEN
    RAISE EXCEPTION 'WSH_HOST_CANNOT_SUGGEST' USING ERRCODE = '22023';
  END IF;

  -- Validate target
  IF p_target IS NULL OR length(p_target) < 1 OR length(p_target) > 64
     OR p_target !~ '^(mode:(food|breakfast|cafes)|preference:(healthy|nearby)|action:(spin_again|show_another_7|choose_another_category|try_another_restaurant))$'
  THEN
    RAISE EXCEPTION 'WSH_INVALID_SUGGESTION_TARGET' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO existing_id FROM private.room_suggestions
  WHERE room_id = p_room_id AND participant_id = part_id AND target = p_target;

  IF existing_id IS NOT NULL THEN
    -- Toggle off (withdrawn)
    DELETE FROM private.room_suggestions WHERE id = existing_id;
  ELSE
    -- Toggle on (active suggestion)
    INSERT INTO private.room_suggestions(room_id, participant_id, target)
    VALUES (p_room_id, part_id, p_target)
    ON CONFLICT (room_id, participant_id, target) DO NOTHING;
  END IF;

  RETURN private.room_state(p_room_id, part_id);
END;
$$;

-- 10. Update join_room_authorized to allow joins in Cafes mode (stage = 'swiping')
CREATE OR REPLACE FUNCTION public.join_room_authorized(p_code text, p_session_token text, p_nickname text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE room_row public.rooms%ROWTYPE; participant_row public.participants%ROWTYPE; participant_count int;
BEGIN
  IF p_session_token IS NULL OR length(p_session_token)<16 OR nullif(trim(p_nickname),'') IS NULL THEN
    RAISE EXCEPTION 'WSH_INVALID_JOIN_INPUT' USING ERRCODE='22023';
  END IF;
  SELECT * INTO room_row FROM public.rooms WHERE code=upper(trim(p_code)) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'WSH_ROOM_NOT_FOUND' USING ERRCODE='22023'; END IF;
  IF room_row.created_at <= now()-interval '30 minutes' OR room_row.expires_at<=now() THEN RAISE EXCEPTION 'WSH_ROOM_EXPIRED' USING ERRCODE='PT409'; END IF;
  SELECT * INTO participant_row FROM public.participants WHERE room_id=room_row.id AND session_token=p_session_token;
  IF FOUND THEN RETURN jsonb_build_object('room',to_jsonb(room_row),'participant',to_jsonb(participant_row)); END IF;

  -- Allow joining in lobby, voting, or during Cafes swiping
  IF room_row.stage NOT IN ('lobby','voting') AND NOT (room_row.room_mode = 'cafes' AND room_row.stage = 'swiping') THEN
    RAISE EXCEPTION 'WSH_INVALID_ROOM_STAGE' USING ERRCODE='PT409';
  END IF;

  SELECT count(*)::int INTO participant_count FROM public.participants WHERE room_id=room_row.id AND status='active';
  IF participant_count>=10 THEN RAISE EXCEPTION 'WSH_ROOM_FULL' USING ERRCODE='PT409'; END IF;
  INSERT INTO public.participants(room_id,session_token,nickname,player_color,player_shape,is_host,status)
  VALUES(room_row.id,p_session_token,trim(p_nickname),(ARRAY['#55B96A','#F0443E','#FFD75A','#73C8EA','#9B86EC','#F6A6AD','#E5D3B3'])[participant_count%7+1],
    (ARRAY['scallop','squircle','circle','diamond','hexagon'])[participant_count%5+1],false,'active') RETURNING * INTO participant_row;

  IF room_row.stage='voting' THEN
    UPDATE public.rooms SET version=version+1,category_summary=private.category_state(room_row.id)
    WHERE id=room_row.id RETURNING * INTO room_row;
  ELSE
    UPDATE public.rooms SET version=version+1
    WHERE id=room_row.id RETURNING * INTO room_row;
  END IF;

  RETURN jsonb_build_object('room',to_jsonb(room_row),'participant',to_jsonb(participant_row));
END;
$$;

-- 11. Update reset_room_state_authorized to clear preferences and suggestions
CREATE OR REPLACE FUNCTION public.reset_room_state_authorized(
  p_room_id uuid,p_session_token text,p_expected_version bigint,p_target_stage text DEFAULT 'voting'
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE participant_id uuid; room_row public.rooms%ROWTYPE;
BEGIN
  participant_id:=private.room_participant(p_room_id,p_session_token,true);
  SELECT * INTO room_row FROM public.rooms WHERE id=p_room_id FOR UPDATE;
  IF room_row.version<>p_expected_version THEN RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE='PT409'; END IF;
  IF p_target_stage NOT IN ('lobby','voting') THEN RAISE EXCEPTION 'WSH_INVALID_ROOM_STAGE' USING ERRCODE='22023'; END IF;

  DELETE FROM public.restaurant_swipes WHERE room_id=p_room_id;
  DELETE FROM public.food_choices WHERE room_id=p_room_id;
  DELETE FROM public.order_items WHERE room_id=p_room_id;
  DELETE FROM private.room_suggestions WHERE room_id=p_room_id;

  UPDATE public.rooms SET
    stage=p_target_stage,current_stage=p_target_stage,
    status=CASE WHEN p_target_stage='lobby' THEN 'lobby' ELSE 'food_selection' END,
    preferences='{}',
    winning_category=NULL,consensus_type=NULL,tied_categories='{}',winning_restaurant_id=NULL,swiping_started_at=NULL,
    category_summary='{}',restaurant_state='idle',restaurant_summary='{}',winning_deck_id=NULL,winning_branch_id=NULL,
    winning_resolution_method=NULL,finalized_at=NULL,version=version+1
  WHERE id=p_room_id;

  IF p_target_stage = 'voting' AND coalesce(room_row.room_mode, 'food') IN ('food', 'breakfast') THEN
    UPDATE public.rooms SET category_summary=private.category_state(p_room_id) WHERE id=p_room_id;
  END IF;

  RETURN private.room_state(p_room_id,participant_id);
END;
$$;

-- 12. Suggestion clearing hooks on tie resolution
CREATE OR REPLACE FUNCTION public.resolve_category_tie(
  p_room_id uuid,p_session_token text,p_expected_version bigint,p_method text,p_category text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE participant_id uuid; room_row public.rooms%ROWTYPE; selected_category text;
BEGIN
  participant_id:=private.room_participant(p_room_id,p_session_token,true);
  SELECT * INTO room_row FROM public.rooms WHERE id=p_room_id FOR UPDATE;
  IF room_row.version<>p_expected_version THEN RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE='PT409'; END IF;
  IF room_row.stage<>'tiebreaker' OR cardinality(room_row.tied_categories)<2 THEN RAISE EXCEPTION 'WSH_NO_CATEGORY_TIE' USING ERRCODE='PT409'; END IF;
  IF p_method='host_pick' THEN
    IF p_category IS NULL OR NOT p_category=ANY(room_row.tied_categories) THEN RAISE EXCEPTION 'WSH_CATEGORY_NOT_IN_TIE' USING ERRCODE='22023'; END IF;
    selected_category:=p_category;
  ELSIF p_method='choose_for_us' THEN
    selected_category:=private.secure_fair_draw('category', room_row.tied_categories);
  ELSE RAISE EXCEPTION 'WSH_INVALID_RESOLUTION_METHOD' USING ERRCODE='22023'; END IF;

  -- Clear relevant suggestions
  DELETE FROM private.room_suggestions
  WHERE room_id = p_room_id AND target IN ('action:spin_again', 'action:choose_another_category');

  UPDATE public.rooms SET stage='consensus',current_stage='consensus',winning_category=selected_category,
    consensus_type=CASE WHEN p_method='host_pick' THEN 'host_picked' ELSE 'random_picked' END,
    tied_categories='{}',category_summary=category_summary||jsonb_build_object('status','decided','winner',selected_category,'tiedCategories','[]'::jsonb),
    version=version+1 WHERE id=p_room_id;
  RETURN private.room_state(p_room_id,participant_id);
END
$$;

CREATE OR REPLACE FUNCTION public.resolve_restaurant_tie(
  p_room_id uuid,p_session_token text,p_expected_version bigint,p_method text,p_restaurant_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE participant_id uuid; room_row public.rooms%ROWTYPE; selected_id text; tied_ids text[];
BEGIN
  participant_id:=private.room_participant(p_room_id,p_session_token,true);
  SELECT * INTO room_row FROM public.rooms WHERE id=p_room_id FOR UPDATE;
  IF room_row.version<>p_expected_version THEN RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE='PT409'; END IF;
  IF room_row.stage<>'swiping' OR room_row.restaurant_state<>'tie' OR room_row.finalized_at IS NOT NULL THEN RAISE EXCEPTION 'WSH_NO_RESTAURANT_TIE' USING ERRCODE='PT409'; END IF;
  SELECT array_agg(value) INTO tied_ids FROM jsonb_array_elements_text(room_row.restaurant_summary->'tiedRestaurantIds');
  IF cardinality(tied_ids)<2 THEN RAISE EXCEPTION 'WSH_NO_RESTAURANT_TIE' USING ERRCODE='PT409'; END IF;
  IF p_method='host_pick' THEN
    IF p_restaurant_id IS NULL OR NOT p_restaurant_id=ANY(tied_ids) THEN RAISE EXCEPTION 'WSH_CANDIDATE_NOT_IN_TIE' USING ERRCODE='22023'; END IF;
    selected_id:=p_restaurant_id;
  ELSIF p_method='choose_for_us' THEN
    selected_id:=private.secure_fair_draw('restaurant', tied_ids);
  ELSIF p_method='sudden_death' THEN
    IF p_restaurant_id IS NULL OR NOT p_restaurant_id=ANY(tied_ids) THEN RAISE EXCEPTION 'WSH_CANDIDATE_NOT_IN_TIE' USING ERRCODE='22023'; END IF;
    selected_id:=p_restaurant_id;
  ELSE
    RAISE EXCEPTION 'WSH_INVALID_RESOLUTION_METHOD' USING ERRCODE='22023';
  END IF;

  -- Clear relevant suggestions
  DELETE FROM private.room_suggestions
  WHERE room_id = p_room_id AND target IN ('action:spin_again', 'action:try_another_restaurant');

  PERFORM private.finalize_restaurant(p_room_id,(room_row.restaurant_summary->>'deckId')::uuid,selected_id,p_method);
  RETURN private.room_state(p_room_id,participant_id);
END
$$;

-- 13. Permissions and grants
REVOKE ALL ON FUNCTION private.allowed_categories(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.valid_category_selection(text[], text) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.switch_room_mode(uuid, text, bigint, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_room_preference(uuid, text, bigint, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.toggle_room_suggestion(uuid, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.switch_room_mode(uuid, text, bigint, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_room_preference(uuid, text, bigint, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_room_suggestion(uuid, text, text) TO anon, authenticated;

COMMIT;
