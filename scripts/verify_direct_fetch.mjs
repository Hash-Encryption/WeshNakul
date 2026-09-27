import fs from 'fs';
import { fetchPlaceByIdDirect } from './fetch_place_by_id_direct.mjs';

const targetIds = [
  { brand: 'Maestro Pizza', branch: 'Faisaliyyah', place_id: 'ChIJfWSaIcTRwxURBGZ25fXoURQ' },
  { brand: 'Maestro Pizza', branch: 'Hamdaniyah', place_id: 'ChIJsa_AQvl8wRURuemKWXGPApw' },
  { brand: 'Maestro Pizza', branch: 'Hamra', place_id: 'ChIJj1ceP5HPwxURV1e_HNukKHk' },
  { brand: 'Papa Johns', branch: 'Tahlia / Al Rehab', place_id: 'ChIJK47dwj3RwxURFLOtOEx2QD8' },
  { brand: 'Pizza Hut', branch: 'Saud Bin Abdulaziz', place_id: 'ChIJ_-S7EwBlwRURhXE2mYqyLcM' },
  { brand: 'Pizza Hut', branch: 'Al Falah', place_id: 'ChIJA-zoawB7wRURd58rCgxmE1c' },
  { brand: 'Pizza Hut', branch: 'Obhur North — Al Yaqout', place_id: 'ChIJAZqjr5NjwRURm7dm84Enf4g' },
  { brand: 'Impasto Seven', branch: 'Impasto Seven', place_id: 'ChIJM5eZJzhjwRURDf1kn8DtpHU' },
  { brand: 'Bread Ahead', branch: 'Al Zahra', place_id: 'ChIJIYbp4trbwxURseJD7d4cWtg' },
  { brand: 'Bread Ahead', branch: 'King\'s College Hospital', place_id: 'ChIJszLICgbbwxUR93EJ3wcGjh4' },
  { brand: 'Bread Ahead', branch: 'Obhur Al Shamaliyah', place_id: 'ChIJCTvpJABjwRUR3BeAR3FK2uQ' },
  { brand: 'Bread Ahead', branch: 'Red Sea Mall', place_id: 'ChIJO7c88FXbwxURmXJz6pQq0GI' },
  { brand: 'Domino\'s', branch: 'Prince Fawwaz', place_id: 'ChIJUwTOkIfMwxURSLylyDE8hHU' }
];

async function run() {
  const directResults = {};
  for (const item of targetIds) {
    console.log(`Fetching ${item.brand} - ${item.branch} (${item.place_id})...`);
    try {
      const res = await fetchPlaceByIdDirect(item.place_id);
      directResults[item.place_id] = res;
      console.log(`  -> Success: ${res.name}, Lat: ${res.latitude}, Lng: ${res.longitude}, Rating: ${res.rating}, Reviews: ${res.reviewCount}, Status: ${res.operatingStatus}`);
    } catch (err) {
      console.error(`  -> Failed: ${err.message}`);
    }
  }
  fs.writeFileSync('scripts/direct_fetched_places.json', JSON.stringify(directResults, null, 2));
  console.log('Saved all to scripts/direct_fetched_places.json');
}

run();
