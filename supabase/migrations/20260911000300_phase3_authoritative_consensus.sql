-- WeshNakul Phase 3: private, server-authoritative consensus and decisions.
BEGIN;

ALTER TABLE public.rooms
  ADD COLUMN version bigint NOT NULL DEFAULT 0 CHECK (version >= 0),
  ADD COLUMN category_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN restaurant_state text NOT NULL DEFAULT 'idle'
    CHECK (restaurant_state IN ('idle', 'voting', 'tie', 'no_match', 'decided')),
  ADD COLUMN restaurant_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN winning_deck_id uuid REFERENCES private.room_restaurant_decks(id),
  ADD COLUMN winning_branch_id uuid REFERENCES public.restaurant_branches(id),
  ADD COLUMN winning_resolution_method text
    CHECK (winning_resolution_method IN ('normal_consensus', 'choose_for_us', 'host_pick')),
  ADD COLUMN finalized_at timestamptz;

CREATE FUNCTION private.valid_category_selection(value text[]) RETURNS boolean
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
$$;

ALTER TABLE public.food_choices
  ADD COLUMN selection_version bigint NOT NULL DEFAULT 0,
  ADD CONSTRAINT food_choices_valid_categories CHECK (NOT is_submitted OR private.valid_category_selection(selected_categories));

ALTER TABLE public.restaurant_swipes
  ADD COLUMN deck_id uuid REFERENCES private.room_restaurant_decks(id),
  ADD COLUMN deck_position smallint,
  ADD COLUMN vote text,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
UPDATE public.restaurant_swipes SET vote = CASE WHEN liked THEN 'YES' ELSE 'NO' END WHERE vote IS NULL;
ALTER TABLE public.restaurant_swipes
  ALTER COLUMN liked DROP NOT NULL,
  ADD CONSTRAINT restaurant_swipes_vote_check CHECK (vote IN ('YES', 'NO', 'LATER')),
  ADD CONSTRAINT restaurant_swipes_position_check CHECK (deck_position IS NULL OR deck_position BETWEEN 1 AND 7);
CREATE UNIQUE INDEX restaurant_swipes_current_card_unique
  ON public.restaurant_swipes (room_id, participant_id, deck_id, restaurant_id)
  WHERE deck_id IS NOT NULL;

CREATE FUNCTION private.room_participant(
  requested_room_id uuid,
  requested_session_token text,
  require_host boolean DEFAULT false
) RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE participant_id uuid;
BEGIN
  SELECT p.id INTO participant_id
  FROM public.participants p
  JOIN public.rooms r ON r.id = p.room_id
  WHERE p.room_id = requested_room_id
    AND p.session_token = requested_session_token
    AND p.status = 'active'
    AND (NOT require_host OR (p.is_host AND r.host_participant_id = p.id))
    AND r.created_at > now() - interval '30 minutes'
    AND r.expires_at > now();
  IF participant_id IS NULL THEN
    RAISE EXCEPTION 'WSH_UNAUTHORIZED_PARTICIPANT' USING ERRCODE = '42501';
  END IF;
  RETURN participant_id;
END
$$;

