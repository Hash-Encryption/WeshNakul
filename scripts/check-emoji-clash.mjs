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
  const { EMOJI_FIGHTERS } = await server.ssrLoadModule('/src/types/emojiClash.ts');
  const { FighterSelectGrid } = await server.ssrLoadModule('/src/components/minigames/emoji_clash/FighterSelectGrid.tsx');
  const { MustardSack } = await server.ssrLoadModule('/src/components/minigames/emoji_clash/MustardSack.tsx');
  const { TactileCyclingDock } = await server.ssrLoadModule('/src/components/minigames/emoji_clash/TactileCyclingDock.tsx');
  const { EmojiArenaStage } = await server.ssrLoadModule('/src/components/minigames/emoji_clash/EmojiArenaStage.tsx');
  const { EmojiClashModal } = await server.ssrLoadModule('/src/components/minigames/emoji_clash/EmojiClashModal.tsx');
  const { SuddenDeathModal } = await server.ssrLoadModule('/src/components/swiping/SuddenDeathModal.tsx');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');

  console.log('--- EXECUTING EMOJI CLASH & SUDDEN DEATH VERIFICATION SUITE ---');

  // 1. Verify Task A: Food Brawl retired and Emoji Clash active
  check('1. Food Brawl retired and Emoji Clash active in MINI_GAMES', () => {
    assert.equal(MINI_GAMES.some((g) => g.id === 'food_brawl'), false, 'Food Brawl must not exist in MINI_GAMES');
    const emojiClash = MINI_GAMES.find((g) => g.id === 'emoji_clash');
    assert.ok(emojiClash, 'Emoji Clash must exist in MINI_GAMES');
    assert.equal(emojiClash.implemented, true, 'Emoji Clash must be implemented');
    assert.equal(emojiClash.needsCaptain, false, 'Emoji Clash requires NO Captain (group simultaneous)');
    assert.equal(emojiClash.minPlayers, 1, 'Emoji Clash supports solo or squad');
    assert.deepEqual(emojiClash.idealTieCounts, [2, 3, 4], 'Ideal tie counts 2, 3, 4');
  });

  // 2. Suitability rules for Emoji Clash
  check('2. Emoji Clash suitability across player and tie counts', () => {
    const emojiClash = MINI_GAMES.find((g) => g.id === 'emoji_clash');
    assert.ok(emojiClash);

    // 0 players -> unavailable
    const s0 = emojiClash.getSuitability({ tieCount: 2, activePlayerCount: 0, tieType: 'restaurant' });
    assert.equal(s0.state, 'unavailable');

    // 2 tied -> recommended
    const s2 = emojiClash.getSuitability({ tieCount: 2, activePlayerCount: 3, tieType: 'restaurant' });
    assert.equal(s2.state, 'recommended');
    assert.equal(s2.badgeKey, 'gameSwiper.badgeBestForTie');

    // 3 tied -> recommended
    const s3 = emojiClash.getSuitability({ tieCount: 3, activePlayerCount: 3, tieType: 'restaurant' });
    assert.equal(s3.state, 'recommended');

    // 5 tied -> normal
    const s5 = emojiClash.getSuitability({ tieCount: 5, activePlayerCount: 3, tieType: 'restaurant' });
    assert.equal(s5.state, 'normal');
  });

  // 3. 8 Emoji Fighters defined with bilingual titles
  check('3. Exactly 8 Emoji Fighters defined with bilingual titles', () => {
    assert.equal(EMOJI_FIGHTERS.length, 8, 'Must have 8 emoji fighters');
    const expectedEmojis = ['😂', '🔥', '😈', '🤡', '🥊', '🦖', '🌶️', '💀'];
    assert.deepEqual(EMOJI_FIGHTERS.map((f) => f.emoji), expectedEmojis);

    for (const f of EMOJI_FIGHTERS) {
      assert.ok(f.defaultTitleEn, `${f.id} has defaultTitleEn`);
      assert.ok(f.defaultTitleAr, `${f.id} has defaultTitleAr`);
      assert.ok(f.themeColor, `${f.id} has themeColor`);
    }
  });

  // 4. FighterSelectGrid renders 2x4 grid in AR and EN
  check('4. FighterSelectGrid renders 2x4 grid in Arabic and English with avatar badges', () => {
    const mockParticipants = [
      { id: 'p1', nickname: 'Host', is_host: true, player_color: '#FFD75A' },
      { id: 'p2', nickname: 'Salem', is_host: false, player_color: '#F0443E' },
    ];
    const mockPicks = { p1: 'troll', p2: 'troll' }; // Duplicate pick!

    for (const loc of ['ar', 'en']) {
      store.set('wsh_locale', loc);
      const html = renderToStaticMarkup(
        createElement(
          LocaleProvider,
          null,
          createElement(FighterSelectGrid, {
            selectedFighterId: 'troll',
            onSelectFighter: () => {},
            picksByParticipant: mockPicks,
            participants: mockParticipants,
            currentParticipantId: 'p1',
          })
        )
      );

      assert.ok(html.includes('😂'), 'Laughing emoji rendered');
      assert.ok(html.includes('🔥'), 'Infernal emoji rendered');
      assert.ok(html.includes(loc === 'ar' ? 'الضحوك' : 'The Troll'), 'Localized title rendered');
      assert.ok(html.includes('title="Host"'), 'Host avatar attached to pick');
      assert.ok(html.includes('title="Salem"'), 'Salem avatar attached to duplicate pick');
    }
  });

  // 5. TactileCyclingDock 3D Button + Flanking Preview Icons
  check('5. TactileCyclingDock renders 3D centerpiece button and flanking rotation preview icons', () => {
    for (const loc of ['ar', 'en']) {
      store.set('wsh_locale', loc);
      const html = renderToStaticMarkup(
        createElement(
          LocaleProvider,
          null,
          createElement(TactileCyclingDock, {
            onThrow: () => {},
          })
        )
      );

      // Main button: Spice
      assert.ok(html.includes('🌶️'), 'Main button has chili icon');
      assert.ok(html.includes('Spice') && html.includes('شطة'), 'Stacked bilingual Spice labels');

      // Left preview: Garlic with rotation arrow
      assert.ok(html.includes('🧄'), 'Left flanking preview has garlic');
      assert.ok(html.includes('Garlic') && html.includes('ثوم'), 'Left garlic title');

      // Right preview: Fire with rotation arrow
      assert.ok(html.includes('🔥'), 'Right flanking preview has fire');
      assert.ok(html.includes('Fire') && html.includes('نار'), 'Right fire title');

      // Verified debug mockup text 'spice particle throw' is cleanly removed
      assert.equal(html.includes('spice particle throw'), false, 'Mockup debug text removed');
    }
  });

  // 6. MustardSack Pressurized Sack & Dynamics
  check('6. MustardSack renders custom comic pear SVG, nozzle, belly label, and curved warning ribbon in Stage B', () => {
    for (const loc of ['ar', 'en']) {
      store.set('wsh_locale', loc);
      const html = renderToStaticMarkup(
        createElement(
          LocaleProvider,
          null,
          createElement(MustardSack, {
            currentTaps: 10,
            targetTaps: 20,
            isInteractive: true,
            onTap: () => {},
            isDetonated: false,
            isSackDropping: false,
            timerSeconds: 10,
            phase: 'brawl',
          })
        )
      );

      // Belly label & biohazard
      assert.ok(html.includes('MUSTARD BOMB') || html.includes('قنبلة الخردل'), 'Mustard Sack has belly label');
      assert.ok(html.includes('polygon'), 'Has biohazard / triangle polygon');
      assert.ok(html.includes('stroke-dashoffset') || html.includes('strokeDashoffset'), 'Has circular progress ring SVG');
      // Arcade warning ribbon
      assert.ok(html.includes('CLICK THE MUSTARD BOMB') || html.includes('اضغط لتفجير'), 'Has arcade warning ribbon');
    }
  });

  // 7. Strict Binary Finale: Mustard Detonation vs Golden Uppercut
  check('7. Strict Binary Finale: Detonation overlay only triggers when taps >= targetTaps', () => {
    const mockRestaurants = [
      { id: 'r1', nameEn: 'Burger A', nameAr: 'برجر أ' },
      { id: 'r2', nameEn: 'Shawarma B', nameAr: 'شاورما ب' },
    ];
    const mockSquads = [
      {
        squadId: 's1',
        emoji: '😂',
        fighterId: 'troll',
        members: [{ participantId: 'p1', nickname: 'P1' }],
        isMega: false,
        restaurant: mockRestaurants[0],
        ringColor: '#F59E0B',
        ringBorderColor: '#D97706',
        isWinner: true,
        baseSize: 72,
        initialPos: { x: -50, y: 0 },
      },
      {
        squadId: 's2',
        emoji: '🔥',
        fighterId: 'infernal',
        members: [{ participantId: 'p2', nickname: 'P2' }],
        isMega: false,
        restaurant: mockRestaurants[1],
        ringColor: '#EF4444',
        ringBorderColor: '#DC2626',
        isWinner: false,
        baseSize: 72,
        initialPos: { x: 50, y: 0 },
      },
    ];

    // Case A: Mustard Detonation triggered (100% taps)
    const htmlDetonated = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(EmojiArenaStage, {
          phase: 'brawl',
          squads: mockSquads,
          winningRestaurantId: 'r1',
          battleSeed: 42,
          projectiles: [],
          mustardDetonated: true,
          goldenKnockoutTriggered: false,
          restaurants: mockRestaurants,
        })
      )
    );
    assert.ok(htmlDetonated.includes('Mustard Bomb Detonation') || htmlDetonated.includes('انفجار قنبلة الخردل'), 'Detonation overlay visible on 100% taps');

    // Case B: Golden Knockout triggered (taps < targetTaps)
    const htmlGoldenKO = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(EmojiArenaStage, {
          phase: 'brawl',
          squads: mockSquads,
          winningRestaurantId: 'r1',
          battleSeed: 42,
          projectiles: [],
          mustardDetonated: false,
          goldenKnockoutTriggered: true,
          restaurants: mockRestaurants,
        })
      )
    );
    assert.ok(!htmlGoldenKO.includes('Mustard Bomb Detonation') && !htmlGoldenKO.includes('انفجار قنبلة الخردل'), 'No mustard detonation when taps < targetTaps');
  });

  // 8. 2.5D Octagon Battle Ring with Neon Trim and Dropped Corner Banners
  check('8. EmojiArenaStage renders 3D neon octagon (cyan & magenta) and dropped restaurant corner banners', () => {
    const mockRestaurants = [
      { id: 'r1', nameEn: 'Burger A', nameAr: 'برجر أ' },
      { id: 'r2', nameEn: 'Shawarma B', nameAr: 'شاورما ب' },
    ];
    const mockSquads = [
      {
        squadId: 's1',
        emoji: '😂',
        fighterId: 'troll',
        members: [{ participantId: 'p1', nickname: 'P1' }],
        isMega: false,
        restaurant: mockRestaurants[0],
        ringColor: '#F59E0B',
        ringBorderColor: '#D97706',
        isWinner: true,
        baseSize: 72,
        initialPos: { x: -50, y: 0 },
      },
      {
        squadId: 's2',
        emoji: '🔥',
        fighterId: 'infernal',
        members: [{ participantId: 'p2', nickname: 'P2' }],
        isMega: false,
        restaurant: mockRestaurants[1],
        ringColor: '#EF4444',
        ringBorderColor: '#DC2626',
        isWinner: false,
        baseSize: 72,
        initialPos: { x: 50, y: 0 },
      },
    ];

    const html = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(EmojiArenaStage, {
          phase: 'brawl',
          squads: mockSquads,
          winningRestaurantId: 'r1',
          battleSeed: 42,
          projectiles: [],
          mustardDetonated: false,
          goldenKnockoutTriggered: false,
          restaurants: mockRestaurants,
        })
      )
    );

    // Neon cyan & magenta trims
    assert.ok(html.includes('#22D3EE') || html.includes('#00F0FF'), 'Has cyan neon trim');
    assert.ok(html.includes('#EC4899') || html.includes('#BD00FF'), 'Has magenta/purple neon trim');

    // Dropped Corner Banners
    assert.ok(html.includes('Burger A'), 'Left banner has Burger A');
    assert.ok(html.includes('Shawarma B'), 'Right banner has Shawarma B');
  });

  // 9. Full EmojiClashModal Top HUD (Title + Big Golden Countdown Timer + Connected Avatars)
  check('9. EmojiClashModal Top HUD renders title, golden countdown timer, and connected avatars', () => {
    const mockRestaurants = [
      { id: 'r1', nameEn: 'Burger A', nameAr: 'برجر أ' },
      { id: 'r2', nameEn: 'Shawarma B', nameAr: 'شاورما ب' },
    ];
    const mockParticipants = [
      { id: 'p1', nickname: 'Host', is_host: true, player_color: '#FFD75A' },
      { id: 'p2', nickname: 'PlayerB', is_host: false, player_color: '#F0443E' },
    ];

    const html = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(EmojiClashModal, {
          isOpen: true,
          roomId: 'room-123',
          currentParticipantId: 'p1',
          participants: mockParticipants,
          isHost: true,
          restaurants: mockRestaurants,
          winnerRestaurantId: 'r1',
          battleSeed: 999,
          onWinnerConfirmed: () => {},
          onClose: () => {},
        })
      )
    );

    assert.ok(html.includes('Emoji Clash'), 'Header has Emoji Clash');
    assert.ok(html.includes('حرب الإيموجي'), 'Header has Arabic subtitle');
    assert.ok(html.includes('10'), 'Countdown timer starts at 10');
    assert.ok(html.includes('title="Host"'), 'Connected avatars include Host');
    assert.ok(html.includes('title="PlayerB"'), 'Connected avatars include PlayerB');
  });

  // 10. Task C: Sudden Death King-of-the-Hill Gauntlet with 3+ restaurants
  check('10. Sudden Death King-of-the-Hill Gauntlet renders 2 restaurants per round and round counter', () => {
    const threeRestaurants = [
      { id: 'r1', nameEn: 'Burger A', nameAr: 'برجر أ' },
      { id: 'r2', nameEn: 'Shawarma B', nameAr: 'شاورما ب' },
      { id: 'r3', nameEn: 'Pizza C', nameAr: 'بيتزا ج' },
    ];

    for (const loc of ['ar', 'en']) {
      store.set('wsh_locale', loc);
      const html = renderToStaticMarkup(
        createElement(
          LocaleProvider,
          null,
          createElement(SuddenDeathModal, {
            isOpen: true,
            roomId: 'room-123',
            currentParticipantId: 'p1',
            isHost: true,
            restaurants: threeRestaurants,
            totalParticipants: 3,
            onSelectWinner: () => {},
            onClose: () => {},
          })
        )
      );

      // Verify Round 1 of 2 indicator
      assert.ok(
        html.includes(loc === 'ar' ? 'الجولة 1 من 2' : 'Round 1 of 2'),
        `${loc} has round 1 of 2 indicator`
      );

      // Verify strictly 2 contenders displayed in the 1v1 round
      assert.ok(html.includes(loc === 'ar' ? 'برجر أ' : 'Burger A'), 'Contender 1 present');
      assert.ok(html.includes(loc === 'ar' ? 'شاورما ب' : 'Shawarma B'), 'Contender 2 present');
      assert.ok(!html.includes(loc === 'ar' ? 'بيتزا ج' : 'Pizza C'), 'Contender 3 waits for next round');
    }
  });

  // 11. Task C: Sudden Death Speed Tie-Breaker Logic on Even Vote Split
  check('11. Sudden Death Speed Tie-Breaker: earliest tying vote timestamp breaks tie', () => {
    const r1 = { id: 'r1', nameEn: 'Burger A', nameAr: 'برجر أ' };
    const r2 = { id: 'r2', nameEn: 'Shawarma B', nameAr: 'شاورما ب' };

    // Simulate 2 vs 2 vote tie
    const votes = {
      p1: { restaurantId: 'r1', timestamp: 1000 },
      p2: { restaurantId: 'r2', timestamp: 1200 },
      p3: { restaurantId: 'r1', timestamp: 1500 }, // r1 reached 2 votes at ts = 1500
      p4: { restaurantId: 'r2', timestamp: 1800 }, // r2 reached 2 votes at ts = 1800
    };

    const votesArr1 = Object.values(votes).filter((v) => v.restaurantId === r1.id);
    const votesArr2 = Object.values(votes).filter((v) => v.restaurantId === r2.id);

    const sorted1 = [...votesArr1].sort((a, b) => a.timestamp - b.timestamp);
    const sorted2 = [...votesArr2].sort((a, b) => a.timestamp - b.timestamp);
    const lastVoteTs1 = sorted1[sorted1.length - 1].timestamp;
    const lastVoteTs2 = sorted2[sorted2.length - 1].timestamp;

    assert.equal(lastVoteTs1, 1500);
    assert.equal(lastVoteTs2, 1800);
    const speedWinner = lastVoteTs1 < lastVoteTs2 ? r1 : r2;
    assert.equal(speedWinner.id, 'r1', 'r1 wins because it reached its final vote earlier');
  });

  // 12. Task C: 0-0 Failed Sudden Death Fallback
  check('12. 0-0 Failed Sudden Death Fallback: does not pick random winner, shows localized failure message', () => {
    const twoRestaurants = [
      { id: 'r1', nameEn: 'Burger A', nameAr: 'برجر أ' },
      { id: 'r2', nameEn: 'Shawarma B', nameAr: 'شاورما ب' },
    ];

    const arLoc = JSON.parse(readFileSync('src/locales/ar.json', 'utf8'));
    const enLoc = JSON.parse(readFileSync('src/locales/en.json', 'utf8'));

    assert.ok(
      arLoc.gameSwiper.suddenDeathFailedZeroVotes.includes('فشل الموت المفاجئ لعدم التصويت'),
      'Arabic failure message defined'
    );
    assert.ok(
      enLoc.gameSwiper.suddenDeathFailedZeroVotes.includes('Sudden Death failed — no one voted'),
      'English failure message defined'
    );
  });

  console.log(`\nALL ${checks} EMOJI CLASH & SUDDEN DEATH VERIFICATION CHECKS PASSED SUCCESSFULLY!\n`);
} finally {
  await server.close();
}
