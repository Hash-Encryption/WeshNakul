import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

// Verified place IDs across our 16 brands
const PLACE_IDS = [
  // Raydan
  'ChIJg9bwO2N8wRURHt_T0Rzf_9A', // Hamdaniyah Al Majed
  'ChIJ08FVqph8wRUR_FdL0gaLmh8', // Hamdaniyah Al Falah
  'ChIJh_8wm__NwxURCB3xm75aoTs', // Naseem
  'ChIJG9SGUAFjwRURtnZvgfbECpw', // Obhur
  'ChIJAQAAABTRwxURnjXuvVohR6I', // Safa
  'ChIJLdb_U2TRwxUR_IuGLpMDYeU', // Samer
  'ChIJC02hBabQwxUR0ZYW3K24iBM', // Hira (An Nuzhah)
  // Raydan closed
  'ChIJl9VGbMHNwxURMVzg03GMbEw', // Al Haramain / Abrq Al-Rughama (CLOSED)
  'ChIJN028d4PTwxURw6YS5HQH_vA', // Taysir (CLOSED)
  'ChIJj-mg-jfLwxUR4fEzk7907NU', // Sanabel Express (CLOSED)
  'ChIJrbbduat7wRURFberS4poFG8', // Hay Al Riyadh (CLOSED)
  // Al Romansiah
  'ChIJacUSc5DRwxURiis7IF3O_Ho', // Bawadi
  'ChIJuye_rRJ9wRUR6yRl-SmRjQc', // Hamdaniyah
  'ChIJS2-RawDRwxURgWHa6QRNWMY', // Safa
  'ChIJI8cwBADLwxURj9Vpqjl8n1k', // Sanabel
  // Al Saddah
  'ChIJy7kH2EHawxUR5sCHxb9laV0', // Hira (Al Nahdah)
  'ChIJI-3znwXQwxURN8ovm8z7GG4', // Tahlia (Al Rawdah)
  'ChIJrz0lluvPwxURKf2w5x9PAJs', // Palestine (Al Ruwais)
  // Almazaq Al Bukhari
  'ChIJv_m5c3rPwxURwGzBoqNrKvQ', // Naseem
  'ChIJc_zD4gnRwxURlCOIQkK47ts', // Safa (Prince Mutaib flagship)
  'ChIJtXGnPzrTwxURnctgjBZCOII', // Samer
  'ChIJk8bKM-R9wRURPYnmwFsnCSU', // Hamdaniyah
  'ChIJT_QFpkUzwhURW9cSbPtroEE', // Harazat
  'ChIJ00v8XgBjwRURT3w1azRcnx8', // South Obhur
  'ChIJDWzcDwDbwxUR_S3kh1w1heA', // Shati / Zahra
  'ChIJnVhCcpTRwxURpxL0iZMM2lw', // Rehab (CLOSED)
  // Hashi Basha
  'ChIJ5-sWd6bLwxURpBpOHi25buY', // Ajawid
  'ChIJ44xNNhHNwxUR6FXsE1JsUWg', // Naseem
  'ChIJZZ_X7WLRwxUR6F4zRVLEIO8', // Safa
  'ChIJgdj9AZ7RwxURHFxBfC9KZZg', // Samer
  'ChIJf03UKSbTwxURNAPKm8zzn2U', // Muraikh
  // Eleyk Al Bukhari
  'ChIJ9QM1ksfRwxURtyB2fwrsAnM', // Faisaliyah
  'ChIJ407RJBTbwxURDnEblLv9uQw', // Salamah / Sari
  'ChIJTYic5XXRwxURinnDtlihlBY', // Salamah / Al Sudairi
  'ChIJG1kthrfLwxURtbIP3SEOSXo', // Sanabel
  'ChIJnSVuCX7NwxUR5AlFnAscpp0', // Mada'en Al-Fahd
  // Kabset Elham
  'ChIJKauhIgDbwxURMVenYDlDt9E', // Al Zahra / Al Batarji
  // Sarmad
  'ChIJxf2GGBrPwxURJdsAMM7PORI', // Al-Baghdadiyah Al-Sharqiyah
  // Labbani Fakher
  'ChIJGbh1lUTRwxURsgxasS7gRB0', // Samer / Al Rabie (Ankara St)
  'ChIJP8iEJwDXwxURlBl1fKn4OAc', // Al Rayaan
  // Mandi World
  'ChIJZeUPAm3RwxUR5QVhnLtcZPU', // Rawdah
  'ChIJ3aph_hPRwxURc2dm1zO9OPo', // Safa
  'ChIJITO5fADbwxURuIbsAzT5icU', // Nahdah (CLOSED)
  // Hashi Bin Hamoud
  'ChIJ_cocG7x7wRURd6BZrrKEtB8', // Usfan Rd / Jeddah
  // Fnoon Al Shawaya
  'ChIJX3O3qFnRwxURS62jGEWbTws', // Samer
  'ChIJ33te927PwxURydH1EnLSA2o', // Sharafiyah
  'ChIJ3Zt-bQAzwhUR2jTU12Yave0', // Harazat
  'ChIJK7ZcACcxwhUR1EuwsI1trro', // Bahrah (Excluded)
  // Ali Hanash
  'ChIJu0pOYQDTwxURcTye8bqlAG8', // Muraikh
  // Ghamim
  'ChIJG_F8XUjTwxURviMrQ58cAgU', // Muraikh
  'ChIJYVaVUwB9wRURQipxT8Qz2a4', // Hamdaniyah
  // Mandi Al Hejaz
  'ChIJodYd2nbQwxURNtR0sXeSWjY', // Rawdah (Qassem Zeinal)
  // Al Shadawi Ras Al Mandi
  'ChIJbR80WRvPwxURbD1TRq3Xx9A'  // Al-Balad / Bab Makkah
];

async function fetchPlaceDetails(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,addressComponents,location,rating,userRatingCount,googleMapsUri,businessStatus,regularOpeningHours,nationalPhoneNumber,internationalPhoneNumber'
      }
    });
    if (!res.ok) {
      console.error(`Failed ${placeId}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Error ${placeId}:`, err.message);
    return null;
  }
}

async function main() {
  console.log(`Fetching rich place details for ${PLACE_IDS.length} Place IDs...`);
  const details = {};
  for (const pid of PLACE_IDS) {
    process.stdout.write(`Fetching ${pid}... `);
    const d = await fetchPlaceDetails(pid);
    if (d) {
      details[pid] = d;
      console.log(`OK: ${d.displayName?.text} [${d.businessStatus}]`);
    } else {
      console.log(`FAILED`);
    }
    await new Promise(r => setTimeout(r, 150));
  }

  const outPath = path.join(rootDir, 'tmp', 'saudi_rice_places_details_cache.json');
  fs.writeFileSync(outPath, JSON.stringify(details, null, 2), 'utf8');
  console.log(`Saved details cache to ${outPath}`);
}

main();
