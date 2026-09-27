import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));

console.log(`Total brands: ${raw.brands.length}`);
let totalBranches = 0;
let withPlaceId = 0;
let withGooGl = 0;
let withNoMaps = 0;
let withCoords = 0;

for (const brand of raw.brands) {
  const branches = brand.physical_jeddah_branches || [];
  totalBranches += branches.length;
  console.log(`\nBrand: ${brand.canonical_name} (${branches.length} branches)`);
  for (const b of branches) {
    if (b.latitude != null && b.longitude != null) withCoords++;
    if (b.google_place_id) {
      withPlaceId++;
    } else if (b.google_maps_url && b.google_maps_url.includes('goo.gl')) {
      withGooGl++;
      console.log(`  [Goo.gl]: ${b.branch_name} -> ${b.google_maps_url}`);
    } else {
      withNoMaps++;
      console.log(`  [No Maps/No PlaceID]: ${b.branch_name} | Address: ${b.formatted_address}`);
    }
  }
}

console.log('\n--- SUMMARY ---');
console.log(`Total branches: ${totalBranches}`);
console.log(`With Place ID: ${withPlaceId}`);
console.log(`With Goo.gl URL (no place ID): ${withGooGl}`);
console.log(`With No Maps URL & No Place ID: ${withNoMaps}`);
console.log(`With Coords: ${withCoords}`);
