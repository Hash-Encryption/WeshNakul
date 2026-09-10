import { JEDDAH_DISTRICT_LIST } from '../data/jeddahDistricts';

export interface CityData {
  id: string;
  nameAr: string;
  nameEn: string;
  districts: {
    id?: string;
    nameAr: string;
    nameEn: string;
  }[];
}

export const SAUDI_CITIES: CityData[] = [
  {
    id: 'jeddah',
    nameAr: 'جدة',
    nameEn: 'Jeddah',
    districts: JEDDAH_DISTRICT_LIST.map(({ id, nameAr, nameEn }) => ({ id, nameAr, nameEn })),
  },
  {
    id: 'riyadh',
    nameAr: 'الرياض',
    nameEn: 'Riyadh',
    districts: [
      { nameAr: 'النرجس', nameEn: 'Al-Narjis' },
      { nameAr: 'الملقا', nameEn: 'Al-Malqa' },
      { nameAr: 'حطين', nameEn: 'Hittin' },
      { nameAr: 'الصحافة', nameEn: 'Al-Sahafa' },
      { nameAr: 'الياسمين', nameEn: 'Al-Yasmin' },
      { nameAr: 'العليا', nameEn: 'Al-Olaya' },
      { nameAr: 'السليمانية', nameEn: 'Al-Sulaimaniyah' },
      { nameAr: 'العقيق', nameEn: 'Al-Aqeeq' },
      { nameAr: 'قرطبة', nameEn: 'Qurtubah' },
      { nameAr: 'اليرموك', nameEn: 'Al-Yarmouk' },
    ],
  },
  {
    id: 'dammam',
    nameAr: 'الدمام',
    nameEn: 'Dammam',
    districts: [
      { nameAr: 'الشاطئ الشرقي', nameEn: 'East Shati' },
      { nameAr: 'المزروعية', nameEn: 'Al-Mazrooaiah' },
      { nameAr: 'الفيصلية', nameEn: 'Al-Faisaliyah' },
      { nameAr: 'الفردوس', nameEn: 'Al-Fardous' },
      { nameAr: 'النورس', nameEn: 'Al-Nawras' },
      { nameAr: 'طيبة', nameEn: 'Taybah' },
    ],
  },
  {
    id: 'khobar',
    nameAr: 'الخبر',
    nameEn: 'Khobar',
    districts: [
      { nameAr: 'العليا', nameEn: 'Al-Olaya' },
      { nameAr: 'الحزام الذهبي', nameEn: 'Golden Belt' },
      { nameAr: 'الراكة', nameEn: 'Al-Rakah' },
      { nameAr: 'الكورنيش', nameEn: 'Corniche' },
      { nameAr: 'الهدا', nameEn: 'Al-Hada' },
    ],
  },
  {
    id: 'makkah',
    nameAr: 'مكة المكرمة',
    nameEn: 'Makkah',
    districts: [
      { nameAr: 'العوالي', nameEn: 'Al-Awali' },
      { nameAr: 'الشوقية', nameEn: 'Al-Shawqiyyah' },
      { nameAr: 'بطحاء قريش', nameEn: 'Batha Quraish' },
      { nameAr: 'العزيزية', nameEn: 'Al-Aziziyyah' },
    ],
  },
  {
    id: 'madinah',
    nameAr: 'المدينة المنورة',
    nameEn: 'Madinah',
    districts: [
      { nameAr: 'سلطانة', nameEn: 'Sultana' },
      { nameAr: 'قباء', nameEn: 'Quba' },
      { nameAr: 'الخالدية', nameEn: 'Al-Khalidiyyah' },
      { nameAr: 'الهجرة', nameEn: 'Al-Hijrah' },
    ],
  },
];
