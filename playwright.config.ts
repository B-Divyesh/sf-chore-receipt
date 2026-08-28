import { defineConfig, devices } from '@playwright/test';

const liveBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: liveBaseUrl || 'http://127.0.0.1:4173',
    // Axe is injected only by the test harness; live CSP remains verified by
    // the browser and response-header checks.
    bypassCSP: Boolean(liveBaseUrl),
    ...devices['Desktop Chrome']
  },
  webServer: liveBaseUrl ? undefined : {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    port: 4173,
    reuseExistingServer: false
  }
});
