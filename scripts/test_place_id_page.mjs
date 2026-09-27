async function testPlaceIdPage(placeId) {
  // Option A: https://www.google.com/maps/place/?q=place_id:ChIJ2WfbOmjQwxURxtAx9XnHz4U
  const url = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    console.log('Final URL:', res.url);
    const text = await res.text();
    console.log('Text length:', text.length);
    // Find coords in text
    // E.g. [null,null,21.xxx,39.xxx]
    const matches = [...text.matchAll(/\[null,null,(\d{2}\.\d+),(\d{2}\.\d+)\]/g)];
    if (matches.length > 0) {
      console.log('Found coords in JSON payload:', matches[0][1], matches[0][2]);
    } else {
      const match2 = text.match(/center=(\d{2}\.\d+)%2C(\d{2}\.\d+)/);
      if (match2) {
        console.log('Found coords in staticmap center:', match2[1], match2[2]);
      } else {
        const match3 = text.match(/@(\d{2}\.\d+),(\d{2}\.\d+)/);
        if (match3) {
          console.log('Found coords in @:', match3[1], match3[2]);
        }
      }
    }

    // Find title/name
    const titleMatch = text.match(/<meta content="([^"]+)" itemprop="name">/) || text.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      console.log('Found title:', titleMatch[1]);
    }

    // Find rating and reviews
    const ratingMatch = text.match(/(\d\.\d) stars, (\d[\d,]+) reviews/);
    if (ratingMatch) {
      console.log('Rating:', ratingMatch[1], 'Reviews:', ratingMatch[2]);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testPlaceIdPage('ChIJ2WfbOmjQwxURxtAx9XnHz4U'); // Domino's Al Faisaliyyah
