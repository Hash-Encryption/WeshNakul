import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchPlaceDetailsDirect } from './fetch_place_helper.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawPath = path.join(rootDir, 'docs', 'research', 'jeddah-seafood-raw-uploaded.json');
const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const cachePath = path.join(__dirname, 'resolved_seafood_places.json');

let cache = {};
if (fs.existsSync(cachePath)) {
  try {
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (e) {
    cache = {};
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const branchesToFetch = [];
  for (const b of rawData.brands) {
    for (const br of (b.branches || [])) {
      if (br.google_place_id) {
        branchesToFetch.push({
          brand_name: b.canonical_name,
          branch_name: br.branch_name,
          place_id: br.google_place_id,
          raw_district: br.canonical_district,
          raw_address: br.formatted_address
        });
      }
    }
  }

  console.log(`Total candidate branches to check: ${branchesToFetch.length}`);

  for (let i = 0; i < branchesToFetch.length; i++) {
    const item = branchesToFetch[i];
    if (cache[item.place_id] && cache[item.place_id].latitude && cache[item.place_id].longitude) {
      console.log(`[${i + 1}/${branchesToFetch.length}] CACHED: ${item.brand_name} - ${item.branch_name} (${item.place_id}) -> (${cache[item.place_id].latitude}, ${cache[item.place_id].longitude})`);
      continue;
    }

    console.log(`[${i + 1}/${branchesToFetch.length}] FETCHING: ${item.brand_name} - ${item.branch_name} (${item.place_id})...`);
    const res = await fetchPlaceDetailsDirect(item.place_id);

    if (res.error) {
      console.error(`  -> ERROR for ${item.place_id}: ${res.error}`);
      cache[item.place_id] = { error: res.error, item };
    } else {
      console.log(`  -> SUCCESS: ${res.name} | Lat: ${res.latitude}, Lng: ${res.longitude} | Status: ${res.operating_status}`);
      cache[item.place_id] = {
        ...res,
        original_item: item
      };
    }

    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    await delay(350);
  }

  console.log('\nAll branches processed. Checking summary:');
  let successCount = 0;
  let failCount = 0;
  for (const item of branchesToFetch) {
    const c = cache[item.place_id];
    if (c && c.latitude && c.longitude) {
      successCount++;
    } else {
      failCount++;
      console.log(`  MISSING COORDS: ${item.brand_name} - ${item.branch_name} (${item.place_id})`);
    }
  }
  console.log(`Success: ${successCount} / ${branchesToFetch.length}, Failed: ${failCount}`);
}

main().catch(console.error);
