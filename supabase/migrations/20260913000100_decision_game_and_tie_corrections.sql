-- 20260913000100_decision_game_and_tie_corrections.sql
-- Decision Game & Restaurant Tie Corrections:
-- 1. Disallow mixed wildcard category selection (flexible must be strictly exclusive).
-- 2. Derive eligible room categories authoritatively when all participants choose Anything.
-- 3. Update rooms.winning_resolution_method check to permit 'sudden_death'.
-- 4. Update resolve_restaurant_tie to accept 'sudden_death'.

CREATE OR REPLACE FUNCTION private.valid_category_selection(value text[]) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog AS $$
  SELECT value IS NOT NULL
    AND cardinality(value) BETWEEN 1 AND 21
    AND cardinality(value) = (SELECT count(DISTINCT item) FROM unnest(value) item)
    AND NOT EXISTS (
      SELECT 1 FROM unnest(value) item
      WHERE item IS NULL OR item <> ALL (ARRAY[
        'burger','shawarma','fried_chicken','broast','rice','grill','pizza','sushi',
        'italian','asian','seafood','breakfast','healthy','coffee','dessert','indian',
        'fatayer','street_folk','mexican','sandwiches','flexible'
      ]::text[])
    )
    AND NOT ('flexible' = ANY(value) AND cardinality(value) > 1)
$$;

ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_winning_resolution_method_check;
ALTER TABLE public.rooms ADD CONSTRAINT rooms_winning_resolution_method_check
  CHECK (winning_resolution_method IS NULL OR winning_resolution_method IN ('normal_consensus', 'choose_for_us', 'host_pick', 'sudden_death'));

CREATE OR REPLACE FUNCTION private.category_state(requested_room_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
  SELECT jsonb_build_object(
    'status', CASE WHEN r.stage = 'tiebreaker' THEN 'tie' WHEN r.stage IN ('consensus','swiping','matched') THEN 'decided' ELSE 'pending' END,
    'eligibleParticipantCount', (SELECT count(*) FROM public.participants p WHERE p.room_id = r.id AND p.status = 'active'),
    'submittedCount', (SELECT count(*) FROM public.food_choices fc JOIN public.participants p ON p.id = fc.participant_id WHERE fc.room_id = r.id AND fc.is_submitted AND p.status = 'active'),
    'submittedParticipantIds', coalesce((SELECT jsonb_agg(p.id ORDER BY p.id) FROM public.food_choices fc JOIN public.participants p ON p.id=fc.participant_id WHERE fc.room_id=r.id AND fc.is_submitted AND p.status='active'),'[]'::jsonb),
    'tally', private.category_tally(r.id),
    'winner', r.winning_category,
    'tiedCategories', r.tied_categories,
    'allWildcard', coalesce((r.category_summary->>'allWildcard')::boolean, false)
  )
  FROM public.rooms r WHERE r.id = requested_room_id
$$;

CREATE OR REPLACE FUNCTION public.submit_category_selection(
  p_room_id uuid,p_session_token text,p_expected_version bigint,p_categories text[]
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  current_participant_id uuid; room_row public.rooms%ROWTYPE; active_count int; submitted_count int; tally jsonb;
  max_acceptance int; winners text[]; category_status text; winner text;
  is_all_wildcard boolean := false; derived_categories text[];
BEGIN
  current_participant_id:=private.room_participant(p_room_id,p_session_token,false);
  SELECT * INTO room_row FROM public.rooms WHERE id=p_room_id FOR UPDATE;
  IF room_row.version<>p_expected_version THEN RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE='PT409'; END IF;
  IF room_row.stage<>'voting' THEN RAISE EXCEPTION 'WSH_INVALID_ROOM_STAGE' USING ERRCODE='PT409'; END IF;
  IF NOT private.valid_category_selection(p_categories) THEN RAISE EXCEPTION 'WSH_INVALID_CATEGORY_SELECTION' USING ERRCODE='22023'; END IF;
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
    -- Check if all active submitted participants chose 'flexible' exclusively
    is_all_wildcard := NOT EXISTS (
      SELECT 1 FROM public.food_choices fc
      JOIN public.participants p ON p.id=fc.participant_id
      WHERE fc.room_id=p_room_id AND fc.is_submitted AND p.status='active'
        AND (fc.selected_categories IS NULL OR fc.selected_categories <> ARRAY['flexible']::text[])
    );

    IF is_all_wildcard THEN
      -- Authoritatively derive active valid real categories for this room's city
      SELECT array_agg(DISTINCT cat ORDER BY cat) INTO derived_categories
      FROM (
        SELECT unnest(r.categories) AS cat
        FROM public.restaurants r
        WHERE lower(r.city) = lower(room_row.city)
          AND r.operating_status NOT IN ('temporarily_closed', 'permanently_closed')
          AND r.research_use IN ('production_ready', 'usable_with_caution')
      ) sub
      WHERE cat <> 'flexible'
        AND cat = ANY(ARRAY[
          'burger','shawarma','fried_chicken','broast','rice','grill','pizza','sushi',
          'italian','asian','seafood','breakfast','healthy','coffee','dessert','indian',
          'fatayer','street_folk','mexican','sandwiches'
        ]::text[]);

      IF derived_categories IS NULL OR cardinality(derived_categories) < 2 THEN
        derived_categories := ARRAY[
          'burger','shawarma','fried_chicken','broast','rice','grill','pizza','sushi',
          'italian','asian','seafood','breakfast','healthy','coffee','dessert','indian',
          'fatayer','street_folk','mexican','sandwiches'
        ]::text[];
      END IF;

      category_status := 'tie';
      winners := derived_categories;
      UPDATE public.rooms SET stage='tiebreaker',current_stage='tiebreaker',winning_category=NULL,
        consensus_type=NULL,tied_categories=winners,version=version+1 WHERE id=p_room_id;
    ELSE
      SELECT max(value::text::int) INTO max_acceptance FROM jsonb_each(tally);
      SELECT array_agg(key ORDER BY array_position(ARRAY[
        'burger','shawarma','fried_chicken','broast','rice','grill','pizza','sushi','italian','asian','seafood','breakfast',
        'healthy','coffee','dessert','indian','fatayer','street_folk','mexican','sandwiches'
      ]::text[],key)) INTO winners FROM jsonb_each(tally) WHERE value::text::int=max_acceptance;
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
    selected_id:=tied_ids[1+floor(random()*cardinality(tied_ids))::int];
  ELSIF p_method='sudden_death' THEN
    IF p_restaurant_id IS NULL OR NOT p_restaurant_id=ANY(tied_ids) THEN RAISE EXCEPTION 'WSH_CANDIDATE_NOT_IN_TIE' USING ERRCODE='22023'; END IF;
    selected_id:=p_restaurant_id;
  ELSE
    RAISE EXCEPTION 'WSH_INVALID_RESOLUTION_METHOD' USING ERRCODE='22023';
  END IF;
  PERFORM private.finalize_restaurant(p_room_id,(room_row.restaurant_summary->>'deckId')::uuid,selected_id,p_method);
  RETURN private.room_state(p_room_id,participant_id);
END
$$;
