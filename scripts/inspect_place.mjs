import fs from 'node:fs';

async function testInspect(placeId) {
  const url = 'https://www.google.com/maps/search/?api=1&query_place_id=' + placeId;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  const text = await res.text();
  fs.writeFileSync('scripts/sample_maps_page.html', text);
  console.log('Saved HTML, length:', text.length);

  // Check APP_INITIALIZATION_STATE
  const initMatch = text.match(/window\.APP_INITIALIZATION_STATE\s*=\s*(.+?);window\./);
  if (initMatch) {
    console.log('Found APP_INITIALIZATION_STATE, length:', initMatch[1].length);
  }

  // Check staticmap center
  const centerMatch = text.match(/center=([0-9.-]+)%2C([0-9.-]+)/);
  if (centerMatch) {
    console.log('Found staticmap center:', centerMatch[1], centerMatch[2]);
  }
}

testInspect('ChIJu1UW2WzawxUR8MSuy51UO3Q');
