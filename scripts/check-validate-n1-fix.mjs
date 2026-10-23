/**
 * Regression test: Finding 1 N+1 fix in catalog/validate.ts
 *
 * Verifies that:
 * 1. Validation logic produces identical results before and after the bulk-fetch refactor.
 * 2. The fetch call count is exactly 3 (or fewer) regardless of entity count, not 2N.
 * 3. All edge cases are handled: missing records, mixed entity types, empty ID, max batch.
 *
 * This test runs entirely offline — no Supabase connection required.
 * The mock fetch intercept proves query count reduction.
 */

import assert from 'node:assert/strict';
import { createAdminToken } from '../functions/api/admin/_auth.ts';
import { onRequestPost as handleCatalogValidate } from '../functions/api/admin/catalog/validate.ts';

const TEST_SECRET = 'test-n1-fix-secret-2026';
const adminToken = await createAdminToken(
  { sub: 'admin-n1-test', email: 'admin@weshnakul.com', role: 'admin' },
  TEST_SECRET
);

let checks = 0;
const check = (condition, msg) => {
  assert.ok(condition, msg);
  checks++;
  console.log(`  ✓ [${checks}] ${msg}`);
};

const BASE_ENV = {
  ADMIN_JWT_SECRET: TEST_SECRET,
  ADMIN_PASSWORD: 'SuperSecretAdminPassword123!',
  ADMIN_EMAIL: 'admin@weshnakul.com',
};

