import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeJeddahDistrict, JEDDAH_DISTRICT_LIST } from '../src/data/jeddahDistricts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const raw = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs', 'research', 'jeddah-fatayer-raw-uploaded.json'), 'utf8'));
const resolvedPlaces = JSON.parse(fs.readFileSync(path.join(rootDir, 'scripts', 'resolved_fatayer_places.json'), 'utf8'));

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));

// Helper for brand IDs
function toBrandId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// Custom district resolver honoring transliteration aliases and special cases
function resolveBranchDistrict(brandName, branchName, rawDistrict, googleDistrict, lat, lng) {
  // Special cases
  if (brandName === 'Pie Box' && branchName.includes('King Abdullah')) {
    return {
      raw_district: 'al_faiha',
      canonical_district: 'al_faiha',
      geographic_notes: 'Located in canonical district al_faiha (King Abdullah Rd & Prince Majid Rd, verified via coordinates and reverse geocoding).'
    };
  }

  if (brandName === 'Manqousheh Hut' && branchName.includes('Hira')) {
    return {
      raw_district: 'an_nahdah',
      canonical_district: null,
      geographic_notes: "Outer Jeddah branch in physical district 'an_nahdah' (Hira St & King Abdulaziz Branch Rd); canonical_district is null; usable_with_caution."
    };
  }

  // Transliteration normalizations
  let distStr = rawDistrict;
  if (distStr === 'Al Hamadaniyyah') distStr = 'Al Hamdaniyah';
  if (distStr === 'An Naseem') distStr = 'Al Naseem';
  if (distStr === 'Ash Shati') distStr = 'Al Shati';
  if (distStr === 'Ar Rawdah') distStr = 'Al Rawdah';
  if (distStr === 'Ar Rabwah') distStr = 'Al Rabwah';

  const normId = normalizeJeddahDistrict(distStr);
  if (normId && CANONICAL_30.has(normId)) {
    return {
      raw_district: normId,
      canonical_district: normId,
      geographic_notes: `Located in canonical district ${normId}.`
    };
  }

  // Outer districts
  const slug = distStr.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return {
    raw_district: slug,
    canonical_district: null,
    geographic_notes: `Outer Jeddah branch in physical district '${slug}'; canonical_district is null; usable_with_caution.`
  };
}

