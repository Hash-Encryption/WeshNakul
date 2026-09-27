import fs from 'node:fs';

const grills = JSON.parse(fs.readFileSync('docs/research/jeddah-grills-pass-d-corrected.json', 'utf8'));
for (const b of grills.brands) {
  if (b.manual_review_branches && b.manual_review_branches.length > 0) {
    console.log('Brand with manual_review_branches:', b.canonical_name, JSON.stringify(b.manual_review_branches, null, 2));
  }
}
