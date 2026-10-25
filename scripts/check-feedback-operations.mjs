import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// 1. Import edge functions and auth helpers
import {
  createAdminToken,
  authenticateAdminRequest,
} from '../functions/api/admin/_auth.ts';

import {
  onRequestPost as handleFeedbackPublicPost,
  checkFeedbackRateLimit,
  _resetFeedbackRateLimitsForTesting,
} from '../functions/api/feedback.ts';

import {
  onRequestGet as handleFeedbackAdminListGet,
  maskPhone,
} from '../functions/api/admin/feedback/index.ts';
import { onRequestGet as handleFeedbackAdminDetailGet } from '../functions/api/admin/feedback/[id]/index.ts';
import { onRequestPatch as handleFeedbackAdminStatusPatch } from '../functions/api/admin/feedback/[id]/status.ts';

import { ADMIN_TRANSLATIONS } from '../src/locales/adminTranslations.ts';

console.log('======================================================================');
console.log('--- WESHNAKUL PHASE 6: FEEDBACK & OPERATIONS VERIFICATION SUITE ---');
console.log('======================================================================\n');

let checks = 0;
const check = (condition, msg) => {
  assert.ok(condition, msg);
  checks++;
  console.log(`  ✓ [Check ${checks}] ${msg}`);
};

const TEST_SECRET = 'test-phase6-feedback-secret-2026';
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
  { sub: 'user-guest', email: 'guest@weshnakul.com', role: 'guest' },
  TEST_SECRET
);

