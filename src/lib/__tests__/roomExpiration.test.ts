import { isRoomExpired, createRoom } from '../supabase';
import { clearRoomSession, getOrCreateSessionToken, setActiveRoomCode, getActiveRoomCode } from '../session';
import arDict from '../../locales/ar.json';
import enDict from '../../locales/en.json';

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  } as Storage;
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

export async function runExpirationTests() {
  console.log('Running room expiration and cleanup tests...');

  const now = Date.now();

  // 1. Fresh room (created 5 minutes ago) -> NOT expired
  const fiveMinAgo = new Date(now - 5 * 60 * 1000).toISOString();
  assert(isRoomExpired(fiveMinAgo) === false, 'Fresh room (5 mins ago) is not expired');

  // 1b. Fresh room with un-suffixed Postgres UTC timestamp (no 'Z' or offset) -> NOT expired
  const unsuffixedOneMinAgo = new Date(now - 60 * 1000).toISOString().replace('Z', '');
  assert(isRoomExpired(unsuffixedOneMinAgo) === false, 'Fresh room without Z suffix is not expired');

  // 1c. Fresh room with Postgres space-separated timestamp without Z -> NOT expired
  const spaceSeparatedFresh = new Date(now - 2 * 60 * 1000).toISOString().replace('T', ' ').replace('Z', '');
  assert(isRoomExpired(spaceSeparatedFresh) === false, 'Space-separated timestamp without Z is not expired');

  // 2. Room created 29 minutes ago -> NOT expired
  const twentyNineMinAgo = new Date(now - 29 * 60 * 1000).toISOString();
  assert(isRoomExpired(twentyNineMinAgo) === false, 'Room (29 mins ago) is not expired');

  // 3. Room created 30 minutes and 1 second ago -> EXPIRED
  const thirtyMinOneSecAgo = new Date(now - (30 * 60 * 1000 + 1000)).toISOString();
  assert(isRoomExpired(thirtyMinOneSecAgo) === true, 'Room (30m 1s ago) is expired');

  // 3b. Expired room without Z suffix -> EXPIRED
  const unsuffixedExpired = new Date(now - (35 * 60 * 1000)).toISOString().replace('Z', '');
  assert(isRoomExpired(unsuffixedExpired) === true, 'Unsuffixed expired room is expired');

  // 4. Room created 2 hours ago -> EXPIRED
  const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString();
  assert(isRoomExpired(twoHoursAgo) === true, 'Room (2h ago) is expired');

  // 5. Verify session clearing
  const testCode = 'EXP1';
  getOrCreateSessionToken(testCode);
  setActiveRoomCode(testCode);
  assert(getActiveRoomCode() === testCode, 'Active room code is set');

  clearRoomSession(testCode);
  assert(getActiveRoomCode() === null, 'Active room code is cleared after clearRoomSession');
  assert(localStorage.getItem(`wesh_nakul_session_${testCode}`) === null, 'Scoped session token removed');

  // 6. Verify session localization keys
  assert(Boolean(arDict.session && arDict.session.expiredNotice), 'ar.json contains session.expiredNotice');
  assert(Boolean(arDict.session && arDict.session.roomClosedByHost), 'ar.json contains session.roomClosedByHost');
  assert(Boolean(arDict.session && arDict.session.resetSuccess), 'ar.json contains session.resetSuccess');
  assert(Boolean(arDict.session && arDict.session.invalidCode), 'ar.json contains session.invalidCode');

  assert(Boolean(enDict.session && enDict.session.expiredNotice), 'en.json contains session.expiredNotice');
  assert(Boolean(enDict.session && enDict.session.roomClosedByHost), 'en.json contains session.roomClosedByHost');
  assert(Boolean(enDict.session && enDict.session.resetSuccess), 'en.json contains session.resetSuccess');
  assert(Boolean(enDict.session && enDict.session.invalidCode), 'en.json contains session.invalidCode');

  // 7. Verify createRoom returns valid room & host participant with safe defaults
  const created = await createRoom({
    eating_mode: 'delivery',
    city: 'riyadh',
    language: 'ar',
    host_nickname: 'أبو فهد',
  });
  assert(Boolean(created.room && created.room.code && created.room.code.length === 4), 'createRoom returns valid room code');
  assert(created.room.stage === 'lobby', 'created room stage is lobby');
  assert(created.room.status === 'lobby', 'created room status is lobby');
  assert(created.room.eating_mode === 'delivery', 'created room eating_mode is delivery');
  assert(isRoomExpired(created.room.created_at) === false, 'Newly created room is never expired');
  assert(Boolean(created.participant && created.participant.is_host === true), 'Host participant is properly created');
  assert(created.participant.nickname === 'أبو فهد', 'Host participant nickname matches');

  // 8. Verify stale session cleanup before room creation
  setActiveRoomCode('OLD1');
  assert(getActiveRoomCode() === 'OLD1', 'Pre-existing active room code exists');
  clearRoomSession('OLD1');
  clearRoomSession();
  assert(getActiveRoomCode() === null, 'Active room code cleared before new room creation');

  console.log('✓ All room expiration, cleanup, and room creation tests passed successfully!');
}

runExpirationTests();
