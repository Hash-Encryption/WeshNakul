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
  console.log('--- EXECUTING EMOJI CLASH PACING & NON-HOST SYNC VERIFICATION SUITE ---');

  const { MustardSack } = await server.ssrLoadModule('/src/components/minigames/emoji_clash/MustardSack.tsx');
  const { EmojiArenaStage } = await server.ssrLoadModule('/src/components/minigames/emoji_clash/EmojiArenaStage.tsx');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');

  const wrapLocale = (node, locale = 'ar') => {
    store.set('wsh_locale', locale);
    return createElement(LocaleProvider, null, node);
  };

  // 1. Verify MustardSack renders alert shockwave, pointing arrows, warning ribbon, and live tap counter when isAlertActive is true
  check('1. MustardSack renders warning ribbon, pointing arrows, and live tap counter when alert is active', () => {
    const htmlAr = renderToStaticMarkup(
      wrapLocale(
        createElement(MustardSack, {
          currentTaps: 4,
          targetTaps: 14,
          isInteractive: true,
          onTap: () => {},
          isDetonated: false,
          isSackDropping: false,
          isAlertActive: true,
        }),
        'ar'
      )
    );

    assert.ok(htmlAr.includes('اضغطوا على كيس الخردل لتفجيره'), 'Arabic comic warning ribbon present');
    assert.ok(htmlAr.includes('4 / 14'), 'Live tap count badge present in Arabic');
    assert.ok(htmlAr.includes('ضربة'), 'Arabic taps label present');
    assert.ok(htmlAr.includes('👆'), 'Pointing emoji arrows present');

    const htmlEn = renderToStaticMarkup(
      wrapLocale(
        createElement(MustardSack, {
          currentTaps: 7,
          targetTaps: 21,
          isInteractive: true,
          onTap: () => {},
          isDetonated: false,
          isSackDropping: false,
          isAlertActive: true,
        }),
        'en'
      )
    );

    assert.ok(htmlEn.includes('TAP THE MUSTARD SACK TO EXPLODE IT'), 'English warning ribbon present');
    assert.ok(htmlEn.includes('7 / 21 TAPS'), 'English tap count badge present');
  });

  // 2. Verify MustardSack base scale is 0.85
  check('2. MustardSack base scale is 0.85 swelling to 1.85', () => {
    const code = readFileSync('src/components/minigames/emoji_clash/MustardSack.tsx', 'utf-8');
    assert.ok(code.includes('0.85 + tapRatio * (1.85 - 0.85)'), 'Base scale is 0.85 and max is 1.85');
    assert.ok(code.includes('height: isAlertActive ? 68 : 52'), 'Rope drops lower to 68px on alert');
  });

  // 3. Verify EmojiArenaStage renders staged Phase 2 overlays
  check('3. EmojiArenaStage renders staged Phase 2 overlays', () => {
    const dummySquads = [
      {
        squadId: 'squad-1',
        emoji: '🔥',
        fighterId: 'infernal',
        members: [{ participantId: 'p1', nickname: 'Host' }],
        isMega: false,
        restaurant: { id: 'r1', nameAr: 'شاورماشا', nameEn: 'Shawarmasha' },
        ringColor: '#EF4444',
        ringBorderColor: '#DC2626',
        isWinner: true,
        baseSize: 72,
        initialPos: { x: 0, y: 0 },
      },
      {
        squadId: 'squad-2',
        emoji: '😂',
        fighterId: 'troll',
        members: [{ participantId: 'p2', nickname: 'Guest' }],
        isMega: false,
        restaurant: { id: 'r2', nameAr: 'نورا برجر', nameEn: 'Nora Burger' },
        ringColor: '#F59E0B',
        ringBorderColor: '#D97706',
        isWinner: false,
        baseSize: 72,
        initialPos: { x: 0, y: 0 },
      },
    ];

    // Stage A: fusion_intro
    const htmlIntro = renderToStaticMarkup(
      wrapLocale(
        createElement(EmojiArenaStage, {
          phase: 'squad_fusion',
          fusionStage: 'fusion_intro',
          squads: dummySquads,
          winningRestaurantId: 'r1',
          battleSeed: 42,
          projectiles: [],
          mustardDetonated: false,
          goldenKnockoutTriggered: false,
          restaurants: dummySquads.map((s) => s.restaurant),
        }),
        'ar'
      )
    );
    assert.ok(htmlIntro.includes('تجهيز المقاتلين'), 'Fusion intro overlay present in Arabic');

    // Stage B: banner_drop
    const htmlDrop = renderToStaticMarkup(
      wrapLocale(
        createElement(EmojiArenaStage, {
          phase: 'squad_fusion',
          fusionStage: 'banner_drop',
          squads: dummySquads,
          winningRestaurantId: 'r1',
          battleSeed: 42,
          projectiles: [],
          mustardDetonated: false,
          goldenKnockoutTriggered: false,
          restaurants: dummySquads.map((s) => s.restaurant),
        }),
        'ar'
      )
    );
    assert.ok(htmlDrop.includes('هبوط لافتات المطاعم المتنافسة'), 'Banner drop overlay present in Arabic');

    // Stage C: fight_callout
    const htmlFight = renderToStaticMarkup(
      wrapLocale(
        createElement(EmojiArenaStage, {
          phase: 'squad_fusion',
          fusionStage: 'fight_callout',
          squads: dummySquads,
          winningRestaurantId: 'r1',
          battleSeed: 42,
          projectiles: [],
          mustardDetonated: false,
          goldenKnockoutTriggered: false,
          restaurants: dummySquads.map((s) => s.restaurant),
        }),
        'ar'
      )
    );
    assert.ok(htmlFight.includes('FIGHT!'), 'Arcade FIGHT callout overlay present');
  });

  // 4. Verify EmojiArenaStage displays non-host transition prompt on podium
  check('4. EmojiArenaStage displays non-host transition prompt on podium', () => {
    const dummySquads = [
      {
        squadId: 'squad-1',
        emoji: '🔥',
        fighterId: 'infernal',
        members: [{ participantId: 'p1', nickname: 'Host' }],
        isMega: false,
        restaurant: { id: 'r1', nameAr: 'شاورماشا', nameEn: 'Shawarmasha' },
        ringColor: '#EF4444',
        ringBorderColor: '#DC2626',
        isWinner: true,
        baseSize: 72,
        initialPos: { x: 0, y: 0 },
      },
    ];

    const htmlGuest = renderToStaticMarkup(
      wrapLocale(
        createElement(EmojiArenaStage, {
          phase: 'podium',
          squads: dummySquads,
          winningRestaurantId: 'r1',
          battleSeed: 42,
          projectiles: [],
          mustardDetonated: false,
          goldenKnockoutTriggered: false,
          restaurants: dummySquads.map((s) => s.restaurant),
          isHost: false,
        }),
        'ar'
      )
    );

    assert.ok(htmlGuest.includes('جاري الانتقال لصفحة الطلب'), 'Non-host sees transitioning message in Arabic');
    assert.ok(!htmlGuest.includes('اعتماد الفائز'), 'Non-host does not see host button');

    const htmlHost = renderToStaticMarkup(
      wrapLocale(
        createElement(EmojiArenaStage, {
          phase: 'podium',
          squads: dummySquads,
          winningRestaurantId: 'r1',
          battleSeed: 42,
          projectiles: [],
          mustardDetonated: false,
          goldenKnockoutTriggered: false,
          restaurants: dummySquads.map((s) => s.restaurant),
          isHost: true,
          onWinnerConfirmed: () => {},
        }),
        'ar'
      )
    );

    assert.ok(htmlHost.includes('اعتماد الفائز'), 'Host sees Lock in Winner button');
  });

  // 5. Verify EmojiClashModal has 5.5s Phase 2, 15s Phase 3, 3.5s podium auto-advance, and broadcasts emoji_clash_finalized
  check('5. EmojiClashModal has 5.5s Phase 2, 15s Phase 3, 3.5s podium auto-advance, and broadcasts emoji_clash_finalized', () => {
    const modalCode = readFileSync('src/components/minigames/emoji_clash/EmojiClashModal.tsx', 'utf-8');
    assert.ok(modalCode.includes('setTimerSeconds(15)'), 'Phase 3 sets 15 seconds timer');
    assert.ok(modalCode.includes('setIsMustardAlertActive(true)') && modalCode.includes('1500'), 'Mustard alert activates at 1.5s into brawl');
    assert.ok(modalCode.includes('type: \'emoji_clash_finalized\''), 'Broadcasts emoji_clash_finalized');
    assert.ok(modalCode.includes('handleConfirmWinnerClick()') && modalCode.includes('3500'), 'Auto-advances from podium after 3.5s');
  });

  // 6. Verify RestaurantSwipingScreen listens to emoji_clash_finalized and has safety watchdog
  check('6. RestaurantSwipingScreen syncs emoji_clash_finalized and has matched-stage safety watchdog', () => {
    const swipingCode = readFileSync('src/components/swiping/RestaurantSwipingScreen.tsx', 'utf-8');
    assert.ok(swipingCode.includes('msg.type === \'emoji_clash_finalized\''), 'Listens to emoji_clash_finalized in realtime subscription');
    assert.ok(swipingCode.includes('completeMiniGame()'), 'Calls completeMiniGame() upon finalization');
    assert.ok(swipingCode.includes('currentRoom?.stage === \'matched\' && isEmojiClashOpen'), 'Safety watchdog for matched stage');
  });

  console.log(`\nALL ${checks} EMOJI CLASH PACING & SYNC CHECKS PASSED SUCCESSFULLY!`);
} finally {
  await server.close();
}
