import type { NextConfig } from 'next';
import path from 'node:path';

const config: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@dtp/contracts'],
  turbopack: { root: path.resolve(__dirname, '../..') },
};

export default config;
