import fs from 'node:fs';

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ar,en;q=0.9'
    }
  });
  const text = await res.text();
  console.log(`Fetched ${url}, len: ${text.length}`);
  
  // Search for any hex: 0x...
  const hex = text.match(/0x[0-9a-f]{16}:0x[0-9a-f]{16}/g) || [];
  console.log('Hex IDs found:', [...new Set(hex)]);

  // Search for lat/lng: 21.xxx, 39.xxx
  const coords = text.match(/21\.[0-9]{5,}/g) || [];
  console.log('Lats found:', [...new Set(coords)]);
  const lngs = text.match(/39\.[0-9]{5,}/g) || [];
  console.log('Lngs found:', [...new Set(lngs)]);

  // Search for place_id or ChIJ
  const chijs = text.match(/ChIJ[0-9a-zA-Z_-]{23,28}/g) || [];
  console.log('ChIJs found:', [...new Set(chijs)]);

  // Search for data-cid or cid
  const cids = text.match(/data-cid="([0-9]+)"/g) || [];
  console.log('CIDs found:', [...new Set(cids)]);

  // Search for text around النسيم or أبو ذر
  const snippets = text.match(/.{0,50}(?:النسيم|أبو ذر|Abu Thar).{0,50}/g) || [];
  console.log('Snippets:', snippets.slice(0, 5));
}

async function run() {
  await fetchPage('https://www.google.com/search?kgmid=/g/1pp2tvtp8&q=كدوشة&hl=ar');
  await fetchPage('https://www.google.com/search?kgmid=/g/11yhz9dbdk&q=كدوشة&hl=ar');
}
run();
