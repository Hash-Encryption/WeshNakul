import fs from 'node:fs';

const text = fs.readFileSync('scripts/ginger_leaf_search_parsed.json', 'utf8');
const matches = [];
let idx = 0;
while ((idx = text.toLowerCase().indexOf('ginger', idx)) !== -1) {
  matches.push(text.slice(Math.max(0, idx - 100), Math.min(text.length, idx + 200)));
  idx += 6;
  if (matches.length > 10) break;
}
console.log('Found occurrences of ginger:', matches.length);
matches.forEach((m, i) => console.log(`--- Match ${i} ---\n${m}\n`));
