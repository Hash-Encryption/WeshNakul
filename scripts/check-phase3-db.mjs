import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const runtime=process.env.PGLITE_MODULE||join(tmpdir(),'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const {PGlite}=await import(pathToFileURL(runtime).href),db=new PGlite();
const migration=file=>readFileSync(`supabase/migrations/${file}`,'utf8').replace(/^\uFEFF/,''),query=async sql=>(await db.query(sql)).rows;
let checks=0;const check=(value,message)=>{assert.ok(value,message);checks++};
const rejects=async(sql,code)=>{await assert.rejects(()=>db.exec(sql),error=>error.code===code);checks++};

try {
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');
  for(const file of [
    '20260902_initial_schema.sql','002_food_consensus.sql','003_restaurant_swipes.sql','005_create_and_seed_restaurants.sql',
    '006_squad_order_scratchpad.sql','007_room_expiration_and_cleanup.sql','20260908000100_restaurant_intelligence.sql','20260908000200_restaurant_legacy_provenance.sql',
    '20260908000300_room_host_coordinates.sql'
  ]) await db.exec(migration(file).replace('create extension if not exists "pgcrypto";',''));
  await db.exec('ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE(room_id,session_token);');
  for(const file of ['20260909000100_private_restaurant_decks.sql','20260909000200_private_participant_sessions.sql','20260910000100_jeddah_geography_intelligence.sql','20260911000100_jeddah_burger_google_verified_catalog.sql','20260911000200_remove_legacy_public_room_coordinates.sql','20260911000300_phase3_authoritative_consensus.sql']) await db.exec(migration(file));

  const esc=value=>String(value).replaceAll("'","''"),state=rows=>rows[0].state;
  const rpc=async(sql)=>state(await query(`SELECT ${sql} state`));
  const create=async(code,token,nickname='Host')=>rpc(`public.create_room_authorized('${code}','${token}','dine_in','jeddah','al_rawdah','en','${nickname}',NULL,NULL)`);
  const joinRoom=async(code,token,nickname)=>rpc(`public.join_room_authorized('${code}','${token}','${nickname}')`);
  const start=async(room,token,version)=>rpc(`public.start_category_voting('${room}','${token}',${version})`);
  const category=async(room,token,version,categories)=>rpc(`public.submit_category_selection('${room}','${token}',${version},ARRAY[${categories.map(x=>`'${x}'`).join(',')}]::text[])`);
  const begin=async(room,token,version)=>rpc(`public.begin_restaurant_voting('${room}','${token}',${version})`);
  const vote=async(room,token,version,deck,restaurant,value)=>rpc(`public.submit_restaurant_vote('${room}','${token}',${version},'${deck}','${esc(restaurant)}','${value}')`);
  const tie=async(room,token,version,method,restaurant=null)=>rpc(`public.resolve_restaurant_tie('${room}','${token}',${version},'${method}',${restaurant?`'${esc(restaurant)}'`:'NULL'})`);
  const settleRace=async(actions)=>{const results=await Promise.allSettled(actions.map(action=>action()));check(results.filter(x=>x.status==='fulfilled').length===1,'race has exactly one winner');return results.find(x=>x.status==='fulfilled').value;};

  await db.exec('SET ROLE anon');

  // Category wildcard, replacement, validation, stale protection and deterministic tie state.
  const hostToken='host-token-0000000001',guest1='guest-token-00000001',guest2='guest-token-00000002';
  let s=await create('P301',hostToken),room=s.room.id;
  await joinRoom('P301',guest1,'A');await joinRoom('P301',guest2,'B');s=await start(room,hostToken,s.room.version);
  s=await category(room,hostToken,s.room.version,['burger','pizza']);
  await rejects(`SELECT public.submit_category_selection('${room}','${guest1}',${s.room.version},NULL)`,'22023');
  await rejects(`SELECT public.submit_category_selection('${room}','${guest1}',${s.room.version},ARRAY[]::text[])`,'22023');
  await rejects(`SELECT public.submit_category_selection('${room}','${guest1}',${s.room.version},ARRAY['burger','burger'])`,'22023');
  await rejects(`SELECT public.submit_category_selection('${room}','${guest1}',${s.room.version},ARRAY['impossible'])`,'22023');
  s=await category(room,guest1,s.room.version,['flexible']);
  const stale=s.room.version-1;await rejects(`SELECT public.submit_category_selection('${room}','${guest2}',${stale},ARRAY['burger'])`,'PT409');
  s=await category(room,guest2,s.room.version,['burger','shawarma']);
  check(s.room.stage==='consensus'&&s.room.winning_category==='burger','wildcard maximizes acceptance without becoming cuisine');
  check(s.room.category_summary.tally.burger===3&&s.room.category_summary.tally.pizza===2,'server category tally is canonical');
  await rejects(`SELECT public.submit_category_selection('${room}','${guest2}',${s.room.version},ARRAY['pizza'])`,'PT409');
  await db.exec('RESET ROLE');check((await query(`SELECT count(*)::int n FROM food_choices WHERE room_id='${room}'`))[0].n===3,'one category state per participant');await db.exec('SET ROLE anon');

  const tieHost='tie-host-token-000001',tieGuest='tie-guest-token-00001';
  let t=await create('P302',tieHost);const tieRoom=t.room.id;await joinRoom('P302',tieGuest,'Guest');t=await start(tieRoom,tieHost,t.room.version);
  t=await category(tieRoom,tieHost,t.room.version,['burger','pizza']);t=await category(tieRoom,tieGuest,t.room.version,['burger','pizza']);
  check(t.room.stage==='tiebreaker'&&t.room.tied_categories.join(',')==='burger,pizza','equal strongest support is an explicit ordered tie');
  await rejects(`SELECT public.resolve_category_tie('${tieRoom}','${tieGuest}',${t.room.version},'choose_for_us',NULL)`,'42501');
  await rejects(`SELECT public.resolve_category_tie('${tieRoom}','${tieHost}',${t.room.version},'host_pick','shawarma')`,'22023');
  t=await rpc(`public.resolve_category_tie('${tieRoom}','${tieHost}',${t.room.version},'choose_for_us',NULL)`);
  check(['burger','pizza'].includes(t.room.winning_category)&&t.room.stage==='consensus','server random category stays in tied set');

  // Concurrent category submissions: one version wins and the stale peer cannot corrupt it.
  const raceHost='race-host-token-00001',raceGuest='race-guest-token-0001';let c=await create('P303',raceHost),raceRoom=c.room.id;
  await joinRoom('P303',raceGuest,'Guest');c=await start(raceRoom,raceHost,c.room.version);const raceVersion=c.room.version;
  c=await settleRace([()=>category(raceRoom,raceHost,raceVersion,['burger']),()=>category(raceRoom,raceGuest,raceVersion,['pizza'])]);
  const missingToken=c.myCategorySelection?.participant_id===c.room.host_participant_id?raceGuest:raceHost;
  await rejects(`SELECT public.resolve_category_tie('${raceRoom}','${raceHost}',${c.room.version},'choose_for_us',NULL)`,'PT409');
  const submittedToken=missingToken===raceGuest?raceHost:raceGuest;
  c=await settleRace([()=>category(raceRoom,missingToken,c.room.version,['burger']),()=>category(raceRoom,submittedToken,c.room.version,['burger'])]);
  if(c.room.stage==='voting')c=await category(raceRoom,missingToken,c.room.version,['burger']);
  check(['consensus','tiebreaker'].includes(c.room.stage),'concurrent completion creates one category outcome');

  // Duplicate final category submissions cannot advance a room twice.
  const duplicateCategoryToken='duplicate-category-001';let dc=await create('P306',duplicateCategoryToken),dcRoom=dc.room.id;
  dc=await start(dcRoom,duplicateCategoryToken,dc.room.version);dc=await settleRace([
    ()=>category(dcRoom,duplicateCategoryToken,dc.room.version,['burger']),
    ()=>category(dcRoom,duplicateCategoryToken,dc.room.version,['burger'])
  ]);
  check(dc.room.stage==='consensus'&&dc.room.version===2,'duplicate category completion commits once');

  // Start restaurant voting atomically with one persisted Gen0 deck.
  s=await begin(room,hostToken,s.room.version);let deck=s.deck;check(deck.generation===0&&deck.restaurants.length===7,'atomic start persists one Gen0 deck');
  const returned=await rpc(`public.get_or_create_restaurant_deck('${room}','${s.room.host_participant_id}','${hostToken}',NULL)`);
  check(returned.deckId===deck.deckId,'Gen0 retries return the same deck');
  await rejects(`SELECT public.get_or_create_restaurant_deck('${room}','${s.room.host_participant_id}','${hostToken}','${deck.deckId}')`,'PT409');

  // LATER is stored, revisitable and replaced in-place; it is never counted as NO.
  const first=deck.restaurants[0].id;s=await vote(room,hostToken,s.room.version,deck.deckId,first,'LATER');
  check(s.room.restaurant_summary.cards[0].laterCount===1&&s.room.restaurant_summary.cards[0].noCount===0,'LATER remains distinct');
  s=await vote(room,hostToken,s.room.version,deck.deckId,first,'YES');
  await db.exec('RESET ROLE');let rows=await query(`SELECT vote,count(*)::int n FROM restaurant_swipes WHERE room_id='${room}' AND participant_id='${s.room.host_participant_id}' AND restaurant_id='${esc(first)}' GROUP BY vote`);
  check(rows.length===1&&rows[0].vote==='YES'&&rows[0].n===1,'vote update replaces the current card state');await db.exec('SET ROLE anon');
  const second=deck.restaurants[1].id;s=await settleRace([
    ()=>vote(room,hostToken,s.room.version,deck.deckId,second,'YES'),
    ()=>vote(room,hostToken,s.room.version,deck.deckId,second,'YES')
  ]);
  s=await vote(room,hostToken,s.room.version,deck.deckId,second,'NO');
  await db.exec('RESET ROLE');rows=await query(`SELECT count(*)::int n FROM restaurant_swipes WHERE room_id='${room}' AND participant_id='${s.room.host_participant_id}' AND restaurant_id='${esc(second)}'`);
  check(rows[0].n===1,'duplicate vote retry leaves one current row');await db.exec('SET ROLE anon');
  await rejects(`SELECT public.resolve_restaurant_tie('${room}','${hostToken}',${s.room.version},'choose_for_us',NULL)`,'PT409');

  // Simultaneous restaurant votes use version conflicts, then canonical retry.
  const sameVersion=s.room.version;s=await settleRace([
    ()=>vote(room,guest1,sameVersion,deck.deckId,first,'NO'),
    ()=>vote(room,guest2,sameVersion,deck.deckId,first,'NO')
  ]);
  // Determine the missing bearer authoritatively without trusting returned participant IDs.
  for(const token of [guest1,guest2]){const own=await rpc(`public.get_room_decision_state('${room}','${token}')`);if(!own.myVotes[first])s=await vote(room,token,s.room.version,deck.deckId,first,'NO');}

  // Complete all cards: one YES produces exactly one normal winner and preserves the selected branch.
  for(const token of [hostToken,guest1,guest2])for(const restaurant of deck.restaurants){
    const own=await rpc(`public.get_room_decision_state('${room}','${token}')`);if(!['YES','NO'].includes(own.myVotes[restaurant.id]||''))
      s=await vote(room,token,s.room.version,deck.deckId,restaurant.id,token===hostToken&&restaurant.id===first?'YES':'NO');
  }
  check(s.room.stage==='matched'&&s.room.winning_restaurant_id===first&&s.room.winning_resolution_method==='normal_consensus','single top support finalizes normally');
  check(s.room.winning_deck_id===deck.deckId&&s.room.winning_branch_id===deck.restaurants[0].selectedBranch?.id,'final decision preserves Phase 2 deck and exact branch');
  await rejects(`SELECT public.submit_restaurant_vote('${room}','${guest1}',${s.room.version},'${deck.deckId}','${esc(first)}','YES')`,'PT409');

  // Restaurant tie, host restriction, invalid candidate, host pick, and double-finalization race.
  const rh='restaurant-host-0001',rg='restaurant-guest-001';let r=await create('P304',rh),rr=r.room.id;await joinRoom('P304',rg,'Guest');r=await start(rr,rh,r.room.version);
  r=await category(rr,rh,r.room.version,['burger']);r=await category(rr,rg,r.room.version,['burger']);r=await begin(rr,rh,r.room.version);const rd=r.deck;
  for(const token of [rh,rg])for(const [index,restaurant] of rd.restaurants.entries())r=await vote(rr,token,r.room.version,rd.deckId,restaurant.id,(token===rh&&index===0)||(token===rg&&index===1)?'YES':'NO');
  check(r.room.restaurant_state==='tie'&&r.room.restaurant_summary.tiedRestaurantIds.length===2,'equal top restaurant support creates explicit tie');
  await rejects(`SELECT public.resolve_restaurant_tie('${rr}','${rg}',${r.room.version},'host_pick','${esc(rd.restaurants[0].id)}')`,'42501');
  await rejects(`SELECT public.resolve_restaurant_tie('${rr}','${rh}',${r.room.version},'host_pick','not-in-tie')`,'22023');
  await rejects(`SELECT public.resolve_restaurant_tie('${rr}','${rh}',${r.room.version},'host_pick','${esc(deck.restaurants[0].id)}')`,'22023');
  r=await settleRace([
    ()=>tie(rr,rh,r.room.version,'host_pick',rd.restaurants[0].id),
    ()=>tie(rr,rh,r.room.version,'choose_for_us')
  ]);
  check(r.room.stage==='matched'&&r.room.finalized_at&&r.room.winning_deck_id===rd.deckId,'tie resolver race commits one immutable decision');
  await rejects(`SELECT public.resolve_restaurant_tie('${rr}','${rh}',${r.room.version-1},'choose_for_us',NULL)`,'PT409');

  // Same-method resolver races also commit exactly one result.
  const buildTie=async(code,host,guest)=>{let x=await create(code,host),roomId=x.room.id;await joinRoom(code,guest,'Guest');x=await start(roomId,host,x.room.version);
    x=await category(roomId,host,x.room.version,['burger']);x=await category(roomId,guest,x.room.version,['burger']);x=await begin(roomId,host,x.room.version);const currentDeck=x.deck;
    for(const token of [host,guest])for(const [index,restaurant] of currentDeck.restaurants.entries())x=await vote(roomId,token,x.room.version,currentDeck.deckId,restaurant.id,(token===host&&index===0)||(token===guest&&index===1)?'YES':'NO');
    return {state:x,roomId,deck:currentDeck};};
  let chooseRace=await buildTie('P307','choose-race-host-001','choose-race-guest01');
  chooseRace.state=await settleRace([
    ()=>tie(chooseRace.roomId,'choose-race-host-001',chooseRace.state.room.version,'choose_for_us'),
    ()=>tie(chooseRace.roomId,'choose-race-host-001',chooseRace.state.room.version,'choose_for_us')
  ]);
  check(chooseRace.state.room.stage==='matched','two choose-for-us calls yield one final result');
  let pickRace=await buildTie('P308','host-pick-race-001','host-pick-race-g01');
  pickRace.state=await settleRace([
    ()=>tie(pickRace.roomId,'host-pick-race-001',pickRace.state.room.version,'host_pick',pickRace.deck.restaurants[0].id),
    ()=>tie(pickRace.roomId,'host-pick-race-001',pickRace.state.room.version,'host_pick',pickRace.deck.restaurants[1].id)
  ]);
  check(pickRace.state.room.stage==='matched','two host picks yield one final result');

  // A final normal vote racing a premature resolver still has one valid winner.
  const nh='normal-race-host-001';let n=await create('P309',nh),nr=n.room.id;n=await start(nr,nh,n.room.version);n=await category(nr,nh,n.room.version,['burger']);n=await begin(nr,nh,n.room.version);const nd=n.deck;
  for(const [index,restaurant] of nd.restaurants.entries())if(index<nd.restaurants.length-1)n=await vote(nr,nh,n.room.version,nd.deckId,restaurant.id,index===0?'YES':'NO');
  n=await settleRace([
    ()=>vote(nr,nh,n.room.version,nd.deckId,nd.restaurants.at(-1).id,'NO'),
    ()=>tie(nr,nh,n.room.version,'choose_for_us')
  ]);
  check(n.room.stage==='matched'&&n.room.winning_restaurant_id===nd.restaurants[0].id,'normal finalization beats an invalid tie resolution');

  // All-NO is the only authority for Gen1; old cards fail and exhausted Gen1 stops without Gen2.
  const ah='all-no-host-token-001';let a=await create('P305',ah),ar=a.room.id;a=await start(ar,ah,a.room.version);a=await category(ar,ah,a.room.version,['burger']);a=await begin(ar,ah,a.room.version);const gen0=a.deck;
  for(const restaurant of gen0.restaurants.slice(0,-1))a=await vote(ar,ah,a.room.version,gen0.deckId,restaurant.id,'NO');
  a=await settleRace([
    ()=>vote(ar,ah,a.room.version,gen0.deckId,gen0.restaurants.at(-1).id,'NO'),
    ()=>vote(ar,ah,a.room.version,gen0.deckId,gen0.restaurants[0].id,'YES')
  ]);
  if(a.room.restaurant_summary.generation===0){a=await vote(ar,ah,a.room.version,gen0.deckId,gen0.restaurants[0].id,'NO');a=await vote(ar,ah,a.room.version,gen0.deckId,gen0.restaurants.at(-1).id,'NO');}
  check(a.room.restaurant_summary.generation===1&&a.room.restaurant_state==='voting','canonical all-NO advances exactly to Gen1');
  await rejects(`SELECT public.submit_restaurant_vote('${ar}','${ah}',${a.room.version},'${gen0.deckId}','${esc(gen0.restaurants[0].id)}','YES')`,'PT409');
  const gen1=await rpc(`public.get_or_create_restaurant_deck('${ar}','${a.room.host_participant_id}','${ah}',NULL)`);
  check(gen1.generation===1&&gen1.restaurants.every(x=>!gen0.restaurants.some(y=>y.id===x.id)),'Gen1 contains only remaining non-repeated brands');
  for(const restaurant of gen1.restaurants)a=await vote(ar,ah,a.room.version,gen1.deckId,restaurant.id,'NO');
  check(a.room.restaurant_state==='no_match','Gen1 exhaustion is canonical no_match');
  await rejects(`SELECT public.get_or_create_restaurant_deck('${ar}','${a.room.host_participant_id}','${ah}','${gen1.deckId}')`,'PT409');

  // Malicious direct calls and private enumeration remain blocked.
  await rejects(`SELECT public.get_room_decision_state('${room}','wrong-token-000000')`,'42501');
  await rejects(`SELECT public.get_room_decision_state('${ar}','${hostToken}')`,'42501');
  await rejects(`SELECT public.submit_restaurant_vote('${ar}','${ah}',${a.room.version},'${deck.deckId}','${esc(first)}','YES')`,'PT409');
  await rejects(`SELECT public.get_or_create_restaurant_deck('${room}','${s.room.host_participant_id}','${guest1}',NULL)`,'42501');
  await rejects(`INSERT INTO public.food_choices(room_id,participant_id,selected_categories,is_submitted) VALUES('${room}','${s.room.host_participant_id}',ARRAY['burger'],true)`,'42501');
  await rejects(`UPDATE public.rooms SET winning_restaurant_id='spoofed' WHERE id='${room}'`,'42501');
  await rejects(`SELECT * FROM public.restaurant_swipes`,'42501');
  await rejects(`SELECT * FROM private.room_restaurant_decks`,'42501');
  await rejects(`SELECT session_token FROM public.participants`,'42501');
  await db.exec('RESET ROLE');
  check((await query(`SELECT count(*)::int n FROM private.room_restaurant_decks WHERE room_id='${ar}'`))[0].n===2,'all-NO cannot create Gen2');
  check((await query(`SELECT count(*)::int n FROM rooms WHERE id='${rr}' AND finalized_at IS NOT NULL`))[0].n===1,'one room row is the single final decision');

  console.log(`PASS: ${checks} Phase 3 PostgreSQL functional, privacy, authorization, stale-state, idempotency, generation and concurrency checks.`);
} finally { await db.close(); }
