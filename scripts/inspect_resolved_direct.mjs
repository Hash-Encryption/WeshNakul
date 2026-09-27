import fs from 'node:fs';

const direct = JSON.parse(fs.readFileSync('scripts/resolved_italian_places_direct.json', 'utf8'));

console.log('Total entries in direct resolved:', Object.keys(direct).length);

for (const [placeId, data] of Object.entries(direct)) {
  console.log(`\n=== [${data.item?.brand}] ${data.item?.branch} (${placeId}) ===`);
  console.log(`  Name: ${data.name}`);
  console.log(`  Address: ${data.address}`);
  console.log(`  Short address: ${data.short_address}`);
  console.log(`  District En: ${data.district_en}`);
  console.log(`  Coords: ${data.latitude}, ${data.longitude}`);
  console.log(`  Rating: ${data.rating} (${data.user_rating_count})`);
  console.log(`  Status: ${data.operating_status}`);
  console.log(`  Phone: ${data.phone}`);
  console.log(`  Hours: ${data.hours_text ? data.hours_text.slice(0, 80) + '...' : null}`);
}
