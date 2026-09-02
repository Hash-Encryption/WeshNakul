import type { PlayerColor, PlayerShape } from '../types/database';

export const PROCEDURAL_SHAPES: PlayerShape[] = [
  'scallop',
  'squircle',
  'circle',
  'diamond',
  'hexagon',
];

export const PROCEDURAL_COLORS: PlayerColor[] = [
  '#55B96A', // green
  '#F0443E', // red
  '#FFD75A', // yellow
  '#73C8EA', // blue
  '#9B86EC', // purple
  '#F6A6AD', // pink
  '#E5D3B3', // sand
];

export interface TokenCombination {
  shape: PlayerShape;
  color: PlayerColor;
}

// Generate unique shape & color permutations
export const TOKEN_COMBINATIONS: TokenCombination[] = (() => {
  const list: TokenCombination[] = [];
  for (let i = 0; i < PROCEDURAL_COLORS.length; i++) {
    for (let j = 0; j < PROCEDURAL_SHAPES.length; j++) {
      list.push({
        color: PROCEDURAL_COLORS[i],
        shape: PROCEDURAL_SHAPES[(i + j) % PROCEDURAL_SHAPES.length],
      });
    }
  }
  return list;
})();

/**
 * Extract the first non-whitespace character from nickname.
 * Uppercase Latin, native Arabic character otherwise.
 */
export function extractInitial(nickname: string): string {
  const trimmed = nickname.trim();
  if (!trimmed) return '?';
  
  // Use Array.from to correctly handle multi-byte Unicode / Arabic graphemes
  const segments = Array.from(trimmed);
  const firstChar = segments[0] || '?';
  
  // If latin character, uppercase
  if (/^[a-zA-Z]$/.test(firstChar)) {
    return firstChar.toUpperCase();
  }
  return firstChar;
}

/**
 * Deterministically get token shape and color based on participant count / join order.
 */
export function getProceduralToken(joinIndex: number): TokenCombination {
  const safeIndex = Math.max(0, joinIndex);
  return TOKEN_COMBINATIONS[safeIndex % TOKEN_COMBINATIONS.length];
}
