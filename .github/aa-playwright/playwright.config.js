import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  workers: process.env.CI ? 1 : 2,
  timeout: 60_000,
  globalTimeout: 480_000,
  expect: { timeout: 30_000 },
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.AA_BASE_URL || 'https://arifsolmaz.github.io/courses/aa/',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
});
