import fs from 'node:fs';

const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));

function findNames(query) {
  return sweep.filter(p => {
    const text = (p.displayName?.text || '') + ' ' + (p.formattedAddress || '');
    return text.toLowerCase().includes(query.toLowerCase());
  });
}

console.log('--- SEARCHING SWEEP ---');
console.log('Bread Ahead:', findNames('bread ahead'));
console.log('Ahead:', findNames('ahead'));
console.log('Jon & Vinny:', findNames('vinny'));
console.log('Impasto:', findNames('impasto'));
console.log('Verra:', findNames('verra'));
console.log('White Wood:', findNames('white wood'));
