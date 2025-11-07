import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ViewDishPage extends BasePage {
  // Locators
  readonly container: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly timeBadge: Locator;
  readonly calories: Locator;
  readonly stepsSection: Locator;

  constructor(page: Page) {
    super(page);
    this.container = this.getByTestId('view-dish-container');
    this.name = this.getByTestId('view-dish-name');
    this.description = this.getByTestId('view-dish-description');
    this.timeBadge = this.getByTestId('view-dish-time-badge');
    this.calories = this.getByTestId('view-dish-calories');
    this.stepsSection = this.getByTestId('view-dish-steps-section');
  }

  /**
   * Navigate to view dish page
   */
  async navigate(dishId: string | number) {
    await this.goto(`/dishes/${dishId}/view`);
  }

  /**
   * Get first step text
   */
  getFirstStepText() {
    return this.getByTestId('view-dish-step-text').first();
  }
}
