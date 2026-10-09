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
  const { LeaderboardView } = await server.ssrLoadModule('/src/components/swiping/LeaderboardView.tsx');
  const { MiniGamesDeckGrid } = await server.ssrLoadModule('/src/components/minigames/MiniGamesDeckGrid.tsx');
  const { MiniGameDeckCard } = await server.ssrLoadModule('/src/components/minigames/MiniGameDeckCard.tsx');
  const { MiniGameArtwork } = await server.ssrLoadModule('/src/components/minigames/MiniGameArtwork.tsx');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');

  console.log('--- EXECUTING MINI GAMES TIE-BREAKER VERIFICATION SUITE ---');

  // 1. Verify all 7 Mini Games exist with required IDs
  check('1. Exactly 7 mini games defined in MINI_GAMES', () => {
    assert.equal(MINI_GAMES.length, 7, 'Must have exactly 7 games');
    const ids = MINI_GAMES.map((g) => g.id);
    const expected = [
      'shuffle_cards',
      'sudden_death',
      'food_brawl',
      'food_race',
      'pick_a_box',
      'emoji_clash',
      'sizzling_skillet',
    ];
    assert.deepEqual(ids, expected, 'Exact 7 game IDs in order');
  });

  // 2. Verify needsCaptain metadata per game
  check('2. needsCaptain metadata correctly configured', () => {
    const byId = Object.fromEntries(MINI_GAMES.map((g) => [g.id, g]));
    assert.equal(byId.shuffle_cards.needsCaptain, true, 'Shuffle Cards needsCaptain');
    assert.equal(byId.sudden_death.needsCaptain, false, 'Sudden Death needsCaptain');
    assert.equal(byId.food_brawl.needsCaptain, true, 'Food Brawl needsCaptain');
    assert.equal(byId.food_race.needsCaptain, true, 'Food Race needsCaptain');
    assert.equal(byId.pick_a_box.needsCaptain, true, 'Pick a Box needsCaptain');
    assert.equal(byId.emoji_clash.needsCaptain, true, 'Emoji Clash needsCaptain');
    assert.equal(byId.sizzling_skillet.needsCaptain, false, 'Sizzling Skillet needsCaptain');
  });

  // 3. Verify implemented status
  check('3. Implemented status is accurate', () => {
    const byId = Object.fromEntries(MINI_GAMES.map((g) => [g.id, g]));
    assert.equal(byId.sudden_death.implemented, true, 'Sudden Death is implemented');
    assert.equal(byId.shuffle_cards.implemented, false, 'Shuffle Cards is next');
    assert.equal(byId.sizzling_skillet.implemented, false, 'Sizzling Skillet is future');
  });

  // 4. Test Shuffle Cards suitability across 2, 3, 4, 5+ ties
  check('4. Shuffle Cards suitability across 2, 3, 4, 5+ ties', () => {
    const shuffle = MINI_GAMES.find((g) => g.id === 'shuffle_cards');
    assert.ok(shuffle);

    // 2 tied
    const suit2 = shuffle.getSuitability({ tieCount: 2, activePlayerCount: 4, tieType: 'restaurant' });
    assert.equal(suit2.state, 'normal', '2 tied is normal');

    // 3 tied -> RECOMMENDED
    const suit3 = shuffle.getSuitability({ tieCount: 3, activePlayerCount: 4, tieType: 'restaurant' });
    assert.equal(suit3.state, 'recommended', '3 tied is recommended');
    assert.equal(suit3.badgeKey, 'gameSwiper.badgeBestForTie');

    // 4 tied
    const suit4 = shuffle.getSuitability({ tieCount: 4, activePlayerCount: 4, tieType: 'restaurant' });
    assert.equal(suit4.state, 'normal', '4 tied is normal');

    // 5+ tied -> LESS IDEAL
    const suit5 = shuffle.getSuitability({ tieCount: 5, activePlayerCount: 4, tieType: 'restaurant' });
    assert.equal(suit5.state, 'less_ideal', '5 tied is less ideal');

    const suit7 = shuffle.getSuitability({ tieCount: 7, activePlayerCount: 4, tieType: 'restaurant' });
    assert.equal(suit7.state, 'less_ideal', '7 tied is less ideal');
  });

  // 5. Test Sudden Death suitability across tie counts
  check('5. Sudden Death suitability across tie counts', () => {
    const sd = MINI_GAMES.find((g) => g.id === 'sudden_death');
    assert.ok(sd);

    // 2 tied -> RECOMMENDED
    const suit2 = sd.getSuitability({ tieCount: 2, activePlayerCount: 3, tieType: 'restaurant' });
    assert.equal(suit2.state, 'recommended', '2 tied is recommended for sudden death');
    assert.equal(suit2.badgeKey, 'gameSwiper.badgeBestForTie');

    // 3 tied -> normal
    const suit3 = sd.getSuitability({ tieCount: 3, activePlayerCount: 3, tieType: 'restaurant' });
    assert.equal(suit3.state, 'normal', '3 tied is normal for sudden death');
  });

  // 6. Test Sizzling Skillet hard requirement: needs 3+ active players
  check('6. Sizzling Skillet player count requirement (1, 2, 3+ players)', () => {
    const skillet = MINI_GAMES.find((g) => g.id === 'sizzling_skillet');
    assert.ok(skillet);

    // 1 player -> UNAVAILABLE
    const suit1 = skillet.getSuitability({ tieCount: 3, activePlayerCount: 1, tieType: 'restaurant' });
    assert.equal(suit1.state, 'unavailable', '1 player disabled');
    assert.equal(suit1.reasonKey, 'gameSwiper.badgeNeedsPlayers');
    assert.equal(suit1.reasonParams?.count, 3);

    // 2 players -> UNAVAILABLE
    const suit2 = skillet.getSuitability({ tieCount: 3, activePlayerCount: 2, tieType: 'restaurant' });
    assert.equal(suit2.state, 'unavailable', '2 players disabled');

    // 3 players -> NORMAL
    const suit3 = skillet.getSuitability({ tieCount: 3, activePlayerCount: 3, tieType: 'restaurant' });
    assert.equal(suit3.state, 'normal', '3 players available');

    // 5 players -> NORMAL
    const suit5 = skillet.getSuitability({ tieCount: 3, activePlayerCount: 5, tieType: 'restaurant' });
    assert.equal(suit5.state, 'normal', '5 players available');
  });

  // 7. Test MiniGameArtwork renders SVG for all 7 assets
  check('7. MiniGameArtwork renders for all 7 games', () => {
    for (const game of MINI_GAMES) {
      const html = renderToStaticMarkup(createElement(MiniGameArtwork, { asset: game.imageAsset }));
      assert.ok(html.includes('<svg'), `Artwork for ${game.id} renders svg`);
    }
  });

  // 8. Test bilingual SSR of MiniGamesDeckGrid
  check('8. MiniGamesDeckGrid renders all 7 cards in Arabic and English', () => {
    for (const locale of ['en', 'ar']) {
      store.set('wsh_locale', locale);
      const html = renderToStaticMarkup(
        createElement(
          LocaleProvider,
          null,
          createElement(MiniGamesDeckGrid, {
            tieCount: 3,
            activePlayerCount: 4,
            tieType: 'restaurant',
            onSelectGame: () => {},
          })
        )
      );
      assert.ok(html.includes(locale === 'ar' ? 'أوراق الحظ' : 'Shuffle Cards'), `${locale} Shuffle Cards`);
      assert.ok(html.includes(locale === 'ar' ? 'رأس برأس' : 'Sudden Death'), `${locale} Sudden Death`);
      assert.ok(html.includes(locale === 'ar' ? 'المقلاة المشتعلة' : 'Sizzling Skillet'), `${locale} Sizzling Skillet`);
    }
  });

  // 9. Test LeaderboardView renders Food Roulette and Mini Games buttons when tied
  check('9. LeaderboardView showdown section renders both Food Roulette and Mini Games buttons', () => {
    const mockRestaurants = [
      { id: 'rest_1', nameEn: 'Burger A', nameAr: 'برجر أ', rating: 4.5 },
      { id: 'rest_2', nameEn: 'Burger B', nameAr: 'برجر ب', rating: 4.3 },
    ];
    const mockSummary = {
      round: 1,
      deckId: 'deck-tie',
      totalCards: 2,
      status: 'tie',
      tiedRestaurantIds: ['rest_1', 'rest_2'],
      cards: [
        { restaurantId: 'rest_1', yesCount: 3, noCount: 0 },
        { restaurantId: 'rest_2', yesCount: 3, noCount: 0 },
      ],
      participantProgress: [],
    };

    for (const locale of ['en', 'ar']) {
      store.set('wsh_locale', locale);
      const html = renderToStaticMarkup(
        createElement(
          LocaleProvider,
          null,
          createElement(LeaderboardView, {
            restaurants: mockRestaurants,
            summary: mockSummary,
            participants: [{ id: 'p1', nickname: 'Host', is_host: true }],
            isHost: true,
            onConfirmPick: () => {},
            onTriggerSuddenDeath: () => {},
            onTriggerRoulette: () => {},
          })
        )
      );

      // Verify showdown title is present
      assert.ok(html.includes(locale === 'ar' ? 'تعادل بين المطاعم المتصدرة' : 'Tied Leaders Showdown'), 'Showdown title present');
      // Verify Food Roulette button is present
      assert.ok(html.includes(locale === 'ar' ? 'روليت الحسم' : 'Food Roulette'), 'Food Roulette button present');
      // Verify Mini Games button is present
      assert.ok(html.includes(locale === 'ar' ? 'الألعاب المصغرة' : 'Mini Games'), 'Mini Games button present');
      // Verify tied restaurant cards are rendered below
      assert.ok(html.includes(locale === 'ar' ? 'برجر أ' : 'Burger A'), 'Tied restaurant 1 rendered');
      assert.ok(html.includes(locale === 'ar' ? 'برجر ب' : 'Burger B'), 'Tied restaurant 2 rendered');
    }
  });

  console.log(`\nALL ${checks} MINI GAMES VERIFICATION CHECKS PASSED SUCCESSFULLY!\n`);
} finally {
  await server.close();
}
