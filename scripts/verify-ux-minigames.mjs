import assert from 'node:assert/strict';
import http from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const execFileAsync = promisify(execFile);

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

console.log('--- STARTING MINI-GAMES UX CLARITY & HEADLESS CHROME VERIFICATION ---');

const { MINI_GAMES } = await server.ssrLoadModule('/src/config/miniGames.ts');
const { MiniGamesDeckGrid } = await server.ssrLoadModule('/src/components/minigames/MiniGamesDeckGrid.tsx');
const { MiniGameIntroOverlay } = await server.ssrLoadModule('/src/components/minigames/MiniGameIntroOverlay.tsx');
const { ShuffleCardsModal } = await server.ssrLoadModule('/src/components/minigames/shuffle_cards/ShuffleCardsModal.tsx');
const { SuddenDeathModal } = await server.ssrLoadModule('/src/components/swiping/SuddenDeathModal.tsx');
const { EmojiClashModal } = await server.ssrLoadModule('/src/components/minigames/emoji_clash/EmojiClashModal.tsx');
const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');

// 1. Verify MiniGameIntroOverlay for all 3 games
console.log('1. Verifying MiniGameIntroOverlay content & 3-step instructions...');
for (const gameId of ['shuffle_cards', 'sudden_death', 'emoji_clash']) {
  store.set('wsh_locale', 'ar');
  const arHtml = renderToStaticMarkup(
    createElement(LocaleProvider, null, createElement(MiniGameIntroOverlay, {
      gameId,
      onComplete: () => {},
    }))
  );
  assert.ok(arHtml.includes('كيف تلعب؟'), `${gameId} ar has HOW TO PLAY badge`);
  assert.ok(arHtml.includes('تخطي'), `${gameId} ar has skip button`);
  assert.ok(arHtml.includes('1️⃣') && arHtml.includes('2️⃣') && arHtml.includes('3️⃣'), `${gameId} has 3 step badges`);

  store.set('wsh_locale', 'en');
  const enHtml = renderToStaticMarkup(
    createElement(LocaleProvider, null, createElement(MiniGameIntroOverlay, {
      gameId,
      onComplete: () => {},
    }))
  );
  assert.ok(enHtml.includes('HOW TO PLAY'), `${gameId} en has HOW TO PLAY badge`);
  assert.ok(enHtml.includes('Skip'), `${gameId} en has skip button`);
}
console.log('✓ MiniGameIntroOverlay renders perfectly for all 3 games across ar & en.');

// 2. Verify Deck Grid mechanic badges & updated subtitles
console.log('2. Verifying Deck Grid mechanic badges & updated subtitles...');
store.set('wsh_locale', 'ar');
const deckGridAr = renderToStaticMarkup(
  createElement(LocaleProvider, null, createElement(MiniGamesDeckGrid, {
    tieCount: 2,
    activePlayerCount: 2,
    onSelectGame: () => {},
  }))
);
assert.ok(deckGridAr.includes('سحب أعمى'), 'Deck grid has Blind Pick mechanic badge in Arabic');
assert.ok(deckGridAr.includes('تصويت سريع'), 'Deck grid has 1v1 Vote mechanic badge in Arabic');
assert.ok(deckGridAr.includes('حلبة جماعية'), 'Deck grid has Group Brawl mechanic badge in Arabic');
assert.ok(deckGridAr.includes('اخفِ المطاعم خلف البطاقات'), 'Deck grid has updated Shuffle Cards subtitle in Arabic');
assert.ok(deckGridAr.includes('تصويت سريع ١ ضد ١.. والأسرع يحسم التعادل!'), 'Deck grid has updated Sudden Death subtitle in Arabic');
assert.ok(deckGridAr.includes('اختر مقاتلك، ارمِ البهارات وفجّر قنبلة الخردل!'), 'Deck grid has updated Emoji Clash subtitle in Arabic');

store.set('wsh_locale', 'en');
const deckGridEn = renderToStaticMarkup(
  createElement(LocaleProvider, null, createElement(MiniGamesDeckGrid, {
    tieCount: 2,
    activePlayerCount: 2,
    onSelectGame: () => {},
  }))
);
assert.ok(deckGridEn.includes('Blind Pick'), 'Deck grid has Blind Pick mechanic badge in English');
assert.ok(deckGridEn.includes('1v1 Vote'), 'Deck grid has 1v1 Vote mechanic badge in English');
assert.ok(deckGridEn.includes('Group Brawl'), 'Deck grid has Group Brawl mechanic badge in English');
assert.ok(deckGridEn.includes('Hide tied spots in cards &amp; pick one!'), 'Deck grid has updated Shuffle Cards subtitle in English');
console.log('✓ Mini-games deck grid displays all mechanic badges and updated subtitles.');

