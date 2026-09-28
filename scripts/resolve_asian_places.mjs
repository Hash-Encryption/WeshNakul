import fs from 'node:fs';

async function fetchPlaceByIdDirect(placeId) {
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
    const reviews = typeof info[4]?.[8] === 'number' ? info[4][8] : null;

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

async function main() {
  const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-asian-raw-uploaded.json', 'utf8'));
  const results = {};

  const branches = [];
  for (const b of raw.brands) {
    for (const br of (b.branches || [])) {
      if (br.google_place_id) {
        branches.push({
          brand: b.brand_name,
          branch: br.branch_name,
          place_id: br.google_place_id,
          address: br.address,
          district: br.district,
          raw_lat: br.latitude,
          raw_lng: br.longitude
        });
      }
    }
  }

  console.log(`Starting direct resolution for ${branches.length} Asian branches with Place ID...`);

  for (let i = 0; i < branches.length; i++) {
    const br = branches[i];
    console.log(`[${i + 1}/${branches.length}] Resolving: ${br.brand} - ${br.branch} (${br.place_id})...`);
    let res = await fetchPlaceByIdDirect(br.place_id);
    if (res.error) {
      console.warn(`  Retrying ${br.place_id} due to ${res.error}...`);
      await new Promise(r => setTimeout(r, 1500));
      res = await fetchPlaceByIdDirect(br.place_id);
    }
    results[br.place_id] = {
      ...br,
      ...res
    };
    if (res.latitude && res.longitude) {
      console.log(`  -> SUCCESS: ${res.name} | Lat: ${res.latitude}, Lng: ${res.longitude} | Rating: ${res.rating}, Reviews: ${res.user_rating_count} | Status: ${res.operating_status}`);
    } else {
      console.error(`  -> FAILED/INCOMPLETE:`, res);
    }
    await new Promise(r => setTimeout(r, 400));
  }

  fs.writeFileSync('scripts/resolved_asian_places.json', JSON.stringify(results, null, 2));
  console.log('Finished. Saved all results to scripts/resolved_asian_places.json');
}

main().catch(console.error);
