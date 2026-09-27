import fs from 'node:fs';

const baselinePlaceIds = JSON.parse(fs.readFileSync('scripts/db_all_349_place_ids.json', 'utf8'));
const baselineMapsUrls = JSON.parse(fs.readFileSync('scripts/db_all_349_maps_urls.json', 'utf8'));

const pizzaOverlapPlaceIds = new Set([
  'ChIJL1hhI4zbwxURYcBSwlTBhLo', // Jon & Vinny's
  'ChIJM2DnNgDRwxUR2Z5xk02gukQ', // Napoli Blu
  'ChIJc-aQA9PbwxUR2cOZdM6POTE', // Pizzalio
  'ChIJc_9rnWbawxURdqShiels-ow', // Vera Pizza Zahra
  'ChIJUyizioNjwRURBwf0xqdZ0P4', // Vera Pizza Obhur
  'ChIJwyXLvoXPwxURmPwwIPOhNPk', // Pizza Lenuo
  'ChIJOd4ucWnbwxUREsfKPgbPHMc', // il Postino Sari
  'ChIJhfNya6HZwxURtxSMFrcWVnE'  // il Postino Murjan
]);

const resolved = JSON.parse(fs.readFileSync('scripts/resolved_italian_places_direct.json', 'utf8'));

console.log('Checking collisions for non-pizza Italian branches against 349 baseline...');
let collisions = 0;

for (const [placeId, data] of Object.entries(resolved)) {
  const isPizzaOverlap = pizzaOverlapPlaceIds.has(placeId);
  const inBaseline = baselinePlaceIds.includes(placeId);

  if (isPizzaOverlap) {
    if (inBaseline) {
      console.log(`[EXPECTED OVERLAP] ${data.item?.brand} — ${data.item?.branch} (${placeId}) exists in Pizza baseline.`);
    } else {
      console.error(`[ERROR] Pizza overlap ${placeId} not found in baseline!`);
      collisions++;
    }
  } else {
    if (inBaseline) {
      console.error(`[ACCIDENTAL COLLISION] Non-pizza branch ${data.item?.brand} — ${data.item?.branch} (${placeId}) collided with existing baseline!`);
      collisions++;
    } else {
      console.log(`[CLEAN NEW BRANCH] ${data.item?.brand} — ${data.item?.branch} (${placeId}) is unique.`);
    }
  }
}

console.log(`\nTotal accidental collisions: ${collisions}`);
