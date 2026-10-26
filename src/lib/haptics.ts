import confetti from 'canvas-confetti';

let audioCtx: AudioContext | null = null;
let switchEl: HTMLInputElement | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Lightweight Web Audio synthesized tactile click/pop.
 * 15ms sine/triangle oscillator ramp for crisp mechanical feel without external files.
 */
export function playTactilePop(freq = 180): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.35), now + 0.015);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.016);
  } catch {
    // safe fallback
  }
}

/**
 * Triggers native iOS 18+ Taptic Engine impact via switch input click,
 * with standard navigator.vibrate fallback on Android/Chrome.
 */
export function triggerHaptic(duration = 12): void {
  // 1. iOS 18+ WebKit Switch Taptic impact
  try {
    if (typeof document !== 'undefined') {
      if (!switchEl) {
        const label = document.createElement('label');
        label.setAttribute('aria-hidden', 'true');
        label.style.position = 'fixed';
        label.style.opacity = '0';
        label.style.pointerEvents = 'none';
        label.style.top = '-9999px';
        label.style.left = '-9999px';
        label.style.zIndex = '-9999';

        switchEl = document.createElement('input');
        switchEl.type = 'checkbox';
        switchEl.setAttribute('switch', '');
        switchEl.tabIndex = -1;

        label.appendChild(switchEl);
        document.body.appendChild(label);
      }
      switchEl.click();
    }
  } catch {
    // safe fallback
  }

  // 2. Android / Chrome Vibrate API fallback
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(duration);
    }
  } catch {
    // safe fallback
  }
}

/**
 * Touch-point micro confetti burst originating right at the tap coordinates.
 */
export function triggerTapBurst(
  e?: React.MouseEvent | React.PointerEvent | MouseEvent | TouchEvent,
): void {
  try {
    let x = 0.5;
    let y = 0.6;
    if (e && 'clientX' in e && typeof window !== 'undefined') {
      x = Math.max(0.05, Math.min(0.95, e.clientX / window.innerWidth));
      y = Math.max(0.05, Math.min(0.95, e.clientY / window.innerHeight));
    } else if (e && 'touches' in e && e.touches[0] && typeof window !== 'undefined') {
      x = Math.max(0.05, Math.min(0.95, e.touches[0].clientX / window.innerWidth));
      y = Math.max(0.05, Math.min(0.95, e.touches[0].clientY / window.innerHeight));
    }

    confetti({
      particleCount: 14,
      spread: 45,
      startVelocity: 18,
      scalar: 0.75,
      origin: { x, y },
      colors: ['#F0443E', '#FFD75A', '#55B96A', '#73C8EA'],
    });
  } catch {
    // safe fallback
  }
}

/**
 * Combined tactile feedback for interactive UI cards and buttons.
 */
export function triggerSelectionFeedback(
  e?: React.MouseEvent | React.PointerEvent,
  freq = 200,
  withBurst = false,
): void {
  triggerHaptic(12);
  playTactilePop(freq);
  if (withBurst && e) {
    triggerTapBurst(e);
  }
}
