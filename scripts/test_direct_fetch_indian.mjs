import { fetchPlaceDetailsDirect } from './resolve_all_grills_places.mjs';

async function test() {
  console.log('Testing The Bay Al Andalus (ChIJG0Wz5jBjwRURpr1SlkRQYBc)...');
  const res = await fetchPlaceDetailsDirect('ChIJG0Wz5jBjwRURpr1SlkRQYBc');
  console.log('Result:', JSON.stringify(res, null, 2));
}

test();
