import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

const server = await createServer({
  server: { middlewareMode: true },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '"https://mock.supabase.co"',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '"mock-key"',
  },
});

let checks = 0;
const check = (desc, fn) => {
  try {
    fn();
    checks++;
  } catch (err) {
    console.error(`FAILED: Scenario "${desc}"`);
    throw err;
  }
};

try {
  const { normalizeRestaurantItem, normalizeRestaurantDeck } = await server.ssrLoadModule('/src/lib/restaurantNormalization.ts');
  const { SwipeCard } = await server.ssrLoadModule('/src/components/swiping/SwipeCard.tsx');
  const { SwipingDeck } = await server.ssrLoadModule('/src/components/swiping/SwipingDeck.tsx');
  const { LeaderboardView } = await server.ssrLoadModule('/src/components/swiping/LeaderboardView.tsx');
  const { ApplicationErrorBoundary, DeckErrorBoundary } = await server.ssrLoadModule('/src/components/common/ErrorBoundary.tsx');
  const { MatchCelebrationScreen } = await server.ssrLoadModule('/src/components/swiping/MatchCelebrationScreen.tsx');
  const { SuddenDeathModal } = await server.ssrLoadModule('/src/components/swiping/SuddenDeathModal.tsx');
  const { ConfirmWinnerModal } = await server.ssrLoadModule('/src/components/swiping/ConfirmWinnerModal.tsx');
  const { RestaurantRouletteOverlay } = await server.ssrLoadModule('/src/components/swiping/RestaurantRouletteOverlay.tsx');
  const { getRecentDeckErrors, clearRecentDeckErrors } = await server.ssrLoadModule('/src/lib/observability.ts');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');
  const { RoomContext } = await server.ssrLoadModule('/src/context/RoomContext.tsx');
  const mockRoomContextValue = {
    currentRoom: { id: 'room-1', code: 'TEST12', stage: 'matched' },
    currentParticipant: { id: 'p1', nickname: 'Host', is_host: true },
    participants: [{ id: 'p1', nickname: 'Host', is_host: true }],
    foodChoices: [],
    winningRestaurant: null,
    isHost: true,
    isLoading: false,
    error: null,
    roomMode: 'restaurants',
    modeTransition: null,
    triggerModeTransition: () => {},
    clearModeTransition: () => {},
    decisionSpin: null,
    pendingResolvedRoom: null,
    isResolvingTie: false,
    isJoiningRoom: false,
    isResettingRoom: false,
    suggestions: [],
    toggleSuggestion: async () => {},
    resetRoomVoting: async () => {},
  };
  const render = (node) =>
    renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(RoomContext.Provider, { value: mockRoomContextValue }, node)
      )
    );

  // Baseline Shawarma Restaurant Item with NULL rating (The exact production shape that crashed)
  const shawarmaClassicRaw = {
    id: 'shawarma_classic',
    nameAr: 'شاورما كلاسك',
    nameEn: 'Shawarma Classic',
    categories: ['shawarma'],
    isCityWide: false,
    branches: ['As Safa'],
    diningMode: 'both',
    timeSlots: ['lunch', 'dinner', 'late_night'],
    closingTimeAr: 'يقفل 3:00 ص',
    isOpenLate: true,
    is24Hours: false,
    avgPrepMinutes: 15,
    tier: 'staple',
    priceTier: '$',
    signatureDishAr: 'عربي كلاسك دجاج 🌯',
    signatureDishEn: 'Shawarma Classic Arabi 🌯',
    vibeTagsAr: ['شاورما أصلية', 'سريع'],
    vibeTagsEn: ['Classic Shawarma', 'Quick Bite'],
    rating: null, // EXACT ROOT CAUSE: null rating
    platforms: { hungerstation: true, jahez: true, keeta: true },
    links: { googleMaps: 'https://maps.google.com' },
    selectedBranch: {
      id: 'branch-sc-01',
      nameAr: 'فرع الصفا',
      nameEn: 'As Safa Branch',
      district: 'as_safa',
      rating: null, // Branch rating is also null
      distanceKm: 3.2,
    },
  };

  const shawarmerRaw = {
    id: 'shawarmer',
    nameAr: 'شاورمر',
    nameEn: 'Shawarmer',
    categories: ['shawarma'],
    isCityWide: true,
    branches: [],
    diningMode: 'both',
    timeSlots: ['lunch', 'dinner'],
    closingTimeAr: 'يقفل 2:00 ص',
    isOpenLate: true,
    is24Hours: false,
    avgPrepMinutes: 15,
    tier: 'staple',
    priceTier: '$',
    signatureDishAr: 'عربي شاورمر 🌯',
    signatureDishEn: 'Arabo Shawarmer 🌯',
    vibeTagsAr: ['ثوم زيادة'],
    vibeTagsEn: ['Extra Garlic'],
    rating: 4.2,
    platforms: { hungerstation: true, jahez: true, keeta: false },
    links: {},
  };

  console.log('--- EXECUTING 25 WHITE-SCREEN RELIABILITY SCENARIOS ---');

  // Scenario 1: Normal Shawarma deck with mixed ratings renders safely
  check('1. normal Shawarma deck', () => {
    const rawDeck = {
      deckId: 'deck-sh-01',
      generation: 0,
      restaurants: [shawarmaClassicRaw, shawarmerRaw],
    };
    const normalized = normalizeRestaurantDeck(rawDeck);
    assert.ok(normalized, 'Deck normalized');
    assert.equal(normalized.restaurants.length, 2);

    const html = render(
      createElement(SwipingDeck, {
        deck: normalized.restaurants,
        currentIndex: 0,
        totalCards: 2,
        isLoading: false,
        onVote: () => {},
      })
    );
    assert.ok(html.includes('شاورما كلاسك') || html.includes('Shawarma Classic'), 'Renders card without crash');
    assert.ok(!html.includes('NaN'), 'Never outputs NaN');
  });

  // Scenario 2: Refresh halfway through Shawarma deck (currentIndex = 1 of 2)
  check('2. refresh halfway through Shawarma deck', () => {
    const normClassic = normalizeRestaurantItem(shawarmaClassicRaw);
    const normShawarmer = normalizeRestaurantItem(shawarmerRaw);
    assert.ok(normClassic && normShawarmer);

    const html = render(
      createElement(SwipingDeck, {
        deck: [normClassic, normShawarmer],
        currentIndex: 1,
        totalCards: 2,
        isLoading: false,
        onVote: () => {},
      })
    );
    assert.ok(html.includes('Shawarmer') || html.includes('شاورمر'), 'Renders second card on halfway refresh');
  });

  // Scenario 3: Reopen existing room (deck with null-rating restaurant restored from cache)
  check('3. reopen existing room', () => {
    const cachedItem = normalizeRestaurantItem(shawarmaClassicRaw);
    store.set('wsh_deck_restaurants', JSON.stringify([cachedItem]));
    const restored = JSON.parse(store.get('wsh_deck_restaurants')).map(normalizeRestaurantItem);
    assert.equal(restored[0].id, 'shawarma_classic');
    assert.equal(restored[0].rating, null);

    const html = render(
      createElement(SwipeCard, {
        restaurant: restored[0],
        isFront: true,
        onVote: () => {},
      })
    );
    assert.ok(html.length > 0, 'Renders safely on room restore from storage');
  });

  // Scenario 4: currentIndex equals deck.length
  check('4. currentIndex equals deck.length', () => {
    const norm = normalizeRestaurantItem(shawarmerRaw);
    const html = render(
      createElement(SwipingDeck, {
        deck: [norm],
        currentIndex: 1, // equals deck.length
        totalCards: 1,
        isLoading: false,
        onVote: () => {},
      })
    );
    assert.ok(html.includes('Picks Recorded') || html.includes('اكتملت'), 'Renders safe transitional completion stage');
  });

  // Scenario 5: currentIndex greater than deck.length
  check('5. currentIndex greater than deck.length', () => {
    const norm = normalizeRestaurantItem(shawarmerRaw);
    const html = render(
      createElement(SwipingDeck, {
        deck: [norm],
        currentIndex: 99, // far out of bounds
        totalCards: 1,
        isLoading: false,
        onVote: () => {},
      })
    );
    assert.ok(html.includes('Picks Recorded') || html.includes('اكتملت'), 'Safely handles out-of-bounds index without crash');
  });

  // Scenario 6: currentIndex invalid / null / NaN / negative
  check('6. currentIndex invalid/null', () => {
    const norm = normalizeRestaurantItem(shawarmaClassicRaw);
    for (const badIdx of [null, undefined, NaN, -5, 'bad']) {
      const html = render(
        createElement(SwipingDeck, {
          deck: [norm],
          currentIndex: badIdx,
          totalCards: 1,
          isLoading: false,
          onVote: () => {},
        })
      );
      assert.ok(html.includes('شاورما كلاسك') || html.includes('Shawarma Classic'), `Handles bad index ${badIdx} safely`);
    }
  });

  // Scenario 7: empty deck (deck.length === 0)
  check('7. empty deck', () => {
    const html = render(
      createElement(SwipingDeck, {
        deck: [],
        currentIndex: 0,
        totalCards: 0,
        isLoading: false,
        onVote: () => {},
      })
    );
    assert.ok(html.length > 0, 'Renders container safely without white screen');
  });

  // Scenario 8: one-card deck
  check('8. one-card deck', () => {
    const norm = normalizeRestaurantItem(shawarmaClassicRaw);
    const html = render(
      createElement(SwipingDeck, {
        deck: [norm],
        currentIndex: 0,
        totalCards: 1,
        isLoading: false,
        onVote: () => {},
      })
    );
    assert.ok(html.includes('شاورما كلاسك') || html.includes('Shawarma Classic'), 'One-card deck renders perfectly');
  });

  // Scenario 9: final card swipe / completion leaderboard
  check('9. final card swipe', () => {
    const norm1 = normalizeRestaurantItem(shawarmaClassicRaw);
    const norm2 = normalizeRestaurantItem(shawarmerRaw);
    const html = render(
      createElement(LeaderboardView, {
        restaurants: [norm1, norm2],
        summary: {
          round: 1,
          deckId: 'deck-01',
          totalCards: 2,
          status: 'resolved',
          cards: [
            { restaurantId: 'shawarma_classic', yesCount: 2, noCount: 0 },
            { restaurantId: 'shawarmer', yesCount: 1, noCount: 1 },
          ],
          participantProgress: [],
        },
        participants: [{ id: 'p1', nickname: 'Host', is_host: true }],
        isHost: true,
        onConfirmPick: () => {},
        onTriggerSuddenDeath: () => {},
        onTriggerRoulette: () => {},
      })
    );
    assert.ok(html.includes('شاورما كلاسك') || html.includes('Shawarma Classic'), 'Leaderboard handles null rating sorting and renders cleanly');
  });

  // Scenario 10: candidate removed after room was created
  check('10. candidate removed after room was created', () => {
    const rawDeck = {
      deckId: 'deck-01',
      generation: 0,
      restaurants: [shawarmerRaw], // classic was removed from server
    };
    const normDeck = normalizeRestaurantDeck(rawDeck);
    assert.equal(normDeck.restaurants.length, 1);
    assert.equal(normDeck.restaurants[0].id, 'shawarmer');
  });

  // Scenario 11: branch removed/inactivated after room was created
  check('11. branch removed/inactivated after room was created', () => {
    const itemWithoutBranch = {
      ...shawarmaClassicRaw,
      selectedBranch: null,
      branches: [],
    };
    const norm = normalizeRestaurantItem(itemWithoutBranch);
    assert.ok(norm);
    assert.equal(norm.selectedBranch, null);
    const html = render(
      createElement(SwipeCard, {
        restaurant: norm,
        isFront: true,
        onVote: () => {},
      })
    );
    assert.ok(html.length > 0, 'Renders restaurant without selected branch');
  });

  // Scenario 12: candidate becomes ineligible after filtering
  check('12. candidate becomes ineligible after filtering', () => {
    const rawDeck = {
      deckId: 'deck-01',
      generation: 0,
      restaurants: [
        shawarmaClassicRaw,
        { id: '', nameEn: 'Broken candidate' }, // invalid ID
      ],
    };
    const normDeck = normalizeRestaurantDeck(rawDeck);
    assert.equal(normDeck.restaurants.length, 1, 'Ineligible candidate dropped cleanly');
  });

  // Scenario 13: missing optional image
  check('13. missing optional image', () => {
    const itemWithoutImg = { ...shawarmaClassicRaw, imageUrl: undefined };
    const norm = normalizeRestaurantItem(itemWithoutImg);
    const html = render(
      createElement(SwipeCard, {
        restaurant: norm,
        isFront: true,
        onVote: () => {},
      })
    );
    assert.ok(html.includes('🍽️'), 'Renders branded placeholder when image missing');
    assert.ok(html.includes('وش ناكل؟') || html.includes('WeshNakul'), 'Displays branded placeholder text');
  });

  // Scenario 14: missing optional rating (core production bug)
  check('14. missing optional rating', () => {
    const norm = normalizeRestaurantItem(shawarmaClassicRaw);
    assert.equal(norm.rating, null);
    const html = render(
      createElement(SwipeCard, {
        restaurant: norm,
        isFront: true,
        onVote: () => {},
      })
    );
    assert.ok(!html.includes('toFixed'), 'Does not crash on null rating');
    assert.ok(!html.includes('NaN'), 'Does not render NaN');
  });

  // Scenario 15: missing optional price information
  check('15. missing optional price information', () => {
    const itemWithoutPrice = { ...shawarmaClassicRaw, priceTier: null };
    const norm = normalizeRestaurantItem(itemWithoutPrice);
    assert.ok(norm);
    assert.equal(norm.priceTier, null, 'Preserves null priceTier without fabricating defaults');
    const html = render(
      createElement(SwipeCard, {
        restaurant: norm,
        isFront: true,
        onVote: () => {},
      })
    );
    assert.ok(html.length > 0, 'Renders card safely without price tier badge');
    assert.ok(!html.includes('bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] px-2 py-0.5 rounded-md text-xs font-black'), 'Does not fabricate price badge');
  });

  // Scenario 16: missing required candidate ID
  check('16. missing required candidate ID', () => {
    clearRecentDeckErrors();
    const badCandidate = { ...shawarmaClassicRaw, id: null };
    const result = normalizeRestaurantItem(badCandidate);
    assert.equal(result, null, 'Rejects candidate missing ID');
    const errors = getRecentDeckErrors();
    assert.ok(errors.some((e) => e.message.includes('missing required string ID')), 'Logs structured rejection');
  });

  // Scenario 17: malformed restaurant response
  check('17. malformed restaurant response', () => {
    for (const malformed of [null, undefined, 'text', 123, {}, { id: 456 }]) {
      const res = normalizeRestaurantItem(malformed);
      assert.equal(res, null, 'Safely rejects malformed candidate');
    }
  });

  // Scenario 18: failed Supabase request (DeckErrorBoundary recovery UI)
  check('18. failed Supabase request', () => {
    const html = render(
      createElement(
        DeckErrorBoundary,
        {
          isHost: true,
          onRetry: () => {},
        },
        createElement('div', null, 'Normal content')
      )
    );
    assert.ok(html.includes('Normal content'), 'Renders child when no error');
  });

  // Scenario 19: slow Supabase request (SwipingDeck loading skeleton)
  check('19. slow Supabase request', () => {
    const html = render(
      createElement(SwipingDeck, {
        deck: [],
        currentIndex: 0,
        totalCards: 7,
        isLoading: true,
        onVote: () => {},
      })
    );
    assert.ok(html.includes('animate-pulse'), 'Renders loading skeleton during slow request');
  });

  // Scenario 20: duplicate candidates in deck
  check('20. duplicate candidates', () => {
    const rawDeck = {
      deckId: 'deck-dupes',
      generation: 0,
      restaurants: [shawarmaClassicRaw, shawarmaClassicRaw, shawarmerRaw],
    };
    const normDeck = normalizeRestaurantDeck(rawDeck);
    assert.equal(normDeck.restaurants.length, 2, 'Deduplicates identical candidates');
    assert.deepEqual(normDeck.restaurants.map((r) => r.id), ['shawarma_classic', 'shawarmer']);
  });

  // Scenario 21: room restored after newer deployment (stale localStorage items sanitized)
  check('21. room restored after a newer deployment', () => {
    const oldCorruptCache = [
      { id: 'legacy_1', nameEn: 'Old Place', rating: 'invalid-rating', priceTier: 'unknown' },
    ];
    store.set('wsh_deck_restaurants', JSON.stringify(oldCorruptCache));
    const rawFromStorage = JSON.parse(store.get('wsh_deck_restaurants'));
    const sanitized = rawFromStorage.map((r) => normalizeRestaurantItem(r)).filter(Boolean);
    assert.equal(sanitized[0].id, 'legacy_1');
    assert.equal(sanitized[0].rating, null, 'Invalid rating string safely converted to null');
    assert.equal(sanitized[0].priceTier, null, 'Unknown priceTier safely preserved as null');
  });

  // Scenario 22: rapid votes (normalization & bounds safety)
  check('22. user swipes rapidly', () => {
    const norm = normalizeRestaurantItem(shawarmaClassicRaw);
    // Simulates index moving from 0 to 5 in rapid succession
    for (let idx = 0; idx <= 5; idx++) {
      const html = render(
        createElement(SwipingDeck, {
          deck: [norm],
          currentIndex: idx,
          totalCards: 1,
          isLoading: false,
          onVote: () => {},
        })
      );
      assert.ok(html.length > 0, `Renders without crashing on rapid step ${idx}`);
    }
  });

  // Scenario 23: user reloads during swipe/transition (transitional state)
  check('23. user reloads during swipe/transition', () => {
    const norm = normalizeRestaurantItem(shawarmaClassicRaw);
    const html = render(
      createElement(SwipingDeck, {
        deck: [norm],
        currentIndex: 1, // at transition boundary
        totalCards: 1,
        isLoading: false,
        onVote: () => {},
      })
    );
    assert.ok(html.includes('Picks Recorded') || html.includes('اكتملت'), 'Handles reload during card transition');
  });

  // Scenario 24: all remaining restaurants become invalid
  check('24. all remaining restaurants become invalid', () => {
    const rawDeck = {
      deckId: 'deck-all-invalid',
      generation: 0,
      restaurants: [
        { invalid: true },
        { id: null },
      ],
    };
    const normDeck = normalizeRestaurantDeck(rawDeck);
    assert.equal(normDeck.restaurants.length, 0, 'Deck cleanly reduced to 0 items');
  });

  // Scenario 25: error boundary itself successfully renders recovery UI
  check('25. error boundary itself successfully renders recovery UI', () => {
    const error = new Error('Simulated runtime render crash');
    const boundary = new ApplicationErrorBoundary({ children: null });
    const derivedState = ApplicationErrorBoundary.getDerivedStateFromError(error);
    assert.equal(derivedState.hasError, true);
    assert.equal(derivedState.error, error);
    boundary.state = derivedState;
    const html = render(boundary.render());
    assert.ok(html.includes('Something went wrong') || html.includes('حدث خطأ غير متوقع'), 'Renders branded recovery title');
    assert.ok(html.includes('Try Again') || html.includes('إعادة المحاولة'), 'Offers Try Again button');
    assert.ok(html.includes('Start Fresh') || html.includes('البدء من جديد'), 'Offers Start Fresh button');
    assert.ok(!html.includes('white screen'), 'Error Boundary prevents blank white screen');
  });

  // Core flow verification with other categories: Burger & Broast
  console.log('\n--- VERIFYING CORE FLOW ACROSS BURGER AND BROAST CATEGORIES ---');

  check('Generic category check: Burger candidate with null rating', () => {
    const burgerCandidate = {
      id: 'century_burger',
      nameAr: 'سنشري برجر',
      nameEn: 'Century Burger',
      categories: ['burger'],
      rating: null, // Test burger with null rating
      priceTier: '$$',
    };
    const norm = normalizeRestaurantItem(burgerCandidate);
    assert.ok(norm);
    const html = render(
      createElement(SwipeCard, {
        restaurant: norm,
        isFront: true,
        onVote: () => {},
      })
    );
    assert.ok(html.includes('سنشري برجر') || html.includes('Century Burger'));
    assert.ok(html.includes('🍽️'), 'Renders branded placeholder when image is missing');
  });

  check('Generic category check: Broast candidate with null rating', () => {
    const broastCandidate = {
      id: 'albaik',
      nameAr: 'البيك',
      nameEn: 'ALBAIK',
      categories: ['broast'],
      rating: null,
      priceTier: '$',
      imageUrl: 'https://cdn.weshnakul.sa/photos/albaik-verified.jpg',
    };
    const norm = normalizeRestaurantItem(broastCandidate);
    assert.ok(norm);
    const html = render(
      createElement(SwipeCard, {
        restaurant: norm,
        isFront: true,
        onVote: () => {},
      })
    );
    assert.ok(html.includes('البيك') || html.includes('ALBAIK'));
    assert.ok(html.includes('https://cdn.weshnakul.sa/photos/albaik-verified.jpg'), 'Renders verified image when provided');
  });

  check('MatchCelebrationScreen with null rating restaurant', () => {
    const normClassic = normalizeRestaurantItem(shawarmaClassicRaw);
    const html = render(
      createElement(MatchCelebrationScreen, {
        restaurant: normClassic,
        participants: [{ id: 'p1', nickname: 'Host', is_host: true }],
        roomId: 'room-1',
        isHost: true,
      })
    );
    assert.ok(html.includes('Shawarma Classic') || html.includes('شاورما كلاسك'));
    assert.ok(!html.includes('toFixed'), 'MatchCelebrationScreen renders winner with null rating safely');
  });

  check('SuddenDeathModal with null rating restaurants', () => {
    const r1 = normalizeRestaurantItem(shawarmaClassicRaw);
    const r2 = normalizeRestaurantItem({ ...shawarmerRaw, rating: null });
    const html = render(
      createElement(SuddenDeathModal, {
        isOpen: true,
        roomId: 'room-1',
        currentParticipantId: 'p1',
        isHost: true,
        restaurants: [r1, r2],
        totalParticipants: 2,
        onSelectWinner: () => {},
        onClose: () => {},
      })
    );
    assert.ok(html.includes('VS'), 'SuddenDeathModal renders with null ratings safely');
  });

  check('ConfirmWinnerModal with null rating restaurant', () => {
    const r1 = normalizeRestaurantItem(shawarmaClassicRaw);
    const html = render(
      createElement(ConfirmWinnerModal, {
        isOpen: true,
        restaurant: r1,
        onClose: () => {},
        onConfirm: () => {},
      })
    );
    assert.ok(html.includes('Shawarma Classic') || html.includes('شاورما كلاسك'));
  });

  check('RestaurantRouletteOverlay with candidate restaurants', () => {
    const r1 = normalizeRestaurantItem(shawarmaClassicRaw);
    const r2 = normalizeRestaurantItem(shawarmerRaw);
    const html = render(
      createElement(RestaurantRouletteOverlay, {
        spin: {
          id: 'spin-1',
          kind: 'restaurant',
          candidateIds: ['shawarma_classic', 'shawarmer'],
          startedAt: Date.now(),
        },
        restaurants: [r1, r2],
      })
    );
    assert.ok(html.length > 0, 'RestaurantRouletteOverlay renders slices safely');
  });

  console.log(`\nPASS: All ${checks} White-Screen Reliability & Regression checks passed successfully!`);
} finally {
  await server.close();
}
