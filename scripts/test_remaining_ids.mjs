import fs from 'node:fs';
import { fetchPlaceByIdDirect } from './fetch_place_by_id_direct.mjs';

async function testHexOrPlaceId(label, placeId) {
  console.log(`Testing ${label} (${placeId})...`);
  const res = await fetchPlaceByIdDirect(placeId);
  console.log('Result:', JSON.stringify(res, null, 2));
}

async function run() {
  // Maestro Hamdaniyah candidate ID
  await testHexOrPlaceId('Maestro Hamdaniyah candidate', 'ChIJsa_AQvl8wRURuemKWXGPApw');

  // Maestro Hamra hex from goo.gl URL
  await testHexOrPlaceId('Maestro Hamra hex', '0x15c3cf91c58ab1eb:0x35cd277c90556c83');

  // Domino's Prince Fawwaz candidate
  await testHexOrPlaceId('Domino\'s Prince Fawwaz candidate', 'ChIJUwTOkIfMwxURSLylyDE8hHU');
}

run();