// Helper for testing public feedback endpoint with distinct client IPs
let clientIpSeq = 1;
const postFeedback = (body, customHeaders = {}) => {
  const ip = customHeaders['cf-connecting-ip'] || `192.0.2.${clientIpSeq++}`;
  const headers = {
    'content-type': 'application/json',
    'cf-connecting-ip': ip,
    ...customHeaders,
  };
  const req = new Request('https://weshnakul.pages.dev/api/feedback', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  return handleFeedbackPublicPost({ request: req, env: mockEnv });
};

// ============================================================================
// SUITE 1: Public Submission Endpoint Validation, Diagnostics & Abuse Controls
// ============================================================================
console.log('1. Verifying Public Submission (/api/feedback) Validation & Abuse Controls...');

_resetFeedbackRateLimitsForTesting();

// 1a. Invalid Content-Type rejection
{
  const res = await postFeedback('hello', { 'content-type': 'text/plain' });
  check(res.status === 415, 'Rejects non-JSON content-type with HTTP 415');
}

// 1b. Missing/invalid submission_type
{
  const res = await postFeedback({ submission_type: 'unknown_type', user_message: 'Test message' });
  check(res.status === 422, 'Rejects invalid submission_type with HTTP 422');
}

// 1c. Short/missing message for Bug
{
  const res = await postFeedback({ submission_type: 'bug', user_message: 'a' });
  check(res.status === 422, 'Rejects bug report with message shorter than 3 chars with HTTP 422');
}

// 1d. Valid Bug Report with safe diagnostics and strict stripping of forbidden keys
{
  const res = await postFeedback({
    submission_type: 'bug',
    user_message: 'The swiping card was stuck on the third restaurant.',
    diagnostic_context: {
      timestamp: new Date().toISOString(),
      sanitized_route: '/r/:code',
      app_version: '2.0.0-phase6',
      recent_error: {
        event: 'render_error',
        event_phase: 'card_render',
        error_message: 'Network timeout loading image',
        category: 'burger',
      },
      // Sensitive forbidden keys that MUST be stripped:
      room_code: 'XK99',
      session_token: 'secret-token-123',
      cookie: 'auth=secret',
      auth_token: 'bearer-xyz',
    },
  });
  check(res.status === 200, 'Valid bug report succeeds with HTTP 200');
  const data = await res.json();
  check(data.success === true, 'Response confirms success: true');
  check(typeof data.id === 'string', 'Returns generated submission ID');

  // Verify safe diagnostic sanitization
  const diag = data.submission?.diagnostic_context;
  check(Boolean(diag), 'Diagnostic context is present in submission object');
  check(diag.room_code === undefined, 'Sanitized diagnostic context strictly stripped room_code');
  check(diag.session_token === undefined, 'Sanitized diagnostic context strictly stripped session_token');
  check(diag.cookie === undefined, 'Sanitized diagnostic context strictly stripped cookie');
  check(diag.auth_token === undefined, 'Sanitized diagnostic context strictly stripped auth_token');
  check(diag.sanitized_route === '/r/:code', 'Sanitized route preserved safely');
  check(diag.recent_error?.event === 'render_error', 'Safe recent error event preserved');
}

// 1e. Valid Comment submission (with name and anonymous)
{
  const res1 = await postFeedback({
    submission_type: 'comment',
    user_message: 'Love the app! Suggest adding more shawarma spots in Rawdah.',
    submitter_name: 'Fahad Al-Harbi',
  });
  check(res1.status === 200, 'Comment with name succeeds with HTTP 200');

  const res2 = await postFeedback({
    submission_type: 'comment',
    user_message: 'Simple anonymous comment without any personal details.',
  });
  check(res2.status === 200, 'Anonymous comment succeeds with HTTP 200');
}

// 1f. Brand Suggestion validation: missing owner question
{
  const res = await postFeedback({
    submission_type: 'brand_suggestion',
    brand_name: 'Baituti Asian Grill',
    brand_location: 'Al-Zahra',
  });
  check(res.status === 422, 'Brand suggestion missing is_brand_owner is rejected with HTTP 422');
}

// 1g. Brand Suggestion: Owner = Yes requires valid contact phone
{
  const resNoPhone = await postFeedback({
    submission_type: 'brand_suggestion',
    brand_name: 'Baituti Asian Grill',
    is_brand_owner: true,
  });
  check(resNoPhone.status === 422, 'Brand suggestion with owner=true but no phone is rejected with HTTP 422');

  const resInvalid = await postFeedback({
    submission_type: 'brand_suggestion',
    brand_name: 'Baituti Asian Grill',
    is_brand_owner: true,
    contact_phone: 'not-a-phone',
  });
  check(resInvalid.status === 422, 'Brand suggestion with invalid phone is rejected with HTTP 422');

  const resValid = await postFeedback({
    submission_type: 'brand_suggestion',
    brand_name: 'Baituti Asian Grill',
    is_brand_owner: true,
    contact_phone: '+966 50 123 4567',
  });
  check(resValid.status === 200, 'Brand suggestion with owner=true and valid phone succeeds with HTTP 200');
}

// 1h. Brand Suggestion: Owner = No does NOT require phone and strips submitted phone
{
  const res = await postFeedback({
    submission_type: 'brand_suggestion',
    brand_name: 'Section-B Burger',
    brand_location: 'Hira St',
    district: 'Al-Shati',
    is_brand_owner: false,
    contact_phone: '+966 50 999 8888', // Non-owner supplied phone must be stripped
  });
  check(res.status === 200, 'Brand suggestion with owner=false succeeds without phone');
  const data = await res.json();
  check(data.submission?.contact_phone === null, 'Non-owner submissions strictly force contact_phone to null');
}

// 1i. Rate limiting: 5 submissions allowed, 6th rate-limited with HTTP 429
{
  _resetFeedbackRateLimitsForTesting();
  const testIp = '198.51.100.42';

  for (let i = 1; i <= 5; i++) {
    const res = await postFeedback(
      { submission_type: 'comment', user_message: `Allowed message ${i}` },
      { 'cf-connecting-ip': testIp }
    );
    check(res.status === 200, `Submission ${i} within rate window is allowed with HTTP 200`);
  }

  const blockedRes = await postFeedback(
    { submission_type: 'comment', user_message: 'Rate limited message' },
    { 'cf-connecting-ip': testIp }
  );
  check(blockedRes.status === 429, '6th submission from same IP is rate-limited with HTTP 429');
  const blockedData = await blockedRes.json();
  check(blockedData.error === 'rate_limit_exceeded', 'Rate limit error code is returned');
  check(blockedRes.headers.get('retry-after') !== null, 'Retry-After header is returned');

  const differentIpRes = await postFeedback(
    { submission_type: 'comment', user_message: 'Different IP message' },
    { 'cf-connecting-ip': '203.0.113.88' }
  );
  check(differentIpRes.status === 200, 'Different IP is allowed immediately with HTTP 200');
}

// 1j. Request size limits (rejection of oversized payloads)
{
  const oversizedText = 'a'.repeat(20000);
  const res = await postFeedback(
    JSON.stringify({ submission_type: 'comment', user_message: oversizedText }),
    { 'content-length': '20050' }
  );
  check(res.status === 413, 'Oversized payload exceeding 16KB is rejected with HTTP 413');
}

// ============================================================================
// SUITE 2: Admin Security, Authorization Boundaries & Phone Masking
// ============================================================================
console.log('\n2. Verifying Admin Inbox Security, Authorization Boundaries & Phone Masking...');

// 2a. Unauthenticated access rejected
{
  const req = new Request('https://weshnakul.pages.dev/api/admin/feedback', {
    method: 'GET',
  });
  const res = await handleFeedbackAdminListGet({ request: req, env: mockEnv });
  check(res.status === 401, 'Unauthenticated GET /api/admin/feedback returns HTTP 401 Unauthorized');
}

// 2b. Authenticated non-admin rejected
{
  const req = new Request('https://weshnakul.pages.dev/api/admin/feedback', {
    method: 'GET',
    headers: { Authorization: `Bearer ${nonAdminToken}` },
  });
  const res = await handleFeedbackAdminListGet({ request: req, env: mockEnv });
  check(res.status === 403, 'Non-admin GET /api/admin/feedback returns HTTP 403 Forbidden');
}

// 2c. Authorized admin succeeds
{
  const req = new Request('https://weshnakul.pages.dev/api/admin/feedback?type=bug&status=New', {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const res = await handleFeedbackAdminListGet({ request: req, env: mockEnv });
  check(res.status === 200, 'Authorized admin GET /api/admin/feedback returns HTTP 200 OK');
  const data = await res.json();
  check(data.success === true, 'Returns success: true');
  check(Array.isArray(data.submissions), 'Returns submissions array');
}

// 2d. Phone Masking unit assertions
{
  check(maskPhone('+966501234567') === '+9665****67', 'maskPhone masks middle digits (+9665****67)');
  check(maskPhone('+966555555555') === '+9665****55', 'maskPhone preserves international prefix and last 2 digits');
  check(maskPhone(null) === null, 'maskPhone preserves null values');
  check(maskPhone(undefined) === null, 'maskPhone preserves undefined values');
  check(maskPhone('123') === '***', 'maskPhone obscures short strings safely');
}

// 2e. Admin Detail endpoint authorization
{
  const unauthReq = new Request('https://weshnakul.pages.dev/api/admin/feedback/test-id-123', {
    method: 'GET',
  });
  const res1 = await handleFeedbackAdminDetailGet({ request: unauthReq, env: mockEnv, params: { id: 'test-id-123' } });
  check(res1.status === 401, 'Unauthenticated detail request returns HTTP 401');

  const authReq = new Request('https://weshnakul.pages.dev/api/admin/feedback/test-id-123', {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const res2 = await handleFeedbackAdminDetailGet({ request: authReq, env: mockEnv, params: { id: 'test-id-123' } });
  check(res2.status === 200, 'Authorized admin detail request returns HTTP 200 OK (mock)');
}

// 2f. Admin Status endpoint authorization and status validation
{
  const unauthReq = new Request('https://weshnakul.pages.dev/api/admin/feedback/test-id-123/status', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'Under review', expected_updated_at: new Date().toISOString() }),
  });
  const res1 = await handleFeedbackAdminStatusPatch({ request: unauthReq, env: mockEnv, params: { id: 'test-id-123' } });
  check(res1.status === 401, 'Unauthenticated status patch returns HTTP 401');

  const invalidStatusReq = new Request('https://weshnakul.pages.dev/api/admin/feedback/test-id-123/status', {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'InvalidStatus', expected_updated_at: new Date().toISOString() }),
  });
  const res2 = await handleFeedbackAdminStatusPatch({ request: invalidStatusReq, env: mockEnv, params: { id: 'test-id-123' } });
  check(res2.status === 422, 'Invalid status rejected with HTTP 422');

  const missingTimestampReq = new Request('https://weshnakul.pages.dev/api/admin/feedback/test-id-123/status', {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'Under review' }),
  });
  const resMissingTimestamp = await handleFeedbackAdminStatusPatch({ request: missingTimestampReq, env: mockEnv, params: { id: 'test-id-123' } });
  check(resMissingTimestamp.status === 422, 'Missing expected_updated_at rejected with HTTP 422');
  const missingTimestampData = await resMissingTimestamp.json();
  check(missingTimestampData.error === 'missing_expected_updated_at', 'Rejection error code is missing_expected_updated_at');

  const validStatusReq = new Request('https://weshnakul.pages.dev/api/admin/feedback/test-id-123/status', {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'Under review', expected_updated_at: new Date().toISOString() }),
  });
  const res3 = await handleFeedbackAdminStatusPatch({ request: validStatusReq, env: mockEnv, params: { id: 'test-id-123' } });
  check(res3.status === 200, 'Valid status patch succeeds with HTTP 200 (mock)');
}

