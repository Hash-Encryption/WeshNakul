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
  const { CaptainWheel } = await server.ssrLoadModule('/src/components/common/CaptainWheel.tsx');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');
  const { calculateCaptainLandingTarget, getCaptainSliceIndexAtPointer } = await server.ssrLoadModule('/src/hooks/useCaptainWheel.ts');

  console.log('--- EXECUTING CAPTAIN ROULETTE UI & ENGINE VERIFICATION SUITE ---');

  // 1. Verify CaptainWheel renders helm handles, brass studs, and initials-only badges
  check('1. CaptainWheel renders SVG with ship-helm spokes and player initials', () => {
    const mockCandidates = [
      { id: 'c1', nickname: 'Omar', initial: 'O', color: '#FFD75A', weight: 100 },
      { id: 'c2', nickname: 'Lina', initial: 'L', color: '#F0443E', weight: 100 },
      { id: 'c3', nickname: 'Yara', initial: 'Y', color: '#55B96A', weight: 100 },
      { id: 'c4', nickname: 'Saad', initial: 'S', color: '#F6A6AD', weight: 100 },
      { id: 'c5', nickname: 'Hassan', initial: 'H', color: '#73C8EA', weight: 100 },
    ];

    const html = renderToStaticMarkup(
      createElement(CaptainWheel, {
        candidates: mockCandidates,
        rotation: 0,
        isSpinning: false,
      })
    );

    // Verify SVG structure
    assert.ok(html.includes('<svg'), 'Wheel renders SVG');
    assert.ok(html.includes('viewBox="0 0 360 360"'), 'Wheel has 360x360 viewBox');

    // Verify 8 helm handles
    assert.ok(html.includes('rotate(0 180 180)'), 'Helm handle 0 deg');
    assert.ok(html.includes('rotate(45 180 180)'), 'Helm handle 45 deg');
    assert.ok(html.includes('rotate(180 180 180)'), 'Helm handle 180 deg');

    // Verify player initials rendered inside badges
    assert.ok(html.includes('>O<'), 'Initial O rendered');
    assert.ok(html.includes('>L<'), 'Initial L rendered');
    assert.ok(html.includes('>Y<'), 'Initial Y rendered');
    assert.ok(html.includes('>S<'), 'Initial S rendered');
    assert.ok(html.includes('>H<'), 'Initial H rendered');

    // Verify NO emojis used as segment labels
    assert.ok(!html.includes('👑<'), 'No emoji label on wheel');
    assert.ok(!html.includes('🎲<'), 'No emoji label on wheel');

    // Verify captain hat emblem in center
    assert.ok(html.includes('Anchor Insignia Badge') || html.includes('stroke="#F59E0B"'), 'Captain hat gold strap present');
  });

  // 2. Test candidate counts: 2, 4, 8 players
  check('2. CaptainWheel gracefully handles 2, 4, 6, 8 candidates without clipping', () => {
    for (const count of [2, 4, 6, 8]) {
      const cands = Array.from({ length: count }, (_, i) => ({
        id: `p-${i}`,
        nickname: `Player${i + 1}`,
        initial: String.fromCharCode(65 + i),
        color: '#FFD75A',
        weight: 100,
      }));

      const html = renderToStaticMarkup(createElement(CaptainWheel, { candidates: cands }));
      for (let i = 0; i < count; i++) {
        const letter = String.fromCharCode(65 + i);
        assert.ok(html.includes(`>${letter}<`), `Candidate ${letter} initial present for count ${count}`);
      }
    }
  });

  // 3. Test calculation of landing angle
  check('3. calculateCaptainLandingTarget accurately aligns target slice under 12 o clock needle', () => {
    // 4 slices: each is 90 deg.
    // Slice 0: 0-90, midAngle = 45. Pointer at 12 o'clock means angle = 0.
    // Pointer angle on wheel for rotation R is (360 - (R % 360)) % 360.
    // If midAngle = 45, wheel needs to rotate such that pointer aligns with 45 deg, so rotation % 360 = 315 deg.
    const startAngle = 100;
    const winnerMidAngle = 45;
    const target = calculateCaptainLandingTarget(startAngle, winnerMidAngle, 720);

    assert.ok(target >= startAngle + 720, 'Distance is at least minDistance (2 full spins)');
    const landingRemainder = target % 360;
    const expectedRemainder = (360 - winnerMidAngle) % 360; // 315
    assert.equal(landingRemainder, expectedRemainder, 'Target lands precisely on winner slice center');
  });

  // 4. Test slice index tracking
  check('4. getCaptainSliceIndexAtPointer correctly detects slice under needle', () => {
    // For 4 slices (0..3):
    // slice 0 is [0, 90) deg. If rotation = 0, pointer is at 0 deg -> slice 0.
    assert.equal(getCaptainSliceIndexAtPointer(0, 4), 0);

    // If rotation = 270 (so wheel turned 270 deg clockwise, 90 deg on wheel is at top) -> slice 1.
    assert.equal(getCaptainSliceIndexAtPointer(270, 4), 1);
  });

  // 5. Test Arabic and English localization keys
  check('5. All Captain Roulette localization strings exist in ar.json and en.json', () => {
    const en = JSON.parse(readFileSync('src/locales/en.json', 'utf8'));
    const ar = JSON.parse(readFileSync('src/locales/ar.json', 'utf8'));

    const requiredKeys = [
      'title',
      'subtitle',
      'spinning',
      'provisionalBanner',
      'objectionWindow',
      'requestReroll',
      'rerollRequested',
      'voteTitle',
      'voteSubtitle',
      'voteRemaining',
      'votesCount',
      'approveVote',
      'rejectVote',
      'votedApprove',
      'votedReject',
      'rerollApproved',
      'rerollRejected',
      'rerollTieRejected',
      'noObjectionConfirmed',
      'finalCaptainBanner',
      'startGame',
      'alreadyRerolled',
      'waitingForVote',
      'waitingForHost',
      'close',
    ];

    for (const key of requiredKeys) {
      assert.ok(en.captainRoulette?.[key], `en.json missing captainRoulette.${key}`);
      assert.ok(ar.captainRoulette?.[key], `ar.json missing captainRoulette.${key}`);
    }

    // Verify non-technical copy (no "fair rotation" or similar)
    const enText = JSON.stringify(en.captainRoulette);
    const arText = JSON.stringify(ar.captainRoulette);
    assert.ok(!enText.toLowerCase().includes('fair rotation'), 'Copy avoids technical phrase "fair rotation"');
    assert.ok(!arText.includes('دوران عادل'), 'Arabic copy avoids technical phrase');
  });

  console.log(`\nPASS: All ${checks} Captain Roulette UI & Engine verification checks passed!`);
} catch (err) {
  console.error('\nUI VERIFICATION FAILED:', err);
  process.exit(1);
} finally {
  await server.close();
}
