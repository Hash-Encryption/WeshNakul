import fs from 'node:fs';
import readline from 'node:readline';

async function run() {
  const fileStream = fs.createReadStream('C:/Users/hgend/.gemini/antigravity/brain/97a646ed-00d2-47f5-8766-b9b28f01383d/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    const obj = JSON.parse(line);
    if (obj.type === 'USER_INPUT') {
      console.log('USER_INPUT content length:', obj.content.length);
      const marker = '"dataset": "WeshNakul Burger Category"';
      const markerIdx = obj.content.indexOf(marker);
      if (markerIdx !== -1) {
        const jsonStart = obj.content.lastIndexOf('{', markerIdx);
        const jsonStr = obj.content.slice(jsonStart);
        const parsed = JSON.parse(jsonStr);
        console.log('Parsed dataset:', parsed.dataset, 'brands count:', parsed.brands.length);
        fs.writeFileSync('docs/research/jeddah-burger-v3-dataset.json', JSON.stringify(parsed, null, 2));
        console.log('Saved to docs/research/jeddah-burger-v3-dataset.json');
      } else {
        console.error('Marker not found in USER_INPUT');
      }
      break;
    }
  }
}

run().catch(console.error);
