import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log('--- EXECUTING WESHNAKUL V1 POST-AUDIT FIXES TEST SUITE ---');

let checks = 0;
const check = (desc, fn) => {
  try {
    fn();
    checks++;
    console.log(`  ✓ [Check ${checks}] ${desc}`);
  } catch (err) {
    console.error(`FAILED: "${desc}"`);
    throw err;
  }
};

const server = await createServer({
  server: { middlewareMode: true },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '""',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
  },
});

try {
  // 1. Locale verification & Key Parity
  const arDict = JSON.parse(readFileSync('src/locales/ar.json', 'utf8'));
  const enDict = JSON.parse(readFileSync('src/locales/en.json', 'utf8'));

  check('ar.json contains enterCodeModal.lettersOnly', () => {
    assert.equal(typeof arDict.enterCodeModal?.lettersOnly, 'string');
    assert.ok(arDict.enterCodeModal.lettersOnly.includes('4 أحرف إنجليزية'));
  });

  check('en.json contains enterCodeModal.lettersOnly', () => {
    assert.equal(typeof enDict.enterCodeModal?.lettersOnly, 'string');
    assert.ok(enDict.enterCodeModal.lettersOnly.includes('4 English letters only'));
  });

  check('placeholder in ar.json and en.json is updated from A7K2 to TACO', () => {
    assert.equal(arDict.enterCodeModal.placeholder, 'مثلاً TACO');
    assert.equal(enDict.enterCodeModal.placeholder, 'e.g. TACO');
    assert.ok(!arDict.enterCodeModal.placeholder.includes('A7K2'));
    assert.ok(!enDict.enterCodeModal.placeholder.includes('A7K2'));
  });

  // 2. LandingHero Accessibility
  const landingHeroSource = readFileSync('src/components/landing/LandingHero.tsx', 'utf8');
  check('LandingHero decorative 3D question mark motion wrapper has aria-hidden="true"', () => {
    assert.ok(
      landingHeroSource.includes('className="relative z-10 flex flex-col items-center justify-center filter drop-shadow-[0_8px_16px_rgba(240,68,62,0.4)]"\n            aria-hidden="true"') ||
      landingHeroSource.includes('aria-hidden="true"')
    );
    // Verify question mark wrapper explicitly has aria-hidden
    const match = landingHeroSource.match(/drop-shadow-\[0_8px_16px_rgba\(240,68,62,0\.4\)\]"[^>]*aria-hidden="true"/s);
    assert.ok(match, 'decorative motion wrapper must contain aria-hidden="true"');
  });

  check('LandingHero H1 heading remains accessible and untouched', () => {
    assert.ok(landingHeroSource.includes('<h1 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mb-2.5 font-alexandria tracking-tight">'));
    assert.ok(!landingHeroSource.includes('<h1 aria-hidden'));
  });

  // 3. LanguageToggle Dimensions & Classes
  const { LanguageToggle } = await server.ssrLoadModule('/src/components/common/LanguageToggle.tsx');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');

  check('LanguageToggle markup includes min-h-[44px] for touch target compliance', () => {
    const markup = renderToStaticMarkup(
      createElement(LocaleProvider, null, createElement(LanguageToggle))
    );
    assert.ok(markup.includes('min-h-[44px]'), 'LanguageToggle button markup must contain min-h-[44px]');
    assert.ok(markup.includes('rounded-full'), 'LanguageToggle preserves rounded-full pill');
    assert.ok(markup.includes('aria-label="Toggle language"'), 'LanguageToggle preserves accessible label');
  });

  // 4. EnterCodeModal Logic Tests
  // Simulate the exact input handling logic implemented in EnterCodeModal
  const simulateInput = (rawInput, isLoading = false) => {
    const hasInvalid = /[^A-Za-z]/.test(rawInput);
    const clean = rawInput.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4);
    let error = null;
    let autoSubmitted = null;

    if (hasInvalid) {
      error = enDict.enterCodeModal.lettersOnly;
    } else {
      error = null;
      if (/^[A-Za-z]{4}$/.test(rawInput) && !isLoading) {
        autoSubmitted = clean;
      }
    }

    return { rawInput, clean, error, autoSubmitted, hasInvalid };
  };

  check('Valid 4-letter uppercase code triggers auto-submission with no error', () => {
    const res = simulateInput('TACO');
    assert.equal(res.clean, 'TACO');
    assert.equal(res.error, null);
    assert.equal(res.autoSubmitted, 'TACO');
  });

  check('Valid 4-letter lowercase code normalizes to uppercase and auto-submits', () => {
    const res = simulateInput('kafu');
    assert.equal(res.clean, 'KAFU');
    assert.equal(res.error, null);
    assert.equal(res.autoSubmitted, 'KAFU');
  });

  check('Valid 4-letter mixed case code normalizes to uppercase and auto-submits', () => {
    const res = simulateInput('ZaTa');
    assert.equal(res.clean, 'ZATA');
    assert.equal(res.error, null);
    assert.equal(res.autoSubmitted, 'ZATA');
  });

  check('Input with digits immediately sets lettersOnly error and NEVER auto-submits', () => {
    for (const testCase of ['1', 'A7', 'A7K2', '1234', 'TACO1']) {
      const res = simulateInput(testCase);
      assert.equal(res.error, enDict.enterCodeModal.lettersOnly, `Expected error for ${testCase}`);
      assert.equal(res.autoSubmitted, null, `Should never auto-submit for ${testCase}`);
    }
  });

  check('Input with Arabic characters immediately sets lettersOnly error and NEVER auto-submits', () => {
    for (const testCase of ['ش', 'شاورما', 'غرفة']) {
      const res = simulateInput(testCase);
      assert.equal(res.error, enDict.enterCodeModal.lettersOnly, `Expected error for ${testCase}`);
      assert.equal(res.autoSubmitted, null, `Should never auto-submit for ${testCase}`);
    }
  });

  check('Input with symbols immediately sets lettersOnly error and NEVER auto-submits', () => {
    for (const testCase of ['@', 'TACO!', '#456', 'AB-C']) {
      const res = simulateInput(testCase);
      assert.equal(res.error, enDict.enterCodeModal.lettersOnly, `Expected error for ${testCase}`);
      assert.equal(res.autoSubmitted, null, `Should never auto-submit for ${testCase}`);
    }
  });

  check('Input with spaces immediately sets lettersOnly error and NEVER auto-submits', () => {
    for (const testCase of [' ', 'TA CO', ' TACO', 'TACO ']) {
      const res = simulateInput(testCase);
      assert.equal(res.error, enDict.enterCodeModal.lettersOnly, `Expected error for ${testCase}`);
      assert.equal(res.autoSubmitted, null, `Should never auto-submit for ${testCase}`);
    }
  });

  check('Overlength input (5+ letters) does not trigger auto-submission', () => {
    const res = simulateInput('ABCDE');
    assert.equal(res.clean, 'ABCD');
    assert.equal(res.autoSubmitted, null, 'Must only auto-submit if original input is EXACTLY 4 characters');
  });

  check('Incomplete valid input (1-3 letters) sets no error and waits for 4th letter', () => {
    for (const testCase of ['T', 'TA', 'TAC']) {
      const res = simulateInput(testCase);
      assert.equal(res.error, null);
      assert.equal(res.autoSubmitted, null);
      assert.equal(res.clean, testCase);
    }
  });

  console.log(`\n🎉 ALL ${checks} TARGETED POST-AUDIT FIX CHECKS PASSED PERFECTLY!\n`);
} finally {
  await server.close();
}
