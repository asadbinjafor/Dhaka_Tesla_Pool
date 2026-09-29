import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const expected = JSON.parse(await readFile(resolve(root, 'evidence/runs/2026-09-29-initial-audit/reference-hashes.json'), 'utf8'));
for (const [path, hash] of Object.entries(expected)) {
  const actual = createHash('sha256').update(await readFile(resolve(root, 'reference', path))).digest('hex');
  if (actual !== hash) throw new Error(`Reference changed: ${path}`);
}
console.info(`PASS: ${Object.keys(expected).length} immutable reference files`);
