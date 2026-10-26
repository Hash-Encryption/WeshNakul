/**
 * Authoritative Server-Side Catalog Validation & Readiness Rules
 * Strictly enforces canonical rules, Jeddah boundaries, and readiness prerequisites.
 */

export const CANONICAL_JEDDAH_DISTRICT_IDS = new Set([
  'al_sheraa',
  'al_hamdaniyah',
  'abhur_al_shamaliyah',
  'abhur_al_janoubiyah',
  'al_murjan',
  'al_basateen',
  'al_mohammadiyyah',
  'al_naeem',
  'al_marwah',
  'an_nuzhah',
  'al_shati',
  'al_bawadi',
  'al_salamah',
  'al_zahra',
  'al_safa',
  'al_samer',
  'ar_rabwah',
  'al_faisaliyyah',
  'al_aziziyah',
  'al_rawdah',
  'al_khalidiyyah',
  'al_rehab',
  'al_andalus',
  'al_hamra',
  'al_sharafeyah',
  'al_naseem',
  'al_ruwais',
  'al_faiha',
  'al_balad',
  'al_thaghr',
]);

export const VALID_CATEGORIES = new Set([
  'burger',
  'shawarma',
  'fried_chicken',
  'pizza',
  'kabsa',
  'grills',
  'grill',
  'rice',
  'broast',
  'saudi_kabsa',
  'fatayer',
  'sandwiches',
  'indian',
  'italian',
  'seafood',
  'street_folk',
  'sushi',
  'mexican',
  'asian',
  'breakfast',
  'bakery',
  'turkish',
  'american',
  'healthy',
]);

/**
 * Shared Policy for Google Maps URLs:
 * 1. Scheme: Strict HTTPS only (https://).
 * 2. Ports: Explicit port specifications are strictly forbidden (including standard :443 and non-standard :8080).
 * 3. Userinfo: Credentials (username/password or @) are strictly forbidden.
 * 4. Permitted Hostnames & Endpoints:
 *    - Short links: maps.app.goo.gl/<id>, goo.gl/maps/<id>
 *    - Subdomain maps: maps.google.com, maps.google.com.sa (dedicated Maps services)
 *    - Portal paths: (www.)google.com(.sa)/maps*
 * Deceptive lookalike domains (e.g. maps.google.com.evil.com) are strictly rejected.
 */
export function isValidGoogleMapsUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://')) return false;

  // Reject any explicit port in raw URL (including :443 and :8080)
  if (/^https:\/\/[^/?#]+:[0-9]+/i.test(trimmed)) return false;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  // 1. Strict HTTPS protocol
  if (parsed.protocol !== 'https:') return false;

  // 2. Reject userinfo (credentials)
  if (parsed.username || parsed.password) return false;

  // 3. Reject ports
  if (parsed.port) return false;

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname;

  // 4. Validate exact hosts and paths
  // Short links: maps.app.goo.gl/<id>
  if (host === 'maps.app.goo.gl') {
    return /^\/[A-Za-z0-9_-]+$/.test(path);
  }

  // Short links: goo.gl/maps/<id>
  if (host === 'goo.gl') {
    return /^\/maps\/[A-Za-z0-9_-]+$/.test(path);
  }

  // Subdomain maps: maps.google.com, maps.google.com.sa (dedicated Maps hosts)
  if (host === 'maps.google.com' || host === 'maps.google.com.sa') {
    return true;
  }

  // Path maps: google.com/maps, www.google.com/maps, google.com.sa/maps, www.google.com.sa/maps
  if (
    host === 'google.com' ||
    host === 'www.google.com' ||
    host === 'google.com.sa' ||
    host === 'www.google.com.sa'
  ) {
    return path === '/maps' || path.startsWith('/maps/');
  }

  return false;
}

export function isValidIsoTimestamp(val: unknown): boolean {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  // Require explicit timezone offset (Z or +/-00:00 to 14:00, minutes 00-59)
  const isoTzRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]((0[0-9]|1[0-3]):[0-5][0-9]|14:00))$/i;
  if (!isoTzRegex.test(trimmed)) return false;
  const time = Date.parse(trimmed);
  if (Number.isNaN(time)) return false;

  // Calendar date bounds validation (rejects invalid dates like Feb 30, Apr 31)
  const [y, m, d] = trimmed.slice(0, 10).split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (d > daysInMonth) return false;

  return true;
}

