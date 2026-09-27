import fs from 'node:fs';

const html = fs.readFileSync('scripts/ginger_leaf_maps_search.html', 'utf8');

// Parse APP_INITIALIZATION_STATE
const m = html.match(/window\.APP_INITIALIZATION_STATE\s*=\s*(\[.+?\]);window\./);
if (m) {
  try {
    const data = JSON.parse(m[1]);
    console.log('Parsed APP_INITIALIZATION_STATE. Top array len:', data.length);
    
    // Search recursively for strings containing ginger leaf
    function search(obj, path = '') {
      if (!obj) return;
      if (typeof obj === 'string') {
        if (obj.toLowerCase().includes('ginger leaf') || obj.toLowerCase().includes('hilton')) {
          console.log(`Match at ${path}:`, obj.slice(0, 150));
        }
        return;
      }
      if (Array.isArray(obj)) {
        obj.forEach((item, idx) => search(item, `${path}[${idx}]`));
      } else if (typeof obj === 'object') {
        Object.entries(obj).forEach(([k, v]) => search(v, `${path}.${k}`));
      }
    }
    search(data);
  } catch (err) {
    console.error('JSON parse error:', err.message);
  }
} else {
  console.log('No APP_INITIALIZATION_STATE found');
}
