import fs from 'node:fs';

async function inspectHtml(placeId) {
  const url = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  const text = await res.text();
  fs.writeFileSync('scripts/sample_maps_page.html', text);
  console.log('Saved HTML to scripts/sample_maps_page.html');

  // Search for 21. and 39. occurrences
  const regex = /\[(\d{2}\.\d{4,}),(\d{2}\.\d{4,})\]/g;
  let m;
  const pairs = [];
  while ((m = regex.exec(text)) !== null) {
    pairs.push([m[1], m[2]]);
  }
  console.log('Found [lat, lng] pairs:', pairs.slice(0, 10));

  // Search for the place ID
  const idx = text.indexOf(placeId);
  console.log('Place ID index:', idx);
  if (idx !== -1) {
    console.log('Context around place ID:', text.substring(idx - 100, idx + 200));
  }
}

inspectHtml('ChIJ2WfbOmjQwxURxtAx9XnHz4U');
