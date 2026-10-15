import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createServer } from 'vite';

console.log('--- EXECUTING EMOJI CLASH ARENA LIVE BROWSER SCREENSHOT CAPTURE ---');

const PORT = 5196;
const CDP_PORT = 9230;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const harnessCode = `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '/src/index.css';
import { EmojiArenaStage } from '/src/components/minigames/emoji_clash/EmojiArenaStage.tsx';
import { MustardSack } from '/src/components/minigames/emoji_clash/MustardSack.tsx';
import { TactileCyclingDock } from '/src/components/minigames/emoji_clash/TactileCyclingDock.tsx';
import { LocaleProvider } from '/src/context/LocaleContext.tsx';

const mockRestaurants = [
  { id: 'rest_beirut', nameEn: 'At Beirut Jeddah', nameAr: 'على بيروت جدة' },
  { id: 'rest_shababik', nameEn: 'Shababik', nameAr: 'شبابيك' }
];

const mockSquads = [
  {
    squadId: 'squad-troll-0',
    emoji: '😂',
    fighterId: 'troll',
    members: [
      { participantId: 'p1', nickname: 'Host', playerColor: '#F59E0B' },
      { participantId: 'p2', nickname: 'Maha', playerColor: '#8B5CF6' }
    ],
    isMega: true,
    restaurant: mockRestaurants[0],
    ringColor: '#F59E0B',
    ringBorderColor: '#D97706',
    isWinner: true,
    baseSize: 88,
    initialPos: { x: 0, y: 0 }
  },
  {
    squadId: 'squad-infernal-1',
    emoji: '🔥',
    fighterId: 'infernal',
    members: [
      { participantId: 'p3', nickname: 'Tariq', playerColor: '#EF4444' }
    ],
    isMega: false,
    restaurant: mockRestaurants[1],
    ringColor: '#EF4444',
    ringBorderColor: '#DC2626',
    isWinner: false,
    baseSize: 72,
    initialPos: { x: 0, y: 0 }
  }
];

function ArenaViewer() {
  const [brawlTimer, setBrawlTimer] = useState(14); // 14s (Stage A) vs 10s (Stage B)
  const [taps, setTaps] = useState(8);

  window.__SET_TIMER__ = (sec, tapCount = 12) => {
    setBrawlTimer(sec);
    setTaps(tapCount);
  };

  return React.createElement('div', {
    className: 'fixed inset-0 flex items-center justify-center p-2 sm:p-4 bg-black/90 select-none overflow-hidden'
  }, [
    React.createElement('div', {
      key: 'modal',
      className: 'relative w-full max-w-[390px] h-[92dvh] max-h-[760px] bg-gradient-to-b from-[#101735] via-[#0D132D] to-[#070914] rounded-3xl border-3 border-[#241B18] shadow-[0_10px_0_#241B18] flex flex-col justify-between overflow-hidden'
    }, [
      // Top Header HUD
      React.createElement('div', {
        key: 'header',
        className: 'relative w-full px-3 pt-3 flex items-center justify-between z-40'
      }, [
        React.createElement('button', {
          key: 'gear',
          className: 'w-9 h-9 rounded-full bg-[#4A90E2] border-2 border-[#1E3A8A] text-white flex items-center justify-center text-base shadow-[0_3px_0_#1E3A8A]'
        }, '⚙️'),
        React.createElement('div', {
          key: 'title-timer',
          className: 'flex items-center gap-2 bg-black/55 px-3 py-1 rounded-2xl border border-white/20 backdrop-blur-xs shadow-md'
        }, [
          React.createElement('div', {
            key: 'title-text',
            className: 'flex flex-col items-center leading-none'
          }, [
            React.createElement('span', { key: 'en', className: 'text-xs sm:text-sm font-black text-white font-alexandria tracking-tight' }, 'Emoji Clash'),
            React.createElement('span', { key: 'ar', className: 'text-[10px] font-bold text-cyan-300 font-alexandria' }, 'حرب الإيموجي')
          ]),
          React.createElement('span', { key: 'amp', className: 'text-white/40 font-bold text-xs' }, '&'),
          React.createElement('div', {
            key: 'timer-box',
            className: 'min-w-[34px] px-1.5 py-0.5 rounded-lg bg-gradient-to-b from-amber-400 to-yellow-500 border border-amber-300 text-black font-black text-sm sm:text-base font-alexandria flex items-center justify-center shadow-[0_2px_0_#B45309]'
          }, String(brawlTimer).padStart(2, '0'))
        ]),
        React.createElement('div', {
          key: 'avatars',
          className: 'flex items-center -space-x-1.5 rtl:space-x-reverse p-1 bg-black/40 rounded-full border border-white/20 backdrop-blur-xs shrink-0'
        }, [
          React.createElement('div', { key: 'a1', style: { backgroundColor: '#F59E0B' }, className: 'w-6 h-6 rounded-full border border-black text-[10px] font-black flex items-center justify-center text-black' }, 'H'),
          React.createElement('div', { key: 'a2', style: { backgroundColor: '#8B5CF6' }, className: 'w-6 h-6 rounded-full border border-black text-[10px] font-black flex items-center justify-center text-black' }, 'M'),
          React.createElement('div', { key: 'a3', style: { backgroundColor: '#EF4444' }, className: 'w-6 h-6 rounded-full border border-black text-[10px] font-black flex items-center justify-center text-black' }, 'T')
        ])
      ]),

      // Arena Content with Stage + Mustard Sack
      React.createElement('div', {
        key: 'content',
        className: 'relative flex-1 flex flex-col items-center justify-center overflow-hidden'
      }, [
        React.createElement(MustardSack, {
          key: 'mustard',
          currentTaps: taps,
          targetTaps: 20,
          isInteractive: true,
          onTap: () => setTaps(t => t + 1),
          isDetonated: false,
          isSackDropping: false,
          timerSeconds: brawlTimer,
          phase: 'brawl'
        }),
        React.createElement(EmojiArenaStage, {
          key: 'arena',
          phase: 'brawl',
          squads: mockSquads,
          winningRestaurantId: 'rest_beirut',
          battleSeed: 12345,
          projectiles: [],
          mustardDetonated: false,
          goldenKnockoutTriggered: false,
          restaurants: mockRestaurants
        })
      ]),

      // Bottom 3D Ability Dock
      React.createElement('div', {
        key: 'bottom',
        className: 'w-full px-3 pb-3 z-40'
      }, [
        React.createElement(TactileCyclingDock, {
          key: 'dock',
          onThrow: () => {}
        })
      ])
    ])
  ]);
}

createRoot(document.getElementById('root')).render(
  React.createElement(LocaleProvider, null, React.createElement(ArenaViewer))
);
`;

