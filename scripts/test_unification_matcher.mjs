import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));
const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));
const direct = JSON.parse(fs.readFileSync('scripts/direct_fetched_places.json', 'utf8'));

const sweepById = new Map();
for (const p of sweep) {
  sweepById.set(p.id, p);
}

// Map of manual / discovered matches from our sweep analysis for branches missing Place IDs in raw
const knownDiscoveredMatches = {
  // Domino's
  "Domino's:Al Marwah — Al Manini": "ChIJyapgsNrWwxUR5fJJPmndcBE",
  "Domino's:Al Marwah 2": "ChIJ25VWVczWwxUR5tUMoX-b30E",
  "Domino's:An Nuzhah": "ChIJAwztRFLXwxURKBMwS-yMmIU",
  "Domino's:An Naseem": "ChIJJ2uQr_3NwxUR1Lf4pbMN6fI",
  "Domino's:Ar Rehab": "ChIJc-u5tL_RwxUR5qfR97Q8pvw",
  "Domino's:Al Fayha'a": "ChIJ2TxHGmfOwxUREdPgha_es_4",
  "Domino's:Al Murjan": "ChIJWZysBfHYwxURgI02W6v7Uu0",
  "Domino's:Al Samer 2": "ChIJT3tPENnTwxURonj5U_EVb0s",
  "Domino's:Al Fadeylah": "ChIJb1583gXLwxURpkogsrSQPNM",
  "Domino's:Al Mohammadiyyah": "ChIJ1bV-LBvZwxURre1W1NShVxA",
  "Domino's:Village Mall — Al Asalah": null, // Unlisted on GMaps

  // Maestro Pizza (resolved from goo.gl or sweep)
  "Maestro Pizza:Hamra": "ChIJj1ceP5HPwxURV1e_HNukKHk",
  "Maestro Pizza:Muhammadiyah": "ChIJSe8TU8fZwxURhiFqS-v5IGM",
  "Maestro Pizza:Taiba": "ChIJo5lBv7pkwRURbOCt8wtfAxM",
  "Maestro Pizza:Marwah": "ChIJB50rntDWwxUR99F7HxGYZqE",
  "Maestro Pizza:Samer": "ChIJgQdB2VvRwxURmYrkcAbRsTM",
  "Maestro Pizza:Noor / Abhur South": "ChIJh86BbyljwRURo8uZ2z0wvBQ",
  "Maestro Pizza:Ajaweed": "ChIJuRXdgRrLwxUREzo19H8LOTc"
};

let matchedCount = 0;
let missingCount = 0;
const results = [];

for (const brand of raw.brands) {
  const brandName = brand.canonical_name;
  const branches = brand.physical_jeddah_branches || brand.branches || [];
  for (const b of branches) {
    const key = `${brandName}:${b.branch_name}`;
    let placeId = b.google_place_id || knownDiscoveredMatches[key];

    let placeData = null;
    let source = 'none';

    if (placeId) {
      if (direct[placeId]) {
        placeData = {
          place_id: placeId,
          name: direct[placeId].name,
          address: direct[placeId].address,
          latitude: direct[placeId].latitude,
          longitude: direct[placeId].longitude,
          rating: direct[placeId].rating,
          reviewCount: direct[placeId].user_rating_count,
          operatingStatus: direct[placeId].operating_status
        };
        source = 'direct_fetch';
      } else if (sweepById.has(placeId)) {
        const sw = sweepById.get(placeId);
        placeData = {
          place_id: placeId,
          name: sw.displayName?.text,
          address: sw.formattedAddress,
          latitude: sw.location?.latitude,
          longitude: sw.location?.longitude,
          rating: sw.rating,
          reviewCount: sw.userRatingCount,
          operatingStatus: sw.businessStatus === 'CLOSED_PERMANENTLY' ? 'permanently_closed' : (sw.businessStatus === 'CLOSED_TEMPORARILY' ? 'temporarily_closed' : 'open')
        };
        source = 'places_sweep';
      }
    }

    if (placeData) {
      matchedCount++;
      results.push({
        brand: brandName,
        branch: b.branch_name,
        status: 'matched',
        source,
        place_id: placeId,
        lat: placeData.latitude,
        lng: placeData.longitude,
        rating: placeData.rating,
        reviews: placeData.reviewCount,
        op_status: placeData.operatingStatus
      });
    } else {
      missingCount++;
      results.push({
        brand: brandName,
        branch: b.branch_name,
        status: 'unmatched',
        raw_place_id: b.google_place_id,
        raw_url: b.google_maps_url
      });
    }
  }
}

console.log(`Matched: ${matchedCount} / 107`);
console.log(`Unmatched: ${missingCount} / 107`);
if (missingCount > 0) {
  console.log('Unmatched branches:');
  for (const r of results.filter(x => x.status === 'unmatched')) {
    console.log(`  - [${r.brand}] ${r.branch} (place_id: ${r.raw_place_id}, url: ${r.raw_url})`);
  }
}
