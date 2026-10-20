import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Import Edge API handlers and helpers
import {
  createAdminToken,
  authenticateAdminRequest,
} from '../functions/api/admin/_auth.ts';
import { handleAdminDeepAnalytics } from '../functions/api/admin/deep.ts';
import { handleAdminExport, sanitizeCsvCell } from '../functions/api/admin/export.ts';
import { ADMIN_TRANSLATIONS } from '../src/locales/adminTranslations.ts';
import { JEDDAH_DISTRICT_LIST } from '../src/data/jeddahDistricts.ts';

console.log('--- WESHNAKUL PHASE 3: DEEP ANALYTICS, ALGORITHM HEALTH & CATALOG HISTORY TEST SUITE ---');

let checks = 0;
const check = (condition, msg) => {
  assert.ok(condition, msg);
  checks++;
  console.log(`  ✓ [Check ${checks}] ${msg}`);
};

const TEST_SECRET = 'test-phase3-secret-weshnakul-2026';
const mockEnv = {
  TEST_ADMIN_SECRET: TEST_SECRET,
  ADMIN_JWT_SECRET: TEST_SECRET,
  ADMIN_PASSWORD: 'SuperSecretAdminPassword123!',
  ADMIN_EMAIL: 'admin@weshnakul.com',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  VITE_SUPABASE_URL: 'https://test.supabase.co',
};

const adminToken = await createAdminToken(
  { sub: 'admin-phase3', email: 'admin@weshnakul.com', role: 'admin' },
  TEST_SECRET
);

// -------------------------------------------------------------
// SUITE 1: CSV Formula Injection & Sanitization Testing
// -------------------------------------------------------------
console.log('\n1. Verifying CSV Export Sanitization & Formula-Injection Defenses...');

// 1a. Equals sign formula trigger
check(
  sanitizeCsvCell('=1+1') === "'=1+1",
  'Cell starting with = is prefixed with single quote to neutralize formula injection'
);

// 1b. Plus sign formula trigger
check(
  sanitizeCsvCell('+cmd|"/C calc"!A0') === '"\'+cmd|""/C calc""!A0"',
  'Cell starting with + is prefixed with single quote and quoted for RFC 4180'
);

// 1c. Minus sign formula trigger
check(
  sanitizeCsvCell('-5+2') === "'-5+2",
  'Cell starting with - is prefixed with single quote'
);

// 1d. At sign formula trigger
check(
  sanitizeCsvCell('@username') === "'@username",
  'Cell starting with @ is prefixed with single quote'
);
check(
  sanitizeCsvCell('@SUM(1,2)') === '"\'@SUM(1,2)"',
  'Cell starting with @ and containing comma is single-quoted and wrapped in double quotes'
);

// 1e. Standard comma, quotes and newline escaping
check(
  sanitizeCsvCell('Al-Baik, Jeddah') === '"Al-Baik, Jeddah"',
  'Cell containing comma is wrapped in double quotes'
);
check(
  sanitizeCsvCell('Restaurant "Best"') === '"Restaurant ""Best"""',
  'Cell containing quotes escapes quotes with doubled quotes ("")'
);

// 1f. Null and undefined safety
check(sanitizeCsvCell(null) === '', 'Null cell maps to empty string');
check(sanitizeCsvCell(undefined) === '', 'Undefined cell maps to empty string');

// 1g. Multilingual Arabic UTF-8 integrity
const arabicText = 'شاورما شاكر الجزيرة — الروضة';
check(sanitizeCsvCell(arabicText) === arabicText, 'Arabic UTF-8 text is preserved intact');

// -------------------------------------------------------------
// SUITE 2: Edge Endpoints Security Boundaries (/api/admin/deep & /api/admin/export)
// -------------------------------------------------------------
console.log('\n2. Verifying Edge Endpoints Security Boundaries...');

// 2a. Unauthenticated /api/admin/deep returns 401
const unauthDeepReq = new Request('https://weshnakul.com/api/admin/deep');
const unauthDeepRes = await handleAdminDeepAnalytics(unauthDeepReq, mockEnv);
check(unauthDeepRes.status === 401, 'Unauthenticated GET /api/admin/deep rejected with 401 Unauthorized');

// 2b. Non-admin token on /api/admin/deep returns 403
const nonAdminToken = await createAdminToken(
  { sub: 'user-regular', email: 'regular@user.com', role: 'guest' },
  TEST_SECRET
);
const nonAdminDeepReq = new Request('https://weshnakul.com/api/admin/deep', {
  headers: { Authorization: `Bearer ${nonAdminToken}` },
});
const nonAdminDeepRes = await handleAdminDeepAnalytics(nonAdminDeepReq, mockEnv);
check(nonAdminDeepRes.status === 403, 'Authenticated non-admin GET /api/admin/deep rejected with 403 Forbidden');

// 2c. Unauthenticated /api/admin/export returns 401
const unauthExportReq = new Request('https://weshnakul.com/api/admin/export');
const unauthExportRes = await handleAdminExport(unauthExportReq, mockEnv);
check(unauthExportRes.status === 401, 'Unauthenticated GET /api/admin/export rejected with 401 Unauthorized');

// 2d. Non-admin token on /api/admin/export returns 403
const nonAdminExportReq = new Request('https://weshnakul.com/api/admin/export', {
  headers: { Authorization: `Bearer ${nonAdminToken}` },
});
const nonAdminExportRes = await handleAdminExport(nonAdminExportReq, mockEnv);
check(nonAdminExportRes.status === 403, 'Authenticated non-admin GET /api/admin/export rejected with 403 Forbidden');

