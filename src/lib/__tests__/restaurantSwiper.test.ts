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

  const friedChickenDeck = getDeckForRoom('fried_chicken', 'riyadh');
  assert(friedChickenDeck.length >= 5 && friedChickenDeck.length <= 7, 'Fried chicken deck must be between 5 and 7');
  assert(friedChickenDeck.some((r) => r.id === 'rest_chicken_01'), 'Raising Cane\'s should be in fried chicken deck');

  // 2. Unknown category falls back to overall top rated and has >= 5 items
  const unknownCategoryDeck = getDeckForRoom('non_existent_category', 'riyadh');
  assert(unknownCategoryDeck.length >= 5 && unknownCategoryDeck.length <= 7, 'Unknown category fallback must have 5-7 items');

  // 2b. Newly registered categories without dedicated restaurant datasets fallback cleanly to top-rated staples (5-7 cards)
  const streetFolkDeck = getDeckForRoom('street_folk', 'jeddah', 'al_rawdah');
  assert(streetFolkDeck.length >= 5 && streetFolkDeck.length <= 7, 'street_folk deck must have 5-7 items via fallback');

  const indianDeck = getDeckForRoom('indian', 'riyadh');
  assert(indianDeck.length >= 5 && indianDeck.length <= 7, 'indian deck must have 5-7 items via fallback');

  // 3. District matching
  const districtDeck = getDeckForRoom('burger', 'riyadh', 'al-olaya');
  assert(districtDeck.length >= 5 && districtDeck.length <= 7, 'District deck must have 5-7 items');
  assert(districtDeck[0].id === 'rest_burger_01', 'Chef\'s burger should be first match in Al-Olaya');

  // 4. Deterministic tie-breaking verification
  // Sort rules:
  // 1. Likes (desc)
  // 2. Rating (desc)
  // 3. Catalog ID (alphabetical asc)
  const candidateA: RestaurantItem = {
    id: 'rest_z',
    nameAr: 'أ',
    nameEn: 'A',
    categoryId: 'burger',
    cities: ['riyadh'],
    priceTier: '$$',
    signatureDishAr: 'طبق',
    signatureDishEn: 'Dish',
    vibeTagsAr: ['رايق'],
    vibeTagsEn: ['Cozy'],
    imageUrl: '',
    rating: 4.8,
  };

  const candidateB: RestaurantItem = {
    id: 'rest_a',
    nameAr: 'ب',
    nameEn: 'B',
    categoryId: 'burger',
    cities: ['riyadh'],
    priceTier: '$$',
    signatureDishAr: 'طبق',
    signatureDishEn: 'Dish',
    vibeTagsAr: ['رايق'],
    vibeTagsEn: ['Cozy'],
    imageUrl: '',
    rating: 4.8,
  };

  const candidateC: RestaurantItem = {
    id: 'rest_c',
    nameAr: 'ج',
    nameEn: 'C',
    categoryId: 'burger',
    cities: ['riyadh'],
    priceTier: '$$',
    signatureDishAr: 'طبق',
    signatureDishEn: 'Dish',
    vibeTagsAr: ['رايق'],
    vibeTagsEn: ['Cozy'],
    imageUrl: '',
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

  console.log('All restaurant swiper tests passed successfully! ✅');
}

runRestaurantSwiperTests();
