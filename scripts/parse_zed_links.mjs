import fs from 'node:fs';

const html = fs.readFileSync('C:/Users/hgend/.gemini/antigravity/brain/32e626af-1778-4d25-92d9-f381f4e0b7b1/.system_generated/steps/83/content.md', 'utf8');

const headers = [...html.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)].map(m => m[1]);
console.log('Headers:', headers);

const linkMatches = [...html.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*aria-label="([^"]+)"/g)];
for (const m of linkMatches) {
  console.log(`- [${m[2]}] -> ${m[1]}`);
}
