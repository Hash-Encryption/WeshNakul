import fs from 'node:fs';

const d = JSON.parse(fs.readFileSync('docs/research/jeddah-grills-pass-d-corrected.json', 'utf8'));

console.log('--- 14 OUTER CAUTION BRANCHES ---');
let count = 0;
d.brands.forEach(b => {
  b.branches.forEach(br => {
    if (br.canonical_district === null) {
      count++;
      console.log(
        `${count}. [${b.canonical_name}] ${br.branch_name}\n` +
        `   Address: ${br.formatted_address}\n` +
        `   Raw District: ${br.raw_district}\n` +
        `   Coords: (${br.latitude}, ${br.longitude})\n`
      );
    }
  });
});
