import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const { PGlite } = await import(pathToFileURL(runtime).href);
const db = new PGlite();
const migration = (file) => readFileSync(`supabase/migrations/${file}`, 'utf8').replace(/^\uFEFF/, '');
const query = async (sql) => (await db.query(sql)).rows;
let checks = 0;
const check = (value, message) => {
  assert.ok(value, message);
  checks++;
};
const rejects = async (sql, code) => {
  await assert.rejects(() => db.exec(sql), (error) => error.code === code);
  checks++;
};

try {
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');
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

  await db.exec(
    'ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE(room_id,session_token);'
  );

  for (const file of [
    '20260909000100_private_restaurant_decks.sql',
    '20260909000200_private_participant_sessions.sql',
    '20260910000100_jeddah_geography_intelligence.sql',
    '20260911000100_jeddah_burger_google_verified_catalog.sql',
    '20260911000200_remove_legacy_public_room_coordinates.sql',
    '20260911000300_phase3_authoritative_consensus.sql',
    '20260912000100_allow_voting_stage_joins.sql',
    '20260913000100_decision_game_and_tie_corrections.sql',
    '20260916000100_global_fair_draw_and_immediate_flow.sql',
  ]) {
    await db.exec(migration(file));
  }

  await db.exec(
    migration('20260917000100_harden_global_fair_draw.sql')
      .replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '')
      .replace(/DO \$\$[\s\S]*?END \$\$;/m, '')
  );
  await db.exec(
    `CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea LANGUAGE sql VOLATILE AS $$ SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex') $$;`
  );

  // Test legacy non-compliant row reconciliation during migration
  await db.exec('ALTER TABLE public.food_choices DROP CONSTRAINT IF EXISTS food_choices_valid_categories;');
  await db.exec(`
    INSERT INTO public.rooms (id, code, stage, eating_mode, city, language, created_at, expires_at)
    VALUES ('00000000-0000-0000-0000-000000000001', 'LEG1', 'voting', 'delivery', 'jeddah', 'ar', now(), now() + interval '30 minutes');
    INSERT INTO public.participants (id, room_id, session_token, nickname, is_host, player_color, player_shape)
    VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'leg-token-1', 'LegacyUser', true, '#55B96A', 'circle');
    INSERT INTO public.food_choices (room_id, participant_id, selected_categories, is_submitted)
    VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', ARRAY['flexible', 'burger'], true);
  `);

  // Apply the new Room Modes migration!
  await db.exec(migration('20260918000100_room_modes_preferences_and_suggestions.sql'));

  // Apply the Clean Food Categories migration!
  await db.exec(migration('20260919000100_clean_food_categories.sql'));

  // Verify the legacy row was safely reconciled to is_submitted = false
  const legacyRows = await query(`SELECT is_submitted FROM public.food_choices WHERE room_id = '00000000-0000-0000-0000-000000000001'`);
  check(legacyRows.length === 1 && legacyRows[0].is_submitted === false, 'legacy non-compliant submitted choice reconciled cleanly without failing check constraint');

  const _esc = (value) => String(value).replaceAll("'", "''");
  const state = (rows) => rows[0].state;
  const rpc = async (sql) => state(await query(`SELECT ${sql} state`));

  const create = async (code, token, nickname = 'Host') =>
    rpc(`public.create_room_authorized('${code}','${token}','delivery','jeddah','al_rawdah','ar','${nickname}',NULL,NULL)`);
  const joinRoom = async (code, token, nickname) =>
    rpc(`public.join_room_authorized('${code}','${token}','${nickname}')`);
  const category = async (room, token, version, categories) =>
    rpc(`public.submit_category_selection('${room}','${token}',${version},ARRAY[${categories.map((x) => `'${x}'`).join(',')}]::text[])`);
  const switchMode = async (room, token, version, newMode) =>
    rpc(`public.switch_room_mode('${room}','${token}',${version},'${newMode}')`);
  const setPref = async (room, token, version, pref, enabled) =>
    rpc(`public.set_room_preference('${room}','${token}',${version},'${pref}',${enabled})`);
  const toggleSugg = async (room, token, target) =>
    rpc(`public.toggle_room_suggestion('${room}','${token}','${target}')`);

  await db.exec('SET ROLE anon');

  // Test 1: Default room_mode is 'food' and starts in 'voting'
  const hostToken = 'host-mode-tok-00001', guest1 = 'guest1-mode-tok-0001', guest2 = 'guest2-mode-tok-0002';
  let s = await create('MODE', hostToken);
  const roomId = s.room.id;
  check(s.room.room_mode === 'food', 'Default room_mode is food');
  check(s.room.stage === 'voting', 'Default stage is voting');
  check(Array.isArray(s.room.preferences) && s.room.preferences.length === 0, 'Default preferences empty');
  const initialDecision = await rpc(`public.get_room_decision_state('${roomId}','${hostToken}')`);
  check(Array.isArray(initialDecision.suggestions) && initialDecision.suggestions.length === 0, 'Default suggestions empty');

  // Test 1b: Food mode category validation rejects removed categories
  for (const removed of ['breakfast', 'healthy', 'coffee', 'dessert']) {
    await rejects(`SELECT public.submit_category_selection('${roomId}','${hostToken}',${s.room.version},ARRAY['${removed}']::text[])`, '22023');
    await rejects(`SELECT public.submit_category_selection('${roomId}','${hostToken}',${s.room.version},ARRAY['burger','${removed}']::text[])`, '22023');
  }
  check(true, 'Food mode strictly rejects breakfast, healthy, coffee, and dessert submissions');

  // Test 2: Guest joins and can toggle suggestion
  const _j1 = await joinRoom('MODE', guest1, 'Guest1');
  const j2 = await joinRoom('MODE', guest2, 'Guest2');
  let currentVersion = j2.room.version;

  // Host cannot suggest
  await rejects(`SELECT public.toggle_room_suggestion('${roomId}','${hostToken}','mode:breakfast')`, '22023');

  // Guest1 suggests Breakfast
  let gState = await toggleSugg(roomId, guest1, 'mode:breakfast');
  check(gState.suggestions.length === 1, 'Guest suggestion recorded');
  check(gState.suggestions[0].target === 'mode:breakfast', 'Suggestion target is mode:breakfast');
  check(gState.suggestions[0].nickname === 'Guest1', 'Suggestion author is Guest1');

  // Guest1 toggles again -> withdrawn
  gState = await toggleSugg(roomId, guest1, 'mode:breakfast');
  check(gState.suggestions.length === 0, 'Suggestion toggles off idempotently');

  // Guest1 suggests again
  await toggleSugg(roomId, guest1, 'mode:breakfast');

  // Non-host cannot switch mode
  await rejects(`SELECT public.switch_room_mode('${roomId}','${guest1}',${currentVersion},'breakfast')`, '42501');

  // Stale version rejected
  await rejects(`SELECT public.switch_room_mode('${roomId}','${hostToken}',${currentVersion - 1},'breakfast')`, 'PT409');

  // Host switches mode: Food -> Breakfast
  s = await switchMode(roomId, hostToken, currentVersion, 'breakfast');
  check(s.room.room_mode === 'breakfast', 'Room mode is now breakfast');
  check(s.room.stage === 'voting', 'Breakfast mode starts in voting');
  check(s.room.last_mode_changed_by_nickname === 'Host', 'Audit records Host nickname');
  check(s.suggestions.length === 0, 'Mode change purges old mode suggestions');

  // Test 3: Category validation in Breakfast mode
  // Rejects food-only category (burger)
  await rejects(`SELECT public.submit_category_selection('${roomId}','${hostToken}',${s.room.version},ARRAY['burger']::text[])`, '22023');
  // Rejects healthy as category (healthy is a preference, not a category per correction #2)
  await rejects(`SELECT public.submit_category_selection('${roomId}','${hostToken}',${s.room.version},ARRAY['healthy']::text[])`, '22023');
  // Rejects food wildcard flexible in breakfast
  await rejects(`SELECT public.submit_category_selection('${roomId}','${hostToken}',${s.room.version},ARRAY['flexible']::text[])`, '22023');
  // Rejects mixed any_breakfast with concrete category
  await rejects(`SELECT public.submit_category_selection('${roomId}','${hostToken}',${s.room.version},ARRAY['any_breakfast','fatayer']::text[])`, '22023');

  // Rejects unapproved breakfast categories (bakery, juice, tea)
  await rejects(`SELECT public.submit_category_selection('${roomId}','${hostToken}',${s.room.version},ARRAY['bakery']::text[])`, '22023');
  await rejects(`SELECT public.submit_category_selection('${roomId}','${hostToken}',${s.room.version},ARRAY['juice']::text[])`, '22023');
  await rejects(`SELECT public.submit_category_selection('${roomId}','${hostToken}',${s.room.version},ARRAY['tea']::text[])`, '22023');

  // Allows breakfast concrete categories
  s = await category(roomId, hostToken, s.room.version, ['street_folk', 'sandwiches']);
  check(s.room.category_summary.tally.street_folk === 1, 'Street folk tallied in breakfast');
  check(s.room.category_summary.tally.sandwiches === 1, 'Sandwiches tallied in breakfast');
  check(!('burger' in s.room.category_summary.tally), 'Burger not present in breakfast tally');

  // Guest1 submits Any Breakfast wildcard
  s = await category(roomId, guest1, s.room.version, ['any_breakfast']);
  check(s.room.category_summary.tally.street_folk === 2, 'Any Breakfast wildcard boosts street folk');
  check(s.room.category_summary.tally.sandwiches === 2, 'Any Breakfast wildcard boosts sandwiches');

  // Test 4: Preferences architecture
  // Guest suggests preference:healthy
  gState = await toggleSugg(roomId, guest2, 'preference:healthy');
  check(gState.suggestions.some((x) => x.target === 'preference:healthy'), 'Preference healthy suggested');

  // Non-host cannot set preference
  await rejects(`SELECT public.set_room_preference('${roomId}','${guest1}',${s.room.version},'healthy',true)`, '42501');

  // Host enables healthy preference
  s = await setPref(roomId, hostToken, s.room.version, 'healthy', true);
  check(s.room.preferences.includes('healthy'), 'Healthy preference enabled on room');
  check(!s.suggestions.some((x) => x.target === 'preference:healthy'), 'Enabling preference clears its suggestion');

  // Host switches mode: Breakfast -> Cafes
  s = await switchMode(roomId, hostToken, s.room.version, 'cafes');
  check(s.room.room_mode === 'cafes', 'Room mode is now cafes');
  check(s.room.stage === 'swiping', 'Cafes mode is in swiping');
  check(s.room.preferences.length === 0, 'Switching mode purges room preferences');

  // Cafes mode rejects category voting
  await rejects(`SELECT public.submit_category_selection('${roomId}','${hostToken}',${s.room.version},ARRAY['any_breakfast']::text[])`, 'PT409');

  // Joining during Cafes mode is allowed!
  const guest3 = 'guest3-cafes-00001';
  const joinedCafes = await joinRoom('MODE', guest3, 'Guest3');
  check(joinedCafes.room.room_mode === 'cafes' && joinedCafes.room.stage === 'swiping', 'Guest can join in Cafes mode');

  // Host switches: Cafes -> Food ("Back to Food")
  s = await switchMode(roomId, hostToken, joinedCafes.room.version, 'food');
  check(s.room.room_mode === 'food', 'Back to Food restores food mode');
  check(s.room.stage === 'voting', 'Back to Food restores voting stage');
  check(s.room.category_summary.status === 'pending', 'Category voting starts fresh');

  // Test 5: All-wildcard Any Breakfast tiebreaker
  let b = await create('BKFT', 'bkft-host-token-0001');
  const bkftRoom = b.room.id;
  const jb = await joinRoom('BKFT', 'bkft-guest-token-0001', 'GuestB');
  b = await switchMode(bkftRoom, 'bkft-host-token-0001', jb.room.version, 'breakfast');

  // Both host and guest pick any_breakfast
  b = await category(bkftRoom, 'bkft-host-token-0001', b.room.version, ['any_breakfast']);
  b = await category(bkftRoom, 'bkft-guest-token-0001', b.room.version, ['any_breakfast']);
  check(b.room.stage === 'tiebreaker', 'All-wildcard Breakfast initiates tiebreaker');
  check(b.room.winning_category === null, 'All-wildcard does not pick any_breakfast as category');
  check(
    b.room.tied_categories.includes('street_folk') && b.room.tied_categories.includes('sandwiches'),
    'Tied categories derived from breakfast universe'
  );

  // Breakfast mode allows 'breakfast' concrete category
  let bk2 = await create('BKF2', 'bkf2-host-token-0001');
  const bk2Room = bk2.room.id;
  bk2 = await switchMode(bk2Room, 'bkf2-host-token-0001', bk2.room.version, 'breakfast');
  bk2 = await category(bk2Room, 'bkf2-host-token-0001', bk2.room.version, ['breakfast']);
  check(bk2.room.stage === 'consensus' && bk2.room.winning_category === 'breakfast', 'Breakfast mode accepts breakfast category');

  // Test 6: Food mode all-wildcard derivation excludes cleaned categories
  let fw = await create('FWLD', 'fwld-host-token-0001');
  const fwRoom = fw.room.id;
  const jfw = await joinRoom('FWLD', 'fwld-guest-token-0001', 'GuestFW');
  fw = await category(fwRoom, 'fwld-host-token-0001', jfw.room.version, ['flexible']);
  fw = await category(fwRoom, 'fwld-guest-token-0001', fw.room.version, ['flexible']);
  check(fw.room.stage === 'tiebreaker', 'Food mode all-wildcard enters tiebreaker');
  check(Array.isArray(fw.room.tied_categories) && fw.room.tied_categories.length >= 2, 'Tied categories derived');
  for (const removed of ['breakfast', 'healthy', 'coffee', 'dessert']) {
    check(!fw.room.tied_categories.includes(removed), `Food all-wildcard tiebreaker excludes ${removed}`);
  }

  await db.exec('RESET ROLE');
  console.log(`PASS: ${checks} Room Modes, Preferences, and Suggestions PostgreSQL checks.`);
} finally {
  await db.close();
}
