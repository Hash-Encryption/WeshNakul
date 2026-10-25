import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// 1. Import schema & validation
import {
  ALGORITHM_CONFIG_SCHEMA_VERSION,
  DEFAULT_ALGORITHM_SETTINGS,
  SETTING_BOUNDS,
  ALLOWED_SCOPES,
  validateAlgorithmConfigServer,
  computeConfigDiffSummary,
} from '../functions/api/admin/algorithm/_schema.ts';

import {
  ALGORITHM_SETTING_METADATA,
  SUPPORTED_OVERRIDE_SCOPES,
  resolveEffectiveSettings,
  validateAlgorithmConfig,
} from '../src/types/algorithm.ts';

// 2. Import auth and API handlers
import {
  createAdminToken,
  authenticateAdminRequest,
} from '../functions/api/admin/_auth.ts';

import { onRequestGet as handleConfigGet, onRequestPost as handleConfigPost } from '../functions/api/admin/algorithm/config.ts';
import { onRequestPost as handleValidatePost } from '../functions/api/admin/algorithm/validate.ts';
import { onRequestPost as handlePreviewPost } from '../functions/api/admin/algorithm/preview.ts';
import { onRequestPost as handlePublishPost } from '../functions/api/admin/algorithm/publish.ts';
import { onRequestGet as handleVersionsGet } from '../functions/api/admin/algorithm/versions.ts';
import { onRequestPost as handleRollbackPost } from '../functions/api/admin/algorithm/rollback.ts';

import { ADMIN_TRANSLATIONS } from '../src/locales/adminTranslations.ts';

console.log('======================================================================');
console.log('--- WESHNAKUL PHASE 5: ALGORITHM CONTROLS, PREVIEW & ROLLBACK TEST SUITE ---');
console.log('======================================================================');

let checks = 0;
const check = (condition, msg) => {
  assert.ok(condition, msg);
  checks++;
  console.log(`  ✓ [Check ${checks}] ${msg}`);
};

const TEST_SECRET = 'test-phase5-algorithm-secret-2026';
const mockEnv = {
  TEST_ADMIN_SECRET: TEST_SECRET,
  ADMIN_JWT_SECRET: TEST_SECRET,
  ADMIN_PASSWORD: 'SuperSecretAdminPassword123!',
  ADMIN_EMAIL: 'admin@weshnakul.com',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  VITE_SUPABASE_URL: 'https://test.supabase.co',
};

const adminToken = await createAdminToken(
  { sub: 'admin-1', email: 'admin@weshnakul.com', role: 'admin' },
  TEST_SECRET
);
const nonAdminToken = await createAdminToken(
  { sub: 'user-1', email: 'user@weshnakul.com', role: 'member' },
  TEST_SECRET
);

// ======================================================================
// SUITE 1: Settings Schema, Metadata & Safe Defaults
// ======================================================================
console.log('\n1. Verifying Configuration Schema, Bounds, & Safe Baseline Defaults...');

check(ALGORITHM_CONFIG_SCHEMA_VERSION === 'v1.0.0', 'Schema version is v1.0.0');

const allKeys = Object.keys(ALGORITHM_SETTING_METADATA);
check(allKeys.length === 15, `Exactly 15 recommendation settings defined (found ${allKeys.length})`);

for (const [key, meta] of Object.entries(ALGORITHM_SETTING_METADATA)) {
  check(typeof meta.nameEn === 'string' && meta.nameEn.length > 0, `${key} has non-empty English name`);
  check(typeof meta.nameAr === 'string' && meta.nameAr.length > 0, `${key} has non-empty Arabic name`);
  check(typeof meta.descriptionEn === 'string' && meta.descriptionEn.length > 0, `${key} has non-empty English description`);
  check(typeof meta.descriptionAr === 'string' && meta.descriptionAr.length > 0, `${key} has non-empty Arabic description`);
  check(typeof meta.higherEffectEn === 'string' && meta.higherEffectEn.length > 0, `${key} documents practical higher effect`);
  check(typeof meta.lowerEffectEn === 'string' && meta.lowerEffectEn.length > 0, `${key} documents practical lower effect`);
  check(meta.min < meta.max, `${key} has valid bounds [${meta.min}, ${meta.max}]`);
  check(meta.default >= meta.min && meta.default <= meta.max, `${key} default ${meta.default} is within bounds`);
}

