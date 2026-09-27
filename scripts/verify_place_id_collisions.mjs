import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const livePlaceIds = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_place_ids.json'), 'utf8')));
const liveMapsUrls = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_maps_urls.json'), 'utf8')));
const liveBranches = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_live_branches.json'), 'utf8'));

const details = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_mexican_place_details.json'), 'utf8'));

console.log('--- CHECKING RESOLVED MEXICAN PLACE IDS AGAINST 453 LIVE BRANCHES ---');

let collisions = 0;
const resolvedPlaceIds = new Set();

for (const [k, v] of Object.entries(details)) {
  const pid = v.placeId;
  const canonicalUrl = `https://www.google.com/maps/search/?api=1&query_place_id=${pid}`;

  if (resolvedPlaceIds.has(pid)) {
    console.error(`INTERNAL COLLISION: Duplicate place ID ${pid} used within Mexican candidates (${v.name})`);
    collisions++;
  }
  resolvedPlaceIds.add(pid);

  if (livePlaceIds.has(pid)) {
    const existing = liveBranches.find(b => b.google_place_id === pid);
    console.log(`[EXTERNAL COLLISION] Place ID ${pid} (${v.name}) already exists in DB:`, existing);
    collisions++;
  }

  if (liveMapsUrls.has(canonicalUrl)) {
    const existing = liveBranches.find(b => b.google_maps_url === canonicalUrl);
    console.log(`[EXTERNAL COLLISION] Maps URL ${canonicalUrl} (${v.name}) already exists in DB:`, existing);
    collisions++;
  }
}

if (collisions === 0) {
  console.log('CLEAN! Zero Place ID or Maps URL collisions across all 453 live branches.');
  console.log(`All ${resolvedPlaceIds.size} resolved Place IDs are unique and new.`);
}
