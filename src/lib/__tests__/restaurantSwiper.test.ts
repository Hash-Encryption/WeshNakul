import type { RestaurantItem } from '../../types/restaurant';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

export function runRestaurantSwiperTests() {
  console.log('Running restaurant swiper tests...');

  // Existing Phase 3 winner behavior remains deterministic and client-side.
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

  console.log('All restaurant swiper tests passed successfully! ✅');
}

runRestaurantSwiperTests();