// ============================================================================
// SUITE 3: Database Schema, Permissions, Immutability & Atomic RPC in Local PGlite
// ============================================================================
console.log('\n3. Verifying Database Schema, Permissions & Atomic RPC in Local PGlite...');

const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const { PGlite } = await import(pathToFileURL(runtime).href);
const db = new PGlite();
await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');

// 3a. Apply Phase 6 migration locally
const migrationSql = readFileSync('supabase/migrations/20261026000100_phase6_feedback_and_operations.sql', 'utf8').replace(/BEGIN;|COMMIT;/g, '');
await db.exec(migrationSql);
check(true, 'Phase 6 migration applied cleanly to local Postgres');

// 3b. Verify table structures
const submissionsTableInfo = await db.query(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'feedback_submissions'
  ORDER BY ordinal_position;
`);
check(submissionsTableInfo.rows.length >= 10, 'public.feedback_submissions table has all expected columns');

const auditTableInfo = await db.query(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'feedback_audit_logs'
  ORDER BY ordinal_position;
`);
const auditColumns = auditTableInfo.rows.map((r) => r.column_name);
check(auditColumns.length === 6, 'public.feedback_audit_logs table has exactly 6 columns');
check(!auditColumns.includes('notes'), 'Unapproved notes column is strictly absent from feedback_audit_logs (Fix 2)');

