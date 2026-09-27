import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawPath = path.join(rootDir, 'docs', 'research', 'jeddah-seafood-raw-uploaded.json');
const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

// Load canonical 30 districts
const canonicalDistrictsFile = path.join(__dirname, 'db_all_30_districts.json');
const canonicalDistricts = JSON.parse(fs.readFileSync(canonicalDistrictsFile, 'utf8'));
const canonicalDistrictIds = new Set(canonicalDistricts.map(d => d.district_id));
const canonicalDistrictNames = new Set(canonicalDistricts.map(d => d.name_en.toLowerCase()));

// Load DB baseline
const dbBranches = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_live_branches.json'), 'utf8'));
const dbPlaceIds = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_place_ids.json'), 'utf8')));
const dbMapsUrls = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_maps_urls.json'), 'utf8')));
const dbBrands = JSON.parse(fs.readFileSync(path.join(__dirname, 'db_all_453_brands.json'), 'utf8'));

console.log('=== RAW SEAFOOD DATASET AUDIT ===');
console.log('Dataset Name:', rawData.dataset);
console.log('Total brands:', rawData.brands.length);

let totalBranches = 0;
let prodReadyBranches = 0;
let cautionBranches = 0;
let manualReviewBranches = 0;
let excludedBranches = 0;

let missingCoords = 0;
let missingPlaceIds = 0;
let missingMapsUrls = 0;
let missingFormattedAddresses = 0;
let missingCanonicalDistricts = 0;
let missingRatings = 0;
let missingReviewCounts = 0;
let missingHours = 0;
let nonOpenBranches = 0;

const placeIdCount = new Map();
const mapsUrlCount = new Map();
const branchNames = [];
const collisionsWithDb = [];

for (const b of rawData.brands) {
  // check brand collision with DB
  const matchingDbBrand = dbBrands.find(dbb => 
    dbb.name_en.toLowerCase() === b.canonical_name.toLowerCase() ||
    (b.arabic_name && dbb.name_ar === b.arabic_name)
  );
  if (matchingDbBrand) {
    console.log(`[Brand Collision] Seafood Brand '${b.canonical_name}' matches DB Brand '${matchingDbBrand.name_en}' (${matchingDbBrand.id}, cat: ${matchingDbBrand.primary_category})`);
  }

  for (const br of (b.branches || [])) {
    totalBranches++;
    
    // eligibility
    if (br.production_eligibility === 'production_ready') prodReadyBranches++;
    else if (br.production_eligibility === 'usable_with_caution') cautionBranches++;
    else if (br.production_eligibility === 'manual_review') manualReviewBranches++;
    else if (br.production_eligibility === 'excluded') excludedBranches++;

    // coords
    if (br.latitude == null || br.longitude == null) missingCoords++;

    // place id
    if (!br.google_place_id) missingPlaceIds++;
    else {
      placeIdCount.set(br.google_place_id, (placeIdCount.get(br.google_place_id) || 0) + 1);
      if (dbPlaceIds.has(br.google_place_id)) {
        collisionsWithDb.push({
          type: 'place_id',
          brand: b.canonical_name,
          branch: br.branch_name,
          place_id: br.google_place_id
        });
      }
    }

    // maps url
    if (!br.google_maps_url) missingMapsUrls++;
    else {
      mapsUrlCount.set(br.google_maps_url, (mapsUrlCount.get(br.google_maps_url) || 0) + 1);
      if (dbMapsUrls.has(br.google_maps_url)) {
        collisionsWithDb.push({
          type: 'maps_url',
          brand: b.canonical_name,
          branch: br.branch_name,
          url: br.google_maps_url
        });
      }
    }

    // address
    if (!br.formatted_address) missingFormattedAddresses++;

    // district
    if (!br.canonical_district) missingCanonicalDistricts++;

    // rating
    if (br.google_rating == null) missingRatings++;

    // review count
    if (br.google_review_count == null) missingReviewCounts++;

    // hours
    if (!br.hours) missingHours++;

    // operating status
    if (br.operating_status !== 'open') nonOpenBranches++;
  }
}

// Duplicates check
const internalDupPlaceIds = Array.from(placeIdCount.entries()).filter(([k, v]) => v > 1);
const internalDupMapsUrls = Array.from(mapsUrlCount.entries()).filter(([k, v]) => v > 1);

console.log('--- BRANCH STATUS AUDIT ---');
console.log('Total branch records:', totalBranches);
console.log('production_ready branches:', prodReadyBranches);
console.log('usable_with_caution branches:', cautionBranches);
console.log('manual_review branches:', manualReviewBranches);
console.log('excluded branches:', excludedBranches);

console.log('--- COMPLETENESS METRICS ---');
console.log('Missing coordinates:', missingCoords);
console.log('Missing Google Place IDs:', missingPlaceIds);
console.log('Missing Google Maps URLs:', missingMapsUrls);
console.log('Missing formatted addresses:', missingFormattedAddresses);
console.log('Missing canonical districts:', missingCanonicalDistricts);
console.log('Missing ratings:', missingRatings);
console.log('Missing review counts:', missingReviewCounts);
console.log('Missing hours:', missingHours);
console.log('Non-open branches:', nonOpenBranches);

console.log('--- DUPLICATE & COLLISION AUDIT ---');
console.log('Internal duplicate Place IDs:', internalDupPlaceIds);
console.log('Internal duplicate Maps URLs:', internalDupMapsUrls);
console.log('Collisions with DB (453 branches):', collisionsWithDb);
