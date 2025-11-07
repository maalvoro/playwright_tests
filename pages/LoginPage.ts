import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Locators
  readonly container: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.container = this.getByTestId('login-container');
    this.title = this.getByTestId('login-title');
    this.subtitle = this.getByTestId('login-subtitle');
    this.emailInput = this.getByTestId('login-email-input');
    this.passwordInput = this.getByTestId('login-password-input');
    this.submitButton = this.getByTestId('login-submit');
    this.registerLink = this.getByTestId('login-register-link');
    this.errorMessage = this.getByTestId('login-error');
  }

  /**
   * Navigate to login page
   */
  async navigate() {
    await this.goto('/login');
  }

  /**
   * Perform login with credentials
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Click on register link
   */
  async goToRegister() {
    await this.registerLink.click();
  }

  /**
   * Complete login flow and wait for redirect
   */
  async loginAndWaitForRedirect(email: string, password: string) {
    await this.login(email, password);
    await this.waitForURL(/\/dishes/);
  }
}
