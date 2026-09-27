import fs from 'node:fs';

const html = fs.readFileSync('scripts/sample_maps_page.html', 'utf8');

// Find all script tags
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
console.log(`Found ${scripts.length} script tags`);

for (let i = 0; i < scripts.length; i++) {
  const content = scripts[i][1];
  if (content.includes('APP_INITIALIZATION_STATE') || content.includes('window._') || content.includes('ChIJ2WfbOmjQwxURxtAx9XnHz4U')) {
    console.log(`Script ${i} length: ${content.length}`);
    fs.writeFileSync(`scripts/script_${i}.js`, content);
  }
}
