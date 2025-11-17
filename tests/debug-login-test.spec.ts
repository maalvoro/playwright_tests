import { test, expect } from '@playwright/test';

test('Debug: Test login error handling', async ({ page }) => {
  // Go to login page
  await page.goto('http://localhost:3000/login');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot to see what we have
  await page.screenshot({ path: 'debug-login-initial.png', fullPage: true });
  
  // Fill in invalid credentials
  await page.getByTestId('login-email-input').fill('invalid@example.com');
  await page.getByTestId('login-password-input').fill('wrongpassword');
  
  // Click submit
  await page.getByTestId('login-submit').click();
  
  // Wait a bit for the error to appear
  await page.waitForTimeout(2000);
  
  // Take another screenshot to see what happened
  await page.screenshot({ path: 'debug-login-after-submit.png', fullPage: true });
  
  // Check what's in the page
  const pageContent = await page.content();
  console.log('Page content after login attempt:', pageContent.includes('login-error'));
  
  // Try to find error element
  const errorElement = page.getByTestId('login-error');
  const isVisible = await errorElement.isVisible().catch(() => false);
  console.log('Error element visible:', isVisible);
  
  // Check if error text exists anywhere
  const errorText = await page.textContent('body');
  console.log('Page contains "Invalid credentials":', errorText?.includes('Invalid credentials'));
  console.log('Page contains "Credenciales incorrectas":', errorText?.includes('Credenciales incorrectas'));
});