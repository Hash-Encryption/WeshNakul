import fs from 'node:fs';

async function searchMapsHtml(query) {
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  const html = await res.text();
  fs.writeFileSync('scripts/ginger_leaf_maps_search.html', html);
  console.log('Saved search HTML, length:', html.length);

  // Check if it redirected to a place or has preload link
  const m = html.match(/<link href="(\/maps\/preview\/place[^"]+)"/);
  if (m) {
    console.log('Found direct place preload link:', m[1]);
  } else {
    console.log('No direct place preload link, checking APP_INITIALIZATION_STATE...');
  }

  // Look for place IDs (ChIJ...)
  const placeIds = [...new Set(html.match(/ChIJ[a-zA-Z0-9_-]{23,}/g) || [])];
  console.log('Found Place IDs in HTML:', placeIds);

  // Check for Ginger Leaf text in HTML
  const hasGinger = html.toLowerCase().includes('ginger leaf');
  console.log('HTML contains "ginger leaf":', hasGinger);
}

searchMapsHtml('Ginger Leaf Jeddah Hilton');
