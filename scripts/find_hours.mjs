import fs from 'node:fs';

async function main() {
  const placeId = 'ChIJZYAFEj7bwxURlxfbSWNAWCU'; // Sushiah
  const url = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  const html = await res.text();
  const match = html.match(/<link href="(\/maps\/preview\/place[^"]+)"/);
  const fullUrl = `https://www.google.com${match[1].replace(/&amp;/g, '&')}`;
  const pRes = await fetch(fullUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.google.com/maps/'
    }
  });
  const pText = await pRes.text();
  const jsonStr = pText.replace(/^\)\]\}'\s*/, '');
  const data = JSON.parse(jsonStr);
  const info = data[6];

  for (let i = 0; i < info.length; i++) {
    const s = JSON.stringify(info[i]);
    if (s && (s.includes('Sunday') || s.includes('Monday') || s.includes('الأحد') || s.includes('12:00') || s.includes('01:00') || s.includes('Open') || s.includes('Closes'))) {
      console.log(`Index ${i} matches:`, s.slice(0, 200));
    }
  }
}

main().catch(console.error);
