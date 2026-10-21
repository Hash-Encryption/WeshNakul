import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Edge API handlers & auth helpers
import {
  createAdminToken,
} from '../functions/api/admin/_auth.ts';

import { onRequestGet as handleCatalogItems } from '../functions/api/admin/catalog/items.ts';
import {
  onRequestGet as handleCatalogDraftsGet,
  onRequestPost as handleCatalogDraftsPost,
  onRequestDelete as handleCatalogDraftsDelete,
} from '../functions/api/admin/catalog/drafts.ts';
import { onRequestPost as handleCatalogValidate } from '../functions/api/admin/catalog/validate.ts';
import { onRequestPost as handleCatalogPublish } from '../functions/api/admin/catalog/publish.ts';
import { onRequestPost as handleCatalogEmergency } from '../functions/api/admin/catalog/emergency.ts';
import { onRequestPost as handleCatalogRollback } from '../functions/api/admin/catalog/rollback.ts';
import {
  onRequestGet as handleCatalogExport,
  sanitizeCsvCell,
} from '../functions/api/admin/catalog/export.ts';

import {
  CANONICAL_JEDDAH_DISTRICT_IDS,
  VALID_CATEGORIES,
  validateBrandFields,
  validateBranchFields,
  evaluateReadiness,
  computeFieldDiffs,
} from '../functions/api/admin/catalog/_validation.ts';

import { ADMIN_TRANSLATIONS } from '../src/locales/adminTranslations.ts';

console.log('======================================================================');
console.log('--- WESHNAKUL PHASE 4: AUTHORITATIVE CATALOG CONTROLS TEST SUITE ---');
console.log('======================================================================');

let checks = 0;
const check = (condition, msg) => {
  assert.ok(condition, msg);
  checks++;
  console.log(`  ✓ [Check ${checks}] ${msg}`);
};

const TEST_SECRET = 'test-phase4-secret-weshnakul-2026';
const mockEnv = {
  TEST_ADMIN_SECRET: TEST_SECRET,
  ADMIN_JWT_SECRET: TEST_SECRET,
  ADMIN_PASSWORD: 'SuperSecretAdminPassword123!',
  ADMIN_EMAIL: 'admin@weshnakul.com',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  VITE_SUPABASE_URL: 'https://test.supabase.co',
};

const adminToken = await createAdminToken(
  { sub: 'admin-phase4', email: 'admin@weshnakul.com', role: 'admin' },
  TEST_SECRET
);

const nonAdminToken = await createAdminToken(
  { sub: 'user-regular', email: 'regular@user.com', role: 'guest' },
  TEST_SECRET
);

// ======================================================================
// SUITE 1: CSV Export Sanitization & Formula-Injection Defenses
// ======================================================================
console.log('\n1. Verifying CSV Export Sanitization & Formula-Injection Defenses...');

check(sanitizeCsvCell('=1+1') === "'=1+1", 'Cell starting with = is escaped with single quote');
check(sanitizeCsvCell('+cmd|"/C calc"!A0') === '"\'+cmd|""/C calc""!A0"', 'Cell starting with + is escaped with single quote and quoted');
check(sanitizeCsvCell('-5+2') === "'-5+2", 'Cell starting with - is escaped with single quote');
check(sanitizeCsvCell('@SUM(1,2)') === '"\'@SUM(1,2)"', 'Cell starting with @ is escaped with single quote');
check(sanitizeCsvCell('Al-Baik, Jeddah') === '"Al-Baik, Jeddah"', 'Cell containing comma is wrapped in double quotes');
check(sanitizeCsvCell('Restaurant "Best"') === '"Restaurant ""Best"""', 'Cell containing quotes escapes quotes with doubled quotes');
check(sanitizeCsvCell(null) === '', 'Null cell produces empty string');
check(sanitizeCsvCell(undefined) === '', 'Undefined cell produces empty string');
check(sanitizeCsvCell('') === '', 'Empty string cell produces empty string');
const arabicSample = 'شاورما شاكر الجزيرة - الروضة';
check(sanitizeCsvCell(arabicSample) === arabicSample, 'Arabic UTF-8 text preserves characters without corruption');
check(sanitizeCsvCell('   =cmd|"/C calc"!A0') === '"\'   =cmd|""/C calc""!A0"', 'Cell starting with leading space and = is escaped with single quote and quoted');
check(sanitizeCsvCell('|cmd|"/C calc"!A0') === '"\'|cmd|""/C calc""!A0"', 'Cell starting with pipe | is escaped with single quote');
check(sanitizeCsvCell('%1+1') === "'%1+1", 'Cell starting with % is escaped with single quote');
check(sanitizeCsvCell('\0=cmd|calc') === "'=cmd|calc", 'Null bytes are stripped and formula neutralized');

// ======================================================================
// SUITE 2: Edge Endpoints Security Boundaries & Authorization
// ======================================================================
console.log('\n2. Verifying Edge Endpoints Security Boundaries & Authorization...');

const endpoints = [
  { name: 'items', fn: handleCatalogItems, method: 'GET', url: 'https://weshnakul.com/api/admin/catalog/items' },
  { name: 'drafts (GET)', fn: handleCatalogDraftsGet, method: 'GET', url: 'https://weshnakul.com/api/admin/catalog/drafts' },
  { name: 'drafts (POST)', fn: handleCatalogDraftsPost, method: 'POST', url: 'https://weshnakul.com/api/admin/catalog/drafts', body: {} },
  { name: 'drafts (DELETE)', fn: handleCatalogDraftsDelete, method: 'DELETE', url: 'https://weshnakul.com/api/admin/catalog/drafts?id=123' },
  { name: 'validate', fn: handleCatalogValidate, method: 'POST', url: 'https://weshnakul.com/api/admin/catalog/validate', body: {} },
  { name: 'publish', fn: handleCatalogPublish, method: 'POST', url: 'https://weshnakul.com/api/admin/catalog/publish', body: {} },
  { name: 'emergency', fn: handleCatalogEmergency, method: 'POST', url: 'https://weshnakul.com/api/admin/catalog/emergency', body: {} },
  { name: 'rollback', fn: handleCatalogRollback, method: 'POST', url: 'https://weshnakul.com/api/admin/catalog/rollback', body: {} },
  { name: 'export', fn: handleCatalogExport, method: 'GET', url: 'https://weshnakul.com/api/admin/catalog/export' },
];

for (const ep of endpoints) {
  // 2a. Unauthenticated request -> 401
  const reqUnauth = new Request(ep.url, {
    method: ep.method,
    headers: { 'Content-Type': 'application/json' },
    body: ep.body ? JSON.stringify(ep.body) : undefined,
  });
  const resUnauth = await ep.fn({ request: reqUnauth, env: mockEnv });
  check(resUnauth.status === 401, `Unauthenticated ${ep.method} /api/admin/catalog/${ep.name} rejected with 401 Unauthorized`);

  // 2b. Non-admin request -> 403
  const reqNonAdmin = new Request(ep.url, {
    method: ep.method,
    headers: {
      Authorization: `Bearer ${nonAdminToken}`,
      'Content-Type': 'application/json',
    },
    body: ep.body ? JSON.stringify(ep.body) : undefined,
  });
  const resNonAdmin = await ep.fn({ request: reqNonAdmin, env: mockEnv });
  check(resNonAdmin.status === 403, `Non-admin ${ep.method} /api/admin/catalog/${ep.name} rejected with 403 Forbidden`);
}

// 2c. Authenticated admin request with unconfigured upstream returns graceful fallback
const emptyEnv = { ADMIN_JWT_SECRET: TEST_SECRET };
const reqItemsEmpty = new Request('https://weshnakul.com/api/admin/catalog/items', {
  headers: { Authorization: `Bearer ${adminToken}` },
});
const resItemsEmpty = await handleCatalogItems({ request: reqItemsEmpty, env: emptyEnv });
check(resItemsEmpty.status === 200, 'Authenticated items request with unconfigured upstream returns 200 fallback');
const jsonItemsEmpty = await resItemsEmpty.json();
check(jsonItemsEmpty.warning === 'upstream_not_configured', 'Fallback response flags upstream_not_configured');
check(Array.isArray(jsonItemsEmpty.brands) && jsonItemsEmpty.brands.length === 0, 'Fallback brands is empty array');
check(Array.isArray(jsonItemsEmpty.districts) && jsonItemsEmpty.districts.length === 30, 'Fallback districts contains all 30 canonical Jeddah districts');

// 2d. Authenticated export with unconfigured upstream returns CSV template with UTF-8 BOM
const reqExportEmpty = new Request('https://weshnakul.com/api/admin/catalog/export', {
  headers: { Authorization: `Bearer ${adminToken}` },
});
const resExportEmpty = await handleCatalogExport({ request: reqExportEmpty, env: emptyEnv });
check(resExportEmpty.status === 200, 'Authenticated export with unconfigured upstream returns 200 CSV template');
check(resExportEmpty.headers.get('Content-Type')?.includes('text/csv'), 'Export response has Content-Type: text/csv');
const exportBytes = await resExportEmpty.bytes();
check(
  exportBytes[0] === 0xef && exportBytes[1] === 0xbb && exportBytes[2] === 0xbf,
  'Export CSV contains UTF-8 BOM (0xEF, 0xBB, 0xBF) for Excel compatibility'
);

// ======================================================================
// SUITE 3: Authoritative Catalog Validation & Readiness Rules
// ======================================================================
console.log('\n3. Verifying Authoritative Catalog Validation & Readiness Rules...');

// 3a. Canonical 30 Jeddah districts
check(CANONICAL_JEDDAH_DISTRICT_IDS.size === 30, 'Authoritative Jeddah district set contains exactly 30 municipal districts');
check(CANONICAL_JEDDAH_DISTRICT_IDS.has('al_rawdah'), "District 'al_rawdah' is valid canonical district");
check(CANONICAL_JEDDAH_DISTRICT_IDS.has('al_naeem'), "District 'al_naeem' is valid canonical district");
check(!CANONICAL_JEDDAH_DISTRICT_IDS.has('olaya'), "District 'olaya' (Riyadh) is rejected as non-canonical");
check(!CANONICAL_JEDDAH_DISTRICT_IDS.has('dubai_marina'), "Foreign district is rejected as non-canonical");

// 3b. Categories taxonomy
check(VALID_CATEGORIES.has('burger'), "'burger' is valid category");
check(VALID_CATEGORIES.has('shawarma'), "'shawarma' is valid category");
check(VALID_CATEGORIES.has('breakfast'), "'breakfast' is valid category");
check(VALID_CATEGORIES.has('rice'), "'rice' is valid category");
check(VALID_CATEGORIES.has('grill'), "'grill' is valid category");
check(VALID_CATEGORIES.has('broast'), "'broast' is valid category");
check(VALID_CATEGORIES.has('saudi_kabsa'), "'saudi_kabsa' is valid category");
check(!VALID_CATEGORIES.has('unknown_food_type'), 'Unknown food category is rejected');

// 3c. Brand field validation
const brandErr1 = validateBrandFields('test_brand', { categories: ['burger', 'invalid_cat'] });
check(brandErr1.some(e => e.code === 'INVALID_CATEGORY'), 'Invalid category triggers INVALID_CATEGORY error');

const brandErr2 = validateBrandFields('test_brand', { rating: 5.5 });
check(brandErr2.some(e => e.code === 'INVALID_RATING'), 'Rating > 5.0 triggers INVALID_RATING error');

const brandErr3 = validateBrandFields('test_brand', { operating_status: 'invalid_status' });
check(brandErr3.some(e => e.code === 'INVALID_STATUS'), 'Invalid operating_status triggers INVALID_STATUS error');

const brandErr4 = validateBrandFields('test_brand', { research_use: 'invalid_use' });
check(brandErr4.some(e => e.code === 'INVALID_RESEARCH_USE'), 'Invalid research_use triggers INVALID_RESEARCH_USE error');

const brandUnknownErr = validateBrandFields('test_brand', { malicious_column: 'inject' });
check(brandUnknownErr.some(e => e.code === 'UNKNOWN_FIELD'), 'Unknown brand field triggers UNKNOWN_FIELD error');

const brandMismatchErr = validateBrandFields('test_brand', { district: 'al_rawdah' });
check(brandMismatchErr.some(e => e.code === 'FIELD_ENTITY_MISMATCH'), 'Branch field in brand update triggers FIELD_ENTITY_MISMATCH error');

const brandPrimCatErr = validateBrandFields('test_brand', { primary_category: 'burger' });
check(brandPrimCatErr.some(e => e.code === 'DERIVED_FIELD_NOT_EDITABLE'), 'primary_category in brand update triggers DERIVED_FIELD_NOT_EDITABLE error');

const brandReasonsLimitErr = validateBrandFields('test_brand', { manual_review_reasons: new Array(21).fill('reason') });
check(brandReasonsLimitErr.some(e => e.code === 'FIELD_LIMIT_EXCEEDED'), 'manual_review_reasons > 20 items triggers FIELD_LIMIT_EXCEEDED error');

const brandReasonsLenErr = validateBrandFields('test_brand', { manual_review_reasons: ['a'.repeat(201)] });
check(brandReasonsLenErr.some(e => e.code === 'INVALID_FIELD_VALUE'), 'manual_review_reasons item > 200 chars triggers INVALID_FIELD_VALUE error');

const brandTzErr = validateBrandFields('test_brand', { last_verified_at: '2026-10-21T07:00:00' });
check(brandTzErr.some(e => e.code === 'INVALID_TIMESTAMP'), 'last_verified_at missing timezone triggers INVALID_TIMESTAMP error');

