import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
// Temporary test-only runtime; no app dependency or remote database access.
const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const { PGlite } = await import(pathToFileURL(runtime).href);
const db = new PGlite();
let checks = 0;
const query = async sql => (await db.query(sql)).rows;
const rejects = async (sql, code) => { await assert.rejects(() => db.exec(sql), error => error.code === code); checks++; };
try {
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
  // Execute the actual complete restaurant schema + seed. Historical room migrations are unrelated prerequisites.
  await db.exec(readFileSync('supabase/migrations/005_create_and_seed_restaurants.sql', 'utf8'));
  const before = await query('SELECT * FROM restaurants ORDER BY id');
  assert(before.length > 0);
  const legacyColumns = Object.keys(before[0]);
  const schema = readFileSync('supabase/migrations/20260908000100_restaurant_intelligence.sql', 'utf8');
  const backfill = readFileSync('supabase/migrations/20260908000200_restaurant_legacy_provenance.sql', 'utf8');
  await db.exec(schema); await db.exec(backfill);
  if (process.argv.includes('--write-inventory')) {
    mkdirSync('docs', {recursive:true});
    const inventory = [];
    for (const [label,sql] of [
      ['Enums', "SELECT t.typname AS name, string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS definition FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' GROUP BY t.typname ORDER BY t.typname"],
      ['Constraints', "SELECT c.conname AS name, c.conrelid::regclass::text AS entity, pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public' ORDER BY entity,name"],
      ['Indexes', "SELECT indexname AS name, tablename AS entity, indexdef AS definition FROM pg_indexes WHERE schemaname='public' ORDER BY tablename,indexname"],
      ['Policies', "SELECT policyname AS name, tablename AS entity, cmd || ' TO ' || roles::text || ' USING ' || qual AS definition FROM pg_policies WHERE schemaname='public' ORDER BY tablename,policyname"],
    ]) {
      const rows=await query(sql);
      inventory.push('## '+label+'\n\n| Name | Entity | Definition |\n| --- | --- | --- |\n'+rows.map(r=>'| '+r.name+' | '+(r.entity??'public')+' | '+r.definition.replaceAll('|','\\|')+' |').join('\n'));
    }
    writeFileSync('docs/restaurant-intelligence-schema-inventory.md','# Restaurant schema inventory\n\nGenerated from the actual disposable PostgreSQL database after the legacy restaurant migration and both Phase 1 migrations. Includes pre-existing restaurants constraints/indexes/public-read policy for context. No room tables are modified.\n\n'+inventory.join('\n\n')+'\n');
  }
  assert.deepEqual(await query(`SELECT ${legacyColumns.join(',')} FROM restaurants ORDER BY id`), before); checks++;
  assert.equal((await query("SELECT count(*)::int AS n FROM restaurants WHERE intelligence_origin = 'legacy_seed' AND research_use = 'manual_review_only' AND manual_review_required AND editorial_role IS NULL AND trend_status = 'unknown' AND city IS NULL"))[0].n, before.length); checks++;
  for (const table of ['restaurant_branches','delivery_platform_listings','restaurant_best_sellers','restaurant_sources','restaurant_trend_signals']) {
    assert.equal((await query(`SELECT count(*)::int AS n FROM ${table}`))[0].n, 0); checks++;
    assert.equal((await query(`SELECT relrowsecurity FROM pg_class WHERE relname = '${table}'`))[0].relrowsecurity, true); checks++;
  }
  await db.exec(backfill);
  assert.deepEqual(await query(`SELECT ${legacyColumns.join(',')} FROM restaurants ORDER BY id`), before); checks++;
  const brand = before[0].id.replaceAll("'", "''"), other = before[1].id.replaceAll("'", "''");
  await db.exec(`UPDATE restaurants SET editorial_role='discovery',trend_status='rising' WHERE id='${brand}'; UPDATE restaurants SET editorial_role='staple',trend_status='trending' WHERE id='${other}';`);
  for (const value of ['production_ready','usable_with_caution','manual_review_only','rejected']) {
    await db.exec(`UPDATE restaurants SET research_use='${value}' WHERE id='${brand}'`); checks++;
  }
  await rejects(`UPDATE restaurants SET research_use='approved' WHERE id='${brand}'`, '22P02');
  await rejects(`UPDATE restaurants SET editorial_role='trend' WHERE id='${brand}'`, '22P02');
  await rejects(`UPDATE restaurants SET meal_period_strength='{"breakfast":"93"}' WHERE id='${brand}'`, '23514');
  await db.exec(`UPDATE restaurants SET meal_period_strength='{"breakfast":"weak"}',serves_breakfast_menu=false WHERE id='${brand}'`);
  await rejects(`UPDATE restaurants SET reputation_tags=ARRAY['invented'] WHERE id='${brand}'`, '23514');
  await rejects(`UPDATE restaurants SET estimated_sar_per_person_min=100,estimated_sar_per_person_max=20 WHERE id='${brand}'`, '23514');
  const b = (await query(`INSERT INTO restaurant_branches(restaurant_id) VALUES ('${brand}') RETURNING *`))[0];
  assert.equal(b.google_place_id, null); assert.equal(b.google_rating, null); assert.equal(b.dine_in, null); checks++;
  await rejects("INSERT INTO restaurant_branches(restaurant_id) VALUES ('absent-brand')", '23503');
  await rejects(`UPDATE restaurant_branches SET latitude=91,longitude=0 WHERE id='${b.id}'`, '23514');
  await rejects(`UPDATE restaurant_branches SET latitude=21 WHERE id='${b.id}'`, '23514');
  await rejects(`UPDATE restaurant_branches SET google_rating=4.5 WHERE id='${b.id}'`, '23514');
  await db.exec(`UPDATE restaurant_branches SET google_rating=4.3,rating_source='google_derived_secondary',maps_lookup_status='secondary_only' WHERE id='${b.id}'`);
  await rejects(`UPDATE restaurant_branches SET rating_source='google_maps_direct' WHERE id='${b.id}'`, '23514');
  await db.exec(`UPDATE restaurant_branches SET rating_source='google_maps_direct',maps_lookup_status='verified',google_place_id='synthetic-test-place',google_review_count=20 WHERE id='${b.id}'`);
  assert.equal((await query(`SELECT rating_source FROM restaurant_branches WHERE id='${b.id}'`))[0].rating_source,'google_maps_direct'); checks++;
  await rejects(`INSERT INTO restaurant_branches(restaurant_id,google_place_id) VALUES ('${brand}','synthetic-test-place')`, '23505');
  const listing = (await query(`INSERT INTO delivery_platform_listings(restaurant_id,platform,service_area_label) VALUES ('${brand}','hungerstation','Test service area') RETURNING *`))[0];
  assert.equal(listing.matched_branch_id,null); assert.equal(listing.direct_url,null); checks++;
  assert.equal((await query('SELECT count(*)::int AS n FROM restaurant_branches'))[0].n,1); checks++;
  await rejects(`UPDATE delivery_platform_listings SET direct_url='https://www.google.com/search?q=test' WHERE id='${listing.id}'`, '23514');
  await rejects(`UPDATE delivery_platform_listings SET direct_url='https://hungerstation.com/sa-ar/search?q=test' WHERE id='${listing.id}'`, '23514');
  await rejects(`UPDATE delivery_platform_listings SET matched_branch_id='${b.id}' WHERE id='${listing.id}'`, '23514');
  await rejects(`INSERT INTO delivery_platform_listings(restaurant_id,platform,matched_branch_id,match_confidence,match_method) VALUES ('${other}','jahez','${b.id}','high','manual')`, '23503');
  await db.exec(`UPDATE delivery_platform_listings SET matched_branch_id='${b.id}',match_confidence='high',match_method='manual' WHERE id='${listing.id}'`);
  await rejects(`INSERT INTO restaurant_best_sellers(restaurant_id) VALUES ('${brand}')`, '23514');
  const seller = (await query(`INSERT INTO restaurant_best_sellers(restaurant_id,name_en) VALUES ('${brand}','Synthetic fixture dish') RETURNING id`))[0];
  await rejects(`INSERT INTO restaurant_sources(restaurant_id,source_type,source_url,supports,date_checked,evidence_quality) VALUES ('${brand}','aggregator','https://example.test',ARRAY['name'],now(),'primary')`, '23514');
  const source = (await query(`INSERT INTO restaurant_sources(restaurant_id,branch_id,best_seller_id,source_type,source_url,supports,date_checked,evidence_quality) VALUES ('${brand}','${b.id}','${seller.id}','official_menu','https://example.test/menu',ARRAY['best_sellers.name_en'],now(),'primary') RETURNING id`))[0];
  await rejects(`INSERT INTO restaurant_trend_signals(restaurant_id,platform,signal_type,observed_at,source_id) VALUES ('${other}','test','test',now(),'${source.id}')`, '23503');
  await db.exec(`INSERT INTO restaurant_trend_signals(restaurant_id,platform,signal_type,observed_at,source_id) VALUES ('${brand}','test','test',now(),'${source.id}')`);
  for (const table of ['restaurants','restaurant_branches','delivery_platform_listings','restaurant_best_sellers','restaurant_sources','restaurant_trend_signals']) {
    for (const role of ['anon','authenticated']) {
      await db.exec(`SET ROLE ${role}`);
      await query(`SELECT * FROM ${table} LIMIT 1`); checks++;
      await rejects(`DELETE FROM ${table} WHERE false`, '42501');
      await rejects(`UPDATE ${table} SET id=id WHERE false`, '42501');
      await rejects(`INSERT INTO ${table} DEFAULT VALUES`, '42501');
      await db.exec('RESET ROLE');
    }
  }
  await db.exec(`UPDATE restaurant_branches SET updated_at='2000-01-01' WHERE id='${b.id}'`);
  assert(new Date((await query(`SELECT updated_at FROM restaurant_branches WHERE id='${b.id}'`))[0].updated_at).getFullYear() > 2000); checks++;
  await db.exec(`DELETE FROM restaurants WHERE id='${brand}'`);
  for (const table of ['restaurant_branches','delivery_platform_listings','restaurant_best_sellers','restaurant_sources','restaurant_trend_signals']) {
    assert.equal((await query(`SELECT count(*)::int AS n FROM ${table} WHERE restaurant_id='${brand}'`))[0].n,0); checks++;
  }
  console.log(`PASS: ${checks} PostgreSQL checks; ${before.length} original restaurant rows preserved; enums, FKs, unknowns, provenance, RLS/grants, timestamps and cascades.`);
} finally { await db.close(); }
