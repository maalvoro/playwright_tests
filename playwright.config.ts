import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process?.env?.CI,
  retries: process?.env?.CI ? 2 : 0,
  workers: process?.env?.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // 1) corre primero y guarda la sesión
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // 2) proyecto principal autenticado (usa storageState del setup)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
      // Importante: ignora auth.spec.ts aquí para que no falle por estar ya autenticado
      testIgnore: /.*auth\.spec\.ts/,
    },

    // 3) proyecto separado sin sesión para probar login/register desde cero
    {
      name: 'auth',
      testMatch: /.*auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // En CI: usar happy_testing directory, en local: usar ../happy_testing
    command: process?.env?.CI ? 'cd happy_testing && npm run dev' : 'cd ../happy_testing && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process?.env?.CI,
    timeout: 120 * 1000,
  },
});
