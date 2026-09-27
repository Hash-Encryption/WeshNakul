import fs from 'node:fs';

const text = fs.readFileSync('scripts/sample_search_parsed.json', 'utf8');

// Find all occurrences of ChIJ
const chijs = [...new Set(text.match(/ChIJ[a-zA-Z0-9_-]{23,}/g) || [])];
console.log('Place IDs in parsed:', chijs);

// Also search for words like San Carlo, Cicchetti, Rawdah
const keywords = ['San Carlo', 'Cicchetti', 'Noto', 'Jeddah'];
for (const kw of keywords) {
  let count = 0;
  let pos = 0;
  while ((pos = text.indexOf(kw, pos)) !== -1) {
    count++;
    pos += kw.length;
  }
  console.log(`Keyword "${kw}" count:`, count);
}
