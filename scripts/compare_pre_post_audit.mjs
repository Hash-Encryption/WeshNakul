import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const raw = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs', 'research', 'jeddah-street-folk-food-raw-uploaded.json'), 'utf8'));
const corrected = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs', 'research', 'jeddah-street-folk-food-pass-d-corrected.json'), 'utf8'));

function audit(data, label) {
  let brands = data.brands.length;
  let prodReadyBrands = data.brands.filter(b => b.production_eligibility === 'production_ready').length;
  let cautionBrands = data.brands.filter(b => b.production_eligibility === 'usable_with_caution').length;
  let manualReviewBrands = data.brands.filter(b => b.production_eligibility === 'manual_review').length;
  let excludedBrands = data.brands.filter(b => b.production_eligibility === 'excluded').length;

  let totalBranches = 0;
  let prodReadyBranches = 0;
  let cautionBranches = 0;
  let manualReviewBranches = 0;
  let excludedBranches = 0;

  let missingAddress = 0;
  let missingCanonicalDistrict = 0;
  let missingPlaceId = 0;
  let missingMapsUrl = 0;
  let missingCoords = 0;
  let missingRating = 0;
  let missingReviews = 0;
  let missingHours = 0;
  let notConfirmedActive = 0;

  for (const b of data.brands) {
    const allBranches = [
      ...(b.branches || []),
      ...(b.manual_review_branches || []),
      ...(b.excluded_branches || [])
    ];

    for (const br of allBranches) {
      totalBranches++;
      if (br.production_eligibility === 'production_ready') prodReadyBranches++;
      else if (br.production_eligibility === 'usable_with_caution') cautionBranches++;
      else if (br.production_eligibility === 'manual_review') manualReviewBranches++;
      else if (br.production_eligibility === 'excluded') excludedBranches++;

      const addr = br.formatted_address || br.address;
      if (!addr) missingAddress++;

      if (!br.canonical_district) missingCanonicalDistrict++;

      if (!br.google_place_id) missingPlaceId++;
      if (!br.google_maps_url) missingMapsUrl++;
      if (typeof br.latitude !== 'number' || typeof br.longitude !== 'number') missingCoords++;
      if (typeof (br.google_rating ?? br.rating) !== 'number') missingRating++;
      if (typeof (br.google_review_count ?? br.review_count) !== 'number') missingReviews++;
      if (!br.hours) missingHours++;
      if (br.operating_status !== 'open' && br.operating_status !== 'active') notConfirmedActive++;
    }
  }

  return {
    label,
    brands,
    prodReadyBrands,
    cautionBrands,
    manualReviewBrands,
    excludedBrands,
    totalBranches,
    prodReadyBranches,
    cautionBranches,
    manualReviewBranches,
    excludedBranches,
    missingAddress,
    missingCanonicalDistrict,
    missingPlaceId,
    missingMapsUrl,
    missingCoords,
    missingRating,
    missingReviews,
    missingHours,
    notConfirmedActive
  };
}

console.log('=== BEFORE (RAW SOURCE) ===');
console.table(audit(raw, 'Raw Uploaded'));

console.log('=== AFTER (CORRECTED PASS-D) ===');
console.table(audit(corrected, 'Corrected Pass-D'));
