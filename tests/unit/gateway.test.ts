import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { GET, POST } from '../../dhaka-tesla-pool-frontend/src/app/api/v1/[...path]/route';

test('gateway forwards credential/CSRF/command transport, strips forged trust headers, preserves multiple cookies', async () => {
  let observed: Record<string, string | string[] | undefined> = {};
  const upstream = createServer((request, response) => {
    observed = request.headers;
    response.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': ['session_fixture=one; HttpOnly; Path=/', 'csrf_fixture=two; Path=/'] });
    response.end(JSON.stringify({ data: { transportFixture: true } }));
  });
  upstream.listen(0, '127.0.0.1');
  await once(upstream, 'listening');
  const address = upstream.address();
  assert.ok(address && typeof address !== 'string');
  const original = process.env.API_INTERNAL_ORIGIN;
  process.env.API_INTERNAL_ORIGIN = `http://127.0.0.1:${address.port}`;
  try {
    const response = await POST(new Request('http://localhost/api/v1/transport-fixture', {
      method: 'POST', body: '{}', headers: {
        cookie: 'session_fixture=one', 'content-type': 'application/json', origin: 'http://localhost',
        'x-csrf-token': 'nonsecret-fixture', 'idempotency-key': 'same-intent-fixture',
        'x-user-id': 'foreign', 'x-role': 'DRIVER', 'x-forwarded-for': 'forged', 'x-forwarded-host': 'outside.example',
      },
    }), { params: Promise.resolve({ path: ['transport-fixture'] }) });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.get('vary'), 'Cookie');
    assert.equal(response.headers.getSetCookie().length, 2);
    assert.equal(observed.cookie, 'session_fixture=one');
    assert.equal(observed['x-csrf-token'], 'nonsecret-fixture');
    assert.equal(observed['idempotency-key'], 'same-intent-fixture');
    for (const name of ['x-user-id', 'x-role', 'x-forwarded-for', 'x-forwarded-host']) assert.equal(observed[name], undefined);
  } finally {
    if (original === undefined) delete process.env.API_INTERNAL_ORIGIN;
    else process.env.API_INTERNAL_ORIGIN = original;
    await new Promise<void>((resolve, reject) => upstream.close(error => error ? reject(error) : resolve()));
  }
});

test('oversized bodies without a Content-Length are rejected before contacting upstream', async () => {
  const response = await POST(new Request('http://localhost/api/v1/fixture', { method: 'POST', body: 'x'.repeat(65537) }), { params: Promise.resolve({ path: ['fixture'] }) });
  assert.equal(response.status, 413);
  assert.equal((await response.json()).error.code, 'INVALID_INPUT');
});

test('invalid path segments cannot escape the fixed API origin', async () => {
  const response = await GET(new Request('http://localhost/api/v1/fixture'), { params: Promise.resolve({ path: ['..', 'private'] }) });
  assert.equal(response.status, 400);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});
