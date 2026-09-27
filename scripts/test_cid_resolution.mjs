async function testCid(hex) {
  const parts = hex.split(':');
  const cidBigInt = BigInt(parts[1]);
  const cid = cidBigInt.toString();
  console.log(`Hex ${hex} -> CID ${cid}`);
  const url = `https://maps.google.com/?cid=${cid}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  console.log('Status:', res.status, 'Final URL:', res.url);
  const html = await res.text();
  const match = html.match(/<link href="(\/maps\/preview\/place[^"]+)"/);
  if (match) {
    const fullUrl = `https://www.google.com${match[1].replace(/&amp;/g, '&')}`;
    const pRes = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/maps/'
      }
    });
    const pText = await pRes.text();
    const jsonStr = pText.replace(/^\)\]\}'\s*/, '');
    const data = JSON.parse(jsonStr);
    const info = data[6];
    console.log('Name:', info[11]);
    console.log('Address:', info[18]);
    console.log('Lat/Lng:', info[9]?.[2], info[9]?.[3]);
    console.log('Rating:', info[4]?.[7], 'Reviews:', info[4]?.[8]);
    
    // Check if place ID is in info
    const str = JSON.stringify(info);
    const pIdMatch = str.match(/ChIJ[a-zA-Z0-9_-]{23,}/);
    console.log('Found Place ID in info:', pIdMatch ? pIdMatch[0] : null);
  } else {
    console.log('No preload link found');
  }
}

testCid('0x15c3cf91c58ab1eb:0x35cd277c90556c83'); // Maestro Hamra
