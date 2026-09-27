import fs from 'node:fs';

const path = 'C:\\Users\\hgend\\.gemini\\antigravity\\brain\\360b09f5-e4b5-4c4e-9eea-13d30472f2cd\\.system_generated\\logs\\transcript_full.jsonl';
const file = fs.readFileSync(path, 'utf8');

const needle = '"primary_category": "italian"';
const idx = file.indexOf(needle);
console.log('Found index:', idx);

if (idx !== -1) {
  // Find the opening brace '{' of this JSON
  let start = file.lastIndexOf('{', idx);
  // Scan backwards to find the outermost '{'
  // Or look for '{\n  "catalog": "WeshNakul"'
  const catalogIdx = file.lastIndexOf('"catalog": "WeshNakul"', idx);
  if (catalogIdx !== -1) {
    start = file.lastIndexOf('{', catalogIdx);
  }
  
  // Now find matching closing brace or parse
  let braceCount = 0;
  let end = -1;
  for (let i = start; i < file.length; i++) {
    if (file[i] === '{') braceCount++;
    else if (file[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        end = i + 1;
        break;
      }
    }
  }
  
  if (end !== -1) {
    const jsonStr = file.slice(start, end);
    const parsed = JSON.parse(jsonStr);
    console.log('Successfully parsed! Brands:', parsed.brands?.length);
    fs.writeFileSync('docs/research/jeddah-italian-raw-uploaded.json', JSON.stringify(parsed, null, 2) + '\n');
    console.log('Saved to docs/research/jeddah-italian-raw-uploaded.json');
  } else {
    console.log('Could not find closing brace');
  }
} else {
  console.log('Needle not found in transcript_full');
}
