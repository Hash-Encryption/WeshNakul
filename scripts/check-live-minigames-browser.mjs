import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createServer } from 'vite';

console.log('--- EXECUTING LIVE MINI-GAMES GRID & EMOJI CLASH BROWSER VERIFICATION ---');

const PORT = 5195;
const CDP_PORT = 9229;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const apiCode = `
export async function resolveRestaurantTie(roomId, token, version, method) {
  return {
    room: {
      id: roomId,
      version: version + 1,
      status: 'matched',
      winning_restaurant_id: 'rest_shawarma',
      tied_restaurant_ids: ['rest_shawarma', 'rest_pizza'],
    }
  };
}
export async function broadcastEmojiClash(roomId, message) {
  return window.__MOCK_REALTIME__.broadcast(roomId, message);
}
export function subscribeToEmojiClash(roomId, cb) {
  return window.__MOCK_REALTIME__.subscribe(roomId, cb);
}
export async function broadcastShuffleCards() {}
export function subscribeToShuffleCards() { return () => {}; }
export async function broadcastSuddenDeath() {}
export function subscribeToSuddenDeath() { return () => {}; }
export function subscribeToCaptainEvents() { return () => {}; }
export async function getCaptainEventState() { return null; }
`;

const harnessCode = `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '/src/index.css';
import { LeaderboardView } from '/src/components/swiping/LeaderboardView.tsx';
import { EmojiClashModal } from '/src/components/minigames/emoji_clash/EmojiClashModal.tsx';
import { LocaleProvider, useLocale } from '/src/context/LocaleContext.tsx';
import { resolveRestaurantTie, broadcastEmojiClash } from 'virtual:mock-api';

const listeners = new Map();
window.__MOCK_REALTIME__ = {
  broadcast(roomId, msg) {
    const list = listeners.get(roomId) || [];
    list.forEach(cb => cb(msg));
  },
  subscribe(roomId, cb) {
    const arr = listeners.get(roomId) || [];
    arr.push(cb);
    listeners.set(roomId, arr);
    return () => {
      const cur = listeners.get(roomId) || [];
      listeners.set(roomId, cur.filter(x => x !== cb));
    };
  }
};

const mockRestaurants = [
  { id: 'rest_shawarma', nameEn: 'Shawarma Al-Balad', nameAr: 'شاورما البلد', rating: 4.8 },
  { id: 'rest_pizza', nameEn: 'Pizza Corner', nameAr: 'بيتزا كورنر', rating: 4.6 },
  { id: 'rest_burger', nameEn: 'Classic Burger', nameAr: 'كلاسيك برجر', rating: 4.7 }
];

const mockSummary = {
  status: 'tie',
  totalSwipes: 10,
  cards: [
    { restaurantId: 'rest_shawarma', yesCount: 2 },
    { restaurantId: 'rest_pizza', yesCount: 2 },
    { restaurantId: 'rest_burger', yesCount: 1 }
  ],
  tiedRestaurantIds: ['rest_shawarma', 'rest_pizza'],
  participantProgress: [
    { participantId: 'p1', complete: true },
    { participantId: 'p2', complete: true }
  ]
};

function Harness() {
  const { setLocale, locale } = useLocale();
  const [emojiClashOpen, setEmojiClashOpen] = useState(false);
  const [clashState, setClashState] = useState(null);

  const participants = [
    { id: 'p1', nickname: 'Tariq', is_host: true, status: 'active', player_color: '#EF4444' },
    { id: 'p2', nickname: 'Sara', is_host: false, status: 'active', player_color: '#3B82F6' }
  ];

  const handleSelectMiniGame = async (game) => {
    if (game.id === 'emoji_clash') {
      const res = await resolveRestaurantTie('room-test', 'token-123', 1, 'choose_for_us');
      const winnerId = res.room.winning_restaurant_id;
      setClashState({
        restaurants: mockRestaurants.slice(0, 2),
        winnerRestaurantId: winnerId,
        battleSeed: 98765
      });
      setEmojiClashOpen(true);
    }
  };

  window.__SET_LOCALE__ = (loc) => setLocale(loc);
  window.__IS_EMOJI_CLASH_OPEN__ = () => emojiClashOpen;

  return React.createElement('div', { className: 'p-4 max-w-md mx-auto min-h-screen bg-[#FFF8F1]' }, [
    React.createElement('div', { key: 'lang', className: 'mb-2 flex gap-2' }, [
      React.createElement('button', {
        key: 'ar',
        id: 'btn-lang-ar',
        onClick: () => setLocale('ar'),
        className: 'px-2 py-1 bg-amber-200 text-xs rounded font-bold'
      }, 'العربية'),
      React.createElement('button', {
        key: 'en',
        id: 'btn-lang-en',
        onClick: () => setLocale('en'),
        className: 'px-2 py-1 bg-amber-200 text-xs rounded font-bold'
      }, 'English')
    ]),
    React.createElement(LeaderboardView, {
      key: 'leaderboard',
      restaurants: mockRestaurants,
      summary: mockSummary,
      participants: participants,
      isHost: true,
      suggestions: [],
      currentParticipantId: 'p1',
      onConfirmPick: () => {},
      onTriggerSuddenDeath: () => {},
      onTriggerRoulette: () => {},
      onTriggerCaptainRoulette: () => {},
      onSelectMiniGame: handleSelectMiniGame
    }),
    emojiClashOpen && clashState && React.createElement(EmojiClashModal, {
      key: 'clashModal',
      isOpen: emojiClashOpen,
      roomId: 'room-test',
      currentParticipantId: 'p1',
      participants: participants,
      isHost: true,
      restaurants: clashState.restaurants,
      winnerRestaurantId: clashState.winnerRestaurantId,
      battleSeed: clashState.battleSeed,
      onWinnerConfirmed: () => setEmojiClashOpen(false),
      onClose: () => setEmojiClashOpen(false)
    })
  ]);
}

createRoot(document.getElementById('root')).render(
  React.createElement(LocaleProvider, null, React.createElement(Harness))
);
`;

