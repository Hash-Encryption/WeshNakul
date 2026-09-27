import fs from 'node:fs';

const liveBranches = JSON.parse(fs.readFileSync('scripts/db_all_349_live_branches.json', 'utf8'));
const rawData = JSON.parse(fs.readFileSync('docs/research/jeddah-indian-raw-uploaded.json', 'utf8'));
const resolvedDirect = JSON.parse(fs.readFileSync('scripts/resolved_indian_places_direct.json', 'utf8'));

const livePlaceIds = new Map();
const liveMapsUrls = new Map();
for (const lb of liveBranches) {
  if (lb.google_place_id) livePlaceIds.set(lb.google_place_id, lb);
  if (lb.google_maps_url) liveMapsUrls.set(lb.google_maps_url, lb);
}

console.log('=== GLOBAL COLLISION CHECK WITH 349 LIVE PRODUCTION BRANCHES ===\n');

let collisionsFound = 0;

for (const b of rawData.brands) {
  for (const br of (b.branches || [])) {
    const key = `${b.canonical_name}::${br.branch_name}`;
    const direct = resolvedDirect[key];
    const placeId = br.google_place_id;
    const stdMapsUrl = placeId ? `https://www.google.com/maps/search/?api=1&query_place_id=${placeId}` : null;

    if (placeId && livePlaceIds.has(placeId)) {
      const coll = livePlaceIds.get(placeId);
      console.error(`COLLISION DETECTED on Place ID: ${placeId}`);
      console.error(`  Indian: [${b.canonical_name} - ${br.branch_name}]`);
      console.error(`  Live DB: [${coll.primary_category}] ${coll.brand_name_en} - ${coll.branch_name_en} (Rest ID: ${coll.restaurant_id})`);
      collisionsFound++;
    }

    if (stdMapsUrl && liveMapsUrls.has(stdMapsUrl)) {
      const coll = liveMapsUrls.get(stdMapsUrl);
      console.error(`COLLISION DETECTED on Maps URL: ${stdMapsUrl}`);
      console.error(`  Indian: [${b.canonical_name} - ${br.branch_name}]`);
      console.error(`  Live DB: [${coll.primary_category}] ${coll.brand_name_en} - ${coll.branch_name_en} (Rest ID: ${coll.restaurant_id})`);
      collisionsFound++;
    }
  }
}

console.log(`\nTotal collisions found: ${collisionsFound}`);
if (collisionsFound === 0) {
  console.log('ZERO Place ID and ZERO Maps URL collisions with live production database (349 branches)!');
}

// Let's also check if any brand name loosely matches existing live restaurants
console.log('\n--- BRAND NAME OVERLAP CHECK ---');
const liveBrandNames = [...new Set(liveBranches.map(b => b.brand_name_en.toLowerCase()))];
for (const b of rawData.brands) {
  const bName = b.canonical_name.toLowerCase();
  for (const lbName of liveBrandNames) {
    if (bName.includes(lbName) || lbName.includes(bName)) {
      console.log(`Brand similarity found: "${b.canonical_name}" vs DB "${lbName}"`);
    }
  }
}
