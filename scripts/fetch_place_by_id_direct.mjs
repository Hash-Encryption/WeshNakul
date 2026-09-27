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
      operating_status: status
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function test() {
  const ids = [
    { name: 'Impasto Seven', id: 'ChIJM5eZJzhjwRURDf1kn8DtpHU' },
    { name: 'Bread Ahead Zahra', id: 'ChIJIYbp4trbwxURseJD7d4cWtg' },
    { name: 'Bread Ahead Kings College', id: 'ChIJszLICgbbwxUR93EJ3wcGjh4' },
    { name: 'Bread Ahead Obhur', id: 'ChIJCTvpJABjwRUR3BeAR3FK2uQ' },
    { name: 'Bread Ahead Red Sea Mall', id: 'ChIJO7c88FXbwxURmXJz6pQq0GI' },
    { name: 'Pizza Hut Al Falah', id: 'ChIJA-zoawB7wRURd58rCgxmE1c' },
    { name: 'Pizza Hut Saud Bin Abdulaziz', id: 'ChIJ_-S7EwBlwRURhXE2mYqyLcM' },
    { name: 'Pizza Hut Obhur Al Yaqout', id: 'ChIJAZqjr5NjwRURm7dm84Enf4g' }
  ];

  for (const item of ids) {
    console.log(`Fetching ${item.name} (${item.id})...`);
    const res = await fetchPlaceByIdDirect(item.id);
    console.log('Result:', JSON.stringify(res, null, 2));
  }
}

import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  test();
}
