import fs from 'node:fs';
import { normalizeJeddahDistrict, JEDDAH_DISTRICT_LIST } from '../src/data/jeddahDistricts.ts';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-fatayer-raw-uploaded.json', 'utf8'));
const places = JSON.parse(fs.readFileSync('scripts/resolved_fatayer_places.json', 'utf8'));

const CANONICAL_30 = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));

console.log('=== AUDIT OF DISTRICTS FOR ALL 52 BRANCHES ===');

const districtAudit = [];

for (const b of raw.brands) {
  for (const br of (b.branches || [])) {
    const rawDist = br.canonical_district;
    const normalized = normalizeJeddahDistrict(rawDist);
    const resolved = br.google_place_id ? places[br.google_place_id] : null;

    districtAudit.push({
      brand: b.canonical_name,
      branch: br.branch_name,
      raw_district: rawDist,
      normalized_id: normalized,
      is_canonical_30: normalized ? CANONICAL_30.has(normalized) : false,
      eligibility: br.production_eligibility,
      status: resolved?.operating_status || br.operating_status,
      lat: resolved?.latitude || br.latitude,
      lng: resolved?.longitude || br.longitude,
      google_addr: resolved?.address || br.formatted_address,
      google_dist: resolved?.district_en
    });
  }
}

console.table(districtAudit.map(d => ({
  brand: d.brand,
  branch: d.branch,
  raw_dist: d.raw_district,
  norm_id: d.normalized_id,
  is_c30: d.is_canonical_30,
  lat: d.lat ? d.lat.toFixed(4) : null,
  lng: d.lng ? d.lng.toFixed(4) : null,
  status: d.status,
  elig: d.eligibility
})));

const nonCanonical = districtAudit.filter(d => !d.is_canonical_30);
console.log('\n--- NON-CANONICAL / OUTER / UNKNOWN DISTRICTS (Count: ' + nonCanonical.length + ') ---');
for (const nc of nonCanonical) {
  console.log(`- ${nc.brand} — ${nc.branch} | Raw Dist: '${nc.raw_district}' | Google Dist: '${nc.google_dist}' | Status: ${nc.status} | Lat/Lng: ${nc.lat}, ${nc.lng} | Address: ${nc.google_addr}`);
}