CREATE FUNCTION private.category_tally(requested_room_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  WITH categories(category, sort_order) AS (
    SELECT * FROM unnest(ARRAY[
      'burger','shawarma','fried_chicken','broast','rice','grill','pizza','sushi',
      'italian','asian','seafood','breakfast','healthy','coffee','dessert','indian',
      'fatayer','street_folk','mexican','sandwiches'
    ]::text[]) WITH ORDINALITY
  ), tallied AS (
    SELECT c.category, c.sort_order,
      count(p.id) FILTER (WHERE c.category = ANY(fc.selected_categories) OR 'flexible' = ANY(fc.selected_categories))::int acceptance
    FROM categories c
    LEFT JOIN public.participants p ON p.room_id = requested_room_id AND p.status = 'active'
    LEFT JOIN public.food_choices fc ON fc.room_id = requested_room_id AND fc.participant_id = p.id AND fc.is_submitted
    GROUP BY c.category, c.sort_order
  )
  SELECT jsonb_object_agg(category, acceptance ORDER BY sort_order) FROM tallied
$$;

CREATE FUNCTION private.category_state(requested_room_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
  SELECT jsonb_build_object(
    'status', CASE WHEN r.stage = 'tiebreaker' THEN 'tie' WHEN r.stage IN ('consensus','swiping','matched') THEN 'decided' ELSE 'pending' END,
    'eligibleParticipantCount', (SELECT count(*) FROM public.participants p WHERE p.room_id = r.id AND p.status = 'active'),
    'submittedCount', (SELECT count(*) FROM public.food_choices fc JOIN public.participants p ON p.id = fc.participant_id WHERE fc.room_id = r.id AND fc.is_submitted AND p.status = 'active'),
    'submittedParticipantIds', coalesce((SELECT jsonb_agg(p.id ORDER BY p.id) FROM public.food_choices fc JOIN public.participants p ON p.id=fc.participant_id WHERE fc.room_id=r.id AND fc.is_submitted AND p.status='active'),'[]'::jsonb),
    'tally', private.category_tally(r.id),
    'winner', r.winning_category,
    'tiedCategories', r.tied_categories
  )
  FROM public.rooms r WHERE r.id = requested_room_id
$$;

CREATE FUNCTION private.room_state(requested_room_id uuid, requested_participant_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
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
    ), '{}'::jsonb)
  ) FROM public.rooms r WHERE r.id=requested_room_id
$$;

