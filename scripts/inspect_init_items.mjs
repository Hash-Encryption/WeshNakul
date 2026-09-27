import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('scripts/app_init_state.json', 'utf8'));

console.log('Array length:', data.length);
for (let i = 0; i < data.length; i++) {
  const item = data[i];
  const type = typeof item;
  const isArr = Array.isArray(item);
  let summary = '';
  if (isArr) {
    summary = `Array(${item.length})`;
  } else if (type === 'string') {
    summary = `String(len ${item.length}): ${item.substring(0, 50)}...`;
  } else {
    summary = `${item}`;
  }
  console.log(`[${i}] (${type}) ${summary}`);
}
