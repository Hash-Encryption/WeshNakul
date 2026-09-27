import fs from 'node:fs';

async function testGoogleMapsSearch(q) {
  const url = 'https://www.google.com/maps/search/' + encodeURIComponent(q);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    redirect: 'follow'
  });
  console.log('Final URL:', res.url);
  const text = await res.text();
  fs.writeFileSync('scripts/maps_search_out.html', text);

  // Search for Jeddah coordinates in text (21.3 - 21.9, 39.0 - 39.4)
  const matches = [...text.matchAll(/([2][1]\.[0-9]{5,})[^\d]+([3][9]\.[0-9]{5,})/g)];
  console.log('Found Jeddah coordinate pairs:');
  const seen = new Set();
  for (const m of matches) {
    const pair = `${m[1]}, ${m[2]}`;
    if (!seen.has(pair)) {
      seen.add(pair);
      console.log(' - ', pair);
    }
  }

  // Also search for reverse: 39.xxx, 21.xxx
  const revMatches = [...text.matchAll(/([3][9]\.[0-9]{5,})[^\d]+([2][1]\.[0-9]{5,})/g)];
  for (const m of revMatches) {
    const pair = `${m[2]}, ${m[1]}`;
    if (!seen.has(pair)) {
      seen.add(pair);
      console.log(' - (rev)', pair);
    }
  }
}

testGoogleMapsSearch('Khayal Restaurant Prince Sultan Rd Al Zahra Jeddah');
