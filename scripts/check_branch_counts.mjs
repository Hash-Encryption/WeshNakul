import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));

console.log('Brand breakdown:');
let totalBranches = 0;
for (const b of raw.brands) {
  const branches = b.physical_jeddah_branches || b.branches || [];
  totalBranches += branches.length;
  console.log(`- ${b.canonical_name}: ${branches.length} branches`);
}
console.log('Total candidate branches:', totalBranches);
