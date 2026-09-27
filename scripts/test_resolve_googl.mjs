async function resolveUrl(shortUrl) {
  try {
    const res = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    console.log('Final URL for', shortUrl, '->', res.url);
    return res.url;
  } catch (err) {
    console.error('Error resolving', shortUrl, err.message);
    return null;
  }
}

async function test() {
  const urls = [
    'https://goo.gl/maps/m7ahCmm3M2iKqLMm7', // Hamra
    'https://goo.gl/maps/dUwC6gdhPuFuy4VV8', // Muhammadiyah
    'https://goo.gl/maps/AtLvqkeSGqvmAwxf7', // Taiba
    'https://goo.gl/maps/W9DkqM5kATAJQppr6', // Marwah
    'https://goo.gl/maps/Ngb2ZhpjLGyiXFyA7', // Samer
    'https://goo.gl/maps/hwQjHXvxSfyG4Skb9', // Noor / Abhur South
    'https://goo.gl/maps/Baf1cet16dmSW7ZV7'  // Ajaweed
  ];
  for (const u of urls) {
    await resolveUrl(u);
  }
}

test();
