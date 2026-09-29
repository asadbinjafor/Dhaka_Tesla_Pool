import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['**/.next/**', '**/dist/**', '**/node_modules/**', 'reference/**', 'apps/web/next-env.d.ts'] },
  ...nextVitals.map(config => ({ ...config, files: ['apps/web/**/*.{ts,tsx}'] })),
  ...nextTypescript.map(config => ({ ...config, files: ['apps/web/**/*.{ts,tsx}'] })),
  ...tseslint.configs.recommended.map(config => ({ ...config, files: ['apps/api/**/*.ts', 'packages/**/*.ts', 'tests/**/*.ts'] })),
  { settings: { next: { rootDir: 'apps/web/' } } },
];
