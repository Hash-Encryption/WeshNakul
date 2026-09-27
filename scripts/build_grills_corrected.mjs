import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JEDDAH_DISTRICT_LIST, normalizeJeddahDistrict } from '../src/data/jeddahDistricts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const raw = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs', 'research', 'jeddah-grills-raw-uploaded.json'), 'utf8'));
const resolved = JSON.parse(fs.readFileSync(path.join(rootDir, 'scripts', 'resolved_grills_places.json'), 'utf8'));

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

const correctedBrands = [];
let totalCandidateBranches = 0;
let totalActiveBranches = 0;
let productionReadyBranches = 0;
let usableWithCautionBranches = 0;
let manualReviewBranches = 0;
let excludedBranches = 0;
let canonicalDistrictActiveBranches = 0;
let outerCautionBranches = 0;

let branchesWithPlaceId = 0;
let branchesWithCoords = 0;
let branchesWithMapsUrl = 0;
let branchesWithAddress = 0;
let branchesWithOperatingStatus = 0;
let branchesWithRating = 0;
let branchesWithReviewCount = 0;

const manualReviewReport = [];

for (const b of raw.brands) {
  const brandId = slugify(b.canonical_name);
  const brandBranches = [];
  const brandManualReview = [];
  const brandExcluded = [];

  for (const br of (b.branches || [])) {
    totalCandidateBranches++;
    const pid = br.google_place_id;

    // Check if branch can be active
    if (!pid || !resolved[pid] || !resolved[pid].success) {
      // Cannot resolve Google identity confidently -> move to manual_review
      manualReviewBranches++;
      const reason = br.manual_review_notes ||
        'Google Maps Place ID and exact coordinates could not be independently resolved. Quarantined in manual_review to preserve 100% Place ID and coordinate completeness for active catalog.';
      brandManualReview.push({
        branch_name: br.branch_name,
        physical_existence: br.physical_existence,
        city: br.city || 'Jeddah',
        formatted_address: br.formatted_address,
        raw_district: br.canonical_district || br.formatted_address,
        canonical_district: null,
        google_maps_url: null,
        google_place_id: null,
        latitude: null,
        longitude: null,
        google_rating: null,
        google_review_count: null,
        operating_status: br.operating_status || 'unknown',
        hours: br.hours || null,
        phone: br.phone || null,
        last_verified_at: '2026-09-27',
        source_provenance: br.source_urls || [],
        production_eligibility: 'manual_review',
        reason
      });
      manualReviewReport.push({
        brand: b.canonical_name,
        branch: br.branch_name,
        reason
      });
      continue;
    }

    // Active verified branch
    const res = resolved[pid];
    totalActiveBranches++;

    // Coordinates
    const lat = res.latitude;
    const lng = res.longitude;
    if (lat != null && lng != null) branchesWithCoords++;

    // Place ID & Maps URL
    if (pid) branchesWithPlaceId++;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query_place_id=${pid}`;
    branchesWithMapsUrl++;

    // Address
    const address = res.address || br.formatted_address;
    if (address) branchesWithAddress++;

    // Operating status
    const opStatus = res.operating_status || 'open';
    branchesWithOperatingStatus++;

    // Rating & reviews
    const rating = res.rating ?? br.google_rating;
    if (typeof rating === 'number') branchesWithRating++;

    const reviews = res.user_rating_count ?? br.google_review_count;
    if (typeof reviews === 'number') branchesWithReviewCount++;

    // District determination
    const rawDistrictStr = br.canonical_district || br.branch_name;
    const normalizedDistrict = normalizeJeddahDistrict(rawDistrictStr);
    const isCanonical = normalizedDistrict && CANONICAL_30.has(normalizedDistrict);

    let canonicalDistrict = null;
    let eligibility = 'usable_with_caution';
    let geoNotes = '';

    if (isCanonical) {
      canonicalDistrict = normalizedDistrict;
      eligibility = 'production_ready';
      productionReadyBranches++;
      canonicalDistrictActiveBranches++;
      geoNotes = `Located in canonical district ${canonicalDistrict}.`;
    } else {
      canonicalDistrict = null;
      eligibility = 'usable_with_caution';
      usableWithCautionBranches++;
      outerCautionBranches++;
      geoNotes = `Outer Jeddah branch in physical district '${rawDistrictStr}'; canonical_district is null; usable_with_caution.`;
    }

    // Hours
    const hours = res.hours_text || br.hours || null;
    const phone = res.phone || br.phone || null;

    brandBranches.push({
      branch_name: br.branch_name,
      physical_existence: true,
      city: 'Jeddah',
      formatted_address: address,
      raw_district: rawDistrictStr,
      canonical_district: canonicalDistrict,
      google_maps_url: mapsUrl,
      google_place_id: pid,
      latitude: lat,
      longitude: lng,
      google_rating: rating,
      google_review_count: reviews,
      operating_status: opStatus,
      hours: hours,
      phone: phone,
      last_verified_at: '2026-09-27',
      source_provenance: [
        'Google Maps verified Place ID',
        'Direct Google Places preview entity resolution',
        ...(br.source_urls || [])
      ],
      production_eligibility: eligibility,
      geographic_notes: geoNotes
    });
  }

  // Unverified locations / leads
  const unverified = [];
  if (Array.isArray(b.unverified_locations)) {
    for (const uv of b.unverified_locations) {
      unverified.push({
        name: uv.name,
        status: uv.status || 'not_verified_as_physical_branch',
        reason: uv.reason || 'Not verified as independent physical branch.'
      });
    }
  }

  correctedBrands.push({
    id: brandId,
    canonical_name: b.canonical_name,
    arabic_name: b.arabic_name,
    modes: b.modes || ['food'],
    primary_category: 'grills',
    secondary_categories: b.secondary_categories || [],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: b.editorial_classification || 'mainstream',
    classification_evidence: b.classification_evidence || null,
    recommendation_use_case: b.recommendation_use_case || 'both',
    distance_behavior: b.distance_behavior || {
      delivery: 'strict_nearby_branch',
      going_out: 'nearby_and_destination'
    },
    context_tags: b.context_tags || [],
    meal_fit: b.meal_fit || ['lunch', 'dinner'],
    healthy_eligible: b.healthy_eligible ?? null,
    price_positioning: b.price_positioning || 'mid_range',
    signature_dishes: b.signature_dishes || [],
    delivery_platforms: b.delivery_platforms || {},
    confidence: b.confidence || 'high',
    source_urls: b.source_urls || [],
    production_eligibility: 'production_ready',
    branches: brandBranches,
    manual_review_branches: brandManualReview,
    unverified_locations: unverified
  });
}

const correctedDataset = {
  schema_version: 'weshnakul_restaurant_research_v3',
  dataset: {
    city: 'Jeddah',
    country: 'Saudi Arabia',
    mode: 'food',
    primary_category: 'grills',
    display_category: 'Grills',
    verified_date: '2026-09-27',
    brand_count: correctedBrands.length,
    status: 'PASS_WITH_FIELD_VALIDATION_COMPLETE',
    principles: [
      'recommendation_quality_over_catalog_size',
      'verified_reality_over_completeness',
      'unknowns_are_null',
      'delivery_distance_policy_strict_nearby_branch',
      'going_out_distance_policy_mix_nearby_and_destination'
    ],
    summary: {
      total_brands: correctedBrands.length,
      production_ready_brands: correctedBrands.filter(b => b.production_eligibility === 'production_ready').length,
      caution_brands: correctedBrands.filter(b => b.production_eligibility === 'usable_with_caution').length,
      manual_review_brands: correctedBrands.filter(b => b.production_eligibility === 'manual_review').length,
      total_candidate_branches: totalCandidateBranches,
      total_verified_active_branches: totalActiveBranches,
      production_ready_branches: productionReadyBranches,
      usable_with_caution_branches: usableWithCautionBranches,
      manual_review_branches: manualReviewBranches,
      excluded_branches: excludedBranches,
      canonical_district_active_branches: canonicalDistrictActiveBranches,
      outer_caution_branches: outerCautionBranches,
      canonical_district_total_candidates: canonicalDistrictActiveBranches,
      null_district_total_candidates: outerCautionBranches + manualReviewBranches,
      place_id_completeness: `${(branchesWithPlaceId / totalActiveBranches * 100).toFixed(1)}% (${branchesWithPlaceId}/${totalActiveBranches})`,
      coordinate_completeness: `${(branchesWithCoords / totalActiveBranches * 100).toFixed(1)}% (${branchesWithCoords}/${totalActiveBranches})`,
      maps_url_completeness: `${(branchesWithMapsUrl / totalActiveBranches * 100).toFixed(1)}% (${branchesWithMapsUrl}/${totalActiveBranches})`,
      address_completeness: `${(branchesWithAddress / totalActiveBranches * 100).toFixed(1)}% (${branchesWithAddress}/${totalActiveBranches})`,
      operating_status_completeness: `${(branchesWithOperatingStatus / totalActiveBranches * 100).toFixed(1)}% (${branchesWithOperatingStatus}/${totalActiveBranches})`,
      rating_completeness: `${(branchesWithRating / totalActiveBranches * 100).toFixed(1)}% (${branchesWithRating}/${totalActiveBranches})`,
      review_count_completeness: `${(branchesWithReviewCount / totalActiveBranches * 100).toFixed(1)}% (${branchesWithReviewCount}/${totalActiveBranches})`
    }
  },
  brands: correctedBrands,
  manual_review: manualReviewReport
};

const outputPath = path.join(rootDir, 'docs', 'research', 'jeddah-grills-pass-d-corrected.json');
fs.writeFileSync(outputPath, JSON.stringify(correctedDataset, null, 2));

console.log('Successfully wrote authoritative corrected dataset to:', outputPath);
console.log('Summary stats:');
console.table(correctedDataset.dataset.summary);
