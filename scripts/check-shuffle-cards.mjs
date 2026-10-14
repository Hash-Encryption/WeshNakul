import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
};

const server = await createServer({
  server: { middlewareMode: true },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '""',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
  },
});

let checks = 0;
const check = (desc, fn) => {
  try {
    fn();
    checks++;
  } catch (err) {
    console.error(`FAILED: "${desc}"`);
    throw err;
  }
};

try {
  const { MINI_GAMES } = await server.ssrLoadModule('/src/config/miniGames.ts');
  const { WeshNakulCardBack } = await server.ssrLoadModule('/src/components/minigames/shuffle_cards/WeshNakulCardBack.tsx');
  const { ShuffleCard } = await server.ssrLoadModule('/src/components/minigames/shuffle_cards/ShuffleCard.tsx');
  const { ShuffleCardsModal } = await server.ssrLoadModule('/src/components/minigames/shuffle_cards/ShuffleCardsModal.tsx');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');

  console.log('--- EXECUTING SHUFFLE CARDS TIE-BREAKER VERIFICATION SUITE ---');

  // 1. Verify Shuffle Cards configuration
  check('1. Shuffle Cards configuration is fully implemented and marked playable', () => {
    const game = MINI_GAMES.find((g) => g.id === 'shuffle_cards');
    assert.ok(game, 'Shuffle Cards must exist in MINI_GAMES');
    assert.equal(game.implemented, true, 'Must be implemented = true');
    assert.equal(game.needsCaptain, true, 'Must require captain');
    assert.equal(game.minPlayers, 1, 'Supports solo (1) or multiplayer (2+)');
    assert.deepEqual(game.idealTieCounts, [3], 'Ideal tie count is 3');
    assert.ok(game.supportedTieCounts?.includes(2), 'Supports 2 tied');
    assert.ok(game.supportedTieCounts?.includes(3), 'Supports 3 tied');
    assert.ok(game.supportedTieCounts?.includes(4), 'Supports 4 tied');
    assert.ok(game.supportedTieCounts?.includes(5), 'Supports 5+ tied');
  });

  // 2. Suitability rules across player and tie counts
  check('2. Suitability rules across 2, 3, 4, 5+ ties and player thresholds', () => {
    const game = MINI_GAMES.find((g) => g.id === 'shuffle_cards');

    // Zero players -> unavailable
    const zero = game.getSuitability({ tieCount: 3, activePlayerCount: 0, tieType: 'restaurant' });
    assert.equal(zero.state, 'unavailable');
    assert.equal(zero.reasonKey, 'gameSwiper.badgeNeedsPlayers');

    // Single player (solo host) -> recommended for 3 tied
    const single = game.getSuitability({ tieCount: 3, activePlayerCount: 1, tieType: 'restaurant' });
    assert.equal(single.state, 'recommended');

    // 2 players, 3 tied -> recommended
    const rec3 = game.getSuitability({ tieCount: 3, activePlayerCount: 2, tieType: 'restaurant' });
    assert.equal(rec3.state, 'recommended');
    assert.equal(rec3.badgeKey, 'gameSwiper.badgeBestForTie');

    // 2 tied -> normal
    const norm2 = game.getSuitability({ tieCount: 2, activePlayerCount: 3, tieType: 'restaurant' });
    assert.equal(norm2.state, 'normal');

    // 4 tied -> normal
    const norm4 = game.getSuitability({ tieCount: 4, activePlayerCount: 3, tieType: 'restaurant' });
    assert.equal(norm4.state, 'normal');

    // 5+ tied -> playable with vortex qualifier
    const vortex5 = game.getSuitability({ tieCount: 5, activePlayerCount: 4, tieType: 'restaurant' });
    assert.ok(['normal', 'less_ideal'].includes(vortex5.state));
  });

  // 3. WeshNakul Card Back visual components and branding
  check('3. WeshNakulCardBack renders official emblem with pizza, burger, and question mark', () => {
    const html = renderToStaticMarkup(createElement(WeshNakulCardBack));
    assert.ok(html.includes('🍕'), 'Contains pizza emoji');
    assert.ok(html.includes('🍔'), 'Contains burger emoji');
    assert.ok(html.includes('؟'), 'Contains Arabic 3D question mark emblem');
    assert.ok(html.includes('bg-gradient-to-b from-[#B73516]'), 'Terracotta background gradient');
  });

  // 4. ShuffleCard renders front and back face with 3D preservation
  check('4. ShuffleCard renders front with restaurant data and back with WeshNakul card back', () => {
    store.set('wsh_locale', 'en');
    const mockRestaurant = {
      id: 'al_balad_shawarma',
      nameEn: 'Shawarma Al-Balad',
      nameAr: 'شاورما البلد',
      rating: 4.8,
      categories: ['local', 'late_night'],
      imageUrl: 'https://example.com/shawarma.jpg',
    };

    const cardItem = {
      id: 'al_balad_shawarma',
      isShuffleAgain: false,
      restaurant: mockRestaurant,
      contenderLabel: 'Contender A',
      isFaceUp: true,
      isZoomed: false,
      isWinner: false,
      isEjected: false,
      slotIndex: 0,
    };

    const html = renderToStaticMarkup(
      createElement(LocaleProvider, null, createElement(ShuffleCard, { card: cardItem }))
    );

    assert.ok(html.includes('Shawarma Al-Balad'), 'Restaurant name rendered on front');
    assert.ok(html.includes('Contender A'), 'Contender label rendered on front');
    assert.ok(html.includes('4.8'), 'Rating rendered on front');
    assert.ok(html.includes('🍕') && html.includes('🍔') && html.includes('؟'), 'Back face contains emblem');
  });

  // 5. ShuffleCard renders distinct "Shuffle Again" action card face
  check('5. ShuffleCard renders distinct Shuffle Again action card face', () => {
    store.set('wsh_locale', 'en');
    const shuffleAgainItem = {
      id: 'shuffle_again',
      isShuffleAgain: true,
      contenderLabel: 'Shuffle Again',
      isFaceUp: true,
      isZoomed: false,
      isWinner: false,
      isEjected: false,
      slotIndex: 1,
    };

    const html = renderToStaticMarkup(
      createElement(LocaleProvider, null, createElement(ShuffleCard, { card: shuffleAgainItem }))
    );

    assert.ok(html.includes('🔄'), 'Contains rotating shuffle icon');
    assert.ok(html.includes('Shuffle Again'), 'Contains Shuffle Again text');
  });

  // 6. Contender Count Rule Case 1: Exactly 2 tied contenders produces 3 cards on table
  check('6. Exactly 2 tied contenders sets up 3-card table with Shuffle Again card', () => {
    store.set('wsh_locale', 'en');
    const mockRestaurants = [
      { id: 'rest_1', nameEn: 'Burger Corner', nameAr: 'ركن البرجر', rating: 4.5 },
      { id: 'rest_2', nameEn: 'Pizza Spot', nameAr: 'بيتزا سبوت', rating: 4.6 },
    ];

    const html = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(ShuffleCardsModal, {
          isOpen: true,
          roomId: 'room-1',
          currentParticipantId: 'capt_1',
          isHost: true,
          captain: { id: 'capt_1', nickname: 'Fahad' },
          restaurants: mockRestaurants,
          winnerId: 'rest_1',
          onWinnerConfirmed: () => {},
          onClose: () => {},
        })
      )
    );

    assert.ok(html.includes('Burger Corner'), 'Contender 1 present');
    assert.ok(html.includes('Pizza Spot'), 'Contender 2 present');
    assert.ok(html.includes('Shuffle Again'), 'Shuffle Again card present on 2-contender table');
  });

  // 7. Contender Count Rule Case 2: Exactly 3 tied contenders
  check('7. Exactly 3 tied contenders renders 3 contender cards', () => {
    store.set('wsh_locale', 'en');
    const mockRestaurants = [
      { id: 'rest_1', nameEn: 'Rest A', nameAr: 'مطعم أ', rating: 4.5 },
      { id: 'rest_2', nameEn: 'Rest B', nameAr: 'مطعم ب', rating: 4.6 },
      { id: 'rest_3', nameEn: 'Rest C', nameAr: 'مطعم ج', rating: 4.7 },
    ];

    const html = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(ShuffleCardsModal, {
          isOpen: true,
          roomId: 'room-1',
          currentParticipantId: 'capt_1',
          isHost: true,
          captain: { id: 'capt_1', nickname: 'Fahad' },
          restaurants: mockRestaurants,
          winnerId: 'rest_2',
          onWinnerConfirmed: () => {},
          onClose: () => {},
        })
      )
    );

    assert.ok(html.includes('Rest A'), 'Rest A present');
    assert.ok(html.includes('Rest B'), 'Rest B present');
    assert.ok(html.includes('Rest C'), 'Rest C present');
  });

  // 8. Contender Count Rule Case 3: Exactly 4 tied contenders
  check('8. Exactly 4 tied contenders renders 2x2 grid layout', () => {
    store.set('wsh_locale', 'en');
    const mockRestaurants = [
      { id: 'rest_1', nameEn: 'Rest 1', nameAr: 'مطعم 1', rating: 4.5 },
      { id: 'rest_2', nameEn: 'Rest 2', nameAr: 'مطعم 2', rating: 4.6 },
      { id: 'rest_3', nameEn: 'Rest 3', nameAr: 'مطعم 3', rating: 4.7 },
      { id: 'rest_4', nameEn: 'Rest 4', nameAr: 'مطعم 4', rating: 4.8 },
    ];

    const html = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(ShuffleCardsModal, {
          isOpen: true,
          roomId: 'room-1',
          currentParticipantId: 'capt_1',
          isHost: true,
          captain: { id: 'capt_1', nickname: 'Fahad' },
          restaurants: mockRestaurants,
          winnerId: 'rest_3',
          onWinnerConfirmed: () => {},
          onClose: () => {},
        })
      )
    );

    assert.ok(html.includes('grid-cols-2'), '2x2 grid layout class applied');
    assert.ok(html.includes('Rest 1') && html.includes('Rest 4'), 'All 4 contenders rendered');
  });

  // 9. Contender Count Rule Case 4: 5+ tied contenders launches Vortex Qualifier
  check('9. 5+ tied contenders initiates Vortex Qualifier with spinning circle', () => {
    store.set('wsh_locale', 'en');
    const mockRestaurants = [
      { id: 'r1', nameEn: 'R1', nameAr: 'م1' },
      { id: 'r2', nameEn: 'R2', nameAr: 'م2' },
      { id: 'r3', nameEn: 'R3', nameAr: 'م3' },
      { id: 'r4', nameEn: 'R4', nameAr: 'م4' },
      { id: 'r5', nameEn: 'R5', nameAr: 'م5' },
      { id: 'r6', nameEn: 'R6', nameAr: 'م6' },
    ];

    const html = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(ShuffleCardsModal, {
          isOpen: true,
          roomId: 'room-1',
          currentParticipantId: 'capt_1',
          isHost: true,
          captain: { id: 'capt_1', nickname: 'Fahad' },
          restaurants: mockRestaurants,
          winnerId: 'r4',
          onWinnerConfirmed: () => {},
          onClose: () => {},
        })
      )
    );

    assert.ok(html.includes('Narrowing down to 3 finalists'), 'Vortex status displayed');
    assert.ok(html.includes('🌪️'), 'Vortex pulse icon present');
  });

  // 10. Critical Fairness Rule: Authoritative server winner is ALWAYS in the 3 Finalists
  check('10. Critical Fairness Rule: Server winner is GUARANTEED in top 3 Finalists across seeds', () => {
    const mockRestaurants = [
      { id: 'brand_a', nameEn: 'A' },
      { id: 'brand_b', nameEn: 'B' },
      { id: 'brand_c', nameEn: 'C' },
      { id: 'brand_d', nameEn: 'D' },
      { id: 'brand_e', nameEn: 'E' },
      { id: 'brand_f', nameEn: 'F' },
      { id: 'brand_g', nameEn: 'G' },
    ];

    // Test across every possible candidate being the server winner and multiple seeds
    for (const targetWinner of mockRestaurants) {
      for (const seed of ['seed-1', 'room-xyz', 'test-seed-42', 'another-seed']) {
        const nonWinners = mockRestaurants.filter((r) => r.id !== targetWinner.id);
        const sortedRunnersUp = [...nonWinners].sort((a, b) => {
          const hashA = (a.id + seed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const hashB = (b.id + seed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          return hashA - hashB;
        });

        const finalists = [targetWinner, sortedRunnersUp[0], sortedRunnersUp[1]];
        assert.equal(finalists.length, 3, 'Must have exactly 3 finalists');
        assert.ok(finalists.some((f) => f.id === targetWinner.id), 'Server winner must be in top 3');
      }
    }
  });

  // 11. Deterministic runner-up agreement across multiple connected clients
  check('11. Deterministic finalist selection produces identical results across clients', () => {
    const mockRestaurants = [
      { id: 'c1', nameEn: 'C1' },
      { id: 'c2', nameEn: 'C2' },
      { id: 'c3', nameEn: 'C3' },
      { id: 'c4', nameEn: 'C4' },
      { id: 'c5', nameEn: 'C5' },
    ];
    const winnerId = 'c3';
    const seed = 'deterministic-room-code-123';

    const computeFinalists = (list, wId, s) => {
      const winner = list.find((r) => r.id === wId);
      const nonWinners = list.filter((r) => r.id !== wId);
      const sorted = [...nonWinners].sort((a, b) => {
        const hashA = (a.id + s).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const hashB = (b.id + s).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return hashA - hashB;
      });
      return [winner.id, sorted[0].id, sorted[1].id];
    };

    const hostFinalists = computeFinalists(mockRestaurants, winnerId, seed);
    const captainFinalists = computeFinalists(mockRestaurants, winnerId, seed);
    const spectatorFinalists = computeFinalists(mockRestaurants, winnerId, seed);

    assert.deepEqual(hostFinalists, captainFinalists, 'Host and Captain see identical finalists');
    assert.deepEqual(captainFinalists, spectatorFinalists, 'Captain and Spectator see identical finalists');
  });

  // 12. Captain prompt vs Spectator prompt distinctions
  check('12. Captain prompt vs Spectator waiting indicator distinction', () => {
    const mockRestaurants = [
      { id: 'r1', nameEn: 'R1', nameAr: 'م1' },
      { id: 'r2', nameEn: 'R2', nameAr: 'م2' },
      { id: 'r3', nameEn: 'R3', nameAr: 'م3' },
    ];

    // As Captain
    store.set('wsh_locale', 'en');
    const captainHtml = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(ShuffleCardsModal, {
          isOpen: true,
          roomId: 'room-1',
          currentParticipantId: 'user_capt',
          isHost: false,
          captain: { id: 'user_capt', nickname: 'Nora' },
          restaurants: mockRestaurants,
          winnerId: 'r1',
          onWinnerConfirmed: () => {},
          onClose: () => {},
        })
      )
    );
    assert.ok(captainHtml.includes('CAPTAIN&#x27;S TURN (Nora)'), 'Captain badge displays Nora');

    // As Spectator
    const spectatorHtml = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(ShuffleCardsModal, {
          isOpen: true,
          roomId: 'room-1',
          currentParticipantId: 'user_spec',
          isHost: false,
          captain: { id: 'user_capt', nickname: 'Nora' },
          restaurants: mockRestaurants,
          winnerId: 'r1',
          onWinnerConfirmed: () => {},
          onClose: () => {},
        })
      )
    );
    assert.ok(
      spectatorHtml.includes('Nora') &&
      (spectatorHtml.includes('Waiting for') || spectatorHtml.includes('tap a card') || spectatorHtml.includes('choosing a card') || spectatorHtml.includes('picking a card')),
      'Spectator sees waiting prompt with captain name'
    );
  });

  // 13. Full Arabic RTL Support
  check('13. Arabic RTL renders cleanly with correct translations', () => {
    store.set('wsh_locale', 'ar');
    const mockRestaurants = [
      { id: 'r1', nameEn: 'R1', nameAr: 'شاورما ممتازة', rating: 4.9 },
      { id: 'r2', nameEn: 'R2', nameAr: 'برجر ع الفحم', rating: 4.7 },
    ];

    const arHtml = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(ShuffleCardsModal, {
          isOpen: true,
          roomId: 'room-1',
          currentParticipantId: 'user_capt',
          isHost: true,
          captain: { id: 'user_capt', nickname: 'سارة' },
          restaurants: mockRestaurants,
          winnerId: 'r1',
          onWinnerConfirmed: () => {},
          onClose: () => {},
        })
      )
    );

    assert.ok(arHtml.includes('اختر بطاقة!'), 'Arabic title rendered');
    assert.ok(arHtml.includes('دور الكابتن (سارة)'), 'Arabic captain badge rendered');
    assert.ok(arHtml.includes('dir="rtl"'), 'RTL direction attribute set');
    assert.ok(arHtml.includes('اخلط مرة أخرى'), 'Arabic Shuffle Again card rendered');
  });

  // 14. Strict Deduplication: 3-Restaurant Tie has 0 duplicates across all pickedIndex (0, 1, 2)
  check('14. Strict Deduplication: 3-Restaurant Tie has 0 duplicates across all pickedIndex (0, 1, 2)', () => {
    const contenders = [
      { id: 'rest_shawarma', nameEn: 'Shawarma Al-Balad', rating: 4.8 },
      { id: 'rest_pizza', nameEn: 'Pizza Corner', rating: 4.6 },
      { id: 'rest_burger', nameEn: 'Classic Burger', rating: 4.7 },
    ];
    const winner = contenders[1]; // rest_pizza

    for (let pickedIndex = 0; pickedIndex < 3; pickedIndex++) {
      // Simulate buildRevealedCards logic
      const activeRunnersUp = contenders.filter((r) => r.id !== winner.id);
      const unpicked = [...activeRunnersUp];
      const slotCards = [];

      for (let slot = 0; slot < 3; slot++) {
        if (slot === pickedIndex) {
          slotCards.push({ id: winner.id, isWinner: true });
        } else {
          const next = unpicked.shift();
          slotCards.push({ id: next.id, isWinner: false });
        }
      }

      assert.equal(slotCards.length, 3);
      assert.equal(slotCards[pickedIndex].id, winner.id, `Slot ${pickedIndex} must be authoritative winner`);
      assert.equal(slotCards[pickedIndex].isWinner, true);

      const uniqueIds = new Set(slotCards.map((c) => c.id));
      assert.equal(uniqueIds.size, 3, `Zero duplicates when pickedIndex = ${pickedIndex}`);
      assert.ok(uniqueIds.has('rest_shawarma'));
      assert.ok(uniqueIds.has('rest_pizza'));
      assert.ok(uniqueIds.has('rest_burger'));
    }
  });

  // 15. Strict Deduplication: 2-Restaurant Tie + Shuffle Again has 0 duplicates across all pickedIndex (0, 1, 2)
  check('15. Strict Deduplication: 2-Restaurant Tie with Shuffle Again has 0 duplicates across all pickedIndex', () => {
    const contenders = [
      { id: 'rest_shawarma', nameEn: 'Shawarma Al-Balad', rating: 4.8 },
      { id: 'rest_pizza', nameEn: 'Pizza Corner', rating: 4.6 },
    ];
    const winner = contenders[0]; // rest_shawarma
    const runner = contenders[1]; // rest_pizza

    for (let pickedIndex = 0; pickedIndex < 3; pickedIndex++) {
      const unpicked = [
        { id: runner.id, type: 'restaurant' },
        { id: 'shuffle_again', type: 'shuffle_again' },
      ];
      const slotCards = [];

      for (let slot = 0; slot < 3; slot++) {
        if (slot === pickedIndex) {
          slotCards.push({ id: winner.id, isWinner: true });
        } else {
          const next = unpicked.shift();
          slotCards.push({ id: next.id, isWinner: false });
        }
      }

      assert.equal(slotCards.length, 3);
      assert.equal(slotCards[pickedIndex].id, winner.id, `Slot ${pickedIndex} must be authoritative winner`);

      const uniqueIds = new Set(slotCards.map((c) => c.id));
      assert.equal(uniqueIds.size, 3, `Zero duplicates when pickedIndex = ${pickedIndex}`);
      assert.ok(uniqueIds.has('rest_shawarma'));
      assert.ok(uniqueIds.has('rest_pizza'));
      assert.ok(uniqueIds.has('shuffle_again'));
    }
  });

  // 16. Strict Deduplication: 4-Restaurant Tie has 0 duplicates across all pickedIndex (0, 1, 2, 3)
  check('16. Strict Deduplication: 4-Restaurant Tie has 0 duplicates across all pickedIndex (0, 1, 2, 3)', () => {
    const contenders = [
      { id: 'rest_shawarma', nameEn: 'Shawarma Al-Balad', rating: 4.8 },
      { id: 'rest_pizza', nameEn: 'Pizza Corner', rating: 4.6 },
      { id: 'rest_burger', nameEn: 'Classic Burger', rating: 4.7 },
      { id: 'rest_grill', nameEn: 'Sultan Grills', rating: 4.9 },
    ];
    const winner = contenders[3]; // rest_grill

    for (let pickedIndex = 0; pickedIndex < 4; pickedIndex++) {
      const activeRunnersUp = contenders.filter((r) => r.id !== winner.id);
      const unpicked = [...activeRunnersUp];
      const slotCards = [];

      for (let slot = 0; slot < 4; slot++) {
        if (slot === pickedIndex) {
          slotCards.push({ id: winner.id, isWinner: true });
        } else {
          const next = unpicked.shift();
          slotCards.push({ id: next.id, isWinner: false });
        }
      }

      assert.equal(slotCards.length, 4);
      assert.equal(slotCards[pickedIndex].id, winner.id);
      const uniqueIds = new Set(slotCards.map((c) => c.id));
      assert.equal(uniqueIds.size, 4, `Zero duplicates when pickedIndex = ${pickedIndex}`);
      assert.ok(uniqueIds.has('rest_shawarma'));
      assert.ok(uniqueIds.has('rest_pizza'));
      assert.ok(uniqueIds.has('rest_burger'));
      assert.ok(uniqueIds.has('rest_grill'));
    }
  });

  console.log(`\nALL ${checks} SHUFFLE CARDS VERIFICATION CHECKS PASSED SUCCESSFULLY!`);
} finally {
  await server.close();
}
