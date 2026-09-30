import type { NextConfig } from 'next';
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

// Next loads app-local env first. Retain only the existing private gateway setting.
const legacyEnvironment = path.resolve(__dirname, '../.env');
if (!process.env.API_INTERNAL_ORIGIN && existsSync(legacyEnvironment)) {
  const value = parseEnv(readFileSync(legacyEnvironment, 'utf8')).API_INTERNAL_ORIGIN;
  if (value) process.env.API_INTERNAL_ORIGIN = value;
}

const config: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: path.resolve(__dirname) },
};

export default config;
