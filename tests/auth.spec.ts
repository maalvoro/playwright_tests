import { test, expect } from '@playwright/test';
import { LoginPage, RegisterPage } from '../pages';

test.describe('Authentication', () => {
  let loginPage: LoginPage;
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    // Limpiar cookies antes de cada test
    await page.context().clearCookies();
    
    // Initialize page objects
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
  });

  test('should display login page correctly', async () => {
    await loginPage.navigate();
    
    await expect(loginPage.container).toBeVisible();
    await expect(loginPage.title).toHaveText('Bienvenido');
    await expect(loginPage.subtitle).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
  });

  test('should display register page correctly', async () => {
    await registerPage.navigate();
    
    await expect(registerPage.container).toBeVisible();
    await expect(registerPage.title).toHaveText('Crear cuenta');
    await expect(registerPage.firstNameInput).toBeVisible();
    await expect(registerPage.lastNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
  });

  test('should register a new user successfully', async ({ page }) => {
    await registerPage.navigate();
    
    const timestamp = Date.now();
    await registerPage.registerAndWaitForRedirect({
      firstName: 'Test',
      lastName: 'User',
      email: `test${timestamp}@example.com`,
      nationality: 'Mexican',
      phone: '1234567890',
      password: 'Test1234!',
    });
    
    // Debería estar en login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show error with invalid credentials', async () => {
    await loginPage.navigate();
    
    await loginPage.login('invalid@example.com', 'wrongpassword');
    
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Primero crear un usuario
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const password = 'Test1234!';
    
    await registerPage.navigate();
    await registerPage.registerAndWaitForRedirect({
      firstName: 'Test',
      lastName: 'User',
      email: email,
      nationality: 'Mexican',
      phone: '1234567890',
      password: password,
    });
    
    // Ahora se hace login
    await loginPage.loginAndWaitForRedirect(email, password);
    
    // Debería redirigir a dishes
    await expect(page).toHaveURL(/\/dishes/);
  });

  test('should navigate from login to register', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.goToRegister();
    await expect(page).toHaveURL(/\/register/);
  });

  test('should navigate from register to login', async ({ page }) => {
    await registerPage.navigate();
    await registerPage.goToLogin();
    await expect(page).toHaveURL(/\/login/);
  });
});
