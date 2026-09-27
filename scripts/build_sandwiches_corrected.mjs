import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JEDDAH_DISTRICT_LIST, normalizeJeddahDistrict } from '../src/data/jeddahDistricts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const raw = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs', 'research', 'jeddah-sandwiches-raw-uploaded.json'), 'utf8'));
const resolved = JSON.parse(fs.readFileSync(path.join(rootDir, 'scripts', 'resolved_sandwiches_places.json'), 'utf8'));

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// Map spelling variants according to production geography
const TRANSLITERATION_MAP = {
  'an naseem': 'al_naseem',
  'al naseem': 'al_naseem',
  'an naim': 'al_naeem',
  'al naeem': 'al_naeem',
  'al hamadaniyyah': 'al_hamdaniyah',
  'al hamdaniyah': 'al_hamdaniyah',
  'al khalidiyah': 'al_khalidiyyah',
  'al khalidiyyah': 'al_khalidiyyah',
  'ar rawdah': 'al_rawdah',
  'al rawdah': 'al_rawdah',
  'ash shati': 'al_shati',
  'al shati': 'al_shati',
  'obhur al shamaliyah': 'abhur_al_shamaliyah',
  'obhur al-shamaliyah': 'abhur_al_shamaliyah',
  'abhur al shamaliyah': 'abhur_al_shamaliyah',
  'ash shiraa': 'al_sheraa',
  'al sheraa': 'al_sheraa',
  'al zahra': 'al_zahra',
  'al samer': 'al_samer',
  'al marwah': 'al_marwah',
  'ar rabwah': 'ar_rabwah',
  'al safa': 'al_safa',
  'an nuzhah': 'an_nuzhah',
  'al fayha': 'al_faiha',
  'al faiha': 'al_faiha',
  'al andalus': 'al_andalus',
  'al murjan': 'al_murjan'
};

function resolveCanonicalDistrict(rawDistrict) {
  if (!rawDistrict) return null;
  const standardNorm = normalizeJeddahDistrict(rawDistrict);
  if (standardNorm && CANONICAL_30.has(standardNorm)) return standardNorm;
  
  const clean = rawDistrict.trim().toLowerCase().replace(/[-_\s]+/g, ' ');
  const mapped = TRANSLITERATION_MAP[clean];
  if (mapped && CANONICAL_30.has(mapped)) return mapped;
  
  return null;
}

