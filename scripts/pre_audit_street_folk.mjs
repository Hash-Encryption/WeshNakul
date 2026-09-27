import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JEDDAH_DISTRICT_LIST, normalizeJeddahDistrict } from '../src/data/jeddahDistricts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawPath = path.join(rootDir, 'docs', 'research', 'jeddah-street-folk-food-raw-uploaded.json');
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));

let totalBrands = raw.brands.length;
let totalBranchRecords = 0;

let prodReadyCount = 0;
let usableCautionCount = 0;
let manualReviewCount = 0;
let excludedCount = 0;

let missingAddress = [];
let missingCanonicalDistrict = [];
let missingPlaceId = [];
let missingMapsUrl = [];
let missingLatLong = [];
let missingRating = [];
let missingReviews = [];
let missingHours = [];
let notConfirmedActiveOpen = [];

const placeIds = new Map(); // place_id -> [branch identifiers]
const mapsUrls = new Map(); // url -> [branch identifiers]
const physicalBranches = new Map(); // normalized branch signature -> [branch identifiers]

for (const brand of raw.brands) {
  const brandName = brand.name_en || brand.canonical_name || brand.id;
  const branches = brand.branches || [];

  for (const br of branches) {
    totalBranchRecords++;
    const branchName = br.name || br.branch_name;
    const identifier = `${brandName} — ${branchName}`;

    const elig = br.production_eligibility;
    if (elig === 'production_ready') prodReadyCount++;
    else if (elig === 'usable_with_caution') usableCautionCount++;
    else if (elig === 'manual_review') manualReviewCount++;
    else if (elig === 'excluded') excludedCount++;
    else console.warn(`Unknown eligibility: ${elig} for ${identifier}`);

    // Address
    const addr = br.address || br.formatted_address;
    if (!addr || addr.trim().length === 0) {
      missingAddress.push(identifier);
    }

    // Canonical district check
    const rawDist = br.district || br.canonical_district;
    const normalizedDist = normalizeJeddahDistrict(rawDist);
    if (!normalizedDist || !CANONICAL_30.has(normalizedDist)) {
      missingCanonicalDistrict.push({ identifier, district: rawDist, normalized: normalizedDist });
    }

    // Place ID
    if (!br.google_place_id || br.google_place_id.trim().length === 0) {
      missingPlaceId.push(identifier);
    } else {
      const pid = br.google_place_id.trim();
      if (!placeIds.has(pid)) placeIds.set(pid, []);
      placeIds.get(pid).push(identifier);
    }

    // Maps URL
    const url = br.google_maps_url;
    if (!url || url.trim().length === 0) {
      missingMapsUrl.push(identifier);
    } else {
      const u = url.trim();
      if (!mapsUrls.has(u)) mapsUrls.set(u, []);
      mapsUrls.get(u).push(identifier);
    }

    // Latitude / Longitude
    if (typeof br.latitude !== 'number' || typeof br.longitude !== 'number') {
      missingLatLong.push(identifier);
    }

    // Rating
    const r = br.rating ?? br.google_rating;
    if (typeof r !== 'number') {
      missingRating.push(identifier);
    }

    // Reviews
    const rev = br.review_count ?? br.google_review_count;
    if (typeof rev !== 'number') {
      missingReviews.push(identifier);
    }

    // Hours
    if (!br.hours || br.hours.trim().length === 0) {
      missingHours.push(identifier);
    }

    // Operating status
    const op = br.operating_status;
    if (op !== 'active' && op !== 'open') {
      notConfirmedActiveOpen.push({ identifier, status: op });
    }

    // Signature for duplicate physical branches
    const sig = `${brand.id}::${normalizedDist || rawDist || ''}::${(addr || '').slice(0, 20).toLowerCase()}`;
    if (!physicalBranches.has(sig)) physicalBranches.set(sig, []);
    physicalBranches.get(sig).push(identifier);
  }
}

// Find duplicate place IDs
const duplicatePlaceIds = [];
for (const [pid, list] of placeIds.entries()) {
  if (list.length > 1) duplicatePlaceIds.push({ place_id: pid, branches: list });
}

// Find duplicate Maps URLs
const duplicateMapsUrls = [];
for (const [url, list] of mapsUrls.entries()) {
  if (list.length > 1) duplicateMapsUrls.push({ url, branches: list });
}

// Find duplicate physical branches
const duplicatePhysicalBranches = [];
for (const [sig, list] of physicalBranches.entries()) {
  if (list.length > 1) duplicatePhysicalBranches.push({ signature: sig, branches: list });
}

console.log('========================================================');
console.log('====== STREET / FOLK FOOD PRE-CORRECTION AUDIT REPORT ====');
console.log('========================================================');
console.log(`Total Brands: ${totalBrands}`);
console.log(`Total Branch Records: ${totalBranchRecords}`);
console.log(`  - production_ready: ${prodReadyCount}`);
console.log(`  - usable_with_caution: ${usableCautionCount}`);
console.log(`  - manual_review: ${manualReviewCount}`);
console.log(`  - excluded: ${excludedCount}`);
console.log('');
console.log(`Branches Missing Address: ${missingAddress.length}`);
if (missingAddress.length) console.log(missingAddress);
console.log(`Branches Missing Canonical District: ${missingCanonicalDistrict.length}`);
if (missingCanonicalDistrict.length) console.log(missingCanonicalDistrict);
console.log(`Branches Missing Place ID: ${missingPlaceId.length}`);
if (missingPlaceId.length) console.log(missingPlaceId);
console.log(`Branches Missing Maps URL: ${missingMapsUrl.length}`);
if (missingMapsUrl.length) console.log(missingMapsUrl);
console.log(`Branches Missing Latitude/Longitude: ${missingLatLong.length}`);
console.log(`Branches Missing Rating: ${missingRating.length}`);
if (missingRating.length) console.log(missingRating);
console.log(`Branches Missing Reviews: ${missingReviews.length}`);
if (missingReviews.length) console.log(missingReviews);
console.log(`Branches Missing Hours: ${missingHours.length}`);
if (missingHours.length) console.log(missingHours);
console.log(`Branches Not Confirmed Active/Open: ${notConfirmedActiveOpen.length}`);
if (notConfirmedActiveOpen.length) console.log(notConfirmedActiveOpen);
console.log(`Duplicate Place IDs: ${duplicatePlaceIds.length}`);
if (duplicatePlaceIds.length) console.log(duplicatePlaceIds);
console.log(`Duplicate Maps URLs: ${duplicateMapsUrls.length}`);
if (duplicateMapsUrls.length) console.log(duplicateMapsUrls);
console.log(`Probable Duplicate Physical Branches: ${duplicatePhysicalBranches.length}`);
if (duplicatePhysicalBranches.length) console.log(duplicatePhysicalBranches);
console.log('========================================================');
