import fs from 'node:fs';

async function testPreviewPlace() {
  const url = `https://www.google.com/maps/preview/place?authuser=0&hl=en&gl=sa&pb=!1m16!1s0x15c3d13dc2dd8e2b:0x3f40764c38adb314`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/maps/'
      }
    });
    console.log('Status:', res.status, res.headers.get('content-type'));
    const text = await res.text();
    console.log('Length:', text.length);
    fs.writeFileSync('scripts/preview_place.json', text);
    console.log('Saved preview place text, preview:', text.substring(0, 300));
  } catch (err) {
    console.error(err);
  }
}

testPreviewPlace();
