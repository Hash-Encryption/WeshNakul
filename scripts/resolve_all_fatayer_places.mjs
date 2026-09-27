import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-fatayer-raw-uploaded.json', 'utf8'));

export async function fetchPlaceDetailsDirect(placeId) {
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
    const shortAddress = info[39] || null;
    const districtEn = info[14] || null;
    const lat = info[9]?.[2] || null;
    const lng = info[9]?.[3] || null;
    const rating = info[4]?.[7] != null ? Number(info[4][7].toFixed(1)) : null;
    const reviews = info[4]?.[8] || null;
    const phone = info[178]?.[0]?.[0] || null;
    const verifiedPlaceId = info[78] || placeId;
    
    // Check if permanently closed or open
    let status = 'open';
    const allStr = JSON.stringify(info);
    if (allStr.includes('مغلق نهائيًا') || allStr.includes('Permanently closed')) {
      status = 'permanently_closed';
    } else if (allStr.includes('مغلق مؤقتًا') || allStr.includes('Temporarily closed')) {
      status = 'temporarily_closed';
    }

    // Extract hours text if available
    let hoursText = null;
    if (info[203]?.[0] && Array.isArray(info[203][0])) {
      const daySchedule = info[203][0].map(d => {
        const dayName = d[0];
        const intervals = (d[3] || []).map(i => i[0]).join(', ');
        return `${dayName}: ${intervals}`;
      }).join('; ');
      if (daySchedule.trim().length > 0) {
        hoursText = daySchedule;
      }
    }

    return {
      success: true,
      place_id: verifiedPlaceId,
      name,
      address,
      short_address: shortAddress,
      district_en: districtEn,
      latitude: lat,
      longitude: lng,
      rating,
      user_rating_count: reviews,
      phone,
      operating_status: status,
      hours_text: hoursText
    };
  } catch (err) {
    return { error: err.message };
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('--- RESOLVING FATAYER PLACE IDs DIRECTLY FROM GOOGLE MAPS ---');
  const results = {};
  const cacheFile = 'scripts/resolved_fatayer_places.json';
  if (fs.existsSync(cacheFile)) {
    try {
      Object.assign(results, JSON.parse(fs.readFileSync(cacheFile, 'utf8')));
      console.log(`Loaded ${Object.keys(results).length} cached places from ${cacheFile}`);
    } catch (e) {}
  }

  const allPlaceIds = [];
  for (const b of raw.brands) {
    for (const br of (b.branches || [])) {
      if (br.google_place_id) {
        allPlaceIds.push({
          brand: b.canonical_name,
          branch: br.branch_name,
          place_id: br.google_place_id
        });
      }
    }
  }

  console.log(`Found ${allPlaceIds.length} place IDs in raw fatayer research.`);

  for (let i = 0; i < allPlaceIds.length; i++) {
    const item = allPlaceIds[i];
    if (results[item.place_id]?.success) {
      console.log(`[${i + 1}/${allPlaceIds.length}] Already resolved: ${item.brand} — ${item.branch}`);
      continue;
    }

    console.log(`[${i + 1}/${allPlaceIds.length}] Fetching ${item.brand} — ${item.branch} (${item.place_id})...`);
    const res = await fetchPlaceDetailsDirect(item.place_id);
    if (res.success) {
      console.log(`  -> SUCCESS: ${res.name} | Lat: ${res.latitude}, Lng: ${res.longitude} | Rating: ${res.rating} (${res.user_rating_count}) | Status: ${res.operating_status}`);
      results[item.place_id] = res;
    } else {
      console.error(`  -> FAILED: ${res.error}`);
      results[item.place_id] = res;
    }
    fs.writeFileSync(cacheFile, JSON.stringify(results, null, 2));
    await delay(300);
  }

  console.log('\n--- RESOLUTION COMPLETE ---');
  let successCount = 0;
  for (const pid of Object.keys(results)) {
    if (results[pid].success && results[pid].latitude && results[pid].longitude) {
      successCount++;
    }
  }
  console.log(`Successfully resolved with coords: ${successCount} / ${allPlaceIds.length}`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
