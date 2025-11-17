import { test, expect } from '@playwright/test';
import { DishesPage, NewDishPage, EditDishPage, ViewDishPage } from '../pages';

test.describe('Dishes Management', () => {
  let dishesPage: DishesPage;
  let newDishPage: NewDishPage;
  let editDishPage: EditDishPage;
  let viewDishPage: ViewDishPage;

  // Ya estamos autenticados vía storageState del setup
  test.beforeEach(async ({ page }) => {
    dishesPage = new DishesPage(page);
    newDishPage = new NewDishPage(page);
    editDishPage = new EditDishPage(page);
    viewDishPage = new ViewDishPage(page);
    
    await dishesPage.navigate();
  });

  test('should display dishes list page correctly', async () => {
    await expect(dishesPage.container).toBeVisible();
    await expect(dishesPage.header).toBeVisible();
    await expect(dishesPage.title).toHaveText('Sugerencias de Platillos');
    await expect(dishesPage.addButton).toBeVisible();
  });

  test('should show empty state when no dishes', async () => {
    if (await dishesPage.emptyMessage.isVisible()) {
      await expect(dishesPage.emptyMessage).toHaveText('No hay platillos registrados.');
    }
  });

  test('should navigate to new dish form', async ({ page }) => {
    await dishesPage.goToNewDish();
    await expect(page).toHaveURL(/\/dishes\/new/);
    await expect(newDishPage.form).toBeVisible();
  });

  test('should create a new dish successfully', async ({ page }) => {
    const dishName = `Test Dish ${Date.now()}`;
    
    await newDishPage.navigate();
    await newDishPage.createDishAndWaitForRedirect({
      name: dishName,
      description: 'A delicious test dish',
      prepTime: '10',
      cookTime: '15',
      calories: '350',
      steps: ['Mix all ingredients'],
    });
    
    await expect(page).toHaveURL(/\/dishes$/);
    await expect(dishesPage.dishesGrid).toBeVisible();
    await expect(dishesPage.findDishByName(dishName)).toBeVisible();
  });

  test('should add multiple steps to a dish', async ({ page }) => {
    await newDishPage.navigate();
    await newDishPage.createDishAndWaitForRedirect({
      name: 'Multi-step Dish',
      description: 'Test description',
      prepTime: '5',
      cookTime: '10',
      steps: ['Step 1', 'Step 2', 'Step 3'],
    });
    
    await expect(page).toHaveURL(/\/dishes$/);
  });

  test('should toggle quick prep checkbox', async () => {
    await newDishPage.navigate();
    
    await expect(newDishPage.quickPrepCheckbox).not.toBeChecked();
    await newDishPage.quickPrepCheckbox.check();
    await expect(newDishPage.quickPrepCheckbox).toBeChecked();
    await newDishPage.quickPrepCheckbox.uncheck();
    await expect(newDishPage.quickPrepCheckbox).not.toBeChecked();
  });

  test('should display dish card with all information', async ({ page }) => {
    const dishName = `Card Test ${Date.now()}`;
    
    await newDishPage.navigate();
    await newDishPage.createDishAndWaitForRedirect({
      name: dishName,
      description: 'Card description',
      prepTime: '8',
      cookTime: '12',
      calories: '250',
      steps: ['Test step'],
    });

    await expect(page).toHaveURL(/\/dishes$/);
    
    // Buscar el dish específico que acabamos de crear
    const dishCard = page.getByTestId('dish-card').filter({ hasText: dishName });
    await expect(dishCard).toBeVisible();
    await expect(dishCard.getByTestId('dish-name')).toContainText(dishName);
    await expect(dishCard.getByTestId('dish-description')).toContainText('Card description');
    await expect(dishCard.getByTestId('dish-time-badge')).toBeVisible();
  });

  test('should navigate to view dish detail', async ({ page }) => {
    const dishName = `View Test ${Date.now()}`;
    
    await newDishPage.navigate();
    await newDishPage.createDishAndWaitForRedirect({
      name: dishName,
      description: 'View description',
      prepTime: '5',
      cookTime: '10',
      steps: ['Step 1'],
    });
    
    // Buscar y hacer click en el dish específico
    const dishCard = page.getByTestId('dish-card').filter({ hasText: dishName });
    await dishCard.getByTestId('dish-view-link').click();
    
    await expect(page).toHaveURL(/\/dishes\/\d+\/view/);
    await expect(viewDishPage.container).toBeVisible();
  });

  test('should navigate to edit dish', async ({ page }) => {
    const dishName = `Edit Test ${Date.now()}`;
    
    await newDishPage.navigate();
    await newDishPage.createDishAndWaitForRedirect({
      name: dishName,
      description: 'Edit description',
      prepTime: '5',
      cookTime: '10',
      steps: ['Step 1'],
    });
    
    // Buscar y hacer click en el dish específico
    const dishCard = page.getByTestId('dish-card').filter({ hasText: dishName });
    await dishCard.getByTestId('dish-edit-link').click();
    
    await expect(page).toHaveURL(/\/dishes\/\d+$/);
    await expect(editDishPage.form).toBeVisible();
  });

  test('should edit a dish successfully', async ({ page }) => {
    const originalName = `Original ${Date.now()}`;
    const updatedName = `Updated ${Date.now()}`;
    
    await newDishPage.navigate();
    await newDishPage.createDishAndWaitForRedirect({
      name: originalName,
      description: 'Original description',
      prepTime: '5',
      cookTime: '10',
      steps: ['Step 1'],
    });
    
    // Buscar y hacer click en el dish específico
    const dishCard = page.getByTestId('dish-card').filter({ hasText: originalName });
    await dishCard.getByTestId('dish-edit-link').click();
    
    await editDishPage.updateDishAndWaitForRedirect({
      name: updatedName,
      description: 'Updated description',
    });
    
    await expect(page).toHaveURL(/\/dishes$/);
    
    // Wait for the page to update with the new data
    await dishesPage.waitForDishListUpdate();
    
    await expect(dishesPage.findDishByName(updatedName)).toBeVisible();
  });

  test('should delete a dish', async ({ page }) => {
    const dishName = `Delete Test ${Date.now()}`;
    
    await newDishPage.navigate();
    await newDishPage.createDishAndWaitForRedirect({
      name: dishName,
      description: 'To be deleted',
      prepTime: '5',
      cookTime: '10',
      steps: ['Step 1'],
    });
    
    // Buscar el dish específico y eliminarlo
    const dishCard = page.getByTestId('dish-card').filter({ hasText: dishName });
    await dishCard.getByTestId('dish-delete-button').click();
    
    // Esperar a que el dish desaparezca
    await expect(dishesPage.findDishByName(dishName)).not.toBeVisible({ timeout: 10000 });
  });

  test('should display dish in view mode with all details', async ({ page }) => {
    const dishName = `Complete View ${Date.now()}`;
    
    await newDishPage.navigate();
    await newDishPage.createDishAndWaitForRedirect({
      name: dishName,
      description: 'Complete description for viewing',
      prepTime: '15',
      cookTime: '25',
      calories: '450',
      steps: ['First step', 'Second step'],
    });
    
    // Buscar y hacer click en el dish específico
    const dishCard = page.getByTestId('dish-card').filter({ hasText: dishName });
    await dishCard.getByTestId('dish-view-link').click();
    
    await expect(viewDishPage.name).toHaveText(dishName);
    await expect(viewDishPage.description).toContainText('Complete description');
    await expect(viewDishPage.timeBadge).toBeVisible();
    await expect(viewDishPage.calories).toContainText('450 kcal');
    await expect(viewDishPage.stepsSection).toBeVisible();
    await expect(viewDishPage.getFirstStepText()).toContainText('First step');
  });
});
