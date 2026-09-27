import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load API key from .env.local
const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

if (!API_KEY) {
  console.error('ERROR: No GOOGLE_MAPS_KEY in .env.local');
  process.exit(1);
}

async function searchPlaces(query) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.businessStatus,places.addressComponents,places.nationalPhoneNumber,places.regularOpeningHours'
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'ar'
      })
    });
    if (!res.ok) {
      console.error(`Error searching "${query}": ${res.status} ${await res.text()}`);
      return [];
    }
    const data = await res.json();
    return data.places || [];
  } catch (err) {
    console.error(`Fetch exception for "${query}":`, err.message);
    return [];
  }
}

// Brand candidate queries
const BRAND_SEARCHES = [
  {
    id: 'raydan',
    en: 'Raydan',
    ar: 'ريدان',
    candidates: [
      { name: 'Hamdaniyah Al Majed', q: 'ريدان الحمدانية شارع المجد جدة' },
      { name: 'Hamdaniyah Al Falah', q: 'ريدان الحمدانية الفلاح جدة' },
      { name: 'Naseem', q: 'ريدan النسيم جدة' },
      { name: 'Obhur', q: 'ريدان ابحر جدة' },
      { name: 'Al Haramain / Abrq Al-Rughama', q: 'ريدان الحرمين ابرق الرغامة جدة' },
      { name: 'Taysir', q: 'ريدان التيسير جدة' },
      { name: 'Safa', q: 'ريدان الصفا الشربتلي جدة' },
      { name: 'Samer', q: 'ريدان السامر جدة' },
      { name: 'Hira', q: 'ريدان شارع حراء جدة' },
      { name: 'Sanabel Express', q: 'ريدان السنابل اكسبرس جدة' },
      { name: 'Hay Al Riyadh', q: 'ريدان حي الرياض جدة' }
    ],
    generalQueries: ['مطعم ريدان جدة', 'Raydan restaurant Jeddah']
  },
  {
    id: 'al_romansiah',
    en: 'Al Romansiah',
    ar: 'الرومانسية',
    candidates: [
      { name: 'Bawadi', q: 'مطعم الرومانسية البوادي قريش جدة' },
      { name: 'Hamdaniyah', q: 'مطعم الرومانسية الحمدانية جدة' },
      { name: 'Safa', q: 'مطعم الرومانسية الصفا جدة' },
      { name: 'Sanabel', q: 'مطعم الرومانسية السنابل جدة' }
    ],
    generalQueries: ['مطاعم الرومانسية جدة', 'Al Romansiah restaurant Jeddah']
  },
  {
    id: 'al_saddah',
    en: 'Al Saddah',
    ar: 'السدة',
    candidates: [
      { name: 'Hira', q: 'مطعم السدة حراء جدة' },
      { name: 'Tahlia', q: 'مطعم السدة التحلية جدة' },
      { name: 'Palestine', q: 'مطعم السدة فلسطين جدة' }
    ],
    generalQueries: ['مطاعم السدة جدة', 'Al Saddah restaurant Jeddah']
  },
  {
    id: 'almazaq_al_bukhari',
    en: 'Almazaq Al Bukhari',
    ar: 'المذاق البخاري',
    candidates: [
      { name: 'Naseem', q: 'المذاق البخاري النسيم جدة' },
      { name: 'Rehab', q: 'المذاق البخاري الرحاب جدة' },
      { name: 'Safa', q: 'المذاق البخاري الصفا جدة' },
      { name: 'Samer', q: 'المذاق البخاري السامر جدة' },
      { name: 'Hamdaniyah', q: 'المذاق البخاري الحمدانية جدة' },
      { name: 'Harazat', q: 'المذاق البخاري الحرازات جدة' },
      { name: 'South Obhur', q: 'المذاق البخاري ابحر الجنوبية جدة' },
      { name: 'Shati', q: 'المذاق البخاري الشاطئ جدة' }
    ],
    generalQueries: ['المذاق البخاري جدة']
  },
  {
    id: 'hashi_basha',
    en: 'Hashi Basha',
    ar: 'حاشي باشا',
    candidates: [
      { name: 'Ajawid', q: 'حاشي باشا الأجاويد جدة' },
      { name: 'Naseem', q: 'حاشي باشا النسيم جدة' },
      { name: 'Safa', q: 'حاشي باشا الصفا جدة' },
      { name: 'Samer', q: 'حاشي باشا السامر جدة' },
      { name: 'Muraikh', q: 'حاشي باشا مريخ جدة' }
    ],
    generalQueries: ['حاشي باشا جدة', 'Hashi Basha Jeddah']
  },
  {
    id: 'eleyk_al_bukhari',
    en: 'Eleyk Al Bukhari',
    ar: 'إليك البخاري',
    candidates: [
      { name: 'Faisaliyah', q: 'إليك البخاري الفيصلية جدة' },
      { name: 'Salamah / Sari', q: 'إليك البخاري صاري السلامة جدة' },
      { name: 'Sanabel', q: 'إليك البخاري السنابل جدة' },
      { name: 'Mada\'en Al-Fahd', q: 'إليك البخاري مدائن الفهد جدة' }
    ],
    generalQueries: ['مطعم إليك البخاري جدة', 'Eleyk Al Bukhari Jeddah']
  },
  {
    id: 'kabset_elham',
    en: 'Kabset Elham',
    ar: 'كبسة إلهام',
    candidates: [
      { name: 'Al Batarji / Zahra', q: 'كبسة إلهام البترجي الزهراء جدة' }
    ],
    generalQueries: ['كبسة إلهام جدة', 'Kabset Elham Jeddah']
  },
  {
    id: 'sarmad',
    en: 'Sarmad',
    ar: 'سرمد',
    candidates: [
      { name: 'Al-Baghdadiyah Al-Sharqiyah', q: 'مطعم سرمد البغدادية الشرقية جدة' }
    ],
    generalQueries: ['مطعم سرمد جدة', 'Sarmad restaurant Jeddah']
  },
  {
    id: 'labbani_fakher',
    en: 'Labbani Fakher',
    ar: 'لباني فاخر',
    candidates: [
      { name: 'Samer / Al Rayaan', q: 'لباني فاخر السامر الريان جدة' }
    ],
    generalQueries: ['مطعم لباني فاخر جدة', 'Labbani Fakher Jeddah']
  },
  {
    id: 'mandi_world',
    en: 'Mandi World',
    ar: 'مندي ورلد',
    candidates: [
      { name: 'Rawdah', q: 'مندي ورلد الروضة جدة' },
      { name: 'Safa', q: 'مندي ورلد الصفا جدة' },
      { name: 'Nahdah', q: 'مندي ورلد النهضة جدة' }
    ],
    generalQueries: ['مندي ورلد جدة', 'Mandi World Jeddah']
  },
  {
    id: 'hashi_bin_hamoud',
    en: 'Hashi Bin Hamoud',
    ar: 'حاشي بن حمود',
    candidates: [
      { name: 'Jeddah verified location', q: 'حاشي بن حمود جدة' }
    ],
    generalQueries: ['مطعم حاشي بن حمود جدة', 'Hashi Bin Hamoud Jeddah']
  },
  {
    id: 'fnoon_al_shawaya',
    en: 'Fnoon Al Shawaya',
    ar: 'فنون الشواية',
    candidates: [
      { name: 'Samer', q: 'فنون الشواية السامر جدة' },
      { name: 'Sharafiyah', q: 'فنون الشواية الشرفية جدة' },
      { name: 'Hay Al Riyadh', q: 'فنون الشواية حي الرياض جدة' },
      { name: 'Harazat', q: 'فنون الشواية الحرازات جدة' }
    ],
    generalQueries: ['فنون الشواية جدة', 'Fnoon Al Shawaya Jeddah']
  },
  {
    id: 'ali_hanash',
    en: 'Ali Hanash',
    ar: 'علي حنش',
    candidates: [
      { name: 'Muraikh', q: 'مطعم علي حنش مريخ جدة' }
    ],
    generalQueries: ['مطعم علي حنش جدة', 'Ali Hanash Jeddah']
  },
  {
    id: 'ghamim',
    en: 'Ghamim',
    ar: 'غميم',
    candidates: [
      { name: 'Muraikh', q: 'مطعم غميم مريخ جدة' },
      { name: 'Hamdaniyah', q: 'مطعم غميم الحمدانية جدة' }
    ],
    generalQueries: ['مطعم غميم جدة', 'Ghamim restaurant Jeddah']
  },
  {
    id: 'mandi_al_hejaz',
    en: 'Mandi Al Hejaz',
    ar: 'مندي الحجاز',
    candidates: [
      { name: 'Rawdah — Qassem Zeinah', q: 'مندي الحجاز قاسم زينة الروضة جدة' }
    ],
    generalQueries: ['مندي الحجاز جدة', 'Mandi Al Hejaz Jeddah']
  },
  {
    id: 'al_shadawi_ras_al_mandi',
    en: 'Al Shadawi Ras Al Mandi',
    ar: 'الشدوي لرأس المندي',
    candidates: [
      { name: 'Al-Balad / Historic Jeddah — Souq Bab Makkah', q: 'الشدوي لرأس المندي باب مكة البلد جدة' }
    ],
    generalQueries: ['الشدوي لرأس المندي جدة', 'مطعم الشدوي جدة']
  }
];

async function main() {
  const results = {};
  console.log('Starting Google Places Search for 16 brands...');

  for (const b of BRAND_SEARCHES) {
    console.log(`\n=== Brand: ${b.en} (${b.ar}) ===`);
    results[b.id] = {
      brand: b,
      candidates: {},
      generalPlaces: []
    };

    // Candidate specific queries
    for (const cand of b.candidates) {
      console.log(`  Searching candidate: ${cand.name} (${cand.q})`);
      const places = await searchPlaces(cand.q);
      results[b.id].candidates[cand.name] = places;
      // Sleep 250ms to be polite
      await new Promise(r => setTimeout(r, 250));
    }

    // General queries
    for (const gq of b.generalQueries) {
      console.log(`  Searching general: ${gq}`);
      const gplaces = await searchPlaces(gq);
      results[b.id].generalPlaces.push(...gplaces);
      await new Promise(r => setTimeout(r, 250));
    }
  }

  const outPath = path.join(rootDir, 'tmp', 'saudi_rice_places_raw.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nDone! Saved raw places to ${outPath}`);
}

main();
