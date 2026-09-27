import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-grills-raw-uploaded.json', 'utf8'));
const resolved = JSON.parse(fs.readFileSync('scripts/resolved_grills_places.json', 'utf8'));

let idx = 0;
let withRating = 0;
let withReviews = 0;

for (const b of raw.brands) {
  for (const br of (b.branches || [])) {
    idx++;
    const pid = br.google_place_id;
    const res = pid ? resolved[pid] : null;
    const finalRating = res?.rating ?? br.google_rating;
    const finalReviews = res?.user_rating_count ?? br.google_review_count;

    if (finalRating != null) withRating++;
    if (finalReviews != null) withReviews++;

    console.log(
      `#${idx} [${b.canonical_name}] ${br.branch_name}: rating=${finalRating}, reviews=${finalReviews}`
    );
  }
}

console.log(`\nTotal: ${idx}, With Rating: ${withRating}, With Reviews: ${withReviews}`);
