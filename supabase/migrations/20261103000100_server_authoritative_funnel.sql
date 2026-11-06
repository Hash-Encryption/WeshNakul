-- 20261103000100_server_authoritative_funnel.sql
-- Server-Authoritative State Machine & Funnel Architecture for Wesh Nakul (Full Mini-Games & Zero UI Loss)

BEGIN;

-- 1. Create room_members table with required canonical schema & failover columns
CREATE TABLE IF NOT EXISTS public.room_members (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id uuid UNIQUE DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  session_token text,
  nickname text NOT NULL DEFAULT 'Guest',
  is_host boolean DEFAULT false,
  is_done_swiping boolean DEFAULT false,
  swipe_count integer DEFAULT 0,
  last_seen timestamptz DEFAULT now(),
  joined_at timestamptz DEFAULT now(),
  player_color text DEFAULT '#55B96A',
  player_shape text DEFAULT 'circle'
);

-- Ensure all required columns exist on room_members
ALTER TABLE public.room_members
  ADD COLUMN IF NOT EXISTS is_done_swiping boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS swipe_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS joined_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_host boolean DEFAULT false;

-- 2. Add canonical required columns to rooms table
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS consensus_summary jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS phase_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS host_id uuid;

ALTER TABLE public.rooms ALTER COLUMN category_summary DROP NOT NULL;

ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_host_id_fkey;
ALTER TABLE public.rooms
  ADD CONSTRAINT rooms_host_id_fkey
  FOREIGN KEY (host_id) REFERENCES public.room_members(user_id) ON DELETE SET NULL;

-- Normalize existing room status values to valid funnel stages before adding constraint
UPDATE public.rooms
SET status = CASE 
  WHEN status = 'food_selection' THEN 'category_swiping'
  WHEN status = 'voting' THEN 'category_swiping'
  WHEN status = 'restaurant_selection' THEN 'restaurant_swiping'
  WHEN status = 'swiping' THEN 'restaurant_swiping'
  WHEN status = 'completed' OR status = 'matched' THEN 'final_consensus'
  WHEN status IN ('lobby', 'category_swiping', 'tiebreaker', 'roulette', 'consensus', 'restaurant_swiping', 'final_consensus') THEN status
  ELSE 'lobby'
END;

-- Enforce strict canonical room status enum constraint (including tiebreaker mini-games)
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_status_check;
ALTER TABLE public.rooms ADD CONSTRAINT rooms_status_check 
CHECK (status IN (
  'lobby', 
  'category_swiping', 
  'tallying_categories',
  'tiebreaker',
  'roulette', 
  'consensus', 
  'restaurant_swiping', 
  'final_consensus'
));

