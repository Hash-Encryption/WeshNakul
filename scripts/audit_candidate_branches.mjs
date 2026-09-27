import fs from 'node:fs';
import { JEDDAH_DISTRICT_LIST, normalizeJeddahDistrict } from '../src/data/jeddahDistricts.ts';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-grills-raw-uploaded.json', 'utf8'));
const resolved = JSON.parse(fs.readFileSync('scripts/resolved_grills_places.json', 'utf8'));
const dbPlaceIds = new Set(JSON.parse(fs.readFileSync('scripts/db_all_306_place_ids.json', 'utf8')));
const dbMapsUrls = new Set(JSON.parse(fs.readFileSync('scripts/db_all_306_maps_urls.json', 'utf8')));

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));

console.log('--- 30 CANONICAL DISTRICTS ---');
console.log([...CANONICAL_30].join(', '));
console.log('\n--- AUDITING ALL 44 BRANCHES ---');

let branchIdx = 0;
const auditedBranches = [];

for (const b of raw.brands) {
  for (const br of (b.branches || [])) {
    branchIdx++;
    const pid = br.google_place_id;
    const res = pid ? resolved[pid] : null;

    const lat = res?.latitude ?? br.latitude;
    const lng = res?.longitude ?? br.longitude;
    const status = res?.operating_status ?? br.operating_status;
    const placeName = res?.name ?? null;
    const resolvedAddress = res?.address ?? br.formatted_address;

    // Check district mapping
    const rawDistrict = br.canonical_district;
    const normalized = normalizeJeddahDistrict(rawDistrict);
    const isCanonical = normalized && CANONICAL_30.has(normalized);

    // Collision check
    const isDbCollision = pid && dbPlaceIds.has(pid);

    auditedBranches.push({
      idx: branchIdx,
      brand: b.canonical_name,
      branch_name: br.branch_name,
      place_id: pid,
      place_name: placeName,
      lat,
      lng,
      status,
      address: resolvedAddress,
      raw_district: rawDistrict,
      normalized_district: normalized,
      is_canonical: isCanonical,
      canonical_id: isCanonical ? normalized : null,
      db_collision: isDbCollision
    });
  }
}

console.log(`Audited ${auditedBranches.length} branches.\n`);

// Print district analysis
console.log('District classification:');
let canonicalCount = 0;
let outerCount = 0;
let missingCoordsCount = 0;

for (const ab of auditedBranches) {
  if (ab.lat == null || ab.lng == null) {
    missingCoordsCount++;
    console.log(`[MISSING COORDS] #${ab.idx} ${ab.brand} — ${ab.branch_name} (PID: ${ab.place_id})`);
  }
  if (ab.is_canonical) {
    canonicalCount++;
  } else {
    outerCount++;
    console.log(`[OUTER DISTRICT] #${ab.idx} ${ab.brand} — ${ab.branch_name} | raw: ${ab.raw_district} | norm: ${ab.normalized_district} | Lat: ${ab.lat?.toFixed(4)}, Lng: ${ab.lng?.toFixed(4)}`);
  }
}

console.log(`\nCanonical districts count: ${canonicalCount}`);
console.log(`Outer districts count: ${outerCount}`);
console.log(`Missing coordinates count: ${missingCoordsCount}`);

// Collisions check
const collisions = auditedBranches.filter(b => b.db_collision);
console.log(`\nDB Place ID Collisions against 306 live branches: ${collisions.length}`);
if (collisions.length > 0) {
  console.table(collisions);
}

// Internal duplicates check
const pidsSeen = new Map();
const internalDuplicates = [];
for (const ab of auditedBranches) {
  if (!ab.place_id) continue;
  if (pidsSeen.has(ab.place_id)) {
    internalDuplicates.push({
      place_id: ab.place_id,
      first: pidsSeen.get(ab.place_id),
      second: `${ab.brand} — ${ab.branch_name}`
    });
  } else {
    pidsSeen.set(ab.place_id, `${ab.brand} — ${ab.branch_name}`);
  }
}
console.log(`Internal duplicate Place IDs: ${internalDuplicates.length}`);
if (internalDuplicates.length > 0) {
  console.table(internalDuplicates);
}
