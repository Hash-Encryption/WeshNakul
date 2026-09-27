import fs from 'node:fs';

const names = [
  'noto',
  'san carlo',
  'cicchetti',
  'piatto',
  'olive garden',
  'eataly',
  'il vero',
  'vero',
  'portofino',
  'vivaci',
  'salernoo',
  'il castello',
  'castello'
];

const filesToSearch = [
  'tmp/google-places-pass-j-cache.json',
  'tmp/candidate_matches_summary.json',
  'scripts/jeddah_sweep_places.json',
  'scripts/direct_fetched_places.json',
  'scripts/app_init_state.json'
];

for (const file of filesToSearch) {
  if (!fs.existsSync(file)) continue;
  console.log(`\n=== Searching in ${file} ===`);
  const content = fs.readFileSync(file, 'utf8');
  for (const name of names) {
    let count = 0;
    let pos = 0;
    const lower = content.toLowerCase();
    while ((pos = lower.indexOf(name, pos)) !== -1) {
      count++;
      pos += name.length;
    }
    if (count > 0) {
      console.log(`  Found "${name}": ${count} times`);
    }
  }
}