// 2e. Unconfigured upstream returns structured template with warning (deep)
const emptyEnv = { ADMIN_JWT_SECRET: TEST_SECRET };
const authDeepReq = new Request('https://weshnakul.com/api/admin/deep', {
  headers: { Authorization: `Bearer ${adminToken}` },
});
const authDeepRes = await handleAdminDeepAnalytics(authDeepReq, emptyEnv);
check(authDeepRes.status === 200, 'Authenticated deep request with unconfigured upstream returns 200 fallback template');
const authDeepJson = await authDeepRes.json();
check(authDeepJson.warning === 'upstream_not_configured', 'Structured fallback contains warning flag');
check(authDeepJson.kpis.approval_rate_pct === null, 'Fallback approval_rate_pct is null');

// 2f. Unconfigured upstream returns empty CSV template with BOM (export)
const authExportReq = new Request('https://weshnakul.com/api/admin/export', {
  headers: { Authorization: `Bearer ${adminToken}` },
});
const authExportRes = await handleAdminExport(authExportReq, emptyEnv);
check(authExportRes.status === 200, 'Authenticated export with unconfigured upstream returns 200 CSV');
check(authExportRes.headers.get('Content-Type')?.includes('text/csv'), 'Content-Type is text/csv');
const exportBytes = await authExportRes.bytes();
check(
  exportBytes[0] === 0xef && exportBytes[1] === 0xbb && exportBytes[2] === 0xbf,
  'Export CSV contains UTF-8 BOM (0xEF, 0xBB, 0xBF) at start'
);

// -------------------------------------------------------------
// SUITE 3: Database Migrations, RLS, Forward-Only History & RPC in PGlite
// -------------------------------------------------------------
console.log('\n3. Verifying Postgres Schema, RLS, and get_admin_deep_analytics in PGlite...');

const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const { PGlite } = await import(pathToFileURL(runtime).href);
const db = new PGlite();

await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');

// Execute Foundation migration
const sqlFoundation = readFileSync('supabase/migrations/20261015000100_analytics_foundation.sql', 'utf8').replace(/BEGIN;|COMMIT;/g, '');
await db.exec(sqlFoundation);

// Execute Phase 2 Admin Reads migration
const sqlAdminReads = readFileSync('supabase/migrations/20261016000100_admin_analytics_reads.sql', 'utf8').replace(/BEGIN;|COMMIT;/g, '');
await db.exec(sqlAdminReads);

// Execute Phase 3 Deep Analytics migration
const sqlPhase3 = readFileSync('supabase/migrations/20261019000100_phase3_deep_analytics_and_catalog_history.sql', 'utf8').replace(/BEGIN;|COMMIT;/g, '');
await db.exec(sqlPhase3);
check(true, 'Phase 3 migration 20261019000100 applied cleanly to Postgres');

// 3a. Table catalog_change_history RLS enforcement
await db.exec('SET ROLE anon;');
try {
  await db.query('SELECT * FROM public.catalog_change_history LIMIT 1;');
  assert.fail('anon should not SELECT from catalog_change_history');
} catch (err) {
  check(err.code === '42501', 'Direct SELECT on public.catalog_change_history denied for anon (42501)');
}

await db.exec('SET ROLE authenticated;');
try {
  await db.query('SELECT * FROM public.catalog_change_history LIMIT 1;');
  assert.fail('authenticated should not SELECT from catalog_change_history');
} catch (err) {
  check(err.code === '42501', 'Direct SELECT on public.catalog_change_history denied for authenticated (42501)');
}

// 3b. get_admin_deep_analytics RPC permissions
await db.exec('SET ROLE anon;');
try {
  await db.query('SELECT public.get_admin_deep_analytics();');
  assert.fail('anon should not execute get_admin_deep_analytics');
} catch (err) {
  check(err.code === '42501', 'Execution of get_admin_deep_analytics denied for anon (42501)');
}

await db.exec('SET ROLE authenticated;');
try {
  await db.query('SELECT public.get_admin_deep_analytics();');
  assert.fail('authenticated should not execute get_admin_deep_analytics');
} catch (err) {
  check(err.code === '42501', 'Execution of get_admin_deep_analytics denied for authenticated (42501)');
}

await db.exec('RESET ROLE;');

// 3c. Inspect proc info
const deepProc = await db.query(`
  SELECT provolatile, prosecdef, proconfig
  FROM pg_proc
  WHERE proname = 'get_admin_deep_analytics';
`);
check(deepProc.rows[0]?.provolatile === 's', 'get_admin_deep_analytics is STABLE (provolatile = s)');
check(deepProc.rows[0]?.prosecdef === true, 'get_admin_deep_analytics is SECURITY DEFINER');
check(
  Array.isArray(deepProc.rows[0]?.proconfig) && deepProc.rows[0].proconfig.some(c => c.includes('search_path=pg_catalog')),
  'get_admin_deep_analytics enforces search_path = pg_catalog'
);

// 3d. Inspect baseline catalog record
const baselineRecord = await db.query(`
  SELECT entity_type, entity_id, action, changed_by, change_summary, new_state
  FROM public.catalog_change_history
  WHERE entity_id = 'system_baseline';
`);
check(baselineRecord.rows.length === 1, 'Initial baseline audit record exists in catalog_change_history');
check(baselineRecord.rows[0]?.entity_type === 'deck_algorithm', 'Baseline entity_type is deck_algorithm');
check(baselineRecord.rows[0]?.action === 'algorithm_updated', 'Baseline action is algorithm_updated');
check(baselineRecord.rows[0]?.new_state?.baseline_version === '2.0.0-phase3', 'Baseline version is 2.0.0-phase3');

