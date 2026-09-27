import fs from 'node:fs';

const text = fs.readFileSync('C:/Users/hgend/.gemini/antigravity/brain/2b37f58a-7d9b-43a5-bd30-5788a870f8c5/.system_generated/steps/157/content.md', 'utf8');

const scripts = text.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
console.log('Script tags count:', scripts.length);
for (let i = 0; i < scripts.length; i++) {
  const s = scripts[i];
  if (s.includes('478455488') || s.includes('Obhur') || s.includes('ابحر')) {
    console.log(`Script ${i} matches! Length:`, s.length);
    fs.writeFileSync(`scripts/linktree_script_${i}.txt`, s);
  }
}
