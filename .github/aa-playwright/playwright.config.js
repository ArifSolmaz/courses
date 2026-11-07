import { defineConfig } from '@playwright/test';

const preview = process.env.AA_PREVIEW === '1';
const previewURL = 'http://127.0.0.1:4173/aa/';

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  workers: process.env.CI ? 1 : 2,
  timeout: 60_000,
  globalTimeout: 480_000,
  expect: { timeout: 30_000 },
  reporter: process.env.CI ? 'github' : 'list',
  webServer: preview ? {
    command: 'python -m http.server 4173 --bind 127.0.0.1 --directory ../..',
    url: previewURL,
  } : undefined,
  use: {
    baseURL: preview ? previewURL : (process.env.AA_BASE_URL || 'https://arifsolmaz.github.io/courses/aa/'),
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
});
