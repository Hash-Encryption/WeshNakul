import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('scripts/sample_search_parsed.json', 'utf8'));
const arr = data[11];
console.log('parsed[11] length:', arr.length);
for (let i = 0; i < Math.min(arr.length, 5); i++) {
  const item = arr[i];
  console.log(`item[${i}] is array: ${Array.isArray(item)}, length: ${item?.length}`);
  if (item && Array.isArray(item)) {
    for (let j = 0; j < item.length; j++) {
      if (item[j] !== null && item[j] !== undefined) {
        console.log(`  item[${i}][${j}] type: ${typeof item[j]} ${typeof item[j] === 'string' ? item[j].slice(0, 40) : (Array.isArray(item[j]) ? `arr(${item[j].length})` : '')}`);
      }
    }
  }
}
