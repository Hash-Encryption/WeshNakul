import fs from 'node:fs';
import { fetchPlaceDetailsDirect } from './fetch_place_helper.mjs';

const rawData = JSON.parse(fs.readFileSync('docs/research/jeddah-sandwiches-raw-uploaded.json', 'utf8'));

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const branchesToFetch = [];
  for (const b of rawData.brands) {
    for (const br of (b.branches || [])) {
      if (br.google_place_id) {
        branchesToFetch.push({
          brand_name: b.brand_name,
          branch_name: br.branch_name,
          place_id: br.google_place_id,
          raw_district: br.district,
          raw_address: br.address
        });
      }
    }
  }

  console.log(`Starting Google Places fetch for ${branchesToFetch.length} candidate branches...`);
  const results = {};

  for (let i = 0; i < branchesToFetch.length; i++) {
    const item = branchesToFetch[i];
    console.log(`[${i + 1}/${branchesToFetch.length}] Fetching ${item.brand_name} — ${item.branch_name} (${item.place_id})...`);
    const res = await fetchPlaceDetailsDirect(item.place_id);
    if (res.error) {
      console.error(`  -> ERROR: ${res.error}`);
      results[item.place_id] = { error: res.error, item };
    } else {
      console.log(`  -> SUCCESS: ${res.name} | Lat: ${res.latitude}, Lng: ${res.longitude} | Rating: ${res.rating} (${res.user_rating_count}) | Status: ${res.operating_status}`);
      results[item.place_id] = { ...res, original_item: item };
    }
    await delay(600);
  }

  fs.writeFileSync('scripts/resolved_sandwiches_places.json', JSON.stringify(results, null, 2));
  console.log('\nAll 28 branches processed. Saved to scripts/resolved_sandwiches_places.json.');
}

main().catch(console.error);
