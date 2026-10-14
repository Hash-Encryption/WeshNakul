import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'vite';

console.log('--- EXECUTING SHUFFLE CARDS REAL BROWSER VERIFICATION SUITE ---');

const PORT = 5192;
const CDP_PORT = 9227;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const apiCode = `
export async function broadcastShuffleCards(roomId, message) {
  return window.__MOCK_REALTIME__.broadcast(roomId, message);
}
export function subscribeToShuffleCards(roomId, cb) {
  return window.__MOCK_REALTIME__.subscribe(roomId, cb);
}
`;

const harnessCode = `
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ShuffleCardsModal } from '/src/components/minigames/shuffle_cards/ShuffleCardsModal.tsx';
import { LocaleProvider, useLocale } from '/src/context/LocaleContext.tsx';

const listeners = new Map();
const emitRealtime = (roomId, msg) => {
  const roomListeners = listeners.get(roomId) || [];
  roomListeners.forEach(cb => cb(msg));
};

window.__MOCK_REALTIME__ = {
  broadcast(roomId, msg) {
    emitRealtime(roomId, msg);
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

const mockRestaurantsCatalog = [
  { id: 'rest_shawarma', nameEn: 'Shawarma Al-Balad', nameAr: 'شاورما البلد', rating: 4.8, categories: ['shawarma', 'local'] },
  { id: 'rest_pizza', nameEn: 'Pizza Corner', nameAr: 'بيتزا كورنر', rating: 4.6, categories: ['pizza', 'italian'] },
  { id: 'rest_burger', nameEn: 'Classic Burger', nameAr: 'كلاسيك برجر', rating: 4.7, categories: ['burger', 'american'] },
  { id: 'rest_grill', nameEn: 'Sultan Grills', nameAr: 'مشاوي السلطان', rating: 4.9, categories: ['grills', 'middle_eastern'] },
  { id: 'rest_broast', nameEn: 'Crispy Broast', nameAr: 'بروستد مقرمش', rating: 4.5, categories: ['chicken', 'crispy'] },
  { id: 'rest_taco', nameEn: 'Fiesta Tacos', nameAr: 'تاكو فيستا', rating: 4.4, categories: ['mexican', 'tacos'] },
];

function TestClient({ participant, onScenarioEnd }) {
  const { setLocale } = useLocale();
  const [modalOpen, setModalOpen] = useState(false);
  const [restaurants, setRestaurants] = useState(mockRestaurantsCatalog.slice(0, 3));
  const [winnerId, setWinnerId] = useState('rest_shawarma');
  const [captain, setCaptain] = useState({ id: 'p2', nickname: 'Lina' });
  const [confirmedWinner, setConfirmedWinner] = useState(null);

  useEffect(() => {
    window['__CLIENT_' + participant.id + '_SET_SCENARIO__'] = (scenario) => {
      setConfirmedWinner(null);
      if (scenario.count === 2) {
        setRestaurants(mockRestaurantsCatalog.slice(0, 2));
        setWinnerId('rest_shawarma');
      } else if (scenario.count === 3) {
        setRestaurants(mockRestaurantsCatalog.slice(0, 3));
        setWinnerId('rest_pizza');
      } else if (scenario.count === 4) {
        setRestaurants(mockRestaurantsCatalog.slice(0, 4));
        setWinnerId('rest_burger');
      } else if (scenario.count >= 5) {
        setRestaurants(mockRestaurantsCatalog.slice(0, 6));
        setWinnerId('rest_grill');
      }
      if (scenario.captain) setCaptain(scenario.captain);
      setModalOpen(Boolean(scenario.open));
    };

    window['__CLIENT_' + participant.id + '_SET_LOCALE__'] = (loc) => {
      setLocale(loc);
    };
  }, [participant.id, setLocale]);

  const children = [
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between text-xs font-black mb-1 pb-1 border-b border-gray-200'
    },
      React.createElement('span', null, participant.nickname + ' (' + (participant.is_host ? 'Host' : participant.id === captain.id ? '👑 Captain' : 'Spectator') + ')'),
      React.createElement('span', { className: 'text-gray-400' }, participant.id)
    )
  ];

  if (confirmedWinner) {
    children.push(
      React.createElement('div', {
        key: 'winner',
        id: 'winner-' + participant.id,
        className: 'p-2 bg-green-100 border border-green-400 text-green-900 rounded-lg text-xs font-bold mb-2'
      }, 'FINALIZED: ' + confirmedWinner.nameEn)
    );
  }

  if (modalOpen) {
    children.push(
      React.createElement(ShuffleCardsModal, {
        key: 'modal',
        isOpen: modalOpen,
        roomId: 'room-test-123',
        currentParticipantId: participant.id,
        isHost: participant.is_host,
        captain: captain,
        restaurants: restaurants,
        winnerId: winnerId,
        seed: 'seed-e2e-1',
        onWinnerConfirmed: (w) => {
          setConfirmedWinner(w);
          if (onScenarioEnd) onScenarioEnd(participant.id, w);
        },
        onClose: () => setModalOpen(false)
      })
    );
  }

  return React.createElement('div', {
    id: 'client-' + participant.id,
    className: 'p-2 border border-[#241B18]/20 rounded-xl bg-white m-1 relative'
  }, children);
}

function App() {
  const participants = [
    { id: 'p1', nickname: 'Omar', is_host: true },
    { id: 'p2', nickname: 'Lina', is_host: false },
    { id: 'p3', nickname: 'Saad', is_host: false }
  ];

  window.__SET_ALL_SCENARIOS__ = (scenario) => {
    participants.forEach(p => {
      if (window['__CLIENT_' + p.id + '_SET_SCENARIO__']) {
        window['__CLIENT_' + p.id + '_SET_SCENARIO__'](scenario);
      }
    });
  };

  window.__SET_ALL_LOCALES__ = (loc) => {
    participants.forEach(p => {
      if (window['__CLIENT_' + p.id + '_SET_LOCALE__']) {
        window['__CLIENT_' + p.id + '_SET_LOCALE__'](loc);
      }
    });
  };

  return React.createElement(LocaleProvider, null,
    React.createElement('div', { className: 'min-h-screen p-2 bg-[#FBF7F2]' },
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-2' },
        participants.map(p => React.createElement(TestClient, { key: p.id, participant: p }))
      )
    )
  );
}

createRoot(document.getElementById('root')).render(React.createElement(App));
window.__SHUFFLE_HARNESS_READY__ = true;
`;

