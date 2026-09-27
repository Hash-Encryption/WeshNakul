import fs from 'node:fs';

const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));

console.log('--- DOMINO\'S IN SWEEP ---');
const dominos = sweep.filter(p => (p.displayName?.text || '').toLowerCase().includes('domino'));
console.log(`Found ${dominos.length} Domino's branches:`);
for (const d of dominos) {
  console.log(`  ID: ${d.id} | Name: ${d.displayName?.text} | Addr: ${d.formattedAddress} | Lat: ${d.location?.latitude}, Lng: ${d.location?.longitude}`);
}

console.log('\n--- MAESTRO IN SWEEP ---');
const maestros = sweep.filter(p => (p.displayName?.text || '').toLowerCase().includes('maestro'));
console.log(`Found ${maestros.length} Maestro branches:`);
for (const m of maestros) {
  console.log(`  ID: ${m.id} | Name: ${m.displayName?.text} | Addr: ${m.formattedAddress} | Lat: ${m.location?.latitude}, Lng: ${m.location?.longitude}`);
}