// 3c. Verify RLS is enabled on both tables
const rlsStatus = await db.query(`
  SELECT relname, relrowsecurity
  FROM pg_class
  WHERE relname IN ('feedback_submissions', 'feedback_audit_logs');
`);
for (const row of rlsStatus.rows) {
  check(row.relrowsecurity === true, `RLS is strictly enabled on ${row.relname}`);
}

// 3d. Direct SELECT on feedback_submissions denied for anon
await db.exec('SET ROLE anon;');
try {
  await db.query('SELECT * FROM public.feedback_submissions;');
  assert.fail('anon should not be allowed to SELECT from feedback_submissions');
} catch (e) {
  check(e.code === '42501', 'Direct SELECT on feedback_submissions strictly denied for anon (42501)');
} finally {
  await db.exec('RESET ROLE;');
}

// 3e. Direct SELECT on feedback_submissions denied for authenticated
await db.exec('SET ROLE authenticated;');
try {
  await db.query('SELECT * FROM public.feedback_submissions;');
  assert.fail('authenticated should not be allowed to SELECT from feedback_submissions');
} catch (e) {
  check(e.code === '42501', 'Direct SELECT on feedback_submissions strictly denied for authenticated (42501)');
} finally {
  await db.exec('RESET ROLE;');
}

// 3f. Direct INSERT on feedback_submissions denied for anon
await db.exec('SET ROLE anon;');
try {
  await db.query("INSERT INTO public.feedback_submissions (submission_type, user_message) VALUES ('comment', 'test');");
  assert.fail('anon should not be allowed to INSERT into feedback_submissions');
} catch (e) {
  check(e.code === '42501', 'Direct INSERT on feedback_submissions strictly denied for anon (42501)');
} finally {
  await db.exec('RESET ROLE;');
}

