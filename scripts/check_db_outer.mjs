import fs from 'node:fs';

const branches = JSON.parse(fs.readFileSync('scripts/db_all_349_live_branches.json', 'utf8'));

const nahdah = branches.filter(b => (b.branch_name_en && b.branch_name_en.toLowerCase().includes('nahdah')) || (b.district && b.district.toLowerCase().includes('nahdah')));
console.log('Branches in DB referencing Nahdah:', nahdah.length);
for (const b of nahdah) {
  console.log(`- [${b.primary_category}] ${b.brand_name_en} - ${b.branch_name_en} | district: ${b.district}`);
}

const mishrifah = branches.filter(b => (b.branch_name_en && b.branch_name_en.toLowerCase().includes('mishrifah')) || (b.district && b.district.toLowerCase().includes('mishrifah')));
console.log('Branches in DB referencing Mishrifah:', mishrifah.length);
for (const b of mishrifah) {
  console.log(`- [${b.primary_category}] ${b.brand_name_en} - ${b.branch_name_en} | district: ${b.district}`);
}

console.log('\nTotal outer (district === null) branches in DB:', branches.filter(b => b.district === null).length);
