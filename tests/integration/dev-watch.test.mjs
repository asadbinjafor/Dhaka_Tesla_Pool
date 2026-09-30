import test from 'node:test';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { isolatedDatabase } from './isolated-db.mjs';

async function until(predicate, description) {
  const end = Date.now() + 45000;
  while (Date.now() < end) { if (await predicate()) return; await delay(100); }
  assert.fail(description);
}

test('backend app-directory dev command compiles source, restarts once changed, serves migrated DB and stops its children', { timeout: 120000 }, async () => {
  const database = await isolatedDatabase();
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const root = fileURLToPath(new URL('../../dhaka-tesla-pool-backend/', import.meta.url));
  const probe = new URL(`../../dhaka-tesla-pool-backend/src/npm-watch-probe-${randomUUID()}.ts`, import.meta.url);
  const child = fork(fileURLToPath(new URL('../../dhaka-tesla-pool-backend/scripts/dev.mjs', import.meta.url)), [], {
    cwd: root, silent: true, execArgv: [], env: { ...process.env, DATABASE_URL: database.url, API_HOST: '127.0.0.1', API_PORT: String(port) },
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk.toString(); });
  child.stderr.on('data', chunk => { output += chunk.toString(); });
  let probeCreated = false;
  try {
    await until(() => output.includes(`api_listening port=${port}`), 'Initial dev compilation/start failed');
    assert.equal((await fetch(`http://127.0.0.1:${port}/api/v1/health/ready`)).status, 200);
    await writeFile(probe, 'export const npmWatchProbe = true;\n', { flag: 'wx' });
    probeCreated = true;
    await until(() => output.split(`api_listening port=${port}`).length >= 3, 'Source edit did not compile/restart the backend');
    assert.equal((await fetch(`http://127.0.0.1:${port}/api/v1/health/ready`)).status, 200);
  } catch (error) {
    throw new Error(`${error.message}\nDev compiler/server output:\n${output}`, { cause: error });
  } finally {
    if (child.exitCode === null) {
      const exited = once(child, 'exit');
      child.send('shutdown');
      await exited;
    }
    if (probeCreated) await unlink(probe);
    await database.close();
  }
  await assert.rejects(fetch(`http://127.0.0.1:${port}/api/v1/health/live`));
});
