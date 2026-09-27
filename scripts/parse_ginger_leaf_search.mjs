import fs from 'node:fs';

const html = fs.readFileSync('scripts/ginger_leaf_maps_search.html', 'utf8');
const m = html.match(/window\.APP_INITIALIZATION_STATE\s*=\s*(\[.+?\]);window\./);
const data = JSON.parse(m[1]);
const searchStr = data[3][1];
const cleanJson = searchStr.replace(/^\)\]\}'\s*/, '');
const parsed = JSON.parse(cleanJson);
fs.writeFileSync('scripts/ginger_leaf_search_parsed.json', JSON.stringify(parsed, null, 2));

console.log('Top array length of search result:', parsed.length);
// Let's inspect the results in parsed
const results = parsed[11] || [];
console.log('Results count in parsed[11]:', results.length);
for (let i = 0; i < results.length; i++) {
  const item = results[i];
  const info = item[14];
  if (info) {
    const title = info[11];
    const placeId = info[78];
    const addr = info[18];
    console.log(`[Result ${i}] Title: ${title}, Place ID: ${placeId}, Addr: ${addr}`);
  }
}