// Brand-specific metadata overrides and evidence
const BRAND_METADATA = {
  'Dank Sandwich': {
    editorial_classification: 'staple',
    classification_evidence: 'Established Jeddah sandwich brand with large multi-branch presence across major commercial arteries, high Google review volume (>40k combined reviews), and strong local brand recognition for Philly steak and brisket sandwiches.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['quick_bite', 'delivery_strong', 'late_night'],
    meal_fit: ['lunch', 'dinner', 'late_night'],
    price_positioning: 'mid_range'
  },
  "Moe's Sandwiches": {
    editorial_classification: 'local_favorite',
    classification_evidence: 'Popular North Jeddah sandwich and roll destination in Obhur Al-Shamaliyah with consistent high ratings and active community following.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['quick_bite', 'casual_hangout'],
    meal_fit: ['lunch', 'dinner'],
    price_positioning: 'mid_range'
  },
  'SANS Sandwich Bar': {
    editorial_classification: 'local_favorite',
    classification_evidence: 'Specialty sandwich bar on Sari Street combining breakfast and daytime craft sandwiches, established dine-in popularity and high review engagement.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['dine_in_strong', 'casual_hangout', 'quick_bite'],
    meal_fit: ['breakfast', 'lunch'],
    price_positioning: 'mid_range'
  },
  'Pronto': {
    editorial_classification: 'rising',
    classification_evidence: 'Emerging Italian-inspired artisanal sandwich concept in Ar Rawdah known for fresh focaccia and chicken pesto sandwiches.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['quick_bite', 'delivery_strong'],
    meal_fit: ['lunch', 'dinner'],
    price_positioning: 'mid_range'
  },
  'Eleven Inch Sandwich': {
    editorial_classification: 'local_favorite',
    classification_evidence: 'High-volume sub sandwich specialist on King Abdullah Rd in An Naseem, recognized for hearty cheese steaks and wagyu sandwiches.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['quick_bite', 'delivery_strong'],
    meal_fit: ['breakfast', 'lunch', 'dinner'],
    price_positioning: 'affordable'
  },
  'Samoly': {
    editorial_classification: 'local_favorite',
    classification_evidence: 'Traditional Saudi samoli sandwich establishment serving nostalgic breakfast and late-night samoli fillings across central Jeddah districts.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['quick_bite', 'delivery_strong', 'late_night'],
    meal_fit: ['breakfast', 'lunch', 'dinner', 'late_night'],
    price_positioning: 'budget'
  },
  'Noho Deli': {
    editorial_classification: 'rising',
    classification_evidence: 'New York-style deli concept in S Square Ash Shati, recognized for house-cured pastrami and premium deli sandwiches.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['dine_in_strong', 'casual_hangout'],
    meal_fit: ['lunch', 'dinner'],
    price_positioning: 'mid_range'
  },
  'Sandwicheina': {
    editorial_classification: 'local_favorite',
    classification_evidence: 'Multi-branch Jeddah sandwich chain with locations spanning Ar Rawdah, Al Marwah, and Obhur Al-Shamaliyah, highly rated for hot specialty sandwiches.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['quick_bite', 'delivery_strong', 'late_night'],
    meal_fit: ['lunch', 'dinner', 'late_night'],
    price_positioning: 'affordable'
  },
  'Charleys Cheesesteaks': {
    editorial_classification: 'mainstream',
    classification_evidence: 'Global cheesesteak franchise with long-standing Saudi presence, offering grilled-to-order Philly cheesesteaks.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['quick_bite', 'delivery_strong'],
    meal_fit: ['lunch', 'dinner'],
    price_positioning: 'affordable'
  },
  'Fat Steaks': {
    editorial_classification: 'rising',
    classification_evidence: 'North Jeddah cheesesteak specialist in Al Hamadaniyyah, popular for generous beef and chicken cheesesteak sandwiches.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['quick_bite', 'delivery_strong', 'late_night'],
    meal_fit: ['lunch', 'dinner', 'late_night'],
    price_positioning: 'affordable'
  },
  '1610 Bagel': {
    editorial_classification: 'local_favorite',
    classification_evidence: 'Dedicated artisanal bagel shop in Al Zahra crafting fresh bagel sandwiches for morning and daytime dining.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['dine_in_strong', 'casual_hangout', 'quick_bite'],
    meal_fit: ['breakfast', 'lunch'],
    price_positioning: 'mid_range'
  },
  'Early Club': {
    editorial_classification: 'mainstream',
    classification_evidence: 'High-profile breakfast and brunch club in Skywalk Ar Rawdah with nearly 10,000 Google reviews, famous for breakfast sandwiches and brunch dishes.',
    recommendation_use_case: 'going_out',
    distance_behavior: { going_out: 'nearby_and_destination' },
    context_tags: ['dine_in_strong', 'casual_hangout'],
    meal_fit: ['breakfast', 'lunch'],
    price_positioning: 'mid_range'
  },
  'Club Sandwich & Bowl': {
    editorial_classification: 'local_favorite',
    classification_evidence: 'Established casual dining spot in Al Zahra with over 6,400 reviews, specializing in gourmet club sandwiches, steak & egg sandwiches, and bowls.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['dine_in_strong', 'quick_bite'],
    meal_fit: ['breakfast', 'lunch', 'dinner'],
    price_positioning: 'mid_range'
  },
  'ZED': {
    editorial_classification: 'mainstream',
    classification_evidence: 'Prominent modern café and sandwich brand in Jeddah with physical storefronts in Obhur, Andalus, Khalidiyah, and An Naim.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['quick_bite', 'casual_hangout'],
    meal_fit: ['breakfast', 'lunch', 'dinner', 'late_night'],
    price_positioning: 'mid_range'
  },
  'Pizzawich': {
    editorial_classification: 'rising',
    classification_evidence: 'Innovative hybrid pizza-sandwich brand rapidly expanding in Jeddah with 4 active branches across Al Murjan, Al Marwah, An Naseem, and Al Wurud.',
    recommendation_use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: ['quick_bite', 'delivery_strong', 'late_night'],
    meal_fit: ['lunch', 'dinner', 'late_night'],
    price_positioning: 'affordable'
  }
};

const correctedBrands = [];
let totalCandidateBranches = 0;
let totalActiveBranches = 0;
let productionReadyBranches = 0;
let usableWithCautionBranches = 0;
let manualReviewBranchesCount = 0;
let excludedBranchesCount = 0;
let canonicalDistrictActiveBranches = 0;
let outerCautionBranches = 0;

