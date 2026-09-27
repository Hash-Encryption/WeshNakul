import fs from 'node:fs';
import { fetchPlaceDetailsDirect } from './fetch_place_helper.mjs';

const placesToFetch = [
  { brand: 'Noto', branch: 'Jeddah Walk', place_id: 'ChIJUyfUUtHFwxURvBANkV2JDck' },
  { brand: 'San Carlo Cicchetti', branch: 'Ar Rawdah', place_id: 'ChIJDf-YJh7bwxURl0MqeLVAWhw' },
  { brand: 'Piatto', branch: 'Etoile / Al Zahra', place_id: 'ChIJv0Uh5unawxURKQlZ_jaEdTY' },
  { brand: 'Piatto', branch: 'Prince Sultan', place_id: 'ChIJCbBXZovZwxURLTahf-whPQo' },
  { brand: 'Piatto', branch: 'Emaar Square', place_id: 'ChIJZb0FIa7PwxURV0LcamCcdhA' },
  { brand: 'Piatto', branch: 'The Village', place_id: 'ChIJyweiP5h9wRURge_HLN6pGWk' },
  { brand: 'Piatto', branch: 'Mall of Arabia', place_id: 'ChIJca-CWSrXwxURgh2LAWQ2AZE' },
  { brand: 'Olive Garden', branch: 'Atelier LaVie', place_id: 'ChIJt5tYPPHbwxURUUbPlY7uzWo' },
  { brand: 'Eataly', branch: 'Jeddah Vibes', place_id: 'ChIJkR0wGgDRwxURbuskasl50nU' },
  { brand: 'IL Vero', branch: 'Al Andalus', place_id: 'ChIJAwP2aQPQwxURGYkUSLA8hk0' },
  { brand: 'IL Vero', branch: 'Second Jeddah listing (Al Sheraa)', place_id: 'ChIJ07X0n-ZjwRURdGyPP-fukOQ' },
  { brand: 'Portofino', branch: 'Ar Rawdah', place_id: 'ChIJnSdklK_awxURiwMU9F2xN6M' },
  { brand: 'Vivaci', branch: 'Al Zahra', place_id: 'ChIJDYKLVhrbwxURavlhB-QeaGQ' },
  { brand: 'Salernoo', branch: 'Al Zahra', place_id: 'ChIJCTcptgHbwxURPbuWt4KeAi8' },
  { brand: 'IL Castello', branch: 'Al Sharafeyah', place_id: 'ChIJQW4PGMbPwxUR-OfJcYLfYLg' },
  // Pizza overlaps
  { brand: "Jon & Vinny's", branch: 'La Paz / As Salamah', place_id: 'ChIJL1hhI4zbwxURYcBSwlTBhLo' },
  { brand: 'Napoli Blu', branch: 'Ar Rawdah', place_id: 'ChIJM2DnNgDRwxUR2Z5xk02gukQ' },
  { brand: 'Pizzalio', branch: 'As Salamah', place_id: 'ChIJc-aQA9PbwxUR2cOZdM6POTE' },
  { brand: 'Vera Pizza', branch: 'Al Zahra', place_id: 'ChIJc_9rnWbawxURdqShiels-ow' },
  { brand: 'Vera Pizza', branch: 'Obhur Al Shamaliyah', place_id: 'ChIJUyizioNjwRURBwf0xqdZ0P4' },
  { brand: 'Pizza Lenuo', branch: 'Al Hamra', place_id: 'ChIJwyXLvoXPwxURmPwwIPOhNPk' },
  { brand: 'il Postino Pizzeria', branch: 'Al Khalidiyyah / Sari Road', place_id: 'ChIJOd4ucWnbwxUREsfKPgbPHMc' },
  { brand: 'il Postino Pizzeria', branch: 'Al Murjan / King Abdulaziz Road', place_id: 'ChIJhfNya6HZwxURtxSMFrcWVnE' }
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Starting fetch for ${placesToFetch.length} candidate places...`);
  const results = {};

  for (let i = 0; i < placesToFetch.length; i++) {
    const item = placesToFetch[i];
    console.log(`[${i + 1}/${placesToFetch.length}] Fetching ${item.brand} — ${item.branch} (${item.place_id})...`);
    const res = await fetchPlaceDetailsDirect(item.place_id);
    if (res.error) {
      console.error(`  -> ERROR: ${res.error}`);
      results[item.place_id] = { error: res.error, item };
    } else {
      console.log(`  -> SUCCESS: ${res.name} | Lat: ${res.latitude}, Lng: ${res.longitude} | Rating: ${res.rating} (${res.user_rating_count}) | Status: ${res.operating_status}`);
      console.log(`     Address: ${res.address}`);
      console.log(`     Hours: ${res.hours_text}`);
      results[item.place_id] = { ...res, item };
    }
    await delay(500);
  }

  fs.writeFileSync('scripts/resolved_italian_places_direct.json', JSON.stringify(results, null, 2));
  console.log('\nAll 23 branches processed. Saved to scripts/resolved_italian_places_direct.json');
}

main().catch(console.error);