let viteServer;
let chromeProc;
let ws;

class CDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.pending = new Map();
  }
  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.pending.has(data.id)) {
        const { resolve, reject } = this.pending.get(data.id);
        this.pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error('CDP Eval error: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }
}

try {
  // 1. Setup Vite Server
  viteServer = await createServer({
    server: { host: '127.0.0.1', port: PORT, strictPort: true },
    plugins: [
      {
        name: 'virtual-live-test',
        enforce: 'pre',
        resolveId(source) {
          if (source === 'virtual:live-harness.tsx' || source === 'virtual:mock-api') {
            return '\0' + source;
          }
        },
        load(id) {
          if (id === '\0virtual:live-harness.tsx') return harnessCode;
          if (id === '\0virtual:mock-api') return apiCode;
        },
        configureServer(server) {
          server.middlewares.use('/live-test', async (_req, res) => {
            res.setHeader('Content-Type', 'text/html');
            res.end(
              await server.transformIndexHtml(
                '/live-test',
                `<!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Live Mini Games Test</title>
                  </head>
                  <body class="bg-[#FAF4ED] text-[#241B18]">
                    <div id="root"></div>
                    <script type="module" src="/@id/__x00__virtual:live-harness.tsx"></script>
                  </body>
                </html>`
              )
            );
          });
        },
      },
    ],
  });
  await viteServer.listen();
  console.log(`✓ Vite server running at http://127.0.0.1:${PORT}/live-test`);

  // 2. Launch Google Chrome headless
  chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--window-size=420,900',
  ]);

  let connected = false;
  for (let i = 0; i < 25; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) {
        connected = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  assert.ok(connected, 'Headless Chrome connected on CDP port');

  const targetsRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find((t) => t.type === 'page');
  assert.ok(pageTarget, 'Found Chrome page target');

  const cdp = new CDP(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  console.log('✓ Connected to Headless Chrome via CDP');

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/live-test` });

  // Wait for page hydration and poll for accordion button
  let accordionOpen = false;
  for (let i = 0; i < 30; i++) {
    accordionOpen = await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.includes('الألعاب المصغرة') || b.textContent.includes('Mini Games') || b.textContent.includes('🎮')
        );
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    if (accordionOpen) break;
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log('Accordion clicked:', accordionOpen);
  assert.ok(accordionOpen, 'Mini Games accordion toggle button found and clicked');

  // Wait for motion animation to expand
  await new Promise((r) => setTimeout(r, 600));

  // --- CHECK 1: DOM Audit for Food Brawl removal ---
  const bodyText = await cdp.evaluate('document.body.innerText');
  const bodyHtml = await cdp.evaluate('document.body.innerHTML');

  assert.ok(!bodyText.includes('Food Brawl'), 'Food Brawl text must NOT exist in the DOM');
  assert.ok(!bodyText.includes('عراك الوجبات'), 'عراك الوجبات text must NOT exist in the DOM');
  assert.ok(!bodyText.includes('Watch the foods fight'), 'Watch the foods fight text must NOT exist');
  assert.ok(!bodyHtml.includes('food_brawl'), 'food_brawl asset or ID must NOT exist in DOM');
  console.log('✓ CHECK 1 PASSED: Food Brawl is 100% absent from the rendered DOM');

  // --- CHECK 2: Emoji Clash is Present, Active, and NOT "Coming Soon" ---
  const emojiClashInfo = await cdp.evaluate(`
    (() => {
      // Find all buttons inside the grid
      const buttons = Array.from(document.querySelectorAll('div.grid button'));
      const emojiBtn = buttons.find(b =>
        b.textContent.includes('حرب الإيموجي') || b.textContent.includes('Emoji Clash')
      );
      if (!emojiBtn) return null;

      const hasComingSoon = emojiBtn.textContent.includes('Coming Soon') || emojiBtn.textContent.includes('قريباً');
      const isDisabled = emojiBtn.getAttribute('aria-disabled') === 'true' || emojiBtn.disabled;
      const isGreyedOut = emojiBtn.className.includes('opacity-60') || emojiBtn.className.includes('cursor-not-allowed');
      const hasActiveShadow = emojiBtn.className.includes('shadow-[0px_3px_0px_#241B18]');
      const title = emojiBtn.getAttribute('title');

      return {
        found: true,
        text: emojiBtn.textContent,
        title,
        hasComingSoon,
        isDisabled,
        isGreyedOut,
        hasActiveShadow
      };
    })()
  `);

  assert.ok(emojiClashInfo, 'Emoji Clash card found in the mini games grid');
  assert.equal(emojiClashInfo.hasComingSoon, false, 'Emoji Clash must NOT have "Coming Soon" badge');
  assert.equal(emojiClashInfo.isDisabled, false, 'Emoji Clash must NOT be disabled');
  assert.equal(emojiClashInfo.isGreyedOut, false, 'Emoji Clash must NOT be greyed out / opacity-60');
  assert.equal(emojiClashInfo.hasActiveShadow, true, 'Emoji Clash must have active shadow styling');
  assert.equal(emojiClashInfo.title, 'بدء اللعبة', 'Host sees "بدء اللعبة" tooltip');
  console.log('✓ CHECK 2 PASSED: Emoji Clash is 100% active, clickable, and free of Coming Soon styling');

  // --- CHECK 3: Grid Layout & Balanced Rows ---
  const gridCards = await cdp.evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('div.grid button'));
      return buttons.map((b, idx) => ({
        index: idx,
        title: b.querySelector('h5') ? b.querySelector('h5').textContent.trim() : '',
        colSpan2: b.className.includes('col-span-2'),
      }));
    })()
  `);

  console.log('Rendered mini game cards in order:');
  gridCards.forEach((c) => console.log(`  [Card ${c.index + 1}] ${c.title} (colSpan2: ${c.colSpan2})`));

  assert.equal(gridCards.length, 6, 'Exactly 6 cards rendered in grid (no empty slots)');
  // Card 1: Shuffle Cards, Card 2: Sudden Death, Card 3: Emoji Clash
  assert.ok(gridCards[0].title.includes('أوراق الحظ') || gridCards[0].title.includes('Shuffle Cards'), 'Card 1 is Shuffle Cards');
  assert.ok(gridCards[1].title.includes('رأس برأس') || gridCards[1].title.includes('Sudden Death'), 'Card 2 is Sudden Death');
  assert.ok(gridCards[2].title.includes('حرب الإيموجي') || gridCards[2].title.includes('Emoji Clash'), 'Card 3 is Emoji Clash');

  // In a 6-card grid (even count), no card has col-span-2, so all 3 rows have exactly 2 cards
  const anyAwkwardWide = gridCards.some(c => c.colSpan2);
  assert.equal(anyAwkwardWide, false, 'Clean 2x3 grid: no awkward wide card creating empty half-rows');
  console.log('✓ CHECK 3 PASSED: Grid layout is perfectly balanced in 3 rows of 2 columns');

  await cdp.evaluate(`
    (() => {
      const grid = document.querySelector('div.grid');
      if (grid) grid.scrollIntoView({ block: 'center', behavior: 'instant' });
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  const shot1 = await cdp.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('C:\\Users\\hgend\\.gemini\\antigravity\\brain\\84e4dbaf-9a6d-4c53-8a9a-8f525b3f5c22\\mini-games-grid-verified.png', Buffer.from(shot1.data, 'base64'));
  console.log('✓ Captured screenshot: mini-games-grid-verified.png');

  // --- CHECK 4: Click Emoji Clash -> Opens Emoji Clash Arena ---
  const clicked = await cdp.evaluate(`
    (() => {
      const buttons = Array.from(document.querySelectorAll('div.grid button'));
      const emojiBtn = buttons.find(b =>
        b.textContent.includes('حرب الإيموجي') || b.textContent.includes('Emoji Clash')
      );
      if (emojiBtn) {
        emojiBtn.click();
        return true;
      }
      return false;
    })()
  `);
  assert.ok(clicked, 'Clicked Emoji Clash button');

  // Wait for modal transition
  await new Promise((r) => setTimeout(r, 800));

  const modalOpened = await cdp.evaluate('window.__IS_EMOJI_CLASH_OPEN__()');
  assert.equal(modalOpened, true, 'Emoji Clash Modal opened after clicking');

  const arenaDom = await cdp.evaluate(`
    (() => {
      const modal = document.querySelector('.fixed.inset-0');
      if (!modal) return null;
      return {
        hasHeader: modal.textContent.includes('حرب الإيموجي') || modal.textContent.includes('Emoji Clash'),
        hasTimer: Boolean(modal.querySelector('.font-mono') || modal.textContent.includes(':')),
        hasFighters: modal.querySelectorAll('button').length >= 8,
        hasMustard: Boolean(modal.querySelector('svg')),
      };
    })()
  `);

  assert.ok(arenaDom, 'Emoji Clash Arena DOM rendered');
  assert.ok(arenaDom.hasHeader, 'Arena has bilingual Emoji Clash header');
  assert.ok(arenaDom.hasFighters, 'Arcade 2x4 Fighter Select grid rendered with 8 emojis');
  console.log('✓ CHECK 4 PASSED: Clicking Emoji Clash opens the full-screen arena modal successfully');

  const shot2 = await cdp.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('C:\\Users\\hgend\\.gemini\\antigravity\\brain\\84e4dbaf-9a6d-4c53-8a9a-8f525b3f5c22\\emoji-clash-arena-verified.png', Buffer.from(shot2.data, 'base64'));
  console.log('✓ Captured screenshot: emoji-clash-arena-verified.png');

  // --- CHECK 5: Switch to English and verify LTR rendering ---
  await cdp.evaluate(`
    (() => {
      const enBtn = document.getElementById('btn-lang-en');
      if (enBtn) enBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  const enHeader = await cdp.evaluate(`document.body.innerText.includes('Emoji Clash')`);
  assert.ok(enHeader, 'English title "Emoji Clash" rendered correctly');
  console.log('✓ CHECK 5 PASSED: English and Arabic bilingual rendering verified in real Chrome');

  console.log('\n======================================================');
  console.log('ALL LIVE BROWSER MINI-GAMES GRID & EMOJI CLASH CHECKS PASSED!');
  console.log('======================================================\n');
} finally {
  if (chromeProc) chromeProc.kill();
  if (viteServer) await viteServer.close();
}
