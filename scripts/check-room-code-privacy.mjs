import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

console.log('--- WESHNAKUL SEC-05: FINAL ROOM ENUMERATION & PRIVACY TEST SUITE ---');

let checks = 0;
function check(condition, message) {
  assert.ok(condition, message);
  checks++;
  console.log(`  ✓ [Check ${checks}] ${message}`);
}

// 1. Verify Migration File Definition
console.log('\n1. Verifying Migration 20261030000100_protect_room_enumeration.sql...');
const migrationPath = 'supabase/migrations/20261030000100_protect_room_enumeration.sql';
check(existsSync(migrationPath), 'Migration file exists');

const migrationSql = readFileSync(migrationPath, 'utf8');

check(migrationSql.includes('CREATE TABLE IF NOT EXISTS private.room_lookup_attempts'), 'Creates private.room_lookup_attempts tracking table');
check(migrationSql.includes('CREATE INDEX IF NOT EXISTS idx_room_lookup_attempts_last_failed'), 'Creates index on private.room_lookup_attempts (last_failed_at)');
check(migrationSql.includes('REVOKE ALL ON private.room_lookup_attempts FROM PUBLIC, anon, authenticated'), 'Revokes access to lookup attempts from anon and authenticated');
check(migrationSql.includes('CREATE OR REPLACE FUNCTION public.get_room_by_code(p_code text)'), 'Creates get_room_by_code RPC function');
check(migrationSql.includes('VOLATILE'), 'Function is marked VOLATILE to allow writing to attempt records');
check(!migrationSql.includes('STABLE'), 'Function is NOT marked STABLE');
check(migrationSql.includes('SECURITY DEFINER'), 'Function is marked SECURITY DEFINER');
check(migrationSql.includes('SET search_path = pg_catalog, public, private'), 'Function sets safe search_path including private schema');

// Format validation check in SQL
check(migrationSql.includes("^[A-Z0-9]{4}$"), 'SQL function validates exact 4-character uppercase alphanumeric regex ^[A-Z0-9]{4}$');

// Enumeration resistance checks in SQL
check(migrationSql.includes('blocked_until > now()'), 'SQL function checks if caller client IP is currently blocked');
check(migrationSql.includes('failed_attempts + 1'), 'SQL function increments failed attempts counter on missing room');
check(migrationSql.includes("interval '10 minutes'"), 'SQL function enforces 10-minute block after threshold exceeded');

// IP validation and header security
check(migrationSql.includes('cf-connecting-ip'), 'SQL function prioritizes cf-connecting-ip from Cloudflare');
check(migrationSql.includes('host(v_client_ip::inet)'), 'SQL function strictly normalizes and validates IP format using inet type');
check(migrationSql.includes('IF v_client_ip IS NULL THEN\n      RETURN NULL;'), 'SQL function fails closed for HTTP requests with missing or unresolvable IP');

// Minimal response verification (NO to_jsonb)
check(!migrationSql.includes('to_jsonb(r)') && !migrationSql.includes('to_jsonb(v_room_row)'), 'SQL function strictly avoids to_jsonb serialization of entire row');
check(migrationSql.includes('jsonb_build_object('), 'SQL function explicitly constructs minimal JSON response');

// Exclusion of sensitive internal metadata
check(!migrationSql.includes("'category_summary'"), 'Public response strictly EXCLUDES category_summary (participant votes)');
check(!migrationSql.includes("'restaurant_summary'"), 'Public response strictly EXCLUDES restaurant_summary (algorithm weights/scores)');
check(!migrationSql.includes("'last_mode_changed_by_participant_id'"), 'Public response strictly EXCLUDES internal participant UUIDs');
check(!migrationSql.includes("'host_participant_id'"), 'Public response strictly EXCLUDES host_participant_id UUID');
check(!migrationSql.includes("'winning_deck_id'"), 'Public response strictly EXCLUDES winning_deck_id');

// Permissions check on rooms table
check(migrationSql.includes('REVOKE SELECT ON public.rooms FROM anon, authenticated'), 'Revokes full table SELECT on rooms from anon and authenticated');
check(migrationSql.includes('GRANT SELECT ('), 'Grants column-level SELECT on rooms');

const match = migrationSql.match(/GRANT SELECT \(([\s\S]*?)\)\s+ON public\.rooms TO anon, authenticated;/i);
check(!!match, 'Found column-level GRANT SELECT statement');
const grantedCols = match[1].split(',').map(c => c.trim().toLowerCase());

