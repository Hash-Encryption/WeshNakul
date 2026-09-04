-- 1. Extend room stage check constraint
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_stage_check;
ALTER TABLE rooms ADD CONSTRAINT rooms_stage_check 
  CHECK (stage IN ('lobby', 'voting', 'tiebreaker', 'consensus', 'swiping', 'matched'));

-- 2. Add winning restaurant metadata
ALTER TABLE rooms 
  ADD COLUMN IF NOT EXISTS winning_restaurant_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS swiping_started_at TIMESTAMPTZ DEFAULT NULL;

-- 3. Create restaurant_swipes table
CREATE TABLE IF NOT EXISTS restaurant_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  restaurant_id TEXT NOT NULL,
  liked BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_participant_restaurant_swipe UNIQUE (room_id, participant_id, restaurant_id)
);

-- 4. Row Level Security
ALTER TABLE restaurant_swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for room participants"
  ON restaurant_swipes FOR SELECT
  USING (true);

CREATE POLICY "Allow participant insert swipe"
  ON restaurant_swipes FOR INSERT
  WITH CHECK (true);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_swipes_room_restaurant 
  ON restaurant_swipes(room_id, restaurant_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_swipes_participant 
  ON restaurant_swipes(room_id, participant_id);

-- 6. Supabase Realtime Publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'restaurant_swipes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_swipes;
  END IF;
END $$;
