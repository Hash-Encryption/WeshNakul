import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('docs/research/jeddah-italian-raw-uploaded.json', 'utf8'));
console.log('Total brands:', data.brands.length);

let totalBranches = 0;
let prodReady = 0;
let caution = 0;
let manualReview = 0;
let excluded = 0;

let withPlaceId = 0;
let withMapsUrl = 0;
let withCoords = 0;
let withAddress = 0;
let withDistrict = 0;
let withRating = 0;
let withReviewCount = 0;
let withHours = 0;
let activeBranches = 0;

data.brands.forEach((b, i) => {
  const branches = b.branches || [];
  totalBranches += branches.length;
  console.log(`${i+1}. [${b.canonical_name}] (${b.arabic_name}) - branches: ${branches.length}`);
  branches.forEach(br => {
    if (br.production_eligibility === 'production_ready') prodReady++;
    else if (br.production_eligibility === 'usable_with_caution') caution++;
    else if (br.production_eligibility === 'manual_review') manualReview++;
    else if (br.production_eligibility === 'excluded') excluded++;
    
    if (br.operating_status === 'open') activeBranches++;
    if (br.google_place_id) withPlaceId++;
    if (br.google_maps_url) withMapsUrl++;
    if (br.latitude !== null && br.longitude !== null) withCoords++;
    if (br.formatted_address) withAddress++;
    if (br.canonical_district) withDistrict++;
    if (br.google_rating !== null) withRating++;
    if (br.google_review_count !== null) withReviewCount++;
    if (br.hours) withHours++;
  });
});

console.log('\n--- RAW DATASET AUDIT TOTALS ---');
console.log('Brands:', data.brands.length);
console.log('Branches:', totalBranches);
console.log('Active/open branches:', activeBranches);
console.log('Production ready:', prodReady);
console.log('Usable with caution:', caution);
console.log('Manual review:', manualReview);
console.log('Excluded:', excluded);
console.log(`Place ID completeness: ${(withPlaceId / totalBranches * 100).toFixed(1)}% (${withPlaceId}/${totalBranches})`);
console.log(`Maps URL completeness: ${(withMapsUrl / totalBranches * 100).toFixed(1)}% (${withMapsUrl}/${totalBranches})`);
console.log(`Coordinate completeness: ${(withCoords / totalBranches * 100).toFixed(1)}% (${withCoords}/${totalBranches})`);
console.log(`Address completeness: ${(withAddress / totalBranches * 100).toFixed(1)}% (${withAddress}/${totalBranches})`);
console.log(`District completeness: ${(withDistrict / totalBranches * 100).toFixed(1)}% (${withDistrict}/${totalBranches})`);
console.log(`Rating completeness: ${(withRating / totalBranches * 100).toFixed(1)}% (${withRating}/${totalBranches})`);
console.log(`Review count completeness: ${(withReviewCount / totalBranches * 100).toFixed(1)}% (${withReviewCount}/${totalBranches})`);
console.log(`Hours completeness: ${(withHours / totalBranches * 100).toFixed(1)}% (${withHours}/${totalBranches})`);