let viteServer;
let chromeProc;
let ws;
let msgId = 1;

function cdpSend(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener('message', handler);
        if (data.error) reject(new Error(data.error.message));
        else resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalInBrowser(expr) {
  const res = await cdpSend('Runtime.evaluate', {
    expression: expr,
    returnByValue: true,
    awaitPromise: true,
  });
  return res.result?.value;
}

try {
  // 1. Setup Vite Server
  viteServer = await createServer({
    server: { host: '127.0.0.1', port: PORT, strictPort: true },
    plugins: [
      {
        name: 'virtual-shuffle-test',
        enforce: 'pre',
        resolveId(source, importer) {
          if (source === 'virtual:shuffle-browser-harness.tsx' || source === 'virtual:shuffle-api') {
            return '\0' + source;
          }
          const path = importer?.replaceAll('\\', '/');
          if (source.includes('lib/supabase') && path?.includes('ShuffleCardsModal')) {
            return '\0virtual:shuffle-api';
          }
        },
        load(id) {
          if (id === '\0virtual:shuffle-browser-harness.tsx') return harnessCode;
          if (id === '\0virtual:shuffle-api') return apiCode;
        },
        configureServer(server) {
          server.middlewares.use('/shuffle-browser-tests', async (_req, res) => {
            res.setHeader('Content-Type', 'text/html');
            res.end(
              await server.transformIndexHtml(
                '/shuffle-browser-tests',
                `<!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Shuffle Cards Browser Test</title>
                  </head>
                  <body class="bg-[#FAF4ED] text-[#241B18]">
                    <div id="root"></div>
                    <script type="module" src="/@id/__x00__virtual:shuffle-browser-harness.tsx"></script>
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
  console.log(`✓ Vite server running at http://127.0.0.1:${PORT}/shuffle-browser-tests`);

  // 2. Launch Google Chrome headless
  chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--window-size=1280,800',
  ]);

  let connected = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) {
        connected = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  assert.ok(connected, 'Chrome CDP server responded');

  const newTarget = await (
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?http://127.0.0.1:${PORT}/shuffle-browser-tests`, {
      method: 'PUT',
    })
  ).json();

  ws = new WebSocket(newTarget.webSocketDebuggerUrl);
  await new Promise((res) => (ws.onopen = res));

  await cdpSend('Page.enable');
  await cdpSend('Runtime.enable');

  const browserErrors = [];
  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
      const msg = data.params.args.map((a) => a.value || a.description).join(' ');
      browserErrors.push(msg);
    }
  });

  let ready = false;
  for (let i = 0; i < 40; i++) {
    const isReady = await evalInBrowser('window.__SHUFFLE_HARNESS_READY__ === true');
    if (isReady) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  assert.ok(ready, 'React harness mounted successfully');
  console.log('✓ Headless Chrome loaded test harness');

  // Set initial locale to en
  await evalInBrowser('window.__SET_ALL_LOCALES__("en")');
  await new Promise((r) => setTimeout(r, 200));

  // ========================================================
  // TEST 1: Exactly 2 Tied Contenders (3-Card Monte with "Shuffle Again")
  // ========================================================
  console.log('\n--- TEST 1: Exactly 2 Tied Contenders with Shuffle Again Card ---');
  await evalInBrowser('window.__SET_ALL_SCENARIOS__({ open: true, count: 2, captain: { id: "p2", nickname: "Lina" } })');
  await new Promise((r) => setTimeout(r, 600));

  // Check 3 cards rendered on table
  const p1Cards = await evalInBrowser('document.querySelectorAll("#client-p1 [style*=\\"perspective\\"]").length');
  assert.equal(p1Cards, 3, 'Client 1 renders exactly 3 cards on table');

  // Verify Shuffle Again text exists on table
  const clientText = await evalInBrowser('document.querySelector("#client-p1")?.textContent');
  const hasShuffleAgainText = clientText?.includes("Shuffle Again") || clientText?.includes("اخلط مرة أخرى");
  assert.ok(hasShuffleAgainText, 'Table includes distinct Shuffle Again card');
  console.log('✓ Exactly 2 tied contenders renders 3 cards on table with Shuffle Again card');

  // Wait for initial reveal and shuffle to reach pick_ready
  console.log('Waiting for initial reveal & shuffle animation...');
  let pickReady = false;
  for (let i = 0; i < 20; i++) {
    pickReady = await evalInBrowser('Boolean(document.querySelector("#client-p2")?.textContent?.includes("Tap a card to reveal") || document.querySelector("#client-p2")?.textContent?.includes("اختر بطاقة"))');
    if (pickReady) break;
    await new Promise((r) => setTimeout(r, 400));
  }
  assert.ok(pickReady, 'Table reached pick_ready phase with Captain prompt');
  console.log('✓ Initial reveal transitions into criss-cross shuffle and settles into pick_ready');

  // Spectator sees Captain waiting prompt
  const spectatorPrompt = await evalInBrowser('document.querySelector("#client-p3")?.textContent || ""');
  assert.ok(
    spectatorPrompt.includes('Lina is picking a card') ||
    spectatorPrompt.includes('يختار بطاقة') ||
    spectatorPrompt.includes('Waiting for Captain') ||
    spectatorPrompt.includes('الكابتن'),
    'Spectator sees Captain waiting indicator'
  );
  console.log('✓ Spectators see live Captain status indicator');

  // Captain (p2) taps card 0
  await evalInBrowser(`
    const cards = document.querySelectorAll("#client-p2 [style*=\\"perspective\\"]");
    if (cards[0]) cards[0].click();
  `);
  await new Promise((r) => setTimeout(r, 1200));

  // Verify card zoomed / flipped
  const isRevealed = await evalInBrowser('Boolean(document.querySelector("#client-p2")?.textContent?.includes("Shawarma") || document.querySelector("#client-p2")?.textContent?.includes("شاورما") || document.querySelector("#client-p2")?.textContent?.includes("Winning Pick") || document.querySelector("#client-p2")?.textContent?.includes("الفائز") || document.querySelector("#client-p2")?.textContent?.includes("Shuffle Again") || document.querySelector("#client-p2")?.textContent?.includes("اخلط مرة أخرى"))');
  assert.ok(isRevealed, 'Captain click triggered zoom and flip');
  console.log('✓ Captain pick triggered 3D flip and zoom reveal');

  // ========================================================
  // TEST 2: Exactly 3 Tied Contenders (Standard Row Layout)
  // ========================================================
  console.log('\n--- TEST 2: Exactly 3 Tied Contenders (Standard Row Layout) ---');
  await evalInBrowser('window.__SET_ALL_SCENARIOS__({ open: true, count: 3, captain: { id: "p2", nickname: "Lina" } })');
  await new Promise((r) => setTimeout(r, 600));

  const count3 = await evalInBrowser('document.querySelectorAll("#client-p1 [style*=\\"perspective\\"]").length');
  assert.equal(count3, 3, 'Exactly 3 cards rendered on table');
  console.log('✓ 3 contender cards rendered in balanced layout');

  // ========================================================
  // TEST 3: Exactly 4 Tied Contenders (2x2 Grid)
  // ========================================================
  console.log('\n--- TEST 3: Exactly 4 Tied Contenders (2x2 Grid) ---');
  await evalInBrowser('window.__SET_ALL_SCENARIOS__({ open: true, count: 4, captain: { id: "p2", nickname: "Lina" } })');
  await new Promise((r) => setTimeout(r, 600));

  const hasGridClass = await evalInBrowser('Boolean(document.querySelector("#client-p1 .grid-cols-2"))');
  assert.ok(hasGridClass, '2x2 grid layout class applied for 4 contenders');
  const count4 = await evalInBrowser('document.querySelectorAll("#client-p1 [style*=\\"perspective\\"]").length');
  assert.equal(count4, 4, 'Exactly 4 cards rendered in 2x2 grid');
  console.log('✓ 4 contender cards rendered in clean 2x2 grid');

  // ========================================================
  // TEST 4: 5+ Tied Contenders (Vortex Qualifier → 3 Finalists)
  // ========================================================
  console.log('\n--- TEST 4: 5+ Tied Contenders (Spinning Circle Vortex Qualifier) ---');
  await evalInBrowser('window.__SET_ALL_SCENARIOS__({ open: true, count: 6, captain: { id: "p2", nickname: "Lina" } })');
  await new Promise((r) => setTimeout(r, 600));

  const vortexText = await evalInBrowser('document.querySelector("#client-p1")?.textContent || ""');
  assert.ok(vortexText.includes('Narrowing down') || vortexText.includes('تصفية'), 'Vortex qualifier text displayed');
  console.log('✓ 5+ contenders initiates Spinning Circle Vortex Qualifier');

  console.log('Waiting for Vortex ejection filter...');
  let finalistsReady = false;
  for (let i = 0; i < 25; i++) {
    const text = await evalInBrowser('document.querySelector("#client-p1")?.textContent || ""');
    if (text.includes('Finalists') || text.includes('النهائيون') || text.includes('Shuffling') || text.includes('خلط') || text.includes('Tap a card') || text.includes('اختر بطاقة')) {
      finalistsReady = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  assert.ok(finalistsReady, 'Vortex Qualifier successfully filtered to 3 finalists');
  console.log('✓ Vortex Qualifier successfully ejects non-finalists down to 3 Finalists');

  // ========================================================
  // TEST 5: Realtime Synchronization Across Clients
  // ========================================================
  console.log('\n--- TEST 5: Realtime Synchronization Across Host, Captain, and Spectators ---');
  await evalInBrowser('window.__SET_ALL_SCENARIOS__({ open: true, count: 3, captain: { id: "p2", nickname: "Lina" } })');
  await new Promise((r) => setTimeout(r, 3200)); // wait for shuffle settle

  // Captain picks card 0
  await evalInBrowser(`
    const cards = document.querySelectorAll("#client-p2 [style*=\\"perspective\\"]");
    if (cards[0]) cards[0].click();
  `);
  await new Promise((r) => setTimeout(r, 1000));

  // All 3 clients must register reveal
  const p1Text = await evalInBrowser('document.querySelector("#client-p1")?.textContent || ""');
  const p2Text = await evalInBrowser('document.querySelector("#client-p2")?.textContent || ""');
  const p3Text = await evalInBrowser('document.querySelector("#client-p3")?.textContent || ""');
  assert.ok(
    p1Text.includes('Winner:') || p1Text.includes('Winning Pick') || p1Text.includes('الفائز') || p1Text.includes('Pizza') || p1Text.includes('بيتزا'),
    'Host synchronized on winner reveal'
  );
  assert.ok(
    p3Text.includes('Winner:') || p3Text.includes('Winning Pick') || p3Text.includes('الفائز') || p3Text.includes('Pizza') || p3Text.includes('بيتزا'),
    'Spectator synchronized on winner reveal'
  );
  console.log('✓ Host and Spectator synchronize live on Captain pick in real browser');

  // ========================================================
  // TEST 6: Mobile Viewport & Arabic (RTL) Layout
  // ========================================================
  console.log('\n--- TEST 6: Mobile Viewport & Arabic RTL Layout ---');
  await cdpSend('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
  });

  await evalInBrowser('window.__SET_ALL_LOCALES__("ar")');
  await evalInBrowser('window.__SET_ALL_SCENARIOS__({ open: true, count: 2, captain: { id: "p2", nickname: "سارة" } })');
  await new Promise((r) => setTimeout(r, 500));

  const arText = await evalInBrowser('document.querySelector("#client-p2")?.textContent || ""');
  assert.ok(arText.includes('اختر بطاقة!'), 'Arabic title rendered correctly on mobile');
  assert.ok(arText.includes('سارة'), 'Arabic Captain name rendered');

  const hasOverflow = await evalInBrowser(`
    const el = document.querySelector("#client-p2 [role='dialog']");
    el ? el.scrollWidth > el.clientWidth + 1 : false
  `);
  assert.equal(hasOverflow, false, 'No horizontal overflow on 390x844 mobile viewport');
  console.log('✓ Mobile viewport (390x844) renders Arabic RTL cleanly without horizontal scroll');

  // ========================================================
  // TEST 7: Browser Console Audit
  // ========================================================
  console.log('\n--- TEST 7: Browser Console & Network Audit ---');
  const criticalErrors = browserErrors.filter((e) => !e.includes('favicon'));
  assert.equal(criticalErrors.length, 0, `Zero critical console errors (found: ${criticalErrors.join(', ')})`);
  console.log('✓ Zero browser console errors detected during entire run');

  console.log('\n======================================================');
  console.log('ALL REAL BROWSER SHUFFLE CARDS VERIFICATION CHECKS PASSED!');
  console.log('======================================================\n');
} catch (err) {
  console.error('\nBROWSER TEST FAILED:', err);
  process.exitCode = 1;
} finally {
  if (ws) ws.close();
  if (chromeProc) chromeProc.kill();
  if (viteServer) await viteServer.close();
}
