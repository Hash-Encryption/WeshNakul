import fs from 'node:fs';

const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));

console.log('--- PAPA JOHNS IN SWEEP ---');
const papa = sweep.filter(p => (p.displayName?.text || '').toLowerCase().includes('papa john'));
for (const p of papa) {
  console.log(`  ID: ${p.id} | Addr: ${p.formattedAddress} | Lat: ${p.location?.latitude}, Lng: ${p.location?.longitude}`);
}

console.log('\n--- PIZZA HUT IN SWEEP ---');
const hut = sweep.filter(p => (p.displayName?.text || '').toLowerCase().includes('pizza hut') || (p.displayName?.text || '').includes('بيتزا هت'));
for (const p of hut) {
  console.log(`  ID: ${p.id} | Name: ${p.displayName?.text} | Addr: ${p.formattedAddress} | Lat: ${p.location?.latitude}, Lng: ${p.location?.longitude}`);
}
