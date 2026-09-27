import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

for (const b of raw.brands) {
  console.log(`BRAND: ${b.name_en} (${b.id}) - raw context_tags: ${JSON.stringify(b.context_tags)}, meal_fit: ${JSON.stringify(b.meal_fit)}`);
  for (const br of (b.branches || [])) {
    const p = br.google_place_id ? placesMap.get(br.google_place_id) : null;
    const hours = p?.regularOpeningHours?.weekdayDescriptions || [br.hours || 'N/A'];
    console.log(`  * ${br.name}: ${hours[0]}`);
  }
}
