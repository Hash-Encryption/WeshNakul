-- Migration: 007_room_expiration_and_cleanup.sql

-- 1. Helper function to completely purge an expired or finished room (30-Minute TTL)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rooms
  WHERE created_at < (NOW() - INTERVAL '30 minutes');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RPC function for host to cleanly reset room voting
CREATE OR REPLACE FUNCTION public.reset_room_state(target_room_id UUID)
RETURNS void AS $$
BEGIN
  -- Delete all swipes and order items for this room
  DELETE FROM public.restaurant_swipes WHERE room_id = target_room_id;
  DELETE FROM public.food_choices WHERE room_id = target_room_id;
  DELETE FROM public.order_items WHERE room_id = target_room_id;

  -- Delete from swipes if legacy/alias table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'swipes') THEN
    DELETE FROM public.swipes WHERE room_id = target_room_id;
  END IF;

  -- Reset room status and winner
  UPDATE public.rooms
  SET 
    stage = 'voting',
    status = 'food_selection',
    current_stage = 'voting',
    winning_category = NULL,
    consensus_type = NULL,
    tied_categories = '{}',
    winning_restaurant_id = NULL,
    swiping_started_at = NULL
  WHERE id = target_room_id;

  -- Reset participant readiness and votes if columns exist on participants
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'participants' AND column_name = 'selected_categories'
  ) THEN
    UPDATE public.participants
    SET selected_categories = '{}'
    WHERE room_id = target_room_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'participants' AND column_name = 'is_ready'
  ) THEN
    UPDATE public.participants
    SET is_ready = false
    WHERE room_id = target_room_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Allow delete on rooms and order_items for full room destruction
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rooms' AND policyname = 'Allow public delete for rooms'
  ) THEN
    CREATE POLICY "Allow public delete for rooms"
      ON public.rooms FOR DELETE
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'order_items' AND policyname = 'Allow public delete for order_items'
  ) THEN
    CREATE POLICY "Allow public delete for order_items"
      ON public.order_items FOR DELETE
      USING (true);
  END IF;
END $$;

-- 4. Grant execution permissions
GRANT EXECUTE ON FUNCTION public.cleanup_expired_rooms() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reset_room_state(UUID) TO anon, authenticated, service_role;