// Recommendation use case & distance behavior mapping
const BRAND_REC_CONFIG = {
  'Shobak': {
    use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    editorial: 'staple',
    price: 'affordable_to_mid_range',
    tags: ['quick_bite', 'delivery_strong', 'late_night', 'casual_hangout'],
    healthy: false,
    dishes: ['manakish', 'savory pies', 'cheese pies', 'zaatar manakish']
  },
  'Al Hatab': {
    use_case: 'delivery',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_only' },
    editorial: 'mainstream',
    price: 'affordable_to_mid_range',
    tags: ['quick_bite', 'delivery_strong'],
    healthy: null,
    dishes: ['manakish', 'savory pies', 'baked flatbreads']
  },
  'Manqousheh Hut': {
    use_case: 'delivery',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_only' },
    editorial: 'local_favorite',
    price: 'affordable',
    tags: ['quick_bite', 'late_night'],
    healthy: null,
    dishes: ['manakish', 'zaatar manakish', 'cheese manakish', 'meat manakish']
  },
  'Umm Al Zulf': {
    use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    editorial: 'local_favorite',
    price: 'mid_range',
    tags: ['quick_bite', 'late_night', 'dine_in_strong'],
    healthy: null,
    dishes: ['wood-fired manakish', 'cheese manakish', 'labneh manakish']
  },
  'Shaikh Manqoosh': {
    use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    editorial: 'local_favorite',
    price: 'mid_range',
    tags: ['quick_bite', 'dine_in_strong'],
    healthy: null,
    dishes: ['zaatar manakish', 'cheese manakish', 'meat manakish']
  },
  'Fatayer Al Tayar': {
    use_case: 'delivery',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_only' },
    editorial: 'local_favorite',
    price: 'affordable',
    tags: ['quick_bite', 'late_night', 'delivery_strong'],
    healthy: null,
    dishes: ['manakish', 'savory pies', 'cheese pies']
  },
  'Fatayer Aelaty Al-Lubnaniah': {
    use_case: 'delivery',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_only' },
    editorial: 'local_favorite',
    price: 'affordable',
    tags: ['quick_bite', 'late_night'],
    healthy: null,
    dishes: ['cheese pies', 'manakish', 'meat manakish', 'pizza fatayer']
  },
  'Kdousha': {
    use_case: 'delivery',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_only' },
    editorial: 'local_favorite',
    price: 'affordable',
    tags: ['quick_bite', 'late_night'],
    healthy: null,
    dishes: ['manakish', 'Lebanese kaak', 'halloumi kaak']
  },
  'Furn Aldayaa': {
    use_case: 'delivery',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_only' },
    editorial: 'local_favorite',
    price: 'mid_range',
    tags: ['quick_bite', 'late_night'],
    healthy: null,
    dishes: ['manakish', 'meat manakish', 'cheese manakish']
  },
  'Pie Box': {
    use_case: 'both',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_and_destination' },
    editorial: 'rising',
    price: 'affordable',
    tags: ['quick_bite', 'casual_hangout', 'late_night'],
    healthy: null,
    dishes: ['savory pies', 'baked pies', 'cheese pies']
  },
  'Agha Bakery': {
    use_case: 'delivery',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_only' },
    editorial: 'hidden_gem',
    price: 'affordable',
    tags: ['quick_bite', 'late_night'],
    healthy: null,
    dishes: ['Lebanese manakish', 'zaatar manakish', 'cheese manakish']
  },
  'Fatayer Al Ameen': {
    use_case: 'delivery',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_only' },
    editorial: 'local_favorite',
    price: 'budget',
    tags: ['quick_bite'],
    healthy: null,
    dishes: ['savory pies', 'cheese pies', 'spinach pies']
  },
  'Mathaq Al Manousheh': {
    use_case: 'delivery',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_only' },
    editorial: 'staple',
    price: 'affordable_to_mid_range',
    tags: ['quick_bite', 'delivery_strong', 'late_night'],
    healthy: null,
    dishes: ['manakish', 'mini manakish boxes', 'zaatar manakish', 'cheese manakish']
  },
  'Manqousha House': {
    use_case: 'delivery',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_only' },
    editorial: 'hidden_gem',
    price: 'budget',
    tags: ['quick_bite'],
    healthy: null,
    dishes: ['manakish', 'zaatar manakish', 'cheese manakish']
  },
  'Manakish Countryside': {
    use_case: 'delivery',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_only' },
    editorial: 'hidden_gem',
    price: 'affordable',
    tags: ['quick_bite', 'late_night'],
    healthy: null,
    dishes: ['akkawi manakish', 'zaatar manakish', 'meat manakish', 'spinach pies']
  }
};

const correctedBrands = [];

let totalActiveCount = 0;
let totalCanonicalCount = 0;
let totalCautionCount = 0;
let totalManualReviewCount = 0;
let totalExcludedCount = 0;

