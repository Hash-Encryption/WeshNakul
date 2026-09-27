import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envLocal = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

const targetPlaces = [
  { key: 'firegrill_zahra', placeId: 'ChIJOU1E5unawxURfjHoaCoVOyY', name: 'FireGrill - Al Zahra' },
  { key: 'firegrill_naeem', placeId: 'ChIJIc20ZovZwxURTkdtk-agTQg', name: 'FireGrill - Al Naeem' },
  { key: 'firegrill_ruwais', placeId: 'ChIJl_oaFLvPwxURfuENAVij11w', name: 'FireGrill - Al Ruwais' },
  { key: 'firegrill_shati', placeId: 'ChIJ93xpUA7bwxURpUX58ciaRkQ', name: 'FireGrill - Ash Shati' },
  { key: 'firegrill_asalah', placeId: 'ChIJb0Loqsl9wRURSzQb0G1oEb0', name: 'FireGrill - Al Asalah' },
  { key: 'firegrill_mall_of_arabia', placeId: 'ChIJ1Y8Uyb_XwxURC-5gpZtpJ20', name: 'FireGrill - Mall of Arabia' },
  { key: 'firegrill_shiraa', placeId: 'ChIJU8Frhv9jwRUROxy5aP6Qa_U', name: 'FireGrill - Al Shiraa' },
  { key: 'firegrill_fayha_closed', placeId: 'ChIJM1awNyLPwxURFcrxEe8fq8Y', name: 'FireGrill - Al Fayha (Closed)' },

  { key: 'cocina_zahra', placeId: 'ChIJnXiuyYTbwxURksI859BDH9M', name: 'Cocina La Cantina - Al Zahra' },
  { key: 'eds_taco_zahra', placeId: 'ChIJAfLe4yjbwxURJRHjzYoQA58', name: "ED'S Taco - Al Zahra" },

  { key: 'speakeasy_naeem', placeId: 'ChIJf9RLrLnbwxUR4OhTyqJ5iCQ', name: 'Speakeasy - Al Naeem' },
  { key: 'speakeasy_obhur_closed', placeId: 'ChIJW72IxmRjwRUR1fQvaT7IfsI', name: 'Speakeasy - Obhur (Closed)' },

  { key: 'chilis_hamra', placeId: 'ChIJpREyco3PwxUR_uqfIhqhJi0', name: "Chili's - Al Hamra" },
  { key: 'chilis_roshan_mall_closed', placeId: 'ChIJue7ZegnZwxUR9P6egcVGDVg', name: "Chili's - Roshan Mall (Closed)" },

  { key: 'casa_twist_muhammadiyyah', placeId: 'ChIJ_7LBUQDZwxURx4YyTVfAw5Q', name: 'Casa Twist - Al Muhammadiyyah' },
  { key: 'chiii_naeem', placeId: 'ChIJn4qafwDZwxURfJ4Hq3FSk5c', name: 'Chiii - Al Naeem' },
  { key: 'chalcos_zahra', placeId: 'ChIJ4-Sos8HbwxURGll1LNwCxko', name: 'Chalcos Mexican Grill - Al Zahra' },
  { key: 'tacomole_shati', placeId: 'ChIJH_2-MwDZwxURevswJ3aqm5w', name: 'Tacomole - Ash Shati' },
  { key: 'el_taco_loco_qryniah', placeId: 'ChIJOwRQLwC1wxURWZDE_FtRdeE', name: 'EL TACO LOCO - Al Qryniah' },
  { key: 'gyb_taco_rehab', placeId: 'ChIJo7aD9b3RwxUR6vfK_4kvdUM', name: 'Gyb Taco - Al Rehab' },
  { key: 'taco_in_naseem', placeId: 'ChIJq29kOwDPwxURX0eW9sWErz0', name: 'Taco In - An Naseem' },
  { key: 'kakt_uwalk', placeId: 'ChIJm4HefLfZwxURWEFXlUqNX00', name: 'KAKT - U Walk' }
];

async function fetchDetails(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,addressComponents,location,rating,userRatingCount,googleMapsUri,regularOpeningHours,businessStatus,nationalPhoneNumber,internationalPhoneNumber'
    }
  });
  if (!res.ok) {
    return { error: `HTTP ${res.status}: ${await res.text()}` };
  }
  return await res.json();
}

async function run() {
  const output = {};
  for (const item of targetPlaces) {
    console.log(`Fetching details for ${item.name} (${item.placeId})...`);
    const data = await fetchDetails(item.placeId);
    output[item.key] = {
      ...item,
      data
    };
    await new Promise(r => setTimeout(r, 100));
  }

  fs.writeFileSync(path.join(__dirname, 'all_mexican_place_details.json'), JSON.stringify(output, null, 2));
  console.log('Done! Written to scripts/all_mexican_place_details.json');
}

run().catch(console.error);