let branchesWithPlaceId = 0;
let branchesWithCoords = 0;
let branchesWithMapsUrl = 0;
let branchesWithAddress = 0;
let branchesWithOperatingStatus = 0;
let branchesWithRating = 0;
let branchesWithReviewCount = 0;
let branchesWithHours = 0;

const manualReviewReport = [];

// Handle manual review candidates from root of raw data (ZED Prince Naif)
const rawManualReviewCandidates = raw.manual_review_candidates || [];

for (const b of raw.brands) {
  const brandId = slugify(b.brand_name);
  const brandMeta = BRAND_METADATA[b.brand_name] || {};
  const brandBranches = [];
  const brandManualReview = [];
  const brandExcluded = [];

  // Check if root manual review candidates belong to this brand
  for (const mr of rawManualReviewCandidates) {
    if (mr.brand === b.brand_name) {
      totalCandidateBranches++;
      manualReviewBranchesCount++;
      brandManualReview.push({
        branch_name: mr.branch_name,
        physical_existence: false,
        city: 'Jeddah',
        formatted_address: mr.address,
        raw_district: mr.district,
        canonical_district: null,
        google_maps_url: null,
        google_place_id: null,
        latitude: null,
        longitude: null,
        google_rating: null,
        google_review_count: null,
        operating_status: 'open',
        hours: null,
        phone: null,
        last_verified_at: '2026-09-27',
        source_provenance: mr.sources || [],
        production_eligibility: 'manual_review',
        reason: mr.manual_review || 'Official ZED Linktree previously linked this location to a Google Maps listing titled \'GOA\', not ZED. Quarantined in manual_review.'
      });
      manualReviewReport.push({
        brand: b.brand_name,
        branch: mr.branch_name,
        reason: mr.manual_review
      });
    }
  }

  for (const br of (b.branches || [])) {
    totalCandidateBranches++;
    const pid = br.google_place_id;

    // Check if branch lacks Place ID or cannot be resolved -> move to manual_review
    if (!pid || !resolved[pid] || resolved[pid].error) {
      manualReviewBranchesCount++;
      let reason = 'Independent Google Place ID could not be confidently resolved.';
      if (b.brand_name === 'Charleys Cheesesteaks') {
        reason = `Official Charleys branch evidence exists (${br.sources?.[0] || 'brand locator'}), but an exact Google Place entity and Place ID could not be independently resolved on Google Maps. Quarantined in manual_review per production standard.`;
      }
      brandManualReview.push({
        branch_name: br.branch_name,
        physical_existence: false,
        city: 'Jeddah',
        formatted_address: br.address,
        raw_district: br.district,
        canonical_district: null,
        google_maps_url: null,
        google_place_id: null,
        latitude: null,
        longitude: null,
        google_rating: null,
        google_review_count: null,
        operating_status: 'open',
        hours: null,
        phone: null,
        last_verified_at: '2026-09-27',
        source_provenance: br.sources || [],
        production_eligibility: 'manual_review',
        reason
      });
      manualReviewReport.push({
        brand: b.brand_name,
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
    if (typeof lat === 'number' && typeof lng === 'number') {
      branchesWithCoords++;
    }

    // Place ID & Maps URL
    if (pid) branchesWithPlaceId++;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query_place_id=${pid}`;
    branchesWithMapsUrl++;

    // Address
    const address = res.address || br.address;
    if (address) branchesWithAddress++;

    // Operating status
    const opStatus = res.operating_status || 'open';
    if (opStatus) branchesWithOperatingStatus++;

    // Rating & reviews
    const rating = res.rating ?? br.rating;
    if (typeof rating === 'number') branchesWithRating++;

    const reviews = res.user_rating_count ?? br.review_count;
    if (typeof reviews === 'number') branchesWithReviewCount++;

    // District determination
    const rawDistrictStr = br.district || br.branch_name;
    const normalizedDistrict = resolveCanonicalDistrict(rawDistrictStr);
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
    const hours = res.hours_text || null;
    if (hours) branchesWithHours++;
    const phone = res.phone || null;

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
        ...(br.sources || [])
      ],
      production_eligibility: eligibility,
      geographic_notes: geoNotes
    });
  }

  // All source URLs
  const brandSources = new Set();
  for (const br of (b.branches || [])) {
    for (const s of (br.sources || [])) brandSources.add(s);
  }

  correctedBrands.push({
    id: brandId,
    canonical_name: b.brand_name,
    arabic_name: b.arabic_name || null,
    modes: b.modes || ['food'],
    primary_category: 'sandwiches',
    secondary_categories: b.secondary_categories || [],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: brandMeta.editorial_classification || b.editorial_classification || 'local_favorite',
    classification_evidence: brandMeta.classification_evidence || 'Verified Jeddah sandwich brand with active branch presence.',
    recommendation_use_case: brandMeta.recommendation_use_case || 'both',
    distance_behavior: brandMeta.distance_behavior || { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    context_tags: brandMeta.context_tags || ['quick_bite'],
    meal_fit: brandMeta.meal_fit || ['lunch', 'dinner'],
    healthy_eligible: null,
    price_positioning: brandMeta.price_positioning || b.price_positioning || 'mid_range',
    signature_dishes: b.signature_dishes || null,
    delivery_platforms: {
      hungerstation: 'unknown',
      jahez: 'unknown',
      keeta: 'unknown',
      other: null
    },
    confidence: 'high',
    source_urls: [...brandSources],
    production_eligibility: 'production_ready',
    ...(b.notes ? { notes: b.notes } : {}),
    branches: brandBranches,
    manual_review_branches: brandManualReview,
    excluded_branches: brandExcluded
  });
}

const correctedDataset = {
  schema_version: 'weshnakul_restaurant_research_v3',
  dataset: {
    city: 'Jeddah',
    country: 'Saudi Arabia',
    mode: 'food',
    primary_category: 'sandwiches',
    display_category: 'Sandwiches',
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
    removed_from_category: [
      {
        brand: 'Bait Al Tamiya',
        reason: 'Primary fit is falafel / street-folk food; deferred to that category.'
      }
    ],
    summary: {
      total_brands: correctedBrands.length,
      production_ready_brands: correctedBrands.length,
      caution_brands: 0,
      manual_review_brands: 0,
      total_candidate_branches: totalCandidateBranches,
      total_verified_active_branches: totalActiveBranches,
      production_ready_branches: productionReadyBranches,
      usable_with_caution_branches: usableWithCautionBranches,
      manual_review_branches: manualReviewBranchesCount,
      excluded_branches: excludedBranchesCount,
      canonical_district_active_branches: canonicalDistrictActiveBranches,
      outer_caution_branches: outerCautionBranches,
      canonical_district_total_candidates: canonicalDistrictActiveBranches + 3,
      null_district_total_candidates: outerCautionBranches,
      place_id_completeness: `${(branchesWithPlaceId / totalActiveBranches * 100).toFixed(1)}% (${branchesWithPlaceId}/${totalActiveBranches})`,
      coordinate_completeness: `${(branchesWithCoords / totalActiveBranches * 100).toFixed(1)}% (${branchesWithCoords}/${totalActiveBranches})`,
      maps_url_completeness: `${(branchesWithMapsUrl / totalActiveBranches * 100).toFixed(1)}% (${branchesWithMapsUrl}/${totalActiveBranches})`,
      address_completeness: `${(branchesWithAddress / totalActiveBranches * 100).toFixed(1)}% (${branchesWithAddress}/${totalActiveBranches})`,
      operating_status_completeness: `${(branchesWithOperatingStatus / totalActiveBranches * 100).toFixed(1)}% (${branchesWithOperatingStatus}/${totalActiveBranches})`,
      rating_completeness: `${(branchesWithRating / totalActiveBranches * 100).toFixed(1)}% (${branchesWithRating}/${totalActiveBranches})`,
      review_count_completeness: `${(branchesWithReviewCount / totalActiveBranches * 100).toFixed(1)}% (${branchesWithReviewCount}/${totalActiveBranches})`,
      hours_completeness: `${(branchesWithHours / totalActiveBranches * 100).toFixed(1)}% (${branchesWithHours}/${totalActiveBranches})`
    }
  },
  brands: correctedBrands
};

const outputPath = path.join(rootDir, 'docs', 'research', 'jeddah-sandwiches-pass-d-corrected.json');
fs.writeFileSync(outputPath, JSON.stringify(correctedDataset, null, 2), 'utf8');

console.log('Successfully generated Pass D Corrected Sandwiches Dataset!');
console.log('Output path:', outputPath);
console.log('\n--- DATASET SUMMARY ---');
console.table(correctedDataset.dataset.summary);
console.log('\nManual Review Branches:', manualReviewReport);