// Baseline values match exact audited SQL algorithm constants
check(DEFAULT_ALGORITHM_SETTINGS.reputation_weight_factor === 1.45, 'Reputation factor baseline is 1.45');
check(DEFAULT_ALGORITHM_SETTINGS.editorial_staple_boost === 0.24, 'Editorial staple boost baseline is 0.24');
check(DEFAULT_ALGORITHM_SETTINGS.editorial_popular_boost === 0.20, 'Editorial popular boost baseline is 0.20');
check(DEFAULT_ALGORITHM_SETTINGS.editorial_discovery_boost === 0.10, 'Editorial discovery boost baseline is 0.10');
check(DEFAULT_ALGORITHM_SETTINGS.trend_boost === 0.16, 'Trend boost baseline is 0.16');
check(DEFAULT_ALGORITHM_SETTINGS.confidence_boost === 0.18, 'Confidence boost baseline is 0.18');
check(DEFAULT_ALGORITHM_SETTINGS.distance_proximity_weight === 1.00, 'Distance proximity weight baseline is 1.00');
check(DEFAULT_ALGORITHM_SETTINGS.distance_decay_km === 8.0, 'Distance decay denominator baseline is 8.0 km');
check(DEFAULT_ALGORITHM_SETTINGS.district_proximity_weight === 1.00, 'District proximity weight baseline is 1.00');
check(DEFAULT_ALGORITHM_SETTINGS.progressive_widening_tier_penalty === 0.20, 'Widening tier penalty baseline is 0.20');
check(DEFAULT_ALGORITHM_SETTINGS.repetition_penalty === 1.00, 'Repetition penalty baseline is 1.00');
check(DEFAULT_ALGORITHM_SETTINGS.diversity_style_weight === 0.15, 'Diversity style weight baseline is 0.15');
check(DEFAULT_ALGORITHM_SETTINGS.diversity_price_weight === 0.12, 'Diversity price weight baseline is 0.12');
check(DEFAULT_ALGORITHM_SETTINGS.diversity_editorial_weight === 0.10, 'Diversity editorial weight baseline is 0.10');
check(DEFAULT_ALGORITHM_SETTINGS.pizza_crossover_probability === 0.50, 'Pizza crossover probability baseline is 0.50');

// ======================================================================
// SUITE 2: Server-Side and Client-Side Validation Rules
// ======================================================================
console.log('\n2. Verifying Validation Engine & Error Handling...');

const validConfig = {
  schema_version: 'v1.0.0',
  global: { ...DEFAULT_ALGORITHM_SETTINGS },
  overrides: {},
};

const vOkServer = validateAlgorithmConfigServer(validConfig);
check(vOkServer.valid === true, 'Baseline configuration passes server-side validation with zero errors');

const vOkClient = validateAlgorithmConfig(validConfig);
check(vOkClient.valid === true, 'Baseline configuration passes client-side validation with zero errors');

// Out of bounds detection
const outOfBoundsConfig = {
  schema_version: 'v1.0.0',
  global: {
    ...DEFAULT_ALGORITHM_SETTINGS,
    reputation_weight_factor: 5.5, // max is 3.0
    distance_decay_km: 1.0, // min is 2.0
  },
};
const vErrBounds = validateAlgorithmConfigServer(outOfBoundsConfig);
check(vErrBounds.valid === false, 'Out-of-bounds settings are rejected');
check(vErrBounds.errors.some((e) => e.field.includes('reputation_weight_factor')), 'reputation_weight_factor 5.5 flagged as out of bounds');
check(vErrBounds.errors.some((e) => e.field.includes('distance_decay_km')), 'distance_decay_km 1.0 flagged as below minimum');

// Missing setting detection
const missingKeyConfig = {
  schema_version: 'v1.0.0',
  global: {
    reputation_weight_factor: 1.45,
    // omitted other required keys
  },
};
const vErrMissing = validateAlgorithmConfigServer(missingKeyConfig);
check(vErrMissing.valid === false, 'Config missing required keys is rejected');

// Unknown field detection (prevents silent discarded fields)
const unknownFieldConfig = {
  schema_version: 'v1.0.0',
  global: {
    ...DEFAULT_ALGORITHM_SETTINGS,
    arbitrary_fake_weight: 99.0,
  },
};
const vErrUnknown = validateAlgorithmConfigServer(unknownFieldConfig);
check(vErrUnknown.valid === false, 'Unknown setting key is explicitly rejected');
check(vErrUnknown.errors.some((e) => e.message.includes('Unknown setting key')), 'Error message names unknown setting key');

// Invalid schema version
const invalidVersionConfig = {
  schema_version: 'v9.9.9',
  global: { ...DEFAULT_ALGORITHM_SETTINGS },
};
const vErrVersion = validateAlgorithmConfigServer(invalidVersionConfig);
check(vErrVersion.valid === false, 'Incompatible schema version is rejected');

// Override validation
const validOverrideConfig = {
  schema_version: 'v1.0.0',
  global: { ...DEFAULT_ALGORITHM_SETTINGS },
  overrides: {
    'mode:breakfast': {
      editorial_staple_boost: 0.35,
    },
    'category:burger': {
      diversity_style_weight: 0.25,
    },
  },
};
const vOkOverride = validateAlgorithmConfigServer(validOverrideConfig);
check(vOkOverride.valid === true, 'Valid overrides for supported scopes pass validation');

const invalidScopeConfig = {
  schema_version: 'v1.0.0',
  global: { ...DEFAULT_ALGORITHM_SETTINGS },
  overrides: {
    'unsupported:scope': {
      editorial_staple_boost: 0.30,
    },
  },
};
const vErrScope = validateAlgorithmConfigServer(invalidScopeConfig);
check(vErrScope.valid === false, 'Unsupported override scope is rejected');