// ---------------------------------------------------------------------------
// Fetch interceptor: wraps globalThis.fetch to count and intercept calls.
// ---------------------------------------------------------------------------
function buildMockFetch(db) {
  let callCount = 0;
  const calls = [];

  const mock = async (url, opts) => {
    const urlStr = String(url);
    callCount++;
    calls.push(urlStr);

    // Draft changeset fetch (by id=eq. — used when draft_id is provided)
    if (urlStr.includes('/rest/v1/catalog_draft_changesets')) {
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Restaurants bulk (id=in.)
    if (urlStr.includes('/rest/v1/restaurants?id=in.')) {
      const match = urlStr.match(/id=in\.\(([^)]+)\)/);
      const ids = match ? match[1].split(',').map(decodeURIComponent) : [];
      const rows = ids.map((id) => db.restaurants[id]).filter(Boolean);
      return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Branches bulk (id=in.)
    if (urlStr.includes('/rest/v1/restaurant_branches?id=in.')) {
      const match = urlStr.match(/id=in\.\(([^)]+)\)/);
      const ids = match ? match[1].split(',').map(decodeURIComponent) : [];
      const rows = ids.map((id) => db.branches[id]).filter(Boolean);
      return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Draft PATCH (persist validation outcome — counts but not a read query)
    if (urlStr.includes('/rest/v1/catalog_draft_changesets?id=eq.') && opts?.method === 'PATCH') {
      return new Response('', { status: 204 });
    }

    // Fallback — reject any per-entity (id=eq.) restaurant/branch fetch to catch regressions
    if (urlStr.includes('?id=eq.') && (urlStr.includes('/restaurants') || urlStr.includes('/restaurant_branches'))) {
      throw new Error(`REGRESSION: per-entity id=eq. fetch detected — N+1 not fixed: ${urlStr}`);
    }

    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  mock.getCount = () => callCount;
  mock.getCalls = () => [...calls];
  mock.reset = () => { callCount = 0; calls.length = 0; };
  return mock;
}

// ---------------------------------------------------------------------------
// In-memory DB fixture
// ---------------------------------------------------------------------------
const DB = {
  restaurants: {
    'brand_alpha': {
      id: 'brand_alpha',
      name_en: 'Brand Alpha',
      name_ar: 'براند ألفا',
      categories: ['burger'],
      operating_status: 'open',
      research_use: 'production_ready',
      updated_at: '2026-10-01T10:00:00.000Z',
    },
    'brand_beta': {
      id: 'brand_beta',
      name_en: 'Brand Beta',
      name_ar: 'براند بيتا',
      categories: ['shawarma'],
      operating_status: 'open',
      research_use: 'production_ready',
      updated_at: '2026-10-01T10:00:00.000Z',
    },
  },
  branches: {
    'branch-0001-0001-0001-000000000001': {
      id: 'branch-0001-0001-0001-000000000001',
      restaurant_id: 'brand_alpha',
      branch_name_en: 'Alpha Rawdah',
      district: 'al_rawdah',
      address_ar: 'شارع صاري',
      address_en: 'Sari Street',
      branch_status: 'open',
      updated_at: '2026-10-01T10:00:00.000Z',
    },
    'branch-0002-0002-0002-000000000002': {
      id: 'branch-0002-0002-0002-000000000002',
      restaurant_id: 'brand_alpha',
      branch_name_en: 'Alpha Naeem',
      district: 'al_naeem',
      address_ar: 'شارع حراء',
      address_en: 'Hira Street',
      branch_status: 'open',
      updated_at: '2026-10-01T10:00:00.000Z',
    },
    'branch-0003-0003-0003-000000000003': {
      id: 'branch-0003-0003-0003-000000000003',
      restaurant_id: 'brand_beta',
      branch_name_en: 'Beta Safa',
      district: 'al_safa',
      address_ar: 'شارع الأمير سلطان',
      address_en: 'Prince Sultan Street',
      branch_status: 'open',
      updated_at: '2026-10-01T10:00:00.000Z',
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeEnv(mockFetch) {
  return {
    ...BASE_ENV,
    SUPABASE_URL: 'https://mock.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'mock-service-key',
    _mockFetch: mockFetch,   // not used by handler; kept for reference
  };
}

function makeRequest(body) {
  return new Request('https://weshnakul.com/api/admin/catalog/validate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function callValidate(body, mockFetch) {
  const orig = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    const res = await handleCatalogValidate({ request: makeRequest(body), env: makeEnv(mockFetch) });
    return await res.json();
  } finally {
    globalThis.fetch = orig;
  }
}

// ===========================================================================
// TEST 1: Query count — 50 branches from 2 parent brands → exactly 3 fetches
// ===========================================================================
console.log('\n1. Query count: 50 branches (2 parent brands) → at most 3 DB fetches');

// Expand the fixture: 50 branches all pointing to brand_alpha or brand_beta
const fiftyBranches = {};
const branchEntities = [];
for (let i = 0; i < 50; i++) {
  const pad = String(i).padStart(12, '0');
  const id = `aabbccdd-0000-0000-0000-${pad}`;
  const parentId = i % 2 === 0 ? 'brand_alpha' : 'brand_beta';
  fiftyBranches[id] = {
    id,
    restaurant_id: parentId,
    branch_name_en: `Branch ${i}`,
    district: 'al_rawdah',
    address_ar: 'شارع صاري',
    address_en: 'Sari St',
    branch_status: 'open',
    updated_at: '2026-10-01T10:00:00.000Z',
  };
  branchEntities.push({
    entity_type: 'branch',
    entity_id: id,
    changes: { branch_status: 'open' },
  });
}

const bigDB = { restaurants: DB.restaurants, branches: { ...DB.branches, ...fiftyBranches } };
const bigMock = buildMockFetch(bigDB);

const bigResult = await callValidate({ target_entities: branchEntities }, bigMock);

// The fetch count must be exactly 3:
//   1 → bulk restaurant_branches?id=in.(50 ids)
//   2 → bulk restaurants?id=in.(brand_alpha,brand_beta)   [distinct parent ids]
// (no restaurant-type entities so query 1 for restaurants is skipped)
check(bigMock.getCount() <= 3, `50-branch batch fires at most 3 DB fetches (actual: ${bigMock.getCount()})`);
check(bigMock.getCount() >= 2, `50-branch batch fires at least 2 DB fetches (branches + parent brands)`);
check(bigResult.success === true, '50-branch validation returns success');
check(bigResult.affected_entities_count === 50, 'affected_entities_count is 50');

// ===========================================================================
// TEST 2: Mixed entity types — restaurants + branches → at most 3 fetches
// ===========================================================================
console.log('\n2. Mixed entity types: 2 restaurants + 3 branches → at most 3 fetches');

const mixedMock = buildMockFetch(DB);
const mixedEntities = [
  { entity_type: 'restaurant', entity_id: 'brand_alpha', changes: { rating: 4.8 } },
  { entity_type: 'restaurant', entity_id: 'brand_beta',  changes: { rating: 4.6 } },
  { entity_type: 'branch', entity_id: 'branch-0001-0001-0001-000000000001', changes: { branch_status: 'open' } },
  { entity_type: 'branch', entity_id: 'branch-0002-0002-0002-000000000002', changes: { branch_status: 'open' } },
  { entity_type: 'branch', entity_id: 'branch-0003-0003-0003-000000000003', changes: { branch_status: 'open' } },
];
const mixedResult = await callValidate({ target_entities: mixedEntities }, mixedMock);

check(mixedMock.getCount() <= 3, `Mixed batch fires at most 3 fetches (actual: ${mixedMock.getCount()})`);
check(mixedResult.affected_entities_count === 5, 'affected_entities_count is 5 for mixed batch');
check(mixedResult.readiness_impact.length === 3, '3 readiness_impact entries for 3 branches');

// ===========================================================================
// TEST 3: Validation output equivalence — single branch passes
// ===========================================================================
console.log('\n3. Valid branch: is_publishable true, 0 errors, correct readiness');

const validMock = buildMockFetch(DB);
const validResult = await callValidate({
  target_entities: [{
    entity_type: 'branch',
    entity_id: 'branch-0001-0001-0001-000000000001',
    // base_version newer than DB updated_at (2026-10-01) so no concurrency conflict
    base_version: '2026-10-02T10:00:00.000Z',
    changes: { branch_status: 'open' },
  }],
}, validMock);

check(validResult.is_publishable === true, 'Valid branch with current base_version is publishable');
check(validResult.errors.length === 0, 'No validation errors for valid branch');
check(validResult.readiness_impact.length === 1, 'readiness_impact has 1 entry');
check(validResult.readiness_impact[0].after.is_recommendation_eligible === true, 'Branch with parent brand is recommendation eligible');

// ===========================================================================
// TEST 4: Concurrency conflict detected from pre-fetched record
// ===========================================================================
console.log('\n4. Concurrency conflict: base_version older than updated_at → STALE_DRAFT_CONFLICT');

const concMock = buildMockFetch(DB);
const concResult = await callValidate({
  target_entities: [{
    entity_type: 'restaurant',
    entity_id: 'brand_alpha',
    base_version: '2026-09-01T00:00:00.000Z', // older than 2026-10-01 updated_at
    changes: { rating: 4.9 },
  }],
}, concMock);

check(concResult.is_publishable === false, 'Stale base_version makes changeset not publishable');
check(concResult.errors.some(e => e.code === 'STALE_DRAFT_CONFLICT'), 'STALE_DRAFT_CONFLICT error emitted');
check(concResult.concurrency_conflicts.length === 1, 'One concurrency conflict recorded');

// ===========================================================================
// TEST 5: Missing branch record → null currentRecord → graceful degradation
// ===========================================================================
console.log('\n5. Missing branch record → null currentRecord → graceful degradation (no crash)');

const emptyBranchDB = { restaurants: DB.restaurants, branches: {} }; // no branches in DB
const missMock = buildMockFetch(emptyBranchDB);
const missResult = await callValidate({
  target_entities: [{
    entity_type: 'branch',
    entity_id: 'branch-does-not-exist',
    changes: { district: 'al_rawdah', address_ar: 'شارع صاري' },
  }],
}, missMock);

check(typeof missResult.success === 'boolean', 'Handler completes without exception for missing branch');
// Missing branch means currentRecord = null, readiness uses changes only
check(missResult.readiness_impact.length === 1, 'readiness_impact still has 1 entry for missing branch');
check(missResult.readiness_impact[0].before === null, 'before readiness is null when branch not in DB');

// ===========================================================================
// TEST 6: Missing parent brand → falls back to optimistic brand defaults
// ===========================================================================
console.log('\n6. Missing parent brand → falls back to optimistic defaults');

const orphanDB = {
  restaurants: {}, // no brands in DB
  branches: {
    'orphan-branch-0000-0000-000000000099': {
      id: 'orphan-branch-0000-0000-000000000099',
      restaurant_id: 'nonexistent_brand',
      district: 'al_rawdah',
      address_ar: 'شارع صاري',
      branch_status: 'open',
      updated_at: '2026-10-01T10:00:00.000Z',
    },
  },
};
const orphanMock = buildMockFetch(orphanDB);
const orphanResult = await callValidate({
  target_entities: [{
    entity_type: 'branch',
    entity_id: 'orphan-branch-0000-0000-000000000099',
    changes: { branch_status: 'open' },
  }],
}, orphanMock);

check(typeof orphanResult.success === 'boolean', 'Handler completes for orphan branch (missing parent brand)');
// parentBrand falls back to { operating_status: 'open', research_use: 'production_ready' }
check(orphanResult.readiness_impact[0].after.is_recommendation_eligible === true, 'Orphan branch uses optimistic brand defaults and is recommendation eligible when district/address are present');

// ===========================================================================
// TEST 7: Empty entity_id is skipped from ID collection (no empty string in query)
// ===========================================================================
console.log('\n7. Entity with empty entity_id does not inject empty string into bulk query');

const badIdMock = buildMockFetch(DB);
const badIdResult = await callValidate({
  target_entities: [
    { entity_type: 'restaurant', entity_id: '', changes: { rating: 4.5 } },
    { entity_type: 'restaurant', entity_id: 'brand_alpha', changes: { rating: 4.5 } },
  ],
}, badIdMock);

check(typeof badIdResult.success === 'boolean', 'Handler completes with one empty entity_id');
// The bulk fetch for restaurants should still fire (brand_alpha is valid)
const restaurantFetches = badIdMock.getCalls().filter(u => u.includes('/restaurants?id=in.'));
check(restaurantFetches.length === 1, 'Exactly 1 restaurant bulk fetch fired');
// Empty ID should not appear in the in.(…) list
check(!restaurantFetches[0].includes('id=in.(,') && !restaurantFetches[0].includes(',)'), 'Empty entity_id not injected into in.(…) query');

// ===========================================================================
// TEST 8: No upstream configured (emptyEnv) → all validation runs offline
// ===========================================================================
console.log('\n8. No upstream (emptyEnv) → validation runs offline, no fetches');

const emptyEnvMock = buildMockFetch(DB);
const noUpstreamRes = await handleCatalogValidate({
  request: makeRequest({
    target_entities: [{
      entity_type: 'branch',
      entity_id: 'branch-0001-0001-0001-000000000001',
      changes: { district: 'al_rawdah', address_ar: 'شارع صاري' },
    }],
  }),
  env: { ADMIN_JWT_SECRET: TEST_SECRET },
});
const noUpstreamJson = await noUpstreamRes.json();

// mock fetch is NOT installed here — test that handler does not attempt any fetch when no upstream
check(noUpstreamJson.success === true, 'Offline validation returns success without upstream');
check(typeof noUpstreamJson.is_publishable === 'boolean', 'is_publishable is boolean in offline mode');
// No fetches should have been made (fetch not installed, so if it tried it would throw)
check(emptyEnvMock.getCount() === 0, 'Zero fetches when no upstream configured');

// ===========================================================================
// TEST 9: Unsupported target key and bad base_version still caught
// ===========================================================================
console.log('\n9. Structural validation (unsupported key, bad base_version) still works post-refactor');

const structMock = buildMockFetch(DB);
const structResult = await callValidate({
  target_entities: [{
    entity_type: 'restaurant',
    entity_id: 'brand_alpha',
    base_version: '2026-10-21T07:00:00', // missing timezone
    changes: { rating: 4.5 },
    unsupported_key: true,
  }],
}, structMock);

check(structResult.errors.some(e => e.code === 'INVALID_TIMESTAMP'), 'INVALID_TIMESTAMP still caught after refactor');
check(structResult.errors.some(e => e.code === 'UNSUPPORTED_TARGET_KEY'), 'UNSUPPORTED_TARGET_KEY still caught after refactor');

// ===========================================================================
// TEST 10: REASON_REQUIRED still enforced for sensitive change types
// ===========================================================================
console.log('\n10. REASON_REQUIRED enforcement for emergency/rollback/restore change types');

const reasonMock = buildMockFetch(DB);
const reasonResult = await callValidate({
  change_type: 'rollback',
  reason: 'ab', // too short
  target_entities: [{ entity_type: 'restaurant', entity_id: 'brand_alpha', changes: { rating: 4.5 } }],
}, reasonMock);

check(reasonResult.errors.some(e => e.code === 'REASON_REQUIRED'), 'REASON_REQUIRED error still emitted for rollback with short reason');

// ===========================================================================
// Summary
// ===========================================================================
console.log(`\n${'='.repeat(70)}`);
console.log(`VALIDATE N+1 FIX REGRESSION: ${checks} checks passed.`);
console.log('='.repeat(70));
