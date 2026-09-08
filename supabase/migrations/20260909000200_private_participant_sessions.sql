BEGIN;

-- Participant presence is public room UI data; session credentials are not.
REVOKE SELECT ON public.participants FROM anon, authenticated;
GRANT SELECT (id, room_id, nickname, player_color, player_shape, is_host, status, joined_at, last_seen_at)
  ON public.participants TO anon, authenticated;

CREATE FUNCTION public.get_room_participants(
  p_room_id uuid,
  p_session_token text,
  p_legacy_session_token text DEFAULT NULL
) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', p.id,
    'room_id', p.room_id,
    'session_token', CASE WHEN p.session_token IN (p_session_token, p_legacy_session_token) THEN p.session_token ELSE '' END,
    'nickname', p.nickname,
    'player_color', p.player_color,
    'player_shape', p.player_shape,
    'is_host', p.is_host,
    'status', p.status,
    'joined_at', p.joined_at,
    'last_seen_at', p.last_seen_at
  ) ORDER BY p.joined_at), '[]'::jsonb)
  FROM public.participants p
  WHERE p.room_id = p_room_id
$$;

REVOKE ALL ON FUNCTION public.get_room_participants(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_room_participants(uuid, text, text) TO anon, authenticated;

COMMIT;
