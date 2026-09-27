import fs from 'node:fs';

async function checkPlaceIdOnMaps(placeId) {
  const url = `https://www.google.com/maps/search/?api=1&query=test&query_place_id=${placeId}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await res.text();
    // Check if the HTML contains "Not found" or title or coords
    const titleMatch = html.match(/<meta content="([^"]+)" itemprop="name">/);
    const title = titleMatch ? titleMatch[1] : null;
    
    // Check for hex ID or coords in any redirect or content
    console.log(`Place ID ${placeId}: status=${res.status}, title=${title}, finalUrl=${res.url}`);
    fs.writeFileSync(`scripts/place_${placeId.substring(0, 10)}.html`, html.substring(0, 5000));
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await checkPlaceIdOnMaps('ChIJK47dwj3RwxURFLOtOEx2QD8'); // Papa Johns Rehab
  await checkPlaceIdOnMaps('ChIJM5eZJzhjwRURDf1kn8DtpHU'); // Impasto Seven
  await checkPlaceIdOnMaps('ChIJIYbp4trbwxURseJD7d4cWtg'); // Bread Ahead Zahra
}
run();
