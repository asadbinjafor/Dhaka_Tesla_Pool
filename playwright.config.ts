import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'tests/e2e',workers:1,timeout:30000,retries:0,
  use:{baseURL:process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000',trace:'off',screenshot:'only-on-failure',video:'off'},
  reporter:[['list'],['html',{open:'never'}],['json',{outputFile:'test-results/report.json'}]],
});
