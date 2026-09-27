import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JEDDAH_DISTRICT_LIST, normalizeJeddahDistrict } from '../src/data/jeddahDistricts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const raw = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs', 'research', 'jeddah-seafood-raw-uploaded.json'), 'utf8'));
const resolved = JSON.parse(fs.readFileSync(path.join(__dirname, 'resolved_seafood_places.json'), 'utf8'));

const canonicalIds = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));
const canonicalNamesEn = new Map(JEDDAH_DISTRICT_LIST.map(d => [d.id, d.nameEn]));

console.log('--- AUDITING DISTRICTS OF ALL 52 SEAFOOD BRANCHES ---');

const districtReport = [];

for (const b of raw.brands) {
  for (const br of (b.branches || [])) {
    const rawDist = br.canonical_district;
    const norm = normalizeJeddahDistrict(rawDist);
    const googleInfo = resolved[br.google_place_id] || {};
    
    districtReport.push({
      brand: b.canonical_name,
      branch: br.branch_name,
      raw_district: rawDist,
      normalized_district_id: norm,
      canonical_name_en: norm ? canonicalNamesEn.get(norm) : null,
      is_canonical: norm !== null,
      coords: [googleInfo.latitude, googleInfo.longitude],
      google_address: googleInfo.address,
      google_district: googleInfo.district_en,
      raw_eligibility: br.production_eligibility
    });
  }
}

const nonCanonical = districtReport.filter(d => !d.is_canonical);
console.log(`Total branches: ${districtReport.length}`);
console.log(`Canonical 30 matches: ${districtReport.length - nonCanonical.length}`);
console.log(`Non-canonical (outer or unrecognized): ${nonCanonical.length}`);

console.log('\n--- NON-CANONICAL BRANCHES ---');
for (const nc of nonCanonical) {
  console.log(`Brand: ${nc.brand} | Branch: ${nc.branch}`);
  console.log(`  Raw District: '${nc.raw_district}' | Normalized: ${nc.normalized_district_id}`);
  console.log(`  Google Address: ${nc.google_address}`);
  console.log(`  Google District: ${nc.google_district}`);
  console.log(`  Coords: ${nc.coords}`);
  console.log('');
}