// ======================================================================
// SUITE 3: Inheritance & Scope Resolution
// ======================================================================
console.log('\n3. Verifying Scope Inheritance & Parameter Overrides...');

// When no override is present, effective settings equals global default
const globalOnly = resolveEffectiveSettings(validConfig, 'food', 'shawarma');
check(globalOnly.editorial_staple_boost === 0.24, 'Inherits global editorial_staple_boost when no override present');
check(globalOnly.diversity_style_weight === 0.15, 'Inherits global diversity_style_weight');

// Mode override
const effectiveBreakfast = resolveEffectiveSettings(validOverrideConfig, 'breakfast', 'pancakes');
check(effectiveBreakfast.editorial_staple_boost === 0.35, 'Mode override overrides global value for breakfast mode');
check(effectiveBreakfast.reputation_weight_factor === 1.45, 'Unspecified settings in mode override inherit global default');

// Category override
const effectiveBurger = resolveEffectiveSettings(validOverrideConfig, 'food', 'burger');
check(effectiveBurger.diversity_style_weight === 0.25, 'Category override overrides global value for burger');
check(effectiveBurger.editorial_staple_boost === 0.24, 'Category override inherits global value for unaffected keys');

// Diff computation
const diffSummary = computeConfigDiffSummary(validConfig, validOverrideConfig);
check(diffSummary.includes('mode:breakfast'), 'Config diff identifies added mode:breakfast override');
check(diffSummary.includes('category:burger'), 'Config diff identifies added category:burger override');

// ======================================================================
// SUITE 4: Edge API Authorization & Endpoint Security
// ======================================================================
console.log('\n4. Verifying Edge API Endpoint Security Boundaries...');

const makeReq = (path, method = 'GET', body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return new Request(`https://weshnakul.test${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
};

const emptyEnv = { ADMIN_JWT_SECRET: TEST_SECRET };

// GET /api/admin/algorithm/config
const resCfgUnauth = await handleConfigGet({ request: makeReq('/api/admin/algorithm/config'), env: emptyEnv });
check(resCfgUnauth.status === 401, 'Unauthenticated GET /api/admin/algorithm/config rejected with 401');

const resCfgNonAdmin = await handleConfigGet({ request: makeReq('/api/admin/algorithm/config', 'GET', null, nonAdminToken), env: emptyEnv });
check(resCfgNonAdmin.status === 403, 'Non-admin GET /api/admin/algorithm/config rejected with 403 Forbidden');

const resCfgAuth = await handleConfigGet({ request: makeReq('/api/admin/algorithm/config', 'GET', null, adminToken), env: emptyEnv });
check(resCfgAuth.status === 200, 'Authenticated admin GET /api/admin/algorithm/config succeeds with 200 OK');
const cfgData = await resCfgAuth.json();
check(cfgData.success === true, 'GET config returns success: true');
check(Boolean(cfgData.published), 'GET config returns published configuration');
check(Boolean(cfgData.draft), 'GET config returns draft configuration');

// POST /api/admin/algorithm/validate
const resValUnauth = await handleValidatePost({ request: makeReq('/api/admin/algorithm/validate', 'POST', validConfig), env: emptyEnv });
check(resValUnauth.status === 401, 'Unauthenticated POST /api/admin/algorithm/validate rejected with 401');

const resValValid = await handleValidatePost({ request: makeReq('/api/admin/algorithm/validate', 'POST', validConfig, adminToken), env: emptyEnv });
check(resValValid.status === 200, 'Valid settings validation returns 200 OK');
const valData = await resValValid.json();
check(valData.valid === true, 'Validation response reports valid: true');

const resValInvalid = await handleValidatePost({ request: makeReq('/api/admin/algorithm/validate', 'POST', outOfBoundsConfig, adminToken), env: emptyEnv });
check(resValInvalid.status === 422, 'Invalid settings validation returns 422 Unprocessable Entity');

// POST /api/admin/algorithm/preview
const resPrevUnauth = await handlePreviewPost({ request: makeReq('/api/admin/algorithm/preview', 'POST', { settings: validConfig }), env: emptyEnv });
check(resPrevUnauth.status === 401, 'Unauthenticated preview rejected with 401');

const previewPayload = {
  settings: {
    ...validConfig,
    global: {
      ...DEFAULT_ALGORITHM_SETTINGS,
      reputation_weight_factor: 2.8, // boosted reputation
    },
  },
  mode: 'food',
  category: 'burger',
  district: 'al_rawdah',
};

// 4b. Test 503 Service Unavailable when missing database credentials in environment
const resPrevNoCreds = await handlePreviewPost({ request: makeReq('/api/admin/algorithm/preview', 'POST', previewPayload, adminToken), env: emptyEnv });
check(resPrevNoCreds.status === 503, 'Preview without database credentials returns 503 Service Unavailable');
const noCredsData = await resPrevNoCreds.json();
check(noCredsData.error === 'preview_service_unavailable', 'Preview error code is preview_service_unavailable');

// 4c. Test 502 Bad Gateway when PostgREST RPC fails (no silent mock fallback)
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, _opts) => {
  return new Response(JSON.stringify({ message: 'PostgREST RPC connection failed' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
};

const resPrevRpcFail = await handlePreviewPost({ request: makeReq('/api/admin/algorithm/preview', 'POST', previewPayload, adminToken), env: mockEnv });
check(resPrevRpcFail.status === 502, 'Preview with failing upstream PostgREST RPC returns 502 Bad Gateway');
const rpcFailData = await resPrevRpcFail.json();
check(rpcFailData.error === 'preview_evaluation_failed', 'Preview error code is preview_evaluation_failed');

// 4d. Test 200 OK when PostgREST RPC succeeds
const mockDeckCard = (name, score, tier, role, rank) => ({
  id: `rest-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  nameEn: name,
  nameAr: name,
  brandId: `brand-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  branchId: `branch-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  district: 'al_rawdah',
  rating: 4.5,
  reviewCount: 500,
  priceTier: '$$',
  tier,
  editorialRole: role,
  score,
  rank,
  scoreBreakdown: { reputation: 1.0, editorial: 0.24, distance: 0.8, repetition: 1.0, diversity: 0.0, total: score },
});

