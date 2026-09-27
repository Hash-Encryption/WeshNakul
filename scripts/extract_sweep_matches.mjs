import fs from 'node:fs';

const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));
console.log('Total places in sweep:', sweep.length);

const targets = [
  'noto',
  'san carlo',
  'cicchetti',
  'piatto',
  'olive garden',
  'eataly',
  'il vero',
  'portofino',
  'vivaci',
  'salernoo',
  'il castello'
];

const matches = [];

for (const p of sweep) {
  const str = JSON.stringify(p).toLowerCase();
  for (const t of targets) {
    if (str.includes(t)) {
      matches.push({ target: t, place: p });
      break;
    }
  }
}

console.log('Total matches found:', matches.length);
fs.writeFileSync('scripts/italian_sweep_matches.json', JSON.stringify(matches, null, 2));

for (const m of matches) {
  const p = m.place;
  console.log(`\n[${m.target.toUpperCase()}] ${p.displayName?.text || p.name}`);
  console.log(`  ID: ${p.id || p.place_id}`);
  console.log(`  Address: ${p.formattedAddress || p.formatted_address}`);
  console.log(`  Location: ${p.location?.latitude || p.geometry?.location?.lat}, ${p.location?.longitude || p.geometry?.location?.lng}`);
  console.log(`  Rating: ${p.rating} (${p.userRatingCount || p.user_ratings_total})`);
  console.log(`  Status: ${p.businessStatus || p.business_status}`);
}
