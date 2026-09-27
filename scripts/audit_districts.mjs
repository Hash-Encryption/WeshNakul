import fs from 'fs';
import { JEDDAH_DISTRICT_LIST, normalizeJeddahDistrict } from '../src/data/jeddahDistricts.ts';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));
const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));
const direct = JSON.parse(fs.readFileSync('scripts/direct_fetched_places.json', 'utf8'));

const sweepById = new Map();
for (const p of sweep) sweepById.set(p.id, p);

const knownDiscoveredMatches = {
  "Domino's:Al Marwah — Al Manini": "ChIJyapgsNrWwxUR5fJJPmndcBE",
  "Domino's:Al Marwah 2": "ChIJ25VWVczWwxUR5tUMoX-b30E",
  "Domino's:An Nuzhah": "ChIJAwztRFLXwxURKBMwS-yMmIU",
  "Domino's:An Naseem": "ChIJJ2uQr_3NwxUR1Lf4pbMN6fI",
  "Domino's:Ar Rehab": "ChIJc-u5tL_RwxUR5qfR97Q8pvw",
  "Domino's:Al Fayha'a": "ChIJ2TxHGmfOwxUREdPgha_es_4",
  "Domino's:Al Murjan": "ChIJWZysBfHYwxURgI02W6v7Uu0",
  "Domino's:Al Samer 2": "ChIJT3tPENnTwxURonj5U_EVb0s",
  "Domino's:Al Fadeylah": "ChIJb1583gXLwxURpkogsrSQPNM",
  "Domino's:Al Mohammadiyyah": "ChIJ1bV-LBvZwxURre1W1NShVxA",
  "Domino's:Village Mall — Al Asalah": null,
  "Maestro Pizza:Hamra": "ChIJj1ceP5HPwxURV1e_HNukKHk",
  "Maestro Pizza:Muhammadiyah": "ChIJSe8TU8fZwxURhiFqS-v5IGM",
  "Maestro Pizza:Taiba": "ChIJo5lBv7pkwRURbOCt8wtfAxM",
  "Maestro Pizza:Marwah": "ChIJB50rntDWwxUR99F7HxGYZqE",
  "Maestro Pizza:Samer": "ChIJgQdB2VvRwxURmYrkcAbRsTM",
  "Maestro Pizza:Noor / Abhur South": "ChIJh86BbyljwRURo8uZ2z0wvBQ",
  "Maestro Pizza:Ajaweed": "ChIJuRXdgRrLwxUREzo19H8LOTc"
};

const canonicalDistrictIds = new Set(JEDDAH_DISTRICT_LIST.map(d => d.id));

console.log(`Canonical 30 district IDs:`, Array.from(canonicalDistrictIds));

const districtAudit = [];

for (const b of raw.brands) {
  const branches = b.physical_jeddah_branches || b.branches || [];
  for (const br of branches) {
    const key = `${b.canonical_name}:${br.branch_name}`;
    const id = br.google_place_id || knownDiscoveredMatches[key];

    let placeData = null;
    if (id && direct[id]) placeData = direct[id];
    else if (id && sweepById.has(id)) placeData = sweepById.get(id);

    const address = placeData?.address || placeData?.formattedAddress || br.formatted_address || '';
    const rawDistrict = br.physical_district || br.raw_district || '';
    const oldCanonical = br.canonical_district;

    // Check normalization from physical_district, raw_district, or address
    let normalized = normalizeJeddahDistrict(rawDistrict);
    if (!normalized) {
      normalized = normalizeJeddahDistrict(oldCanonical);
    }

    districtAudit.push({
      brand: b.canonical_name,
      branch: br.branch_name,
      rawDistrict,
      address,
      oldCanonical,
      resolvedCanonical: normalized,
      isCanonical: normalized ? canonicalDistrictIds.has(normalized) : false
    });
  }
}

const canonicalCount = districtAudit.filter(d => d.isCanonical).length;
const nullCount = districtAudit.filter(d => !d.isCanonical).length;

console.log(`Canonical district count: ${canonicalCount}`);
console.log(`Null district count (outer / non-canonical): ${nullCount}`);

console.log('\nBranches with resolved null district:');
for (const d of districtAudit.filter(d => !d.isCanonical)) {
  console.log(`- [${d.brand}] ${d.branch} | rawDistrict: "${d.rawDistrict}" | oldCanonical: ${d.oldCanonical} | addr: ${d.address}`);
}
