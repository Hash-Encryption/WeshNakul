import { fetchPlaceDetailsDirect } from './fetch_place_helper.mjs';

async function test() {
  const testIds = [
    { name: 'Twina Muhammadiyah', id: 'ChIJVWeyg9PZwxURZdtvtt_aBbQ' },
    { name: 'Shrimp Anatomy Sari', id: 'ChIJp8irY5bawxURdfapLcJMIJI' },
    { name: 'Shrimp Zone Sari', id: 'ChIJGfSt5-_bwxUR4lfoUAUAzOc' }
  ];

  for (const item of testIds) {
    console.log(`Fetching ${item.name} (${item.id})...`);
    const res = await fetchPlaceDetailsDirect(item.id);
    console.log('Result:', JSON.stringify(res, null, 2));
  }
}

test();
