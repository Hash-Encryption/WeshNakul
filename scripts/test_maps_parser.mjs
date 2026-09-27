import fs from 'node:fs';

async function searchMapsAndParse(query) {
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await res.text();
    
    // Check if direct place preload link exists (single result redirect)
    const preloadMatch = html.match(/<link href="(\/maps\/preview\/place[^"]+)"/);
    if (preloadMatch) {
      const fullUrl = `https://www.google.com${preloadMatch[1].replace(/&amp;/g, '&')}`;
      const pRes = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/maps/'
        }
      });
      const pText = await pRes.text();
      const pData = JSON.parse(pText.replace(/^\)\]\}'\s*/, ''));
      const info = pData[6];
      if (info) {
        return [{
          source: 'direct_place_preload',
          title: info[11],
          place_id: info[78],
          address: info[18] || (info[2] ? info[2].join(', ') : null),
          lat: info[9]?.[2],
          lng: info[9]?.[3],
          rating: info[4]?.[7] != null ? Number(info[4][7].toFixed(1)) : null,
          reviews: info[4]?.[8],
          status: JSON.stringify(info).includes('Permanently closed') ? 'permanently_closed' : (JSON.stringify(info).includes('Temporarily closed') ? 'temporarily_closed' : 'open'),
          hours: info[203]?.[0] ? info[203][0].map(d => `${d[0]}: ${(d[3] || []).map(i => i[0]).join(', ')}`).join('; ') : null
        }];
      }
    }

    const m = html.match(/window\.APP_INITIALIZATION_STATE\s*=\s*(\[.+?\]);window\./);
    if (!m) {
      return { error: 'No APP_INITIALIZATION_STATE' };
    }
    const data = JSON.parse(m[1]);
    const searchStr = data[3]?.[1];
    if (!searchStr) {
      return { error: 'No search string in data[3][1]' };
    }
    const cleanJson = searchStr.replace(/^\)\]\}'\s*/, '');
    const parsed = JSON.parse(cleanJson);
    console.log('Parsed array length:', parsed.length);
    for (let i = 0; i < Math.min(parsed.length, 25); i++) {
      if (parsed[i]) {
        console.log(`parsed[${i}] type:`, typeof parsed[i], Array.isArray(parsed[i]) ? `array(${parsed[i].length})` : '');
      }
    }
    fs.writeFileSync('scripts/sample_search_parsed.json', JSON.stringify(parsed, null, 2));
    const results = [];
    const items = parsed[11] || (parsed[0] && Array.isArray(parsed[0]) ? parsed[0] : []);
    
    // items could be in parsed[11] or parsed[0]
    for (const item of (parsed[11] || [])) {
      if (!item) continue;
      const info = item[14];
      if (info) {
        results.push({
          source: 'search_results_list',
          title: info[11],
          place_id: info[78],
          address: info[18] || (info[2] ? info[2].join(', ') : null),
          lat: info[9]?.[2],
          lng: info[9]?.[3],
          rating: info[4]?.[7] != null ? Number(info[4][7].toFixed(1)) : null,
          reviews: info[4]?.[8],
          status: JSON.stringify(info).includes('Permanently closed') ? 'permanently_closed' : (JSON.stringify(info).includes('Temporarily closed') ? 'temporarily_closed' : 'open')
        });
      }
    }
    return results;
  } catch (err) {
    return { error: err.message };
  }
}

async function test() {
  console.log('Testing Noto Jeddah Walk...');
  const res1 = await searchMapsAndParse('Noto Jeddah Walk');
  console.log('Noto result:', JSON.stringify(res1, null, 2));

  console.log('\nTesting San Carlo Cicchetti Jeddah...');
  const res2 = await searchMapsAndParse('San Carlo Cicchetti Jeddah');
  console.log('San Carlo result:', JSON.stringify(res2, null, 2));
}

test();
