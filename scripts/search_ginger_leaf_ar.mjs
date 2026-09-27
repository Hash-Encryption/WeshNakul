import fs from 'node:fs';

async function searchMapsHtml(query) {
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ar,en-US;q=0.9'
    }
  });
  const html = await res.text();
  console.log('Query:', query, '| HTML length:', html.length);

  const m = html.match(/<link href="(\/maps\/preview\/place[^"]+)"/);
  if (m) {
    console.log('Direct place preload link found:', m[1]);
  }

  // Look for Place IDs
  const placeIds = [...new Set(html.match(/ChIJ[a-zA-Z0-9_-]{23,}/g) || [])];
  console.log('Place IDs in HTML:', placeIds);

  const mState = html.match(/window\.APP_INITIALIZATION_STATE\s*=\s*(\[.+?\]);window\./);
  if (mState) {
    const data = JSON.parse(mState[1]);
    const str = data[3]?.[1];
    if (str) {
      const clean = str.replace(/^\)\]\}'\s*/, '');
      const parsed = JSON.parse(clean);
      const results = parsed[11] || [];
      console.log('Parsed results count:', results.length);
      for (let i = 0; i < results.length; i++) {
        const item = results[i];
        if (!item) continue;
        const info = item[14];
        if (info) {
          console.log(`[Result ${i}] Title: "${info[11]}" | Place ID: ${info[78]} | Addr: ${info[18]}`);
        }
      }
    }
  }
}

searchMapsHtml('مطعم جينجر ليف جدة');
