import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// 1. Import edge functions and auth helpers
import {
  createAdminToken,
  verifyAdminToken,
  authenticateAdminRequest,
  getAdminSecret,
} from '../functions/api/admin/_auth.ts';
import {
  handleAdminLogin,
  checkLoginRateLimit,
  _resetLoginRateLimitsForTesting,
} from '../functions/api/admin/login.ts';
import { handleAdminMe } from '../functions/api/admin/me.ts';
import { handleAdminLogout } from '../functions/api/admin/logout.ts';
import { handleAdminAnalytics, calculateDateRange } from '../functions/api/admin/analytics.ts';

console.log('--- WESHNAKUL PHASE 2: ADMIN AUTHENTICATION & READ-ONLY DASHBOARD TEST SUITE ---');

let checks = 0;
const check = (condition, msg) => {
  assert.ok(condition, msg);
  checks++;
  console.log(`  ✓ [Check ${checks}] ${msg}`);
};

const TEST_SECRET = 'test-admin-secret-weshnakul-2026';
const mockEnv = {
  TEST_ADMIN_SECRET: TEST_SECRET,
  ADMIN_JWT_SECRET: TEST_SECRET,
  ADMIN_PASSWORD: 'SuperSecretAdminPassword123!',
  ADMIN_EMAIL: 'admin@weshnakul.com',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  VITE_SUPABASE_URL: 'https://test.supabase.co',
};

// -------------------------------------------------------------
// SUITE 1: Edge Cryptographic Admin Token Minting & Verification
// -------------------------------------------------------------
console.log('\n1. Verifying Edge Cryptographic Token Security & Verification...');

// 1a. getAdminSecret precedence and strict refusal of hardcoded fallbacks
assert.throws(() => getAdminSecret({}), /WSH_MISSING_ADMIN_SECRET/);
check(true, 'getAdminSecret strictly refuses to fall back to hardcoded secrets when env is unconfigured');

const jwtSecretEnv = { ADMIN_JWT_SECRET: 'explicit-jwt-secret' };
check(getAdminSecret(jwtSecretEnv) === 'explicit-jwt-secret', 'getAdminSecret prefers ADMIN_JWT_SECRET');

const srvRoleEnv = { SUPABASE_SERVICE_ROLE_KEY: 'explicit-service-role' };
check(getAdminSecret(srvRoleEnv) === 'explicit-service-role', 'getAdminSecret falls back to SUPABASE_SERVICE_ROLE_KEY if ADMIN_JWT_SECRET absent');

// 1b. Mint admin token
const adminToken = await createAdminToken(
  { sub: 'admin-1', email: 'admin@weshnakul.com', role: 'admin' },
  TEST_SECRET
);
check(typeof adminToken === 'string' && adminToken.split('.').length === 3, 'Admin token is valid 3-part JWT');

// 1c. Verify admin token
const verified = await verifyAdminToken(adminToken, TEST_SECRET);
check(verified.valid === true && verified.payload?.role === 'admin', 'Valid token verifies successfully with role=admin');

// 1d. Tampered token rejected
const tamperedToken = adminToken.slice(0, -6) + 'xxxxxx';
const tamperedResult = await verifyAdminToken(tamperedToken, TEST_SECRET);
check(tamperedResult.valid === false, 'Tampered signature is strictly rejected');

// 1e. Expired token rejected
const expiredToken = await createAdminToken(
  { sub: 'admin-1', email: 'admin@weshnakul.com', role: 'admin', exp: Math.floor(Date.now() / 1000) - 100 },
  TEST_SECRET
);
const expiredResult = await verifyAdminToken(expiredToken, TEST_SECRET);
check(expiredResult.valid === false && expiredResult.error === 'token_expired', 'Expired token is strictly rejected');

// 1f. Token forged with old static fallback secret is rejected
const forgedOldToken = await createAdminToken(
  { sub: 'admin-attacker', email: 'attacker@evil.com', role: 'admin' },
  'weshnakul-admin-fallback-secret-2026'
);
const forgedResult = await verifyAdminToken(forgedOldToken, TEST_SECRET);
check(forgedResult.valid === false && forgedResult.error === 'invalid_signature', 'Token signed with old static fallback is strictly rejected');

