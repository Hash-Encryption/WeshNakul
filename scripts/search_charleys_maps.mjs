async function searchMapsHtml(query) {
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}?entry=tts&g_ep=EgoyMDI2MDkyMy4wKgBIAVAD`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  const html = await res.text();
  console.log(`\n=== Query: "${query}" ===`);
  console.log('Final URL:', res.url);
  // Look for Place IDs ChIJ...
  const placeIds = [...html.matchAll(/ChIJ[0-9A-Za-z_-]{23}/g)].map(m => m[0]);
  console.log('Place IDs in HTML:', [...new Set(placeIds)]);
  // Look for titles/names
  const titles = [...html.matchAll(/\["([^"]*Charleys[^"]*)"/gi)].map(m => m[1]);
  console.log('Charleys mentions:', [...new Set(titles)]);
}

async function main() {
  await searchMapsHtml('Charleys Cheesesteaks Salam Mall Jeddah');
  await searchMapsHtml('Charleys Cheesesteaks Red Sea Mall Jeddah');
  await searchMapsHtml('Charleys Philly Steaks Salam Mall Jeddah');
  await searchMapsHtml('Charleys Philly Steaks Red Sea Mall Jeddah');
  await searchMapsHtml('تشارليز السلام مول جدة');
  await searchMapsHtml('تشارليز رد سي مول جدة');
}

main().catch(console.error);
