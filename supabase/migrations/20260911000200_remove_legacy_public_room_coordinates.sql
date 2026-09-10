-- Converge databases where the legacy public GPS columns survived the private-location migration.
BEGIN;

DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'latitude'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'longitude'
  ) THEN
    EXECUTE $sql$
      INSERT INTO private.room_locations (room_id, latitude, longitude)
      SELECT id, latitude, longitude
      FROM public.rooms
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      ON CONFLICT (room_id) DO UPDATE
      SET latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          updated_at = now()
    $sql$;
  END IF;
END
$migration$;

ALTER TABLE public.rooms
  DROP COLUMN IF EXISTS latitude,
  DROP COLUMN IF EXISTS longitude;

COMMIT;
