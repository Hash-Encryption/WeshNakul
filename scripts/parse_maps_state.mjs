import fs from 'node:fs';

const text = fs.readFileSync('scripts/sample_maps_page.html', 'utf8');

// Parse APP_INITIALIZATION_STATE
const m = text.match(/window\.APP_INITIALIZATION_STATE\s*=\s*(\[.+?\]);window\./);
if (m) {
  try {
    const data = JSON.parse(m[1]);
    console.log('APP_INITIALIZATION_STATE parsed, top array length:', data.length);
    // Let's search strings inside data
    function searchArray(arr, depth = 0) {
      if (!arr) return;
      if (typeof arr === 'string') {
        if (arr.includes('Khayal') || arr.includes('Sultan') || arr.includes('Jeddah')) {
          console.log(`[depth ${depth}]:`, arr.slice(0, 100));
        }
        return;
      }
      if (Array.isArray(arr)) {
        for (const item of arr) searchArray(item, depth + 1);
      }
    }
    searchArray(data);
  } catch (e) {
    console.error('Parse error:', e.message);
  }
}

// Let's also check for any other JSON blobs or script tags
const scripts = text.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
console.log('Script count:', scripts.length);
for (let i = 0; i < scripts.length; i++) {
  const s = scripts[i];
  if (s.includes('Khayal') || s.includes('38505') || s.includes('4.2')) {
    console.log(`Script ${i} contains target! Length: ${s.length}`);
  }
}
