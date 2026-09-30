import tseslint from 'typescript-eslint';
export default [
  { ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'reference/**'] },
  ...tseslint.configs.recommended.map(config => ({ ...config, files: ['tests/**/*.ts'] })),
];
