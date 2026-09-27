import fs from 'node:fs';

const html = fs.readFileSync('C:/Users/hgend/.gemini/antigravity/brain/32e626af-1778-4d25-92d9-f381f4e0b7b1/.system_generated/steps/83/content.md', 'utf8');

// Search for any mention of Prince Naif or Ash Shiraa or GOA or other branches
const regex = /(?:prince|naif|shiraa|goa|andalus|khalid|naim|obhur|station|drive)/gi;
let m;
while ((m = regex.exec(html)) !== null) {
  const start = Math.max(0, m.index - 100);
  const end = Math.min(html.length, m.index + 100);
  console.log(`[Match ${m[0]}]: ...${html.substring(start, end).replace(/\s+/g, ' ')}...`);
}
