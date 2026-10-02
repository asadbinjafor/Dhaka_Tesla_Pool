import test from 'node:test';
import assert from 'node:assert/strict';
import { createApplication } from '../../dhaka-tesla-pool-backend/dist/bootstrap.js';

test('real Nest HTTP: liveness is separate from absent database readiness, with safe errors', async () => {
  const app = await createApplication(null); // Explicit absent DB, independent of local/CI environment.
  try {
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    const live = await fetch(`${base}/api/v1/health/live`);
    assert.equal(live.status, 200);
    assert.deepEqual(await live.json(), { data: { status: 'ok', service: 'api' } });
    const ready = await fetch(`${base}/api/v1/health/ready`);
    assert.equal(ready.status, 503);
    assert.equal(ready.headers.get('cache-control'), 'private, no-store');
    const error = await ready.json();
    assert.equal(error.error.code, 'TEMPORARILY_UNAVAILABLE');
    assert.deepEqual(Object.keys(error.error).sort(), ['code', 'requestId']);
    const unknown = await fetch(`${base}/api/v1/private-unknown`);
    assert.equal(unknown.status, 404);
    assert.equal((await unknown.json()).error.code, 'NOT_FOUND');
  } finally {
    await app.close();
  }
});

test('unreachable PostgreSQL returns safe not-ready, never false success or DSN', async () => {
  const app = await createApplication('postgresql://test_fixture:not_real@127.0.0.1:1/absent');
  try {
    await app.listen(0, '127.0.0.1');
    const result = await fetch(`${await app.getUrl()}/api/v1/health/ready`);
    assert.equal(result.status, 503);
    const text = await result.text();
    assert.ok(!text.includes('postgresql') && !text.includes('test_fixture') && !text.includes('not_real'));
  } finally {
    await app.close();
  }
});
