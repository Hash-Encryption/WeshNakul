import fs from 'node:fs';

const livePlaceIds = new Set(JSON.parse(fs.readFileSync('scripts/db_all_349_place_ids.json', 'utf8')));
const liveMapsUrls = new Set(JSON.parse(fs.readFileSync('scripts/db_all_349_maps_urls.json', 'utf8')));
const liveBranches = JSON.parse(fs.readFileSync('scripts/db_all_349_live_branches.json', 'utf8'));

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-fatayer-raw-uploaded.json', 'utf8'));

console.log('=== CROSS-CATEGORY COLLISION CHECK AGAINST 349 LIVE BRANCHES ===');
console.log(`Live DB Place IDs: ${livePlaceIds.size}`);
console.log(`Live DB Maps URLs: ${liveMapsUrls.size}`);

const placeCollisions = [];
const urlCollisions = [];

for (const b of raw.brands) {
  for (const br of (b.branches || [])) {
    if (br.google_place_id && livePlaceIds.has(br.google_place_id)) {
      const match = liveBranches.find(lb => lb.google_place_id === br.google_place_id);
      placeCollisions.push({
        fatayer_brand: b.canonical_name,
        fatayer_branch: br.branch_name,
        place_id: br.google_place_id,
        matched_live_brand: match?.brand_name_en,
        matched_live_branch: match?.branch_name_en,
        category: match?.primary_category
      });
    }

    if (br.google_maps_url && liveMapsUrls.has(br.google_maps_url)) {
      urlCollisions.push({
        fatayer_brand: b.canonical_name,
        fatayer_branch: br.branch_name,
        url: br.google_maps_url
      });
    }

    // Also check normalized maps url
    if (br.google_place_id) {
      const normUrl = `https://www.google.com/maps/search/?api=1&query_place_id=${br.google_place_id}`;
      if (liveMapsUrls.has(normUrl)) {
        urlCollisions.push({
          fatayer_brand: b.canonical_name,
          fatayer_branch: br.branch_name,
          url: normUrl
        });
      }
    }
  }
}

console.log(`Place ID Collisions: ${placeCollisions.length}`);
if (placeCollisions.length > 0) {
  console.table(placeCollisions);
} else {
  console.log('Zero Place ID collisions with existing production catalog!');
}

console.log(`Maps URL Collisions: ${urlCollisions.length}`);
if (urlCollisions.length > 0) {
  console.table(urlCollisions);
} else {
  console.log('Zero Maps URL collisions with existing production catalog!');
}
