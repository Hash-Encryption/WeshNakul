import fs from 'node:fs';

const parsed = JSON.parse(fs.readFileSync('scripts/ginger_leaf_search_parsed.json', 'utf8'));

const results = parsed[11] || [];
for (let i = 0; i < results.length; i++) {
  const item = results[i];
  if (!item) continue;
  const info = item[14];
  if (info) {
    const title = info[11];
    const placeId = info[78];
    const addr = info[18];
    const rating = info[4]?.[7];
    const reviews = info[4]?.[8];
    console.log(`[Result ${i}] Title: "${title}" | Place ID: ${placeId} | Rating: ${rating} (${reviews}) | Addr: ${addr}`);
  } else {
    // Check if there are other fields in item
    console.log(`[Result ${i}] No item[14]. Keys with values:`, Object.keys(item).filter(k => item[k] !== null));
  }
}
