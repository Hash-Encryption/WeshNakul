import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });

try {
  const geography = await server.ssrLoadModule('/src/data/jeddahDistricts.ts');
  const cities = await server.ssrLoadModule('/src/lib/cities.ts');
  const migration = await readFile('supabase/migrations/20260910000100_jeddah_geography_intelligence.sql', 'utf8');
  const { JEDDAH_DISTRICT_LIST: districts, JEDDAH_DISTRICTS: byId, normalizeJeddahDistrict, getSecondRingDistrictIds } = geography;
  let checks = 0;
  const check = (value, message) => { assert.ok(value, message); checks += 1; };

  check(districts.length === 26, 'all 26 supported Jeddah districts are present');
  check(new Set(districts.map(({ id }) => id)).size === districts.length, 'district IDs are unique');
  check(districts.every(({ nameAr, nameEn, aliases, macroZone }) => nameAr && nameEn && aliases.length && macroZone), 'district metadata is complete');

  const aliases = new Map();
  for (const district of districts) {
    for (const alias of [district.id, district.nameAr, district.nameEn, ...district.aliases]) {
      const normalized = alias.trim().toLocaleLowerCase('en-US').replace(/[-_\s]+/g, ' ');
      check(!aliases.has(normalized) || aliases.get(normalized) === district.id, `unambiguous alias: ${alias}`);
      aliases.set(normalized, district.id);
    }
    check(!district.neighbors.includes(district.id), `${district.id} does not neighbor itself`);
    check(new Set(district.neighbors).size === district.neighbors.length, `${district.id} has no duplicate neighbors`);
    for (const neighborId of district.neighbors) {
      check(Boolean(byId[neighborId]), `${district.id} references a supported neighbor`);
      check(byId[neighborId].neighbors.includes(district.id), `${district.id} <> ${neighborId} is symmetric`);
    }

    const secondRing = getSecondRingDistrictIds(district.id);
    check(!secondRing.includes(district.id), `${district.id} second ring excludes self`);
    check(secondRing.every((id) => !district.neighbors.includes(id)), `${district.id} second ring excludes direct neighbors`);
    check(new Set(secondRing).size === secondRing.length, `${district.id} second ring is deduplicated`);
    check(secondRing.every((id) => Boolean(byId[id])), `${district.id} second ring references supported districts`);
  }

  for (const [input, expected] of [
    ['Rawdah', 'al_rawdah'], ['Ar Rawdah', 'al_rawdah'], ['الروضة', 'al_rawdah'],
    ['Muhammadiyah', 'al_mohammadiyyah'], ['المحمدية', 'al_mohammadiyyah'],
    ['Obhur', 'abhur_al_shamaliyah'], ['أبحر الشمالية', 'abhur_al_shamaliyah'],
    ['South Obhur', 'abhur_al_janoubiyah'], ['أبحر الجنوبية', 'abhur_al_janoubiyah'],
    ['Al Ruwais', 'al_ruwais'], ['Al Thaghr', 'al_thaghr'], ['Al Balad', 'al_balad'],
    ['Al Hamdaniyah', 'al_hamdaniyah'], ['Al Sheraa', 'al_sheraa'],
  ]) {
    check(normalizeJeddahDistrict(input) === expected, `${input} resolves to ${expected}`);
  }
  check(normalizeJeddahDistrict('Al Something Else') === null, 'unknown district remains unknown');

  const jeddah = cities.SAUDI_CITIES.find(({ id }) => id === 'jeddah');
  check(jeddah?.districts.length === districts.length, 'UI reuses the canonical Jeddah catalog');
  check(jeddah?.districts.every((district, index) => district.id === districts[index].id), 'UI district IDs match the catalog');

  const sqlArray = (values) => values.length ? `ARRAY[${values.map((value) => `'${value.replaceAll("'", "''")}'`).join(',')}]` : "'{}'";
  for (const district of districts) {
    const row = `('${district.id}', '${district.nameAr}', '${district.nameEn}', ${sqlArray(district.aliases)}, '${district.macroZone}', ${sqlArray(district.neighbors)})`;
    check(migration.includes(row), `${district.id} private SQL snapshot matches the canonical catalog`);
  }

  console.log(`PASS: ${checks} canonical Jeddah district, alias, graph, second-ring and UI contract checks`);
} finally {
  await server.close();
}