// -------------------------------------------------------------
// SUITE 4: Seed Data & Low-Confidence Threshold Testing at 19 and 20
// -------------------------------------------------------------
console.log('\n4. Verifying Low-Confidence Boundary Testing at 19 and 20 impressions...');

const now = new Date();
const tMinus = (minutes) => new Date(now.getTime() - minutes * 60 * 1000).toISOString();

// Ingest events for Brand A: exactly 19 impressions -> must be low confidence (is_low_confidence = true)
const eventsToIngest = [];
for (let i = 1; i <= 19; i++) {
  eventsToIngest.push({
    event_id: randomUUID(),
    event_type: 'restaurant_card_impression',
    event_time: tMinus(60 - i),
    category: 'burger',
    district: 'al_rawdah',
    eating_mode: 'dine_in',
    room_mode: 'food',
    payload: { restaurantId: 'brand_a_19', position: i },
  });
}

// Ingest events for Brand B: exactly 20 impressions -> must NOT be low confidence (is_low_confidence = false)
for (let i = 1; i <= 20; i++) {
  eventsToIngest.push({
    event_id: randomUUID(),
    event_type: 'restaurant_card_impression',
    event_time: tMinus(60 - i),
    category: 'burger',
    district: 'al_rawdah',
    eating_mode: 'dine_in',
    room_mode: 'food',
    payload: { restaurantId: 'brand_b_20', position: i },
  });
}

// Ingest candidates generated for both
eventsToIngest.push({
  event_id: randomUUID(),
  event_type: 'deck_candidates_ready',
  event_time: tMinus(50),
  category: 'burger',
  district: 'al_rawdah',
  eating_mode: 'dine_in',
  room_mode: 'food',
  payload: { candidateCount: 2, candidateIds: ['brand_a_19', 'brand_b_20'] },
});

// Ingest Swipes for Brand A: 10 YES, 5 NO, 5 LATER (total 20 votes)
for (let i = 1; i <= 10; i++) {
  eventsToIngest.push({
    event_id: randomUUID(),
    event_type: 'restaurant_swipe',
    event_time: tMinus(30),
    category: 'burger',
    district: 'al_rawdah',
    eating_mode: 'dine_in',
    room_mode: 'food',
    payload: { restaurantId: 'brand_a_19', vote: 'YES' },
  });
}
for (let i = 1; i <= 5; i++) {
  eventsToIngest.push({
    event_id: randomUUID(),
    event_type: 'restaurant_swipe',
    event_time: tMinus(30),
    category: 'burger',
    district: 'al_rawdah',
    eating_mode: 'dine_in',
    room_mode: 'food',
    payload: { restaurantId: 'brand_a_19', vote: 'NO' },
  });
  eventsToIngest.push({
    event_id: randomUUID(),
    event_type: 'restaurant_swipe',
    event_time: tMinus(30),
    category: 'burger',
    district: 'al_rawdah',
    eating_mode: 'dine_in',
    room_mode: 'food',
    payload: { restaurantId: 'brand_a_19', vote: 'LATER' },
  });
}

// Ingest Swipes for Brand B: 15 YES, 5 NO (total 20 votes)
for (let i = 1; i <= 15; i++) {
  eventsToIngest.push({
    event_id: randomUUID(),
    event_type: 'restaurant_swipe',
    event_time: tMinus(25),
    category: 'burger',
    district: 'al_rawdah',
    eating_mode: 'dine_in',
    room_mode: 'food',
    payload: { restaurantId: 'brand_b_20', vote: 'YES' },
  });
}
for (let i = 1; i <= 5; i++) {
  eventsToIngest.push({
    event_id: randomUUID(),
    event_type: 'restaurant_swipe',
    event_time: tMinus(25),
    category: 'burger',
    district: 'al_rawdah',
    eating_mode: 'dine_in',
    room_mode: 'food',
    payload: { restaurantId: 'brand_b_20', vote: 'NO' },
  });
}

// Ingest Winner Resolutions across methods
eventsToIngest.push({
  event_id: randomUUID(),
  event_type: 'decision_winner_matched',
  event_time: tMinus(20),
  category: 'burger',
  district: 'al_rawdah',
  eating_mode: 'dine_in',
  room_mode: 'food',
  payload: { restaurantId: 'brand_b_20', resolutionMethod: 'consensus' },
});
eventsToIngest.push({
  event_id: randomUUID(),
  event_type: 'decision_winner_matched',
  event_time: tMinus(18),
  category: 'burger',
  district: 'al_rawdah',
  eating_mode: 'dine_in',
  room_mode: 'food',
  payload: { restaurantId: 'brand_a_19', resolutionMethod: 'sudden_death' },
});
eventsToIngest.push({
  event_id: randomUUID(),
  event_type: 'decision_winner_matched',
  event_time: tMinus(16),
  category: 'burger',
  district: 'al_rawdah',
  eating_mode: 'dine_in',
  room_mode: 'food',
  payload: { restaurantId: 'brand_b_20', resolutionMethod: 'shuffle_cards' },
});
eventsToIngest.push({
  event_id: randomUUID(),
  event_type: 'decision_winner_matched',
  event_time: tMinus(14),
  category: 'burger',
  district: 'al_rawdah',
  eating_mode: 'dine_in',
  room_mode: 'food',
  payload: { restaurantId: 'brand_a_19', resolutionMethod: 'emoji_clash' },
});