export const ALLOWED_BRAND_FIELDS = new Set([
  'name_ar',
  'name_en',
  'categories',
  'secondary_categories',
  'subcategories',
  'dining_mode',
  'tier',
  'price_tier',
  'rating',
  'operating_status',
  'research_use',
  'price_position',
  'editorial_role',
  'manual_review_required',
  'manual_review_reasons',
  'last_verified_at',
  'image_url',
  'signature_dish_en',
  'signature_dish_ar',
  'origin_city',
  'origin_country',
  'official_website',
  'official_phone',
  'official_ordering',
  'official_instagram',
  'official_tiktok',
  'official_x',
]);

export const ALLOWED_BRANCH_FIELDS = new Set([
  'restaurant_id',
  'branch_name_ar',
  'branch_name_en',
  'district',
  'address_ar',
  'address_en',
  'latitude',
  'longitude',
  'google_maps_url',
  'branch_status',
  'branch_type',
  'dine_in',
  'takeaway',
  'late_night',
  'is_24_hours',
  'last_verified_at',
  'google_place_id',
  'maps_business_name',
  'opening_hours',
]);

export interface ValidationError {
  entity_type: 'restaurant' | 'branch';
  entity_id: string;
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ReadinessEvaluation {
  is_recommendation_eligible: boolean;
  is_production_ready: boolean;
  blockers: string[];
  warnings: string[];
}

export interface EntityDiff {
  entity_type: 'restaurant' | 'branch';
  entity_id: string;
  field: string;
  previous_value: unknown;
  proposed_value: unknown;
}

/**
 * Validates brand-level proposed changes.
 */
export function validateBrandFields(
  brandId: string,
  changes: Record<string, unknown>,
  isNew = false
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Field validation and entity separation
  for (const key of Object.keys(changes)) {
    if (ALLOWED_BRANCH_FIELDS.has(key) && !ALLOWED_BRAND_FIELDS.has(key)) {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: key,
        code: 'FIELD_ENTITY_MISMATCH',
        message: `Field '${key}' belongs to branch entity, not restaurant.`,
        severity: 'error',
      });
    } else if (!ALLOWED_BRAND_FIELDS.has(key)) {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: key,
        code: 'UNKNOWN_FIELD',
        message: `Unrecognized brand field: '${key}'.`,
        severity: 'error',
      });
    }
  }

  if (isNew) {
    if (!brandId || typeof brandId !== 'string' || !/^[a-z0-9_-]{2,80}$/.test(brandId.trim())) {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: 'id',
        code: 'INVALID_BRAND_ID',
        message: 'New brand ID must be a lowercase alphanumeric slug between 2 and 80 characters.',
        severity: 'error',
      });
    }
  }

  if (isNew || changes.name_en !== undefined || changes.name_ar !== undefined) {
    const nameEn = typeof changes.name_en === 'string' ? changes.name_en.trim() : '';
    const nameAr = typeof changes.name_ar === 'string' ? changes.name_ar.trim() : '';
    if (!nameEn && !nameAr) {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: 'name',
        code: 'REQUIRED_NAME_MISSING',
        message: 'Brand requires at least one non-empty name (English or Arabic).',
        severity: 'error',
      });
    }
  }

  if (changes.categories !== undefined) {
    if (!Array.isArray(changes.categories) || changes.categories.length === 0) {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: 'categories',
        code: 'CATEGORIES_EMPTY',
        message: 'Brand requires at least one category.',
        severity: 'error',
      });
    } else {
      for (const cat of changes.categories) {
        if (typeof cat !== 'string' || !VALID_CATEGORIES.has(cat.toLowerCase().trim())) {
          errors.push({
            entity_type: 'restaurant',
            entity_id: brandId,
            field: 'categories',
            code: 'INVALID_CATEGORY',
            message: `Unsupported category: '${cat}'.`,
            severity: 'error',
          });
        }
      }
    }
  }

  if (changes.rating !== undefined && changes.rating !== null) {
    const num = Number(changes.rating);
    if (isNaN(num) || num < 0 || num > 5) {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: 'rating',
        code: 'INVALID_RATING',
        message: 'Rating must be a numeric value between 0.0 and 5.0.',
        severity: 'error',
      });
    }
  }

  if (changes.operating_status !== undefined) {
    const valid = ['open', 'temporarily_closed', 'permanently_closed', 'unknown'];
    if (!valid.includes(String(changes.operating_status))) {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: 'operating_status',
        code: 'INVALID_STATUS',
        message: `Invalid operating status: '${changes.operating_status}'.`,
        severity: 'error',
      });
    }
  }

  if (changes.research_use !== undefined) {
    const valid = ['production_ready', 'usable_with_caution', 'manual_review_only', 'rejected'];
    if (!valid.includes(String(changes.research_use))) {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: 'research_use',
        code: 'INVALID_RESEARCH_USE',
        message: `Invalid research use: '${changes.research_use}'.`,
        severity: 'error',
      });
    }
  }

  if (changes.primary_category !== undefined) {
    errors.push({
      entity_type: 'restaurant',
      entity_id: brandId,
      field: 'primary_category',
      code: 'DERIVED_FIELD_NOT_EDITABLE',
      message: "Field 'primary_category' is derived from categories[1] and cannot be directly edited. Edit 'categories' instead.",
      severity: 'error',
    });
  }

  if (changes.manual_review_reasons !== undefined && changes.manual_review_reasons !== null) {
    if (!Array.isArray(changes.manual_review_reasons)) {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: 'manual_review_reasons',
        code: 'INVALID_FIELD_TYPE',
        message: 'manual_review_reasons must be an array of strings.',
        severity: 'error',
      });
    } else if (changes.manual_review_reasons.length > 20) {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: 'manual_review_reasons',
        code: 'FIELD_LIMIT_EXCEEDED',
        message: 'manual_review_reasons cannot exceed 20 items.',
        severity: 'error',
      });
    } else {
      for (const reason of changes.manual_review_reasons) {
        if (typeof reason !== 'string' || reason.trim().length === 0 || reason.length > 200) {
          errors.push({
            entity_type: 'restaurant',
            entity_id: brandId,
            field: 'manual_review_reasons',
            code: 'INVALID_FIELD_VALUE',
            message: 'Each manual review reason must be a non-empty string under 200 characters.',
            severity: 'error',
          });
          break;
        }
      }
    }
  }

  if (changes.last_verified_at !== undefined && changes.last_verified_at !== null) {
    if (typeof changes.last_verified_at !== 'string') {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: 'last_verified_at',
        code: 'INVALID_FIELD_TYPE',
        message: 'Field last_verified_at must be a string or null.',
        severity: 'error',
      });
    } else if (!isValidIsoTimestamp(changes.last_verified_at)) {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: 'last_verified_at',
        code: 'INVALID_TIMESTAMP',
        message: 'Field last_verified_at must be an ISO 8601 timestamp with explicit timezone.',
        severity: 'error',
      });
    }
  }

  if (changes.image_url !== undefined && changes.image_url !== null) {
    if (typeof changes.image_url !== 'string') {
      errors.push({
        entity_type: 'restaurant',
        entity_id: brandId,
        field: 'image_url',
        code: 'INVALID_FIELD_TYPE',
        message: 'Field image_url must be a string or null.',
        severity: 'error',
      });
    } else {
      const trimmed = changes.image_url.trim();
      if (trimmed.length > 0 && !trimmed.startsWith('https://') && !trimmed.startsWith('/images/')) {
        errors.push({
          entity_type: 'restaurant',
          entity_id: brandId,
          field: 'image_url',
          code: 'INVALID_IMAGE_URL',
          message: 'Image URL must be a valid HTTPS URL or relative /images/ path.',
          severity: 'error',
        });
      }
    }
  }

  return errors;
}

