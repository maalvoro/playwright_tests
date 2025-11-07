import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  // Locators
  readonly container: Locator;
  readonly title: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly nationalityInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.container = this.getByTestId('register-container');
    this.title = this.getByTestId('register-title');
    this.firstNameInput = this.getByTestId('register-firstname');
    this.lastNameInput = this.getByTestId('register-lastname');
    this.emailInput = this.getByTestId('register-email');
    this.nationalityInput = this.getByTestId('register-nationality');
    this.phoneInput = this.getByTestId('register-phone');
    this.passwordInput = this.getByTestId('register-password');
    this.submitButton = this.getByTestId('register-submit');
    this.loginLink = this.getByTestId('register-login-link');
  }

  /**
   * Navigate to register page
   */
  async navigate() {
    await this.goto('/register');
  }

  /**
   * Register and wait for redirect to login
   */
  async registerAndWaitForRedirect(userData: {
    firstName: string;
    lastName: string;
    email: string;
    nationality: string;
    phone: string;
    password: string;
  }) {
    await this.firstNameInput.fill(userData.firstName);
    await this.lastNameInput.fill(userData.lastName);
    await this.emailInput.fill(userData.email);
    await this.nationalityInput.fill(userData.nationality);
    await this.phoneInput.fill(userData.phone);
    await this.passwordInput.fill(userData.password);
    await this.submitButton.click();
    await this.waitForURL(/\/login/);
  }

  /**
   * Click on login link
   */
  async goToLogin() {
    await this.loginLink.click();
  }
}
