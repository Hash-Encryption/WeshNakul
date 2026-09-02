import { extractInitial, getProceduralToken, PROCEDURAL_SHAPES, PROCEDURAL_COLORS } from '../tokenGenerator';
import arDict from '../../locales/ar.json';
import enDict from '../../locales/en.json';

// Simple assertion test runner
function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

export function runTests() {
  console.log('Running test suite...');

  // 1. Test Arabic initial extraction
  assert(extractInitial('فيصل') === 'ف', 'Extract Arabic initial from فيصل');
  assert(extractInitial('سارة') === 'س', 'Extract Arabic initial from سارة');
  assert(extractInitial('  محمد ') === 'م', 'Extract Arabic initial with whitespace');

  // 2. Test Latin initial extraction
  assert(extractInitial('faisal') === 'F', 'Extract Latin initial from faisal');
  assert(extractInitial('Sarah') === 'S', 'Extract Latin initial from Sarah');
  assert(extractInitial('  ali ') === 'A', 'Extract Latin initial with whitespace');

  // 3. Test Empty fallback
  assert(extractInitial('') === '?', 'Extract initial from empty string');
  assert(extractInitial('   ') === '?', 'Extract initial from whitespace string');

  // 4. Test Procedural Tokens
  const token0 = getProceduralToken(0);
  assert(token0.color === PROCEDURAL_COLORS[0], 'First token color match');
  assert(token0.shape === PROCEDURAL_SHAPES[0], 'First token shape match');

  const token1 = getProceduralToken(1);
  assert(Boolean(token1.color && token1.shape), 'Second token has valid shape and color');

  // 5. Test Dictionary Key Parity
  const getKeys = (obj: any, prefix = ''): string[] => {
    let keys: string[] = [];
    for (const k of Object.keys(obj)) {
      const full = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        keys = keys.concat(getKeys(obj[k], full));
      } else {
        keys.push(full);
      }
    }
    return keys;
  };

  const arKeys = getKeys(arDict);
  const enKeys = getKeys(enDict);

  for (const k of arKeys) {
    assert(enKeys.includes(k), `Missing key in en.json: ${k}`);
  }
  for (const k of enKeys) {
    assert(arKeys.includes(k), `Missing key in ar.json: ${k}`);
  }

  console.log(`✓ All ${arKeys.length} localization keys match perfectly across ar and en.`);
  console.log('✓ Token generation and character extraction tests passed successfully!');
}

runTests();
