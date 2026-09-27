import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('docs/research/jeddah-pizza-raw-uploaded.json', 'utf8'));
const sweep = JSON.parse(fs.readFileSync('scripts/jeddah_sweep_places.json', 'utf8'));
const direct = JSON.parse(fs.readFileSync('scripts/direct_fetched_places.json', 'utf8'));

const sweepById = new Map();
for (const p of sweep) sweepById.set(p.id, p);

const knownDiscoveredMatches = {
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
  "Domino's:Village Mall — Al Asalah": null,
  "Maestro Pizza:Hamra": "ChIJj1ceP5HPwxURV1e_HNukKHk",
  "Maestro Pizza:Muhammadiyah": "ChIJSe8TU8fZwxURhiFqS-v5IGM",
  "Maestro Pizza:Taiba": "ChIJo5lBv7pkwRURbOCt8wtfAxM",
  "Maestro Pizza:Marwah": "ChIJB50rntDWwxUR99F7HxGYZqE",
  "Maestro Pizza:Samer": "ChIJgQdB2VvRwxURmYrkcAbRsTM",
  "Maestro Pizza:Noor / Abhur South": "ChIJh86BbyljwRURo8uZ2z0wvBQ",
  "Maestro Pizza:Ajaweed": "ChIJuRXdgRrLwxUREzo19H8LOTc"
};

let coordCount = 0;
let outOfBoundsCount = 0;
let minLat = 999, maxLat = -999, minLng = 999, maxLng = -999;

for (const b of raw.brands) {
  const branches = b.physical_jeddah_branches || b.branches || [];
  for (const br of branches) {
    const key = `${b.canonical_name}:${br.branch_name}`;
    const id = br.google_place_id || knownDiscoveredMatches[key];
    let lat = null, lng = null;

    if (id && direct[id]) {
      lat = direct[id].latitude;
      lng = direct[id].longitude;
    } else if (id && sweepById.has(id)) {
      lat = sweepById.get(id).location?.latitude;
      lng = sweepById.get(id).location?.longitude;
    }

    if (lat != null && lng != null) {
      coordCount++;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;

      // Jeddah bounds: 21.0 < lat < 22.0, 39.0 < lng < 39.5
      if (lat < 21.0 || lat > 22.0 || lng < 39.0 || lng > 39.5) {
        console.error(`Out of bounds coords: ${b.canonical_name} - ${br.branch_name} (${lat}, ${lng})`);
        outOfBoundsCount++;
      }
    }
  }
}

console.log(`Branches with coordinates: ${coordCount} / 107`);
console.log(`Latitude range: [${minLat}, ${maxLat}]`);
console.log(`Longitude range: [${minLng}, ${maxLng}]`);
console.log(`Out of bounds coordinates count: ${outOfBoundsCount}`);
