import { test, expect } from '@playwright/test';
import { DishesPage, NavigationPage } from '../../pages';

test.describe('Navigation and Layout', () => {
  let dishesPage: DishesPage;
  let navigationPage: NavigationPage;

  // Ya estamos autenticados vía storageState del setup
  test.beforeEach(async ({ page }) => {
    dishesPage = new DishesPage(page);
    navigationPage = new NavigationPage(page);
    
    await dishesPage.navigate();
  });

  test('@ui should display layout elements', async () => {
    await expect(navigationPage.header).toBeVisible();
    await expect(navigationPage.nav).toBeVisible();
    await expect(navigationPage.main).toBeVisible();
  });

  test('@ui should navigate using header links', async ({ page }) => {
    await navigationPage.goToDishes();
    await expect(page).toHaveURL(/\/dishes/);
  });

  test('@ui should logout successfully', async ({ page }) => {
    await navigationPage.logoutAndWaitForRedirect();
    await expect(page).toHaveURL(/\/login/);
  });

  test('@ui should redirect to login when accessing protected route without session', async ({ page }) => {
    await navigationPage.logout();
    await dishesPage.navigate();
    await expect(page).toHaveURL(/\/login/);
  });
});
