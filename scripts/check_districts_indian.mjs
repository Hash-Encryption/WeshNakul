import fs from 'node:fs';
import { normalizeJeddahDistrict, JEDDAH_DISTRICTS } from '../src/data/jeddahDistricts.ts';

const rawData = JSON.parse(fs.readFileSync('docs/research/jeddah-indian-raw-uploaded.json', 'utf8'));
const resolvedPlaces = JSON.parse(fs.readFileSync('scripts/resolved_indian_places_direct.json', 'utf8'));

console.log('=== DISTRICT AUDIT FOR ALL INDIAN BRANCHES ===\n');

for (const b of rawData.brands) {
  for (const br of (b.branches || [])) {
    const key = `${b.canonical_name}::${br.branch_name}`;
    const direct = resolvedPlaces[key];
    
    const rawDistrict = br.canonical_district || br.branch_name;
    const normalized = normalizeJeddahDistrict(rawDistrict);
    
    console.log(`[${b.canonical_name} - ${br.branch_name}]`);
    console.log(`  Raw in JSON: "${br.canonical_district}"`);
    console.log(`  Direct Google Addr: "${direct?.address}"`);
    console.log(`  Normalized District ID: "${normalized}"`);
    if (normalized) {
      console.log(`  Canonical District: ${JEDDAH_DISTRICTS[normalized].nameEn} (${JEDDAH_DISTRICTS[normalized].nameAr})`);
    } else {
      console.log(`  --> OUTER DISTRICT (null canonical district)!`);
    }
    console.log('');
  }
}
