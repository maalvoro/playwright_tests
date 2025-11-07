import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class NavigationPage extends BasePage {
  // Locators
  readonly header: Locator;
  readonly nav: Locator;
  readonly main: Locator;
  readonly dishesLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = this.getByTestId('layout-header');
    this.nav = this.getByTestId('layout-nav');
    this.main = this.getByTestId('layout-main');
    this.dishesLink = this.getByTestId('nav-dishes-link');
    this.logoutButton = this.getByTestId('nav-logout-button');
  }

  /**
   * Click on dishes link
   */
  async goToDishes() {
    await this.dishesLink.click();
  }

  /**
   * Click on logout button
   */
  async logout() {
    await this.logoutButton.click();
  }

  /**
   * Logout and wait for redirect to login
   */
  async logoutAndWaitForRedirect() {
    await this.logout();
    await this.waitForURL(/\/login/);
  }
}