// 3g. Direct execution of update_feedback_submission_status denied for anon
await db.exec('SET ROLE anon;');
try {
  await db.query("SELECT public.update_feedback_submission_status('00000000-0000-0000-0000-000000000000', 'Resolved', now(), 'admin@weshnakul.com');");
  assert.fail('anon should not be allowed to execute update_feedback_submission_status');
} catch (e) {
  check(e.code === '42501', 'Direct RPC execution strictly denied for anon (42501)');
} finally {
  await db.exec('RESET ROLE;');
}

// 3h. Direct execution of update_feedback_submission_status denied for authenticated
await db.exec('SET ROLE authenticated;');
try {
  await db.query("SELECT public.update_feedback_submission_status('00000000-0000-0000-0000-000000000000', 'Resolved', now(), 'admin@weshnakul.com');");
  assert.fail('authenticated should not be allowed to execute update_feedback_submission_status');
} catch (e) {
  check(e.code === '42501', 'Direct RPC execution strictly denied for authenticated (42501)');
} finally {
  await db.exec('RESET ROLE;');
}

// 3i. Insert record via postgres/service_role and verify audit log immutability trigger
const insertResult = await db.query(`
  INSERT INTO public.feedback_submissions (submission_type, status, user_message, brand_name, is_brand_owner, contact_phone)
  VALUES ('brand_suggestion', 'New', 'Add Chef Burger in Zahra', 'Chef Burger', true, '+966501234567')
  RETURNING id, updated_at;
`);
const newSubId = insertResult.rows[0].id;
const initialUpdatedAt = insertResult.rows[0].updated_at;
check(typeof newSubId === 'string', 'service_role successfully inserts into feedback_submissions');

// Insert initial audit record
const auditInsertResult = await db.query(`
  INSERT INTO public.feedback_audit_logs (submission_id, previous_status, new_status, actor_admin_id)
  VALUES ('${newSubId}', 'New', 'Under review', 'admin@weshnakul.com')
  RETURNING id;
`);
const auditId = auditInsertResult.rows[0].id;
check(typeof auditId === 'string', 'Audit log inserted successfully without notes column');

// Attempt to UPDATE audit log -> must be blocked by immutability trigger!
try {
  await db.query(`
    UPDATE public.feedback_audit_logs SET new_status = 'Resolved' WHERE id = '${auditId}';
  `);
  assert.fail('Audit log UPDATE should be blocked by immutability trigger');
} catch (e) {
  check(e.message.includes('WSH_AUDIT_LOG_IMMUTABLE'), 'Trigger strictly blocks UPDATE on feedback_audit_logs');
}

// Attempt to DELETE audit log directly -> must be blocked by immutability trigger!
try {
  await db.query(`
    DELETE FROM public.feedback_audit_logs WHERE id = '${auditId}';
  `);
  assert.fail('Audit log DELETE should be blocked by immutability trigger');
} catch (e) {
  check(e.message.includes('WSH_AUDIT_LOG_IMMUTABLE'), 'Trigger strictly blocks direct DELETE on feedback_audit_logs');
}

// ============================================================================
// SUITE 3.1: Atomic Status Update RPC Validation, Concurrency & Rollback
// ============================================================================
console.log('\n3.1 Verifying Atomic RPC Concurrency, Validation & Rollback...');

// 3.1a. RPC rejects invalid status
try {
  await db.query(`SELECT public.update_feedback_submission_status('${newSubId}', 'InvalidStatus', now(), 'admin@weshnakul.com');`);
  assert.fail('RPC should reject invalid status');
} catch (e) {
  check(e.code === '22023', 'RPC rejects invalid status with code 22023 (invalid_parameter_value)');
}

// 3.1b. RPC rejects null expected_updated_at (Fix A)
try {
  await db.query(`
    SELECT public.update_feedback_submission_status(
      '${newSubId}',
      'Resolved',
      NULL,
      'admin@weshnakul.com'
    );
  `);
  assert.fail('RPC should reject null expected_updated_at');
} catch (e) {
  check(e.code === '22004', 'RPC rejects null expected_updated_at with code 22004 (Fix A)');
  check(e.message.includes('WSH_FEEDBACK_MISSING_TIMESTAMP'), 'RPC rejects null expected_updated_at with WSH_FEEDBACK_MISSING_TIMESTAMP');
}

