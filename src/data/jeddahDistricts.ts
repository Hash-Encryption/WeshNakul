export type MacroZone = 'north' | 'north_central' | 'central' | 'south_central' | 'south';

export interface DistrictInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  aliases: readonly string[];
  macroZone: MacroZone;
  neighbors: readonly string[];
}

// Supported Jeddah districts. Direct neighbors are limited to shared boundaries
// in the verified boundary dataset; broader proximity belongs to the second ring or macrozone.
export const JEDDAH_DISTRICT_LIST: readonly DistrictInfo[] = [
  { id: 'al_sheraa', nameAr: 'الشراع', nameEn: 'Al Sheraa', aliases: ['Sheraa', 'Al-Sheraa', 'Al Shiraa'], macroZone: 'north', neighbors: ['abhur_al_shamaliyah'] },
  { id: 'al_hamdaniyah', nameAr: 'الحمدانية', nameEn: 'Al Hamdaniyah', aliases: ['Hamdaniyah', 'Al-Hamdaniyah', 'Al Hamadhnyah'], macroZone: 'north', neighbors: [] },
  { id: 'abhur_al_shamaliyah', nameAr: 'أبحر الشمالية', nameEn: 'Abhur Al Shamaliyah', aliases: ['Obhur', 'Abhur', 'North Obhur', 'North Abhur', 'Obhur Al Shamaliyah', 'Abhur Al-Shamaliyah'], macroZone: 'north', neighbors: ['al_sheraa'] },
  { id: 'abhur_al_janoubiyah', nameAr: 'أبحر الجنوبية', nameEn: 'Abhur Al Janoubiyah', aliases: ['South Obhur', 'South Abhur', 'Obhur Al Janoubiyah', 'Abhur Al-Janoubiyah'], macroZone: 'north', neighbors: [] },
  { id: 'al_murjan', nameAr: 'المرجان', nameEn: 'Al Murjan', aliases: ['Murjan', 'Al-Murjan', 'Al Marjan'], macroZone: 'north_central', neighbors: ['al_basateen', 'al_shati'] },
  { id: 'al_basateen', nameAr: 'البساتين', nameEn: 'Al Basateen', aliases: ['Basateen', 'Al-Basateen'], macroZone: 'north_central', neighbors: ['al_murjan', 'al_mohammadiyyah'] },
  { id: 'al_mohammadiyyah', nameAr: 'المحمدية', nameEn: 'Al Mohammadiyyah', aliases: ['Mohammadiyyah', 'Muhammadiyah', 'Al Muhammadiyah', 'Al-Mohammadiyyah', 'Al Mohammadeeyyah'], macroZone: 'north_central', neighbors: ['al_basateen', 'al_naeem', 'al_shati'] },
  { id: 'al_naeem', nameAr: 'النعيم', nameEn: 'Al Naeem', aliases: ['Naeem', 'Al-Naeem'], macroZone: 'north_central', neighbors: ['al_mohammadiyyah', 'al_salamah'] },
  { id: 'al_marwah', nameAr: 'المروة', nameEn: 'Al Marwah', aliases: ['Marwah', 'Al-Marwah'], macroZone: 'north_central', neighbors: ['al_safa'] },
  { id: 'al_shati', nameAr: 'الشاطئ', nameEn: 'Al Shati', aliases: ['Shati', 'Al-Shati', 'Al Shatee'], macroZone: 'central', neighbors: ['al_andalus', 'al_khalidiyyah', 'al_mohammadiyyah', 'al_murjan', 'al_zahra'] },
  { id: 'al_bawadi', nameAr: 'البوادي', nameEn: 'Al Bawadi', aliases: ['Bawadi', 'Al-Bawadi'], macroZone: 'central', neighbors: ['al_faisaliyyah', 'al_salamah'] },
  { id: 'al_salamah', nameAr: 'السلامة', nameEn: 'Al Salamah', aliases: ['Salamah', 'Al-Salamah'], macroZone: 'central', neighbors: ['al_bawadi', 'al_naeem', 'al_rawdah', 'al_zahra'] },
  { id: 'al_zahra', nameAr: 'الزهراء', nameEn: 'Al Zahra', aliases: ['Zahra', 'Al-Zahra', 'Al Zahrah'], macroZone: 'central', neighbors: ['al_khalidiyyah', 'al_salamah', 'al_shati'] },
  { id: 'al_safa', nameAr: 'الصفا', nameEn: 'Al Safa', aliases: ['Safa', 'Al-Safa'], macroZone: 'central', neighbors: ['al_faisaliyyah', 'al_marwah', 'al_rehab', 'al_samer'] },
  { id: 'al_samer', nameAr: 'السامر', nameEn: 'Al Samer', aliases: ['Samer', 'Al-Samer'], macroZone: 'central', neighbors: ['al_safa'] },
  { id: 'al_faisaliyyah', nameAr: 'الفيصلية', nameEn: 'Al Faisaliyyah', aliases: ['Faisaliyyah', 'Faisaliyah', 'Al-Faisaliyyah', 'Al Faisaleyyah'], macroZone: 'central', neighbors: ['al_bawadi', 'al_rawdah', 'al_safa'] },
  { id: 'al_rawdah', nameAr: 'الروضة', nameEn: 'Al Rawdah', aliases: ['Rawdah', 'Ar Rawdah', 'Al-Rawdah', 'Al Rawdhah'], macroZone: 'central', neighbors: ['al_andalus', 'al_faisaliyyah', 'al_khalidiyyah', 'al_salamah'] },
  { id: 'al_khalidiyyah', nameAr: 'الخالدية', nameEn: 'Al Khalidiyyah', aliases: ['Khalidiyyah', 'Al-Khalidiyyah', 'Al Khalideyyah'], macroZone: 'central', neighbors: ['al_andalus', 'al_rawdah', 'al_shati', 'al_zahra'] },
  { id: 'al_rehab', nameAr: 'الرحاب', nameEn: 'Al Rehab', aliases: ['Rehab', 'Al-Rehab'], macroZone: 'central', neighbors: ['al_safa'] },
  { id: 'al_andalus', nameAr: 'الأندلس', nameEn: 'Al Andalus', aliases: ['Andalus', 'Al-Andalus', 'Al Andulus'], macroZone: 'south_central', neighbors: ['al_hamra', 'al_khalidiyyah', 'al_rawdah', 'al_shati'] },
  { id: 'al_hamra', nameAr: 'الحمراء', nameEn: 'Al Hamra', aliases: ['Hamra', 'Al-Hamra', 'Al Hamrah'], macroZone: 'south_central', neighbors: ['al_andalus', 'al_ruwais'] },
  { id: 'al_naseem', nameAr: 'النسيم', nameEn: 'Al Naseem', aliases: ['Naseem', 'Al-Naseem'], macroZone: 'south_central', neighbors: ['al_faiha'] },
  { id: 'al_ruwais', nameAr: 'الرويس', nameEn: 'Al Ruwais', aliases: ['Ruwais', 'Al-Ruwais', 'Al Ruwase'], macroZone: 'south_central', neighbors: ['al_hamra'] },
  { id: 'al_faiha', nameAr: 'الفيحاء', nameEn: 'Al Faiha', aliases: ['Faiha', 'Fayha', 'Al-Faiha', 'Al Fayha'], macroZone: 'south', neighbors: ['al_naseem', 'al_thaghr'] },
  { id: 'al_balad', nameAr: 'البلد', nameEn: 'Al Balad', aliases: ['Balad', 'Al-Balad'], macroZone: 'south', neighbors: [] },
  { id: 'al_thaghr', nameAr: 'الثغر', nameEn: 'Al Thaghr', aliases: ['Thaghr', 'Al-Thaghr', 'Al Thagur'], macroZone: 'south', neighbors: ['al_faiha'] },
];

export const JEDDAH_DISTRICTS: Readonly<Record<string, DistrictInfo>> = Object.fromEntries(
  JEDDAH_DISTRICT_LIST.map((district) => [district.id, district]),
);

const normalizeAlias = (value: string) => value.trim().toLocaleLowerCase('en-US').replace(/[-_\s]+/g, ' ');

const DISTRICT_BY_ALIAS = new Map(
  JEDDAH_DISTRICT_LIST.flatMap((district) =>
    [district.id, district.nameAr, district.nameEn, ...district.aliases].map((alias) => [normalizeAlias(alias), district.id] as const),
  ),
);

export const normalizeJeddahDistrict = (value?: string | null): string | null =>
  value ? DISTRICT_BY_ALIAS.get(normalizeAlias(value)) ?? null : null;

export const getSecondRingDistrictIds = (districtId: string): string[] => {
  const district = JEDDAH_DISTRICTS[districtId];
  if (!district) return [];

  const excluded = new Set([districtId, ...district.neighbors]);
  return [...new Set(district.neighbors.flatMap((neighborId) => JEDDAH_DISTRICTS[neighborId]?.neighbors ?? []))]
    .filter((candidateId) => !excluded.has(candidateId))
    .sort();
};