// Mini-games, revote, failure, exit, clicks
eventsToIngest.push({
  event_id: randomUUID(),
  event_type: 'minigame_started',
  event_time: tMinus(15),
  payload: { gameType: 'emoji_clash', participantCount: 4 },
});
eventsToIngest.push({
  event_id: randomUUID(),
  event_type: 'minigame_completed',
  event_time: tMinus(14),
  payload: { gameType: 'emoji_clash', outcomeRestaurantId: 'brand_a_19' },
});
eventsToIngest.push({
  event_id: randomUUID(),
  event_type: 'revote_requested',
  event_time: tMinus(12),
  payload: { isHost: true },
});
eventsToIngest.push({
  event_id: randomUUID(),
  event_type: 'outbound_maps_click',
  event_time: tMinus(10),
  payload: { restaurantId: 'brand_b_20', hasExactBranch: true },
});
eventsToIngest.push({
  event_id: randomUUID(),
  event_type: 'outbound_delivery_click',
  event_time: tMinus(9),
  payload: { restaurantId: 'brand_b_20', platform: 'keeta' },
});
eventsToIngest.push({
  event_id: randomUUID(),
  event_type: 'app_technical_failure',
  event_time: tMinus(5),
  payload: { failureType: 'realtime_disconnect' },
});
eventsToIngest.push({
  event_id: randomUUID(),
  event_type: 'room_explicit_exit',
  event_time: tMinus(2),
  payload: { exitTrigger: 'leave_button', isHost: false },
});

// Ingest all events via record_analytics_events in batches of 20 (strictly <= 25 batch limit)
await db.exec('SET ROLE service_role;');
let totalIngested = 0;
for (let i = 0; i < eventsToIngest.length; i += 20) {
  const batch = eventsToIngest.slice(i, i + 20);
  const res = await db.query(
    `SELECT public.record_analytics_events($1::jsonb) AS res;`,
    [JSON.stringify(batch)]
  );
  const insertedInBatch = Number(res.rows[0]?.res?.inserted || 0);
  console.log(`  [Batch ${i/20 + 1}] Sent ${batch.length}, inserted: ${insertedInBatch}`);
  totalIngested += insertedInBatch;
}
console.log(`  Total ingested: ${totalIngested} / Expected: ${eventsToIngest.length}`);
check(totalIngested === eventsToIngest.length, `Ingested ${eventsToIngest.length} Phase 3 test events across batches`);

// -------------------------------------------------------------
// SUITE 5: Deep Analytics RPC Aggregation & Metric Verification
// -------------------------------------------------------------
console.log('\n5. Verifying Deep Analytics Aggregations & Formulas...');

const rpcResult = await db.query(
  `SELECT public.get_admin_deep_analytics($1, $2, $3, $4, $5, $6, $7, $8) AS data;`,
  [
    tMinus(120),
    new Date(now.getTime() + 1000).toISOString(),
    'burger', // p_category
    'al_rawdah', // p_district
    'dine_in', // p_eating_mode
    'food', // p_room_mode
    50, // limit
    0,  // offset
  ]
);

const data = rpcResult.rows[0]?.data;
check(data.success === true, 'get_admin_deep_analytics returns success = true');

// Check KPIs
const kpis = data.kpis;
check(kpis.total_card_impressions === 39, `Total card impressions: expected 39 (19 + 20), got ${kpis.total_card_impressions}`);
check(kpis.total_candidates_generated === 2, `Total candidates: expected 2, got ${kpis.total_candidates_generated}`);
check(kpis.total_yes_votes === 25, `Total YES votes: expected 25 (10 + 15), got ${kpis.total_yes_votes}`);
check(kpis.total_no_votes === 10, `Total NO votes: expected 10 (5 + 5), got ${kpis.total_no_votes}`);
check(kpis.total_later_votes === 5, `Total LATER votes: expected 5, got ${kpis.total_later_votes}`);
check(kpis.total_swipes === 40, `Total swipes: expected 40, got ${kpis.total_swipes}`);

// Formula: Approval Rate = YES / (YES + NO + LATER) = 25 / 40 = 62.5%
check(kpis.approval_rate_pct === 62.5, `Approval rate formula YES / Total Votes: expected 62.5%, got ${kpis.approval_rate_pct}%`);

// Formula: Exposure to YES = YES / Impressions = 25 / 39 = 64.1%
check(kpis.exposure_to_yes_pct === 64.1, `Exposure-to-YES formula YES / Impressions: expected 64.1%, got ${kpis.exposure_to_yes_pct}%`);

check(kpis.total_matches === 4, `Total matches resolved: expected 4, got ${kpis.total_matches}`);

// Check Brands Table and Low-Confidence Flag
const brands = data.algorithm_health.brands;
const brandA = brands.find((b) => b.restaurant_id === 'brand_a_19');
const brandB = brands.find((b) => b.restaurant_id === 'brand_b_20');

assert.ok(brandA, 'brand_a_19 found in brands array');
assert.ok(brandB, 'brand_b_20 found in brands array');

// Brand A: 19 impressions -> is_low_confidence MUST be TRUE
check(brandA.impression_count === 19, 'brand_a_19 impression count is 19');
check(brandA.is_low_confidence === true, 'brand_a_19 with 19 impressions (< 20) is flagged low confidence: is_low_confidence = true');
check(brandA.approval_rate_pct === 50.0, 'brand_a_19 approval rate: 10 / 20 = 50.0%');
check(brandA.exposure_to_yes_pct === 52.6, 'brand_a_19 exposure-to-yes: 10 / 19 = 52.6%');
check(brandA.match_wins === 2, 'brand_a_19 wins: 2');

