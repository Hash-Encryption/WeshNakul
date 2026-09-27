import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

async function main() {
  const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
  const { PGlite } = await import(pathToFileURL(runtime).href);
  const db = new PGlite();
  const migration = f => fs.readFileSync(`supabase/migrations/${f}`, 'utf8').replace(/^\uFEFF/, '');

  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');
  await db.exec(migration('20260902_initial_schema.sql').replace('create extension if not exists "pgcrypto";', ''));
  await db.exec(migration('20260910000100_jeddah_geography_intelligence.sql'));
  await db.exec(migration('20260926000100_expand_jeddah_geography_30_districts.sql'));

  const dists = await db.query(`SELECT district_id, name_en, name_ar, center_lat, center_lng FROM private.district_geography;`);
  console.log('Districts count:', dists.rows.length);

  // Check closest district to Pie Box (21.4868497, 39.23268)
  const pbLat = 21.4868497;
  const pbLng = 39.23268;
  const sortedPb = dists.rows.map(d => {
    const dist = Math.hypot(d.center_lat - pbLat, d.center_lng - pbLng);
    return { ...d, dist };
  }).sort((a, b) => a.dist - b.dist);
  console.log('\nClosest districts to Pie Box:');
  sortedPb.slice(0, 5).forEach(d => console.log(`  ${d.district_id} (${d.name_en} / ${d.name_ar}): distance score ${d.dist.toFixed(4)}`));

  // Check closest district to Manqousheh Hut (21.606694, 39.122082)
  const mqLat = 21.606694;
  const mqLng = 39.122082;
  const sortedMq = dists.rows.map(d => {
    const dist = Math.hypot(d.center_lat - mqLat, d.center_lng - mqLng);
    return { ...d, dist };
  }).sort((a, b) => a.dist - b.dist);
  console.log('\nClosest districts to Manqousheh Hut:');
  sortedMq.slice(0, 5).forEach(d => console.log(`  ${d.district_id} (${d.name_en} / ${d.name_ar}): distance score ${d.dist.toFixed(4)}`));

  await db.close();
}

main().catch(console.error);