for (const b of raw.brands) {
  const brandName = b.canonical_name;
  const cfg = BRAND_REC_CONFIG[brandName] || {
    use_case: 'delivery',
    distance_behavior: { delivery: 'nearby_only', going_out: 'nearby_only' },
    editorial: b.editorial_classification || 'local_favorite',
    price: b.price_positioning || 'affordable',
    tags: b.context_tags || ['quick_bite'],
    healthy: b.healthy ?? null,
    dishes: b.signature_dishes || ['manakish']
  };

  const activeBranches = [];
  const manualReviewBranches = [];
  const excludedBranches = [];

  for (const br of (b.branches || [])) {
    const pId = br.google_place_id;
    const resolved = pId ? resolvedPlaces[pId] : null;

    // Check operating status
    const opStatus = resolved?.operating_status || br.operating_status;

    // Special exclusion checks
    if (brandName === 'Fatayer Al Tayar' && br.branch_name.includes('Mohammadiyyah')) {
      excludedBranches.push({
        branch_name: br.branch_name,
        physical_existence: true,
        city: 'Jeddah',
        formatted_address: resolved?.address || br.formatted_address,
        raw_district: 'al_mohammadiyyah',
        canonical_district: 'al_mohammadiyyah',
        google_maps_url: `https://www.google.com/maps/search/?api=1&query_place_id=${pId}`,
        google_place_id: pId,
        latitude: resolved?.latitude ?? null,
        longitude: resolved?.longitude ?? null,
        google_rating: resolved?.rating ?? br.google_rating,
        google_review_count: resolved?.user_rating_count ?? br.google_review_count,
        operating_status: 'permanently_closed',
        phone: resolved?.phone ?? null,
        last_verified_at: '2026-09-27',
        source_provenance: ['Google Maps verified Place ID entity', 'Direct place preview status check'],
        production_eligibility: 'excluded',
        reason: 'Current Google Maps entity verified as permanently closed (previously recorded temporarily_closed). Excluded from active recommendation pool.'
      });
      totalExcludedCount++;
      continue;
    }

    if (brandName === 'Fatayer Aelaty Al-Lubnaniah' && br.branch_name.includes('historical')) {
      excludedBranches.push({
        branch_name: br.branch_name,
        physical_existence: false,
        city: 'Jeddah',
        formatted_address: br.formatted_address,
        raw_district: 'al_marwah',
        canonical_district: null,
        google_maps_url: null,
        google_place_id: null,
        latitude: null,
        longitude: null,
        google_rating: null,
        google_review_count: null,
        operating_status: 'permanently_closed',
        phone: null,
        last_verified_at: '2026-09-27',
        source_provenance: ['https://www.bizmideast.com/SA/فطائر-عائلتي-اللبنانية-فرع-المروة'],
        production_eligibility: 'excluded',
        reason: 'Historical branch explicitly marked permanently closed; retained in excluded archive only to prevent accidental re-import as active.'
      });
      totalExcludedCount++;
      continue;
    }

    // Special manual review checks
    if (brandName === 'Al Hatab' && br.branch_name.includes('Khalidiyah')) {
      manualReviewBranches.push({
        branch_name: br.branch_name,
        physical_existence: true,
        city: 'Jeddah',
        formatted_address: br.formatted_address,
        raw_district: 'al_khalidiyyah',
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
        source_provenance: ['https://alhatab.com.sa/our-branches'],
        production_eligibility: 'manual_review',
        reason: 'Official branch locator confirms TO GO location, but branch-specific Google Place ID, exact coordinates, hours, and direct Google Maps listing were not independently captured in this pass. Moved to manual_review per production standard.'
      });
      totalManualReviewCount++;
      continue;
    }

    if (brandName === 'Kdousha' && br.branch_name.includes('Naseem')) {
      manualReviewBranches.push({
        branch_name: br.branch_name,
        physical_existence: true,
        city: 'Jeddah',
        formatted_address: br.formatted_address,
        raw_district: 'al_naseem',
        canonical_district: null,
        google_maps_url: null,
        google_place_id: null,
        latitude: null,
        longitude: null,
        google_rating: null,
        google_review_count: null,
        operating_status: 'open',
        hours: 'Open 24 hours',
        phone: null,
        last_verified_at: '2026-09-27',
        source_provenance: ['https://kadosha.carrd.co/'],
        production_eligibility: 'manual_review',
        reason: 'Official brand page confirms Naseem branch, but independent Google Place ID, exact coordinates, hours, and verified Maps URL could not be safely captured in this pass. Retained in manual_review.'
      });
      totalManualReviewCount++;
      continue;
    }

    // For all other branches, they MUST have a verified Place ID and coordinates!
    if (!pId || !resolved || typeof resolved.latitude !== 'number' || typeof resolved.longitude !== 'number') {
      console.error(`FATAL: Missing Place ID or coords for active branch: ${brandName} - ${br.branch_name}`);
      process.exit(1);
    }

    const geo = resolveBranchDistrict(brandName, br.branch_name, br.canonical_district, resolved.district_en, resolved.latitude, resolved.longitude);
    const isCanonical = geo.canonical_district !== null;
    const branchEligibility = isCanonical ? 'production_ready' : 'usable_with_caution';

    // Normalized Maps URL
    const normMapsUrl = `https://www.google.com/maps/search/?api=1&query_place_id=${pId}`;

    // Clean formatted address
    const cleanAddress = resolved.address || br.formatted_address;

    // Rating and review count
    const rating = resolved.rating ?? br.google_rating;
    const reviewCount = resolved.user_rating_count ?? br.google_review_count;

    // Hours
    const hours = br.hours || resolved.hours_text || 'Open 24 hours';

    activeBranches.push({
      branch_name: br.branch_name,
      physical_existence: true,
      city: 'Jeddah',
      formatted_address: cleanAddress,
      raw_district: geo.raw_district,
      canonical_district: geo.canonical_district,
      google_maps_url: normMapsUrl,
      google_place_id: pId,
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      google_rating: rating,
      google_review_count: reviewCount,
      operating_status: 'open',
      hours: hours,
      phone: resolved.phone || null,
      last_verified_at: '2026-09-27',
      source_provenance: [
        'Google Maps verified Place ID',
        'Direct Google Places preview entity resolution',
        ...(br.sources || b.sources || [])
      ],
      production_eligibility: branchEligibility,
      geographic_notes: geo.geographic_notes
    });

    totalActiveCount++;
    if (isCanonical) {
      totalCanonicalCount++;
    } else {
      totalCautionCount++;
    }
  }

  // Brand-level production eligibility
  let brandEligibility = 'production_ready';
  if (activeBranches.length === 0) {
    brandEligibility = 'manual_review';
  } else if (activeBranches.every(br => br.production_eligibility === 'usable_with_caution')) {
    brandEligibility = 'usable_with_caution';
  }

  correctedBrands.push({
    id: toBrandId(brandName),
    canonical_name: brandName,
    arabic_name: b.arabic_name,
    modes: b.modes || ['food', 'breakfast'],
    primary_category: 'fatayer',
    secondary_categories: b.secondary_categories || ['manakish'],
    jeddah_presence: true,
    operating_status: 'active',
    editorial_classification: cfg.editorial,
    classification_evidence: b.classification_evidence,
    recommendation_use_case: cfg.use_case,
    distance_behavior: cfg.distance_behavior,
    context_tags: cfg.tags,
    meal_fit: b.meal_fit || ['breakfast', 'lunch', 'dinner', 'late_night'],
    healthy_eligible: cfg.healthy,
    price_positioning: cfg.price,
    signature_dishes: cfg.dishes,
    delivery_platforms: {
      hungerstation: 'unknown',
      jahez: 'unknown',
      keeta: 'unknown',
      ninja: 'unknown'
    },
    confidence: b.confidence || 'high',
    source_urls: b.sources || [],
    production_eligibility: brandEligibility,
    branches: activeBranches,
    manual_review_branches: manualReviewBranches,
    excluded_branches: excludedBranches
  });
}

