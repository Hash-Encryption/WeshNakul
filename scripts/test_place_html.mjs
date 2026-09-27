async function testPlaceHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  const text = await res.text();
  console.log('HTML length:', text.length);
  const title = text.match(/<title>([^<]+)<\/title>/);
  console.log('Title:', title ? title[1] : null);
  const ogImg = text.match(/<meta content="([^"]+)" property="og:image"/);
  console.log('og:image:', ogImg ? ogImg[1] : null);
  const centerMatch = text.match(/center=([0-9.-]+)%2C([0-9.-]+)/);
  console.log('Center:', centerMatch ? [centerMatch[1], centerMatch[2]] : null);
}

testPlaceHtml('https://www.google.com/maps/place//data=!4m2!3m1!1s0x15c20593f1eba769:0x59ab338cb7b87c95?utm_source=mstt_1');
