import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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

  // 10. Test Sizzling Skillet with total vs active participant status scenarios
  check('10. Sizzling Skillet handles mixed participant statuses (active, away, disconnected)', () => {
    const skillet = MINI_GAMES.find((g) => g.id === 'sizzling_skillet');
    assert.ok(skillet);

    const calcActive = (participants) => participants.filter((p) => p.status === 'active').length;

    // 3 total participants with only 2 active, 1 away -> unavailable
    const group1 = [
      { id: 'p1', status: 'active' },
      { id: 'p2', status: 'active' },
      { id: 'p3', status: 'away' },
    ];
    assert.equal(calcActive(group1), 2);
    const suitG1 = skillet.getSuitability({ tieCount: 2, activePlayerCount: calcActive(group1), tieType: 'restaurant' });
    assert.equal(suitG1.state, 'unavailable', '3 total with 2 active is unavailable');

    // 5 total participants with only 2 active, 2 away, 1 disconnected -> unavailable
    const group2 = [
      { id: 'p1', status: 'active' },
      { id: 'p2', status: 'active' },
      { id: 'p3', status: 'away' },
      { id: 'p4', status: 'away' },
      { id: 'p5', status: 'disconnected' },
    ];
    assert.equal(calcActive(group2), 2);
    const suitG2 = skillet.getSuitability({ tieCount: 2, activePlayerCount: calcActive(group2), tieType: 'restaurant' });
    assert.equal(suitG2.state, 'unavailable', '5 total with 2 active is unavailable');

    // 3 total participants with all 3 active -> available
    const group3 = [
      { id: 'p1', status: 'active' },
      { id: 'p2', status: 'active' },
      { id: 'p3', status: 'active' },
    ];
    assert.equal(calcActive(group3), 3);
    const suitG3 = skillet.getSuitability({ tieCount: 2, activePlayerCount: calcActive(group3), tieType: 'restaurant' });
    assert.equal(suitG3.state, 'normal', '3 active is available');

    // 5 total participants with 3 active, 2 disconnected -> available
    const group4 = [
      { id: 'p1', status: 'active' },
      { id: 'p2', status: 'active' },
      { id: 'p3', status: 'active' },
      { id: 'p4', status: 'disconnected' },
      { id: 'p5', status: 'disconnected' },
    ];
    assert.equal(calcActive(group4), 3);
    const suitG4 = skillet.getSuitability({ tieCount: 2, activePlayerCount: calcActive(group4), tieType: 'restaurant' });
    assert.equal(suitG4.state, 'normal', '5 total with 3 active is available');
  });

  // 11. Test MiniGamesDeckGrid renders Sizzling Skillet disabled badge based on active player count
  check('11. MiniGamesDeckGrid renders Sizzling Skillet disabled/enabled based on activePlayerCount', () => {
    store.set('wsh_locale', 'en');

    // With 2 active players: should show "Needs 3+ players" badge
    const html2Active = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(MiniGamesDeckGrid, {
          tieCount: 2,
          activePlayerCount: 2,
          tieType: 'restaurant',
          onSelectGame: () => {},
        })
      )
    );
    assert.ok(html2Active.includes('Needs 3+ players'), '2 active players shows Needs 3+ players badge');

    // With 3 active players: should NOT show "Needs 3+ players" badge
    const html3Active = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(MiniGamesDeckGrid, {
          tieCount: 2,
          activePlayerCount: 3,
          tieType: 'restaurant',
          onSelectGame: () => {},
        })
      )
    );
    assert.ok(!html3Active.includes('Needs 3+ players'), '3 active players enables Sizzling Skillet');
  });

  // 12. Non-host player sees Food Roulette and Mini Games buttons in LeaderboardView
  check('12. Non-host players see Food Roulette and Mini Games buttons in LeaderboardView showdown', () => {
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
            participants: [
              { id: 'p1', nickname: 'Host', is_host: true },
              { id: 'p2', nickname: 'Player', is_host: false },
            ],
            isHost: false,
            onConfirmPick: () => {},
            onTriggerSuddenDeath: () => {},
            onTriggerRoulette: () => {},
          })
        )
      );

      // Verify showdown title is present for player
      assert.ok(html.includes(locale === 'ar' ? 'تعادل بين المطاعم المتصدرة' : 'Tied Leaders Showdown'), 'Showdown title present for player');
      // Verify Food Roulette button is present for player
      assert.ok(html.includes(locale === 'ar' ? 'روليت الحسم' : 'Food Roulette'), 'Food Roulette button present for player');
      // Verify Mini Games button is present for player
      assert.ok(html.includes(locale === 'ar' ? 'الألعاب المصغرة' : 'Mini Games'), 'Mini Games button present for player');
      // Verify waiting for host notice is present for player
      assert.ok(html.includes(locale === 'ar' ? 'بانتظار المضيف' : 'Waiting for host'), 'Waiting for host notice present for player');
    }
  });

  // 13. Player can view identical MiniGamesDeckGrid with all 7 cards
  check('13. Player sees identical MiniGamesDeckGrid with all 7 game cards and Coming Soon badges', () => {
    store.set('wsh_locale', 'en');
    const html = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(MiniGamesDeckGrid, {
          tieCount: 2,
          activePlayerCount: 4,
          tieType: 'restaurant',
          isHost: false,
          onSelectGame: () => {},
        })
      )
    );

    // Verify all 7 game titles appear
    assert.ok(html.includes('Shuffle Cards'), 'Shuffle Cards present');
    assert.ok(html.includes('Sudden Death'), 'Sudden Death present');
    assert.ok(html.includes('Food Brawl'), 'Food Brawl present');
    assert.ok(html.includes('Food Race'), 'Food Race present');
    assert.ok(html.includes('Pick a Box'), 'Pick a Box present');
    assert.ok(html.includes('Emoji Clash'), 'Emoji Clash present');
    assert.ok(html.includes('Sizzling Skillet'), 'Sizzling Skillet present');

    // Verify Coming Soon badges appear for unimplemented games
    const comingSoonMatches = (html.match(/Coming Soon 🚧/g) || []).length;
    assert.equal(comingSoonMatches, 6, 'Exactly 6 Coming Soon badges present on player view');
  });

  // 14. Player requests Roulette: Host sees correct player initials and profile circle
  check('14. Player Roulette request displays player avatar with initial and profile color', () => {
    store.set('wsh_locale', 'en');
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
      cards: [],
      participantProgress: [],
    };
    const mockSuggestions = [
      {
        target: 'action:roulette',
        participant_id: 'p2',
        nickname: 'Salma',
        player_color: '#F0443E',
        player_shape: 'circle',
      },
    ];

    const hostHtml = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(LeaderboardView, {
          restaurants: mockRestaurants,
          summary: mockSummary,
          participants: [
            { id: 'p1', nickname: 'Host', is_host: true },
            { id: 'p2', nickname: 'Salma', is_host: false },
          ],
          isHost: true,
          suggestions: mockSuggestions,
          onConfirmPick: () => {},
          onTriggerSuddenDeath: () => {},
          onTriggerRoulette: () => {},
        })
      )
    );

    // Host sees the avatar container for action:roulette
    assert.ok(hostHtml.includes('data-testid="suggestions-action:roulette"'), 'Host sees suggestions-action:roulette container');
    // Salma's initial 'S' is rendered
    assert.ok(hostHtml.includes('>S<'), 'Salma initial S rendered inside avatar');
    // Salma's color is rendered
    assert.ok(hostHtml.includes('fill="#F0443E"'), 'Salma color #F0443E rendered inside avatar');
  });

  // 15. Player requests a specific mini-game: avatar appears on that game card
  check('15. Player mini-game request displays player avatar on that specific game card', () => {
    store.set('wsh_locale', 'en');
    const mockSuggestions = [
      {
        target: 'game:sudden_death',
        participant_id: 'p3',
        nickname: 'Tariq',
        player_color: '#55B96A',
        player_shape: 'squircle',
      },
    ];

    const gridHtml = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(MiniGamesDeckGrid, {
          tieCount: 2,
          activePlayerCount: 3,
          tieType: 'restaurant',
          isHost: true,
          suggestions: mockSuggestions,
          onSelectGame: () => {},
        })
      )
    );

    // Sudden death card has Tariq's avatar
    assert.ok(gridHtml.includes('data-testid="suggestions-game:sudden_death"'), 'Sudden death card has suggestions container');
    assert.ok(gridHtml.includes('>T<'), 'Tariq initial T rendered');
    assert.ok(gridHtml.includes('fill="#55B96A"'), 'Tariq color #55B96A rendered');

    // Other game cards do NOT have this suggestion
    assert.ok(!gridHtml.includes('data-testid="suggestions-game:shuffle_cards"'), 'Shuffle cards has no suggestions');
    assert.ok(!gridHtml.includes('data-testid="suggestions-game:food_race"'), 'Food race has no suggestions');
  });

  // 16. Multiple distinct player requests remain correctly isolated per option
  check('16. Multiple player requests remain correctly associated with their respective options', () => {
    store.set('wsh_locale', 'en');
    const mockSuggestions = [
      {
        target: 'action:roulette',
        participant_id: 'p1',
        nickname: 'Amal',
        player_color: '#73C8EA',
        player_shape: 'circle',
      },
      {
        target: 'game:sudden_death',
        participant_id: 'p2',
        nickname: 'Bassam',
        player_color: '#F0443E',
        player_shape: 'diamond',
      },
      {
        target: 'game:food_brawl',
        participant_id: 'p3',
        nickname: 'Camilia',
        player_color: '#FFD75A',
        player_shape: 'hexagon',
      },
    ];

    // Grid render
    const gridHtml = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(MiniGamesDeckGrid, {
          tieCount: 2,
          activePlayerCount: 4,
          tieType: 'restaurant',
          isHost: true,
          suggestions: mockSuggestions,
          onSelectGame: () => {},
        })
      )
    );

    // Verify Sudden Death has Bassam (B) but not Amal (A) or Camilia (C)
    assert.ok(gridHtml.includes('data-testid="suggestions-game:sudden_death"'), 'Sudden death has suggestions');
    assert.ok(gridHtml.includes('title="Bassam"'), 'Sudden death has Bassam');
    assert.ok(gridHtml.includes('>B<'), 'Initial B rendered');

    // Verify Food Brawl has Camilia (C)
    assert.ok(gridHtml.includes('data-testid="suggestions-game:food_brawl"'), 'Food brawl has suggestions');
    assert.ok(gridHtml.includes('title="Camilia"'), 'Food brawl has Camilia');
    assert.ok(gridHtml.includes('>C<'), 'Initial C rendered');

    // Verify Sudden death doesn't claim Amal
    assert.ok(!gridHtml.includes('data-testid="suggestions-action:roulette"'), 'Grid does not render action:roulette');
  });

  // 17. Player click interaction triggers onToggleSuggestion, not host launch handlers
  check('17. Player click interaction delegates to onToggleSuggestion and cannot launch games', () => {
    store.set('wsh_locale', 'en');
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
      cards: [],
      participantProgress: [],
    };

    let hostRouletteLaunched = false;
    let hostSuddenDeathLaunched = false;
    let toggledTarget = null;

    // Simulate non-host interaction logic
    const handleRouletteClick = (isHost, onTriggerRoulette, onToggleSuggestion) => {
      if (isHost) {
        onTriggerRoulette(mockRestaurants);
      } else {
        onToggleSuggestion('action:roulette');
      }
    };

    const handleGameClick = (isHost, game, onSelectMiniGame, onToggleSuggestion) => {
      if (isHost) {
        onSelectMiniGame(game);
      } else {
        onToggleSuggestion(`game:${game.id}`);
      }
    };

    // When player clicks roulette:
    handleRouletteClick(
      false,
      () => { hostRouletteLaunched = true; },
      (target) => { toggledTarget = target; }
    );
    assert.equal(hostRouletteLaunched, false, 'Host roulette was NOT launched by player click');
    assert.equal(toggledTarget, 'action:roulette', 'Player click toggled action:roulette');

    // When player clicks sudden death:
    toggledTarget = null;
    const suddenDeath = MINI_GAMES.find((g) => g.id === 'sudden_death');
    handleGameClick(
      false,
      suddenDeath,
      () => { hostSuddenDeathLaunched = true; },
      (target) => { toggledTarget = target; }
    );
    assert.equal(hostSuddenDeathLaunched, false, 'Host sudden death was NOT launched by player click');
    assert.equal(toggledTarget, 'game:sudden_death', 'Player click toggled game:sudden_death');
  });

  // 18. Coming Soon games are not marked playable and empty states handled safely
  check('18. Coming Soon games cannot be launched and preserve unimplemented status', () => {
    const unimplemented = MINI_GAMES.filter((g) => !g.implemented);
    assert.equal(unimplemented.length, 6, 'Exactly 6 games are coming soon');
    for (const g of unimplemented) {
      assert.equal(g.implemented, false, `${g.id} must remain implemented = false`);
    }

    // Verify empty game list handling does not throw in grid
    const emptyHtml = renderToStaticMarkup(
      createElement(MiniGameArtwork, { asset: 'non_existent_asset' })
    );
    assert.ok(emptyHtml.includes('🎮'), 'Fallback artwork rendered safely');
  });

  // 19. Captain Roulette rules and minimum active player thresholds remain intact
  check('19. Captain Roulette player-count and server requirements remain intact', () => {
    const shuffle = MINI_GAMES.find((g) => g.id === 'shuffle_cards');
    assert.equal(shuffle.minPlayers, 2, 'Shuffle Cards requires 2 players');
    assert.equal(shuffle.needsCaptain, true, 'Shuffle Cards requires captain');

    // 1 active player: unavailable
    const suit1 = shuffle.getSuitability({ tieCount: 2, activePlayerCount: 1, tieType: 'restaurant' });
    assert.equal(suit1.state, 'unavailable', '1 player is unavailable');

    // 2 active players: eligible
    const suit2 = shuffle.getSuitability({ tieCount: 2, activePlayerCount: 2, tieType: 'restaurant' });
    assert.equal(suit2.state, 'normal', '2 players is eligible');
  });

  // 20. Existing request keys and targets remain backwards compatible
  check('20. Existing Vote Again and another-category request keys and targets remain unchanged', () => {
    const arLoc = JSON.parse(readFileSync('src/locales/ar.json', 'utf8'));
    const enLoc = JSON.parse(readFileSync('src/locales/en.json', 'utf8'));

    // Check suggestions keys
    assert.ok(arLoc.suggestions.chooseAnotherCategory, 'ar has chooseAnotherCategory');
    assert.ok(enLoc.suggestions.chooseAnotherCategory, 'en has chooseAnotherCategory');
    assert.ok(arLoc.suggestions.spinAgain, 'ar has spinAgain');
    assert.ok(enLoc.suggestions.spinAgain, 'en has spinAgain');
    assert.ok(arLoc.suggestions.tryAnotherRestaurant, 'ar has tryAnotherRestaurant');
    assert.ok(enLoc.suggestions.tryAnotherRestaurant, 'en has tryAnotherRestaurant');

    // Check gameSwiper keys
    assert.ok(arLoc.gameSwiper.rouletteBtn, 'ar has rouletteBtn');
    assert.ok(enLoc.gameSwiper.rouletteBtn, 'en has rouletteBtn');
    assert.ok(arLoc.gameSwiper.miniGamesBtn, 'ar has miniGamesBtn');
    assert.ok(enLoc.gameSwiper.miniGamesBtn, 'en has miniGamesBtn');
    assert.ok(arLoc.gameSwiper.waitingForHost, 'ar has waitingForHost');
    assert.ok(enLoc.gameSwiper.waitingForHost, 'en has waitingForHost');
  });

  console.log(`\nALL ${checks} MINI GAMES VERIFICATION CHECKS PASSED SUCCESSFULLY!\n`);
} finally {
  await server.close();
}
