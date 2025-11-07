import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string) {
    await this.page.goto(path);
  }

  /**
   * Get element by test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Wait for URL pattern
   */
  async waitForURL(pattern: RegExp) {
    await this.page.waitForURL(pattern);
  }

  /**
   * Get current URL
   */
  url(): string {
    return this.page.url();
  }

  /**
   * Wait for a specific timeout
   */
  async wait(ms: number) {
    await this.page.waitForTimeout(ms);
  }
}