check(!grantedCols.includes('code'), 'Granted columns strictly EXCLUDE room "code"');
check(!grantedCols.includes('category_summary'), 'Granted columns strictly EXCLUDE "category_summary"');
check(!grantedCols.includes('restaurant_summary'), 'Granted columns strictly EXCLUDE "restaurant_summary"');
check(!grantedCols.includes('preferences'), 'Granted columns strictly EXCLUDE "preferences"');
check(!grantedCols.includes('host_participant_id'), 'Granted columns strictly EXCLUDE "host_participant_id"');
check(!grantedCols.includes('winning_deck_id'), 'Granted columns strictly EXCLUDE "winning_deck_id"');
check(grantedCols.includes('id'), 'Granted columns include "id" for realtime filter and health check');
check(grantedCols.includes('status'), 'Granted columns include "status"');
check(grantedCols.includes('stage'), 'Granted columns include "stage"');
check(grantedCols.includes('eating_mode'), 'Granted columns include "eating_mode"');
check(grantedCols.includes('room_mode'), 'Granted columns include "room_mode"');
check(grantedCols.length === 5, 'Granted columns list is strictly minimized to exactly 5 safe operational fields');

// 2. Verify Frontend getRoomByCode Wiring
console.log('\n2. Verifying Frontend src/lib/supabase.ts getRoomByCode Implementation...');
const supabaseTs = readFileSync('src/lib/supabase.ts', 'utf8');

const getRoomByCodeBody = supabaseTs.slice(
  supabaseTs.indexOf('export async function getRoomByCode'),
  supabaseTs.indexOf('export async function createRoom')
);

check(getRoomByCodeBody.includes("supabase.rpc('get_room_by_code', { p_code: cleanCode })"), 'getRoomByCode calls RPC get_room_by_code');
check(!getRoomByCodeBody.includes(".from('rooms')"), 'getRoomByCode does NOT contain fallback query to rooms table');
check(getRoomByCodeBody.includes('/^[A-Z0-9]{4}$/'), 'Frontend validates 4-character alphanumeric format client-side');
check(supabaseTs.includes('isClientLookupThrottled'), 'Frontend implements client-side abuse throttling against rapid brute force');

