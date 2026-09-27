import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('scripts/app_init_state.json', 'utf8'));

// Search recursively for coords around 21.xxx and 39.xxx
function search(obj, path = '') {
  if (!obj) return;
  if (typeof obj === 'number') {
    if (obj > 21.0 && obj < 22.0) {
      console.log(`Potential Lat at ${path}: ${obj}`);
    }
    if (obj > 39.0 && obj < 40.0) {
      console.log(`Potential Lng at ${path}: ${obj}`);
    }
  } else if (typeof obj === 'string') {
    if (obj.includes('Faisaliyyah') || obj.includes('الفيصلية') || obj.includes('Domino') || obj.includes('دومينوز')) {
      console.log(`Text match at ${path}: ${obj.substring(0, 100)}`);
    }
    if (obj.startsWith('ChIJ')) {
      console.log(`Place ID match at ${path}: ${obj}`);
    }
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      search(obj[i], `${path}[${i}]`);
    }
  } else if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      search(obj[k], `${path}.${k}`);
    }
  }
}

search(data);
