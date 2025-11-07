import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DishesPage extends BasePage {
  // Locators
  readonly container: Locator;
  readonly header: Locator;
  readonly title: Locator;
  readonly addButton: Locator;
  readonly emptyMessage: Locator;
  readonly dishesGrid: Locator;

  constructor(page: Page) {
    super(page);
    this.container = this.getByTestId('dishes-container');
    this.header = this.getByTestId('dishes-header');
    this.title = this.getByTestId('dishes-title');
    this.addButton = this.getByTestId('dishes-add-button');
    this.emptyMessage = this.getByTestId('dishes-empty-message');
    this.dishesGrid = this.getByTestId('dishes-grid');
  }

  /**
   * Navigate to dishes page
   */
  async navigate() {
    await this.goto('/dishes');
  }

  /**
   * Navigate to add new dish and wait for URL
   */
  async goToNewDish() {
    await this.addButton.click();
    await this.waitForURL(/\/dishes\/new/);
  }

  /**
   * Find dish by name
   */
  findDishByName(name: string) {
    return this.page.getByText(name);
  }
}
