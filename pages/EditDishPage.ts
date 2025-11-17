import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class EditDishPage extends BasePage {
  // Locators
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.form = this.getByTestId('edit-dish-form');
    this.nameInput = this.getByTestId('edit-dish-name');
    this.descriptionInput = this.getByTestId('edit-dish-description');
    this.submitButton = this.getByTestId('edit-dish-submit');
  }

  /**
   * Navigate to edit dish page
   */
  async navigate(dishId: string | number) {
    await this.goto(`/dishes/${dishId}`);
  }

  /**
   * Update dish and wait for redirect
   */
  async updateDishAndWaitForRedirect(data: { name: string; description: string }) {
    await this.nameInput.fill(data.name);
    await this.descriptionInput.fill(data.description);
    
    // Submit and wait for navigation
    await Promise.all([
      this.page.waitForURL(/\/dishes$/, { timeout: 10000 }),
      this.submitButton.click()
    ]);
  }
}
