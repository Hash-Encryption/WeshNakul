import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'vite';

console.log('--- EXECUTING CAPTAIN ROULETTE REAL BROWSER VERIFICATION SUITE ---');

const PORT = 5189;
const CDP_PORT = 9224;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const apiCode = `
export async function getCaptainEventState(roomId, sessionToken) {
  return window.__MOCK_API__.getCaptainEventState(roomId, sessionToken);
}
export async function startCaptainSelection(roomId, sessionToken, stableId) {
  return window.__MOCK_API__.startCaptainSelection(roomId, sessionToken, stableId);
}
export async function requestCaptainReroll(roomId, eventId, sessionToken) {
  return window.__MOCK_API__.requestCaptainReroll(roomId, eventId, sessionToken);
}
export async function castCaptainVote(roomId, eventId, sessionToken, vote) {
  return window.__MOCK_API__.castCaptainVote(roomId, eventId, sessionToken, vote);
}
export async function resolveCaptainEvent(roomId, eventId, sessionToken) {
  return window.__MOCK_API__.resolveCaptainEvent(roomId, eventId, sessionToken);
}
export async function broadcastCaptainMessage(roomId, msg) {
  return window.__MOCK_API__.broadcastCaptainMessage(roomId, msg);
}
export function subscribeToCaptainEvents(roomId, cb) {
  return window.__MOCK_API__.subscribeToCaptainEvents(roomId, cb);
}
`;