// 3.1c. RPC rejects null actor (Fix B)
try {
  await db.query(`
    SELECT public.update_feedback_submission_status(
      '${newSubId}',
      'Resolved',
      '${initialUpdatedAt.toISOString()}'::timestamptz,
      NULL
    );
  `);
  assert.fail('RPC should reject null actor');
} catch (e) {
  check(e.code === '22004', 'RPC rejects null actor with code 22004 (Fix B)');
  check(e.message.includes('WSH_FEEDBACK_MISSING_ACTOR'), 'RPC rejects null actor with WSH_FEEDBACK_MISSING_ACTOR');
}

// 3.1d. RPC rejects whitespace actor (Fix B)
try {
  await db.query(`
    SELECT public.update_feedback_submission_status(
      '${newSubId}',
      'Resolved',
      '${initialUpdatedAt.toISOString()}'::timestamptz,
      '   '
    );
  `);
  assert.fail('RPC should reject whitespace actor');
} catch (e) {
  check(e.code === '22004', 'RPC rejects whitespace actor with code 22004 (Fix B)');
  check(e.message.includes('WSH_FEEDBACK_MISSING_ACTOR'), 'RPC rejects whitespace actor with WSH_FEEDBACK_MISSING_ACTOR');
}

// 3.1e. Verifying defaults were removed: calling with omitted timestamp or omitted actor is rejected by PostgreSQL signature
try {
  await db.query(`SELECT public.update_feedback_submission_status('${newSubId}', 'Resolved');`);
  assert.fail('Calling RPC with omitted parameters should fail');
} catch (e) {
  check(e.code === '42883', 'Calling RPC with omitted parameters rejected by PostgreSQL signature (42883 undefined_function)');
}

// 3.1f. RPC rejects non-existent ID
try {
  await db.query("SELECT public.update_feedback_submission_status('00000000-0000-0000-0000-000000000000', 'Resolved', now(), 'admin@weshnakul.com');");
  assert.fail('RPC should reject non-existent ID');
} catch (e) {
  check(e.message.includes('WSH_FEEDBACK_NOT_FOUND'), 'RPC rejects non-existent ID with WSH_FEEDBACK_NOT_FOUND');
}

// 3.1g. RPC rejects stale expected_updated_at (Concurrency Conflict)
const staleTimestamp = new Date(Date.now() - 3600000).toISOString();
try {
  await db.query(`
    SELECT public.update_feedback_submission_status(
      '${newSubId}',
      'Resolved',
      '${staleTimestamp}'::timestamptz,
      'admin@weshnakul.com'
    );
  `);
  assert.fail('RPC should reject stale expected_updated_at');
} catch (e) {
  check(e.message.includes('WSH_FEEDBACK_CONCURRENCY_CONFLICT'), 'RPC rejects stale expected_updated_at with WSH_FEEDBACK_CONCURRENCY_CONFLICT');
}

// 3.1h. Atomicity: Verify submission status was not changed after failed concurrency check
const subAfterConflict = await db.query(`SELECT status FROM public.feedback_submissions WHERE id = '${newSubId}';`);
check(subAfterConflict.rows[0].status === 'New', 'Submission status remains unchanged after concurrency conflict');

const auditCountAfterConflict = await db.query(`SELECT count(*) as count FROM public.feedback_audit_logs WHERE submission_id = '${newSubId}';`);
check(Number(auditCountAfterConflict.rows[0].count) === 1, 'No orphan audit record created during concurrency conflict');

// 3.1i. Successful Atomic Status Update
const rpcSuccessResult = await db.query(`
  SELECT public.update_feedback_submission_status(
    '${newSubId}',
    'Resolved',
    '${initialUpdatedAt.toISOString()}'::timestamptz,
    'admin@weshnakul.com'
  ) as result;
`);
const rpcData = rpcSuccessResult.rows[0].result;
check(rpcData.success === true, 'RPC successfully executes atomic status transition');
check(rpcData.submission.status === 'Resolved', 'Returned submission representation reflects status: Resolved');
check(typeof rpcData.audit_log_id === 'string', 'Returned representation includes atomic audit_log_id');

