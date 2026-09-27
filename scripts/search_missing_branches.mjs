import fs from 'node:fs';

async function searchMapsHtml(query) {
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=ar`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ar,en;q=0.9'
    }
  });
  const html = await res.text();
  console.log(`\n=== Query: ${query} (Status: ${res.status}, Length: ${html.length}) ===`);
  const chijs = html.match(/ChIJ[0-9a-zA-Z_-]{23,28}/g) || [];
  const uniquePlaceIds = [...new Set(chijs)];
  console.log('Place IDs found:', uniquePlaceIds);

  const m = html.match(/window\.APP_INITIALIZATION_STATE\s*=\s*(\[.+?\]);window\./);
  if (m) {
    console.log('APP_INITIALIZATION_STATE matched.');
    const stateStr = m[1];
    // Look for occurrences of query words or names
    const chijMatches = stateStr.match(/ChIJ[0-9a-zA-Z_-]{23,28}/g) || [];
    console.log('Place IDs inside state:', [...new Set(chijMatches)]);
  }

  // Look for coordinates
  const coordMatches = html.match(/\[null,null,([0-9]{2}\.[0-9]{5,}),([0-9]{2}\.[0-9]{5,})\]/g) || [];
  console.log('Coordinate pairs:', coordMatches.slice(0, 5));

  return uniquePlaceIds;
}

async function run() {
  await searchMapsHtml('مطعم كدوشة حي النسيم جدة');
  await searchMapsHtml('كدوشة أبو ذر الغفاري جدة');
  await searchMapsHtml('أفران الحطب الخالدية جدة');
  await searchMapsHtml('Al Hatab TO GO Khalidiyah Jeddah');
}
run();
