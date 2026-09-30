import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Preserve explicit process variables. Local backend .env wins over root fallback.
export function loadEnvironment() {
  const local = fileURLToPath(new URL('../../.env', import.meta.url));
  const legacy = fileURLToPath(new URL('../../../.env', import.meta.url));
  const file = existsSync(local) ? local : existsSync(legacy) ? legacy : null;
  if (file) {
    try { process.loadEnvFile(file); }
    catch { throw new Error('Unable to load environment file'); }
  }
}