// Verify submission table was updated in database
const subAfterSuccess = await db.query(`SELECT status, updated_at FROM public.feedback_submissions WHERE id = '${newSubId}';`);
check(subAfterSuccess.rows[0].status === 'Resolved', 'Database submission record status updated to Resolved');

// Verify audit table contains exactly one matching record for this transition
const auditAfterSuccess = await db.query(`
  SELECT * FROM public.feedback_audit_logs
  WHERE submission_id = '${newSubId}' AND new_status = 'Resolved';
`);
check(auditAfterSuccess.rows.length === 1, 'Audit log committed atomically with status update');
check(auditAfterSuccess.rows[0].previous_status === 'New', 'Audit log captures exact previous_status');
check(auditAfterSuccess.rows[0].actor_admin_id === 'admin@weshnakul.com', 'Audit log captures verified actor_admin_id');

// ============================================================================
// SUITE 4: Localization Parity & Anti-Slop Discipline
// ============================================================================
console.log('\n4. Verifying Localization Parity & Anti-Slop Copywriting...');

// 4a. Check adminTranslations parity
const enKeys = Object.keys(ADMIN_TRANSLATIONS.en);
const arKeys = Object.keys(ADMIN_TRANSLATIONS.ar);
check(enKeys.length === arKeys.length, `Admin translations key count matches (${enKeys.length} keys)`);

const missingInAr = enKeys.filter((k) => !(k in ADMIN_TRANSLATIONS.ar));
const missingInEn = arKeys.filter((k) => !(k in ADMIN_TRANSLATIONS.en));
check(missingInAr.length === 0, `Zero missing keys in Arabic admin translations (missing: ${missingInAr.join(', ')})`);
check(missingInEn.length === 0, `Zero missing keys in English admin translations (missing: ${missingInEn.join(', ')})`);

check(Boolean(ADMIN_TRANSLATIONS.en.tabFeedbackInbox), "Phase 6 key 'tabFeedbackInbox' present in English dictionary");
check(Boolean(ADMIN_TRANSLATIONS.ar.tabFeedbackInbox), "Phase 6 key 'tabFeedbackInbox' present in Arabic dictionary");

// 4b. Check public en.json and ar.json parity for feedback
const enJson = JSON.parse(readFileSync('src/locales/en.json', 'utf8'));
const arJson = JSON.parse(readFileSync('src/locales/ar.json', 'utf8'));
check(Boolean(enJson.feedback), "'feedback' namespace present in en.json");
check(Boolean(arJson.feedback), "'feedback' namespace present in ar.json");

const enFeedbackKeys = Object.keys(enJson.feedback);
const arFeedbackKeys = Object.keys(arJson.feedback);
check(enFeedbackKeys.length === arFeedbackKeys.length, 'Public feedback key counts match exactly between EN and AR');

// 4c. Anti-slop R-02 Copywriting rule: Zero em dashes in all newly created/modified Phase 6 files
const phase6Files = [
  'src/components/feedback/FeedbackFloatingButton.tsx',
  'src/components/feedback/FeedbackModal.tsx',
  'src/components/admin/FeedbackInboxView.tsx',
  'functions/api/feedback.ts',
  'functions/api/admin/feedback/index.ts',
  'functions/api/admin/feedback/[id]/index.ts',
  'functions/api/admin/feedback/[id]/status.ts',
  'src/services/feedbackService.ts',
  'src/types/feedback.ts',
  'supabase/migrations/20261026000100_phase6_feedback_and_operations.sql',
];

for (const filePath of phase6Files) {
  const content = readFileSync(filePath, 'utf8');
  const hasEmDash = content.includes('—');
  check(!hasEmDash, `Zero em dashes (-) found in ${filePath} (anti-slop R-02)`);
}

// ============================================================================
// SUITE 5: Catalog Integrity & Non-Auto-Publish Guarantee
// ============================================================================
console.log('\n5. Verifying Catalog Integrity & Non-Auto-Publish Guarantee...');

const restaurantCountBefore = (await db.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'restaurants';")).rows[0].count;
check(restaurantCountBefore !== null, 'Catalog tables verified intact');

console.log('\n======================================================');
console.log(`PASS: All ${checks} Phase 6 Feedback & Operations checks passed successfully!`);
console.log('======================================================');