/**
 * Validates branch-level proposed changes.
 */
export function validateBranchFields(
  branchId: string,
  changes: Record<string, unknown>,
  existingBranch?: Record<string, unknown> | null,
  isNew = false
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (isNew) {
    if (
      !branchId ||
      typeof branchId !== 'string' ||
      !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(branchId.trim())
    ) {
      errors.push({
        entity_type: 'branch',
        entity_id: branchId,
        field: 'id',
        code: 'INVALID_BRANCH_ID',
        message: 'New branch ID must be a valid UUID.',
        severity: 'error',
      });
    }

    const restId = typeof changes.restaurant_id === 'string' ? changes.restaurant_id.trim() : '';
    if (!existingBranch && !restId) {
      errors.push({
        entity_type: 'branch',
        entity_id: branchId,
        field: 'restaurant_id',
        code: 'REQUIRED_PARENT_BRAND_MISSING',
        message: 'New branch requires a parent restaurant_id.',
        severity: 'error',
      });
    }
  }

  // Field validation and entity separation
  for (const key of Object.keys(changes)) {
    if (ALLOWED_BRAND_FIELDS.has(key) && !ALLOWED_BRANCH_FIELDS.has(key)) {
      errors.push({
        entity_type: 'branch',
        entity_id: branchId,
        field: key,
        code: 'FIELD_ENTITY_MISMATCH',
        message: `Field '${key}' belongs to restaurant entity, not branch.`,
        severity: 'error',
      });
    } else if (!ALLOWED_BRANCH_FIELDS.has(key)) {
      errors.push({
        entity_type: 'branch',
        entity_id: branchId,
        field: key,
        code: 'UNKNOWN_FIELD',
        message: `Unrecognized branch field: '${key}'.`,
        severity: 'error',
      });
    }
  }

  const district = (
    changes.district !== undefined ? changes.district : existingBranch?.district
  ) as string | undefined;

  const addrAr = (
    changes.address_ar !== undefined ? changes.address_ar : existingBranch?.address_ar
  ) as string | undefined;

  const addrEn = (
    changes.address_en !== undefined ? changes.address_en : existingBranch?.address_en
  ) as string | undefined;

  // 1. Canonical district requirement
  if (!district || !district.trim()) {
    errors.push({
      entity_type: 'branch',
      entity_id: branchId,
      field: 'district',
      code: 'REQUIRED_DISTRICT_MISSING',
      message: 'Branch requires a canonical Jeddah district.',
      severity: 'error',
    });
  } else if (!CANONICAL_JEDDAH_DISTRICT_IDS.has(district.trim().toLowerCase())) {
    errors.push({
      entity_type: 'branch',
      entity_id: branchId,
      field: 'district',
      code: 'NON_CANONICAL_DISTRICT',
      message: `District '${district}' is not in the canonical 30 Jeddah municipal districts.`,
      severity: 'error',
    });
  }

  // 2. Address requirement
  const hasAddr = (addrAr && addrAr.trim()) || (addrEn && addrEn.trim());
  if (!hasAddr) {
    errors.push({
      entity_type: 'branch',
      entity_id: branchId,
      field: 'address',
      code: 'REQUIRED_ADDRESS_MISSING',
      message: 'Branch requires a physical address (Arabic or English).',
      severity: 'error',
    });
  }

  // 3. Name requirement
  const nameAr = (
    changes.branch_name_ar !== undefined ? changes.branch_name_ar : existingBranch?.branch_name_ar
  ) as string | undefined;
  const nameEn = (
    changes.branch_name_en !== undefined ? changes.branch_name_en : existingBranch?.branch_name_en
  ) as string | undefined;

  if (isNew && !nameAr?.trim() && !nameEn?.trim()) {
    errors.push({
      entity_type: 'branch',
      entity_id: branchId,
      field: 'branch_name',
      code: 'REQUIRED_BRANCH_NAME_MISSING',
      message: 'Branch requires a descriptive branch name.',
      severity: 'warning',
    });
  }

  // 4. Coordinates within Jeddah bounding box if provided, with parity check
  const latVal = changes.latitude !== undefined ? changes.latitude : existingBranch?.latitude;
  const lngVal = changes.longitude !== undefined ? changes.longitude : existingBranch?.longitude;

  const hasLat = latVal !== null && latVal !== undefined;
  const hasLng = lngVal !== null && lngVal !== undefined;

  if (hasLat !== hasLng) {
    errors.push({
      entity_type: 'branch',
      entity_id: branchId,
      field: 'coordinates',
      code: 'COORDINATE_PARITY_VIOLATION',
      message: 'Latitude and longitude must both be provided or both be null.',
      severity: 'error',
    });
  } else if (hasLat && hasLng) {
    const lat = Number(latVal);
    const lng = Number(lngVal);
    if (isNaN(lat) || isNaN(lng)) {
      errors.push({
        entity_type: 'branch',
        entity_id: branchId,
        field: 'coordinates',
        code: 'INVALID_COORDINATES',
        message: 'Coordinates must be valid numbers.',
        severity: 'error',
      });
    } else if (lat < 21.0 || lat > 22.0 || lng < 39.0 || lng > 39.5) {
      errors.push({
        entity_type: 'branch',
        entity_id: branchId,
        field: 'coordinates',
        code: 'COORDINATES_OUT_OF_BOUNDS',
        message: `Coordinates [${lat}, ${lng}] fall outside Jeddah municipal boundaries.`,
        severity: 'error',
      });
    }
  }

  // 5. Maps URL must be a valid HTTPS Google Maps URL
  const mapsUrl = (
    changes.google_maps_url !== undefined ? changes.google_maps_url : existingBranch?.google_maps_url
  ) as string | undefined;
  if (mapsUrl && mapsUrl.trim()) {
    if (!isValidGoogleMapsUrl(mapsUrl)) {
      errors.push({
        entity_type: 'branch',
        entity_id: branchId,
        field: 'google_maps_url',
        code: 'INVALID_MAPS_URL',
        message: 'Google Maps URL must be a valid HTTPS Google Maps URL (maps.google.com, google.com/maps, maps.app.goo.gl, or goo.gl/maps).',
        severity: 'error',
      });
    }
  }

  if (changes.last_verified_at !== undefined && changes.last_verified_at !== null) {
    if (typeof changes.last_verified_at !== 'string') {
      errors.push({
        entity_type: 'branch',
        entity_id: branchId,
        field: 'last_verified_at',
        code: 'INVALID_FIELD_TYPE',
        message: 'Field last_verified_at must be a string or null.',
        severity: 'error',
      });
    } else if (!isValidIsoTimestamp(changes.last_verified_at)) {
      errors.push({
        entity_type: 'branch',
        entity_id: branchId,
        field: 'last_verified_at',
        code: 'INVALID_TIMESTAMP',
        message: 'Field last_verified_at must be an ISO 8601 timestamp with explicit timezone.',
        severity: 'error',
      });
    }
  }

  return errors;
}