// 1g. Token with invalid algorithm (e.g. none) is rejected
const parts = adminToken.split('.');
const badHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
const badAlgToken = `${badHeader}.${parts[1]}.${parts[2]}`;
const badAlgResult = await verifyAdminToken(badAlgToken, TEST_SECRET);
check(badAlgResult.valid === false && badAlgResult.error === 'invalid_token_header', 'Token with non-HS256 header algorithm is rejected');

// -------------------------------------------------------------
// SUITE 2: Strict Authentication & Authorization Boundaries
// -------------------------------------------------------------
console.log('\n2. Verifying Server-Side Authorization Boundaries (401 vs 403 vs 200)...');

// 2a. Unauthenticated request to /api/admin/analytics (NO TOKEN) -> MUST BE 401
const unauthReq = new Request('https://weshnakul.com/api/admin/analytics', {
  method: 'GET',
});
const unauthRes = await handleAdminAnalytics(unauthReq, mockEnv);
check(unauthRes.status === 401, 'Unauthenticated request to /api/admin/analytics returns HTTP 401 Unauthorized');
const unauthJson = await unauthRes.json();
check(unauthJson.error === 'unauthorized', 'Unauthenticated response contains error: unauthorized');

// 2b. Unauthenticated request to /api/admin/me -> MUST BE 401
const unauthMeReq = new Request('https://weshnakul.com/api/admin/me', { method: 'GET' });
const unauthMeRes = await handleAdminMe(unauthMeReq, mockEnv);
check(unauthMeRes.status === 401, 'Unauthenticated request to /api/admin/me returns HTTP 401 Unauthorized');

