async function testMapsRedirect(placeId) {
  const url = `https://www.google.com/maps/search/?api=1&query_place_id=${placeId}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Final URL:', res.url);
    const text = await res.text();
    // Check if coordinates appear in URL or page text
    const match = res.url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      console.log('Found coordinates in URL:', match[1], match[2]);
    } else {
      // Look in HTML
      const metaMatch = text.match(/content="https:\/\/maps\.google\.com\/maps\/api\/staticmap\?[^"]*center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/);
      if (metaMatch) {
        console.log('Found coordinates in staticmap meta:', metaMatch[1], metaMatch[2]);
      } else {
        const itempropMatch = text.match(/itemprop="image" content="https:\/\/maps\.google\.com\/maps\/api\/staticmap\?[^"]*center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/);
        if (itempropMatch) {
          console.log('Found coordinates in itemprop image:', itempropMatch[1], itempropMatch[2]);
        } else {
          // Look for window.APP_INITIALIZATION_STATE or [21.xxx, 39.xxx]
          const coordMatches = [...text.matchAll(/\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)\]/g)];
          console.log('Coord matches in JSON payload:', coordMatches.map(m => [m[1], m[2]]));
        }
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testMapsRedirect('ChIJiwLjuXXRwxUR9zR13OUp-ws');
