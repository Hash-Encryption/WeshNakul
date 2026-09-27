import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));
const dominos = raw.brands.find(b => b.canonical_name === "Domino's");
for (const br of dominos.physical_jeddah_branches.slice(0, 5)) {
  console.log(br.branch_name, ':', br.hours);
}
