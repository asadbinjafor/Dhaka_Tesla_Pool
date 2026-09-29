import test from 'node:test';
import assert from 'node:assert/strict';

// Run against started production Next/Nest processes; not a mock server or DB test.
const base = process.env.WEB_SMOKE_ORIGIN ?? 'http://127.0.0.1:3000';

test('production SSR validates locale/theme cookies and ignores forged locale headers', async () => {
  for (const [locale, theme] of [['en', 'dark'], ['en', 'light'], ['bn', 'dark'], ['bn', 'light']]) {
    const response = await fetch(`${base}/${locale}/sign-in`, {
      headers: { cookie: `dtp-theme=${theme}; dtp-locale=${locale === 'en' ? 'bn' : 'en'}`, 'x-dtp-locale': 'outside' },
    });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"[^>]*data-theme="${theme}"`));
    assert.ok(html.includes('id="main-content"'));
  }
  const fallback = await fetch(`${base}/en/sign-in`, { headers: { cookie: 'dtp-theme=invalid; dtp-locale=invalid' } });
  assert.match(await fallback.text(), /<html[^>]*lang="en"[^>]*data-theme="dark"/);
  const redirect = await fetch(`${base}/`, { headers: { cookie: 'dtp-locale=bn' }, redirect: 'manual' });
  assert.equal(redirect.status, 307);
  assert.equal(new URL(redirect.headers.get('location'), base).pathname, '/bn/sign-in');
});

test('production UI rejects unsupported locale and renders localized not-found', async () => {
  const missing = await fetch(`${base}/bn/missing`);
  assert.equal(missing.status, 404);
  assert.ok((await missing.text()).includes('খুঁজে পাওয়া যায়নি'));
  assert.equal((await fetch(`${base}/outside/sign-in`)).status, 404);
});

test('production gateway reaches actual Nest without locale rewriting or private caching', async () => {
  const live = await fetch(`${base}/api/v1/health/live`, { headers: { cookie: 'dtp-locale=bn; dtp-theme=light' } });
  assert.equal(live.status, 200);
  assert.match(live.headers.get('cache-control'), /no-store/);
  assert.match(live.headers.get('cache-control'), /private/);
  assert.deepEqual(await live.json(), { data: { status: 'ok', service: 'api' } });
  const missing = await fetch(`${base}/api/v1/missing`);
  assert.equal(missing.status, 404);
  const payload = await missing.json();
  assert.equal(payload.error.code, 'NOT_FOUND');
  assert.equal(typeof payload.error.requestId, 'string');
  assert.equal(payload.error.stack, undefined);
});
