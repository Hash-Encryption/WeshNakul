import type { Locale } from '../types/database';

const PRIMARY_SESSION_KEY = 'wesh_nakul_session';
const LEGACY_SESSION_KEY = 'wsh_session_token';
const ACTIVE_ROOM_KEY = 'wsh_active_room';
const LOCALE_KEY = 'wsh_locale';

/**
 * Generate a random UUID v4 string.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create anonymous session token.
 * Checks 'wesh_nakul_session' with fallback to 'wsh_session_token'.
 */
export function getOrCreateSessionToken(): string {
  try {
    const primary = localStorage.getItem(PRIMARY_SESSION_KEY);
    if (primary && primary.length > 8) {
      return primary;
    }
    const legacy = localStorage.getItem(LEGACY_SESSION_KEY);
    if (legacy && legacy.length > 8) {
      localStorage.setItem(PRIMARY_SESSION_KEY, legacy);
      return legacy;
    }
    const newToken = generateUUID();
    localStorage.setItem(PRIMARY_SESSION_KEY, newToken);
    return newToken;
  } catch {
    return generateUUID();
  }
}

/**
 * Persist active room code.
 */
export function setActiveRoomCode(code: string | null): void {
  try {
    if (code) {
      localStorage.setItem(ACTIVE_ROOM_KEY, code.toUpperCase());
    } else {
      localStorage.removeItem(ACTIVE_ROOM_KEY);
    }
  } catch (e) {
    console.error('Failed to set active room code in localStorage', e);
  }
}

/**
 * Get active room code from localStorage.
 */
export function getActiveRoomCode(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ROOM_KEY);
  } catch {
    return null;
  }
}

/**
 * Persist active locale ('ar' | 'en').
 */
export function setStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch (e) {
    console.error('Failed to set locale in localStorage', e);
  }
}

/**
 * Get stored locale with fallback to 'ar'.
 */
export function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === 'ar' || stored === 'en') {
      return stored;
    }
  } catch {
    // fallback
  }
  return 'ar';
}

/**
 * Generate a clean 4-character uppercase squad code (e.g. A7K2).
 * Excludes ambiguous characters like 0, O, 1, I.
 */
export function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