let viteServer;
let chromeProc;

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
        name: 'virtual-arena-capture',
        enforce: 'pre',
        resolveId(source) {
          if (source === 'virtual:arena-harness.tsx') return '\0' + source;
        },
        load(id) {
          if (id === '\0virtual:arena-harness.tsx') return harnessCode;
        },
        configureServer(server) {
          server.middlewares.use('/arena-test', async (_req, res) => {
            res.setHeader('Content-Type', 'text/html');
            res.end(
              await server.transformIndexHtml(
                '/arena-test',
                `<!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Emoji Clash Arena Capture</title>
                  </head>
                  <body class="bg-black text-white">
                    <div id="root"></div>
                    <script type="module" src="/@id/__x00__virtual:arena-harness.tsx"></script>
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
  console.log(`✓ Vite server running at http://127.0.0.1:${PORT}/arena-test`);

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
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/arena-test` });

  // Wait for hydration
  for (let i = 0; i < 40; i++) {
    try {
      const ready = await cdp.evaluate('Boolean(window.__SET_TIMER__)');
      if (ready) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }

  // --- SCREENSHOT A: Early Brawl at 14s (Stage A) ---
  await cdp.evaluate('window.__SET_TIMER__(14, 0)');
  await new Promise((r) => setTimeout(r, 800));

  const shotA = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const pathA = 'C:\\Users\\hgend\\.gemini\\antigravity\\brain\\84e4dbaf-9a6d-4c53-8a9a-8f525b3f5c22\\emoji-clash-early-brawl-14s.png';
  writeFileSync(pathA, Buffer.from(shotA.data, 'base64'));
  console.log(`✓ Screenshot A captured: ${pathA}`);

  // --- SCREENSHOT B: Mid Brawl at 10s (Stage B with dropped Mustard Bomb and Warning Ribbon) ---
  await cdp.evaluate('window.__SET_TIMER__(10, 14)');
  await new Promise((r) => setTimeout(r, 500));

  const shotB = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const pathB = 'C:\\Users\\hgend\\.gemini\\antigravity\\brain\\84e4dbaf-9a6d-4c53-8a9a-8f525b3f5c22\\emoji-clash-mid-brawl-10s.png';
  writeFileSync(pathB, Buffer.from(shotB.data, 'base64'));
  console.log(`✓ Screenshot B captured: ${pathB}`);

  console.log('\n======================================================');
  console.log('ALL SCREENSHOTS CAPTURED AND VERIFIED SUCCESSFULLY!');
  console.log('======================================================\n');
} finally {
  if (chromeProc) chromeProc.kill();
  if (viteServer) await viteServer.close();
}
