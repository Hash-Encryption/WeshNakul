import fs from 'node:fs';

const text = fs.readFileSync('C:/Users/hgend/.gemini/antigravity/brain/2b37f58a-7d9b-43a5-bd30-5788a870f8c5/.system_generated/steps/157/content.md', 'utf8');
const allUrls = [...text.matchAll(/https?:\/\/[^\s"'<>]+/g)].map(m => m[0]);
console.log('Total URLs:', allUrls.length);
const relevant = allUrls.filter(u => u.includes('map') || u.includes('goo.gl') || u.includes('yandex') || u.includes('obhur') || u.includes('hamraa') || u.includes('478455488'));
console.log('Relevant URLs:', relevant);