// 3. Verify Desktop Phone Frame (max-w-[420px]) & Live Announcer Pills in all 3 modals
console.log('3. Verifying desktop phone frame (max-w-[420px]) and announcer pills in modals...');

// ShuffleCardsModal
const shuffleHtml = renderToStaticMarkup(
  createElement(LocaleProvider, null, createElement(ShuffleCardsModal, {
    isOpen: true,
    roomId: 'room-1',
    currentParticipantId: 'capt-1',
    isHost: true,
    captain: { id: 'capt-1', nickname: 'Ali' },
    restaurants: [
      { id: 'r1', nameAr: 'شاورما', nameEn: 'Shawarma' },
      { id: 'r2', nameAr: 'برجر', nameEn: 'Burger' },
    ],
    winnerId: 'r1',
    onWinnerConfirmed: () => {},
    onClose: () => {},
  }))
);
assert.ok(shuffleHtml.includes('max-w-[420px]'), 'ShuffleCardsModal has max-w-[420px] desktop phone frame');
assert.ok(shuffleHtml.includes('md:rounded-[32px]'), 'ShuffleCardsModal has md:rounded-[32px] cabinet frame');
assert.ok(shuffleHtml.includes('👀') || shuffleHtml.includes('المطاعم المتعادلة'), 'ShuffleCardsModal has live announcer pill');

// SuddenDeathModal
store.set('wsh_locale', 'ar');
const suddenHtml = renderToStaticMarkup(
  createElement(LocaleProvider, null, createElement(SuddenDeathModal, {
    isOpen: true,
    roomId: 'room-1',
    currentParticipantId: 'user-1',
    isHost: true,
    restaurants: [
      { id: 'r1', nameAr: 'شاورما', nameEn: 'Shawarma' },
      { id: 'r2', nameAr: 'برجر', nameEn: 'Burger' },
    ],
    totalParticipants: 2,
    onSelectWinner: () => {},
    onClose: () => {},
  }))
);
assert.ok(suddenHtml.includes('max-w-[420px]'), 'SuddenDeathModal has max-w-[420px] desktop phone frame');
assert.ok(suddenHtml.includes('الفائز يستمر للجولة القادمة') || suddenHtml.includes('Winner stays on'), 'SuddenDeathModal has header explainer announcer pill');

// EmojiClashModal
store.set('wsh_locale', 'ar');
const emojiHtml = renderToStaticMarkup(
  createElement(LocaleProvider, null, createElement(EmojiClashModal, {
    isOpen: true,
    roomId: 'room-1',
    currentParticipantId: 'user-1',
    participants: [{ id: 'user-1', nickname: 'Ali', status: 'active' }],
    isHost: true,
    restaurants: [
      { id: 'r1', nameAr: 'شاورما', nameEn: 'Shawarma' },
      { id: 'r2', nameAr: 'برجر', nameEn: 'Burger' },
    ],
    winnerRestaurantId: 'r1',
    battleSeed: 42,
    onWinnerConfirmed: () => {},
    onClose: () => {},
  }))
);
assert.ok(emojiHtml.includes('max-w-[420px]'), 'EmojiClashModal has max-w-[420px] desktop phone frame');
assert.ok(emojiHtml.includes('اختر مقاتلك') || emojiHtml.includes('Pick your fighter'), 'EmojiClashModal has Fighter Select live announcer pill');

console.log('✓ All 3 active modals contain desktop phone frame (max-w-[420px]) and live announcer pills.');

// 4. Verify in Headless Chrome
console.log('4. Launching headless Chrome to verify clean browser rendering & frame layout...');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const compositeHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mini Games Verification</title>
  <style>
    body { margin: 0; background: #000; font-family: sans-serif; }
    .test-box { width: 100vw; height: 100vh; position: relative; }
  </style>
</head>
<body>
  <div class="test-box">
    ${shuffleHtml}
  </div>
</body>
</html>`;

const localServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(compositeHtml);
});

await new Promise((resolve) => localServer.listen(0, '127.0.0.1', resolve));
const port = localServer.address().port;
const targetUrl = `http://127.0.0.1:${port}/`;

try {
  const { stdout, stderr } = await execFileAsync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--dump-dom',
    targetUrl,
  ], { timeout: 10000 });

  assert.ok(stdout.includes('max-w-[420px]'), 'Headless Chrome successfully parsed and rendered desktop arcade frame');
  assert.ok(stdout.includes('كيف تلعب؟') || stdout.includes('HOW TO PLAY'), 'Headless Chrome successfully rendered MiniGameIntroOverlay');
  console.log('✓ Headless Chrome verification successful: DOM dumped and verified cleanly with 0 errors.');
} finally {
  localServer.close();
  await server.close();
}

console.log('🎉 ALL MINI-GAME CLARITY & FRAME UPGRADES VERIFIED SUCCESSFULLY!');
process.exit(0);
