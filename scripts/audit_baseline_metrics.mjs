import fs from 'node:fs';

const branches = JSON.parse(fs.readFileSync('scripts/db_all_349_live_branches.json', 'utf8'));
const placeIds = JSON.parse(fs.readFileSync('scripts/db_all_349_place_ids.json', 'utf8'));
const mapsUrls = JSON.parse(fs.readFileSync('scripts/db_all_349_maps_urls.json', 'utf8'));

const brands = new Set(branches.map(b => b.restaurant_id));
const categories = [...new Set(branches.map(b => b.primary_category))];
const canonical = branches.filter(b => b.district !== null);
const outer = branches.filter(b => b.district === null);

console.log('Production Brands count:', brands.size);
console.log('Production Branches count:', branches.length);
console.log('Canonical branches:', canonical.length);
console.log('Outer/caution branches:', outer.length);
console.log('Live categories:', categories);

const dupPlaces = placeIds.filter((p, i) => placeIds.indexOf(p) !== i);
const dupUrls = mapsUrls.filter((u, i) => mapsUrls.indexOf(u) !== i);
console.log('Duplicate Place IDs in DB:', dupPlaces.length);
console.log('Duplicate Maps URLs in DB:', dupUrls.length);

// Category breakdown
const catBreakdown = {};
for (const b of branches) {
  catBreakdown[b.primary_category] = (catBreakdown[b.primary_category] || 0) + 1;
}
console.log('Branches per category:', catBreakdown);
