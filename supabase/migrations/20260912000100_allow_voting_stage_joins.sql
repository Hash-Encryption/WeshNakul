-- Preserve asynchronous category selection: guests may join while voting is still open.
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
  IF room_row.stage NOT IN ('lobby','voting') THEN RAISE EXCEPTION 'WSH_INVALID_ROOM_STAGE' USING ERRCODE='PT409'; END IF;
  SELECT count(*)::int INTO participant_count FROM public.participants WHERE room_id=room_row.id AND status='active';
  IF participant_count>=10 THEN RAISE EXCEPTION 'WSH_ROOM_FULL' USING ERRCODE='PT409'; END IF;
  INSERT INTO public.participants(room_id,session_token,nickname,player_color,player_shape,is_host,status)
  VALUES(room_row.id,p_session_token,trim(p_nickname),(ARRAY['#55B96A','#F0443E','#FFD75A','#73C8EA','#9B86EC','#F6A6AD','#E5D3B3'])[participant_count%7+1],
    (ARRAY['scallop','squircle','circle','diamond','hexagon'])[participant_count%5+1],false,'active') RETURNING * INTO participant_row;
  IF room_row.stage='voting' THEN
    UPDATE public.rooms SET version=version+1,category_summary=private.category_state(room_row.id)
    WHERE id=room_row.id RETURNING * INTO room_row;
  END IF;
  RETURN jsonb_build_object('room',to_jsonb(room_row),'participant',to_jsonb(participant_row));
END
$$;
