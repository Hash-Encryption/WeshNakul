import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

console.log('--- WESHNAKUL SEC-05: ROOM ENUMERATION & PRIVACY TEST SUITE ---');

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
check(migrationSql.includes('REVOKE ALL ON private.room_lookup_attempts FROM PUBLIC, anon, authenticated'), 'Revokes access to lookup attempts from anon and authenticated');
check(migrationSql.includes('CREATE OR REPLACE FUNCTION public.get_room_by_code(p_code text)'), 'Creates get_room_by_code RPC function');
check(migrationSql.includes('SECURITY DEFINER'), 'Function is marked SECURITY DEFINER');
check(migrationSql.includes('SET search_path = pg_catalog, public, private'), 'Function sets safe search_path including private schema');

// Format validation check in SQL
check(migrationSql.includes("^[A-Z0-9]{4}$"), 'SQL function validates exact 4-character uppercase alphanumeric regex ^[A-Z0-9]{4}$');

// Enumeration resistance checks in SQL
check(migrationSql.includes('blocked_until > now()'), 'SQL function checks if caller client IP is currently blocked');
check(migrationSql.includes('failed_attempts + 1'), 'SQL function increments failed attempts counter on missing room');
check(migrationSql.includes("interval '10 minutes'"), 'SQL function enforces 10-minute block after threshold exceeded');

// Minimal response verification (NO to_jsonb)
check(!migrationSql.includes('to_jsonb(r)') && !migrationSql.includes('to_jsonb(v_room_row)'), 'SQL function strictly avoids to_jsonb serialization of entire row');
check(migrationSql.includes('jsonb_build_object('), 'SQL function explicitly constructs minimal JSON response');

// Exclusion of sensitive internal metadata
check(!migrationSql.includes("'category_summary'"), 'Public response strictly EXCLUDES category_summary (participant votes)');
check(!migrationSql.includes("'restaurant_summary'"), 'Public response strictly EXCLUDES restaurant_summary (algorithm weights/scores)');
check(!migrationSql.includes("'last_mode_changed_by_participant_id'"), 'Public response strictly EXCLUDES internal participant UUIDs');
check(!migrationSql.includes("'winning_deck_id'"), 'Public response strictly EXCLUDES winning_deck_id');

// Permissions check on rooms table
check(migrationSql.includes('REVOKE SELECT ON public.rooms FROM anon, authenticated'), 'Revokes full table SELECT on rooms from anon and authenticated');
check(migrationSql.includes('GRANT SELECT ('), 'Grants column-level SELECT on rooms');

const match = migrationSql.match(/GRANT SELECT \(([\s\S]*?)\)\s+ON public\.rooms TO anon, authenticated;/i);
check(!!match, 'Found column-level GRANT SELECT statement');
const grantedCols = match[1].split(',').map(c => c.trim().toLowerCase());

check(!grantedCols.includes('code'), 'Granted columns strictly EXCLUDE room "code"');
check(grantedCols.includes('id'), 'Granted columns include "id" for realtime filter and health check');
check(grantedCols.includes('status'), 'Granted columns include "status"');
check(grantedCols.includes('stage'), 'Granted columns include "stage"');
check(grantedCols.includes('eating_mode'), 'Granted columns include "eating_mode"');
check(grantedCols.includes('room_mode'), 'Granted columns include "room_mode"');

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

// 3. Behavioral Simulation in PGlite if available
console.log('\n3. Verifying PostgreSQL Isolation in PGlite (if available)...');
const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
if (!existsSync(runtime)) {
  console.log(`[INFO] Skipping PGlite runtime check: module not found at ${runtime}`);
} else {
  const { PGlite } = await import(pathToFileURL(runtime).href);
  const db = new PGlite();

  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE SCHEMA IF NOT EXISTS private; CREATE PUBLICATION supabase_realtime;');

  // Apply base schema
  const initSql = readFileSync('supabase/migrations/20260902_initial_schema.sql', 'utf8')
    .replace('create extension if not exists "pgcrypto";', '')
    .replace(/^\uFEFF/, '');
  await db.exec(initSql);

  // Insert a test room
  await db.exec(`
    INSERT INTO public.rooms (id, code, status, stage, eating_mode, city, language)
    VALUES ('a0000000-0000-4000-8000-000000000001', 'TEST', 'lobby', 'lobby', 'delivery', 'jeddah', 'ar');
  `);

  // Apply protection migration
  await db.exec(migrationSql.replace(/BEGIN;|COMMIT;/g, ''));

  // anon cannot SELECT code
  await db.exec('SET ROLE anon;');
  let blockedAll = false;
  try {
    await db.query('SELECT * FROM public.rooms;');
  } catch (err) {
    blockedAll = err.code === '42501';
  }
  check(blockedAll, 'Direct SELECT * FROM public.rooms is blocked for anon (42501)');

  let blockedCode = false;
  try {
    await db.query('SELECT code FROM public.rooms;');
  } catch (err) {
    blockedCode = err.code === '42501';
  }
  check(blockedCode, 'Direct SELECT code FROM public.rooms is blocked for anon (42501)');

  // anon CAN SELECT id for Realtime & health checks
  const idRows = (await db.query('SELECT id, status FROM public.rooms WHERE id = \'a0000000-0000-4000-8000-000000000001\';')).rows;
  check(idRows.length === 1 && idRows[0].status === 'lobby', 'Direct SELECT id, status allowed for known room id');

  // anon CAN execute get_room_by_code RPC
  const rpcRows = (await db.query("SELECT public.get_room_by_code('TEST') as val;")).rows;
  const returnedObj = rpcRows[0]?.val;
  check(rpcRows.length === 1 && returnedObj?.code === 'TEST', 'get_room_by_code returns minimal room data when correct code provided');
  check(!('category_summary' in returnedObj), 'Minimal room object does not contain category_summary');
  check(!('restaurant_summary' in returnedObj), 'Minimal room object does not contain restaurant_summary');
  check(!('last_mode_changed_by_participant_id' in returnedObj), 'Minimal room object does not contain participant UUIDs');

  // Malformed input returns null
  const rpcMalformed = (await db.query("SELECT public.get_room_by_code('TOO_LONG_CODE') as val;")).rows;
  check(rpcMalformed[0]?.val === null, 'Malformed code is rejected before query and returns null');

  const rpcNotFound = (await db.query("SELECT public.get_room_by_code('NOPE') as val;")).rows;
  check(rpcNotFound.length === 1 && rpcNotFound[0].val === null, 'get_room_by_code returns null for non-existent code');

  await db.exec('RESET ROLE;');
}

console.log(`\n======================================================`);
console.log(`PASS: All ${checks} SEC-05 Room Code Privacy checks passed successfully!`);
console.log(`======================================================\n`);