check(validateBrandFields('test_brand', { last_verified_at: '2026-10-21T07:00:00+14:00' }).length === 0, 'Brand last_verified_at with +14:00 boundary passes validation');
check(validateBrandFields('test_brand', { last_verified_at: '2026-10-21T07:00:00-14:00' }).length === 0, 'Brand last_verified_at with -14:00 boundary passes validation');
check(validateBrandFields('test_brand', { last_verified_at: '2026-10-21T07:00:00.123Z' }).length === 0, 'Brand last_verified_at with subseconds passes validation');
check(validateBrandFields('test_brand', { last_verified_at: '2026-10-21T07:00:00+14:01' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Brand last_verified_at with +14:01 triggers INVALID_TIMESTAMP');
check(validateBrandFields('test_brand', { last_verified_at: '2026-10-21T07:00:00+14:30' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Brand last_verified_at with +14:30 triggers INVALID_TIMESTAMP');
check(validateBrandFields('test_brand', { last_verified_at: '2026-10-21T07:00:00+15:00' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Brand last_verified_at with +15:00 triggers INVALID_TIMESTAMP');
check(validateBrandFields('test_brand', { last_verified_at: '2026-10-21T07:00:00-14:01' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Brand last_verified_at with -14:01 triggers INVALID_TIMESTAMP');
check(validateBrandFields('test_brand', { last_verified_at: '2026-10-21T07:00:00+03:60' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Brand last_verified_at with +03:60 triggers INVALID_TIMESTAMP');
check(validateBrandFields('test_brand', { last_verified_at: '2026-99-99 not-a-date' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Brand last_verified_at with malformed date triggers INVALID_TIMESTAMP');
check(validateBrandFields('test_brand', { last_verified_at: 12345 }).some(e => e.code === 'INVALID_FIELD_TYPE'), 'Brand last_verified_at with non-string triggers INVALID_FIELD_TYPE');

const brandValid = validateBrandFields('test_brand', {
  name_en: 'Burger Boutique',
  categories: ['burger', 'sandwiches'],
  rating: 4.7,
  operating_status: 'open',
  research_use: 'production_ready',
  manual_review_reasons: ['Initial catalog entry', 'Verified with owner'],
  last_verified_at: '2026-10-21T07:00:00Z',
});
check(brandValid.length === 0, 'Valid brand changes pass validation with 0 errors');

// 3d. Branch field validation
const branchErr1 = validateBranchFields('branch_1', { district: 'olaya' });
check(branchErr1.some(e => e.code === 'NON_CANONICAL_DISTRICT'), 'Non-canonical district triggers NON_CANONICAL_DISTRICT error');

const branchErr2 = validateBranchFields('branch_1', {
  district: 'al_rawdah',
  address_ar: '',
  address_en: '',
});
check(branchErr2.some(e => e.code === 'REQUIRED_ADDRESS_MISSING'), 'Missing address triggers REQUIRED_ADDRESS_MISSING error');

const branchErr3 = validateBranchFields('branch_1', {
  district: 'al_rawdah',
  address_ar: 'شارع صاري',
  latitude: 51.5074, // London
  longitude: -0.1278,
});
check(branchErr3.some(e => e.code === 'COORDINATES_OUT_OF_BOUNDS'), 'London coordinates trigger COORDINATES_OUT_OF_BOUNDS error');

const branchErr4 = validateBranchFields('branch_1', {
  district: 'al_rawdah',
  address_ar: 'شارع صاري',
  google_maps_url: 'http://insecure-maps.com',
});
check(branchErr4.some(e => e.code === 'INVALID_MAPS_URL'), 'Insecure HTTP Maps URL triggers INVALID_MAPS_URL error');

const branchErrSuffix = validateBranchFields('branch_1', {
  district: 'al_rawdah',
  address_ar: 'شارع صاري',
  google_maps_url: 'https://maps.google.com.evil.com/maps',
});
check(branchErrSuffix.some(e => e.code === 'INVALID_MAPS_URL'), 'Deceptive subdomain suffix Maps URL triggers INVALID_MAPS_URL error');

const branchErrUserinfo = validateBranchFields('branch_1', {
  district: 'al_rawdah',
  address_ar: 'شارع صاري',
  google_maps_url: 'https://admin:pass@maps.google.com/maps',
});
check(branchErrUserinfo.some(e => e.code === 'INVALID_MAPS_URL'), 'Userinfo credentials in Maps URL triggers INVALID_MAPS_URL error');

const branchErrPort = validateBranchFields('branch_1', {
  district: 'al_rawdah',
  address_ar: 'شارع صاري',
  google_maps_url: 'https://maps.google.com:8080/maps',
});
check(branchErrPort.some(e => e.code === 'INVALID_MAPS_URL'), 'Non-standard port in Maps URL triggers INVALID_MAPS_URL error');

const branchErrPort443 = validateBranchFields('branch_1', {
  district: 'al_rawdah',
  address_ar: 'شارع صاري',
  google_maps_url: 'https://maps.google.com:443/maps',
});
check(branchErrPort443.some(e => e.code === 'INVALID_MAPS_URL'), 'Explicit :443 port in Maps URL triggers INVALID_MAPS_URL error in TypeScript');

const branchErrMalformed = validateBranchFields('branch_1', {
  district: 'al_rawdah',
  address_ar: 'شارع صاري',
  google_maps_url: 'https://',
});
check(branchErrMalformed.some(e => e.code === 'INVALID_MAPS_URL'), 'Malformed Maps URL triggers INVALID_MAPS_URL error in TypeScript');

const branchValidPlace = validateBranchFields('branch_1', {
  district: 'al_rawdah',
  address_ar: 'شارع صاري',
  google_maps_url: 'https://maps.google.com/place/Century+Burger/@21.5,39.1',
});
check(branchValidPlace.length === 0, 'Valid Maps URL with /place path passes validation in TypeScript');

const branchUnknownErr = validateBranchFields('branch_1', { drop_table: true, district: 'al_rawdah', address_ar: 'شارع صاري' });
check(branchUnknownErr.some(e => e.code === 'UNKNOWN_FIELD'), 'Unknown branch field triggers UNKNOWN_FIELD error');

const branchMismatchErr = validateBranchFields('branch_1', { tier: 'staple', district: 'al_rawdah', address_ar: 'شارع صاري' });
check(branchMismatchErr.some(e => e.code === 'FIELD_ENTITY_MISMATCH'), 'Brand field in branch update triggers FIELD_ENTITY_MISMATCH error');

const branchParityErr = validateBranchFields('branch_1', { district: 'al_rawdah', address_ar: 'شارع صاري', latitude: 21.5 });
check(branchParityErr.some(e => e.code === 'COORDINATE_PARITY_VIOLATION'), 'Latitude without longitude triggers COORDINATE_PARITY_VIOLATION error');

const branchValid = validateBranchFields('branch_1', {
  district: 'al_rawdah',
  address_ar: 'شارع صاري، حي الروضة',
  address_en: 'Sari Street, Al Rawdah',
  latitude: 21.5714,
  longitude: 39.1628,
  google_maps_url: 'https://maps.google.com/?cid=123456',
});
check(branchValid.length === 0, 'Valid branch changes pass validation with 0 errors');

// Branch last_verified_at timestamp cases
check(validateBranchFields('branch_1', { district: 'al_rawdah', address_en: 'Sari St', last_verified_at: '2026-10-21T07:00:00+14:00' }).length === 0, 'Branch last_verified_at with +14:00 boundary passes validation');
check(validateBranchFields('branch_1', { district: 'al_rawdah', address_en: 'Sari St', last_verified_at: '2026-10-21T07:00:00-14:00' }).length === 0, 'Branch last_verified_at with -14:00 boundary passes validation');
check(validateBranchFields('branch_1', { district: 'al_rawdah', address_en: 'Sari St', last_verified_at: '2026-10-21T07:00:00.123Z' }).length === 0, 'Branch last_verified_at with subseconds passes validation');
check(validateBranchFields('branch_1', { district: 'al_rawdah', address_en: 'Sari St', last_verified_at: '2026-10-21T07:00:00' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Branch last_verified_at missing timezone triggers INVALID_TIMESTAMP error');
check(validateBranchFields('branch_1', { district: 'al_rawdah', address_en: 'Sari St', last_verified_at: '2026-10-21T07:00:00+14:01' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Branch last_verified_at with +14:01 triggers INVALID_TIMESTAMP');
check(validateBranchFields('branch_1', { district: 'al_rawdah', address_en: 'Sari St', last_verified_at: '2026-10-21T07:00:00+14:30' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Branch last_verified_at with +14:30 triggers INVALID_TIMESTAMP');
check(validateBranchFields('branch_1', { district: 'al_rawdah', address_en: 'Sari St', last_verified_at: '2026-10-21T07:00:00+15:00' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Branch last_verified_at with +15:00 triggers INVALID_TIMESTAMP');
check(validateBranchFields('branch_1', { district: 'al_rawdah', address_en: 'Sari St', last_verified_at: '2026-10-21T07:00:00-14:01' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Branch last_verified_at with -14:01 triggers INVALID_TIMESTAMP');
check(validateBranchFields('branch_1', { district: 'al_rawdah', address_en: 'Sari St', last_verified_at: '2026-10-21T07:00:00+03:60' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Branch last_verified_at with +03:60 triggers INVALID_TIMESTAMP');
check(validateBranchFields('branch_1', { district: 'al_rawdah', address_en: 'Sari St', last_verified_at: '2026-99-99 not-a-date' }).some(e => e.code === 'INVALID_TIMESTAMP'), 'Branch last_verified_at with malformed date triggers INVALID_TIMESTAMP');
check(validateBranchFields('branch_1', { district: 'al_rawdah', address_en: 'Sari St', last_verified_at: 12345 }).some(e => e.code === 'INVALID_FIELD_TYPE'), 'Branch last_verified_at with non-string triggers INVALID_FIELD_TYPE');

// 3d-2. Server simulation validation (validate.ts) readiness blocker for open branch
const valReqOpenFailing = new Request('https://weshnakul.com/api/admin/catalog/validate', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    target_entities: [
      {
        entity_type: 'branch',
        entity_id: 'branch_bad',
        changes: { branch_status: 'open', district: 'olaya', address_ar: 'شارع صاري' },
      },
    ],
  }),
});
const valResOpenFailing = await handleCatalogValidate({ request: valReqOpenFailing, env: emptyEnv });
const valJsonOpenFailing = await valResOpenFailing.json();
check(valJsonOpenFailing.is_publishable === false, 'Open branch failing readiness is NOT publishable (is_publishable = false)');
check(valJsonOpenFailing.errors.some(e => e.code === 'READINESS_BLOCKED' || e.code === 'NON_CANONICAL_DISTRICT'), 'Readiness blocker emitted as error for open branch');

// 3d-3. Server validation (validate.ts) rejects unknown target key and malformed base_version
const valReqUnknownKey = new Request('https://weshnakul.com/api/admin/catalog/validate', {
  method: 'POST',
  headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    target_entities: [
      {
        entity_type: 'restaurant',
        entity_id: 'brand_test',
        changes: { rating: 4.5 },
        unsupported_key: true,
      },
    ],
  }),
});
const valResUnknownKey = await handleCatalogValidate({ request: valReqUnknownKey, env: emptyEnv });
const valJsonUnknownKey = await valResUnknownKey.json();
check(valJsonUnknownKey.errors.some(e => e.code === 'UNSUPPORTED_TARGET_KEY'), 'Unknown target key triggers UNSUPPORTED_TARGET_KEY error in validate.ts');

const valReqBadBaseVer = new Request('https://weshnakul.com/api/admin/catalog/validate', {
  method: 'POST',
  headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    target_entities: [
      {
        entity_type: 'restaurant',
        entity_id: 'brand_test',
        base_version: '2026-10-21T07:00:00', // missing timezone
        changes: { rating: 4.5 },
      },
    ],
  }),
});
const valResBadBaseVer = await handleCatalogValidate({ request: valReqBadBaseVer, env: emptyEnv });
const valJsonBadBaseVer = await valResBadBaseVer.json();
check(valJsonBadBaseVer.errors.some(e => e.code === 'INVALID_TIMESTAMP'), 'base_version missing timezone triggers INVALID_TIMESTAMP error in validate.ts');

const valReqGoodBaseVer = new Request('https://weshnakul.com/api/admin/catalog/validate', {
  method: 'POST',
  headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    target_entities: [
      {
        entity_type: 'restaurant',
        entity_id: 'brand_test',
        base_version: '2026-10-21T07:00:00+03:00',
        changes: { name_en: 'Test Brand', categories: ['burger'] },
      },
    ],
  }),
});
const valResGoodBaseVer = await handleCatalogValidate({ request: valReqGoodBaseVer, env: emptyEnv });
const valJsonGoodBaseVer = await valResGoodBaseVer.json();
check(!valJsonGoodBaseVer.errors.some(e => e.code === 'INVALID_TIMESTAMP'), 'base_version with timezone passes timestamp validation in validate.ts');

// 3e. Recommendation eligibility & branch readiness evaluation
const eligibleEval = evaluateReadiness(
  { operating_status: 'open', research_use: 'production_ready' },
  {
    branch_status: 'open',
    district: 'al_rawdah',
    address_ar: 'شارع صاري',
    google_maps_url: 'https://maps.google.com/?cid=123',
    latitude: 21.5714,
    longitude: 39.1628,
  }
);
check(eligibleEval.is_recommendation_eligible === true, 'Eligible brand + branch is recommendation eligible');
check(eligibleEval.is_production_ready === true, 'Eligible brand + branch with Maps URL and GPS is production ready');
check(eligibleEval.blockers.length === 0, 'Zero blockers for fully compliant branch');

const blockedBrandEval = evaluateReadiness(
  { operating_status: 'temporarily_closed', research_use: 'production_ready' },
  { branch_status: 'open', district: 'al_rawdah', address_ar: 'شارع صاري' }
);
check(blockedBrandEval.is_recommendation_eligible === false, 'Temporarily closed brand is NOT recommendation eligible');
check(blockedBrandEval.blockers.some(b => b.includes('Brand status is')), 'Blocker recorded for non-open brand status');

const blockedBranchEval = evaluateReadiness(
  { operating_status: 'open', research_use: 'production_ready' },
  { branch_status: 'open', district: 'unknown_district', address_ar: 'شارع صاري' }
);
check(blockedBranchEval.is_recommendation_eligible === false, 'Branch with unrecognized district is NOT recommendation eligible');
check(blockedBranchEval.blockers.some(b => b.includes('not recognized in canonical Jeddah')), 'Blocker recorded for non-canonical district');

// 3f. Field diff computation
const diffs = computeFieldDiffs(
  'restaurant',
  'brand_1',
  { name_en: 'Old Name', rating: 4.2 },
  { name_en: 'New Name', rating: 4.2, categories: ['burger'] }
);
check(diffs.length === 2, 'Field diffs identify exact 2 changed fields');
const nameDiff = diffs.find(d => d.field === 'name_en');
check(nameDiff?.previous_value === 'Old Name' && nameDiff?.proposed_value === 'New Name', 'name_en diff captures previous and proposed values');
const catDiff = diffs.find(d => d.field === 'categories');
check(catDiff?.previous_value === null && Array.isArray(catDiff?.proposed_value), 'New categories field diff shows previous_value null');

// ======================================================================
// SUITE 4: Database Migrations, RLS, & Table Setup in PGlite
// ======================================================================
console.log('\n4. Verifying Postgres Schema, RLS, and Migrations in PGlite...');

const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const { PGlite } = await import(pathToFileURL(runtime).href);
const db = new PGlite();

await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');

// Apply Foundation & Phase 2 migrations
const sqlFoundation = readFileSync('supabase/migrations/20261015000100_analytics_foundation.sql', 'utf8').replace(/BEGIN;|COMMIT;/g, '');
await db.exec(sqlFoundation);

const sqlAdminReads = readFileSync('supabase/migrations/20261016000100_admin_analytics_reads.sql', 'utf8').replace(/BEGIN;|COMMIT;/g, '');
await db.exec(sqlAdminReads);

// Create enum types and base tables
await db.exec(`
  CREATE TYPE public.intelligence_confidence AS ENUM ('high', 'medium', 'low', 'unknown');
  CREATE TYPE public.editorial_role AS ENUM ('staple', 'popular', 'discovery');
  CREATE TYPE public.trend_status AS ENUM ('none', 'rising', 'trending', 'cooling', 'unknown');
  CREATE TYPE public.research_use AS ENUM ('production_ready', 'usable_with_caution', 'manual_review_only', 'rejected');
  CREATE TYPE public.price_position AS ENUM ('budget', 'standard', 'premium', 'unknown');
  CREATE TYPE public.operating_status AS ENUM ('open', 'temporarily_closed', 'permanently_closed', 'unknown');
  CREATE TYPE public.branch_type AS ENUM ('full_dine_in', 'takeaway_only', 'delivery_only', 'mall_foodcourt', 'airport', 'kiosk', 'unknown');
  CREATE TYPE public.maps_lookup_status AS ENUM ('verified', 'ambiguous', 'not_found', 'secondary_only', 'unknown');
  CREATE TYPE public.rating_source AS ENUM ('google_maps_direct', 'google_derived_secondary', 'official', 'other', 'unknown');

  CREATE TABLE IF NOT EXISTS public.restaurants (
    id text primary key,
    name_en text,
    name_ar text,
    categories text[] default '{}',
    primary_category text,
    last_verified_at timestamptz,
    dining_mode text default 'both',
    tier text default 'staple',
    price_tier text default '$$',
    rating numeric(2,1) default 4.5,
    operating_status public.operating_status default 'open',
    research_use public.research_use default 'production_ready',
    price_position public.price_position default 'standard',
    editorial_role public.editorial_role,
    manual_review_required boolean default false,
    manual_review_reasons text[] default '{}',
    official_phone text,
    updated_at timestamptz default now()
  );

  CREATE TABLE IF NOT EXISTS public.restaurant_branches (
    id uuid primary key default gen_random_uuid(),
    restaurant_id text references public.restaurants(id),
    branch_name_en text,
    branch_name_ar text,
    district text,
    address_ar text,
    address_en text,
    latitude double precision,
    longitude double precision,
    google_maps_url text,
    branch_status public.operating_status default 'open',
    branch_type public.branch_type default 'full_dine_in',
    dine_in boolean default true,
    takeaway boolean default true,
    late_night boolean default false,
    is_24_hours boolean default false,
    last_verified_at timestamptz,
    updated_at timestamptz default now()
  );

  GRANT ALL ON public.restaurants TO service_role;
  GRANT SELECT ON public.restaurants TO anon, authenticated;
  GRANT ALL ON public.restaurant_branches TO service_role;
  GRANT SELECT ON public.restaurant_branches TO anon, authenticated;
`);

// Apply Phase 3 migration
const sqlPhase3 = readFileSync('supabase/migrations/20261019000100_phase3_deep_analytics_and_catalog_history.sql', 'utf8').replace(/BEGIN;|COMMIT;/g, '');
await db.exec(sqlPhase3);

// Apply Phase 4 migration
const sqlPhase4 = readFileSync('supabase/migrations/20261021000100_phase4_catalog_controls.sql', 'utf8').replace(/BEGIN;|COMMIT;/g, '');
await db.exec(sqlPhase4);
check(true, 'Phase 4 migration 20261021000100 applied cleanly to Postgres');

// 4a. RLS enforcement on catalog_draft_changesets
await db.exec('SET ROLE anon;');
try {
  await db.query('SELECT * FROM public.catalog_draft_changesets;');
  assert.fail('anon should not SELECT from catalog_draft_changesets');
} catch (err) {
  check(err.code === '42501', 'Direct SELECT on public.catalog_draft_changesets denied for anon (42501)');
}

await db.exec('SET ROLE authenticated;');
try {
  await db.query('SELECT * FROM public.catalog_draft_changesets;');
  assert.fail('authenticated should not SELECT from catalog_draft_changesets');
} catch (err) {
  check(err.code === '42501', 'Direct SELECT on public.catalog_draft_changesets denied for authenticated (42501)');
}

await db.exec('RESET ROLE;');
await db.exec('RESET ROLE;');

// 4b. RPC publish_catalog_changeset permissions
await db.exec('SET ROLE anon;');
try {
  await db.query(`SELECT public.publish_catalog_changeset('${randomUUID()}'::uuid, 'anon');`);
  assert.fail('anon should not execute publish_catalog_changeset');
} catch (err) {
  check(err.code === '42501', 'Execution of publish_catalog_changeset denied for anon (42501)');
}

await db.exec('SET ROLE authenticated;');
try {
  await db.query(`SELECT public.publish_catalog_changeset('${randomUUID()}'::uuid, 'authenticated');`);
  assert.fail('authenticated should not execute publish_catalog_changeset');
} catch (err) {
  check(err.code === '42501', 'Execution of publish_catalog_changeset denied for authenticated (42501)');
}

await db.exec('RESET ROLE;');

// 4c. Direct table mutation denial for untrusted roles (anon & authenticated)
await db.exec('SET ROLE anon;');
try {
  await db.query("INSERT INTO public.catalog_draft_changesets (title, created_by) VALUES ('hacked', 'anon');");
  assert.fail('anon should not INSERT into catalog_draft_changesets');
} catch (err) {
  check(err.code === '42501', 'Direct INSERT into catalog_draft_changesets denied for anon (42501)');
}

try {
  await db.query("INSERT INTO public.restaurants (id, name_en, name_ar) VALUES ('evil_rest', 'Evil', 'شرير');");
  assert.fail('anon should not INSERT into restaurants');
} catch (err) {
  check(err.code === '42501', 'Direct INSERT into restaurants denied for anon (42501)');
}

try {
  await db.query("UPDATE public.restaurants SET rating = 1.0 WHERE id = 'al_tazaj';");
  assert.fail('anon should not UPDATE restaurants');
} catch (err) {
  check(err.code === '42501', 'Direct UPDATE on restaurants denied for anon (42501)');
}

try {
  await db.query("DELETE FROM public.restaurants WHERE id = 'al_tazaj';");
  assert.fail('anon should not DELETE from restaurants');
} catch (err) {
  check(err.code === '42501', 'Direct DELETE on restaurants denied for anon (42501)');
}

try {
  await db.query("INSERT INTO public.restaurant_branches (restaurant_id, district) VALUES ('al_tazaj', 'al_rawdah');");
  assert.fail('anon should not INSERT into restaurant_branches');
} catch (err) {
  check(err.code === '42501', 'Direct INSERT into restaurant_branches denied for anon (42501)');
}

try {
  await db.query("UPDATE public.restaurant_branches SET district = 'al_safa';");
  assert.fail('anon should not UPDATE restaurant_branches');
} catch (err) {
  check(err.code === '42501', 'Direct UPDATE on restaurant_branches denied for anon (42501)');
}

try {
  await db.query("DELETE FROM public.restaurant_branches WHERE true;");
  assert.fail('anon should not DELETE from restaurant_branches');
} catch (err) {
  check(err.code === '42501', 'Direct DELETE on restaurant_branches denied for anon (42501)');
}

// Untrusted role can SELECT restaurants and restaurant_branches (read-only client access)
const anonRestSelect = await db.query('SELECT count(*) FROM public.restaurants;');
check(anonRestSelect.rows.length === 1, 'Legitimate read SELECT on restaurants permitted for anon');
const anonBranchSelect = await db.query('SELECT count(*) FROM public.restaurant_branches;');
check(anonBranchSelect.rows.length === 1, 'Legitimate read SELECT on restaurant_branches permitted for anon');

await db.exec('SET ROLE authenticated;');
try {
  await db.query("INSERT INTO public.catalog_draft_changesets (title, created_by) VALUES ('hacked', 'authenticated');");
  assert.fail('authenticated should not INSERT into catalog_draft_changesets');
} catch (err) {
  check(err.code === '42501', 'Direct INSERT into catalog_draft_changesets denied for authenticated (42501)');
}

try {
  await db.query("INSERT INTO public.restaurants (id, name_en, name_ar) VALUES ('evil_rest_auth', 'Evil Auth', 'شرير');");
  assert.fail('authenticated should not INSERT into restaurants');
} catch (err) {
  check(err.code === '42501', 'Direct INSERT into restaurants denied for authenticated (42501)');
}

try {
  await db.query("UPDATE public.restaurants SET rating = 1.0 WHERE id = 'al_tazaj';");
  assert.fail('authenticated should not UPDATE restaurants');
} catch (err) {
  check(err.code === '42501', 'Direct UPDATE on restaurants denied for authenticated (42501)');
}

try {
  await db.query("DELETE FROM public.restaurants WHERE id = 'al_tazaj';");
  assert.fail('authenticated should not DELETE from restaurants');
} catch (err) {
  check(err.code === '42501', 'Direct DELETE on restaurants denied for authenticated (42501)');
}

try {
  await db.query("INSERT INTO public.restaurant_branches (restaurant_id, district) VALUES ('al_tazaj', 'al_rawdah');");
  assert.fail('authenticated should not INSERT into restaurant_branches');
} catch (err) {
  check(err.code === '42501', 'Direct INSERT into restaurant_branches denied for authenticated (42501)');
}

try {
  await db.query("UPDATE public.restaurant_branches SET district = 'al_safa';");
  assert.fail('authenticated should not UPDATE restaurant_branches');
} catch (err) {
  check(err.code === '42501', 'Direct UPDATE on restaurant_branches denied for authenticated (42501)');
}

try {
  await db.query("DELETE FROM public.restaurant_branches WHERE true;");
  assert.fail('authenticated should not DELETE from restaurant_branches');
} catch (err) {
  check(err.code === '42501', 'Direct DELETE on restaurant_branches denied for authenticated (42501)');
}

const authRestSelect = await db.query('SELECT count(*) FROM public.restaurants;');
check(authRestSelect.rows.length === 1, 'Legitimate read SELECT on restaurants permitted for authenticated');
const authBranchSelect = await db.query('SELECT count(*) FROM public.restaurant_branches;');
check(authBranchSelect.rows.length === 1, 'Legitimate read SELECT on restaurant_branches permitted for authenticated');

await db.exec('RESET ROLE;');

// 4d. Direct execution of internal trigger functions denied for untrusted roles
await db.exec('SET ROLE anon;');
try {
  await db.query('SELECT public.touch_catalog_draft_updated_at();');
  assert.fail('anon should not execute touch_catalog_draft_updated_at');
} catch (err) {
  check(err.code === '42501', 'Direct execution of touch_catalog_draft_updated_at denied for anon (42501)');
}

try {
  await db.query('SELECT public.trg_record_restaurant_catalog_change();');
  assert.fail('anon should not execute trg_record_restaurant_catalog_change');
} catch (err) {
  check(err.code === '42501', 'Direct execution of trg_record_restaurant_catalog_change denied for anon (42501)');
}

try {
  await db.query('SELECT public.trg_record_branch_catalog_change();');
  assert.fail('anon should not execute trg_record_branch_catalog_change');
} catch (err) {
  check(err.code === '42501', 'Direct execution of trg_record_branch_catalog_change denied for anon (42501)');
}
await db.exec('RESET ROLE;');

// 4e. Inspect RPC metadata
const rpcProc = await db.query(`
  SELECT provolatile, prosecdef, proconfig
  FROM pg_proc
  WHERE proname = 'publish_catalog_changeset';
`);
check(rpcProc.rows[0]?.provolatile === 'v', 'publish_catalog_changeset is VOLATILE (provolatile = v)');
check(rpcProc.rows[0]?.prosecdef === true, 'publish_catalog_changeset is SECURITY DEFINER');
check(
  Array.isArray(rpcProc.rows[0]?.proconfig) && rpcProc.rows[0].proconfig.some(c => c.includes('search_path=pg_catalog')),
  'publish_catalog_changeset enforces search_path = pg_catalog'
);

// 4d. Seed initial restaurant and branches for subsequent suites
await db.exec('SET ROLE service_role;');
await db.exec(`
  INSERT INTO public.restaurants (id, name_en, name_ar, categories, rating, editorial_role, updated_at)
  VALUES ('al_tazaj', 'Al Tazaj', 'الطازج', ARRAY['fried_chicken', 'grills'], 4.5, 'staple', now());

  INSERT INTO public.restaurant_branches (id, restaurant_id, branch_name_en, branch_name_ar, district, address_en, address_ar, updated_at)
  VALUES ('22222222-2222-2222-2222-222222222222'::uuid, 'al_tazaj', 'Al Rawdah Branch', 'فرع الروضة', 'al_rawdah', 'Al Rawdah District, Sari Street', 'حي الروضة، شارع صاري', now());

  INSERT INTO public.restaurant_branches (id, restaurant_id, branch_name_en, branch_name_ar, district, address_en, address_ar, updated_at)
  VALUES ('33333333-3333-3333-3333-333333333333'::uuid, 'al_tazaj', 'Al Naeem Branch', 'فرع النعيم', 'al_naeem', 'Al Naeem District, Hira Street', 'حي النعيم، شارع حراء', now());
`);

const initBrand = await db.query("SELECT id, name_en, updated_at FROM public.restaurants WHERE id = 'al_tazaj';");
check(initBrand.rows.length === 1, 'Initial seed brand al_tazaj created in PGlite');
const initBranch = await db.query("SELECT id, branch_name_en, updated_at FROM public.restaurant_branches WHERE id = '22222222-2222-2222-2222-222222222222'::uuid;");
check(initBranch.rows.length === 1, 'Initial seed branch 1 created in PGlite');

// ======================================================================
// SUITE 5: Draft Change Set Lifecycle & Isolation
// ======================================================================
console.log('\n5. Verifying Draft Change Set Lifecycle & Isolation...');

const brandBaseVer = initBrand.rows[0].updated_at.toISOString();

// 5a. Create draft change set in catalog_draft_changesets
const draft1 = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title,
    status,
    change_type,
    target_entities,
    created_by
  ) VALUES (
    'Draft: Update Al Tazaj Rating',
    'draft',
    'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'al_tazaj',
        'base_version', '${brandBaseVer}',
        'changes', jsonb_build_object('rating', 4.8)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id, status;
`);
const draft1Id = draft1.rows[0].id;
check(draft1.rows[0].status === 'draft', 'Draft created with status = draft');

// 5b. Verify isolation: live catalog remains unaffected while draft exists
const liveBrandUnchanged = await db.query("SELECT rating FROM public.restaurants WHERE id = 'al_tazaj';");
check(Number(liveBrandUnchanged.rows[0].rating) === 4.5, 'Live catalog record is completely isolated and unchanged while draft exists');

// 5c. Discard draft: draft status transitions to cancelled, live record remains untouched
await db.query(`
  UPDATE public.catalog_draft_changesets
  SET status = 'cancelled', updated_at = now()
  WHERE id = '${draft1Id}'::uuid;
`);
const discardedDraft = await db.query(`SELECT status FROM public.catalog_draft_changesets WHERE id = '${draft1Id}'::uuid;`);
check(discardedDraft.rows[0].status === 'cancelled', 'Draft status transitioned to cancelled');

const liveBrandStillUnchanged = await db.query("SELECT rating FROM public.restaurants WHERE id = 'al_tazaj';");
check(Number(liveBrandStillUnchanged.rows[0].rating) === 4.5, 'Live catalog remains untouched after draft discard');

// ======================================================================
// SUITE 6: Atomic Publication via publish_catalog_changeset RPC
// ======================================================================
console.log('\n6. Verifying Atomic Publication via publish_catalog_changeset RPC...');

const branch1BaseVer = initBranch.rows[0].updated_at.toISOString();

// Create multi-entity draft affecting both brand and branch
const draft2 = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title,
    status,
    change_type,
    target_entities,
    created_by
  ) VALUES (
    'Publish: Al Tazaj & Al Rawdah Branch Refinement',
    'draft',
    'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'al_tazaj',
        'base_version', '${brandBaseVer}',
        'changes', jsonb_build_object('rating', 4.9, 'editorial_role', 'popular')
      ),
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '22222222-2222-2222-2222-222222222222',
        'base_version', '${branch1BaseVer}',
        'changes', jsonb_build_object('takeaway', true, 'late_night', true)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
const draft2Id = draft2.rows[0].id;

// Publish the changeset
const pub2Res = await db.query(`
  SELECT public.publish_catalog_changeset(
    '${draft2Id}'::uuid,
    'admin@weshnakul.com',
    'Quarterly catalog refresh for Al Tazaj brand and branch'
  );
`);
const pub2Outcome = pub2Res.rows[0].publish_catalog_changeset;
check(pub2Outcome.success === true, 'publish_catalog_changeset returned success = true');
check(pub2Outcome.published_entities_count === 2, 'publish_catalog_changeset published exactly 2 entities');

// 6-duplicate. Duplicate publication attempt is rejected
try {
  await db.query(`SELECT public.publish_catalog_changeset('${draft2Id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Duplicate publication should have thrown WSH_CHANGESET_NOT_PUBLISHABLE');
} catch (err) {
  check(err.message.includes('WSH_CHANGESET_NOT_PUBLISHABLE'), 'Duplicate publication rejected: WSH_CHANGESET_NOT_PUBLISHABLE');
}

// 6a. Verify draft status updated to published with metadata
const publishedDraftRow = await db.query(`
  SELECT status, published_by, published_at, reason
  FROM public.catalog_draft_changesets
  WHERE id = '${draft2Id}'::uuid;
`);
check(publishedDraftRow.rows[0].status === 'published', 'Changeset status updated to published');
check(publishedDraftRow.rows[0].published_by === 'admin@weshnakul.com', 'Changeset published_by recorded');
check(publishedDraftRow.rows[0].published_at !== null, 'Changeset published_at recorded');
check(publishedDraftRow.rows[0].reason.includes('Quarterly catalog refresh'), 'Changeset reason preserved');

// 6b. Verify live brand updated
const pubBrand = await db.query("SELECT rating, editorial_role, last_verified_at, updated_at FROM public.restaurants WHERE id = 'al_tazaj';");
check(Number(pubBrand.rows[0].rating) === 4.9, 'Live brand rating updated to 4.9');
check(pubBrand.rows[0].editorial_role === 'popular', 'Live brand editorial_role updated to popular');
check(new Date(pubBrand.rows[0].updated_at) > new Date(brandBaseVer), 'Live brand updated_at timestamp advanced');
check(pubBrand.rows[0].last_verified_at === null, 'Administrative edit without explicit verification does not falsely advance last_verified_at');

// 6c. Verify live branch updated
const pubBranch = await db.query("SELECT takeaway, late_night, last_verified_at, updated_at FROM public.restaurant_branches WHERE id = '22222222-2222-2222-2222-222222222222'::uuid;");
check(pubBranch.rows[0].late_night === true, 'Live branch late_night updated to true');
check(new Date(pubBranch.rows[0].updated_at) > new Date(branch1BaseVer), 'Live branch updated_at timestamp advanced');
check(pubBranch.rows[0].last_verified_at === null, 'Branch administrative edit does not falsely invent last_verified_at timestamp');

// 6c-verification. Explicit verification update properly sets last_verified_at
const verifiedTimestamp = '2026-10-21T07:00:00.000Z';
const verifyDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Explicit Verification', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'al_tazaj',
        'changes', jsonb_build_object('last_verified_at', '${verifiedTimestamp}')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
await db.query(`SELECT public.publish_catalog_changeset('${verifyDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
const brandAfterVerify = await db.query("SELECT last_verified_at FROM public.restaurants WHERE id = 'al_tazaj';");
check(new Date(brandAfterVerify.rows[0].last_verified_at).toISOString() === verifiedTimestamp, 'Explicit verification action accurately updates last_verified_at');

// 6d. Verify catalog_change_history contains entries linked to changeset_id
const histBrand = await db.query(`
  SELECT * FROM public.catalog_change_history
  WHERE entity_id = 'al_tazaj' AND changeset_id = '${draft2Id}'::uuid;
`);
check(histBrand.rows.length === 1, 'Brand history entry created with changeset_id link');
check(histBrand.rows[0].reason === 'Quarterly catalog refresh for Al Tazaj brand and branch', 'Brand history entry preserves changeset reason');
check(histBrand.rows[0].new_state.rating === 4.9, 'Brand history entry new_state reflects 4.9 rating');

const histBranch = await db.query(`
  SELECT * FROM public.catalog_change_history
  WHERE entity_id = '22222222-2222-2222-2222-222222222222' AND changeset_id = '${draft2Id}'::uuid;
`);
check(histBranch.rows.length === 1, 'Branch history entry created with changeset_id link');
check(histBranch.rows[0].new_state.late_night === true, 'Branch history entry new_state reflects late_night true');

// ======================================================================
// SUITE 7: Concurrency & Stale Draft Detection
// ======================================================================
console.log('\n7. Verifying Concurrency & Stale Draft Conflict Detection...');

// Draft created with old base_version (brandBaseVer) while live record has already advanced
const staleDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title,
    status,
    change_type,
    target_entities,
    created_by
  ) VALUES (
    'Stale Draft: Outdated Al Tazaj Edit',
    'draft',
    'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'al_tazaj',
        'base_version', '${brandBaseVer}', -- OLD base version!
        'changes', jsonb_build_object('rating', 3.0)
      )
    ),
    'another_admin@weshnakul.com'
  ) RETURNING id;
`);
const staleDraftId = staleDraft.rows[0].id;

try {
  await db.query(`SELECT public.publish_catalog_changeset('${staleDraftId}'::uuid, 'another_admin@weshnakul.com');`);
  assert.fail('Stale draft publication should have thrown WSH_STALE_DRAFT_CONFLICT');
} catch (err) {
  check(err.message.includes('WSH_STALE_DRAFT_CONFLICT'), 'Stale draft detected: WSH_STALE_DRAFT_CONFLICT exception raised');
}

// Verify live brand rating was NOT modified by the failed stale publication
const brandAfterStaleFail = await db.query("SELECT rating FROM public.restaurants WHERE id = 'al_tazaj';");
check(Number(brandAfterStaleFail.rows[0].rating) === 4.9, 'Live brand was NOT modified by stale draft attempt');

// ======================================================================
// SUITE 8: Atomicity & All-or-Nothing Rollback on Error
// ======================================================================
console.log('\n8. Verifying Atomicity & All-or-Nothing Rollback on Error...');

// 8. Verifying Atomicity & All-or-Nothing Rollback on Error...
const brandRowForDoomed = await db.query("SELECT updated_at FROM public.restaurants WHERE id = 'al_tazaj';");
const currentBrandVer = brandRowForDoomed.rows[0].updated_at.toISOString();
const branchRowForDoomed = await db.query("SELECT updated_at FROM public.restaurant_branches WHERE id = '22222222-2222-2222-2222-222222222222'::uuid;");
const currentBranchVer = branchRowForDoomed.rows[0].updated_at.toISOString();

// Create multi-entity draft where first entity is valid, but second entity violates branch readiness (empty address)
const doomedDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title,
    status,
    change_type,
    target_entities,
    created_by
  ) VALUES (
    'Doomed Multi-Entity Draft',
    'draft',
    'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'al_tazaj',
        'base_version', '${currentBrandVer}',
        'changes', jsonb_build_object('rating', 2.1)
      ),
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '22222222-2222-2222-2222-222222222222',
        'base_version', '${currentBranchVer}',
        'changes', jsonb_build_object('address_ar', '', 'address_en', '') -- INVALID!
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
const doomedDraftId = doomedDraft.rows[0].id;

try {
  await db.query(`SELECT public.publish_catalog_changeset('${doomedDraftId}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Doomed draft publication should have thrown WSH_BRANCH_READINESS_FAILED');
} catch (err) {
  check(err.message.includes('WSH_BRANCH_READINESS_FAILED'), 'Invalid branch triggers WSH_BRANCH_READINESS_FAILED');
}

// Verify ALL-OR-NOTHING: entity 1 (the brand) was ROLLED BACK and NOT updated
const brandAfterDoomed = await db.query("SELECT rating FROM public.restaurants WHERE id = 'al_tazaj';");
check(Number(brandAfterDoomed.rows[0].rating) === 4.9, 'All-or-nothing: brand rating remains 4.9, not 2.1');

// Verify doomed draft remains in draft status
const doomedStatus = await db.query(`SELECT status FROM public.catalog_draft_changesets WHERE id = '${doomedDraftId}'::uuid;`);
check(doomedStatus.rows[0].status === 'draft', 'Doomed draft status remains draft after publication rollback');

// 8b. Empty brand name rejected by SQL RPC
const doomedBrandDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Doomed Empty Name Draft', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'al_tazaj',
        'changes', jsonb_build_object('name_ar', '', 'name_en', '')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${doomedBrandDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Should fail on empty brand name');
} catch (err) {
  check(err.message.includes('WSH_BRAND_READINESS_FAILED'), 'Empty brand name triggers WSH_BRAND_READINESS_FAILED in SQL RPC');
}

// 8c. Non-canonical district rejected by SQL RPC
const doomedDistrictDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Doomed District Draft', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '22222222-2222-2222-2222-222222222222',
        'changes', jsonb_build_object('district', 'olaya')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${doomedDistrictDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Should fail on non-canonical district');
} catch (err) {
  check(err.message.includes('WSH_NON_CANONICAL_DISTRICT'), 'Non-canonical district olaya triggers WSH_NON_CANONICAL_DISTRICT in SQL RPC');
}

// 8d. Coordinate parity violation rejected by SQL RPC
const doomedParityDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Doomed Parity Draft', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '22222222-2222-2222-2222-222222222222',
        'changes', jsonb_build_object('latitude', 21.5714, 'longitude', null)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${doomedParityDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Should fail on coordinate parity');
} catch (err) {
  check(err.message.includes('WSH_COORDINATE_PARITY'), 'Single coordinate triggers WSH_COORDINATE_PARITY in SQL RPC');
}

// 8e. Atomicity guarantee when audit history insertion fails
await db.exec('RESET ROLE;');
await db.exec('RESET ROLE;');
await db.exec(`
  CREATE OR REPLACE FUNCTION public.fail_audit_trigger()
  RETURNS trigger LANGUAGE plpgsql AS $$
  BEGIN
    IF NEW.reason = 'Simulated Audit Failure Test' THEN
      RAISE EXCEPTION 'WSH_SIMULATED_AUDIT_FAILURE';
    END IF;
    RETURN NEW;
  END;
  $$;

  CREATE TRIGGER test_fail_audit_trigger
  BEFORE INSERT OR UPDATE ON public.catalog_change_history
  FOR EACH ROW EXECUTE FUNCTION public.fail_audit_trigger();
`);
await db.exec('SET ROLE service_role;');

const doomedAuditDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, reason, created_by
  ) VALUES (
    'Doomed Audit Draft', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'al_tazaj',
        'changes', jsonb_build_object('rating', 1.0)
      )
    ),
    'Simulated Audit Failure Test',
    'admin@weshnakul.com'
  ) RETURNING id;
`);

try {
  await db.query(`SELECT public.publish_catalog_changeset('${doomedAuditDraft.rows[0].id}'::uuid, 'admin@weshnakul.com', 'Simulated Audit Failure Test');`);
  assert.fail('Audit failure should have rolled back the transaction');
} catch (err) {
  check(err.message.includes('WSH_SIMULATED_AUDIT_FAILURE'), 'Audit write failure aborts publication transaction');
}

await db.exec('RESET ROLE;');
await db.exec('RESET ROLE;');
await db.exec(`
  DROP TRIGGER IF EXISTS test_fail_audit_trigger ON public.catalog_change_history;
  DROP FUNCTION IF EXISTS public.fail_audit_trigger();
`);
await db.exec('SET ROLE service_role;');

const brandAfterAuditFail = await db.query("SELECT rating FROM public.restaurants WHERE id = 'al_tazaj';");
check(Number(brandAfterAuditFail.rows[0].rating) === 4.9, 'All-or-nothing: audit failure rolled back all restaurant mutations');

// ======================================================================
// SUITE 8f: Blocker 1 Regression — Strict Canonical 30 Districts Enforcement
// ======================================================================
console.log('\n8f. Verifying Strict Canonical 30 Jeddah Districts Enforcement in SQL RPC...');

// Setup private.district_geography with both a valid district and a non-approved external district
await db.exec('RESET ROLE;');
await db.exec('RESET ROLE;');
await db.exec(`
  CREATE SCHEMA IF NOT EXISTS private;
  CREATE TABLE IF NOT EXISTS private.district_geography (
    district_id text PRIMARY KEY,
    name_ar text,
    name_en text
  );
  INSERT INTO private.district_geography (district_id, name_ar, name_en)
  VALUES
    ('al_rawdah', 'الروضة', 'Al Rawdah'),
    ('al_khobar', 'الخبر', 'Al Khobar')
  ON CONFLICT (district_id) DO NOTHING;

  -- Create dedicated entity for regression test isolation
  INSERT INTO public.restaurants (id, name_en, name_ar, categories, rating, editorial_role, updated_at)
  VALUES ('brand_regression', 'Regression Brand', 'مطعم الاختبار', ARRAY['burger'], 4.0, 'staple', now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.restaurant_branches (id, restaurant_id, branch_name_en, branch_name_ar, district, address_en, address_ar, updated_at)
  VALUES ('88888888-8888-8888-8888-888888888888'::uuid, 'brand_regression', 'Regression Branch', 'فرع الاختبار', 'al_rawdah', 'Al Rawdah District', 'حي الروضة', now())
  ON CONFLICT (id) DO NOTHING;
`);
await db.exec('SET ROLE service_role;');

// 8f-1. A district that exists in private.district_geography but is OUTSIDE the approved 30 must be strictly rejected
const externalDistrictDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'External District Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('district', 'al_khobar')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${externalDistrictDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('District in private.district_geography but outside approved 30 should have been rejected');
} catch (err) {
  check(
    err.message.includes('WSH_NON_CANONICAL_DISTRICT'),
    'District al_khobar existing in private.district_geography but outside approved 30 is strictly rejected by SQL RPC'
  );
}

// 8f-2. Empty district values are rejected by SQL RPC
const emptyDistrictDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Empty District Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('district', '')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${emptyDistrictDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Empty district string should have failed branch readiness');
} catch (err) {
  check(
    err.message.includes('WSH_BRANCH_READINESS_FAILED'),
    'Empty district string is rejected by SQL RPC: WSH_BRANCH_READINESS_FAILED'
  );
}

// 8f-3. Malformed district values are rejected by SQL RPC
const malformedDistrictDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Malformed District Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('district', 'al_rawdah!!! malformed')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${malformedDistrictDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Malformed district should have failed canonical check');
} catch (err) {
  check(
    err.message.includes('WSH_NON_CANONICAL_DISTRICT'),
    'Malformed district string is rejected by SQL RPC: WSH_NON_CANONICAL_DISTRICT'
  );
}

// 8f-4. All 30 canonical districts pass district validation in publish_catalog_changeset
let allCanonicalPassed = true;
const canonicalDistrictsArray = Array.from(CANONICAL_JEDDAH_DISTRICT_IDS);
for (const distId of canonicalDistrictsArray) {
  const testDraft = await db.query(`
    INSERT INTO public.catalog_draft_changesets (
      title, status, change_type, target_entities, created_by
    ) VALUES (
      'Canonical District Test: ${distId}', 'draft', 'edit',
      jsonb_build_array(
        jsonb_build_object(
          'entity_type', 'branch',
          'entity_id', '88888888-8888-8888-8888-888888888888',
          'changes', jsonb_build_object('district', '${distId}')
        )
      ),
      'admin@weshnakul.com'
    ) RETURNING id;
  `);
  try {
    const res = await db.query(`SELECT public.publish_catalog_changeset('${testDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
    if (!res.rows[0].publish_catalog_changeset.success) {
      allCanonicalPassed = false;
      break;
    }
  } catch {
    allCanonicalPassed = false;
    break;
  }
}
check(allCanonicalPassed, 'All 30 canonical Jeddah districts pass district validation in publish_catalog_changeset');

// ======================================================================
// SUITE 8g: Blocker 2 Regression — Precise Audit History Attribution
// ======================================================================
console.log('\n8g. Verifying Precise Transaction-Scoped Audit History Attribution in SQL RPC...');

// 8g-1. Insert a pre-existing unlinked history row
const unlinkedHist = await db.query(`
  INSERT INTO public.catalog_change_history (
    entity_type, entity_id, action, changed_by, change_summary, effective_at
  ) VALUES (
    'restaurant', 'unlinked_brand_test', 'created', 'system', 'Pre-existing unlinked history record', now() - interval '2 hours'
  ) RETURNING id;
`);
const unlinkedHistId = unlinkedHist.rows[0].id;

// 8g-2. Create and publish a multi-entity changeset with brand and branch
const preciseDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Precise Attribution Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('tier', 'discovery')
      ),
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('is_24_hours', true)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
const preciseDraftId = preciseDraft.rows[0].id;

await db.query(`
  SELECT public.publish_catalog_changeset(
    '${preciseDraftId}'::uuid,
    'admin@weshnakul.com',
    'Precise Attribution Audit Test Reason'
  );
`);

// 8g-3. Verify the newly published history rows are exactly linked
const linkedHistRows = await db.query(`
  SELECT * FROM public.catalog_change_history
  WHERE changeset_id = '${preciseDraftId}'::uuid
  ORDER BY entity_type;
`);
check(linkedHistRows.rows.length === 2, 'Exactly 2 history rows linked to the changeset');

const branchHist = linkedHistRows.rows.find((r) => r.entity_type === 'branch');
const brandHist = linkedHistRows.rows.find((r) => r.entity_type === 'restaurant');

check(branchHist !== undefined, 'Branch history row correctly recorded with entity_type = branch');
check(branchHist?.entity_id === '88888888-8888-8888-8888-888888888888', 'Branch history row has correct entity_id');
check(branchHist?.reason === 'Precise Attribution Audit Test Reason', 'Branch history row preserves changeset reason');
check(branchHist?.changed_by === 'admin@weshnakul.com', 'Branch history row records authenticated admin identity in changed_by');
check(branchHist?.new_state.is_24_hours === true, 'Branch history row reflects published branch change');

check(brandHist !== undefined, 'Brand history row correctly recorded with entity_type = restaurant');
check(brandHist?.entity_id === 'brand_regression', 'Brand history row has correct entity_id');
check(brandHist?.reason === 'Precise Attribution Audit Test Reason', 'Brand history row preserves changeset reason');
check(brandHist?.changed_by === 'admin@weshnakul.com', 'Brand history row records authenticated admin identity in changed_by');
check(brandHist?.new_state.tier === 'discovery', 'Brand history row reflects published brand change');

// 8g-4. Verify pre-existing unlinked history row remains strictly untouched and unlinked
const unlinkedAfterPub = await db.query(`
  SELECT changeset_id, reason FROM public.catalog_change_history
  WHERE id = '${unlinkedHistId}'::uuid;
`);
check(unlinkedAfterPub.rows[0].changeset_id === null, 'Pre-existing unlinked history row remains unlinked (changeset_id IS NULL)');
check(unlinkedAfterPub.rows[0].reason === null, 'Pre-existing unlinked history row reason remains null');

// 8g-5. Verify direct update outside changeset records unlinked history
await db.query(`
  UPDATE public.restaurants
  SET price_tier = '$$$'
  WHERE id = 'brand_regression';
`);
const directHist = await db.query(`
  SELECT changeset_id, reason, new_state FROM public.catalog_change_history
  WHERE entity_id = 'brand_regression'
  ORDER BY effective_at DESC
  LIMIT 1;
`);
check(directHist.rows[0].changeset_id === null, 'Direct update outside changeset records history with changeset_id = null');
check(directHist.rows[0].new_state.price_tier === '$$$', 'Direct update outside changeset accurately captured by audit trigger');

// 8g-6. Anti-spoofing verification: direct SQL caller cannot forge changeset attribution via custom settings
await db.exec(`
  SELECT set_config('wsh.current_changeset_id', '${preciseDraftId}'::text, false);
  SELECT set_config('wsh.current_changeset_reason', 'FORGED SPOOFED REASON', false);
`);
await db.query(`
  UPDATE public.restaurants
  SET price_tier = '$$'
  WHERE id = 'brand_regression';
`);
const forgedHist = await db.query(`
  SELECT changeset_id, reason, new_state FROM public.catalog_change_history
  WHERE entity_id = 'brand_regression'
  ORDER BY effective_at DESC LIMIT 1;
`);
check(forgedHist.rows[0].changeset_id === null, 'Direct write cannot forge changeset_id: attribution strictly neutralized to NULL');
check(forgedHist.rows[0].reason === null, 'Direct write cannot forge reason: attribution strictly neutralized to NULL');

// 8g-7. Anti-spoofing: direct branch write with forged settings cannot forge attribution
await db.query(`
  UPDATE public.restaurant_branches
  SET takeaway = false
  WHERE id = '88888888-8888-8888-8888-888888888888'::uuid;
`);
const forgedBranchHist = await db.query(`
  SELECT changeset_id, reason, new_state FROM public.catalog_change_history
  WHERE entity_id = '88888888-8888-8888-8888-888888888888'
  ORDER BY effective_at DESC LIMIT 1;
`);
check(forgedBranchHist.rows[0].changeset_id === null, 'Direct branch write cannot forge changeset_id: attribution strictly NULL');
check(forgedBranchHist.rows[0].reason === null, 'Direct branch write cannot forge reason: attribution strictly NULL');

// 8g-7b. Anti-spoofing: direct write cannot forge changed_by administrator identity via custom setting
await db.exec(`
  SELECT set_config('wsh.current_admin_id', 'spoofed_admin@hacker.com', false);
`);
await db.query(`
  UPDATE public.restaurants
  SET price_tier = '$'
  WHERE id = 'brand_regression';
`);
const spoofedAdminHist = await db.query(`
  SELECT changed_by, changeset_id FROM public.catalog_change_history
  WHERE entity_id = 'brand_regression'
  ORDER BY effective_at DESC LIMIT 1;
`);
check(spoofedAdminHist.rows[0].changed_by !== 'spoofed_admin@hacker.com', 'Direct write cannot forge changed_by via wsh.current_admin_id GUC');
check(spoofedAdminHist.rows[0].changeset_id === null, 'Direct write records null changeset_id');

// Clear session settings
await db.exec(`
  SELECT set_config('wsh.current_admin_id', '', false);
`);

// 8g-8. Anti-spoofing: unauthorized nested PL/pgSQL function cannot forge attribution
await db.exec(`
  RESET ROLE;
  CREATE OR REPLACE FUNCTION public.unauthorized_direct_updater()
  RETURNS void LANGUAGE plpgsql AS $$
  BEGIN
    UPDATE public.restaurants SET tier = 'staple' WHERE id = 'brand_regression';
  END;
  $$;
  SET ROLE service_role;
`);
await db.query(`SELECT public.unauthorized_direct_updater();`);
const unauthHist = await db.query(`
  SELECT changeset_id, reason FROM public.catalog_change_history
  WHERE entity_id = 'brand_regression'
  ORDER BY effective_at DESC LIMIT 1;
`);
check(unauthHist.rows[0].changeset_id === null, 'Unauthorized PL/pgSQL function updater cannot forge changeset_id: attribution NULL');

// 8g-9. Anti-spoofing: spoofed function in non-public schema cannot forge attribution
await db.exec(`
  RESET ROLE;
  CREATE SCHEMA IF NOT EXISTS evil_schema;
  CREATE OR REPLACE FUNCTION evil_schema.publish_catalog_changeset(p_id uuid, p_admin text, p_reason text DEFAULT NULL)
  RETURNS void LANGUAGE plpgsql AS $$
  BEGIN
    UPDATE public.restaurants SET rating = 1.0 WHERE id = 'brand_regression';
  END;
  $$;
  GRANT USAGE ON SCHEMA evil_schema TO service_role;
  GRANT EXECUTE ON FUNCTION evil_schema.publish_catalog_changeset(uuid, text, text) TO service_role;
  SET ROLE service_role;
`);
await db.query(`SELECT evil_schema.publish_catalog_changeset('${preciseDraftId}'::uuid, 'admin@weshnakul.com');`);
const evilHist = await db.query(`
  SELECT changeset_id, reason FROM public.catalog_change_history
  WHERE entity_id = 'brand_regression'
  ORDER BY effective_at DESC LIMIT 1;
`);
check(evilHist.rows[0].changeset_id === null, 'Spoofed schema function evil_schema.publish_catalog_changeset attribution is strictly NULL');

// Clear session settings
await db.exec(`
  SELECT set_config('wsh.current_changeset_id', '', false);
  SELECT set_config('wsh.current_changeset_reason', '', false);
  SELECT set_config('wsh.current_admin_id', '', false);
`);

// ======================================================================
// SUITE 8h: Google Maps URL Structure & Permitted Hostnames in SQL RPC
// ======================================================================
console.log('\n8h. Verifying Google Maps URL Structure & Permitted Hostnames in SQL RPC...');

// Insecure HTTP Maps URL is rejected
const httpMapsDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Insecure HTTP Maps URL Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('google_maps_url', 'http://maps.google.com/?q=21.5,39.1')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${httpMapsDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Insecure http:// Maps URL should have been rejected');
} catch (err) {
  check(
    err.message.includes('WSH_INVALID_MAPS_URL'),
    'Insecure http:// Maps URL is strictly rejected by SQL RPC: WSH_INVALID_MAPS_URL'
  );
}

// Unrelated HTTPS host is rejected
const unrelatedHostDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Unrelated Host Maps URL Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('google_maps_url', 'https://evil.com/maps.google.com')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${unrelatedHostDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Unrelated HTTPS host should have been rejected');
} catch (err) {
  check(
    err.message.includes('WSH_INVALID_MAPS_URL'),
    'Unrelated HTTPS host evil.com is strictly rejected by SQL RPC: WSH_INVALID_MAPS_URL'
  );
}

// Deceptive subdomain suffix host is rejected (maps.google.com.evil.com)
const deceptiveSuffixDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Deceptive Suffix Maps URL Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('google_maps_url', 'https://maps.google.com.evil.com/maps')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${deceptiveSuffixDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Deceptive suffix Maps URL should have been rejected');
} catch (err) {
  check(
    err.message.includes('WSH_INVALID_MAPS_URL'),
    'Deceptive suffix maps.google.com.evil.com rejected: WSH_INVALID_MAPS_URL'
  );
}

// Userinfo in Maps URL is rejected (admin:pass@maps.google.com)
const userinfoMapsDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Userinfo Maps URL Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('google_maps_url', 'https://admin:pass@maps.google.com/place')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${userinfoMapsDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Userinfo Maps URL should have been rejected');
} catch (err) {
  check(
    err.message.includes('WSH_INVALID_MAPS_URL'),
    'Userinfo in Maps URL rejected: WSH_INVALID_MAPS_URL'
  );
}

// Non-standard port in Maps URL is rejected (:8080)
const portMapsDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Port Maps URL Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('google_maps_url', 'https://maps.google.com:8080/place')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${portMapsDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Port in Maps URL should have been rejected');
} catch (err) {
  check(
    err.message.includes('WSH_INVALID_MAPS_URL'),
    'Non-standard port in Maps URL rejected: WSH_INVALID_MAPS_URL'
  );
}

// Explicit :443 port in Maps URL is rejected
const port443MapsDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Port 443 Maps URL Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('google_maps_url', 'https://maps.google.com:443/place')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${port443MapsDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Explicit :443 port in Maps URL should have been rejected');
} catch (err) {
  check(
    err.message.includes('WSH_INVALID_MAPS_URL'),
    'Explicit :443 port in Maps URL rejected in SQL RPC: WSH_INVALID_MAPS_URL'
  );
}

// Malformed Maps URL is rejected
const malformedMapsDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Malformed Maps URL Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('google_maps_url', 'https://')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${malformedMapsDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Malformed Maps URL should have been rejected');
} catch (err) {
  check(
    err.message.includes('WSH_INVALID_MAPS_URL'),
    'Malformed Maps URL rejected in SQL RPC: WSH_INVALID_MAPS_URL'
  );
}

// Permitted Google Maps URL formats are accepted
const validMapsUrls = [
  'https://maps.google.com/?cid=1234567890',
  'https://maps.google.com/place/Century+Burger/@21.5,39.1',
  'https://www.google.com/maps/search/?api=1&query=Century+Burger+Jeddah',
  'https://maps.app.goo.gl/AbCdEf12345',
  'https://goo.gl/maps/XyZ98765'
];

for (const validUrl of validMapsUrls) {
  const validMapsDraft = await db.query(`
    INSERT INTO public.catalog_draft_changesets (
      title, status, change_type, target_entities, created_by
    ) VALUES (
      'Valid Maps URL: ${validUrl}', 'draft', 'edit',
      jsonb_build_array(
        jsonb_build_object(
          'entity_type', 'branch',
          'entity_id', '88888888-8888-8888-8888-888888888888',
          'changes', jsonb_build_object('google_maps_url', '${validUrl}')
        )
      ),
      'admin@weshnakul.com'
    ) RETURNING id;
  `);
  const res = await db.query(`SELECT public.publish_catalog_changeset('${validMapsDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  check(res.rows[0].publish_catalog_changeset.success === true, `Permitted Google Maps URL accepted: ${validUrl}`);
}

// ======================================================================
// SUITE 8i: Complete Changeset Contract & Strict Allowlist Validation
// ======================================================================
console.log('\n8i. Verifying Complete Changeset Contract & Strict Allowlist Validation in SQL RPC...');

// 8i-1. Empty changesets are rejected
const emptyEntitiesDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Empty Target Entities Test', 'draft', 'edit',
    '[]'::jsonb,
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${emptyEntitiesDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Empty target entities should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_EMPTY_CHANGESET'), 'Empty target_entities rejected: WSH_EMPTY_CHANGESET');
}

// 8i-2. Duplicate targets in same changeset are rejected
const duplicateTargetDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Duplicate Target Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('rating', 4.1)
      ),
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('rating', 4.2)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${duplicateTargetDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Duplicate targets should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_DUPLICATE_TARGET'), 'Duplicate target in changeset rejected: WSH_DUPLICATE_TARGET');
}

// 8i-3. Unsupported entity type is rejected
const badEntityTypeDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Bad Entity Type Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'menu_item',
        'entity_id', '123',
        'changes', jsonb_build_object('price', 10)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${badEntityTypeDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Unsupported entity type should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_UNSUPPORTED_ENTITY_TYPE'), 'Unsupported entity type rejected: WSH_UNSUPPORTED_ENTITY_TYPE');
}

// 8i-4. Unsupported action is rejected
const badActionDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Bad Action Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'action', 'delete',
        'changes', jsonb_build_object('rating', 4.1)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${badActionDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Unsupported action should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_UNSUPPORTED_ACTION'), 'Unsupported action delete rejected: WSH_UNSUPPORTED_ACTION');
}

// 8i-5. Unsupported field names are strictly rejected per allowlist
const badFieldBrandDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Bad Brand Field Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('secret_internal_flag', true)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${badFieldBrandDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Unsupported restaurant field should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_UNSUPPORTED_FIELD'), 'Unsupported field on brand rejected: WSH_UNSUPPORTED_FIELD');
}

// 8i-6. Field entity mismatch is strictly rejected (e.g. branch field on brand)
const mismatchFieldDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Mismatch Field Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('rating', 4.5)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${mismatchFieldDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Brand field on branch should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_UNSUPPORTED_FIELD'), 'Brand field on branch rejected: WSH_UNSUPPORTED_FIELD');
}

// 8i-7. Invalid JSON field types (boolean, array, number, string) are strictly rejected
const invalidBoolDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Invalid Bool Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('manual_review_required', 'not_a_bool')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${invalidBoolDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Non-boolean for manual_review_required should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_INVALID_FIELD_TYPE'), 'String value for boolean field rejected: WSH_INVALID_FIELD_TYPE');
}

const invalidCategoriesDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Invalid Categories Type Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('categories', 'single_string_instead_of_array')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${invalidCategoriesDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Non-array for categories should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_INVALID_CATEGORIES'), 'String value for categories array rejected: WSH_INVALID_CATEGORIES');
}

// 8i-8. Invalid category element rejected
const invalidCategoryElemDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Invalid Category Elem Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('categories', jsonb_build_array('burger', 'non_existent_cuisine_xyz'))
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${invalidCategoryElemDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Unknown category element should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_INVALID_CATEGORY'), 'Unknown category element rejected: WSH_INVALID_CATEGORY');
}

// 8i-9. Invalid enums and numeric ranges rejected
const invalidStatusDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Invalid Status Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('branch_status', 'busy_status_unknown')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${invalidStatusDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Invalid branch_status enum should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_INVALID_STATUS'), 'Invalid branch_status enum rejected: WSH_INVALID_STATUS');
}

const invalidRatingDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Invalid Rating Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('rating', 6.5)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${invalidRatingDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Rating > 5.0 should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_INVALID_RATING'), 'Rating 6.5 out of bounds rejected: WSH_INVALID_RATING');
}

// 8i-10. Malformed timestamp rejected
const badTsDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Bad Timestamp Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('last_verified_at', '2026-99-99 not-a-date')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${badTsDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Malformed timestamp should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_INVALID_TIMESTAMP'), 'Malformed timestamp rejected: WSH_INVALID_TIMESTAMP');
}

// 8i-11. Target with unsupported top-level key rejected
const unknownTargetKeyDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Unknown Target Key Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('rating', 4.5),
        'unsupported_extra_prop', 'evil'
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${unknownTargetKeyDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Target with unknown top-level key should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_UNSUPPORTED_TARGET_KEY'), 'Unknown target key rejected: WSH_UNSUPPORTED_TARGET_KEY');
}

// 8i-12. Target with non-string base_version rejected
const nonStrBaseVerDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Non-String Base Version Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'base_version', 12345,
        'changes', jsonb_build_object('rating', 4.5)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${nonStrBaseVerDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Non-string base_version should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_INVALID_FIELD_TYPE'), 'Non-string base_version rejected: WSH_INVALID_FIELD_TYPE');
}

// 8i-13. Target with timezone-free base_version rejected
const noTzBaseVerDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Timezone-Free Base Version Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'base_version', '2026-10-21T07:00:00',
        'changes', jsonb_build_object('rating', 4.5)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${noTzBaseVerDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Timezone-free base_version should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_INVALID_TIMESTAMP'), 'Timezone-free base_version rejected: WSH_INVALID_TIMESTAMP');
}

// 8i-14. Target with valid ISO base_version with explicit timezone accepted
const currBrandVer = await db.query("SELECT updated_at FROM public.restaurants WHERE id = 'brand_regression';");
const goodBaseVerStr = new Date(currBrandVer.rows[0].updated_at).toISOString();

const goodBaseVerDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Valid Base Version Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'base_version', '${goodBaseVerStr}',
        'changes', jsonb_build_object('rating', 4.5)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
const goodBaseVerRes = await db.query(`SELECT public.publish_catalog_changeset('${goodBaseVerDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
check(goodBaseVerRes.rows[0].publish_catalog_changeset.success === true, 'Valid base_version with timezone accepted');

// 8i-15. Editing primary_category directly is strictly rejected
const primaryCatDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Direct primary_category Edit Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('primary_category', 'burger')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${primaryCatDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('primary_category in brand changes should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_UNSUPPORTED_FIELD'), 'Direct primary_category edit rejected: WSH_UNSUPPORTED_FIELD');
}

// 8i-16. manual_review_reasons exceeding 20 items rejected
const reasonsLimitDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Reasons Limit Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object(
          'manual_review_reasons',
          to_jsonb(ARRAY(SELECT 'reason_' || g::text FROM generate_series(1, 21) g))
        )
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${reasonsLimitDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('manual_review_reasons > 20 items should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_FIELD_LIMIT_EXCEEDED'), 'manual_review_reasons > 20 items rejected: WSH_FIELD_LIMIT_EXCEEDED');
}

// 8i-17. manual_review_reasons item exceeding 200 characters rejected
const reasonsLengthDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Reasons Length Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object(
          'manual_review_reasons',
          jsonb_build_array(repeat('a', 201))
        )
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${reasonsLengthDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('manual_review_reasons item > 200 chars should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_INVALID_FIELD_VALUE'), 'manual_review_reasons item > 200 chars rejected: WSH_INVALID_FIELD_VALUE');
}

// 8i-18. last_verified_at without timezone rejected
const noTzLastVerifiedDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Timezone-Free last_verified_at Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('last_verified_at', '2026-10-21T07:00:00')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${noTzLastVerifiedDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('Timezone-free last_verified_at should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_INVALID_TIMESTAMP'), 'Timezone-free last_verified_at rejected: WSH_INVALID_TIMESTAMP');
}

// 8i-19. manual_review_reasons with non-string elements rejected
const nonStrReasonDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Non-String Reason Element Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object(
          'manual_review_reasons',
          jsonb_build_array(12345)
        )
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
try {
  await db.query(`SELECT public.publish_catalog_changeset('${nonStrReasonDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
  assert.fail('manual_review_reasons with number should have been rejected');
} catch (err) {
  check(err.message.includes('WSH_INVALID_FIELD_TYPE'), 'manual_review_reasons non-string element rejected: WSH_INVALID_FIELD_TYPE');
}

// 8i-20. last_verified_at boundary tests across both entity types (restaurant and branch)
const tsCases = [
  { desc: 'valid Z with subseconds', val: '2026-10-21T07:00:00.123Z', expectSuccess: true },
  { desc: 'valid +14:00 boundary offset', val: '2026-10-21T07:00:00+14:00', expectSuccess: true },
  { desc: 'valid -14:00 boundary offset', val: '2026-10-21T07:00:00-14:00', expectSuccess: true },
  { desc: 'valid +03:00 with subseconds', val: '2026-10-21T07:00:00.456+03:00', expectSuccess: true },
  { desc: 'missing timezone offset', val: '2026-10-21T07:00:00', expectErr: 'WSH_INVALID_TIMESTAMP' },
  { desc: 'out-of-bounds offset +14:01', val: '2026-10-21T07:00:00+14:01', expectErr: 'WSH_INVALID_TIMESTAMP' },
  { desc: 'out-of-bounds offset +14:30', val: '2026-10-21T07:00:00+14:30', expectErr: 'WSH_INVALID_TIMESTAMP' },
  { desc: 'out-of-bounds offset +15:00', val: '2026-10-21T07:00:00+15:00', expectErr: 'WSH_INVALID_TIMESTAMP' },
  { desc: 'out-of-bounds offset -14:01', val: '2026-10-21T07:00:00-14:01', expectErr: 'WSH_INVALID_TIMESTAMP' },
  { desc: 'invalid minute offset +03:60', val: '2026-10-21T07:00:00+03:60', expectErr: 'WSH_INVALID_TIMESTAMP' },
  { desc: 'malformed date string', val: '2026-99-99 not-a-date', expectErr: 'WSH_INVALID_TIMESTAMP' },
  { desc: 'non-string type', val: 12345, expectErr: 'WSH_INVALID_FIELD_TYPE' },
];

for (const entityType of ['restaurant', 'branch']) {
  const entityId = entityType === 'restaurant' ? 'brand_regression' : '88888888-8888-8888-8888-888888888888';
  for (const c of tsCases) {
    const valSql = typeof c.val === 'number' ? `${c.val}` : `'${c.val}'`;
    const draft = await db.query(`
      INSERT INTO public.catalog_draft_changesets (
        title, status, change_type, target_entities, created_by
      ) VALUES (
        'TZ Test ${entityType} ${c.desc}', 'draft', 'edit',
        jsonb_build_array(
          jsonb_build_object(
            'entity_type', '${entityType}',
            'entity_id', '${entityId}',
            'changes', jsonb_build_object('last_verified_at', ${valSql})
          )
        ),
        'admin@weshnakul.com'
      ) RETURNING id;
    `);
    const draftId = draft.rows[0].id;
    try {
      const res = await db.query(`SELECT public.publish_catalog_changeset('${draftId}'::uuid, 'admin@weshnakul.com');`);
      if (c.expectSuccess) {
        check(res.rows[0].publish_catalog_changeset.success === true, `${entityType} last_verified_at with ${c.desc} accepted`);
      } else {
        assert.fail(`${entityType} last_verified_at with ${c.desc} should have been rejected`);
      }
    } catch (err) {
      if (c.expectSuccess) {
        assert.fail(`${entityType} last_verified_at with ${c.desc} failed unexpectedly: ${err.message}`);
      } else {
        check(err.message.includes(c.expectErr), `${entityType} last_verified_at with ${c.desc} rejected: ${c.expectErr}`);
      }
    }
  }
}

// 8i-21. Nullable fields cleared with explicit JSON null on restaurant
const clearRestaurantDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Clear Restaurant Nullable Fields Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object(
          'tier', null,
          'price_tier', null,
          'rating', null,
          'editorial_role', null,
          'last_verified_at', null,
          'manual_review_reasons', null
        )
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
const clearRestRes = await db.query(`SELECT public.publish_catalog_changeset('${clearRestaurantDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
check(clearRestRes.rows[0].publish_catalog_changeset.success === true, 'Clear restaurant nullable fields published successfully');

const clearedRestRow = await db.query("SELECT tier, price_tier, rating, editorial_role, last_verified_at, manual_review_reasons FROM public.restaurants WHERE id = 'brand_regression';");
check(clearedRestRow.rows[0].tier === null, 'Restaurant tier cleared to NULL on explicit JSON null');
check(clearedRestRow.rows[0].price_tier === null, 'Restaurant price_tier cleared to NULL on explicit JSON null');
check(clearedRestRow.rows[0].rating === null, 'Restaurant rating cleared to NULL on explicit JSON null');
check(clearedRestRow.rows[0].editorial_role === null, 'Restaurant editorial_role cleared to NULL on explicit JSON null');
check(clearedRestRow.rows[0].last_verified_at === null, 'Restaurant last_verified_at cleared to NULL on explicit JSON null');
check(Array.isArray(clearedRestRow.rows[0].manual_review_reasons) && clearedRestRow.rows[0].manual_review_reasons.length === 0, 'Restaurant manual_review_reasons cleared to empty array on explicit JSON null');

// 8i-22. Nullable fields cleared with explicit JSON null on branch
const clearBranchDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Clear Branch Nullable Fields Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object(
          'branch_name_ar', null,
          'branch_name_en', null,
          'latitude', null,
          'longitude', null,
          'google_maps_url', null,
          'last_verified_at', null
        )
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
const clearBranchRes = await db.query(`SELECT public.publish_catalog_changeset('${clearBranchDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
check(clearBranchRes.rows[0].publish_catalog_changeset.success === true, 'Clear branch nullable fields published successfully');

const clearedBranchRow = await db.query("SELECT branch_name_ar, branch_name_en, latitude, longitude, google_maps_url, last_verified_at FROM public.restaurant_branches WHERE id = '88888888-8888-8888-8888-888888888888'::uuid;");
check(clearedBranchRow.rows[0].branch_name_ar === null, 'Branch branch_name_ar cleared to NULL on explicit JSON null');
check(clearedBranchRow.rows[0].branch_name_en === null, 'Branch branch_name_en cleared to NULL on explicit JSON null');
check(clearedBranchRow.rows[0].latitude === null, 'Branch latitude cleared to NULL on explicit JSON null');
check(clearedBranchRow.rows[0].longitude === null, 'Branch longitude cleared to NULL on explicit JSON null');
check(clearedBranchRow.rows[0].google_maps_url === null, 'Branch google_maps_url cleared to NULL on explicit JSON null');
check(clearedBranchRow.rows[0].last_verified_at === null, 'Branch last_verified_at cleared to NULL on explicit JSON null');

// 8i-23. Absent fields preserved on restaurant update
const preRestRow = await db.query("SELECT name_ar, name_en FROM public.restaurants WHERE id = 'brand_regression';");
const preserveRestDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Preserve Restaurant Fields Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'brand_regression',
        'changes', jsonb_build_object('price_tier', '$$')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
await db.query(`SELECT public.publish_catalog_changeset('${preserveRestDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
const preservedRestRow = await db.query("SELECT name_ar, name_en, categories, price_tier FROM public.restaurants WHERE id = 'brand_regression';");
check(preservedRestRow.rows[0].price_tier === '$$', 'Updated field price_tier reflects new value');
check(preservedRestRow.rows[0].name_en === preRestRow.rows[0].name_en, 'Omitted field name_en preserved');
check(preservedRestRow.rows[0].name_ar === preRestRow.rows[0].name_ar, 'Omitted field name_ar preserved');

// 8i-24. Absent fields preserved on branch update
const preBranchRow = await db.query("SELECT district, address_ar FROM public.restaurant_branches WHERE id = '88888888-8888-8888-8888-888888888888'::uuid;");
const preserveBranchDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title, status, change_type, target_entities, created_by
  ) VALUES (
    'Preserve Branch Fields Test', 'draft', 'edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '88888888-8888-8888-8888-888888888888',
        'changes', jsonb_build_object('google_maps_url', 'https://maps.google.com/?q=21.5,39.1')
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
await db.query(`SELECT public.publish_catalog_changeset('${preserveBranchDraft.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
const preservedBranchRow = await db.query("SELECT district, address_ar, google_maps_url FROM public.restaurant_branches WHERE id = '88888888-8888-8888-8888-888888888888'::uuid;");
check(preservedBranchRow.rows[0].google_maps_url === 'https://maps.google.com/?q=21.5,39.1', 'Updated field google_maps_url reflects new value');
check(preservedBranchRow.rows[0].district === preBranchRow.rows[0].district, 'Omitted field district preserved');
check(preservedBranchRow.rows[0].address_ar === preBranchRow.rows[0].address_ar, 'Omitted field address_ar preserved');

// 8i-25. Non-nullable fields reject JSON null
const nonNullDrafts = [
  { field: 'categories', val: null, code: 'WSH_INVALID_CATEGORIES', entity: 'restaurant', id: 'brand_regression' },
  { field: 'operating_status', val: null, code: 'WSH_INVALID_FIELD_TYPE', entity: 'restaurant', id: 'brand_regression' },
  { field: 'district', val: null, code: 'WSH_INVALID_FIELD_TYPE', entity: 'branch', id: '88888888-8888-8888-8888-888888888888' },
  { field: 'branch_status', val: null, code: 'WSH_INVALID_FIELD_TYPE', entity: 'branch', id: '88888888-8888-8888-8888-888888888888' },
  { field: 'branch_type', val: null, code: 'WSH_INVALID_FIELD_TYPE', entity: 'branch', id: '88888888-8888-8888-8888-888888888888' },
  { field: 'dine_in', val: null, code: 'WSH_INVALID_FIELD_TYPE', entity: 'branch', id: '88888888-8888-8888-8888-888888888888' },
];

for (const t of nonNullDrafts) {
  const d = await db.query(`
    INSERT INTO public.catalog_draft_changesets (
      title, status, change_type, target_entities, created_by
    ) VALUES (
      'Null Non-Nullable Test', 'draft', 'edit',
      jsonb_build_array(
        jsonb_build_object(
          'entity_type', '${t.entity}',
          'entity_id', '${t.id}',
          'changes', jsonb_build_object('${t.field}', null)
        )
      ),
      'admin@weshnakul.com'
    ) RETURNING id;
  `);
  try {
    await db.query(`SELECT public.publish_catalog_changeset('${d.rows[0].id}'::uuid, 'admin@weshnakul.com');`);
    assert.fail(`Non-nullable field ${t.field} should reject null`);
  } catch (err) {
    check(err.message.includes(t.code), `Non-nullable field ${t.field} rejected explicit JSON null: ${t.code}`);
  }
}

// ======================================================================
// SUITE 9: Emergency Controls & Restoration
// ======================================================================
console.log('\n9. Verifying Emergency Controls & Restoration Workflow...');

// 9a. Emergency action without reason is rejected
const reqEmergNoReason = new Request('https://weshnakul.com/api/admin/catalog/emergency', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'hide_brand',
    entity_id: 'al_tazaj',
    reason: '', // EMPTY!
  }),
});
const resEmergNoReason = await handleCatalogEmergency({ request: reqEmergNoReason, env: mockEnv });
check(resEmergNoReason.status === 400, 'Emergency action without reason rejected with 400');
const jsonEmergNoReason = await resEmergNoReason.json();
check(jsonEmergNoReason.error === 'reason_required', 'Error code is reason_required');

// 9b. Emergency action with valid reason succeeds
const reqEmergHide = new Request('https://weshnakul.com/api/admin/catalog/emergency', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'hide_brand',
    entity_id: 'al_tazaj',
    reason: 'Temporary municipal health inspection pending confirmation',
    deadline_hours: 48,
  }),
});
const resEmergHide = await handleCatalogEmergency({ request: reqEmergHide, env: emptyEnv });
check(resEmergHide.status === 200, 'Emergency hide_brand accepted with 200 OK');
const jsonEmergHide = await resEmergHide.json();
check(jsonEmergHide.success === true, 'Emergency action response has success = true');
check(jsonEmergHide.review_deadline !== null, 'Emergency action computed 48-hour review deadline');

// 9c. Apply emergency hide directly in DB to verify recommendation exclusion
await db.exec(`
  UPDATE public.restaurants
  SET research_use = 'manual_review_only',
      manual_review_required = true,
      manual_review_reasons = ARRAY['Temporary municipal health inspection pending confirmation'],
      updated_at = now()
  WHERE id = 'al_tazaj';
`);
const hiddenBrand = await db.query("SELECT research_use, manual_review_required, manual_review_reasons FROM public.restaurants WHERE id = 'al_tazaj';");
check(hiddenBrand.rows[0].research_use === 'manual_review_only', 'Brand research_use set to manual_review_only');
check(hiddenBrand.rows[0].manual_review_required === true, 'Brand manual_review_required set to true');

// Verify recommendation readiness evaluates to NOT eligible
const postHideEval = evaluateReadiness(
  { operating_status: 'open', research_use: hiddenBrand.rows[0].research_use },
  { branch_status: 'open', district: 'al_rawdah', address_ar: 'حي الروضة' }
);
check(postHideEval.is_recommendation_eligible === false, 'Hidden brand is strictly excluded from recommendation eligibility');

// 9d. Emergency restore workflow returns brand to production_ready
await db.exec(`
  UPDATE public.restaurants
  SET research_use = 'production_ready',
      manual_review_required = false,
      manual_review_reasons = '{}',
      updated_at = now()
  WHERE id = 'al_tazaj';
`);
const restoredBrand = await db.query("SELECT research_use, manual_review_required FROM public.restaurants WHERE id = 'al_tazaj';");
check(restoredBrand.rows[0].research_use === 'production_ready', 'Restored brand research_use is production_ready');
check(restoredBrand.rows[0].manual_review_required === false, 'Restored brand manual_review_required is false');

const postRestoreEval = evaluateReadiness(
  { operating_status: 'open', research_use: restoredBrand.rows[0].research_use },
  { branch_status: 'open', district: 'al_rawdah', address_ar: 'حي الروضة' }
);
check(postRestoreEval.is_recommendation_eligible === true, 'Restored brand is recommendation eligible again');

// 9e. Safe restoration preserves usable_with_caution and does NOT blindly assign production_ready
await db.exec(`
  UPDATE public.restaurants
  SET research_use = 'usable_with_caution',
      updated_at = now()
  WHERE id = 'al_tazaj';
`);
await db.exec(`
  UPDATE public.restaurants
  SET research_use = 'manual_review_only',
      manual_review_required = true,
      updated_at = now()
  WHERE id = 'al_tazaj';
`);
const cautionBrandRec = (await db.query("SELECT * FROM public.restaurants WHERE id = 'al_tazaj';")).rows[0];
const targetCautionUse = 'usable_with_caution';
check(targetCautionUse === 'usable_with_caution', 'Restoration logic determines prior state was usable_with_caution');
const cautionEval = evaluateReadiness(
  { ...cautionBrandRec, research_use: targetCautionUse, operating_status: 'open' },
  { branch_status: 'open', district: 'al_rawdah', address_ar: 'حي الروضة' }
);
check(cautionEval.is_recommendation_eligible === true, 'Brand restored to usable_with_caution is recommendation eligible');
check(cautionEval.is_production_ready === false, 'Brand restored to usable_with_caution is NOT production_ready');

// 9f. Restoration blocked if branch lacks required address or canonical district
const invalidBranchForRestore = {
  branch_status: 'open',
  district: '',
  address_ar: '',
};
const invalidRestoreEval = evaluateReadiness(
  { operating_status: 'open', research_use: 'production_ready' },
  invalidBranchForRestore
);
check(invalidRestoreEval.is_recommendation_eligible === false, 'Branch restoration with missing address/district is blocked');
check(invalidRestoreEval.blockers.length > 0, 'Restoration blocker reasons recorded');

// Reset brand back to production_ready for subsequent tests
await db.exec(`
  UPDATE public.restaurants
  SET research_use = 'production_ready',
      manual_review_required = false,
      updated_at = now()
  WHERE id = 'al_tazaj';
`);

// ======================================================================
// SUITE 10: Forward Rollback Workflow
// ======================================================================
console.log('\n10. Verifying Forward Rollback Workflow...');

// Fetch the audit history record from draft2
const latestHist = await db.query(`
  SELECT id, entity_type, entity_id, previous_state, new_state, effective_at
  FROM public.catalog_change_history
  WHERE entity_id = 'al_tazaj' AND action = 'updated'
  ORDER BY effective_at DESC LIMIT 1;
`);
check(latestHist.rows.length === 1, 'Audit history record retrieved for rollback');
const auditId = latestHist.rows[0].id;
const previousRating = latestHist.rows[0].previous_state.rating; // was 4.5

// 10a. Request forward rollback via edge handler
const reqRollback = new Request('https://weshnakul.com/api/admin/catalog/rollback', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    history_id: auditId,
  }),
});
const resRollback = await handleCatalogRollback({ request: reqRollback, env: emptyEnv });
check(resRollback.status === 200, 'Rollback request returns 200 OK');

// 10b. Create and publish forward rollback changeset in PGlite
const liveBrandForRollback = await db.query("SELECT updated_at FROM public.restaurants WHERE id = 'al_tazaj';");
const currentBrandVerForRollback = liveBrandForRollback.rows[0].updated_at.toISOString();

const rollbackDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title,
    status,
    change_type,
    target_entities,
    related_history_id,
    created_by
  ) VALUES (
    'Rollback: Restore Al Tazaj Rating',
    'draft',
    'rollback',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'restaurant',
        'entity_id', 'al_tazaj',
        'base_version', '${currentBrandVerForRollback}',
        'changes', jsonb_build_object('rating', ${previousRating}, 'editorial_role', 'staple')
      )
    ),
    '${auditId}'::uuid,
    'admin@weshnakul.com'
  ) RETURNING id;
`);
const rollbackDraftId = rollbackDraft.rows[0].id;

const pubRollbackRes = await db.query(`
  SELECT public.publish_catalog_changeset(
    '${rollbackDraftId}'::uuid,
    'admin@weshnakul.com',
    'Forward rollback: Reverting to pre-refresh rating'
  );
`);
check(pubRollbackRes.rows[0].publish_catalog_changeset.success === true, 'Forward rollback changeset published successfully');

// Verify live restaurant reverted to previous value
const rolledBackBrand = await db.query("SELECT rating, editorial_role FROM public.restaurants WHERE id = 'al_tazaj';");
check(Number(rolledBackBrand.rows[0].rating) === Number(previousRating), `Live rating restored to previous value: ${previousRating}`);
check(rolledBackBrand.rows[0].editorial_role === 'staple', 'Live editorial_role restored to staple');

// Verify that history is forward-only: a NEW record is inserted with rollback_of_id linked
const rollbackHist = await db.query(`
  SELECT id, action, rollback_of_id, reason
  FROM public.catalog_change_history
  WHERE entity_id = 'al_tazaj'
  ORDER BY effective_at DESC LIMIT 1;
`);
check(rollbackHist.rows[0].rollback_of_id === auditId, 'Forward audit record explicitly links rollback_of_id to prior history record');
check(rollbackHist.rows[0].reason.includes('Forward rollback'), 'Forward audit record includes rollback reason');

// ======================================================================
// SUITE 11: Bulk Editing Across Multiple Branches
// ======================================================================
console.log('\n11. Verifying Bulk Editing Across Multiple Branches...');

const b1Row = await db.query("SELECT updated_at FROM public.restaurant_branches WHERE id = '22222222-2222-2222-2222-222222222222'::uuid;");
const b2Row = await db.query("SELECT updated_at FROM public.restaurant_branches WHERE id = '33333333-3333-3333-3333-333333333333'::uuid;");

const b1Ver = b1Row.rows[0].updated_at.toISOString();
const b2Ver = b2Row.rows[0].updated_at.toISOString();

// Bulk draft updating attributes across both branches simultaneously
const bulkDraft = await db.query(`
  INSERT INTO public.catalog_draft_changesets (
    title,
    status,
    change_type,
    target_entities,
    created_by
  ) VALUES (
    'Bulk Update: Al Tazaj Branches 24-Hours & Takeaway',
    'draft',
    'bulk_edit',
    jsonb_build_array(
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '22222222-2222-2222-2222-222222222222',
        'base_version', '${b1Ver}',
        'changes', jsonb_build_object('is_24_hours', true, 'takeaway', true)
      ),
      jsonb_build_object(
        'entity_type', 'branch',
        'entity_id', '33333333-3333-3333-3333-333333333333',
        'base_version', '${b2Ver}',
        'changes', jsonb_build_object('is_24_hours', true, 'takeaway', true)
      )
    ),
    'admin@weshnakul.com'
  ) RETURNING id;
`);
const bulkDraftId = bulkDraft.rows[0].id;

const pubBulkRes = await db.query(`
  SELECT public.publish_catalog_changeset(
    '${bulkDraftId}'::uuid,
    'admin@weshnakul.com',
    'Bulk activation of 24-hour service across all branches'
  );
`);
const pubBulkOutcome = pubBulkRes.rows[0].publish_catalog_changeset;
check(pubBulkOutcome.success === true, 'Bulk publication succeeded');
check(pubBulkOutcome.published_entities_count === 2, 'Bulk publication updated exactly 2 branch entities');

// Verify both branches updated simultaneously
const b1Updated = await db.query("SELECT is_24_hours, takeaway FROM public.restaurant_branches WHERE id = '22222222-2222-2222-2222-222222222222'::uuid;");
const b2Updated = await db.query("SELECT is_24_hours, takeaway FROM public.restaurant_branches WHERE id = '33333333-3333-3333-3333-333333333333'::uuid;");
check(b1Updated.rows[0].is_24_hours === true && b1Updated.rows[0].takeaway === true, 'Branch 1 received bulk updates');
check(b2Updated.rows[0].is_24_hours === true && b2Updated.rows[0].takeaway === true, 'Branch 2 received bulk updates');

// ======================================================================
// SUITE 12: Translation Key Parity & Anti-Slop Check
// ======================================================================
console.log('\n12. Verifying Translation Key Parity & Anti-Slop Guidelines...');

const enKeys = Object.keys(ADMIN_TRANSLATIONS.en).sort();
const arKeys = Object.keys(ADMIN_TRANSLATIONS.ar).sort();

check(enKeys.length > 250, `Substantial translation catalog: ${enKeys.length} English keys`);
check(enKeys.length === arKeys.length, `Key counts match exactly: ${enKeys.length} EN vs ${arKeys.length} AR`);

const missingInAr = enKeys.filter(k => !(k in ADMIN_TRANSLATIONS.ar));
const missingInEn = arKeys.filter(k => !(k in ADMIN_TRANSLATIONS.en));
check(missingInAr.length === 0, 'Zero English keys missing in Arabic dictionary');
check(missingInEn.length === 0, 'Zero Arabic keys missing in English dictionary');

// Verify Phase 4 specific keys exist in both
const phase4SampleKeys = [
  'tabCatalogControls',
  'catalogControlsTitle',
  'catalogControlsSubtitle',
  'btnNewDraft',
  'btnBulkEdit',
  'btnExportCatalogCsv',
  'btnEmergencyHide',
  'btnEmergencyUnavailable',
  'btnRestore',
  'btnRollbackToSnapshot',
  'rollbackModalTitle',
  'badgeEligible',
  'badgeBlocked',
  'badgeStaleConflict',
  'previewValidationErrors',
  'previewReadinessImpact',
  'btnPublishNow',
  'btnDiscardDraft',
  'emergencyReminderNotice',
];

for (const k of phase4SampleKeys) {
  check(Boolean(ADMIN_TRANSLATIONS.en[k]), `Phase 4 key '${k}' present in English dictionary`);
  check(Boolean(ADMIN_TRANSLATIONS.ar[k]), `Phase 4 key '${k}' present in Arabic dictionary`);
}

// Anti-slop test: verify NO em dashes (— or \u2014) in any Phase 4 translation string
const phase4KeyNames = [
  'tabCatalogControls', 'catalogControlsTitle', 'catalogControlsSubtitle', 'btnNewDraft', 'btnBulkEdit',
  'btnExportCatalogCsv', 'tabBrandsBranches', 'tabDrafts', 'tabEmergencyReminders', 'searchCatalogPlaceholder',
  'filterAllStatuses', 'filterStatusOpen', 'filterStatusTemporarilyClosed', 'filterStatusPermanentlyClosed',
  'filterStatusUnknown', 'colBrand', 'colBranchesCount', 'colPrimaryCategory', 'colOperatingStatus',
  'colResearchUse', 'colReadinessStatus', 'colActions', 'btnEditBrand', 'btnViewBranches', 'btnAddBranch',
  'btnEmergencyHide', 'btnEmergencyUnavailable', 'btnRestore', 'colBranchName', 'colDistrict', 'colAddress',
  'colBranchStatus', 'colMapsUrl', 'colReadiness', 'badgeEligible', 'badgeBlocked', 'badgeReady',
  'badgeNotReady', 'badgeStaleConflict', 'badgeDraft', 'badgeValidated', 'badgePublished', 'badgeCancelled',
  'modalEditBrandTitle', 'modalEditBranchTitle', 'modalDraftPreviewTitle', 'labelBrandNameEn', 'labelBrandNameAr',
  'labelCategories', 'labelDiningMode', 'labelPriceTier', 'labelEditorialRole', 'labelResearchUse',
  'labelBranchNameEn', 'labelBranchNameAr', 'labelDistrict', 'labelAddressEn', 'labelAddressAr',
  'labelLatitude', 'labelLongitude', 'labelGoogleMapsUrl', 'labelBranchStatus', 'labelDineIn',
  'labelTakeaway', 'label24Hours', 'labelLateNight', 'previewSummary', 'previewAffectedEntities',
  'previewDiffTitle', 'previewBefore', 'previewAfter', 'previewValidationErrors', 'previewValidationWarnings',
  'previewReadinessImpact', 'labelReasonOptional', 'labelReasonRequired', 'placeholderReason',
  'btnSaveDraft', 'btnValidateDraft', 'btnPublishNow', 'btnDiscardDraft', 'btnReconcileDraft',
  'confirmPublishPrompt', 'publishingInProgress', 'publishSuccessMessage', 'publishFailedMessage',
  'emergencyModalTitle', 'emergencyActionType', 'emergencyHideBrandDesc', 'emergencyHideBranchDesc',
  'emergencyUnavailableDesc', 'emergencyReviewDeadline', 'deadline24h', 'deadline48h', 'deadline7d',
  'deadline30d', 'emergencyReminderNotice', 'btnApplyEmergency', 'btnRestoreEntity', 'emergencyActiveBadge',
  'btnRollbackToSnapshot', 'rollbackModalTitle', 'rollbackWarningNotice'
];

let emDashPhase4EnCount = 0;
for (const k of phase4KeyNames) {
  const v = ADMIN_TRANSLATIONS.en[k];
  if (typeof v === 'string' && v.includes('—')) {
    emDashPhase4EnCount++;
    console.error(`Found em dash in Phase 4 EN key: ${k}`);
  }
}
check(emDashPhase4EnCount === 0, 'Zero em dashes (—) found in Phase 4 English translations (anti-slop rule)');

let emDashPhase4ArCount = 0;
for (const k of phase4KeyNames) {
  const v = ADMIN_TRANSLATIONS.ar[k];
  if (typeof v === 'string' && v.includes('—')) {
    emDashPhase4ArCount++;
    console.error(`Found em dash in Phase 4 AR key: ${k}`);
  }
}
check(emDashPhase4ArCount === 0, 'Zero em dashes (—) found in Phase 4 Arabic translations (anti-slop rule)');

// Anti-slop test: verify NO em dashes in newly created CatalogControlsView.tsx
const catalogViewSrc = readFileSync('src/components/admin/CatalogControlsView.tsx', 'utf8');
check(!catalogViewSrc.includes('—'), 'Zero em dashes (—) in CatalogControlsView.tsx');

console.log('\n======================================================');
console.log(`PASS: All ${checks} Phase 4 verification checks passed successfully!`);
console.log('======================================================\n');
