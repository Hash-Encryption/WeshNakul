import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const liveBranches = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_live_branches.json'), 'utf8'));
const liveBrands = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_brands.json'), 'utf8'));
const livePlaceIds = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_place_ids.json'), 'utf8')));
const liveMapsUrls = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_maps_urls.json'), 'utf8')));

const rawMexican = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs', 'research', 'jeddah-mexican-raw-uploaded.json'), 'utf8'));

console.log('--- GLOBAL COLLISION AUDIT: MEXICAN VS 453 LIVE BRANCHES / 145 BRANDS ---');

let brandCollisions = 0;
let branchCollisions = 0;

for (const mb of rawMexican.brands) {
  const normMbName = mb.canonical_name.toLowerCase().trim();
  const brandMatch = liveBrands.find(b => 
    b.id.toLowerCase() === mb.id.toLowerCase() ||
    b.name_en.toLowerCase().trim() === normMbName ||
    (mb.arabic_name && b.name_ar && b.name_ar.includes(mb.arabic_name))
  );

  if (brandMatch) {
    brandCollisions++;
    console.log(`[BRAND MATCH] Mexican brand '${mb.canonical_name}' matches live brand '${brandMatch.name_en}' (id: ${brandMatch.id}, cat: ${brandMatch.primary_category})`);
  }

  for (const br of (mb.branches || [])) {
    if (br.google_place_id && livePlaceIds.has(br.google_place_id)) {
      branchCollisions++;
      const matchBr = liveBranches.find(x => x.google_place_id === br.google_place_id);
      console.log(`[PLACE ID COLLISION] Branch '${br.branch_name}' has place_id ${br.google_place_id} already in DB:`, matchBr);
    }
    if (br.google_maps_url && liveMapsUrls.has(br.google_maps_url)) {
      branchCollisions++;
      const matchBr = liveBranches.find(x => x.google_maps_url === br.google_maps_url);
      console.log(`[MAPS URL COLLISION] Branch '${br.branch_name}' has maps_url ${br.google_maps_url} already in DB:`, matchBr);
    }
  }
}

if (brandCollisions === 0 && branchCollisions === 0) {
  console.log('No brand or branch collisions found between raw Mexican source and existing 145 live brands / 453 live branches.');
  console.log('All 14 Mexican brands are NEW RESTAURANTS (insert).');
}
