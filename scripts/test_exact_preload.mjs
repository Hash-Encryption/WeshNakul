import fs from 'node:fs';

async function testExactPreload() {
  const html = fs.readFileSync('scripts/place_ChIJK47dwj.html', 'utf8');
  const match = html.match(/<link href="(\/maps\/preview\/place[^"]+)"/);
  if (!match) {
    console.log('No preload link found');
    return;
  }
  const fullUrl = `https://www.google.com${match[1].replace(/&amp;/g, '&')}`;
  console.log('Fetching:', fullUrl.substring(0, 100) + '...');
  const res = await fetch(fullUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.google.com/maps/'
    }
  });
  console.log('Status:', res.status, res.headers.get('content-type'));
  const text = await res.text();
  console.log('Response length:', text.length);
  fs.writeFileSync('scripts/preload_response.txt', text);
  console.log('First 500 chars:', text.substring(0, 500));
}

testExactPreload();
