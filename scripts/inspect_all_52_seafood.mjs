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

console.log('--- DETAILED INSPECTION OF ALL 52 SEAFOOD BRANCHES ---');

let index = 0;
for (const b of raw.brands) {
  console.log(`\n======================================================`);
  console.log(`BRAND [${b.canonical_name}] (${b.arabic_name}) - Category: ${b.primary_category}`);
  for (const br of (b.branches || [])) {
    index++;
    const place = resolved[br.google_place_id] || {};
    const rawDist = br.canonical_district;
    
    // Check possible district normalizations
    let norm = normalizeJeddahDistrict(rawDist);
    if (!norm && rawDist) {
      // test common variations
      const cleaned = rawDist.toLowerCase()
        .replace(/^al[-_\s]/, 'al_')
        .replace(/^as[-_\s]/, 'al_')
        .replace(/^an[-_\s]/, 'an_')
        .replace(/^ar[-_\s]/, 'ar_')
        .replace(/^ash[-_\s]/, 'al_');
      norm = normalizeJeddahDistrict(cleaned);
    }

    console.log(`\n  Branch #${index}: ${br.branch_name}`);
    console.log(`    Raw District: '${rawDist}' -> Normalized: '${norm}'`);
    console.log(`    Place ID: ${br.google_place_id}`);
    console.log(`    Place Name: ${place.name}`);
    console.log(`    Google Address: ${place.address}`);
    console.log(`    Formatted Address: ${br.formatted_address}`);
    console.log(`    Coords: [${place.latitude}, ${place.longitude}]`);
    console.log(`    Status: ${place.operating_status}`);
    console.log(`    Rating: ${br.google_rating} | Reviews: ${br.google_review_count}`);
  }
}
