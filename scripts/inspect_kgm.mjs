import fs from 'node:fs';

async function checkKgm(kgm) {
  const url = 'https://www.google.com/search?kgmid=' + encodeURIComponent(kgm) + '&hl=ar';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ar,en;q=0.9'
    }
  });
  const html = await res.text();
  console.log('=== KGMID:', kgm, '===');
  const mChIJ = html.match(/ChIJ[0-9a-zA-Z_-]{23,28}/g);
  console.log('Place IDs found:', [...new Set(mChIJ || [])]);
  const mTitle = html.match(/<title>([^<]+)<\/title>/);
  if (mTitle) console.log('Title:', mTitle[1]);
  
  // Look for text snippets containing address or reviews
  const matches = html.match(/[\u0600-\u06FF\w\s,.-]+(?:النسيم|الصفا|جدة|أبي ذر)[\u0600-\u06FF\w\s,.-]+/g);
  if (matches) {
    console.log('Arabic snippets:', matches.slice(0, 5));
  }
}

async function run() {
  await checkKgm('/g/11yhz9dbdk');
  await checkKgm('/g/1pp2tvtp8');
}
run();