CREATE FUNCTION private.restaurant_state(requested_room_id uuid, requested_deck_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
  WITH active AS (
    SELECT id FROM public.participants WHERE room_id=requested_room_id AND status='active'
  ), cards AS (
    SELECT i.position, i.restaurant_id,
      count(*) FILTER (WHERE s.vote='YES')::int yes_count,
      count(*) FILTER (WHERE s.vote='NO')::int no_count,
      count(*) FILTER (WHERE s.vote='LATER')::int later_count
    FROM private.room_restaurant_deck_items i
    LEFT JOIN public.restaurant_swipes s ON s.deck_id=i.deck_id AND s.restaurant_id=i.restaurant_id
      AND s.participant_id IN (SELECT id FROM active)
    WHERE i.deck_id=requested_deck_id
    GROUP BY i.position,i.restaurant_id
  ), progress AS (
    SELECT p.id participant_id,
      count(s.id) FILTER (WHERE s.vote IN ('YES','NO'))::int decided_count,
      count(s.id) FILTER (WHERE s.vote='LATER')::int later_count
    FROM active p
    LEFT JOIN public.restaurant_swipes s ON s.participant_id=p.id AND s.deck_id=requested_deck_id
    GROUP BY p.id
  )
  SELECT jsonb_build_object(
    'status', r.restaurant_state,
    'deckId', d.id,
    'generation', d.generation,
    'eligibleParticipantCount', (SELECT count(*) FROM active),
    'completedParticipantCount', (SELECT count(*) FROM progress WHERE decided_count=(SELECT count(*) FROM cards)),
    'cards', coalesce((SELECT jsonb_agg(jsonb_build_object(
      'position',position,'restaurantId',restaurant_id,'yesCount',yes_count,'noCount',no_count,'laterCount',later_count
    ) ORDER BY position) FROM cards), '[]'::jsonb),
    'participantProgress', coalesce((SELECT jsonb_agg(jsonb_build_object(
      'participantId',participant_id,'decidedCount',decided_count,'laterCount',later_count,
      'complete',decided_count=(SELECT count(*) FROM cards)
    ) ORDER BY participant_id) FROM progress), '[]'::jsonb),
    'tiedRestaurantIds', coalesce(r.restaurant_summary->'tiedRestaurantIds','[]'::jsonb),
    'winnerRestaurantId', r.winning_restaurant_id
  )
  FROM public.rooms r JOIN private.room_restaurant_decks d ON d.id=requested_deck_id
  WHERE r.id=requested_room_id
$$;

CREATE FUNCTION private.finalize_restaurant(
  requested_room_id uuid,
  requested_deck_id uuid,
  requested_restaurant_id text,
  requested_method text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE selected_branch uuid; final_summary jsonb;
BEGIN
  SELECT i.branch_id INTO selected_branch FROM private.room_restaurant_deck_items i
  WHERE i.deck_id=requested_deck_id AND i.restaurant_id=requested_restaurant_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'WSH_INVALID_RECOMMENDATION_CARD' USING ERRCODE='22023'; END IF;
  final_summary := private.restaurant_state(requested_room_id, requested_deck_id)
    || jsonb_build_object('status','decided','winnerRestaurantId',requested_restaurant_id,'resolutionMethod',requested_method);
  UPDATE public.rooms SET stage='matched',current_stage='matched',status='completed',restaurant_state='decided',
    winning_restaurant_id=requested_restaurant_id,winning_deck_id=requested_deck_id,
    winning_branch_id=selected_branch,winning_resolution_method=requested_method,finalized_at=now(),
    restaurant_summary=final_summary,version=version+1
  WHERE id=requested_room_id AND finalized_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'WSH_ROOM_ALREADY_FINALIZED' USING ERRCODE='PT409'; END IF;
END
$$;

-- The Phase 2 implementation remains byte-for-byte unchanged; only its public gate changes.
ALTER FUNCTION public.get_or_create_restaurant_deck(uuid, uuid, text, uuid) SET SCHEMA private;
ALTER FUNCTION private.get_or_create_restaurant_deck(uuid, uuid, text, uuid) RENAME TO create_restaurant_deck;

CREATE FUNCTION public.get_or_create_restaurant_deck(
  p_room_id uuid, p_participant_id uuid, p_session_token text, p_after_deck_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE actual_participant uuid;
BEGIN
  actual_participant := private.room_participant(p_room_id,p_session_token,false);
  IF actual_participant <> p_participant_id THEN RAISE EXCEPTION 'WSH_UNAUTHORIZED_PARTICIPANT' USING ERRCODE='42501'; END IF;
  IF p_after_deck_id IS NOT NULL THEN RAISE EXCEPTION 'WSH_GENERATION_NOT_AUTHORIZED' USING ERRCODE='PT409'; END IF;
  RETURN private.create_restaurant_deck(p_room_id,actual_participant,p_session_token,NULL);
END
$$;

CREATE FUNCTION public.create_room_authorized(
  p_code text, p_session_token text, p_eating_mode text, p_city text, p_neighborhood text,
  p_language text, p_nickname text, p_latitude double precision DEFAULT NULL, p_longitude double precision DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE room_row public.rooms%ROWTYPE; participant_row public.participants%ROWTYPE; participant_count int;
BEGIN
  IF p_session_token IS NULL OR length(p_session_token)<16 OR p_code !~ '^[A-Z0-9]{4}$' OR p_eating_mode NOT IN ('delivery','dine_in','any')
    OR p_language NOT IN ('ar','en') OR nullif(trim(p_city),'') IS NULL OR nullif(trim(p_nickname),'') IS NULL
  THEN RAISE EXCEPTION 'WSH_INVALID_ROOM_INPUT' USING ERRCODE='22023'; END IF;
  IF (p_latitude IS NULL) <> (p_longitude IS NULL) THEN RAISE EXCEPTION 'WSH_INVALID_LOCATION' USING ERRCODE='22023'; END IF;
  INSERT INTO public.rooms(code,status,eating_mode,city,neighborhood,language,current_stage,stage)
  VALUES (p_code,'lobby',p_eating_mode,trim(p_city),nullif(trim(p_neighborhood),''),p_language,'lobby','lobby') RETURNING * INTO room_row;
  SELECT count(*)::int INTO participant_count FROM public.participants WHERE room_id=room_row.id;
  INSERT INTO public.participants(room_id,session_token,nickname,player_color,player_shape,is_host,status)
  VALUES (room_row.id,p_session_token,trim(p_nickname),(ARRAY['#55B96A','#F0443E','#FFD75A','#73C8EA','#9B86EC','#F6A6AD','#E5D3B3'])[participant_count%7+1],
    (ARRAY['scallop','squircle','circle','diamond','hexagon'])[participant_count%5+1],true,'active') RETURNING * INTO participant_row;
  UPDATE public.rooms SET host_participant_id=participant_row.id WHERE id=room_row.id RETURNING * INTO room_row;
  IF p_latitude IS NOT NULL THEN INSERT INTO private.room_locations(room_id,latitude,longitude) VALUES(room_row.id,p_latitude,p_longitude); END IF;
  RETURN jsonb_build_object('room',to_jsonb(room_row),'participant',to_jsonb(participant_row));
END
$$;

CREATE FUNCTION public.join_room_authorized(p_code text, p_session_token text, p_nickname text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
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
  IF room_row.stage<>'lobby' THEN RAISE EXCEPTION 'WSH_INVALID_ROOM_STAGE' USING ERRCODE='PT409'; END IF;
  SELECT count(*)::int INTO participant_count FROM public.participants WHERE room_id=room_row.id AND status='active';
  IF participant_count>=10 THEN RAISE EXCEPTION 'WSH_ROOM_FULL' USING ERRCODE='PT409'; END IF;
  INSERT INTO public.participants(room_id,session_token,nickname,player_color,player_shape,is_host,status)
  VALUES(room_row.id,p_session_token,trim(p_nickname),(ARRAY['#55B96A','#F0443E','#FFD75A','#73C8EA','#9B86EC','#F6A6AD','#E5D3B3'])[participant_count%7+1],
    (ARRAY['scallop','squircle','circle','diamond','hexagon'])[participant_count%5+1],false,'active') RETURNING * INTO participant_row;
  RETURN jsonb_build_object('room',to_jsonb(room_row),'participant',to_jsonb(participant_row));
END
$$;

CREATE FUNCTION public.start_category_voting(p_room_id uuid,p_session_token text,p_expected_version bigint) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE participant_id uuid; room_row public.rooms%ROWTYPE;
BEGIN
  participant_id:=private.room_participant(p_room_id,p_session_token,true);
  SELECT * INTO room_row FROM public.rooms WHERE id=p_room_id FOR UPDATE;
  IF room_row.version<>p_expected_version THEN RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE='PT409'; END IF;
  IF room_row.stage<>'lobby' THEN RAISE EXCEPTION 'WSH_INVALID_ROOM_STAGE' USING ERRCODE='PT409'; END IF;
  UPDATE public.rooms SET stage='voting',current_stage='voting',status='food_selection',version=version+1,
    category_summary=private.category_state(p_room_id) WHERE id=p_room_id;
  RETURN private.room_state(p_room_id,participant_id);
END
$$;

CREATE FUNCTION public.submit_category_selection(
  p_room_id uuid,p_session_token text,p_expected_version bigint,p_categories text[]
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE current_participant_id uuid; room_row public.rooms%ROWTYPE; active_count int; submitted_count int; tally jsonb;
  max_acceptance int; winners text[]; category_status text; winner text;
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
  ELSE UPDATE public.rooms SET version=version+1 WHERE id=p_room_id; END IF;
  UPDATE public.rooms SET category_summary=jsonb_build_object('status',category_status,'eligibleParticipantCount',active_count,
    'submittedCount',submitted_count,'submittedParticipantIds',coalesce((SELECT jsonb_agg(p.id ORDER BY p.id) FROM public.food_choices fc JOIN public.participants p ON p.id=fc.participant_id WHERE fc.room_id=p_room_id AND fc.is_submitted AND p.status='active'),'[]'::jsonb),
    'tally',tally,'winner',winner,'tiedCategories',coalesce(winners,'{}')) WHERE id=p_room_id;
  RETURN private.room_state(p_room_id,current_participant_id);
END
$$;

CREATE FUNCTION public.resolve_category_tie(
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
    selected_category:=room_row.tied_categories[1+floor(random()*cardinality(room_row.tied_categories))::int];
  ELSE RAISE EXCEPTION 'WSH_INVALID_RESOLUTION_METHOD' USING ERRCODE='22023'; END IF;
  UPDATE public.rooms SET stage='consensus',current_stage='consensus',winning_category=selected_category,
    consensus_type=CASE WHEN p_method='host_pick' THEN 'host_picked' ELSE 'random_picked' END,
    tied_categories='{}',category_summary=category_summary||jsonb_build_object('status','decided','winner',selected_category,'tiedCategories','[]'::jsonb),
    version=version+1 WHERE id=p_room_id;
  RETURN private.room_state(p_room_id,participant_id);
END
$$;

CREATE FUNCTION public.begin_restaurant_voting(p_room_id uuid,p_session_token text,p_expected_version bigint) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE participant_id uuid; room_row public.rooms%ROWTYPE; deck jsonb;
BEGIN
  participant_id:=private.room_participant(p_room_id,p_session_token,true);
  SELECT * INTO room_row FROM public.rooms WHERE id=p_room_id FOR UPDATE;
  IF room_row.version<>p_expected_version THEN RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE='PT409'; END IF;
  IF room_row.stage<>'consensus' OR room_row.winning_category IS NULL THEN RAISE EXCEPTION 'WSH_INVALID_ROOM_STAGE' USING ERRCODE='PT409'; END IF;
  UPDATE public.rooms SET stage='swiping',current_stage='swiping',status='restaurant_selection',swiping_started_at=now(),
    restaurant_state='voting',restaurant_summary='{}',version=version+1 WHERE id=p_room_id;
  deck:=private.create_restaurant_deck(p_room_id,participant_id,p_session_token,NULL);
  UPDATE public.rooms SET restaurant_summary=private.restaurant_state(p_room_id,(deck->>'deckId')::uuid) WHERE id=p_room_id;
  RETURN private.room_state(p_room_id,participant_id)||jsonb_build_object('deck',deck);
END
$$;

CREATE FUNCTION public.submit_restaurant_vote(
  p_room_id uuid,p_session_token text,p_expected_version bigint,p_deck_id uuid,p_restaurant_id text,p_vote text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE current_participant_id uuid; room_row public.rooms%ROWTYPE; deck_row private.room_restaurant_decks%ROWTYPE;
  card_position smallint; active_count int; card_count int; decided_count int; max_yes int; top_ids text[]; state jsonb; next_deck jsonb;
BEGIN
  current_participant_id:=private.room_participant(p_room_id,p_session_token,false);
  SELECT * INTO room_row FROM public.rooms WHERE id=p_room_id FOR UPDATE;
  IF room_row.version<>p_expected_version THEN RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE='PT409'; END IF;
  IF room_row.stage<>'swiping' OR room_row.restaurant_state<>'voting' OR room_row.finalized_at IS NOT NULL THEN RAISE EXCEPTION 'WSH_VOTE_CLOSED' USING ERRCODE='PT409'; END IF;
  IF p_vote NOT IN ('YES','NO','LATER') THEN RAISE EXCEPTION 'WSH_INVALID_VOTE' USING ERRCODE='22023'; END IF;
  SELECT * INTO deck_row FROM private.room_restaurant_decks d WHERE d.id=p_deck_id AND d.room_id=p_room_id
    AND d.round_started_at=room_row.swiping_started_at AND d.generation=(SELECT max(x.generation) FROM private.room_restaurant_decks x WHERE x.room_id=p_room_id AND x.round_started_at=room_row.swiping_started_at);
  IF NOT FOUND THEN RAISE EXCEPTION 'WSH_OLD_GENERATION' USING ERRCODE='PT409'; END IF;
  SELECT position INTO card_position FROM private.room_restaurant_deck_items WHERE deck_id=p_deck_id AND restaurant_id=p_restaurant_id;
  IF card_position IS NULL THEN RAISE EXCEPTION 'WSH_INVALID_RECOMMENDATION_CARD' USING ERRCODE='22023'; END IF;
  INSERT INTO public.restaurant_swipes(room_id,participant_id,restaurant_id,liked,deck_id,deck_position,vote,created_at,updated_at)
  VALUES(p_room_id,current_participant_id,p_restaurant_id,CASE p_vote WHEN 'YES' THEN true WHEN 'NO' THEN false ELSE NULL END,
    p_deck_id,card_position,p_vote,now(),now())
  ON CONFLICT(room_id,participant_id,restaurant_id) DO UPDATE SET liked=excluded.liked,deck_id=excluded.deck_id,
    deck_position=excluded.deck_position,vote=excluded.vote,updated_at=now();
  UPDATE public.rooms SET version=version+1 WHERE id=p_room_id;
  SELECT count(*)::int INTO active_count FROM public.participants WHERE room_id=p_room_id AND status='active';
  SELECT count(*)::int INTO card_count FROM private.room_restaurant_deck_items WHERE deck_id=p_deck_id;
  SELECT count(*)::int INTO decided_count FROM public.restaurant_swipes s JOIN public.participants p ON p.id=s.participant_id
    WHERE s.deck_id=p_deck_id AND p.status='active' AND s.vote IN ('YES','NO');
  state:=private.restaurant_state(p_room_id,p_deck_id);
  IF card_count>0 AND decided_count=active_count*card_count THEN
    SELECT max(yes_count),array_agg(restaurant_id ORDER BY position) FILTER (WHERE yes_count=(SELECT max(x.yes_count) FROM (
      SELECT count(*) FILTER(WHERE s.vote='YES')::int yes_count FROM private.room_restaurant_deck_items i
      LEFT JOIN public.restaurant_swipes s ON s.deck_id=i.deck_id AND s.restaurant_id=i.restaurant_id WHERE i.deck_id=p_deck_id GROUP BY i.restaurant_id
    ) x)) INTO max_yes,top_ids FROM (
      SELECT i.position,i.restaurant_id,count(*) FILTER(WHERE s.vote='YES')::int yes_count
      FROM private.room_restaurant_deck_items i LEFT JOIN public.restaurant_swipes s ON s.deck_id=i.deck_id AND s.restaurant_id=i.restaurant_id
      WHERE i.deck_id=p_deck_id GROUP BY i.position,i.restaurant_id
    ) ranked;
    IF max_yes=0 THEN
      IF deck_row.generation=0 THEN
        next_deck:=private.create_restaurant_deck(p_room_id,current_participant_id,p_session_token,p_deck_id);
        IF jsonb_array_length(next_deck->'restaurants')=0 THEN
          UPDATE public.rooms SET restaurant_state='no_match' WHERE id=p_room_id;
          state:=private.restaurant_state(p_room_id,(next_deck->>'deckId')::uuid)||jsonb_build_object('status','no_match');
        ELSE state:=private.restaurant_state(p_room_id,(next_deck->>'deckId')::uuid); END IF;
      ELSE
        UPDATE public.rooms SET restaurant_state='no_match' WHERE id=p_room_id;
        state:=state||jsonb_build_object('status','no_match');
      END IF;
    ELSIF cardinality(top_ids)=1 THEN
      PERFORM private.finalize_restaurant(p_room_id,p_deck_id,top_ids[1],'normal_consensus');
      RETURN private.room_state(p_room_id,current_participant_id);
    ELSE
      UPDATE public.rooms SET restaurant_state='tie',restaurant_summary=state||jsonb_build_object('status','tie','tiedRestaurantIds',to_jsonb(top_ids)) WHERE id=p_room_id;
      RETURN private.room_state(p_room_id,current_participant_id);
    END IF;
  END IF;
  UPDATE public.rooms SET restaurant_summary=state WHERE id=p_room_id;
  RETURN private.room_state(p_room_id,current_participant_id);
END
$$;

CREATE FUNCTION public.resolve_restaurant_tie(
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
  ELSIF p_method='choose_for_us' THEN selected_id:=tied_ids[1+floor(random()*cardinality(tied_ids))::int];
  ELSE RAISE EXCEPTION 'WSH_INVALID_RESOLUTION_METHOD' USING ERRCODE='22023'; END IF;
  PERFORM private.finalize_restaurant(p_room_id,(room_row.restaurant_summary->>'deckId')::uuid,selected_id,p_method);
  RETURN private.room_state(p_room_id,participant_id);
END
$$;

CREATE FUNCTION public.get_room_decision_state(p_room_id uuid,p_session_token text) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE participant_id uuid;
BEGIN participant_id:=private.room_participant(p_room_id,p_session_token,false);RETURN private.room_state(p_room_id,participant_id);END
$$;

CREATE FUNCTION public.reset_room_state_authorized(p_room_id uuid,p_session_token text,p_expected_version bigint,p_target_stage text DEFAULT 'voting') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE participant_id uuid; room_row public.rooms%ROWTYPE;
BEGIN
  participant_id:=private.room_participant(p_room_id,p_session_token,true);SELECT * INTO room_row FROM public.rooms WHERE id=p_room_id FOR UPDATE;
  IF room_row.version<>p_expected_version THEN RAISE EXCEPTION 'WSH_STALE_ROOM_VERSION' USING ERRCODE='PT409'; END IF;
  IF p_target_stage NOT IN ('lobby','voting') THEN RAISE EXCEPTION 'WSH_INVALID_ROOM_STAGE' USING ERRCODE='22023'; END IF;
  DELETE FROM public.restaurant_swipes WHERE room_id=p_room_id;DELETE FROM public.food_choices WHERE room_id=p_room_id;DELETE FROM public.order_items WHERE room_id=p_room_id;
  UPDATE public.rooms SET stage=p_target_stage,current_stage=p_target_stage,status=CASE WHEN p_target_stage='lobby' THEN 'lobby' ELSE 'food_selection' END,
    winning_category=NULL,consensus_type=NULL,tied_categories='{}',winning_restaurant_id=NULL,swiping_started_at=NULL,
    category_summary='{}',restaurant_state='idle',restaurant_summary='{}',winning_deck_id=NULL,winning_branch_id=NULL,
    winning_resolution_method=NULL,finalized_at=NULL,version=version+1 WHERE id=p_room_id;
  RETURN private.room_state(p_room_id,participant_id);
END
$$;

CREATE FUNCTION public.delete_room_authorized(p_room_id uuid,p_session_token text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
BEGIN PERFORM private.room_participant(p_room_id,p_session_token,true);DELETE FROM public.rooms WHERE id=p_room_id;END
$$;

DROP POLICY IF EXISTS "Public read/write for rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public read/write for participants" ON public.participants;
DROP POLICY IF EXISTS "Allow read access to room food choices" ON public.food_choices;
DROP POLICY IF EXISTS "Allow participants to insert own food choices" ON public.food_choices;
DROP POLICY IF EXISTS "Allow participants to update own food choices" ON public.food_choices;
DROP POLICY IF EXISTS "Allow public delete for food choices" ON public.food_choices;
DROP POLICY IF EXISTS "Allow public read access for room participants" ON public.restaurant_swipes;
DROP POLICY IF EXISTS "Allow participant insert swipe" ON public.restaurant_swipes;
DROP POLICY IF EXISTS "Allow public delete for restaurant swipes" ON public.restaurant_swipes;
CREATE POLICY rooms_read_only ON public.rooms FOR SELECT USING (true);
CREATE POLICY participants_read_only ON public.participants FOR SELECT USING (true);

REVOKE ALL ON public.rooms,public.participants,public.food_choices,public.restaurant_swipes FROM anon,authenticated;
GRANT SELECT ON public.rooms TO anon,authenticated;
GRANT SELECT(id,room_id,nickname,player_color,player_shape,is_host,status,joined_at,last_seen_at) ON public.participants TO anon,authenticated;
REVOKE ALL ON FUNCTION public.reset_room_state(uuid) FROM PUBLIC,anon,authenticated;

REVOKE ALL ON FUNCTION private.valid_category_selection(text[]) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.room_participant(uuid,text,boolean) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.category_tally(uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.category_state(uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.room_state(uuid,uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.restaurant_state(uuid,uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.finalize_restaurant(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.create_restaurant_deck(uuid,uuid,text,uuid) FROM PUBLIC,anon,authenticated;

REVOKE ALL ON FUNCTION public.get_or_create_restaurant_deck(uuid,uuid,text,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_room_authorized(text,text,text,text,text,text,text,double precision,double precision) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.join_room_authorized(text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.start_category_voting(uuid,text,bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_category_selection(uuid,text,bigint,text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_category_tie(uuid,text,bigint,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.begin_restaurant_voting(uuid,text,bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_restaurant_vote(uuid,text,bigint,uuid,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_restaurant_tie(uuid,text,bigint,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_room_decision_state(uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reset_room_state_authorized(uuid,text,bigint,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_room_authorized(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_restaurant_deck(uuid,uuid,text,uuid) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.create_room_authorized(text,text,text,text,text,text,text,double precision,double precision) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.join_room_authorized(text,text,text) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.start_category_voting(uuid,text,bigint) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.submit_category_selection(uuid,text,bigint,text[]) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_category_tie(uuid,text,bigint,text,text) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.begin_restaurant_voting(uuid,text,bigint) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.submit_restaurant_vote(uuid,text,bigint,uuid,text,text) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_restaurant_tie(uuid,text,bigint,text,text) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.get_room_decision_state(uuid,text) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reset_room_state_authorized(uuid,text,bigint,text) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.delete_room_authorized(uuid,text) TO anon,authenticated;

COMMIT;
