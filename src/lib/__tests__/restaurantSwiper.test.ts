import { getDeckForRoom } from '../../data/restaurants';
import type { RestaurantItem } from '../../types/restaurant';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

export function runRestaurantSwiperTests() {
  console.log('Running restaurant swiper tests...');

  // 1. Deck size must be strictly between 5 and 7
  const burgerRiyadhDeck = getDeckForRoom('burger', 'riyadh');
  assert(burgerRiyadhDeck.length >= 5 && burgerRiyadhDeck.length <= 7, 'Burger deck must be between 5 and 7');

  const shawarmaJeddahDeck = getDeckForRoom('shawarma', 'jeddah');
  assert(shawarmaJeddahDeck.length >= 5 && shawarmaJeddahDeck.length <= 7, 'Shawarma deck must be between 5 and 7');

  const broastDeck = getDeckForRoom('broast', 'jeddah');
  assert(broastDeck.length >= 5 && broastDeck.length <= 7, 'Broast deck must be between 5 and 7');
  assert(broastDeck.some((r) => r.id === 'albaik'), 'ALBAIK should be in broast deck');

  // 2. Unknown category falls back to overall top rated and has >= 5 items
  const unknownCategoryDeck = getDeckForRoom('non_existent_category', 'riyadh');
  assert(unknownCategoryDeck.length >= 5 && unknownCategoryDeck.length <= 7, 'Unknown category fallback must have 5-7 items');

  // 2b. Newly registered categories without dedicated restaurant datasets fallback cleanly to top-rated staples (5-7 cards)
  const streetFolkDeck = getDeckForRoom('street_folk', 'jeddah', 'al_rawdah');
  assert(streetFolkDeck.length >= 5 && streetFolkDeck.length <= 7, 'street_folk deck must have 5-7 items via fallback');

  const indianDeck = getDeckForRoom('indian', 'riyadh');
  assert(indianDeck.length >= 5 && indianDeck.length <= 7, 'indian deck must have 5-7 items via fallback');

  // 3. District matching
  const districtDeck = getDeckForRoom('burger', 'jeddah', 'al_rawdah');
  assert(districtDeck.length >= 5 && districtDeck.length <= 7, 'District deck must have 5-7 items');

  // 4. Deterministic tie-breaking verification
  // Sort rules:
  // 1. Likes (desc)
  // 2. Rating (desc)
  // 3. Catalog ID (alphabetical asc)
  const baseCandidate = {
    categories: ['burger'],
    isCityWide: true,
    branches: [] as string[],
    diningMode: 'both' as const,
    timeSlots: ['lunch' as const, 'dinner' as const, 'late_night' as const],
    closingTimeAr: 'يقفل 2:00 ص',
    isOpenLate: true,
    is24Hours: false,
    avgPrepMinutes: 20,
    tier: 'staple' as const,
    priceTier: '$$' as const,
    signatureDishAr: 'طبق',
    signatureDishEn: 'Dish',
    vibeTagsAr: ['رايق'],
    vibeTagsEn: ['Cozy'],
    platforms: { hungerstation: true, jahez: true, keeta: true },
    links: { googleMaps: '', hungerstationSearch: '', jahezSearch: '', keetaSearch: '' },
  };

  const candidateA: RestaurantItem = {
    ...baseCandidate,
    id: 'rest_z',
    nameAr: 'أ',
    nameEn: 'A',
    rating: 4.8,
  };

  const candidateB: RestaurantItem = {
    ...baseCandidate,
    id: 'rest_a',
    nameAr: 'ب',
    nameEn: 'B',
    rating: 4.8,
  };

  const candidateC: RestaurantItem = {
    ...baseCandidate,
    id: 'rest_c',
    nameAr: 'ج',
    nameEn: 'C',
    rating: 4.5,
  };

  const testDeck = [candidateA, candidateB, candidateC];
  const likesCounts: Record<string, number> = {
    rest_z: 2,
    rest_a: 2,
    rest_c: 3,
  };

  // Case 1: Higher likes wins (Candidate C has 3 likes)
  const sortedByLikes = [...testDeck].sort((a, b) => {
    const diffLikes = likesCounts[b.id] - likesCounts[a.id];
    if (diffLikes !== 0) return diffLikes;
    const diffRating = b.rating - a.rating;
    if (diffRating !== 0) return diffRating;
    return a.id.localeCompare(b.id);
  });
  assert(sortedByLikes[0].id === 'rest_c', 'Highest likes should win');

  // Case 2: Equal likes, higher rating wins
  const likesCounts2: Record<string, number> = {
    rest_z: 2, // rating 4.8
    rest_a: 1, // rating 4.8
    rest_c: 2, // rating 4.5
  };
  const sortedByRating = [...testDeck].sort((a, b) => {
    const diffLikes = likesCounts2[b.id] - likesCounts2[a.id];
    if (diffLikes !== 0) return diffLikes;
    const diffRating = b.rating - a.rating;
    if (diffRating !== 0) return diffRating;
    return a.id.localeCompare(b.id);
  });
  assert(sortedByRating[0].id === 'rest_z', 'Equal likes should break tie with higher rating');

  // Case 3: Equal likes and equal rating, alphabetical ascending ID wins (rest_a < rest_z)
  const likesCounts3: Record<string, number> = {
    rest_z: 2, // rating 4.8, id 'rest_z'
    rest_a: 2, // rating 4.8, id 'rest_a'
    rest_c: 1, // rating 4.5
  };
  const sortedById = [...testDeck].sort((a, b) => {
    const diffLikes = likesCounts3[b.id] - likesCounts3[a.id];
    if (diffLikes !== 0) return diffLikes;
    const diffRating = b.rating - a.rating;
    if (diffRating !== 0) return diffRating;
    return a.id.localeCompare(b.id);
  });
  assert(sortedById[0].id === 'rest_a', 'Equal likes and rating should break tie by alphabetical ID (rest_a < rest_z)');

  // 5. Dine-in ("طلعة") Cloud Kitchen Filter Check
  const cloudKitchenItem: RestaurantItem = {
    ...baseCandidate,
    id: 'cloud_box',
    nameAr: 'سحابي بوكس',
    nameEn: 'Cloud Box',
    categories: ['burger'],
    diningMode: 'delivery_only',
    vibeTagsAr: ['سحابي', 'توصيل فقط'],
    vibeTagsEn: ['Cloud Kitchen', 'Delivery Only'],
    rating: 4.9,
  };
  const dineInItem: RestaurantItem = {
    ...baseCandidate,
    id: 'dine_spot',
    nameAr: 'مطعم محلي',
    nameEn: 'Dine Spot',
    categories: ['burger'],
    diningMode: 'both',
    vibeTagsAr: ['جلسات رايقة'],
    vibeTagsEn: ['Dine-in Seating'],
    rating: 4.7,
  };

  const customPool = [cloudKitchenItem, dineInItem];
  const dineInDeck = getDeckForRoom('burger', 'riyadh', undefined, customPool, 'dine_in');
  assert(!dineInDeck.some((r) => r.id === 'cloud_box'), 'Cloud kitchen must be excluded in dine_in mode');
  assert(dineInDeck.some((r) => r.id === 'dine_spot'), 'Dine-in restaurant must be retained in dine_in mode');

  const deliveryDeck = getDeckForRoom('burger', 'riyadh', undefined, customPool, 'delivery');
  assert(deliveryDeck.some((r) => r.id === 'cloud_box'), 'Cloud kitchen should be allowed in delivery mode');

  console.log('All restaurant swiper tests passed successfully! ✅');
}

runRestaurantSwiperTests();
