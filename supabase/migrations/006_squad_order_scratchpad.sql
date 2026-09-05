CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on order_items"
  ON public.order_items FOR SELECT USING (true);

CREATE POLICY "Allow participant insert on order_items"
  ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow participant update on order_items"
  ON public.order_items FOR UPDATE USING (true);

CREATE POLICY "Allow participant delete on order_items"
  ON public.order_items FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_order_items_room_id ON public.order_items (room_id);

DO $$ BEGIN   IF NOT EXISTS (     SELECT 1 FROM pg_publication_tables      WHERE pubname = 'supabase_realtime' AND tablename = 'order_items'   ) THEN     ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;   END IF; END $$;