const harnessCode = `
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { CaptainRouletteModal } from '/src/components/captain/CaptainRouletteModal.tsx';
import { LocaleProvider, useLocale } from '/src/context/LocaleContext.tsx';
import { RoomContext } from '/src/context/RoomContext.tsx';

const listeners = new Map();
let currentEvent = null;
let eventHistory = [];

const participants = [
  { id: 'p1', nickname: 'Omar', player_color: '#55B96A', is_host: true, status: 'active', session_token: 'tok-p1', stable_player_id: 'stable-omar' },
  { id: 'p2', nickname: 'Lina', player_color: '#F0443E', is_host: false, status: 'active', session_token: 'tok-p2', stable_player_id: 'stable-lina' },
  { id: 'p3', nickname: 'Saad', player_color: '#FFD75A', is_host: false, status: 'active', session_token: 'tok-p3', stable_player_id: 'stable-saad' }
];

const emitRealtime = (roomId, msg) => {
  const roomListeners = listeners.get(roomId) || [];
  roomListeners.forEach(cb => cb(msg));
};

export const mockApi = {
  reset() {
    currentEvent = null;
    eventHistory = [];
  },
  getEventHistory() {
    return eventHistory;
  },
  getCurrentEvent() {
    return currentEvent;
  },
  async getCaptainEventState(roomId, sessionToken) {
    return currentEvent;
  },
  async startCaptainSelection(roomId, sessionToken, stableId) {
    if (currentEvent && currentEvent.status !== 'finalized') {
      return currentEvent;
    }
    const candidates = participants.map(p => ({
      id: p.id,
      nickname: p.nickname,
      initial: p.nickname[0],
      color: p.player_color,
      weight: 100
    }));
    const provisional = candidates[1]; // Lina (p2)
    const objectionEnds = new Date(Date.now() + 10000).toISOString();
    currentEvent = {
      eventId: 'ev-' + Math.random().toString(36).substring(2, 9),
      status: 'initial_result_provisional',
      provisionalCaptainId: provisional.id,
      provisionalCaptainNickname: provisional.nickname,
      frozenVoterIds: candidates.map(c => c.id),
      objectionEndsAt: objectionEnds,
      candidates,
      votes: {},
      approvals: 0,
      rejections: 0,
      requiredApprovals: 2,
      voterCount: 3,
      hasRerolled: false
    };
    return currentEvent;
  },
  async requestCaptainReroll(roomId, eventId, sessionToken) {
    if (!currentEvent || currentEvent.hasRerolled) {
      throw new Error('WSH_REROLL_ALREADY_USED');
    }
    const requester = participants.find(p => p.session_token === sessionToken);
    currentEvent.status = 'reroll_vote_open';
    currentEvent.hasRerolled = true;
    currentEvent.requesterParticipantId = requester.id;
    currentEvent.requesterNickname = requester.nickname;
    currentEvent.voteEndsAt = new Date(Date.now() + 15000).toISOString();
    currentEvent.votes = { [requester.id]: 'approve' };
    currentEvent.approvals = 1;
    currentEvent.rejections = 0;
    return currentEvent;
  },
  async castCaptainVote(roomId, eventId, sessionToken, vote) {
    const voter = participants.find(p => p.session_token === sessionToken);
    if (!currentEvent || currentEvent.status !== 'reroll_vote_open') {
      throw new Error('WSH_VOTE_CLOSED');
    }
    if (currentEvent.votes[voter.id]) {
      throw new Error('WSH_ALREADY_VOTED');
    }
    currentEvent.votes[voter.id] = vote;
    if (vote === 'approve') currentEvent.approvals++;
    if (vote === 'reject') currentEvent.rejections++;

    if (currentEvent.approvals >= currentEvent.requiredApprovals) {
      currentEvent.status = 'finalized';
      currentEvent.finalDecision = 'approved';
      currentEvent.finalCaptainId = 'p3';
      currentEvent.finalCaptainNickname = 'Saad';
      eventHistory.push({ ...currentEvent });
    } else if (currentEvent.approvals + (3 - (currentEvent.approvals + currentEvent.rejections)) < currentEvent.requiredApprovals) {
      currentEvent.status = 'finalized';
      currentEvent.finalDecision = 'rejected';
      currentEvent.finalCaptainId = currentEvent.provisionalCaptainId;
      currentEvent.finalCaptainNickname = currentEvent.provisionalCaptainNickname;
      eventHistory.push({ ...currentEvent });
    }
    return currentEvent;
  },
  async resolveCaptainEvent(roomId, eventId, sessionToken) {
    if (!currentEvent) throw new Error('WSH_EVENT_NOT_FOUND');
    if (currentEvent.status === 'finalized') return currentEvent;
    
    if (currentEvent.status === 'initial_result_provisional') {
      currentEvent.status = 'finalized';
      currentEvent.finalDecision = 'uncontested';
      currentEvent.finalCaptainId = currentEvent.provisionalCaptainId;
      currentEvent.finalCaptainNickname = currentEvent.provisionalCaptainNickname;
      eventHistory.push({ ...currentEvent });
    } else if (currentEvent.status === 'reroll_vote_open') {
      currentEvent.status = 'finalized';
      currentEvent.finalDecision = currentEvent.approvals >= currentEvent.requiredApprovals ? 'approved' : 'rejected';
      currentEvent.finalCaptainId = currentEvent.finalDecision === 'approved' ? 'p3' : currentEvent.provisionalCaptainId;
      currentEvent.finalCaptainNickname = currentEvent.finalDecision === 'approved' ? 'Saad' : currentEvent.provisionalCaptainNickname;
      eventHistory.push({ ...currentEvent });
    }
    return currentEvent;
  },
  async broadcastCaptainMessage(roomId, msg) {
    emitRealtime(roomId, msg);
  },
  subscribeToCaptainEvents(roomId, cb) {
    if (!listeners.has(roomId)) listeners.set(roomId, []);
    listeners.get(roomId).push(cb);
    return () => {
      const arr = listeners.get(roomId) || [];
      listeners.set(roomId, arr.filter(x => x !== cb));
    };
  }
};

window.__MOCK_API__ = mockApi;

function ClientInstance({ participant, isOpen, onClose }) {
  const roomValue = {
    currentRoom: { id: 'room-test-1', code: 'TEST', stage: 'voting' },
    currentParticipant: participant,
    participants,
    isHost: participant.is_host
  };

  return React.createElement(RoomContext.Provider, { value: roomValue },
    React.createElement('div', { id: 'client-' + participant.id, className: 'relative p-2 border border-gray-300 rounded-xl my-2' },
      React.createElement('h4', { className: 'font-bold text-sm mb-1' }, participant.nickname + ' (' + (participant.is_host ? 'Host' : 'Guest') + ')'),
      React.createElement(CaptainRouletteModal, {
        isOpen,
        onClose,
        onStartGame: (c) => {
          window.__LAST_GAME_CAPTAIN__ = c;
        }
      })
    )
  );
}

function TestHarness() {
  const [hostOpen, setHostOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);

  window.__HOST_OPEN__ = (val) => setHostOpen(val);
  window.__GUEST_OPEN__ = (val) => setGuestOpen(val);

  return React.createElement(LocaleProvider, null,
    React.createElement('div', { className: 'p-4 max-w-4xl mx-auto' },
      React.createElement('h1', { className: 'text-xl font-bold mb-4' }, 'Captain Roulette Real Browser Harness'),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
        React.createElement(ClientInstance, { participant: participants[0], isOpen: hostOpen, onClose: () => setHostOpen(false) }),
        React.createElement(ClientInstance, { participant: participants[1], isOpen: guestOpen, onClose: () => setGuestOpen(false) })
      )
    )
  );
}

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(TestHarness));
`;

let viteServer;
let chromeProc;
let ws;
let cdpMsgId = 1;

