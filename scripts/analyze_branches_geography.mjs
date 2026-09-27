import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JEDDAH_DISTRICT_LIST, normalizeJeddahDistrict } from '../src/data/jeddahDistricts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawPath = path.join(rootDir, 'docs', 'research', 'jeddah-street-folk-food-raw-uploaded.json');
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const placesResolved = JSON.parse(fs.readFileSync(path.join(__dirname, 'street_folk_places_resolved.json'), 'utf8'));

const placesMap = new Map();
for (const p of placesResolved) {
  placesMap.set(p.placeId, p.data);
}

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));

console.log('=== BRANCH GEOGRAPHY & PLACE IDENTITY AUDIT ===\n');

for (const b of raw.brands) {
  console.log(`BRAND: ${b.name_en} (${b.id})`);
  for (const br of (b.branches || [])) {
    const pData = br.google_place_id ? placesMap.get(br.google_place_id) : null;
    const name = br.name;
    const rawDist = br.district;
    const normDist = normalizeJeddahDistrict(rawDist);

    // Let's also check if the Google formattedAddress contains clues for district
    const googleAddr = pData?.formattedAddress || '';
    
    console.log(`  BRANCH: ${name}`);
    console.log(`    Raw District: '${rawDist}' -> Normalized: ${normDist ? `'${normDist}'` : 'NULL (Outer)'}`);
    console.log(`    Raw Address: ${br.address}`);
    if (pData) {
      console.log(`    Google Name: ${pData.displayName?.text}`);
      console.log(`    Google Addr: ${pData.formattedAddress}`);
      console.log(`    Coords: ${pData.location?.latitude}, ${pData.location?.longitude}`);
      console.log(`    Rating: ${pData.rating} (${pData.userRatingCount} reviews)`);
      console.log(`    Status: ${pData.businessStatus}`);
      console.log(`    Hours: ${pData.regularOpeningHours?.weekdayDescriptions?.[0] || 'N/A'}`);
    } else {
      console.log(`    NO GOOGLE PLACE DATA (manual_review)`);
    }
    console.log('');
  }
}