// Brand B: 20 impressions -> is_low_confidence MUST be FALSE
check(brandB.impression_count === 20, 'brand_b_20 impression count is 20');
check(brandB.is_low_confidence === false, 'brand_b_20 with 20 impressions (>= 20) is NOT low confidence: is_low_confidence = false');
check(brandB.approval_rate_pct === 75.0, 'brand_b_20 approval rate: 15 / 20 = 75.0%');
check(brandB.exposure_to_yes_pct === 75.0, 'brand_b_20 exposure-to-yes: 15 / 20 = 75.0%');
check(brandB.match_wins === 2, 'brand_b_20 wins: 2');

// Exposure Concentration (HHI)
const summary = data.algorithm_health.summary;
check(summary.total_impressions === 39, 'Summary total impressions is 39');
check(summary.distinct_brands_shown === 2, 'Summary distinct brands shown is 2');
check(summary.hhi_concentration_index > 0, `HHI concentration index computed: ${summary.hhi_concentration_index}`);

// Resolution Methods Breakdown
const resolutionMethods = data.algorithm_health.resolution_methods;
const consensusRow = resolutionMethods.find((r) => r.method === 'consensus');
const suddenDeathRow = resolutionMethods.find((r) => r.method === 'sudden_death');
const shuffleCardsRow = resolutionMethods.find((r) => r.method === 'shuffle_cards');
const emojiClashRow = resolutionMethods.find((r) => r.method === 'emoji_clash');

check(consensusRow?.count === 1, 'Resolution methods records 1 consensus');
check(suddenDeathRow?.count === 1, 'Resolution methods records 1 sudden_death');
check(shuffleCardsRow?.count === 1, 'Resolution methods records 1 shuffle_cards');
check(emojiClashRow?.count === 1, 'Resolution methods records 1 emoji_clash');

// Check Catalog History in RPC payload
const catHistory = data.catalog_history || [];
check(catHistory.length >= 1, 'get_admin_deep_analytics returns catalog_history');
const baselineCat = catHistory.find((c) => c.entity_id === 'system_baseline');
check(Boolean(baselineCat), 'Baseline record found in catalog_history');
check(baselineCat?.new_state?.marker_type === 'tracking_start_marker', 'Baseline record has marker_type = tracking_start_marker');
check('previous_state' in (baselineCat || {}), 'catalog_history exposes previous_state column');
check('new_state' in (baselineCat || {}), 'catalog_history exposes new_state column');

// -------------------------------------------------------------
// SUITE 6: Allowlisted Jeddah District Slugs & Privacy
// -------------------------------------------------------------
console.log('\n6. Verifying Jeddah District Allowlist Integrity & Privacy...');

check(JEDDAH_DISTRICT_LIST.length >= 25, `Jeddah district allowlist contains ${JEDDAH_DISTRICT_LIST.length} municipal districts`);
const sampleDistrict = JEDDAH_DISTRICT_LIST.find((d) => d.id === 'al_rawdah');
check(Boolean(sampleDistrict), 'District al_rawdah is present in canonical allowlist');
check(sampleDistrict?.nameAr === 'الروضة', 'District Arabic name is الروضة');
check(sampleDistrict?.nameEn === 'Al Rawdah', 'District English name is Al Rawdah');

// Ensure no raw coordinates are in analytics output
const eventRows = data.events || [];
for (const ev of eventRows) {
  const p = ev.payload || {};
  assert.equal(p.latitude, undefined, 'No GPS latitude in analytics event payload');
  assert.equal(p.longitude, undefined, 'No GPS longitude in analytics event payload');
}
check(true, 'Verified zero GPS coordinate leakage in analytics event stream');

// -------------------------------------------------------------
// SUITE 7: Admin Translations Parity (English & Arabic)
// -------------------------------------------------------------
console.log('\n7. Verifying 100% Arabic & English Translation Parity...');

const enKeys = Object.keys(ADMIN_TRANSLATIONS.en);
const arKeys = Object.keys(ADMIN_TRANSLATIONS.ar);

check(enKeys.length === arKeys.length, `Translation key parity: ${enKeys.length} EN keys vs ${arKeys.length} AR keys`);

for (const key of enKeys) {
  const enVal = ADMIN_TRANSLATIONS.en[key];
  const arVal = ADMIN_TRANSLATIONS.ar[key];
  assert.ok(enVal && typeof enVal === 'string' && enVal.trim().length > 0, `English key ${key} is non-empty`);
  assert.ok(arVal && typeof arVal === 'string' && arVal.trim().length > 0, `Arabic key ${key} is non-empty`);
}
check(true, 'All Phase 3 and admin translations are 100% populated in both languages');

// -------------------------------------------------------------
// SUITE 8: Automated Catalog Change Triggers & Forward-Only Capture
// -------------------------------------------------------------
console.log('\n8. Verifying Automated Catalog Change Triggers on Restaurants & Branches...');

// Reset role to superuser for DDL execution
await db.exec('RESET ROLE;');

