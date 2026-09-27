import fs from 'node:fs';

const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));

// Check all Domino's in sweep again
const dominos = sweep.filter(p => (p.displayName?.text || '').toLowerCase().includes('domino'));
console.log(`Total Domino's in sweep: ${dominos.length}`);

for (const d of dominos) {
  console.log(`- ${d.displayName?.text} | ID: ${d.id} | Addr: ${d.formattedAddress} | Lat: ${d.location?.latitude}, Lng: ${d.location?.longitude}`);
}
