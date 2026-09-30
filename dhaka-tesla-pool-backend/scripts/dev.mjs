import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const compiler = spawn(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json', '--watch', '--pretty', 'false', '--preserveWatchOutput'], { cwd: root, stdio: ['inherit', 'pipe', 'inherit'] });
let server;
let pending = Promise.resolve();
let stopping = false;
let output = '';

async function stopServer() {
  const child = server;
  server = undefined;
  if (!child || child.exitCode !== null) return;
  await new Promise(resolve => {
    child.once('exit', resolve);
    child.kill('SIGTERM');
  });
}

compiler.stdout.on('data', chunk => {
  process.stdout.write(chunk);
  output += chunk.toString();
  let newline;
  while ((newline = output.indexOf('\n')) !== -1) {
    const line = output.slice(0, newline);
    output = output.slice(newline + 1);
    if (!line.includes('Found 0 errors. Watching for file changes.')) continue;
    pending = pending.then(async () => {
      await stopServer();
      if (stopping) return;
      console.info('dev_compilation_ready');
      server = spawn(process.execPath, ['dist/main.js'], { cwd: root, stdio: 'inherit' });
      server.on('error', () => { console.error('dev_server_start_failed'); process.exitCode = 1; });
    });
  }
});

async function shutdown(code) {
  if (stopping) return;
  stopping = true;
  compiler.kill('SIGTERM');
  await pending;
  await stopServer();
  process.exitCode = code;
  if (process.connected) process.disconnect();
}
compiler.on('error', () => { console.error('dev_compiler_start_failed'); void shutdown(1); });
compiler.on('exit', code => { if (!stopping) void shutdown(code ?? 1); });
process.on('SIGINT', () => { void shutdown(0); });
process.on('SIGTERM', () => { void shutdown(0); });
// Graceful lifecycle when launched by an IPC-capable Node supervisor (including tests).
process.on('message', message => { if (message === 'shutdown') void shutdown(0); });
process.on('disconnect', () => { void shutdown(0); });