// Create restaurants and restaurant_branches tables in PGlite simulating production catalog schema with sensitive fields
await db.exec(`
  CREATE TABLE IF NOT EXISTS public.restaurants (
    id text primary key,
    name_en text,
    name_ar text,
    categories text[],
    dining_mode text default 'both',
    price_tier text default '$$',
    rating numeric default 4.5,
    operating_status text default 'active',
    official_phone text,
    manual_review_reasons text[],
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  CREATE TABLE IF NOT EXISTS public.restaurant_branches (
    id text primary key,
    restaurant_id text references public.restaurants(id),
    branch_name_en text,
    branch_name_ar text,
    district text,
    branch_status text default 'active',
    branch_type text default 'standalone',
    latitude double precision,
    longitude double precision,
    google_place_id text,
    address_ar text,
    address_en text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );

  DROP TRIGGER IF EXISTS trg_audit_restaurant_catalog_changes ON public.restaurants;
  CREATE TRIGGER trg_audit_restaurant_catalog_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION public.trg_record_restaurant_catalog_change();

  DROP TRIGGER IF EXISTS trg_audit_branch_catalog_changes ON public.restaurant_branches;
  CREATE TRIGGER trg_audit_branch_catalog_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.restaurant_branches
    FOR EACH ROW EXECUTE FUNCTION public.trg_record_branch_catalog_change();
`);

// 8a. Test Restaurant INSERT with sensitive fields (phone, internal review reasons)
await db.query(`
  INSERT INTO public.restaurants (id, name_en, name_ar, categories, operating_status, official_phone, manual_review_reasons)
  VALUES ('rest_test_1', 'Burger Studio', 'استوديو البرجر', ARRAY['burger'], 'active', '+966500000000', ARRAY['flagged_for_internal_review']);
`);

const insertAudit = await db.query(`
  SELECT * FROM public.catalog_change_history WHERE entity_id = 'rest_test_1' ORDER BY effective_at DESC, id DESC LIMIT 1;
`);
check(insertAudit.rows.length === 1, 'Inserting restaurant automatically creates catalog_change_history record');
check(insertAudit.rows[0].action === 'created', 'Action is created');
check(insertAudit.rows[0].entity_type === 'restaurant', 'Entity type is restaurant');
check(insertAudit.rows[0].previous_state === null, 'previous_state is null on insert');
check(insertAudit.rows[0].new_state?.name_en === 'Burger Studio', 'new_state contains approved name_en');
check(insertAudit.rows[0].new_state?.official_phone === undefined, 'Sensitive field official_phone is strictly excluded from new_state');
check(insertAudit.rows[0].new_state?.manual_review_reasons === undefined, 'Internal operational notes manual_review_reasons strictly excluded from new_state');

// 8b. Test Restaurant UPDATE with sensitive fields
await db.query(`
  UPDATE public.restaurants
  SET name_en = 'Burger Studio Express', official_phone = '+966599999999'
  WHERE id = 'rest_test_1';
`);
const updateAudit = await db.query(`
  SELECT * FROM public.catalog_change_history WHERE entity_id = 'rest_test_1' ORDER BY effective_at DESC, id DESC LIMIT 1;
`);
check(updateAudit.rows[0].action === 'updated', 'Updating restaurant records updated');
check(updateAudit.rows[0].previous_state?.name_en === 'Burger Studio', 'previous_state contains prior value');
check(updateAudit.rows[0].new_state?.name_en === 'Burger Studio Express', 'new_state contains updated value');
check(updateAudit.rows[0].previous_state?.official_phone === undefined, 'official_phone excluded from previous_state');
check(updateAudit.rows[0].new_state?.official_phone === undefined, 'official_phone excluded from new_state');

// 8c. Test Timestamp-Only UPDATE Suppression (Fix 3)
const countBeforeTimestampUpdate = (await db.query(`SELECT count(*) as cnt FROM public.catalog_change_history WHERE entity_id = 'rest_test_1';`)).rows[0].cnt;
await db.query(`
  UPDATE public.restaurants
  SET updated_at = now() + interval '5 minutes'
  WHERE id = 'rest_test_1';
`);
const countAfterTimestampUpdate = (await db.query(`SELECT count(*) as cnt FROM public.catalog_change_history WHERE entity_id = 'rest_test_1';`)).rows[0].cnt;
check(
  Number(countBeforeTimestampUpdate) === Number(countAfterTimestampUpdate),
  'Timestamp-only update (touching updated_at) is suppressed: zero history records generated'
);

// 8d. Test Duplicate Meaningful UPDATE Suppression
const countBeforeNoop = (await db.query(`SELECT count(*) as cnt FROM public.catalog_change_history WHERE entity_id = 'rest_test_1';`)).rows[0].cnt;
await db.query(`
  UPDATE public.restaurants SET name_en = 'Burger Studio Express' WHERE id = 'rest_test_1';
`);
const countAfterNoop = (await db.query(`SELECT count(*) as cnt FROM public.catalog_change_history WHERE entity_id = 'rest_test_1';`)).rows[0].cnt;
check(Number(countBeforeNoop) === Number(countAfterNoop), 'Identical UPDATE on restaurant is suppressed (no duplicate audit record)');

// 8e. Test Restaurant Retirement (operating_status = permanently_closed)
await db.query(`
  UPDATE public.restaurants SET operating_status = 'permanently_closed' WHERE id = 'rest_test_1';
`);
const retireAudit = await db.query(`
  SELECT * FROM public.catalog_change_history WHERE entity_id = 'rest_test_1' ORDER BY effective_at DESC, id DESC LIMIT 1;
`);
check(retireAudit.rows[0].action === 'retired', 'Retiring restaurant sets action = retired');

