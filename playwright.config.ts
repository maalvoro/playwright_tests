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
    // Ejecutar en modo headless por defecto (sin mostrar navegador)
    headless: true,
  },
  projects: [
    // 1) corre primero y guarda la sesión
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // 2) proyecto principal autenticado (usa storageState del setup) - Solo UI tests
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
      // Importante: ignora auth.spec.ts y API tests aquí
      testIgnore: [/.*auth\.spec\.ts/, /.*\.setup\.ts/, /.*\.api\.spec\.ts/],
    },

    // 3) proyecto separado sin sesión para probar login/register desde cero - Solo UI tests
    {
      name: 'auth',
      testMatch: /.*auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // 4) proyecto para API tests - No requiere browser
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: { 
        // API tests don't need browser context, just APIRequestContext
        baseURL: 'http://localhost:3000'
      },
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