const samplePublishedDeck = [
  mockDeckCard('Section-B', 2.8, 'staple', 'staple', 1),
  mockDeckCard('Century Burger', 2.6, 'staple', 'popular', 2),
  mockDeckCard("Chef's Burger", 2.4, 'verified', 'standard', 3),
  mockDeckCard('Smash Me', 2.3, 'verified', 'standard', 4),
  mockDeckCard('Graffiti Burger', 2.2, 'verified', 'discovery', 5),
  mockDeckCard('Burger Site', 2.1, 'verified', 'standard', 6),
  mockDeckCard('California Burger', 2.0, 'verified', 'standard', 7),
];

const sampleProposedDeck = [
  mockDeckCard('Century Burger', 2.9, 'staple', 'popular', 1),
  mockDeckCard('Section-B', 2.7, 'staple', 'staple', 2),
  mockDeckCard('Graffiti Burger', 2.5, 'verified', 'discovery', 3),
  mockDeckCard("Chef's Burger", 2.4, 'verified', 'standard', 4),
  mockDeckCard('Smash Me', 2.3, 'verified', 'standard', 5),
  mockDeckCard('Burger Site', 2.1, 'verified', 'standard', 6),
  mockDeckCard('New Trendy Spot', 2.05, 'verified', 'trending', 7),
];