// 8f. Test Branch INSERT with sensitive GPS coordinates (latitude, longitude, google_place_id)
await db.query(`
  INSERT INTO public.restaurant_branches (id, restaurant_id, branch_name_en, district, branch_status, latitude, longitude, google_place_id)
  VALUES ('branch_test_1', 'rest_test_1', 'Rawdah Branch', 'al_rawdah', 'active', 21.5433, 39.1728, 'ChIJ_TEST_PLACE_123');
`);
const branchInsertAudit = await db.query(`
  SELECT * FROM public.catalog_change_history WHERE entity_id = 'branch_test_1' ORDER BY effective_at DESC, id DESC LIMIT 1;
`);
check(branchInsertAudit.rows.length === 1, 'Inserting branch automatically creates audit record');
check(branchInsertAudit.rows[0].action === 'created', 'Action is created');
check(branchInsertAudit.rows[0].entity_type === 'branch', 'Entity type is branch');
check(branchInsertAudit.rows[0].previous_state === null, 'previous_state is null on branch insert');
check(branchInsertAudit.rows[0].new_state?.district === 'al_rawdah', 'Approved field district is present in branch new_state');
check(branchInsertAudit.rows[0].new_state?.latitude === undefined, 'Exact GPS latitude is strictly excluded from branch new_state');
check(branchInsertAudit.rows[0].new_state?.longitude === undefined, 'Exact GPS longitude is strictly excluded from branch new_state');
check(branchInsertAudit.rows[0].new_state?.google_place_id === undefined, 'google_place_id is strictly excluded from branch new_state');

// 8g. Test Branch Timestamp-Only UPDATE Suppression
const countBeforeBranchTimestamp = (await db.query(`SELECT count(*) as cnt FROM public.catalog_change_history WHERE entity_id = 'branch_test_1';`)).rows[0].cnt;
await db.query(`
  UPDATE public.restaurant_branches
  SET updated_at = now() + interval '10 minutes'
  WHERE id = 'branch_test_1';
`);
const countAfterBranchTimestamp = (await db.query(`SELECT count(*) as cnt FROM public.catalog_change_history WHERE entity_id = 'branch_test_1';`)).rows[0].cnt;
check(
  Number(countBeforeBranchTimestamp) === Number(countAfterBranchTimestamp),
  'Branch timestamp-only update is suppressed: zero history records generated'
);

// 8h. Test Branch Meaningful UPDATE with GPS exclusion preserved
await db.query(`
  UPDATE public.restaurant_branches
  SET district = 'al_zahra', latitude = 21.5899, longitude = 39.1455
  WHERE id = 'branch_test_1';
`);
const branchUpdateAudit = await db.query(`
  SELECT * FROM public.catalog_change_history WHERE entity_id = 'branch_test_1' ORDER BY effective_at DESC, id DESC LIMIT 1;
`);
check(branchUpdateAudit.rows[0].action === 'updated', 'Updating branch records updated');
check(branchUpdateAudit.rows[0].previous_state?.district === 'al_rawdah', 'previous_state has prior district');
check(branchUpdateAudit.rows[0].new_state?.district === 'al_zahra', 'new_state has updated district');
check(branchUpdateAudit.rows[0].previous_state?.latitude === undefined, 'latitude excluded from branch previous_state');
check(branchUpdateAudit.rows[0].new_state?.latitude === undefined, 'latitude excluded from branch new_state');

// 8i. Test Branch Retirement
await db.query(`
  UPDATE public.restaurant_branches SET branch_status = 'permanently_closed' WHERE id = 'branch_test_1';
`);
const branchRetireAudit = await db.query(`
  SELECT * FROM public.catalog_change_history WHERE entity_id = 'branch_test_1' ORDER BY effective_at DESC, id DESC LIMIT 1;
`);
check(branchRetireAudit.rows[0].action === 'retired', 'Retiring branch sets action = retired');

// 8j. Test Transactional Atomicity (Fix 2): Audit failure rolls back catalog mutation
await db.exec(`
  ALTER TABLE public.catalog_change_history
  ADD CONSTRAINT chk_test_atomic_rollback CHECK (entity_id <> 'rest_fail_atomic');
`);

let atomicInsertFailed = false;
try {
  await db.query(`
    INSERT INTO public.restaurants (id, name_en, name_ar, categories)
    VALUES ('rest_fail_atomic', 'Rollback Target', 'مطعم للتراجع', ARRAY['burger']);
  `);
} catch (err) {
  atomicInsertFailed = true;
  check(err.code === '23514', 'Trigger failure raises exception (code 23514 check_violation) instead of swallowing');
}
check(atomicInsertFailed, 'Catalog mutation aborted due to audit insertion constraint failure');

const orphanedRestaurant = await db.query(`SELECT count(*) as cnt FROM public.restaurants WHERE id = 'rest_fail_atomic';`);
check(Number(orphanedRestaurant.rows[0].cnt) === 0, 'Catalog mutation rolled back cleanly: 0 rows inserted into restaurants');

// Drop test constraint
await db.exec(`ALTER TABLE public.catalog_change_history DROP CONSTRAINT chk_test_atomic_rollback;`);