-- 3. Deterministic Host Election & Failover RPC (Oldest Active Member)
CREATE OR REPLACE FUNCTION public.check_and_elect_host(p_room_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_host_id uuid;
  v_host_last_seen timestamptz;
  v_new_host record;
  v_now timestamptz := now();
  v_old_host_name text;
BEGIN
  SELECT r.host_id, m.last_seen, m.nickname
  INTO v_host_id, v_host_last_seen, v_old_host_name
  FROM public.rooms r
  LEFT JOIN public.room_members m ON m.user_id = r.host_id
  WHERE r.id = p_room_id;

  IF NOT found THEN
    RETURN jsonb_build_object('success', false, 'reason', 'room_not_found');
  END IF;

  -- If host is missing or host last_seen is older than 15 seconds
  IF v_host_id IS NULL OR v_host_last_seen IS NULL OR v_host_last_seen < (v_now - interval '15 seconds') THEN
    -- Elect oldest active member in the room based on joined_at timestamp where last_seen > NOW() - INTERVAL '15 seconds'
    SELECT *
    INTO v_new_host
    FROM public.room_members
    WHERE room_id = p_room_id
      AND last_seen > (v_now - interval '15 seconds')
      AND (v_host_id IS NULL OR user_id <> v_host_id)
    ORDER BY joined_at ASC
    LIMIT 1;

    IF v_new_host.user_id IS NOT NULL THEN
      -- Demote old host if present
      IF v_host_id IS NOT NULL THEN
        UPDATE public.room_members SET is_host = false WHERE user_id = v_host_id;
        UPDATE public.participants SET is_host = false WHERE id = v_host_id;
      END IF;

      -- Promote new oldest active host
      UPDATE public.room_members SET is_host = true WHERE user_id = v_new_host.user_id;
      UPDATE public.participants SET is_host = true WHERE id = v_new_host.user_id;
      UPDATE public.rooms SET host_id = v_new_host.user_id, host_participant_id = v_new_host.user_id WHERE id = p_room_id;

      RETURN jsonb_build_object(
        'elected', true,
        'old_host_id', v_host_id,
        'new_host_id', v_new_host.user_id,
        'new_host_name', v_new_host.nickname
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('elected', false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_elect_host(uuid) TO anon, authenticated;

-- 4. Member Heartbeat RPC
CREATE OR REPLACE FUNCTION public.update_member_heartbeat(
  p_room_id uuid,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_failover jsonb;
BEGIN
  UPDATE public.room_members
  SET last_seen = now()
  WHERE room_id = p_room_id AND (user_id = p_user_id OR id = p_user_id);

  UPDATE public.participants
  SET last_seen_at = now()
  WHERE room_id = p_room_id AND id = p_user_id;

  v_failover := public.check_and_elect_host(p_room_id);

  RETURN jsonb_build_object('success', true, 'failover', v_failover);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_member_heartbeat(uuid, uuid) TO anon, authenticated;

-- 5. Atomic Category Submission & Server-Side Vote Tally RPC
CREATE OR REPLACE FUNCTION public.submit_and_tally_category_swiping(
  p_room_id uuid,
  p_user_id uuid,
  p_categories text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_row public.rooms%ROWTYPE;
  v_active_members int;
  v_done_members int;
  v_tally jsonb := '{}'::jsonb;
  v_cat record;
  v_max_votes int := 0;
  v_top_categories text[] := '{}';
  v_all_categories text[];
  v_winner text;
  v_agreement_percent int := 100;
  v_runner_ups text[] := '{}';
  v_target_angle int;
  v_slice_angle numeric;
  v_winner_idx int;
  v_now timestamptz := now();
  v_summary jsonb;
  v_new_status text;
  v_new_stage text;
  v_wildcard text;
BEGIN
  SELECT * INTO v_room_row FROM public.rooms WHERE id = p_room_id FOR UPDATE;
  IF NOT found THEN
    RAISE EXCEPTION 'Room not found';
  END IF;

  v_wildcard := CASE WHEN v_room_row.room_mode = 'breakfast' THEN 'any_breakfast' ELSE 'flexible' END;

  -- 1. Insert or update member's selection in food_choices
  INSERT INTO public.food_choices (room_id, participant_id, selected_categories, is_submitted, submitted_at, updated_at)
  VALUES (p_room_id, p_user_id, p_categories, true, v_now, v_now)
  ON CONFLICT (room_id, participant_id) DO UPDATE SET
    selected_categories = EXCLUDED.selected_categories,
    is_submitted = true,
    submitted_at = v_now,
    updated_at = v_now;

  -- 2. Mark member done in room_members
  UPDATE public.room_members
  SET is_done_swiping = true,
      swipe_count = cardinality(p_categories),
      last_seen = v_now
  WHERE room_id = p_room_id AND (user_id = p_user_id OR id = p_user_id);

  UPDATE public.participants
  SET last_seen_at = v_now
  WHERE room_id = p_room_id AND id = p_user_id;

  -- 3. Check active member count (last_seen within 20s to prevent stale device locks)
  SELECT count(*), count(*) FILTER (WHERE is_done_swiping = true)
  INTO v_active_members, v_done_members
  FROM public.room_members
  WHERE room_id = p_room_id
    AND last_seen > (v_now - interval '60 seconds');

  -- If not all active members done yet, record partial progress and return
  IF v_done_members < v_active_members OR v_active_members = 0 THEN
    RETURN jsonb_build_object(
      'completed', false,
      'done_members', v_done_members,
      'total_members', v_active_members
    );
  END IF;

  -- 4. ALL ACTIVE MEMBERS DONE -> ATOMIC SERVER-SIDE TALLY ACROSS DATABASE
  -- Build vote counts from food_choices for this room
  FOR v_cat IN
    SELECT item as cat_id, count(*)::int as votes
    FROM (
      SELECT unnest(fc.selected_categories) as item
      FROM public.food_choices fc
      JOIN public.room_members rm ON rm.user_id = fc.participant_id
      WHERE fc.room_id = p_room_id
        AND fc.is_submitted = true
        AND rm.last_seen > (v_now - interval '60 seconds')
    ) sub
    WHERE item <> v_wildcard
    GROUP BY item
  LOOP
    v_tally := jsonb_set(v_tally, ARRAY[v_cat.cat_id], to_jsonb(v_cat.votes));
    IF v_cat.votes > v_max_votes THEN
      v_max_votes := v_cat.votes;
      v_top_categories := ARRAY[v_cat.cat_id];
    ELSIF v_cat.votes = v_max_votes THEN
      v_top_categories := array_append(v_top_categories, v_cat.cat_id);
    END IF;
  END LOOP;

  -- Default fallback if no non-wildcard categories chosen
  IF cardinality(v_top_categories) = 0 THEN
    v_top_categories := ARRAY['burger'];
    v_max_votes := v_active_members;
    v_tally := jsonb_build_object('burger', v_active_members);
  END IF;

  -- Calculate true squad agreement percentage: round((winnerVotes / totalMembers) * 100)
  v_agreement_percent := round((v_max_votes::numeric / GREATEST(1, v_active_members)::numeric) * 100);

  -- 5. RESOLUTION: Clear Winner vs. Equal Tie
  IF cardinality(v_top_categories) = 1 THEN
    -- Clear Winner -> Transition directly to 'consensus'
    v_winner := v_top_categories[1];
    v_new_status := 'consensus';
    v_new_stage := 'consensus';

    -- Collect runner-ups
    SELECT coalesce(array_agg(key ORDER BY value::int DESC), '{}')
    INTO v_runner_ups
    FROM jsonb_each_text(v_tally)
    WHERE key <> v_winner;

    v_summary := jsonb_build_object(
      'winner', v_winner,
      'agreementPercent', v_agreement_percent,
      'agreement_percent', v_agreement_percent,
      'runnerUps', to_jsonb(v_runner_ups),
      'runner_ups', to_jsonb(v_runner_ups),
      'decidedBy', 'majority'
    );

    UPDATE public.rooms
    SET status = v_new_status,
        stage = v_new_stage,
        winning_category = v_winner,
        consensus_summary = v_summary,
        category_summary = jsonb_build_object(
          'status', 'decided',
          'winner', v_winner,
          'tally', v_tally,
          'submittedCount', v_done_members,
          'eligibleParticipantCount', v_active_members
        ),
        phase_ends_at = v_now + interval '15 seconds',
        updated_at = v_now
    WHERE id = p_room_id;

  ELSE
    -- Equal votes tie -> Transition directly to 'roulette' (or tiebreaker)
    v_new_status := 'roulette';
    v_new_stage := 'tiebreaker';

    -- Deterministic pick of winner from top tied categories
    v_winner_idx := floor(random() * cardinality(v_top_categories))::int;
    v_winner := v_top_categories[v_winner_idx + 1];

    -- Remove v_winner from runner-ups array so winner is NEVER listed as its own runner-up
    v_runner_ups := array_remove(v_top_categories, v_winner);

    -- Deterministic wheel angle: random offset between 1440 and 2160 deg + slice offset
    v_slice_angle := 360.0 / cardinality(v_top_categories)::numeric;
    v_target_angle := 1440 + floor(random() * 720)::int + round(v_winner_idx * v_slice_angle + (v_slice_angle / 2.0))::int;

    v_summary := jsonb_build_object(
      'winner', v_winner,
      'agreementPercent', v_agreement_percent,
      'agreement_percent', v_agreement_percent,
      'runnerUps', to_jsonb(v_runner_ups),
      'runner_ups', to_jsonb(v_runner_ups),
      'contenders', to_jsonb(v_top_categories),
      'targetAngle', v_target_angle,
      'target_angle', v_target_angle,
      'spinStartedAt', to_char(v_now AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'spin_started_at', to_char(v_now AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'decidedBy', 'random_roll'
    );

    UPDATE public.rooms
    SET status = v_new_status,
        stage = v_new_stage,
        winning_category = v_winner,
        tied_categories = v_top_categories,
        consensus_summary = v_summary,
        category_summary = jsonb_build_object(
          'status', 'tie',
          'winner', v_winner,
          'tiedCategories', to_jsonb(v_top_categories),
          'tally', v_tally,
          'submittedCount', v_done_members,
          'eligibleParticipantCount', v_active_members
        ),
        phase_ends_at = null,
        updated_at = v_now
    WHERE id = p_room_id;
  END IF;

  RETURN jsonb_build_object(
    'completed', true,
    'status', v_new_status,
    'consensus_summary', v_summary
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_and_tally_category_swiping(uuid, uuid, text[]) TO anon, authenticated;

-- Explicit Category Consensus & Roulette Resolver RPC
CREATE OR REPLACE FUNCTION public.resolve_category_funnel_consensus(
  p_room_id uuid,
  p_winner text,
  p_agreement_percent int,
  p_runner_ups jsonb,
  p_target_angle int DEFAULT NULL,
  p_spin_started_at text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_status text;
  v_summary jsonb;
  v_now timestamptz := now();
BEGIN
  IF p_target_angle IS NOT NULL AND p_spin_started_at IS NOT NULL THEN
    v_new_status := 'roulette';
    v_summary := jsonb_build_object(
      'winner', p_winner,
      'agreementPercent', p_agreement_percent,
      'agreement_percent', p_agreement_percent,
      'runnerUps', p_runner_ups,
      'runner_ups', p_runner_ups,
      'targetAngle', p_target_angle,
      'target_angle', p_target_angle,
      'spinStartedAt', p_spin_started_at,
      'spin_started_at', p_spin_started_at,
      'decidedBy', 'roulette'
    );
  ELSE
    v_new_status := 'consensus';
    v_summary := jsonb_build_object(
      'winner', p_winner,
      'agreementPercent', p_agreement_percent,
      'agreement_percent', p_agreement_percent,
      'runnerUps', p_runner_ups,
      'runner_ups', p_runner_ups,
      'decidedBy', 'majority'
    );
  END IF;

  UPDATE public.rooms
  SET status = v_new_status,
      stage = CASE WHEN v_new_status = 'roulette' THEN 'tiebreaker' ELSE 'consensus' END,
      winning_category = p_winner,
      consensus_summary = v_summary,
      phase_ends_at = CASE WHEN v_new_status = 'consensus' THEN v_now + interval '15 seconds' ELSE NULL END,
      updated_at = v_now
  WHERE id = p_room_id;

  RETURN jsonb_build_object('success', true, 'status', v_new_status, 'summary', v_summary);
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_category_funnel_consensus(uuid, text, int, jsonb, int, text) TO anon, authenticated;

-- 6. Atomic State Transition RPC (advance_room_stage)
CREATE OR REPLACE FUNCTION public.advance_room_stage(
  p_room_id uuid,
  p_target_status text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status text;
  v_active_members int;
  v_done_swiping int;
  v_phase_ends timestamptz;
  v_now timestamptz := now();
BEGIN
  -- 1. Lock room row to prevent race conditions
  SELECT status, phase_ends_at INTO v_current_status, v_phase_ends
  FROM public.rooms
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT found THEN
    RAISE EXCEPTION 'Room not found';
  END IF;

  -- 2. Validate completion rules for swiping phases
  IF v_current_status IN ('category_swiping', 'restaurant_swiping') AND p_target_status IN ('consensus', 'roulette', 'tiebreaker', 'final_consensus') THEN
    SELECT count(*), count(*) FILTER (WHERE is_done_swiping = true)
    INTO v_active_members, v_done_swiping
    FROM public.room_members
    WHERE room_id = p_room_id
      AND last_seen > (v_now - interval '60 seconds');

    -- Allow transition if ALL active members are done OR the phase deadline has expired
    IF v_done_swiping < v_active_members AND (v_phase_ends IS NULL OR v_now < v_phase_ends) THEN
      RAISE EXCEPTION 'Cannot advance: Not all members finished (%) and timer has not expired (%)', v_done_swiping, v_phase_ends;
    END IF;
  END IF;

  -- 3. Execute atomic transition & reset completion flags
  -- Set 15-second countdown window on 'consensus' screen so players see the winner and auto-advance
  UPDATE public.rooms
  SET status = p_target_status,
      winning_category = COALESCE(winning_category, consensus_summary->>'winner'),
      stage = CASE
        WHEN p_target_status = 'lobby' THEN 'lobby'
        WHEN p_target_status = 'category_swiping' THEN 'voting'
        WHEN p_target_status = 'tiebreaker' THEN 'tiebreaker'
        WHEN p_target_status = 'roulette' THEN 'tiebreaker'
        WHEN p_target_status = 'consensus' THEN 'consensus'
        WHEN p_target_status = 'restaurant_swiping' THEN 'swiping'
        WHEN p_target_status = 'final_consensus' THEN 'matched'
        ELSE stage
      END,
      updated_at = v_now,
      phase_ends_at = CASE
        WHEN p_target_status = 'consensus' THEN v_now + interval '15 seconds'
        ELSE null
      END
  WHERE id = p_room_id;

  -- Reset votes and room state on return to lobby or category_swiping ("Vote Again from Scratch")
  IF p_target_status IN ('lobby', 'category_swiping') THEN
    DELETE FROM public.food_choices WHERE room_id = p_room_id;
    DELETE FROM public.restaurant_swipes WHERE room_id = p_room_id;
    UPDATE public.rooms
    SET winning_category = NULL,
        tied_categories = '{}',
        consensus_summary = '{}'::jsonb,
        category_summary = NULL
    WHERE id = p_room_id;
  END IF;

  -- When transitioning to restaurant_swiping, clear previous restaurant swipes in DB so deck starts fresh
  -- and ensure swiping_started_at, winning_category, and restaurant_state are properly committed
  IF p_target_status = 'restaurant_swiping' THEN
    DELETE FROM public.restaurant_swipes WHERE room_id = p_room_id;
    UPDATE public.rooms
    SET swiping_started_at = COALESCE(swiping_started_at, v_now),
        winning_category = COALESCE(winning_category, consensus_summary->>'winner', (category_summary->>'winner'), 'burger'),
        restaurant_state = 'voting'
    WHERE id = p_room_id;
  END IF;

  -- Reset member swiping flags so subsequent phases start completely clean
  UPDATE public.room_members
  SET is_done_swiping = false,
      swipe_count = 0
  WHERE room_id = p_room_id;

  RETURN json_build_object('success', true, 'new_status', p_target_status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.advance_room_stage(uuid, text) TO anon, authenticated;

-- 7. Bidirectional Sync Trigger from participants -> room_members
CREATE OR REPLACE FUNCTION public.sync_participants_to_room_members()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.room_members (user_id, id, room_id, session_token, nickname, is_host, player_color, player_shape, joined_at, last_seen)
    VALUES (NEW.id, NEW.id, NEW.room_id, NEW.session_token, NEW.nickname, NEW.is_host, NEW.player_color, NEW.player_shape, NEW.joined_at, coalesce(NEW.last_seen_at, now()))
    ON CONFLICT (user_id) DO UPDATE SET
      nickname = EXCLUDED.nickname,
      is_host = EXCLUDED.is_host,
      player_color = EXCLUDED.player_color,
      player_shape = EXCLUDED.player_shape,
      last_seen = EXCLUDED.last_seen;

    IF NEW.is_host THEN
      UPDATE public.rooms SET host_id = NEW.id WHERE id = NEW.room_id AND (host_id IS NULL OR host_id <> NEW.id);
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.room_members SET
      nickname = NEW.nickname,
      is_host = NEW.is_host,
      player_color = NEW.player_color,
      player_shape = NEW.player_shape,
      last_seen = coalesce(NEW.last_seen_at, now())
    WHERE user_id = NEW.id OR id = NEW.id;

    IF NEW.is_host THEN
      UPDATE public.rooms SET host_id = NEW.id WHERE id = NEW.room_id AND (host_id IS NULL OR host_id <> NEW.id);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.room_members WHERE user_id = OLD.id OR id = OLD.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_participants_to_members ON public.participants;
CREATE TRIGGER trg_sync_participants_to_members
AFTER INSERT OR UPDATE OR DELETE ON public.participants
FOR EACH ROW EXECUTE FUNCTION public.sync_participants_to_room_members();

-- Backfill existing participants into room_members
INSERT INTO public.room_members (user_id, id, room_id, session_token, nickname, is_host, player_color, player_shape, joined_at, last_seen)
SELECT id, id, room_id, session_token, nickname, is_host, player_color, player_shape, joined_at, coalesce(last_seen_at, now())
FROM public.participants
ON CONFLICT (user_id) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  is_host = EXCLUDED.is_host,
  player_color = EXCLUDED.player_color,
  player_shape = EXCLUDED.player_shape,
  last_seen = EXCLUDED.last_seen;

UPDATE public.rooms r
SET host_id = p.id
FROM public.participants p
WHERE p.room_id = r.id AND p.is_host = true AND r.host_id IS NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_room_members_room ON public.room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_last_seen ON public.room_members(last_seen);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);

-- RLS Policies
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read/write for room_members" ON public.room_members;
CREATE POLICY "Public read/write for room_members" ON public.room_members FOR ALL USING (true) WITH CHECK (true);

-- Realtime Publication
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
END $$;

-- 8. Enhanced get_or_create_restaurant_deck with category fallback & swiping transition
DROP FUNCTION IF EXISTS public.get_or_create_restaurant_deck(uuid, uuid, text, uuid);

CREATE OR REPLACE FUNCTION public.get_or_create_restaurant_deck(
  p_room_id uuid,
  p_participant_id uuid,
  p_session_token text,
  p_after_deck_id uuid DEFAULT NULL,
  p_category text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  actual_participant uuid;
BEGIN
  actual_participant := private.room_participant(p_room_id, p_session_token, false);
  IF actual_participant <> p_participant_id THEN
    RAISE EXCEPTION 'WSH_UNAUTHORIZED_PARTICIPANT' USING ERRCODE = '42501';
  END IF;
  IF p_after_deck_id IS NOT NULL THEN
    RAISE EXCEPTION 'WSH_GENERATION_NOT_AUTHORIZED' USING ERRCODE = 'PT409';
  END IF;

  -- Ensure room is ready for swiping: initialize swiping_started_at and winning_category if missing
  UPDATE public.rooms
  SET stage = 'swiping',
      current_stage = 'swiping',
      swiping_started_at = COALESCE(swiping_started_at, now()),
      winning_category = COALESCE(NULLIF(p_category, ''), winning_category, consensus_summary->>'winner', (category_summary->>'winner'), 'burger')
  WHERE id = p_room_id
    AND (stage <> 'swiping' OR swiping_started_at IS NULL OR winning_category IS NULL OR winning_category = '');

  RETURN private.create_restaurant_deck(p_room_id, actual_participant, p_session_token, NULL);
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_restaurant_deck(uuid, uuid, text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_restaurant_deck(uuid, uuid, text, uuid, text) TO anon, authenticated;

-- 9. Resilient, Idempotent submit_restaurant_vote with Funnel Stage & State Awareness
CREATE OR REPLACE FUNCTION public.submit_restaurant_vote(
  p_room_id uuid,
  p_session_token text,
  p_expected_version bigint,
  p_deck_id uuid,
  p_restaurant_id text,
  p_vote text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, private AS $$
DECLARE
  current_participant_id uuid;
  room_row public.rooms%ROWTYPE;
  deck_row private.room_restaurant_decks%ROWTYPE;
  card_position smallint;
  active_count int;
  card_count int;
  decided_count int;
  max_yes int;
  top_ids text[];
  state jsonb;
  next_deck jsonb;
BEGIN
  current_participant_id := private.room_participant(p_room_id, p_session_token, false);
  SELECT * INTO room_row FROM public.rooms WHERE id = p_room_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found' USING ERRCODE = '22023';
  END IF;

  -- 1. Idempotency Check: if this exact vote is already recorded, return canonical state cleanly
  IF EXISTS (
    SELECT 1 FROM public.restaurant_swipes
    WHERE room_id = p_room_id
      AND participant_id = current_participant_id
      AND deck_id = p_deck_id
      AND restaurant_id = p_restaurant_id
      AND vote = p_vote
  ) THEN
    RETURN private.room_state(p_room_id, current_participant_id);
  END IF;

  -- 2. Concurrency Check: If version is stale, verify if this vote is already persisted
  IF room_row.version <> p_expected_version THEN
    IF EXISTS (
      SELECT 1 FROM public.restaurant_swipes
      WHERE room_id = p_room_id
        AND participant_id = current_participant_id
        AND deck_id = p_deck_id
        AND restaurant_id = p_restaurant_id
    ) THEN
      RETURN private.room_state(p_room_id, current_participant_id);
    END IF;
  END IF;

  -- 3. Room Status & Stage Verification (accepts both stage = 'swiping' or status = 'restaurant_swiping')
  IF room_row.stage <> 'swiping' AND room_row.status <> 'restaurant_swiping' THEN
    RAISE EXCEPTION 'WSH_VOTE_CLOSED' USING ERRCODE = 'PT409';
  END IF;

  IF room_row.finalized_at IS NOT NULL THEN
    RAISE EXCEPTION 'WSH_VOTE_CLOSED' USING ERRCODE = 'PT409';
  END IF;

  -- Self-heal restaurant_state to 'voting' if idle, uninitialized, or missing
  IF room_row.restaurant_state IS NULL OR room_row.restaurant_state = 'idle' THEN
    room_row.restaurant_state := 'voting';
    UPDATE public.rooms SET restaurant_state = 'voting' WHERE id = p_room_id;
  END IF;

  IF room_row.restaurant_state <> 'voting' THEN
    RAISE EXCEPTION 'WSH_VOTE_CLOSED' USING ERRCODE = 'PT409';
  END IF;

  IF p_vote NOT IN ('YES', 'NO', 'LATER') THEN
    RAISE EXCEPTION 'WSH_INVALID_VOTE' USING ERRCODE = '22023';
  END IF;

  -- 4. Verify Deck belongs to room and matches active generation
  SELECT * INTO deck_row FROM private.room_restaurant_decks d
  WHERE d.id = p_deck_id AND d.room_id = p_room_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'WSH_OLD_GENERATION' USING ERRCODE = 'PT409';
  END IF;

  IF deck_row.generation < (
    SELECT coalesce(max(x.generation), 0)
    FROM private.room_restaurant_decks x
    WHERE x.room_id = p_room_id
      AND (x.round_started_at = room_row.swiping_started_at OR room_row.swiping_started_at IS NULL)
  ) THEN
    RAISE EXCEPTION 'WSH_OLD_GENERATION' USING ERRCODE = 'PT409';
  END IF;

  SELECT position INTO card_position FROM private.room_restaurant_deck_items
  WHERE deck_id = p_deck_id AND restaurant_id = p_restaurant_id;
  IF card_position IS NULL THEN
    RAISE EXCEPTION 'WSH_INVALID_RECOMMENDATION_CARD' USING ERRCODE = '22023';
  END IF;

  -- 5. Record Swipe Idempotently
  INSERT INTO public.restaurant_swipes (
    room_id, participant_id, restaurant_id, liked, deck_id, deck_position, vote, created_at, updated_at
  ) VALUES (
    p_room_id, current_participant_id, p_restaurant_id,
    CASE p_vote WHEN 'YES' THEN true WHEN 'NO' THEN false ELSE NULL END,
    p_deck_id, card_position, p_vote, now(), now()
  )
  ON CONFLICT (room_id, participant_id, restaurant_id)
  DO UPDATE SET
    liked = excluded.liked,
    deck_id = excluded.deck_id,
    deck_position = excluded.deck_position,
    vote = excluded.vote,
    updated_at = now();

  UPDATE public.rooms SET version = version + 1 WHERE id = p_room_id;

  SELECT count(*)::int INTO card_count FROM private.room_restaurant_deck_items WHERE deck_id = p_deck_id;

  -- Keep room_members completion in sync
  UPDATE public.room_members
  SET swipe_count = (SELECT count(*) FROM public.restaurant_swipes WHERE room_id = p_room_id AND participant_id = current_participant_id AND vote IN ('YES', 'NO')),
      is_done_swiping = ((SELECT count(*) FROM public.restaurant_swipes WHERE room_id = p_room_id AND participant_id = current_participant_id AND vote IN ('YES', 'NO')) >= card_count)
  WHERE room_id = p_room_id AND (user_id = current_participant_id OR id = current_participant_id);

  SELECT count(*)::int INTO active_count FROM public.participants WHERE room_id = p_room_id AND status = 'active';
  SELECT count(*)::int INTO decided_count FROM public.restaurant_swipes s
  JOIN public.participants p ON p.id = s.participant_id
  WHERE s.deck_id = p_deck_id AND p.status = 'active' AND s.vote IN ('YES', 'NO');

  state := private.restaurant_state(p_room_id, p_deck_id);

  IF card_count > 0 AND decided_count = active_count * card_count THEN
    SELECT max(yes_count), array_agg(restaurant_id ORDER BY position) FILTER (WHERE yes_count = (
      SELECT max(x.yes_count) FROM (
        SELECT count(*) FILTER (WHERE s.vote = 'YES')::int AS yes_count
        FROM private.room_restaurant_deck_items i
        LEFT JOIN public.restaurant_swipes s ON s.deck_id = i.deck_id AND s.restaurant_id = i.restaurant_id
        WHERE i.deck_id = p_deck_id GROUP BY i.restaurant_id
      ) x
    )) INTO max_yes, top_ids FROM (
      SELECT i.position, i.restaurant_id, count(*) FILTER (WHERE s.vote = 'YES')::int AS yes_count
      FROM private.room_restaurant_deck_items i
      LEFT JOIN public.restaurant_swipes s ON s.deck_id = i.deck_id AND s.restaurant_id = i.restaurant_id
      WHERE i.deck_id = p_deck_id GROUP BY i.position, i.restaurant_id
    ) ranked;

    IF max_yes = 0 THEN
      IF deck_row.generation = 0 THEN
        next_deck := private.create_restaurant_deck(p_room_id, current_participant_id, p_session_token, p_deck_id);
        IF jsonb_array_length(next_deck->'restaurants') = 0 THEN
          UPDATE public.rooms SET restaurant_state = 'no_match' WHERE id = p_room_id;
          state := private.restaurant_state(p_room_id, (next_deck->>'deckId')::uuid) || jsonb_build_object('status', 'no_match');
        ELSE
          state := private.restaurant_state(p_room_id, (next_deck->>'deckId')::uuid);
        END IF;
      ELSE
        UPDATE public.rooms SET restaurant_state = 'no_match' WHERE id = p_room_id;
        state := state || jsonb_build_object('status', 'no_match');
      END IF;
    ELSIF cardinality(top_ids) = 1 THEN
      PERFORM private.finalize_restaurant(p_room_id, p_deck_id, top_ids[1], 'normal_consensus');
      RETURN private.room_state(p_room_id, current_participant_id);
    ELSE
      UPDATE public.rooms
      SET restaurant_state = 'tie',
          restaurant_summary = state || jsonb_build_object('status', 'tie', 'tiedRestaurantIds', to_jsonb(top_ids))
      WHERE id = p_room_id;
      RETURN private.room_state(p_room_id, current_participant_id);
    END IF;
  END IF;

  UPDATE public.rooms SET restaurant_summary = state WHERE id = p_room_id;
  RETURN private.room_state(p_room_id, current_participant_id);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_restaurant_vote(uuid, text, bigint, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_restaurant_vote(uuid, text, bigint, uuid, text, text) TO anon, authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
