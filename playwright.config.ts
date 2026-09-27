import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000, // per test
  expect: { timeout: 5_000 }, // Playwright's default; slow spots wait for the specific request instead
  fullyParallel: true,
  forbidOnly: env.isCI, // a stray test.only fails CI instead of silently skipping tests
  retries: env.isCI ? 2 : 0, // no retries locally, so flakiness stays visible
  workers: env.workers,
  reporter: [
    ['list'], // progress in the terminal
    ['html', { open: 'never' }], // npm run report
    ['json', { outputFile: 'reports/results.json' }], // machine-readable results
  ],
  use: {
    baseURL: env.baseUrl, // lets tests call page.goto('/home')
    testIdAttribute: 'amt-auto-test-id', // getByTestId() uses the site's own test hooks
    locale: 'en-US',
    timezoneId: env.timezone,
    actionTimeout: 10_000, // a stuck click fails after 10s with a clear message, not at the 60s test limit
    navigationTimeout: 15_000, // page loads take ~1.5s; this is only the ceiling
    trace: 'retain-on-failure', // step-by-step recording, kept only when a test fails
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, channel: env.browserChannel },
    },
  ],
});