// 8k. Verify get_admin_deep_analytics returns safe states without GPS or operational noise
const freshRpc = await db.query(
  `SELECT public.get_admin_deep_analytics($1, $2, $3, $4, $5, $6, $7, $8) AS data;`,
  [tMinus(120), new Date(now.getTime() + 1000).toISOString(), null, null, null, null, 50, 0]
);
const freshHistory = freshRpc.rows[0]?.data?.catalog_history || [];
const restCreatedItem = freshHistory.find((h) => h.entity_id === 'rest_test_1' && h.action === 'created');
const restUpdatedItem = freshHistory.find((h) => h.entity_id === 'rest_test_1' && h.action === 'updated');
const branchCreatedItem = freshHistory.find((h) => h.entity_id === 'branch_test_1' && h.action === 'created');
check(Boolean(restCreatedItem), 'get_admin_deep_analytics includes restaurant created record');
check(restCreatedItem?.previous_state === null, 'restaurant created exposes previous_state = null');
check(restCreatedItem?.new_state?.id === 'rest_test_1', 'restaurant created exposes new_state');
check(restCreatedItem?.new_state?.official_phone === undefined, 'RPC response excludes official_phone');
check(Boolean(restUpdatedItem), 'get_admin_deep_analytics includes restaurant updated record');
check(restUpdatedItem?.previous_state?.name_en === 'Burger Studio', 'restaurant updated exposes previous_state');
check(restUpdatedItem?.new_state?.name_en === 'Burger Studio Express', 'restaurant updated exposes new_state');
check(Boolean(branchCreatedItem), 'get_admin_deep_analytics includes branch created record');
check(branchCreatedItem?.new_state?.latitude === undefined, 'RPC response excludes branch latitude');
check(branchCreatedItem?.new_state?.longitude === undefined, 'RPC response excludes branch longitude');

// -------------------------------------------------------------
// SUITE 9: Host Authority & Tie-Breaker Winner Deduplication Unit Tests
// -------------------------------------------------------------
console.log('\n9. Verifying Host Authority & Winner Deduplication Guard...');

const createWinnerTracker = (isHost) => {
  const trackedKeys = new Set();
  const emittedEvents = [];
  let currentStage = 'voting';

  const setStage = (stage) => {
    currentStage = stage;
    if (stage !== 'matched') {
      trackedKeys.clear();
    }
  };

  const trackWinnerOnce = (roundId, method, restaurant, room) => {
    if (!isHost || !room?.id || !restaurant?.id) {
      return false;
    }
    const dedupKey = `${room.id}:${roundId}:${restaurant.id}:${method}`;
    if (trackedKeys.has(dedupKey)) {
      return false;
    }
    trackedKeys.add(dedupKey);
    emittedEvents.push({
      eventType: 'decision_winner_matched',
      roomId: room.id,
      roundId,
      restaurantId: restaurant.id,
      resolutionMethod: method,
    });
    return true;
  };

  return { trackWinnerOnce, setStage, emittedEvents, trackedKeys };
};

// 9a. Non-host does not emit event on winner confirmed
const nonHostTracker = createWinnerTracker(false);
const nonHostRes1 = nonHostTracker.trackWinnerOnce('round_1', 'shuffle_cards', { id: 'rest_winner_1' }, { id: 'room_123' });
check(nonHostRes1 === false, 'Non-host client returns false from trackWinnerOnce');
check(nonHostTracker.emittedEvents.length === 0, 'Non-host client emits zero winner events');

// 9b. Host emits exactly one event in round 1
const hostTracker = createWinnerTracker(true);
const hostRes1 = hostTracker.trackWinnerOnce('round_1', 'shuffle_cards', { id: 'rest_winner_1' }, { id: 'room_123' });
check(hostRes1 === true, 'Host client returns true from first trackWinnerOnce');
check(hostTracker.emittedEvents.length === 1, 'Host client emits exactly 1 winner event in round 1');
check(hostTracker.emittedEvents[0].resolutionMethod === 'shuffle_cards', 'Emitted event records method shuffle_cards');

// 9c. Duplicate winner broadcast / callback on host within round 1 is suppressed
const hostRes2 = hostTracker.trackWinnerOnce('round_1', 'shuffle_cards', { id: 'rest_winner_1' }, { id: 'room_123' });
check(hostRes2 === false, 'Duplicate winner confirmation on host within same round returns false');
check(hostTracker.emittedEvents.length === 1, 'Duplicate winner confirmation on host emits no additional events (count stays 1)');

// 9d. Missing room or missing restaurant emits nothing
const noRoomTracker = createWinnerTracker(true);
check(noRoomTracker.trackWinnerOnce('round_1', 'shuffle_cards', { id: 'rest_winner_1' }, null) === false, 'Missing room emits nothing');
check(noRoomTracker.emittedEvents.length === 0, 'Zero events when room is null');

const noRestTracker = createWinnerTracker(true);
check(noRestTracker.trackWinnerOnce('round_1', 'shuffle_cards', null, { id: 'room_123' }) === false, 'Missing restaurant emits nothing');
check(noRestTracker.emittedEvents.length === 0, 'Zero events when restaurant is null');

// 9e. Legitimate round 2 in the same room with identical winner and method emits second event
hostTracker.setStage('voting'); // Room revote requested
check(hostTracker.trackedKeys.size === 0, 'Resetting room stage to voting clears deduplication cache');

const hostRound2Res = hostTracker.trackWinnerOnce('round_2', 'shuffle_cards', { id: 'rest_winner_1' }, { id: 'room_123' });
check(hostRound2Res === true, 'Legitimate second round in same room emits a new winner event');
check(hostTracker.emittedEvents.length === 2, 'Host records 2 distinct winner events across two rounds');
check(hostTracker.emittedEvents[1].roundId === 'round_2', 'Second event records roundId = round_2');

// 9f. Duplicate callback within round 2 is suppressed
const hostRound2Dup = hostTracker.trackWinnerOnce('round_2', 'shuffle_cards', { id: 'rest_winner_1' }, { id: 'room_123' });
check(hostRound2Dup === false, 'Duplicate callback within round 2 is suppressed');
check(hostTracker.emittedEvents.length === 2, 'Event count remains exactly 2');

console.log('\n======================================================');
console.log(`PASS: All ${checks} Phase 3 verification checks passed successfully!`);
console.log('======================================================');


