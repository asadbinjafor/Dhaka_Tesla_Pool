import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { isolatedDatabase } from './isolated-db.mjs';

const exec = promisify(execFile);
test('backend env is cwd-independent, local-first, and respects explicit process variables', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'dtp-env-'));
  const config = join(fixture, 'backend', 'dist', 'config');
  await mkdir(config, { recursive: true });
  await copyFile(new URL('../../dhaka-tesla-pool-backend/dist/config/environment.js', import.meta.url), join(config, 'environment.mjs'));
  const runner = join(config, 'check.mjs');
  await writeFile(runner, "import {loadEnvironment} from './environment.mjs'; loadEnvironment(); console.log(process.env.DTP_ENV_PROBE);");
  const env = { ...process.env };
  delete env.DTP_ENV_PROBE;
  try {
    await writeFile(join(fixture, '.env'), 'DTP_ENV_PROBE=root-fixture\n');
    assert.equal((await exec(process.execPath, [runner], { cwd: tmpdir(), env })).stdout.trim(), 'root-fixture');
    await writeFile(join(fixture, 'backend', '.env'), 'DTP_ENV_PROBE=backend-fixture\n');
    assert.equal((await exec(process.execPath, [runner], { cwd: tmpdir(), env })).stdout.trim(), 'backend-fixture');
    assert.equal((await exec(process.execPath, [runner], { cwd: tmpdir(), env: { ...env, DTP_ENV_PROBE: 'explicit-fixture' } })).stdout.trim(), 'explicit-fixture');
  } finally {
    assert.ok(fixture.startsWith(join(tmpdir(), 'dtp-env-')), 'Only this generated env fixture can be removed');
    await rm(fixture, { recursive: true, force: true });
  }
});

test('real migration resolves unchanged SQL from an unrelated working directory', async () => {
  const previous = process.cwd();
  let database;
  try {
    process.chdir(tmpdir());
    database = await isolatedDatabase();
    // isolatedDatabase migrates real PostgreSQL and fails if migrations cannot resolve.
    assert.match(new URL(database.url).pathname, /^\/dtp_test_[a-f0-9]{32}$/);
  } finally {
    process.chdir(previous);
    if (database) await database.close();
  }
});
