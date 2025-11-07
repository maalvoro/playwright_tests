import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class NewDishPage extends BasePage {
  // Locators
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly prepTimeInput: Locator;
  readonly cookTimeInput: Locator;
  readonly caloriesInput: Locator;
  readonly quickPrepCheckbox: Locator;
  readonly addStepButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.form = this.getByTestId('new-dish-form');
    this.nameInput = this.getByTestId('new-dish-name-input');
    this.descriptionInput = this.getByTestId('new-dish-description-input');
    this.prepTimeInput = this.getByTestId('new-dish-preptime-input');
    this.cookTimeInput = this.getByTestId('new-dish-cooktime-input');
    this.caloriesInput = this.getByTestId('new-dish-calories-input');
    this.quickPrepCheckbox = this.getByTestId('new-dish-quickprep-checkbox');
    this.addStepButton = this.getByTestId('new-dish-add-step-button');
    this.submitButton = this.getByTestId('new-dish-submit-button');
  }

  /**
   * Navigate to new dish page
   */
  async navigate() {
    await this.goto('/dishes/new');
  }

  /**
   * Create dish and wait for redirect
   */
  async createDishAndWaitForRedirect(data: {
    name: string;
    description: string;
    prepTime: string;
    cookTime: string;
    calories?: string;
    steps: string[];
    quickPrep?: boolean;
  }) {
    await this.nameInput.fill(data.name);
    await this.descriptionInput.fill(data.description);
    await this.prepTimeInput.fill(data.prepTime);
    await this.cookTimeInput.fill(data.cookTime);
    if (data.calories) {
      await this.caloriesInput.fill(data.calories);
    }

    // Fill first step
    if (data.steps.length > 0) {
      await this.getByTestId('new-dish-step-input').first().fill(data.steps[0]);
    }

    // Add additional steps
    for (let i = 1; i < data.steps.length; i++) {
      await this.addStepButton.click();
      await this.getByTestId('new-dish-step-input').last().fill(data.steps[i]);
    }

    // Toggle quick prep if needed
    if (data.quickPrep) {
      await this.quickPrepCheckbox.check();
    }

    await this.submitButton.click();
    await this.waitForURL(/\/dishes$/);
  }
}
