import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const res = JSON.parse(fs.readFileSync(path.join(__dirname, 'mexican_places_search_results.json'), 'utf8'));

for (const [k, v] of Object.entries(res)) {
  console.log('===', k, '=== (count:', v.count, ')');
  if (v.places.length === 0) {
    console.log('  NO PLACES FOUND');
  } else {
    v.places.slice(0, 3).forEach((p, idx) => {
      console.log(`  [${idx}] ${p.displayName} | id: ${p.id} | status: ${p.businessStatus}`);
      console.log(`      address: ${p.formattedAddress}`);
      console.log(`      loc: ${p.location?.latitude}, ${p.location?.longitude}`);
      console.log(`      rating: ${p.rating} (${p.userRatingCount})`);
    });
  }
}