// 2c. Authenticated NON-ADMIN user (e.g. regular player/user) -> MUST BE 403 FORBIDDEN
const playerToken = await createAdminToken(
  { sub: 'player-42', email: 'player@gmail.com', role: 'player' },
  TEST_SECRET
);
const forbiddenReq = new Request('https://weshnakul.com/api/admin/analytics', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${playerToken}`,
  },
});
const forbiddenRes = await handleAdminAnalytics(forbiddenReq, mockEnv);
check(forbiddenRes.status === 403, 'Authenticated non-admin user is rejected with HTTP 403 Forbidden');
const forbiddenJson = await forbiddenRes.json();
check(forbiddenJson.error === 'forbidden', 'Forbidden response contains error: forbidden');

// 2d. Authenticated NON-ADMIN on /api/admin/me -> MUST BE 403
const forbiddenMeReq = new Request('https://weshnakul.com/api/admin/me', {
  method: 'GET',
  headers: { Authorization: `Bearer ${playerToken}` },
});
const forbiddenMeRes = await handleAdminMe(forbiddenMeReq, mockEnv);
check(forbiddenMeRes.status === 403, 'Non-admin on /api/admin/me returns HTTP 403 Forbidden');

// 2e. Malformed Bearer token -> MUST BE 401
const malformedReq = new Request('https://weshnakul.com/api/admin/analytics', {
  headers: { Authorization: 'Bearer totally-invalid-token' },
});
const malformedRes = await handleAdminAnalytics(malformedReq, mockEnv);
check(malformedRes.status === 401, 'Malformed bearer token returns HTTP 401');

// 2f. Logout endpoint clears cookie
const logoutReq = new Request('https://weshnakul.com/api/admin/logout', { method: 'POST' });
const logoutRes = await handleAdminLogout(logoutReq, mockEnv);
check(logoutRes.status === 200, 'Logout endpoint returns 200 OK');
const cookieHeader = logoutRes.headers.get('set-cookie') || '';
check(cookieHeader.includes('Max-Age=0') && cookieHeader.includes('HttpOnly'), 'Logout sets expired HttpOnly cookie');

// -------------------------------------------------------------
// SUITE 3: Admin Login Endpoint Verification
// -------------------------------------------------------------
console.log('\n3. Verifying /api/admin/login Endpoint...');

// 3a. Missing password
const badLoginReq1 = new Request('https://weshnakul.com/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@weshnakul.com' }),
});
const badLoginRes1 = await handleAdminLogin(badLoginReq1, mockEnv);
check(badLoginRes1.status === 400, 'Login with missing password returns 400 Bad Request');

// 3b. Invalid password
const badLoginReq2 = new Request('https://weshnakul.com/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@weshnakul.com', password: 'WrongPassword!' }),
});
const badLoginRes2 = await handleAdminLogin(badLoginReq2, mockEnv);
check(badLoginRes2.status === 401, 'Login with wrong password returns 401 Invalid Credentials');

// 3c. Correct admin password
const goodLoginReq = new Request('https://weshnakul.com/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@weshnakul.com', password: 'SuperSecretAdminPassword123!' }),
});
const goodLoginRes = await handleAdminLogin(goodLoginReq, mockEnv);
check(goodLoginRes.status === 200, 'Login with correct admin password returns 200 OK');
const goodLoginJson = await goodLoginRes.json();
check(goodLoginJson.success === true && typeof goodLoginJson.token === 'string', 'Returns minted admin session token');
check(goodLoginJson.user?.role === 'admin', 'Returned user identity has role=admin');

// 3d. Verify session with the newly minted login token via /api/admin/me
const meReq = new Request('https://weshnakul.com/api/admin/me', {
  headers: { Authorization: `Bearer ${goodLoginJson.token}` },
});
const meRes = await handleAdminMe(meReq, mockEnv);
check(meRes.status === 200, '/api/admin/me returns 200 OK for verified admin');
const meJson = await meRes.json();
check(meJson.authenticated === true && meJson.user?.role === 'admin', 'Identity verified as authorized admin');

// 3e. ADMIN_EMAIL enforcement: correct password with wrong email -> 401
const wrongEmailReq = new Request('https://weshnakul.com/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'attacker@evil.com', password: 'SuperSecretAdminPassword123!' }),
});
const wrongEmailRes = await handleAdminLogin(wrongEmailReq, mockEnv);
check(wrongEmailRes.status === 401, 'Correct password with wrong email is rejected with 401');

// 3f. ADMIN_EMAIL enforcement: correct password with empty email -> 401
const emptyEmailReq = new Request('https://weshnakul.com/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: '', password: 'SuperSecretAdminPassword123!' }),
});
const emptyEmailRes = await handleAdminLogin(emptyEmailReq, mockEnv);
check(emptyEmailRes.status === 401, 'Correct password with empty email when ADMIN_EMAIL configured is rejected with 401');

// 3g. Server-Side Rate Limiting against repeated password attempts
_resetLoginRateLimitsForTesting();
const ipAttack = '198.51.100.42';
for (let i = 1; i <= 5; i++) {
  const attemptReq = new Request('https://weshnakul.com/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': ipAttack },
    body: JSON.stringify({ email: 'admin@weshnakul.com', password: `Guess${i}` }),
  });
  const res = await handleAdminLogin(attemptReq, mockEnv);
  check(res.status === 401, `Attempt ${i} within rate window fails with 401`);
}

// 6th attempt from same IP must receive HTTP 429 Too Many Requests
const blockedReq = new Request('https://weshnakul.com/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': ipAttack },
  body: JSON.stringify({ email: 'admin@weshnakul.com', password: 'SuperSecretAdminPassword123!' }),
});
const blockedRes = await handleAdminLogin(blockedReq, mockEnv);
check(blockedRes.status === 429, '6th login attempt from same IP is rate-limited with HTTP 429');
check(blockedRes.headers.has('retry-after'), 'HTTP 429 response contains Retry-After header');
const blockedJson = await blockedRes.json();
check(blockedJson.error === 'rate_limit_exceeded', 'HTTP 429 response body contains rate_limit_exceeded error');

// Different IP is not blocked
const otherIpReq = new Request('https://weshnakul.com/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '198.51.100.99' },
  body: JSON.stringify({ email: 'admin@weshnakul.com', password: 'SuperSecretAdminPassword123!' }),
});
const otherIpRes = await handleAdminLogin(otherIpReq, mockEnv);
check(otherIpRes.status === 200, 'Different client IP is allowed and succeeds with 200 OK');
_resetLoginRateLimitsForTesting();

// -------------------------------------------------------------
// SUITE 4: Time Range Calculations
// -------------------------------------------------------------
console.log('\n4. Verifying Accurate Time Range Filter Calculations...');
const fixedNow = new Date('2026-10-16T12:00:00.000Z');

const range24h = calculateDateRange('24h', fixedNow);
check(
  range24h.endTime.getTime() - range24h.startTime.getTime() === 24 * 3600 * 1000,
  '24h range is exactly 24 hours back'
);

const range7d = calculateDateRange('7d', fixedNow);
check(
  range7d.endTime.getTime() - range7d.startTime.getTime() === 7 * 24 * 3600 * 1000,
  '7d range is exactly 7 days back'
);

const range30d = calculateDateRange('30d', fixedNow);
check(
  range30d.endTime.getTime() - range30d.startTime.getTime() === 30 * 24 * 3600 * 1000,
  '30d range is exactly 30 days back'
);

// -------------------------------------------------------------
// SUITE 5: Database Schema, Permissions & RPC in PGlite
// -------------------------------------------------------------
console.log('\n5. Verifying Database RLS, Permissions & get_admin_analytics_summary in PGlite...');

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
check(true, 'Migrations 20261015000100 and 20261016000100 applied cleanly to Postgres');

// 5a. Verify Table RLS: Direct SELECT by anon is blocked
await db.exec('SET ROLE anon;');
try {
  await db.query('SELECT * FROM public.analytics_events LIMIT 1;');
  assert.fail('anon should not be allowed to SELECT from analytics_events');
} catch (err) {
  check(err.code === '42501', 'Direct SELECT on public.analytics_events denied for anon (42501)');
}

// 5b. Direct SELECT by authenticated non-admin is blocked
await db.exec('SET ROLE authenticated;');
try {
  await db.query('SELECT * FROM public.analytics_events LIMIT 1;');
  assert.fail('authenticated should not be allowed to SELECT from analytics_events');
} catch (err) {
  check(err.code === '42501', 'Direct SELECT on public.analytics_events denied for authenticated (42501)');
}

// 5c. Execution of get_admin_analytics_summary by anon is blocked
await db.exec('SET ROLE anon;');
try {
  await db.query('SELECT public.get_admin_analytics_summary();');
  assert.fail('anon should not be allowed to execute get_admin_analytics_summary');
} catch (err) {
  check(err.code === '42501', 'Execution of get_admin_analytics_summary denied for anon (42501)');
}

// 5d. Execution of get_admin_analytics_summary by authenticated is blocked
await db.exec('SET ROLE authenticated;');
try {
  await db.query('SELECT public.get_admin_analytics_summary();');
  assert.fail('authenticated should not be allowed to execute get_admin_analytics_summary');
} catch (err) {
  check(err.code === '42501', 'Execution of get_admin_analytics_summary denied for authenticated (42501)');
}

// Reset role to database owner for catalog and privilege inspection
await db.exec('RESET ROLE;');

// 5e. Function definition inspection: STABLE, SECURITY DEFINER, search_path = pg_catalog
const procInfo = await db.query(`
  SELECT provolatile, prosecdef, proconfig
  FROM pg_proc
  WHERE proname = 'get_admin_analytics_summary';
`);
check(procInfo.rows[0]?.provolatile === 's', 'get_admin_analytics_summary is explicitly marked STABLE (provolatile = s)');
check(procInfo.rows[0]?.prosecdef === true, 'get_admin_analytics_summary is marked SECURITY DEFINER');
check(
  Array.isArray(procInfo.rows[0]?.proconfig) && procInfo.rows[0].proconfig.some(c => c.includes('search_path=pg_catalog')),
  'get_admin_analytics_summary enforces search_path = pg_catalog'
);

// 5f. Confirm no column-level privileges exist for anon, authenticated, or PUBLIC
const colPrivs = await db.query(`
  SELECT grantee, table_name, column_name, privilege_type
  FROM information_schema.column_privileges
  WHERE table_name = 'analytics_events' AND grantee IN ('anon', 'authenticated', 'PUBLIC');
`);
check(colPrivs.rows.length === 0, 'No column-level privileges on analytics_events exist for anon, authenticated, or PUBLIC');

// 5g. Confirm only service_role (and postgres owner) can execute get_admin_analytics_summary
const routinePrivs = await db.query(`
  SELECT grantee, routine_name, privilege_type
  FROM information_schema.routine_privileges
  WHERE routine_name = 'get_admin_analytics_summary';
`);
const routineGrantees = routinePrivs.rows.map(r => r.grantee);
check(
  routineGrantees.length === 2 && routineGrantees.includes('service_role') && routineGrantees.includes('postgres'),
  'get_admin_analytics_summary EXECUTE grant is strictly limited to service_role and owner'
);

// 5h. Ingest verified realistic analytics events via record_analytics_events as service_role
await db.exec('SET ROLE service_role;');

const testEvents = [
  // 3 app sessions
  {
    eventId: '00000000-0000-4000-8000-000000000001',
    eventType: 'app_session_start',
    eventTime: '2026-10-16T10:00:00Z',
    anonymousId: '11111111-1111-4111-8111-111111111111',
    payload: { locale: 'ar' },
  },
  {
    eventId: '00000000-0000-4000-8000-000000000002',
    eventType: 'app_session_start',
    eventTime: '2026-10-16T10:05:00Z',
    anonymousId: '22222222-2222-4222-8222-222222222222',
    payload: { locale: 'ar' },
  },
  {
    eventId: '00000000-0000-4000-8000-000000000003',
    eventType: 'app_session_start',
    eventTime: '2026-10-16T10:10:00Z',
    anonymousId: '11111111-1111-4111-8111-111111111111', // same visitor second visit
    payload: { locale: 'en' },
  },
  // 1 room create success
  {
    eventId: '00000000-0000-4000-8000-000000000004',
    eventType: 'room_create_success',
    eventTime: '2026-10-16T10:12:00Z',
    roomId: '33333333-3333-4333-8333-333333333333',
    roomCode: 'A7K2',
    eatingMode: 'delivery',
    roomMode: 'food',
    district: 'Al-Rawdah',
    payload: { city: 'jeddah' },
  },
  // 1 room join success
  {
    eventId: '00000000-0000-4000-8000-000000000005',
    eventType: 'room_join_success',
    eventTime: '2026-10-16T10:15:00Z',
    roomId: '33333333-3333-4333-8333-333333333333',
    roomCode: 'A7K2',
    payload: { isRejoin: false },
  },
  // 2 swipes (1 YES, 1 NO)
  {
    eventId: '00000000-0000-4000-8000-000000000006',
    eventType: 'restaurant_swipe',
    eventTime: '2026-10-16T10:20:00Z',
    roomId: '33333333-3333-4333-8333-333333333333',
    category: 'burger',
    payload: { restaurantId: 'section_b_burger', vote: 'YES' },
  },
  {
    eventId: '00000000-0000-4000-8000-000000000007',
    eventType: 'restaurant_swipe',
    eventTime: '2026-10-16T10:21:00Z',
    roomId: '33333333-3333-4333-8333-333333333333',
    category: 'burger',
    payload: { restaurantId: 'chef_burger', vote: 'NO' },
  },
  // 1 mini-game started & 1 completed
  {
    eventId: '00000000-0000-4000-8000-000000000008',
    eventType: 'minigame_started',
    eventTime: '2026-10-16T10:25:00Z',
    roomId: '33333333-3333-4333-8333-333333333333',
    payload: { gameType: 'captain_roulette' },
  },
  {
    eventId: '00000000-0000-4000-8000-000000000009',
    eventType: 'minigame_completed',
    eventTime: '2026-10-16T10:26:00Z',
    roomId: '33333333-3333-4333-8333-333333333333',
    payload: { gameType: 'captain_roulette', outcomeRestaurantId: 'section_b_burger' },
  },
  // 1 decision winner matched
  {
    eventId: '00000000-0000-4000-8000-000000000010',
    eventType: 'decision_winner_matched',
    eventTime: '2026-10-16T10:27:00Z',
    roomId: '33333333-3333-4333-8333-333333333333',
    category: 'burger',
    payload: { restaurantId: 'section_b_burger', resolutionMethod: 'captain_roulette' },
  },
  // 1 outbound delivery click
  {
    eventId: '00000000-0000-4000-8000-000000000011',
    eventType: 'outbound_delivery_click',
    eventTime: '2026-10-16T10:30:00Z',
    roomId: '33333333-3333-4333-8333-333333333333',
    payload: { restaurantId: 'section_b_burger', platform: 'keeta' },
  },
];

const ingestRes = await db.query(
  'SELECT public.record_analytics_events($1) as result;',
  [JSON.stringify(testEvents)]
);
check(ingestRes.rows[0].result.inserted === 11, 'Successfully ingested 11 sample events via record_analytics_events');

// Deduplication check: re-inserting same batch inserts 0
const dedupRes = await db.query(
  'SELECT public.record_analytics_events($1) as result;',
  [JSON.stringify(testEvents)]
);
check(dedupRes.rows[0].result.inserted === 0, 'Deduplication holds: re-inserting identical event IDs inserts 0');

// 5f. Execute get_admin_analytics_summary as service_role
const summaryQuery = await db.query(
  'SELECT public.get_admin_analytics_summary($1, $2) as data;',
  ['2026-10-16T00:00:00Z', '2026-10-16T23:59:59Z']
);
const summaryResult = summaryQuery.rows[0].data;
check(summaryResult.success === true, 'get_admin_analytics_summary succeeds for service_role');

const s = summaryResult.summary;
check(s.total_events === 11, `Accurate total_events: expected 11, got ${s.total_events}`);
check(s.total_sessions === 3, `Accurate total_sessions: expected 3, got ${s.total_sessions}`);
check(s.unique_visitors === 2, `Accurate unique_visitors: expected 2, got ${s.unique_visitors}`);
check(s.rooms_created_success === 1, `Accurate rooms_created_success: expected 1, got ${s.rooms_created_success}`);
check(s.rooms_created_failed === 0, `Accurate rooms_created_failed: expected 0, got ${s.rooms_created_failed}`);
check(s.rooms_joined_success === 1, `Accurate rooms_joined_success: expected 1, got ${s.rooms_joined_success}`);
check(s.total_swipes === 2, `Accurate total_swipes: expected 2, got ${s.total_swipes}`);
check(s.total_matches === 1, `Accurate total_matches: expected 1, got ${s.total_matches}`);
check(s.total_minigames_started === 1, `Accurate minigames_started: expected 1, got ${s.total_minigames_started}`);
check(s.total_minigames_completed === 1, `Accurate minigames_completed: expected 1, got ${s.total_minigames_completed}`);
check(s.total_delivery_clicks === 1, `Accurate delivery_clicks: expected 1, got ${s.total_delivery_clicks}`);

// Breakdowns check
const b = summaryResult.breakdowns;
const topWinner = b.top_winning_restaurants[0];
check(topWinner?.restaurant_id === 'section_b_burger' && topWinner?.wins_count === 1, 'Top winner correctly identifies section_b_burger with 1 win');

const swipeVotes = b.swipes_by_vote;
check(swipeVotes.find(v => v.vote === 'YES')?.count === 1, 'Swipes by vote records 1 YES');
check(swipeVotes.find(v => v.vote === 'NO')?.count === 1, 'Swipes by vote records 1 NO');

const minigames = b.minigames;
check(minigames.find(g => g.game_type === 'captain_roulette')?.started_count === 1, 'Captain roulette recorded 1 start');
check(minigames.find(g => g.game_type === 'captain_roulette')?.completed_count === 1, 'Captain roulette recorded 1 completion');

check(summaryResult.recent_events.length === 11, 'Recent events feed returned all 11 events');
check(summaryResult.recent_events[0].event_type === 'outbound_delivery_click', 'Recent events sorted by event_time DESC');
check(!('district' in summaryResult.recent_events[0]), 'Recent events explicitly excludes district property');

// -------------------------------------------------------------
// SUITE 6: Verification of No Browser Credential Leakage
// -------------------------------------------------------------
console.log('\n6. Verifying No Browser Service-Role Credential Leakage...');

const srcFiles = ['src/App.tsx', 'src/lib/supabase.ts', 'src/services/adminService.ts', 'src/components/admin/AdminDashboard.tsx'];
for (const file of srcFiles) {
  const content = readFileSync(file, 'utf8');
  assert.ok(!content.includes('SUPABASE_SERVICE_ROLE_KEY'), `File ${file} does NOT reference SUPABASE_SERVICE_ROLE_KEY`);
}
check(true, 'Zero references to SUPABASE_SERVICE_ROLE_KEY in frontend client files');

console.log(`\n======================================================`);
console.log(`PASS: All ${checks} Phase 2 Admin & Analytics checks passed successfully!`);
console.log(`======================================================\n`);
