-- Phase 2: Food Choices and Consensus Engine Migration

-- 1. Extend rooms table with consensus state
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'lobby' 
  CHECK (stage IN ('lobby', 'voting', 'tiebreaker', 'consensus')),
ADD COLUMN IF NOT EXISTS winning_category TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS consensus_type TEXT DEFAULT NULL 
  CHECK (consensus_type IN ('unanimous', 'majority_tiebreak', 'host_picked', 'random_picked', NULL)),
ADD COLUMN IF NOT EXISTS tied_categories TEXT[] DEFAULT '{}';

-- 2. Food choices storage table
CREATE TABLE IF NOT EXISTS food_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  selected_categories TEXT[] NOT NULL DEFAULT '{}',
  is_submitted BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_participant_room_choice UNIQUE (room_id, participant_id)
);

-- 3. Indexes for polling and realtime sync
CREATE INDEX IF NOT EXISTS idx_food_choices_room ON food_choices(room_id);
CREATE INDEX IF NOT EXISTS idx_food_choices_participant ON food_choices(participant_id);
CREATE INDEX IF NOT EXISTS idx_rooms_stage ON rooms(stage);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE food_choices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to room food choices"
  ON food_choices FOR SELECT
  USING (true);

CREATE POLICY "Allow participants to insert own food choices"
  ON food_choices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow participants to update own food choices"
  ON food_choices FOR UPDATE
  USING (true);

-- 5. Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE food_choices;
