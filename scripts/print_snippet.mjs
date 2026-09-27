import fs from 'node:fs';

const text = fs.readFileSync('scripts/sample_search_parsed.json', 'utf8');
const pos = text.indexOf('San Carlo');
console.log('Position:', pos);
console.log(text.slice(Math.max(0, pos - 200), pos + 1000));
