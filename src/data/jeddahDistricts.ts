export type MacroZone = 'north_obhur' | 'central_jeddah' | 'south_jeddah';

export interface DistrictInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  macroZone: MacroZone;
  neighbors: string[];
}

export const JEDDAH_DISTRICTS: Record<string, DistrictInfo> = {
  al_rawdah: {
    id: 'al_rawdah',
    nameAr: 'الروضة',
    nameEn: 'Al Rawdah',
    macroZone: 'central_jeddah',
    neighbors: ['al_zahra', 'al_khalidiyyah', 'al_salamah', 'al_andalus', 'al_faisaliyyah'],
  },
  al_zahra: {
    id: 'al_zahra',
    nameAr: 'الزهراء',
    nameEn: 'Al Zahra',
    macroZone: 'central_jeddah',
    neighbors: ['al_shati', 'al_rawdah', 'al_salamah', 'al_naeem', 'al_khalidiyyah'],
  },
  al_salamah: {
    id: 'al_salamah',
    nameAr: 'السلامة',
    nameEn: 'Al Salamah',
    macroZone: 'central_jeddah',
    neighbors: ['al_zahra', 'al_rawdah', 'al_naeem', 'al_bawadi', 'al_faisaliyyah'],
  },
  al_khalidiyyah: {
    id: 'al_khalidiyyah',
    nameAr: 'الخالدية',
    nameEn: 'Al Khalidiyyah',
    macroZone: 'central_jeddah',
    neighbors: ['al_rawdah', 'al_andalus', 'al_shati', 'al_zahra'],
  },
  al_andalus: {
    id: 'al_andalus',
    nameAr: 'الأندلس',
    nameEn: 'Al Andalus',
    macroZone: 'central_jeddah',
    neighbors: ['al_khalidiyyah', 'al_rawdah', 'al_hamra', 'al_rehab'],
  },
  al_shati: {
    id: 'al_shati',
    nameAr: 'الشاطئ',
    nameEn: 'Al Shati',
    macroZone: 'central_jeddah',
    neighbors: ['al_zahra', 'al_khalidiyyah', 'al_mohammadiyyah', 'al_murjan'],
  },
  al_hamra: {
    id: 'al_hamra',
    nameAr: 'الحمراء',
    nameEn: 'Al Hamra',
    macroZone: 'central_jeddah',
    neighbors: ['al_andalus'],
  },
  al_mohammadiyyah: {
    id: 'al_mohammadiyyah',
    nameAr: 'المحمدية',
    nameEn: 'Al Mohammadiyyah',
    macroZone: 'central_jeddah',
    neighbors: ['al_basateen', 'al_naeem', 'al_shati', 'al_zahra', 'abhur_al_janoubiyah'],
  },
  al_naeem: {
    id: 'al_naeem',
    nameAr: 'النعيم',
    nameEn: 'Al Naeem',
    macroZone: 'central_jeddah',
    neighbors: ['al_zahra', 'al_salamah', 'al_mohammadiyyah', 'al_bawadi'],
  },
  al_basateen: {
    id: 'al_basateen',
    nameAr: 'البساتين',
    nameEn: 'Al Basateen',
    macroZone: 'central_jeddah',
    neighbors: ['al_mohammadiyyah', 'al_murjan', 'abhur_al_janoubiyah'],
  },
  al_murjan: {
    id: 'al_murjan',
    nameAr: 'المرجان',
    nameEn: 'Al Murjan',
    macroZone: 'central_jeddah',
    neighbors: ['al_basateen', 'al_shati', 'abhur_al_janoubiyah'],
  },
  abhur_al_janoubiyah: {
    id: 'abhur_al_janoubiyah',
    nameAr: 'أبحر الجنوبية',
    nameEn: 'Abhur Al Janoubiyah',
    macroZone: 'central_jeddah',
    neighbors: ['abhur_al_shamaliyah', 'al_basateen', 'al_mohammadiyyah', 'al_murjan'],
  },
  abhur_al_shamaliyah: {
    id: 'abhur_al_shamaliyah',
    nameAr: 'أبحر الشمالية',
    nameEn: 'Abhur Al Shamaliyah',
    macroZone: 'north_obhur',
    neighbors: ['abhur_al_janoubiyah'],
  },
  al_bawadi: {
    id: 'al_bawadi',
    nameAr: 'البوادي',
    nameEn: 'Al Bawadi',
    macroZone: 'central_jeddah',
    neighbors: ['al_salamah', 'al_naeem', 'al_faisaliyyah', 'al_safa', 'al_marwah'],
  },
  al_faisaliyyah: {
    id: 'al_faisaliyyah',
    nameAr: 'الفيصلية',
    nameEn: 'Al Faisaliyyah',
    macroZone: 'central_jeddah',
    neighbors: ['al_rawdah', 'al_salamah', 'al_bawadi', 'al_rehab'],
  },
  al_safa: {
    id: 'al_safa',
    nameAr: 'الصفا',
    nameEn: 'Al Safa',
    macroZone: 'central_jeddah',
    neighbors: ['al_marwah', 'al_rehab', 'al_bawadi'],
  },
  al_marwah: {
    id: 'al_marwah',
    nameAr: 'المروة',
    nameEn: 'Al Marwah',
    macroZone: 'central_jeddah',
    neighbors: ['al_safa', 'al_bawadi'],
  },
  al_rehab: {
    id: 'al_rehab',
    nameAr: 'الرحاب',
    nameEn: 'Al Rehab',
    macroZone: 'central_jeddah',
    neighbors: ['al_safa', 'al_faisaliyyah', 'al_andalus'],
  },
  al_naseem: {
    id: 'al_naseem',
    nameAr: 'النسيم',
    nameEn: 'Al Naseem',
    macroZone: 'south_jeddah',
    neighbors: ['al_faiha'],
  },
  al_faiha: {
    id: 'al_faiha',
    nameAr: 'الفيحاء',
    nameEn: 'Al Faiha',
    macroZone: 'south_jeddah',
    neighbors: ['al_naseem'],
  },
};
