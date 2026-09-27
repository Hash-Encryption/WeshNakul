import fs from 'node:fs';

async function testPlaceUrl(placeId) {
  // Let's test the official Google Maps URL:
  const url = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  fs.writeFileSync('scripts/place_search_page.html', html);

  // Check for coordinates or metadata
  const m1 = html.match(/center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/);
  console.log('m1 center:', m1 ? [m1[1], m1[2]] : null);

  // Check for title or name
  const mTitle = html.match(/<meta content="([^"]+)" itemprop="name">/);
  console.log('mTitle:', mTitle ? mTitle[1] : null);

  // Look for any occurrences of 21. and 39. in the HTML
  const coords = [...html.matchAll(/(-?\d{2}\.\d{4,})[,\/](-?\d{2}\.\d{4,})/g)].map(x => [x[1], x[2]]);
  console.log('Found coords:', coords.slice(0, 10));
}

testPlaceUrl('ChIJiwLjuXXRwxUR9zR13OUp-ws');