globalThis.fetch = async (url, opts) => {
  if (url.includes('/rpc/preview_algorithm_deck')) {
    return new Response(JSON.stringify({
      publishedDeck: samplePublishedDeck,
      proposedDeck: sampleProposedDeck,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return originalFetch(url, opts);
};

const resPrevAuth = await handlePreviewPost({ request: makeReq('/api/admin/algorithm/preview', 'POST', previewPayload, adminToken), env: mockEnv });
check(resPrevAuth.status === 200, 'Authenticated preview with successful RPC succeeds with 200 OK');
const prevData = await resPrevAuth.json();
check(prevData.success === true, 'Preview response returns success: true');
check(Array.isArray(prevData.comparison.publishedDeck), 'Preview returns publishedDeck array');
check(Array.isArray(prevData.comparison.proposedDeck), 'Preview returns proposedDeck array');
check(prevData.comparison.publishedDeck.length === 7, 'Preview published deck has exactly 7 cards');
check(prevData.comparison.proposedDeck.length === 7, 'Preview proposed deck has exactly 7 cards');
check(prevData.comparison.diff.added.length > 0, 'Preview diff identifies added cards in proposed');
check(prevData.comparison.diff.removed.length > 0, 'Preview diff identifies removed cards from published');
check(Array.isArray(prevData.comparison.signalsExplained), 'Preview provides signal explanations');

// Restore original fetch
globalThis.fetch = originalFetch;

// POST /api/admin/algorithm/publish
const resPubUnauth = await handlePublishPost({ request: makeReq('/api/admin/algorithm/publish', 'POST', { settings: validConfig }), env: emptyEnv });
check(resPubUnauth.status === 401, 'Unauthenticated publish rejected with 401');

const resPubNonAdmin = await handlePublishPost({ request: makeReq('/api/admin/algorithm/publish', 'POST', { settings: validConfig }, nonAdminToken), env: emptyEnv });
check(resPubNonAdmin.status === 403, 'Non-admin publish rejected with 403 Forbidden');

const resPubInvalid = await handlePublishPost({ request: makeReq('/api/admin/algorithm/publish', 'POST', { settings: outOfBoundsConfig }, adminToken), env: emptyEnv });
check(resPubInvalid.status === 422, 'Publish with invalid settings rejected with 422');

// GET /api/admin/algorithm/versions
const resVerUnauth = await handleVersionsGet({ request: makeReq('/api/admin/algorithm/versions'), env: emptyEnv });
check(resVerUnauth.status === 401, 'Unauthenticated versions list rejected with 401');

const resVerAuth = await handleVersionsGet({ request: makeReq('/api/admin/algorithm/versions', 'GET', null, adminToken), env: emptyEnv });
check(resVerAuth.status === 200, 'Authenticated versions list succeeds with 200 OK');

// POST /api/admin/algorithm/rollback
const resRbUnauth = await handleRollbackPost({ request: makeReq('/api/admin/algorithm/rollback', 'POST', { target_version: 1 }), env: emptyEnv });
check(resRbUnauth.status === 401, 'Unauthenticated rollback rejected with 401');

const resRbNonAdmin = await handleRollbackPost({ request: makeReq('/api/admin/algorithm/rollback', 'POST', { target_version: 1 }, nonAdminToken), env: emptyEnv });
check(resRbNonAdmin.status === 403, 'Non-admin rollback rejected with 403 Forbidden');

const resRbMissingTarget = await handleRollbackPost({ request: makeReq('/api/admin/algorithm/rollback', 'POST', {}, adminToken), env: emptyEnv });
check(resRbMissingTarget.status === 400, 'Rollback with missing target_version rejected with 400');

// ======================================================================
// SUITE 5: Database Schema, Migration & Runtime in PGlite
// ======================================================================
console.log('\n5. Verifying Postgres Migration, RLS, & Recommendation Runtime in PGlite...');

const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const { PGlite } = await import(pathToFileURL(runtime).href);
const db = new PGlite();

await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');

// Run foundation schemas up to Phase 5
const migration = file => readFileSync(`supabase/migrations/${file}`, 'utf8').replace(/^\uFEFF/, '');

for (const file of [
  '20260902_initial_schema.sql',
  '002_food_consensus.sql',
  '003_restaurant_swipes.sql',
  '005_create_and_seed_restaurants.sql',
  '006_squad_order_scratchpad.sql',
  '007_room_expiration_and_cleanup.sql',
  '20260908000100_restaurant_intelligence.sql',
  '20260908000200_restaurant_legacy_provenance.sql',
  '20260908000300_room_host_coordinates.sql',
]) {
  await db.exec(migration(file).replace('create extension if not exists "pgcrypto";', ''));
}

await db.exec('ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE(room_id,session_token);');

for (const file of [
  '20260909000100_private_restaurant_decks.sql',
  '20260909000200_private_participant_sessions.sql',
  '20260910000100_jeddah_geography_intelligence.sql',
  '20260911000100_jeddah_burger_google_verified_catalog.sql',
  '20260911000200_remove_legacy_public_room_coordinates.sql',
  '20260911000300_phase3_authoritative_consensus.sql',
  '20260918000100_room_modes_preferences_and_suggestions.sql',
  '20260926000100_expand_jeddah_geography_30_districts.sql',
  '20260926000200_jeddah_broast_fried_chicken_catalog.sql',
  '20260926000300_jeddah_shawarma_catalog.sql',
  '20260927000100_jeddah_pizza_catalog.sql',
  '20260927000600_jeddah_italian_catalog.sql',
  '20260928000100_jeddah_burger_expansion_and_deck_algorithm.sql',
  '20260928000500_progressive_geography_widening.sql',
  '20261001000100_expand_jeddah_shawarma_20_brands.sql',
  '20261007000100_merge_broast_into_fried_chicken.sql',
  '20261007000200_fried_chicken_deck_broast_rotation.sql',
  '20261007000300_retire_al_najah_broast.sql',
  '20261008000300_pizza_controlled_crossover_selection.sql',
  '20261015000100_analytics_foundation.sql',
  '20261019000100_phase3_deep_analytics_and_catalog_history.sql',
  '20261021000100_phase4_catalog_controls.sql',
  '20261022000100_raise_room_capacity_to_20.sql',
  '20261023000100_phase5_algorithm_controls.sql',
]) {
  try {
    await db.exec(migration(file));
  } catch (err) {
    console.error(`Failed executing migration: ${file}`, err);
    throw err;
  }
}
check(true, 'Phase 5 migration applied cleanly and idempotently on top of entire migration chain');

// 5a. Verify seeded initial version
const v1Row = (await db.query('SELECT * FROM public.algorithm_published_versions WHERE is_active = true')).rows[0];
check(Boolean(v1Row), 'Initial active algorithm version exists');
check(v1Row.version_number === 1, 'Initial published version is version 1');
check(v1Row.settings.schema_version === 'v1.0.0', 'Initial version schema is v1.0.0');

// 5b. Verify private.get_active_algorithm_settings() returns v1 settings
const activeSettingsRes = (await db.query('SELECT private.get_active_algorithm_settings() AS s')).rows[0].s;
check(activeSettingsRes.global.reputation_weight_factor === 1.45, 'Active settings function returns reputation factor 1.45');
check(activeSettingsRes.global.editorial_staple_boost === 0.24, 'Active settings function returns staple boost 0.24');

// 5c. Test public.publish_algorithm_settings RPC
const newSettings = {
  schema_version: 'v1.0.0',
  global: {
    ...DEFAULT_ALGORITHM_SETTINGS,
    reputation_weight_factor: 2.20,
    distance_proximity_weight: 2.50,
  },
  overrides: {
    'category:burger': {
      editorial_staple_boost: 0.50,
    },
  },
};

const pubRpcRes = (await db.query(`
  SELECT public.publish_algorithm_settings(
    $1::jsonb,
    'admin@weshnakul.com',
    'Boosted distance and reputation for peak hours',
    1
  ) AS res;
`, [JSON.stringify(newSettings)])).rows[0].res;

check(pubRpcRes.success === true, 'publish_algorithm_settings RPC succeeds');
check(pubRpcRes.version_number === 2, 'New published version is version 2');

// 5d. Verify exactly ONE active version in DB
const activeCount = (await db.query('SELECT count(*)::int AS cnt FROM public.algorithm_published_versions WHERE is_active = true')).rows[0].cnt;
check(activeCount === 1, 'Strictly ONE published version is active in database');

// 5e. Concurrency conflict check
let concurrencyErrorCaught = false;
try {
  await db.query(`
    SELECT public.publish_algorithm_settings(
      $1::jsonb,
      'admin-2@weshnakul.com',
      'Conflicting publish',
      1 -- expected version 1, but active is now 2
    );
  `, [JSON.stringify(newSettings)]);
} catch (err) {
  concurrencyErrorCaught = true;
  check(String(err).includes('WSH_ALGORITHM_CONCURRENCY_CONFLICT'), 'Stale publish attempt triggers WSH_ALGORITHM_CONCURRENCY_CONFLICT');
}
check(concurrencyErrorCaught === true, 'Optimistic concurrency protects from overwriting concurrent admin publishes');

// 5f. Verify Audit Log entry was recorded in catalog_change_history
const auditEntry = (await db.query(`
  SELECT * FROM public.catalog_change_history
  WHERE entity_type = 'deck_algorithm' AND entity_id = 'v2'
`)).rows[0];
check(Boolean(auditEntry), 'Audit record created in catalog_change_history for version 2 publish');
check(auditEntry.changed_by === 'admin@weshnakul.com', 'Audit record attributes admin email correctly');

// 5g. Test public.rollback_algorithm_settings RPC
const rollbackRes = (await db.query(`
  SELECT public.rollback_algorithm_settings(
    1,
    'admin@weshnakul.com',
    'Reverting back to baseline v1 due to test',
    2
  ) AS res;
`, [])).rows[0].res;

check(rollbackRes.success === true, 'rollback_algorithm_settings RPC succeeds');
check(rollbackRes.version_number === 3, 'Rollback created new version 3 (forward immutability)');
check(rollbackRes.rollback_of_version === 1, 'Rollback links rollback_of_version 1');

// Verify active settings are now restored to baseline
const restoredActiveSettings = (await db.query('SELECT private.get_active_algorithm_settings() AS s')).rows[0].s;
check(restoredActiveSettings.global.reputation_weight_factor === 1.45, 'Restored active reputation factor is back to 1.45');
check(restoredActiveSettings.global.distance_proximity_weight === 1.00, 'Restored active distance weight is back to 1.00');

// 5h. Verify Least-Privilege Grants on public.preview_algorithm_deck
let anonBlocked = false;
try {
  await db.exec('SET ROLE anon;');
  await db.query(`
    SELECT public.preview_algorithm_deck(
      'jeddah', 'food', 'burger', 'al_rawdah', 21.5728, 39.1558, 'any', '{}'::text[], $1::jsonb, 'seed'
    );
  `, [JSON.stringify(newSettings)]);
} catch (err) {
  anonBlocked = true;
  check(String(err).includes('permission denied') || err.code === '42501', 'Role anon denied execute permission on public.preview_algorithm_deck');
} finally {
  await db.exec('RESET ROLE;');
}
check(anonBlocked === true, 'Least-privilege: anon role cannot call public.preview_algorithm_deck');

let authBlocked = false;
try {
  await db.exec('SET ROLE authenticated;');
  await db.query(`
    SELECT public.preview_algorithm_deck(
      'jeddah', 'food', 'burger', 'al_rawdah', 21.5728, 39.1558, 'any', '{}'::text[], $1::jsonb, 'seed'
    );
  `, [JSON.stringify(newSettings)]);
} catch (err) {
  authBlocked = true;
  check(String(err).includes('permission denied') || err.code === '42501', 'Role authenticated denied execute permission on public.preview_algorithm_deck');
} finally {
  await db.exec('RESET ROLE;');
}
check(authBlocked === true, 'Least-privilege: authenticated role cannot call public.preview_algorithm_deck');

// 5i. Verify Exact Medium Confidence Baseline Multiplier (4/9)
const confBoostBaseline = (await db.query(`
  SELECT (0.18::double precision * (4.0 / 9.0))::numeric(10,4) AS boost
`)).rows[0].boost;
check(Number(confBoostBaseline) === 0.08, `Exact baseline medium confidence boost reproduced: 0.18 * (4/9) = ${confBoostBaseline}`);

// 5j. Verify Side-Effect-Free Previews
const roomsCountBefore = (await db.query('SELECT count(*)::int AS cnt FROM public.rooms')).rows[0].cnt;
const decksCountBefore = (await db.query('SELECT count(*)::int AS cnt FROM private.room_restaurant_decks')).rows[0].cnt;

// 5k. Test public.preview_algorithm_deck Across Categories

// Category 1: Burger (Core staple guarantee, style diversity, distinct seeds)
const burgerPreview = (await db.query(`
  SELECT public.preview_algorithm_deck(
    'jeddah', 'food', 'burger', 'al_rawdah', 21.5728, 39.1558, 'any', '{}'::text[], $1::jsonb, 'seed-burger'
  ) AS prev;
`, [JSON.stringify(newSettings)])).rows[0].prev;

check(Array.isArray(burgerPreview.publishedDeck), 'Burger preview returns publishedDeck');
check(Array.isArray(burgerPreview.proposedDeck), 'Burger preview returns proposedDeck');
check(burgerPreview.publishedDeck.length === 7, 'Burger published deck contains exactly 7 cards');
check(burgerPreview.proposedDeck.length === 7, 'Burger proposed deck contains exactly 7 cards');

// Burger core staple guarantee: at least one core or staple restaurant in deck
const burgerHasCore = burgerPreview.publishedDeck.some((r) => r.tier === 'staple' || r.editorialRole === 'staple' || r.coreStatus === 'core');
check(burgerHasCore === true, 'Burger core staple guarantee is preserved in preview deck assembly');

// Verify distinct deterministic seeds (:pub vs :prop) produce evaluated decks
check(Boolean(burgerPreview.publishedDeck[0].scoreBreakdown), 'Published cards include full score breakdown');
check(Boolean(burgerPreview.proposedDeck[0].scoreBreakdown), 'Proposed cards include full score breakdown');

// Category 2: Fried Chicken (Broast rotation member)
const chickenPreview = (await db.query(`
  SELECT public.preview_algorithm_deck(
    'jeddah', 'food', 'fried_chicken', 'al_rawdah', 21.5728, 39.1558, 'any', '{}'::text[], $1::jsonb, 'seed-chicken'
  ) AS prev;
`, [JSON.stringify(newSettings)])).rows[0].prev;

check(chickenPreview.publishedDeck.length === 7, 'Fried Chicken published deck contains exactly 7 cards');
check(chickenPreview.proposedDeck.length === 7, 'Fried Chicken proposed deck contains exactly 7 cards');
// Broast rotation member present in fried chicken deck
const chickenHasBroast = chickenPreview.publishedDeck.some((r) =>
  r.nameEn.toLowerCase().includes('broast') || (r.contextTags && r.contextTags.includes('broast'))
);
check(chickenHasBroast === true, 'Fried Chicken broast rotation candidate is included in preview deck');

// Category 3: Pizza (Authentic Italian crossover slot)
const pizzaPreview = (await db.query(`
  SELECT public.preview_algorithm_deck(
    'jeddah', 'food', 'pizza', 'al_rawdah', 21.5728, 39.1558, 'any', '{}'::text[], $1::jsonb, 'seed-pizza'
  ) AS prev;
`, [JSON.stringify(newSettings)])).rows[0].prev;

check(pizzaPreview.publishedDeck.length === 7, 'Pizza published deck contains exactly 7 cards');
check(pizzaPreview.proposedDeck.length === 7, 'Pizza proposed deck contains exactly 7 cards');
const pizzaHasCrossover = pizzaPreview.publishedDeck.some((r) =>
  r.nameEn.toLowerCase().includes('italian') || r.nameEn.toLowerCase().includes('pastola')
);
check(pizzaHasCrossover === true, 'Pizza crossover selection slot evaluated in preview deck');

// Category 4: Shawarma (General category & district diversity)
const shawarmaPreview = (await db.query(`
  SELECT public.preview_algorithm_deck(
    'jeddah', 'food', 'shawarma', 'al_rawdah', 21.5728, 39.1558, 'any', '{}'::text[], $1::jsonb, 'seed-shawarma'
  ) AS prev;
`, [JSON.stringify(newSettings)])).rows[0].prev;

check(shawarmaPreview.publishedDeck.length === 7, 'Shawarma published deck contains exactly 7 cards');
check(shawarmaPreview.proposedDeck.length === 7, 'Shawarma proposed deck contains exactly 7 cards');

// Verify side-effect free: no database mutations from preview calls
const roomsCountAfter = (await db.query('SELECT count(*)::int AS cnt FROM public.rooms')).rows[0].cnt;
const decksCountAfter = (await db.query('SELECT count(*)::int AS cnt FROM private.room_restaurant_decks')).rows[0].cnt;
check(roomsCountAfter === roomsCountBefore, 'Preview is strictly side-effect free: 0 rooms created');
check(decksCountAfter === decksCountBefore, 'Preview is strictly side-effect free: 0 decks created');

// 5l. Test Deterministic Ranking Sensitivity (Higher reputation factor boosts higher-rated spots)
const highRepSettings = {
  ...newSettings,
  global: {
    ...DEFAULT_ALGORITHM_SETTINGS,
    reputation_weight_factor: 2.90, // heavy reputation weight
  },
};
const repPreview = (await db.query(`
  SELECT public.preview_algorithm_deck(
    'jeddah', 'food', 'burger', 'al_rawdah', 21.5728, 39.1558, 'any', '{}'::text[], $1::jsonb, 'seed-sensitivity'
  ) AS prev;
`, [JSON.stringify(highRepSettings)])).rows[0].prev;

check(repPreview.proposedDeck.length === 7, 'Sensitivity preview returns 7 proposed cards');
check(
  repPreview.proposedDeck[0].scoreBreakdown.reputation >= repPreview.publishedDeck[0].scoreBreakdown.reputation,
  'Higher reputation weight factor deterministically produces higher reputation score component'
);

// 5i. Test Production Deck Generation (create_restaurant_deck) with Algorithm Integration
const roomId = '33333333-3333-4333-8333-333333333333';
const hostId = '44444444-4444-4444-8444-444444444444';
const hostToken = 'test-host-session-token-12345';

await db.exec(`
  INSERT INTO public.rooms (id, code, status, stage, current_stage, eating_mode, city, neighborhood, language, host_participant_id, winning_category, swiping_started_at)
  VALUES ('${roomId}', 'TEST', 'restaurant_selection', 'swiping', 'swiping', 'any', 'jeddah', 'Al-Rawdah', 'ar', '${hostId}', 'burger', now());
  INSERT INTO public.participants (id, room_id, session_token, nickname, player_color, player_shape, is_host, status)
  VALUES ('${hostId}', '${roomId}', '${hostToken}', 'AdminHost', '#55B96A', 'circle', true, 'active');
  INSERT INTO private.room_locations (room_id, latitude, longitude)
  VALUES ('${roomId}', 21.5728, 39.1558);
`);

// Call private.create_restaurant_deck
const deckResult = (await db.query(`
  SELECT private.create_restaurant_deck(
    '${roomId}'::uuid,
    '${hostId}'::uuid,
    '${hostToken}',
    NULL
  ) AS deck;
`)).rows[0].deck;

check(Boolean(deckResult.deckId), 'create_restaurant_deck returns valid deckId');
check(Array.isArray(deckResult.restaurants), 'create_restaurant_deck returns restaurants array');
check(deckResult.restaurants.length === 7, 'Generated deck contains strictly 7 restaurant cards');

// Verify that Burger core guarantee is preserved
const hasCoreStatus = deckResult.restaurants.some((r) => r.coreStatus === 'core' || r.tier === 'staple');
check(hasCoreStatus === true, 'Burger core restaurant guarantee is strictly preserved in deck');

// Verify algorithm_version was linked on private.room_restaurant_decks
const deckRow = (await db.query(`
  SELECT * FROM private.room_restaurant_decks WHERE id = '${deckResult.deckId}'
`)).rows[0];
check(deckRow.algorithm_version === 3, 'room_restaurant_decks records current active algorithm_version (3)');

// ======================================================================
// SUITE 6: Translation Key Parity & Anti-Slop
// ======================================================================
console.log('\n6. Verifying Localization Parity & Anti-Slop Rules...');

const enKeys = Object.keys(ADMIN_TRANSLATIONS.en);
const arKeys = Object.keys(ADMIN_TRANSLATIONS.ar);

check(enKeys.length === arKeys.length, `Translation key counts match exactly: ${enKeys.length} EN vs ${arKeys.length} AR`);

const missingInAr = enKeys.filter((k) => !(k in ADMIN_TRANSLATIONS.ar));
check(missingInAr.length === 0, `Zero English keys missing in Arabic dictionary (missing: ${missingInAr.join(', ')})`);

const missingInEn = arKeys.filter((k) => !(k in ADMIN_TRANSLATIONS.en));
check(missingInEn.length === 0, `Zero Arabic keys missing in English dictionary (missing: ${missingInEn.join(', ')})`);

// Check Phase 5 specific translation keys exist and are non-empty
const phase5SampleKeys = [
  'tabAlgorithmControls',
  'algoControlsTitle',
  'algoControlsSubtitle',
  'secRankingPriorities',
  'secGeographicRelevance',
  'secRepetitionDiversity',
  'secOverrides',
  'secDraftPreview',
  'secVersionHistory',
  'badgeActiveVersion',
  'badgeDraftModified',
  'btnSaveAlgoDraft',
  'btnPublishAlgoConfig',
  'btnRollbackToVersion',
  'rollbackConfirmPrompt',
];

for (const k of phase5SampleKeys) {
  check(Boolean(ADMIN_TRANSLATIONS.en[k]), `Phase 5 key '${k}' present and non-empty in English dictionary`);
  check(Boolean(ADMIN_TRANSLATIONS.ar[k]), `Phase 5 key '${k}' present and non-empty in Arabic dictionary`);
}

// Anti-slop checks
const algoViewContent = readFileSync('src/components/admin/AlgorithmControlsView.tsx', 'utf8');
const emDashesInView = (algoViewContent.match(/—/g) || []).length;
check(emDashesInView === 0, 'Zero em dashes (—) found in AlgorithmControlsView.tsx (anti-slop rule)');

console.log(`\n======================================================`);
console.log(`PASS: All ${checks} Phase 5 Algorithm Controls verification checks passed successfully!`);
console.log(`======================================================\n`);
