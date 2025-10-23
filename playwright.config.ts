import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 7_000 },
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://opensource-demo.orangehrmlive.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
