import fs from 'node:fs';

const raw = fs.readFileSync('scripts/preload_response.txt', 'utf8');
// Strip the leading ")]}'\n"
const jsonStr = raw.replace(/^\)\]\}'\s*/, '');
const data = JSON.parse(jsonStr);

console.log('Parsed successfully!');
console.log('Root array length:', data.length);

// Let's inspect data[6] which had the place info
const info = data[6];
console.log('info[11] (name):', info[11]);
console.log('info[4] (ratings/reviews):', JSON.stringify(info[4]));
console.log('info[2] (address parts):', JSON.stringify(info[2]));
console.log('info[9] (location?):', JSON.stringify(info[9]));
console.log('info[13] (more location?):', JSON.stringify(info[13]));
console.log('info[18] (formatted address?):', JSON.stringify(info[18]));
console.log('info[34] (opening hours?):', JSON.stringify(info[34]));

// Recursive search for numbers and strings
function findPlaceDetails(obj, path = '') {
  if (!obj) return;
  if (typeof obj === 'number') {
    if (obj > 21.0 && obj < 22.0) console.log(`Lat at ${path}: ${obj}`);
    if (obj > 39.0 && obj < 40.0) console.log(`Lng at ${path}: ${obj}`);
  } else if (typeof obj === 'string') {
    if (obj.includes('Papa') || obj.includes('بابا') || obj.includes('Closed') || obj.includes('Open') || obj.includes('مغلق')) {
      console.log(`Text at ${path}: ${obj}`);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, idx) => findPlaceDetails(item, `${path}[${idx}]`));
  }
}

findPlaceDetails(info);