// 3. Behavioral Simulation in PGlite
console.log('\n3. Verifying PostgreSQL Isolation in PGlite...');
const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
if (!existsSync(runtime)) {
  console.log(`[INFO] Skipping PGlite runtime check: module not found at ${runtime}`);
} else {
  const { PGlite } = await import(pathToFileURL(runtime).href);
  const db = new PGlite();

  // Setup roles, schemas, and publications
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA IF NOT EXISTS private;
    CREATE PUBLICATION supabase_realtime;
  `);

  // Setup exact production table structure for rooms
  await db.exec(`
    CREATE TABLE public.rooms (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code text UNIQUE NOT NULL,
      status text NOT NULL DEFAULT 'lobby',
      stage text NOT NULL DEFAULT 'lobby',
      current_stage text NOT NULL DEFAULT 'lobby',
      eating_mode text NOT NULL DEFAULT 'delivery',
      room_mode text NOT NULL DEFAULT 'food',
      city text NOT NULL DEFAULT 'riyadh',
      neighborhood text,
      language text NOT NULL DEFAULT 'ar',
      host_participant_id uuid,
      version int NOT NULL DEFAULT 1,
      winning_category text,
      consensus_type text,
      tied_categories text[],
      winning_restaurant_id text,
      restaurant_state text DEFAULT 'idle',
      preferences jsonb NOT NULL DEFAULT '[]'::jsonb,
      category_summary jsonb,
      restaurant_summary jsonb,
      winning_deck_id uuid,
      winning_branch_id uuid,
      winning_resolution_method text,
      last_mode_changed_by_participant_id uuid,
      last_mode_changed_by_nickname text,
      last_mode_changed_at timestamptz,
      swiping_started_at timestamptz,
      finalized_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes')
    );

    ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
    CREATE POLICY rooms_read_only ON public.rooms FOR SELECT USING (true);
    GRANT SELECT ON public.rooms TO anon, authenticated;
  `);

  // Insert test room with sensitive fields populated
  const testRoomId = 'a0000000-0000-4000-8000-000000000001';
  const testHostId = 'b0000000-0000-4000-8000-000000000001';
  await db.exec(`
    INSERT INTO public.rooms (
      id, code, status, stage, current_stage, eating_mode, room_mode,
      city, neighborhood, language, version, preferences, host_participant_id,
      winning_category, consensus_type, tied_categories, winning_restaurant_id,
      restaurant_state, category_summary, restaurant_summary
    ) VALUES (
      '${testRoomId}', 'TEST', 'lobby', 'lobby', 'lobby', 'delivery', 'food',
      'jeddah', 'Al-Rawdah', 'ar', 1, '["halal"]'::jsonb, '${testHostId}',
      'burger', 'unanimous', ARRAY['burger'], 'section_b',
      'decided', '{"winner": "burger", "tally": {"burger": 5}}'::jsonb, '{"status": "decided", "score": 99}'::jsonb
    );
  `);

  // Apply SEC-05 protection migration
  await db.exec(migrationSql.replace(/BEGIN;|COMMIT;/g, ''));

  // --- SECTION A: Database Permissions Tests ---
  console.log('  Testing Database Permissions...');

  // 19. anon cannot SELECT rooms.code
  await db.exec('SET ROLE anon;');
  let blockedAnonCode = false;
  try {
    await db.query('SELECT code FROM public.rooms;');
  } catch (err) {
    blockedAnonCode = err.code === '42501';
  }
  check(blockedAnonCode, 'anon cannot SELECT rooms.code (42501 permission denied)');

  // 20. anon cannot SELECT all room columns
  let blockedAnonAll = false;
  try {
    await db.query('SELECT * FROM public.rooms;');
  } catch (err) {
    blockedAnonAll = err.code === '42501';
  }
  check(blockedAnonAll, 'anon cannot SELECT * FROM public.rooms (42501 permission denied)');

  // 21. anon cannot SELECT sensitive room fields
  let blockedAnonCatSummary = false;
  try {
    await db.query('SELECT category_summary FROM public.rooms;');
  } catch (err) {
    blockedAnonCatSummary = err.code === '42501';
  }
  check(blockedAnonCatSummary, 'anon cannot SELECT category_summary (42501 permission denied)');

  let blockedAnonRestSummary = false;
  try {
    await db.query('SELECT restaurant_summary FROM public.rooms;');
  } catch (err) {
    blockedAnonRestSummary = err.code === '42501';
  }
  check(blockedAnonRestSummary, 'anon cannot SELECT restaurant_summary (42501 permission denied)');

  let blockedAnonPref = false;
  try {
    await db.query('SELECT preferences FROM public.rooms;');
  } catch (err) {
    blockedAnonPref = err.code === '42501';
  }
  check(blockedAnonPref, 'anon cannot SELECT preferences (42501 permission denied)');

  let blockedAnonHost = false;
  try {
    await db.query('SELECT host_participant_id FROM public.rooms;');
  } catch (err) {
    blockedAnonHost = err.code === '42501';
  }
  check(blockedAnonHost, 'anon cannot SELECT host_participant_id (42501 permission denied)');

  // 22. authenticated cannot SELECT rooms.code
  await db.exec('SET ROLE authenticated;');
  let blockedAuthCode = false;
  try {
    await db.query('SELECT code FROM public.rooms;');
  } catch (err) {
    blockedAuthCode = err.code === '42501';
  }
  check(blockedAuthCode, 'authenticated cannot SELECT rooms.code (42501 permission denied)');

  // 23. authenticated cannot SELECT all room columns
  let blockedAuthAll = false;
  try {
    await db.query('SELECT * FROM public.rooms;');
  } catch (err) {
    blockedAuthAll = err.code === '42501';
  }
  check(blockedAuthAll, 'authenticated cannot SELECT * FROM public.rooms (42501 permission denied)');

  // 24. authenticated cannot SELECT sensitive room fields
  let blockedAuthCatSummary = false;
  try {
    await db.query('SELECT category_summary FROM public.rooms;');
  } catch (err) {
    blockedAuthCatSummary = err.code === '42501';
  }
  check(blockedAuthCatSummary, 'authenticated cannot SELECT category_summary (42501 permission denied)');

  // 25. anon CAN SELECT id and safe operational fields for Realtime & health checks
  await db.exec('SET ROLE anon;');
  const idRows = (await db.query(`SELECT id, status, stage, eating_mode, room_mode FROM public.rooms WHERE id = '${testRoomId}';`)).rows;
  check(idRows.length === 1 && idRows[0].status === 'lobby', 'anon CAN SELECT safe operational fields (id, status, stage, eating_mode, room_mode)');

  // 26. anon and authenticated CAN execute get_room_by_code RPC
  const anonRpcResult = (await db.query("SELECT public.get_room_by_code('TEST') as val;")).rows;
  check(anonRpcResult.length === 1 && anonRpcResult[0]?.val?.code === 'TEST', 'anon CAN execute public.get_room_by_code');

  await db.exec('SET ROLE authenticated;');
  const authRpcResult = (await db.query("SELECT public.get_room_by_code('TEST') as val;")).rows;
  check(authRpcResult.length === 1 && authRpcResult[0]?.val?.code === 'TEST', 'authenticated CAN execute public.get_room_by_code');

  // 27. anon and authenticated CANNOT read private attempt table
  let blockedAnonAttempts = false;
  try {
    await db.query('SELECT * FROM private.room_lookup_attempts;');
  } catch (err) {
    blockedAnonAttempts = err.code === '42501';
  }
  check(blockedAnonAttempts, 'anon/authenticated cannot access private.room_lookup_attempts (42501)');

  await db.exec('RESET ROLE;');

  // --- SECTION B: Function Volatility, Writes, and Abuse Throttling Tests ---
  console.log('  Testing Function Volatility & Abuse Protection...');

  // Reset attempt table
  await db.exec('DELETE FROM private.room_lookup_attempts;');

  // 5. The function successfully writes a failed attempt record
  const ip1 = '198.51.100.10';
  await db.exec(`SET "request.headers" = '{"cf-connecting-ip": "${ip1}"}';`);
  const fail1 = (await db.query("SELECT public.get_room_by_code('FAIL') as val;")).rows[0].val;
  check(fail1 === null, 'Unknown room code returns null');

  const attempts1 = (await db.query(`SELECT * FROM private.room_lookup_attempts WHERE client_key = '${ip1}';`)).rows;
  check(attempts1.length === 1 && attempts1[0].failed_attempts === 1, 'Function successfully writes failed attempt to private table (proving VOLATILE execution)');
  check(attempts1[0].blocked_until === null, 'First failed attempt does not block the client');

  // 6. Repeated failures update the same attempt record correctly
  for (let i = 2; i <= 9; i++) {
    await db.exec(`SET "request.headers" = '{"cf-connecting-ip": "${ip1}"}';`);
    await db.query("SELECT public.get_room_by_code('FAIL') as val;");
  }
  const attempts9 = (await db.query(`SELECT * FROM private.room_lookup_attempts WHERE client_key = '${ip1}';`)).rows;
  check(attempts9[0].failed_attempts === 9 && attempts9[0].blocked_until === null, 'Nine repeated failures increment counter to 9 without blocking');

  // 7. The tenth failed attempt triggers the block
  await db.exec(`SET "request.headers" = '{"cf-connecting-ip": "${ip1}"}';`);
  await db.query("SELECT public.get_room_by_code('FAIL') as val;");
  const attempts10 = (await db.query(`SELECT * FROM private.room_lookup_attempts WHERE client_key = '${ip1}';`)).rows;
  check(attempts10[0].failed_attempts === 10 && attempts10[0].blocked_until !== null, 'Tenth failed attempt triggers 10-minute block (blocked_until is set)');

  // 8. Further attempts during the block remain blocked and do not perform room queries or block resets
  await db.exec(`SET "request.headers" = '{"cf-connecting-ip": "${ip1}"}';`);
  const blockedValidLookup = (await db.query("SELECT public.get_room_by_code('TEST') as val;")).rows[0].val;
  check(blockedValidLookup === null, 'Valid room code lookup returns null while client IP is blocked (enumeration resistance)');

  // 9. The block expires after the intended interval
  await db.exec(`UPDATE private.room_lookup_attempts SET blocked_until = now() - interval '1 second' WHERE client_key = '${ip1}';`);
  await db.exec(`SET "request.headers" = '{"cf-connecting-ip": "${ip1}"}';`);
  const unblockedLookup = (await db.query("SELECT public.get_room_by_code('TEST') as val;")).rows[0].val;
  check(unblockedLookup !== null && unblockedLookup.code === 'TEST', 'Lookup succeeds once block has expired');

  // 10. Successful lookup clears the failed-attempt state
  const attemptsAfterSuccess = (await db.query(`SELECT * FROM private.room_lookup_attempts WHERE client_key = '${ip1}';`)).rows;
  check(attemptsAfterSuccess[0].failed_attempts === 0 && attemptsAfterSuccess[0].blocked_until === null, 'Successful lookup clears failed_attempts to 0');

  // 12. Missing or untrusted IP follows safe fail-closed behavior
  // Case A: HTTP header present with spoofed/invalid IP -> fail closed (returns null)
  await db.exec(`SET "request.headers" = '{"cf-connecting-ip": "not_an_ip;drop table rooms;"}';`);
  const invalidIpResult = (await db.query("SELECT public.get_room_by_code('TEST') as val;")).rows[0].val;
  check(invalidIpResult === null, 'HTTP request with invalid/spoofed IP string fails closed (returns null)');

  // Case B: HTTP request with missing IP header -> fail closed (returns null)
  await db.exec(`SET "request.headers" = '{"user-agent": "malicious-bot"}';`);
  const missingIpResult = (await db.query("SELECT public.get_room_by_code('TEST') as val;")).rows[0].val;
  check(missingIpResult === null, 'HTTP request lacking trusted client IP fails closed (returns null)');

  // Reset headers for remaining tests
  await db.exec(`RESET "request.headers";`);

  // --- SECTION C: Response Privacy and Projection Verification ---
  console.log('  Testing Response Privacy & Projection...');

  const validObj = (await db.query("SELECT public.get_room_by_code('TEST') as val;")).rows[0].val;
  check(validObj !== null, 'Direct valid lookup returns non-null object');

  // 13. No category_summary is returned
  check(!('category_summary' in validObj), 'Response strictly excludes category_summary');

  // 14. No restaurant_summary is returned
  check(!('restaurant_summary' in validObj), 'Response strictly excludes restaurant_summary');

  // 15. No private location or GPS data is returned
  check(!('latitude' in validObj) && !('longitude' in validObj), 'Response strictly excludes GPS coordinates');

  // 16. No unnecessary participant UUIDs are returned
  check(!('host_participant_id' in validObj), 'Response strictly excludes host_participant_id UUID');
  check(!('last_mode_changed_by_participant_id' in validObj), 'Response strictly excludes last_mode_changed_by_participant_id UUID');

  // 17. No internal algorithm or administrative columns are serialized
  check(!('winning_deck_id' in validObj), 'Response strictly excludes winning_deck_id');
  check(!('winning_branch_id' in validObj), 'Response strictly excludes winning_branch_id');
  check(!('winning_resolution_method' in validObj), 'Response strictly excludes winning_resolution_method');

  // 18. The JSON keys exactly match the approved projection
  const actualKeys = Object.keys(validObj).sort();
  const expectedKeys = [
    'city',
    'code',
    'consensus_type',
    'created_at',
    'current_stage',
    'eating_mode',
    'expires_at',
    'id',
    'language',
    'neighborhood',
    'preferences',
    'restaurant_state',
    'room_mode',
    'stage',
    'status',
    'tied_categories',
    'version',
    'winning_category',
    'winning_restaurant_id'
  ].sort();
  assert.deepEqual(actualKeys, expectedKeys, 'Returned JSON keys exactly match approved 19-field projection');
  check(true, 'Returned JSON keys exactly match approved 19-field minimal projection');

  // 3. Malformed code is rejected before query and returns null
  const malformedLong = (await db.query("SELECT public.get_room_by_code('TOOLONG') as val;")).rows[0].val;
  check(malformedLong === null, 'Malformed code exceeding 4 characters returns null immediately');

  const malformedSpecial = (await db.query("SELECT public.get_room_by_code('T;--') as val;")).rows[0].val;
  check(malformedSpecial === null, 'Malformed code with special characters returns null immediately');

  const malformedNull = (await db.query("SELECT public.get_room_by_code(NULL) as val;")).rows[0].val;
  check(malformedNull === null, 'Null code returns null immediately');

  console.log('  PGlite tests complete.');
}

console.log(`\n======================================================`);
console.log(`PASS: All ${checks} SEC-05 Room Code Privacy & Database checks passed successfully!`);
console.log(`======================================================\n`);
