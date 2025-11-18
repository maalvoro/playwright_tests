import { test } from '@playwright/test';
import { RegisterPage, LoginPage } from '../../pages';

test('@ui setup authenticated state', async ({ page }) => {
  const registerPage = new RegisterPage(page);
  const loginPage = new LoginPage(page);

  const timestamp = Date.now();
  const email = `e2e${timestamp}@example.com`;
  const password = 'Test1234!';

  // Registro
  await registerPage.navigate();
  await registerPage.registerAndWaitForRedirect({
    firstName: 'E2E',
    lastName: 'User',
    email: email,
    nationality: 'Mexican',
    phone: '1234567890',
    password: password,
  });

  // Login
  await loginPage.loginAndWaitForRedirect(email, password);

  // Guardar sesión
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
