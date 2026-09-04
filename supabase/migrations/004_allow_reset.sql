-- Phase 3.5: Allow reset of food choices and restaurant swipes for revote
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_choices' AND policyname = 'Allow public delete for food choices'
  ) THEN
    CREATE POLICY "Allow public delete for food choices"
      ON food_choices FOR DELETE
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'restaurant_swipes' AND policyname = 'Allow public delete for restaurant swipes'
  ) THEN
    CREATE POLICY "Allow public delete for restaurant swipes"
      ON restaurant_swipes FOR DELETE
      USING (true);
  END IF;
END $$;
