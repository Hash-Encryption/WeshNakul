import fs from 'node:fs';

export async function fetchPlaceByIdDirect(placeId) {
  const url = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (!res.ok) {
      return { error: `HTTP ${res.status}` };
    }
    const html = await res.text();
    const match = html.match(/<link href="(\/maps\/preview\/place[^"]+)"/);
    if (!match) {
      return { error: 'No preload link in HTML' };
    }
    const fullUrl = `https://www.google.com${match[1].replace(/&amp;/g, '&')}`;
    const pRes = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/maps/'
      }
    });
    if (!pRes.ok) {
      return { error: `Preload HTTP ${pRes.status}` };
    }
    const pText = await pRes.text();
    const jsonStr = pText.replace(/^\)\]\}'\s*/, '');
    const data = JSON.parse(jsonStr);
    const info = data[6];
    if (!info) {
      return { error: 'No info array in response' };
    }

    const name = info[11] || null;
    const address = info[18] || (info[2] ? info[2].join(', ') : null);
    const lat = info[9]?.[2] || null;
    const lng = info[9]?.[3] || null;
    const rating = info[4]?.[7] != null ? Number(info[4][7].toFixed(1)) : null;
    const reviews = info[4]?.[8] || null;
    
    // Check if permanently closed or open
    let status = 'open';
    const allStr = JSON.stringify(info);
    if (allStr.includes('مغلق نهائيًا') || allStr.includes('Permanently closed')) {
      status = 'permanently_closed';
    } else if (allStr.includes('مغلق مؤقتًا') || allStr.includes('Temporarily closed')) {
      status = 'temporarily_closed';
    }

    return {
      place_id: placeId,
      name,
      address,
      latitude: lat,
      longitude: lng,
      rating,
      user_rating_count: reviews,
      operating_status: status,
      raw_info: info
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function run() {
  const res = await fetchPlaceByIdDirect('ChIJu1UW2WzawxUR8MSuy51UO3Q');
  fs.writeFileSync('scripts/sample_khayal_preload.json', JSON.stringify(res, null, 2));
  console.log('Saved sample khayal preload! Lat:', res.latitude, 'Lng:', res.longitude, 'Rating:', res.rating, 'Reviews:', res.user_rating_count);
}

run();