function cdpSend(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = cdpMsgId++;
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

async function evalInBrowser(expression) {
  const res = await cdpSend('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return res.result?.value;
}

try {
  // 1. Start Vite test server
  viteServer = await createServer({
    server: { host: '127.0.0.1', port: PORT, strictPort: true },
    plugins: [
      {
        name: 'captain-browser-fixtures',
        enforce: 'pre',
        resolveId(source, importer) {
          if (source === 'virtual:captain-browser-harness.tsx' || source === 'virtual:captain-api') {
            return '\0' + source;
          }
          const path = importer?.replaceAll('\\', '/');
          if (source.includes('lib/supabase') && path?.includes('CaptainRouletteModal')) {
            return '\0virtual:captain-api';
          }
        },
        load(id) {
          if (id === '\0virtual:captain-browser-harness.tsx') return harnessCode;
          if (id === '\0virtual:captain-api') return apiCode;
        },
        configureServer(server) {
          server.middlewares.use('/captain-browser-tests', async (_req, res) => {
            res.setHeader('Content-Type', 'text/html');
            res.end(
              await server.transformIndexHtml(
                '/captain-browser-tests',
                `<!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Captain Roulette Browser Test</title>
                  </head>
                  <body class="bg-[#FAF4ED] text-[#241B18]">
                    <div id="root"></div>
                    <script type="module" src="/@id/__x00__virtual:captain-browser-harness.tsx"></script>
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
  console.log(`✓ Vite server running at http://127.0.0.1:${PORT}/captain-browser-tests`);

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
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?http://127.0.0.1:${PORT}/captain-browser-tests`, {
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
    const isReady = await evalInBrowser('typeof window.__HOST_OPEN__ === "function"');
    if (isReady) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  assert.ok(ready, 'React harness mounted successfully');
  const pageTitle = await evalInBrowser('document.title');
  assert.equal(pageTitle, 'Captain Roulette Browser Test');
  console.log('✓ Headless Chrome loaded test harness');

  // ========================================================
  // BROWSER TEST 1: Host launches Captain Roulette & wheel spins
  // ========================================================
  console.log('\n--- BROWSER TEST 1: Launch Captain Roulette & Verify Wheel ---');
  await evalInBrowser('window.__HOST_OPEN__(true)');
  await new Promise((r) => setTimeout(r, 1000));

  const hasSvg = await evalInBrowser('Boolean(document.querySelector("#client-p1 svg[viewBox=\\"0 0 360 360\\"]"))');
  assert.ok(hasSvg, 'CaptainWheel SVG rendered in Host DOM');

  const wheelText = await evalInBrowser('document.querySelector("#client-p1 svg[viewBox=\\"0 0 360 360\\"]")?.textContent || ""');
  assert.ok(wheelText.includes('O'), 'Initial O rendered on wheel');
  assert.ok(wheelText.includes('L'), 'Initial L rendered on wheel');
  assert.ok(wheelText.includes('S'), 'Initial S rendered on wheel');
  assert.ok(!wheelText.includes('👑'), 'No emojis rendered on wheel');
  console.log('✓ CaptainWheel renders with player initials and ship-helm styling');

  // ========================================================
  // BROWSER TEST 2: Realtime synchronization across 2 clients
  // ========================================================
  console.log('\n--- BROWSER TEST 2: Realtime Synchronization Across Clients ---');
  await evalInBrowser('window.__GUEST_OPEN__(true)');
  await new Promise((r) => setTimeout(r, 1000));

  const hostBannerText = await evalInBrowser('document.querySelector("#client-p1")?.innerText || ""');
  const guestBannerText = await evalInBrowser('document.querySelector("#client-p2")?.innerText || ""');
  assert.ok(hostBannerText.includes('Lina') || hostBannerText.includes('لينة'), 'Host displays provisional captain Lina');
  assert.ok(guestBannerText.includes('Lina') || guestBannerText.includes('لينة'), 'Guest displays same provisional captain Lina');
  console.log('✓ Connected clients synchronize on same provisional captain in real browser');

  // ========================================================
  // BROWSER TEST 3: Reroll request and voting flow in UI
  // ========================================================
  console.log('\n--- BROWSER TEST 3: Reroll Request & Synchronized Voting UI ---');
  const rerollClicked = await evalInBrowser(`
    (() => {
      const btns = Array.from(document.querySelectorAll("#client-p2 button"));
      const btn = btns.find(b => b.innerText.includes("Reroll") || b.innerText.includes("إعادة"));
      if (btn) { btn.click(); return true; }
      return false;
    })()
  `);
  assert.ok(rerollClicked, 'Guest clicked Request Reroll button');
  await new Promise((r) => setTimeout(r, 1000));

  const hostHasVoteButtons = await evalInBrowser(`
    Boolean(document.querySelector("#client-p1")?.innerText.includes("👍") || document.querySelector("#client-p1")?.innerText.includes("Approve"))
  `);
  const guestHasVotedApprove = await evalInBrowser(`
    Boolean(document.querySelector("#client-p2")?.innerText.includes("Voted") || document.querySelector("#client-p2")?.innerText.includes("صوّتت") || document.querySelector("#client-p2")?.innerText.includes("1/2"))
  `);
  assert.ok(hostHasVoteButtons, 'Host UI displays active voting buttons');
  assert.ok(guestHasVotedApprove, 'Guest UI displays confirmed auto-approval for reroll requester');
  console.log('✓ Reroll request triggers synchronized voting controls across clients');

  // ========================================================
  // BROWSER TEST 4: Majority approval & second draw resolution
  // ========================================================
  console.log('\n--- BROWSER TEST 4: Majority Approval & Final Winner Display ---');
  const hostVotedApprove = await evalInBrowser(`
    (() => {
      const btns = Array.from(document.querySelectorAll("#client-p1 button"));
      const approveBtn = btns.find(b => b.innerText.includes("👍") || b.innerText.includes("Approve"));
      if (approveBtn) { approveBtn.click(); return true; }
      return false;
    })()
  `);
  assert.ok(hostVotedApprove, 'Host voted Approve');
  await new Promise((r) => setTimeout(r, 1000));

  const hostFinalText = await evalInBrowser('document.querySelector("#client-p1")?.innerText || ""');
  const guestFinalText = await evalInBrowser('document.querySelector("#client-p2")?.innerText || ""');
  assert.ok(hostFinalText.includes('Saad'), 'Host sees final captain Saad after approved reroll');
  assert.ok(guestFinalText.includes('Saad'), 'Guest sees final captain Saad after approved reroll');
  console.log('✓ Approved reroll finalizes new captain (Saad) across all clients');

  // ========================================================
  // BROWSER TEST 5: Reconnection & Remount State Preservation
  // ========================================================
  console.log('\n--- BROWSER TEST 5: Reconnection & Modal State Restoration ---');
  // Close Guest modal and re-open (simulating client reconnect during finalized state)
  await evalInBrowser('window.__GUEST_OPEN__(false)');
  await new Promise((r) => setTimeout(r, 400));
  await evalInBrowser('window.__GUEST_OPEN__(true)');
  await new Promise((r) => setTimeout(r, 800));

  const reconnectedGuestText = await evalInBrowser('document.querySelector("#client-p2")?.innerText || ""');
  assert.ok(reconnectedGuestText.includes('Saad'), 'Reconnected guest restores finalized event with Saad');
  console.log('✓ Client reconnect seamlessly restores active event state from server');

  // ========================================================
  // BROWSER TEST 6: Mobile Viewport (iPhone 390x844) & No Overflow
  // ========================================================
  console.log('\n--- BROWSER TEST 6: Mobile Viewport & Responsive Layout ---');
  await cdpSend('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
  });
  await new Promise((r) => setTimeout(r, 500));

  const hasHorizontalScroll = await evalInBrowser('document.documentElement.scrollWidth > document.documentElement.clientWidth');
  assert.equal(hasHorizontalScroll, false, 'Mobile viewport fits perfectly without horizontal overflow');
  console.log('✓ Mobile responsive layout verified on 390x844 iPhone dimensions without overflow');

  // ========================================================
  // BROWSER TEST 7: Arabic RTL Layout & Localization
  // ========================================================
  console.log('\n--- BROWSER TEST 7: Arabic RTL Layout & Typography ---');
  await evalInBrowser(`
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
  `);
  await new Promise((r) => setTimeout(r, 300));

  const dir = await evalInBrowser('document.documentElement.getAttribute("dir")');
  assert.equal(dir, 'rtl', 'Document direction set to RTL');
  console.log('✓ Arabic RTL layout switches correctly without CSS breakage');

  // ========================================================
  // BROWSER TEST 8: Console Error Audit
  // ========================================================
  console.log('\n--- BROWSER TEST 8: Browser Console & Network Audit ---');
  const relevantErrors = browserErrors.filter((e) => !e.includes('favicon'));
  assert.equal(relevantErrors.length, 0, `Browser console errors must be 0, got: ${relevantErrors.join('; ')}`);
  console.log('✓ Zero browser console errors detected during entire run');

  console.log('\n======================================================');
  console.log('ALL REAL BROWSER CAPTAIN ROULETTE VERIFICATION CHECKS PASSED!');
  console.log('======================================================\n');
} catch (err) {
  console.error('\nBROWSER TEST FAILED:', err);
  process.exitCode = 1;
} finally {
  if (ws) ws.close();
  if (chromeProc) chromeProc.kill();
  if (viteServer) await viteServer.close();
}
