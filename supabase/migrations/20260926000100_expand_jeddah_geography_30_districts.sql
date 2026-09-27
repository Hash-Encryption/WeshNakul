-- WeshNakul — Forward-Only Migration: Expand Jeddah Canonical Geography to 30 Districts
-- Migration: 20260926000100_expand_jeddah_geography_30_districts.sql
-- Incorporates 4 newly approved high-density urban districts:
--   an_nuzhah, ar_rabwah, al_aziziyah, al_sharafeyah
-- Synchronizes bidirectional neighbor relationships with all adjacent districts.
-- Safe and idempotent whether applied on top of 20260910000100 or fresh state.
BEGIN;

INSERT INTO private.district_geography (district_id, name_ar, name_en, aliases, macrozone, neighbors) VALUES
  ('al_sheraa', 'الشراع', 'Al Sheraa', ARRAY['Sheraa','Al-Sheraa','Al Shiraa'], 'north', ARRAY['abhur_al_shamaliyah']),
  ('al_hamdaniyah', 'الحمدانية', 'Al Hamdaniyah', ARRAY['Hamdaniyah','Al-Hamdaniyah','Al Hamadhnyah'], 'north', '{}'),
  ('abhur_al_shamaliyah', 'أبحر الشمالية', 'Abhur Al Shamaliyah', ARRAY['Obhur','Abhur','North Obhur','North Abhur','Obhur Al Shamaliyah','Abhur Al-Shamaliyah'], 'north', ARRAY['al_sheraa']),
  ('abhur_al_janoubiyah', 'أبحر الجنوبية', 'Abhur Al Janoubiyah', ARRAY['South Obhur','South Abhur','Obhur Al Janoubiyah','Abhur Al-Janoubiyah'], 'north', '{}'),
  ('al_murjan', 'المرجان', 'Al Murjan', ARRAY['Murjan','Al-Murjan','Al Marjan'], 'north_central', ARRAY['al_basateen','al_shati']),
  ('al_basateen', 'البساتين', 'Al Basateen', ARRAY['Basateen','Al-Basateen'], 'north_central', ARRAY['al_mohammadiyyah','al_murjan']),
  ('al_mohammadiyyah', 'المحمدية', 'Al Mohammadiyyah', ARRAY['Mohammadiyyah','Muhammadiyah','Al Muhammadiyah','Al-Mohammadiyyah','Al Mohammadeeyyah'], 'north_central', ARRAY['al_basateen','al_naeem','al_shati']),
  ('al_naeem', 'النعيم', 'Al Naeem', ARRAY['Naeem','Al-Naeem'], 'north_central', ARRAY['al_mohammadiyyah','al_salamah','an_nuzhah']),
  ('al_marwah', 'المروة', 'Al Marwah', ARRAY['Marwah','Al-Marwah'], 'north_central', ARRAY['al_safa','an_nuzhah']),
  ('an_nuzhah', 'النزهة', 'An Nuzhah', ARRAY['Nuzhah','Al Nuzhah','Al-Nuzhah','Al Nozha','النزهه'], 'north_central', ARRAY['al_bawadi','al_marwah','al_naeem','ar_rabwah']),
  ('al_shati', 'الشاطئ', 'Al Shati', ARRAY['Shati','Al-Shati','Al Shatee'], 'central', ARRAY['al_andalus','al_khalidiyyah','al_mohammadiyyah','al_murjan','al_zahra']),
  ('al_bawadi', 'البوادي', 'Al Bawadi', ARRAY['Bawadi','Al-Bawadi'], 'central', ARRAY['al_faisaliyyah','al_salamah','an_nuzhah','ar_rabwah']),
  ('al_salamah', 'السلامة', 'Al Salamah', ARRAY['Salamah','Al-Salamah'], 'central', ARRAY['al_bawadi','al_naeem','al_rawdah','al_zahra']),
  ('al_zahra', 'الزهراء', 'Al Zahra', ARRAY['Zahra','Al-Zahra','Al Zahrah'], 'central', ARRAY['al_khalidiyyah','al_salamah','al_shati']),
  ('al_safa', 'الصفا', 'Al Safa', ARRAY['Safa','Al-Safa'], 'central', ARRAY['al_faisaliyyah','al_marwah','al_rehab','al_samer','ar_rabwah']),
  ('al_samer', 'السامر', 'Al Samer', ARRAY['Samer','Al-Samer'], 'central', ARRAY['al_safa']),
  ('ar_rabwah', 'الربوة', 'Ar Rabwah', ARRAY['Rabwah','Al Rabwah','Al-Rabwah','Al Rabwa','الربوه'], 'central', ARRAY['al_bawadi','al_faisaliyyah','al_safa','an_nuzhah']),
  ('al_faisaliyyah', 'الفيصلية', 'Al Faisaliyyah', ARRAY['Faisaliyyah','Faisaliyah','Al-Faisaliyyah','Al Faisaleyyah'], 'central', ARRAY['al_aziziyah','al_bawadi','al_rawdah','al_safa','ar_rabwah']),
  ('al_aziziyah', 'العزيزية', 'Al Aziziyah', ARRAY['Aziziyah','Al-Aziziyah','Al Azizia','العزيزيه'], 'central', ARRAY['al_faisaliyyah','al_rawdah','al_rehab']),
  ('al_rawdah', 'الروضة', 'Al Rawdah', ARRAY['Rawdah','Ar Rawdah','Al-Rawdah','Al Rawdhah'], 'central', ARRAY['al_andalus','al_aziziyah','al_faisaliyyah','al_khalidiyyah','al_salamah']),
  ('al_khalidiyyah', 'الخالدية', 'Al Khalidiyyah', ARRAY['Khalidiyyah','Al-Khalidiyyah','Al Khalideyyah'], 'central', ARRAY['al_andalus','al_rawdah','al_shati','al_zahra']),
  ('al_rehab', 'الرحاب', 'Al Rehab', ARRAY['Rehab','Al-Rehab'], 'central', ARRAY['al_aziziyah','al_safa']),
  ('al_andalus', 'الأندلس', 'Al Andalus', ARRAY['Andalus','Al-Andalus','Al Andulus'], 'south_central', ARRAY['al_hamra','al_khalidiyyah','al_rawdah','al_shati']),
  ('al_hamra', 'الحمراء', 'Al Hamra', ARRAY['Hamra','Al-Hamra','Al Hamrah'], 'south_central', ARRAY['al_andalus','al_ruwais','al_sharafeyah']),
  ('al_sharafeyah', 'الشرفية', 'Al Sharafeyah', ARRAY['Sharafeyah','Sharafiyah','Al Sharafiyah','Al-Sharafeyah','Al-Sharafiyah','الشرفيه'], 'south_central', ARRAY['al_hamra','al_naseem','al_ruwais']),
  ('al_naseem', 'النسيم', 'Al Naseem', ARRAY['Naseem','Al-Naseem'], 'south_central', ARRAY['al_faiha','al_sharafeyah']),
  ('al_ruwais', 'الرويس', 'Al Ruwais', ARRAY['Ruwais','Al-Ruwais','Al Ruwase'], 'south_central', ARRAY['al_hamra','al_sharafeyah']),
  ('al_faiha', 'الفيحاء', 'Al Faiha', ARRAY['Faiha','Fayha','Al-Faiha','Al Fayha'], 'south', ARRAY['al_naseem','al_thaghr']),
  ('al_balad', 'البلد', 'Al Balad', ARRAY['Balad','Al-Balad'], 'south', '{}'),
  ('al_thaghr', 'الثغر', 'Al Thaghr', ARRAY['Thaghr','Al-Thaghr','Al Thagur'], 'south', ARRAY['al_faiha'])
ON CONFLICT (district_id) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  aliases = EXCLUDED.aliases,
  macrozone = EXCLUDED.macrozone,
  neighbors = EXCLUDED.neighbors;

COMMIT;
