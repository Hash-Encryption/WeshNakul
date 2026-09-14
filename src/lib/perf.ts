// Lightweight performance instrumentation for development and testing

interface PerfRecord {
  name: string;
  durationMs: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface PerfMetrics {
  records: PerfRecord[];
  counters: Record<string, number>;
  record: (name: string, durationMs: number, metadata?: Record<string, unknown>) => void;
  increment: (counterName: string) => void;
  start: (name: string, metadata?: Record<string, unknown>) => () => void;
  getSummary: () => Record<string, unknown>;
  clear: () => void;
}

const isDev = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);

const records: PerfRecord[] = [];
const counters: Record<string, number> = {};

export const perf: PerfMetrics = {
  records,
  counters,
  record(name: string, durationMs: number, metadata?: Record<string, unknown>) {
    if (!isDev && typeof window === 'undefined') return;
    records.push({
      name,
      durationMs: Math.round(durationMs * 100) / 100,
      timestamp: Date.now(),
      metadata,
    });
    // Keep ring buffer bounded
    if (records.length > 500) records.shift();
  },
  increment(counterName: string) {
    counters[counterName] = (counters[counterName] || 0) + 1;
  },
  start(name: string, metadata?: Record<string, unknown>) {
    const startMark = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return () => {
      const endMark = typeof performance !== 'undefined' ? performance.now() : Date.now();
      perf.record(name, endMark - startMark, metadata);
    };
  },
  getSummary() {
    const summary: Record<string, { count: number; avgMs: number; minMs: number; maxMs: number }> = {};
    for (const r of records) {
      if (!summary[r.name]) {
        summary[r.name] = { count: 0, avgMs: 0, minMs: r.durationMs, maxMs: r.durationMs };
      }
      const s = summary[r.name];
      s.count++;
      s.minMs = Math.min(s.minMs, r.durationMs);
      s.maxMs = Math.max(s.maxMs, r.durationMs);
      s.avgMs = Math.round(((s.avgMs * (s.count - 1) + r.durationMs) / s.count) * 100) / 100;
    }
    return { summary, counters: { ...counters } };
  },
  clear() {
    records.length = 0;
    Object.keys(counters).forEach((k) => delete counters[k]);
  },
};

// Expose globally in browser for debugging and test scripts if available
if (typeof window !== 'undefined') {
  (window as unknown as { __WESHNAKUL_PERF__?: PerfMetrics }).__WESHNAKUL_PERF__ = perf;
}
