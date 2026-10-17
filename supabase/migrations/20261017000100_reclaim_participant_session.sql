-- 20261017000100_reclaim_participant_session.sql
-- Allow cross-browser session takeover when a user reclaims an existing nickname in a room.

CREATE OR REPLACE FUNCTION public.reclaim_participant_session(
  p_code text,
  p_nickname text,
  p_new_session_token text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  room_row public.rooms%ROWTYPE;
  participant_row public.participants%ROWTYPE;
BEGIN
  IF p_new_session_token IS NULL OR length(p_new_session_token) < 16 OR nullif(trim(p_nickname),'') IS NULL THEN
    RAISE EXCEPTION 'WSH_INVALID_INPUT' USING ERRCODE='22023';
  END IF;

  SELECT * INTO room_row FROM public.rooms WHERE code = upper(trim(p_code)) FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'WSH_ROOM_NOT_FOUND' USING ERRCODE='22023';
  END IF;

  IF room_row.created_at <= now() - interval '30 minutes' OR room_row.expires_at <= now() THEN
    RAISE EXCEPTION 'WSH_ROOM_EXPIRED' USING ERRCODE='PT409';
  END IF;

  SELECT * INTO participant_row FROM public.participants
  WHERE room_id = room_row.id AND lower(trim(nickname)) = lower(trim(p_nickname))
  ORDER BY joined_at ASC LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'PARTICIPANT_NOT_FOUND');
  END IF;

  UPDATE public.participants
  SET session_token = p_new_session_token,
      last_seen_at = now()
  WHERE id = participant_row.id
  RETURNING * INTO participant_row;

  RETURN jsonb_build_object(
    'success', true,
    'room', to_jsonb(room_row),
    'participant', to_jsonb(participant_row)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reclaim_participant_session(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reclaim_participant_session(text, text, text) TO anon, authenticated;
