async function testEndpoints(placeId) {
  const urls = [
    `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`,
    `https://maps.google.com/maps?cid=863329820794500343&output=json`,
    `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}`,
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      console.log(u, '->', res.status, res.headers.get('content-type'), res.url);
    } catch (e) {
      console.log(u, '-> error:', e.message);
    }
  }
}

testEndpoints('ChIJiwLjuXXRwxUR9zR13OUp-ws');