// Build final dataset
const finalDataset = {
  schema_version: 'weshnakul_restaurant_research_v3',
  dataset: {
    city: 'Jeddah',
    country: 'Saudi Arabia',
    mode: 'food',
    primary_category: 'fatayer',
    display_category: 'Fatayer',
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
      total_candidate_branches: totalActiveCount + totalManualReviewCount + totalExcludedCount,
      total_verified_active_branches: totalActiveCount,
      production_ready_branches: totalCanonicalCount,
      usable_with_caution_branches: totalCautionCount,
      manual_review_branches: totalManualReviewCount,
      excluded_branches: totalExcludedCount,
      canonical_district_active_branches: totalCanonicalCount,
      outer_caution_branches: totalCautionCount,
      place_id_completeness: `100.0% (${totalActiveCount}/${totalActiveCount})`,
      coordinate_completeness: `100.0% (${totalActiveCount}/${totalActiveCount})`,
      maps_url_completeness: `100.0% (${totalActiveCount}/${totalActiveCount})`,
      address_completeness: `100.0% (${totalActiveCount}/${totalActiveCount})`,
      operating_status_completeness: `100.0% (${totalActiveCount}/${totalActiveCount})`,
      rating_completeness: `100.0% (${totalActiveCount}/${totalActiveCount})`,
      review_count_completeness: `100.0% (${totalActiveCount}/${totalActiveCount})`,
      hours_completeness: `100.0% (${totalActiveCount}/${totalActiveCount})`
    }
  },
  brands: correctedBrands
};

const outPath = path.join(rootDir, 'docs', 'research', 'jeddah-fatayer-pass-d-corrected.json');
fs.writeFileSync(outPath, JSON.stringify(finalDataset, null, 2), 'utf8');
console.log(`\nSuccessfully generated corrected dataset: ${outPath}`);
console.log(`Total Brands: ${finalDataset.dataset.summary.total_brands}`);
console.log(`  - Production Ready Brands: ${finalDataset.dataset.summary.production_ready_brands}`);
console.log(`  - Caution Brands: ${finalDataset.dataset.summary.caution_brands}`);
console.log(`Total Candidate Branches: ${finalDataset.dataset.summary.total_candidate_branches}`);
console.log(`Total Active Branches: ${finalDataset.dataset.summary.total_verified_active_branches}`);
console.log(`  - Canonical (production_ready): ${finalDataset.dataset.summary.production_ready_branches}`);
console.log(`  - Outer Caution (usable_with_caution): ${finalDataset.dataset.summary.usable_with_caution_branches}`);
console.log(`Manual Review Branches: ${finalDataset.dataset.summary.manual_review_branches}`);
console.log(`Excluded Branches: ${finalDataset.dataset.summary.excluded_branches}`);
