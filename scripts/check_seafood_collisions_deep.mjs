import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const raw = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs', 'research', 'jeddah-seafood-raw-uploaded.json'), 'utf8'));
const resolved = JSON.parse(fs.readFileSync(path.join(__dirname, 'resolved_seafood_places.json'), 'utf8'));

const dbBranches = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_live_branches.json'), 'utf8'));
const dbBrands = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_brands.json'), 'utf8'));
const dbPlaceIds = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_place_ids.json'), 'utf8')));
const dbMapsUrls = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_maps_urls.json'), 'utf8')));

console.log('=== DEEP COLLISION AUDIT AGAINST 453 LIVE BRANCHES & 145 BRANDS ===');

// 1. Place IDs
const placeIdCollisions = [];
for (const b of raw.brands) {
  for (const br of (b.branches || [])) {
    if (dbPlaceIds.has(br.google_place_id)) {
      const match = dbBranches.find(x => x.google_place_id === br.google_place_id);
      placeIdCollisions.push({ seafood_brand: b.canonical_name, seafood_branch: br.branch_name, db_brand: match.brand_name_en, db_branch: match.branch_name_en, place_id: br.google_place_id });
    }
  }
}
console.log(`Place ID collisions: ${placeIdCollisions.length}`);
if (placeIdCollisions.length > 0) console.table(placeIdCollisions);

// 2. Maps URLs
const mapsUrlCollisions = [];
for (const b of raw.brands) {
  for (const br of (b.branches || [])) {
    if (dbMapsUrls.has(br.google_maps_url)) {
      const match = dbBranches.find(x => x.google_maps_url === br.google_maps_url);
      mapsUrlCollisions.push({ seafood_brand: b.canonical_name, seafood_branch: br.branch_name, db_brand: match.brand_name_en, url: br.google_maps_url });
    }
  }
}
console.log(`Maps URL collisions: ${mapsUrlCollisions.length}`);
if (mapsUrlCollisions.length > 0) console.table(mapsUrlCollisions);

// 3. Brand names (English, Arabic, Levenshtein / token match)
const brandCollisions = [];
for (const b of raw.brands) {
  const normEn = b.canonical_name.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const dbb of dbBrands) {
    const dbNormEn = dbb.name_en.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normEn === dbNormEn || (b.arabic_name && dbb.name_ar && b.arabic_name.trim() === dbb.name_ar.trim())) {
      brandCollisions.push({ seafood: b.canonical_name, db: dbb.name_en, cat: dbb.primary_category, id: dbb.id });
    }
  }
}
console.log(`Brand name exact matches: ${brandCollisions.length}`);
if (brandCollisions.length > 0) console.table(brandCollisions);

// 4. Coordinates proximity (< 30 meters)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const coordNearMatches = [];
for (const b of raw.brands) {
  for (const br of (b.branches || [])) {
    const p = resolved[br.google_place_id];
    if (p && p.latitude && p.longitude) {
      for (const dbb of dbBranches) {
        if (dbb.latitude && dbb.longitude) {
          const dist = getDistance(p.latitude, p.longitude, dbb.latitude, dbb.longitude);
          if (dist < 40) { // closer than 40 meters
            coordNearMatches.push({
              seafood: `${b.canonical_name} - ${br.branch_name}`,
              db: `${dbb.brand_name_en} - ${dbb.branch_name_en} (${dbb.primary_category})`,
              distanceMeters: Math.round(dist)
            });
          }
        }
      }
    }
  }
}
console.log(`Branch coordinate near-matches (< 40m, e.g. same mall or plaza): ${coordNearMatches.length}`);
if (coordNearMatches.length > 0) console.table(coordNearMatches);
