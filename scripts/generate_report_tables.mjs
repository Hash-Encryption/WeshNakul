import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const correctedPath = path.join(rootDir, 'docs', 'research', 'jeddah-grills-pass-d-corrected.json');
const data = JSON.parse(fs.readFileSync(correctedPath, 'utf8'));

console.log('### PROGRAMMATIC BRAND SUMMARY TABLE\n');
console.log('| # | Brand Name | Arabic Name | Active Branches | Canonical | Caution | Manual Review | Use Case | Editorial Role |');
console.log('|---|---|---|---:|---:|---:|---:|---|---|');

let totalActive = 0;
let totalCanonical = 0;
let totalCaution = 0;
let totalManualReview = 0;

data.brands.forEach((b, i) => {
  const activeCount = b.branches.length;
  const canonicalCount = b.branches.filter(br => br.canonical_district !== null).length;
  const cautionCount = b.branches.filter(br => br.canonical_district === null).length;
  const mrCount = (b.manual_review_branches || []).length;

  totalActive += activeCount;
  totalCanonical += canonicalCount;
  totalCaution += cautionCount;
  totalManualReview += mrCount;

  console.log(`| ${i + 1} | ${b.canonical_name} | ${b.arabic_name} | ${activeCount} | ${canonicalCount} | ${cautionCount} | ${mrCount} | \`${b.recommendation_use_case}\` | \`${b.editorial_classification}\` |`);
});

console.log(`| **TOTAL** | **${data.brands.length} Brands** | | **${totalActive}** | **${totalCanonical}** | **${totalCaution}** | **${totalManualReview}** | | |`);

console.log('\n### PROGRAMMATIC ACTIVE BRANCHES DIRECTORY (43 ACTIVE BRANCHES)\n');
console.log('| # | Brand | Branch Name | Canonical District | Physical District | Place ID | Rating (Reviews) | Coords |');
console.log('|---|---|---|---|---|---|---|---|');

let bCount = 0;
data.brands.forEach(b => {
  b.branches.forEach(br => {
    bCount++;
    const canon = br.canonical_district ? `\`${br.canonical_district}\`` : '*null (outer)*';
    const coords = `${br.latitude.toFixed(4)}, ${br.longitude.toFixed(4)}`;
    const ratingStr = `${br.google_rating} (${br.google_review_count.toLocaleString()})`;
    console.log(`| ${bCount} | ${b.canonical_name} | ${br.branch_name} | ${canon} | ${br.raw_district} | \`${br.google_place_id}\` | ${ratingStr} | ${coords} |`);
  });
});