/**
 * Authoritatively evaluates recommendation eligibility and branch readiness.
 */
export function evaluateReadiness(
  brand: Record<string, unknown>,
  branch: Record<string, unknown>
): ReadinessEvaluation {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const brandStatus = String(brand.operating_status || 'unknown');
  const researchUse = String(brand.research_use || 'manual_review_only');
  const branchStatus = String(branch.branch_status || 'unknown');
  const district = String(branch.district || '').trim().toLowerCase();
  const addrAr = String(branch.address_ar || '').trim();
  const addrEn = String(branch.address_en || '').trim();

  // Brand level checks
  if (brandStatus !== 'open') {
    blockers.push(`Brand status is '${brandStatus}' (must be open).`);
  }
  if (!['production_ready', 'usable_with_caution'].includes(researchUse)) {
    blockers.push(`Brand research use is '${researchUse}' (must be production_ready or usable_with_caution).`);
  }

  // Branch level checks
  if (branchStatus !== 'open') {
    blockers.push(`Branch status is '${branchStatus}' (must be open).`);
  }
  if (!district) {
    blockers.push('Branch is missing a canonical district.');
  } else if (!CANONICAL_JEDDAH_DISTRICT_IDS.has(district)) {
    blockers.push(`District '${district}' is not recognized in canonical Jeddah geography.`);
  }

  if (!addrAr && !addrEn) {
    blockers.push('Branch is missing physical address.');
  }

  if (!branch.google_maps_url) {
    warnings.push('Branch has no Google Maps URL.');
  }
  if (branch.latitude === null || branch.latitude === undefined) {
    warnings.push('Branch has no GPS coordinates.');
  }

  const isEligible = blockers.length === 0;
  const isReady = isEligible && warnings.length === 0;

  return {
    is_recommendation_eligible: isEligible,
    is_production_ready: isReady,
    blockers,
    warnings,
  };
}

/**
 * Computes field-level diffs between existing and proposed states.
 */
export function computeFieldDiffs(
  entityType: 'restaurant' | 'branch',
  entityId: string,
  previous: Record<string, unknown> | null,
  proposed: Record<string, unknown>
): EntityDiff[] {
  const diffs: EntityDiff[] = [];
  if (!previous) {
    for (const [key, val] of Object.entries(proposed)) {
      diffs.push({
        entity_type: entityType,
        entity_id: entityId,
        field: key,
        previous_value: null,
        proposed_value: val,
      });
    }
    return diffs;
  }

  for (const [key, val] of Object.entries(proposed)) {
    const prevVal = previous[key];
    const prevJson = JSON.stringify(prevVal ?? null);
    const nextJson = JSON.stringify(val ?? null);
    if (prevJson !== nextJson) {
      diffs.push({
        entity_type: entityType,
        entity_id: entityId,
        field: key,
        previous_value: prevVal ?? null,
        proposed_value: val,
      });
    }
  }

  return diffs;
}
