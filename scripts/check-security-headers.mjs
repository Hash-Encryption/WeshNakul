import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

console.log('--- WESHNAKUL SEC-04: PRODUCTION SECURITY HEADERS TEST SUITE ---');

let checks = 0;
function check(condition, message) {
  assert.ok(condition, message);
  checks++;
  console.log(`  ✓ [Check ${checks}] ${message}`);
}

// 1. Verify existence of public/_headers
const headersPath = 'public/_headers';
check(existsSync(headersPath), 'public/_headers file exists');

const content = readFileSync(headersPath, 'utf8');

// Helper to parse Cloudflare Pages _headers format
function parseHeaders(raw) {
  const sections = {};
  let currentPath = null;
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      currentPath = trimmed;
      sections[currentPath] = {};
    } else if (currentPath) {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        const headerName = trimmed.slice(0, colonIdx).trim().toLowerCase();
        const headerValue = trimmed.slice(colonIdx + 1).trim();
        sections[currentPath][headerName] = headerValue;
      }
    }
  }
  return sections;
}

const parsed = parseHeaders(content);

check(Boolean(parsed['/*']), 'Global route /* configuration is present');
const globalHeaders = parsed['/*'] || {};

// Clickjacking defense
check(globalHeaders['x-frame-options'] === 'DENY', 'X-Frame-Options is set to DENY');

// MIME sniffing defense
check(globalHeaders['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options is set to nosniff');

// Referrer policy
check(globalHeaders['referrer-policy'] === 'strict-origin-when-cross-origin', 'Referrer-Policy is set to strict-origin-when-cross-origin');

// HSTS configuration
check(Boolean(globalHeaders['strict-transport-security']), 'Strict-Transport-Security is present');
check(globalHeaders['strict-transport-security'].includes('max-age=31536000'), 'HSTS max-age is set to at least 1 year (31536000)');
check(!globalHeaders['strict-transport-security'].includes('includeSubDomains'), 'HSTS safely omits includeSubDomains for shared pages.dev suffix');
check(!globalHeaders['strict-transport-security'].includes('preload'), 'HSTS safely omits preload for shared pages.dev suffix');

// Permissions policy
check(Boolean(globalHeaders['permissions-policy']), 'Permissions-Policy is present');
check(globalHeaders['permissions-policy'].includes('camera=()'), 'Permissions-Policy disables camera');
check(globalHeaders['permissions-policy'].includes('microphone=()'), 'Permissions-Policy disables microphone');
check(globalHeaders['permissions-policy'].includes('geolocation=(self)'), 'Permissions-Policy allows first-party geolocation');

// CSP Report-Only policy
check(Boolean(globalHeaders['content-security-policy-report-only']), 'Content-Security-Policy-Report-Only is present');
const csp = globalHeaders['content-security-policy-report-only'] || '';

check(csp.includes("default-src 'self'"), "CSP includes default-src 'self'");
check(csp.includes("script-src 'self'"), "CSP includes script-src 'self'");
check(!csp.includes("'unsafe-eval'"), "CSP strictly excludes 'unsafe-eval'");
check(csp.includes("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"), "CSP includes style-src with Google Fonts and inline styles for React/Motion");
check(csp.includes("font-src 'self' https://fonts.gstatic.com data:"), "CSP includes font-src with Google Fonts gstatic and data URIs");
check(csp.includes("img-src 'self' data: https:"), "CSP includes img-src allowing self, data URIs, and HTTPS images");
check(csp.includes("connect-src 'self' https://*.supabase.co wss://*.supabase.co"), "CSP includes connect-src preserving Supabase REST and Realtime WebSockets");
check(csp.includes("frame-ancestors 'none'"), "CSP includes frame-ancestors 'none'");
check(csp.includes("base-uri 'self'"), "CSP includes base-uri 'self'");
check(csp.includes("form-action 'self'"), "CSP includes form-action 'self'");

// Assets route headers
check(Boolean(parsed['/assets/*']), 'Static asset route /assets/* configuration is present');
const assetHeaders = parsed['/assets/*'] || {};
check(assetHeaders['cache-control']?.includes('immutable'), 'Static assets retain immutable caching');
check(assetHeaders['x-content-type-options'] === 'nosniff', 'Static assets enforce nosniff');

console.log(`\n======================================================`);
console.log(`PASS: All ${checks} SEC-04 Security Header checks passed successfully!`);
console.log(`======================================================\n`);
