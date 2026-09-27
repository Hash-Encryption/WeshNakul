import fs from 'node:fs';
import path from 'node:path';

const envLocal = fs.readFileSync('.env.local', 'utf8');
const matchKey = envLocal.match(/^GOOGLE_MAPS_KEY=(.+)$/m);
const API_KEY = matchKey ? matchKey[1].trim() : null;

if (!API_KEY) {
  console.error('Missing GOOGLE_MAPS_KEY in .env.local');
  process.exit(1);
}

const branchesToFetch = [
  { brand_id: 'black_tap', branch_name: 'La Paz Plaza', district: 'al_salamah', place_id: 'ChIJ-Y1Y6azbwxURKyaLx0i3UDw' },
  { brand_id: 'fatt', branch_name: 'Stars Avenue', district: 'al_zahra', place_id: 'ChIJhcYBkVzZwxURPJQrFs3CSBI' },
  { brand_id: 'burger_boutique', branch_name: 'Ar Rawdah', district: 'al_rawdah', place_id: 'ChIJ2RB91HzbwxUR544gkYm5qzU' },
  { brand_id: 'place', branch_name: 'Ar Rawdah', district: 'al_rawdah', place_id: 'ChIJK-w_13vbwxURHZz0hy7bQIA' },
  { brand_id: 'score', branch_name: 'Al Zahra', district: 'al_zahra', place_id: 'ChIJP4mbowXbwxURs4_RppyWNn8' },
  { brand_id: 'smpl_brgr', branch_name: 'Al Zahra', district: 'al_zahra', place_id: 'ChIJP_rAQIjbwxURMKiPHdD7MWg' },
  { brand_id: 'bunco_burger', branch_name: 'Al Murjan', district: 'al_murjan', place_id: 'ChIJAy4Lm2HZwxURAZMq3o8KluE' },
  { brand_id: 'mmmm_burger', branch_name: 'Al Faisaliyyah', district: 'al_faisaliyyah', place_id: 'ChIJP9DteJTRwxURk2pT6oEjhTA' },
  { brand_id: 'mmmm_burger', branch_name: 'Tahliyah / Ar Rawdah', district: 'al_rawdah', place_id: 'ChIJVSHKhP7bwxUR_SfN9tyAEzY' },
  { brand_id: 'the_plan', branch_name: 'Al Sulaymaniyah', district: 'al_faiha', place_id: 'ChIJ4TtkJWzNwxURc-65l-5yxhQ' }, // Al Sulaymaniyah is adjacent to Al Faiha in south Jeddah
  { brand_id: 'the_plan', branch_name: 'Obhur / Al Zummrad', district: null, place_id: 'ChIJL6axylRjwRURNjLfpeOaH_c' },
  { brand_id: 'the_plan', branch_name: 'Al Mohammadiyyah', district: 'al_mohammadiyyah', place_id: 'ChIJNa6xZbjZwxURva53Yk2Fj04' },
  { brand_id: 'im_hungry', branch_name: 'Al Naseem', district: 'al_naseem', place_id: 'ChIJ7xK_w7rNwxURtLmeo2mELOs' },
  { brand_id: 'brgr1983', branch_name: 'Al Zahra', district: 'al_zahra', place_id: 'ChIJqaKSOAnbwxUR7ewaUIJJS1g' },
];

async function fetchBranch(item) {
  const url = `https://places.googleapis.com/v1/places/${item.place_id}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,googleMapsUri,businessStatus,regularOpeningHours'
    }
  });
  if (!res.ok) {
    console.error(`Failed to fetch ${item.brand_id} (${item.place_id}):`, res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return {
    ...item,
    displayName: data.displayName?.text,
    formattedAddress: data.formattedAddress,
    latitude: data.location?.latitude,
    longitude: data.location?.longitude,
    rating: data.rating,
    reviewCount: data.userRatingCount,
    googleMapsUri: data.googleMapsUri,
    businessStatus: data.businessStatus,
    hours: data.regularOpeningHours?.weekdayDescriptions
  };
}

async function main() {
  const results = [];
  for (const b of branchesToFetch) {
    console.log(`Fetching ${b.brand_id} ${b.branch_name}...`);
    const res = await fetchBranch(b);
    if (res) results.push(res);
  }
  console.log(`Successfully fetched ${results.length}/${branchesToFetch.length} branches.`);
  fs.writeFileSync('scripts/resolved_expansion_burger_places.json', JSON.stringify(results, null, 2));
  console.log('Saved to scripts/resolved_expansion_burger_places.json');
}

main().catch(console.error);
