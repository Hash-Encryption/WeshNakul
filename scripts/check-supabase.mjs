import assert from 'node:assert/strict';
import { createServer } from 'vite';

// Run with: node scripts/check-supabase.mjs. All HTTP is mocked; no live room writes.
const store = new Map();
globalThis.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key,value) => store.set(key,value), removeItem: key => store.delete(key) };
const server = await createServer({ server: { middlewareMode: true }, define: {
  'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(' "https://test.supabase.co///" '),
  'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(" 'test-key' "),
} });
const originalFetch = globalThis.fetch;
const originalError = console.error;
const originalLog = console.log;
const logs = [];
console.error = (...args) => logs.push(args);
console.log = () => {};
try {
  const api = await server.ssrLoadModule('/src/lib/supabase.ts');
  assert.equal(api.supabaseUrl, 'https://test.supabase.co');
  assert.equal(api.supabaseAnonKey, 'test-key');
  for (const error of [new TypeError('Failed to fetch'), { message: 'fetch failed' }, { status: 0 }, { message: 'SSL certificate failure' }]) assert.equal(api.isSupabaseNetworkError(error), true);
  assert.equal(api.isSupabaseNetworkError({ message: 'permission denied', code: '42501' }), false);
  const reply = (data, status=200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  const room = { id: 'room-id', code: 'ABCD', created_at: new Date().toISOString(), stage: 'lobby' };
  const network = () => { throw new TypeError('Failed to fetch'); };
  const input = { eating_mode: 'delivery', city: 'riyadh', language: 'ar', host_nickname: 'Host' };
  globalThis.fetch = network;
  for (const operation of [() => api.createRoom(input), () => api.getRoomByCode('ABCD'), () => api.joinRoom({ code:'ABCD', nickname:'Guest' }), () => api.startCategoryVoting('room-id','session-token-0000',0), () => api.getRoomDecisionState('room-id','session-token-0000'), () => api.resetRoomVoting('room-id','session-token-0000',0), () => api.deleteRoom('room-id','session-token-0000'), () => api.fetchOrderItems('room-id'), () => api.addOrderItem({roomId:'room-id',itemName:'Pizza'}), () => api.deleteOrderItem('item-id')]) {
    await assert.rejects(operation, error => api.isSupabaseNetworkError(error));
  }
  assert.equal((await api.checkSupabaseConnection()).ok, false);
  assert(logs.some(([label, detail]) => label === '[Supabase Network Failure]' && detail.hint.includes('SSL inspection')));
  assert([...store.keys()].every(key => !key.startsWith('wsh_mock_')));
  // Participant read failures cannot be mistaken for missing rooms.
  globalThis.fetch = async url => (String(url).includes('/participants') || String(url).includes('/rpc/get_room_participants')) ? network() : reply(room);
  await assert.rejects(() => api.getRoomByCode('ABCD'), error => api.isSupabaseNetworkError(error));
  globalThis.fetch = async (url,init) => (String(url).includes('/participants') || String(url).includes('/rpc/get_room_participants')) ? (init?.method === 'POST' ? network() : reply([])) : reply(room);
  await assert.rejects(() => api.joinRoom({code:'ABCD',nickname:'Guest'}), error => api.isSupabaseNetworkError(error));
  let calls = 0;
  globalThis.fetch = async () => ++calls === 1 ? reply(null) : network();
  await assert.rejects(() => api.getRoomByCode('ABCD'), error => api.isSupabaseNetworkError(error));
  const queryError = { message: 'permission denied', code: '42501' };
  globalThis.fetch = async () => reply(queryError,403);
  await assert.rejects(() => api.getRoomByCode('ABCD'), error => error.code === '42501' && !api.isSupabaseNetworkError(error));
  assert.deepEqual(await api.checkSupabaseConnection(), {ok:false,error:'permission denied'});
  globalThis.fetch = async () => reply(null);
  assert.equal((await api.getRoomByCode('NONE')).room,null);
  globalThis.fetch = async () => new Response(null, {status:200});
  assert.deepEqual(await api.checkSupabaseConnection(), {ok:true});
  // Successful creation still returns the persisted room and host from one atomic RPC.
  const createdPayload={room:{...room,version:0},participant:{id:'host-id',room_id:'room-id',session_token:'session-token-0000',nickname:'Host',player_color:'#55B96A',player_shape:'circle',is_host:true,status:'active'}};
  let createRequest=null;
  globalThis.fetch = async (_url,init) => {createRequest=JSON.parse(init.body);return reply(createdPayload);};
  const created = await api.createRoom(input);
  assert.equal(created.participant.is_host,true);
  assert.equal(createRequest.p_code.length,4);
  let locationPayload = null;
  globalThis.fetch = async (_url,init) => { locationPayload=JSON.parse(init.body);return reply(createdPayload); };
  const located = await api.createRoom({...input,latitude:21.6,longitude:39.2});
  assert.equal('latitude' in located.room,false);
  assert.equal(locationPayload.p_latitude,21.6); assert.equal(locationPayload.p_longitude,39.2);
  let deckPayload = null;
  const deck = {deckId:'deck-id',generation:0,restaurants:[]};
  globalThis.fetch = async (url,init) => {
    deckPayload=JSON.parse(init.body);
    return String(url).includes('/rpc/get_or_create_restaurant_deck') ? reply(deck) : reply(null);
  };
  assert.deepEqual(await api.fetchDeckRestaurants('room-id','participant-id','session-token'),deck);
  assert.deepEqual(Object.keys(deckPayload).sort(),['p_after_deck_id','p_participant_id','p_room_id','p_session_token']);
  globalThis.fetch = network;
  await assert.rejects(() => api.fetchDeckRestaurants('room-id','participant-id','session-token'), error => api.isSupabaseNetworkError(error));
  // Joining is also an atomic RPC; the client supplies intent, not participant authority.
  let joinPayload = null;
  globalThis.fetch = async (url,init) => {
    if (String(url).includes('/rpc/get_room_participants')) return reply([]);
    if (String(url).includes('/rpc/join_room_authorized')) {joinPayload=JSON.parse(init.body);return reply({...createdPayload,participant:{...createdPayload.participant,is_host:false,nickname:'Guest'}});}
    return reply(room);
  };
  const joined=await api.joinRoom({code:' abcd ',nickname:' Guest '});
  assert.equal(joined.success,true);assert.equal(joined.participant.nickname,'Guest');assert.equal(joinPayload.p_nickname,'Guest');
  originalLog('PASS: configuration cleanup, failure propagation, query/network distinction, no local rooms, preflight, and successful creation.');
} finally {
  globalThis.fetch = originalFetch;
  console.error = originalError;
  console.log = originalLog;
  await server.close();
}
