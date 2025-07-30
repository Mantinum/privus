import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npx next start -p 3000',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: true,
  },
};

export default config;
