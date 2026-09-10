import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const expectedHash = 'c90868219c47faa8ad6b07096a73c01c5720aa53f065f9fbbb977857a70fd3f3';
const input = process.argv[2];
assert(input, 'Usage: node scripts/check-burger-dataset.mjs <cleaned-json>');
const raw = readFileSync(input);
assert.equal(createHash('sha256').update(raw).digest('hex'), expectedHash, 'unexpected dataset SHA-256');
const data = JSON.parse(raw.toString('utf8').replace(/^\uFEFF/, ''));
const brands = data.section_1_brand_intelligence;
const branches = data.section_2_google_physical_branch_inventory;
const report = data.section_4_final_completion_report;
const removed = report.removed_not_google_maps_verified;

assert.equal(brands.length, 10);
assert.equal(branches.length, 33);
assert.equal(new Set(brands.map(x => x.brand_id_hint)).size, 10);
assert.equal(brands.filter(x => x.research_use === 'production_ready').length, 9);
assert.equal(brands.filter(x => x.research_use === 'usable_with_caution').length, 1);
assert.equal(new Set(branches.map(x => x.google_identity.google_place_id)).size, 33);
assert.equal(new Set(branches.map(x => x.google_identity.google_maps_url)).size, 33);
assert(branches.every(x => x.google_identity.status === 'verified' && x.google_identity.google_place_id && x.google_identity.google_maps_url));
assert(branches.every(x => Number.isFinite(x.location.latitude) && Number.isFinite(x.location.longitude) && x.location.formatted_address));
assert(branches.every(x => x.business_status === 'OPERATIONAL' && x.google_reputation.rating != null && x.google_reputation.review_count != null));
assert(branches.every(x => x.research.research_use === 'production_ready'));
assert.equal(branches.filter(x => x.location.district_normalized).length, 30);
assert.equal(branches.filter(x => x.google_price.price_level || x.google_price.price_range_display).length, 8);
assert.equal(removed.length, 5);
assert(removed.every(x => !branches.some(b => b.brand_name_en === x.brand_name_en && b.branch_name_en === x.branch_name_en)));
assert.equal(brands.flatMap(x => x.best_sellers).length, 11);
assert.equal(report.production_ready_google_branches, branches.length);
assert(readFileSync('supabase/migrations/20260911000100_jeddah_burger_google_verified_catalog.sql', 'utf8').toLowerCase().includes(expectedHash));

console.log('PASS: certified input SHA; 10 brands, 33 exact Google branches, 11 best sellers, 30 districts and 8 Google price records.');
