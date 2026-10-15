/**
 * WeshNakul First-Party Anonymous Analytics Identity
 *
 * Implements a random, first-party anonymous browser ID using cryptographically
 * secure randomness (crypto.randomUUID).
 *
 * SECURITY & PRIVACY MANDATE:
 * 1. Isolated from Authentication:
 *    This ID is strictly separated from `wesh_nakul_session` (which functions as
 *    a legacy session bearer token in `get_room_participants`). It is purely used
 *    for first-party aggregate analytics and NEVER grants access to rooms or participants.
 * 2. Zero PII & Zero Fingerprinting:
 *    No browser fingerprinting, user-agent parsing, IP hashing, or hardware canvas
 *    hashes are used. It does not identify a real-world person.
 * 3. Scope & Cross-Room Boundary:
 *    It is never used to link individual restaurant swipes across different rooms.
 * 4. Storage Resilience:
 *    Persisted in localStorage['wsh_analytics_id']. If storage is disabled, cleared,
 *    or throws in private browsing, an in-memory UUID is generated gracefully.
 */

const ANALYTICS_ID_KEY = 'wsh_analytics_id';
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let inMemoryFallbackId: string | null = null;

function generateSecureUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns true if the string is a valid UUID v4.
 */
export function isValidAnalyticsId(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') return false;
  return UUID_V4_REGEX.test(id.trim());
}

/**
 * Get or create the first-party anonymous analytics ID.
 *
 * @returns A validated UUID v4 string.
 */
export function getOrCreateAnalyticsId(): string {
  try {
    if (typeof localStorage !== 'undefined') {
      const existing = localStorage.getItem(ANALYTICS_ID_KEY);
      if (existing && isValidAnalyticsId(existing)) {
        return existing;
      }
      const newId = generateSecureUUID();
      localStorage.setItem(ANALYTICS_ID_KEY, newId);
      return newId;
    }
  } catch {
    // Storage restricted or unavailable (e.g. strict sandbox or private browsing)
  }

  // Graceful fallback to memory-only identifier
  if (!inMemoryFallbackId || !isValidAnalyticsId(inMemoryFallbackId)) {
    inMemoryFallbackId = generateSecureUUID();
  }
  return inMemoryFallbackId;
}

/**
 * Clears the stored analytics ID (used only for testing or explicit user privacy resets).
 */
export function resetAnalyticsIdForTesting(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ANALYTICS_ID_KEY);
    }
  } catch {
    // no-op
  }
  inMemoryFallbackId = null;
}
