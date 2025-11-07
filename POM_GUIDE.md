# 🎨 Guía del Page Object Model (POM)

Este proyecto usa el patrón **Page Object Model** para organizar y mantener los tests de manera eficiente.

## 📖 ¿Qué es Page Object Model?

Es un patrón de diseño que crea una capa de abstracción entre los tests y la interfaz de usuario. Cada página de la aplicación tiene su propio "Page Object" que encapsula los locators y las interacciones.

## 🏗️ Estructura de un Page Object

### BasePage - Clase Padre

Todos los Page Objects heredan de `BasePage`:

```typescript
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }
}
```

### Page Object Específico

Ejemplo: `LoginPage.ts`

```typescript
export class LoginPage extends BasePage {
  // 1. Definir locators como propiedades
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    // 2. Inicializar locators en el constructor
    this.emailInput = this.getByTestId('login-email-input');
    this.passwordInput = this.getByTestId('login-password-input');
    this.submitButton = this.getByTestId('login-submit');
  }

  // 3. Métodos de acción
  async navigate() {
    await this.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  // 4. Métodos de flujo completo
  async loginAndWaitForRedirect(email: string, password: string) {
    await this.login(email, password);
    await this.waitForURL(/\/dishes/);
  }
}
```

## 📚 Page Objects Disponibles

### 1. **BasePage**
- Métodos comunes para todos los Page Objects
- `goto()`, `getByTestId()`, `waitForURL()`, etc.

### 2. **LoginPage**
- Página de inicio de sesión
- Métodos: `navigate()`, `login()`, `loginAndWaitForRedirect()`, `goToRegister()`

### 3. **RegisterPage**
- Página de registro
- Métodos: `navigate()`, `register()`, `registerAndWaitForRedirect()`, `goToLogin()`

### 4. **DishesPage**
- Lista de platillos
- Métodos: `navigate()`, `goToNewDish()`, `clickViewDish()`, `clickEditDish()`, `clickDeleteDish()`

### 5. **NewDishPage**
- Formulario para crear platillos
- Métodos: `navigate()`, `createDish()`, `createDishAndWaitForRedirect()`, `addStep()`

### 6. **EditDishPage**
- Formulario para editar platillos
- Métodos: `navigate()`, `updateDish()`, `updateDishAndWaitForRedirect()`

### 7. **ViewDishPage**
- Vista detallada de un platillo
- Métodos: `navigate()`, `getStepText()`, `getAllStepTexts()`

### 8. **NavigationPage**
- Navegación y layout
- Métodos: `goToDishes()`, `logout()`, `logoutAndWaitForRedirect()`

## 💡 Cómo Usar en Tests

### Antes (Sin POM)

```typescript
test('should login', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill('test@example.com');
  await page.getByTestId('login-password-input').fill('password123');
  await page.getByTestId('login-submit').click();
  await page.waitForURL(/\/dishes/);
  await expect(page).toHaveURL(/\/dishes/);
});
```

### Después (Con POM)

```typescript
test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.loginAndWaitForRedirect('test@example.com', 'password123');
  await expect(page).toHaveURL(/\/dishes/);
});
```

## 🎯 Ventajas del POM

### 1. **Mantenibilidad** 🔧
Si cambia un `data-testid`, solo actualizas el Page Object:

```typescript
// Antes: Actualizar en 15 tests
await page.getByTestId('login-email-input').fill(email);

// Después: Actualizar solo en LoginPage.ts
this.emailInput = this.getByTestId('NEW-login-email');
// Los 15 tests siguen funcionando sin cambios
```

### 2. **Reutilización** ♻️
```typescript
// Usar el mismo método en múltiples tests
const loginPage = new LoginPage(page);
await loginPage.loginAndWaitForRedirect(email, password);
```

### 3. **Legibilidad** 📖
```typescript
// Código auto-documentado
await dishesPage.clickViewDish(0);
// vs
await page.getByTestId('dish-card').first().getByTestId('dish-view-link').click();
```

### 4. **Tipado Fuerte** 💪
```typescript
// TypeScript ayuda con autocompletado
const loginPage = new LoginPage(page);
loginPage. // ← IDE muestra: navigate(), login(), loginAndWaitForRedirect()
```

## 🛠️ Crear un Nuevo Page Object

1. **Crear el archivo** en `/pages/MiPage.ts`

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MiPage extends BasePage {
  // Locators
  readonly miBoton: Locator;
  readonly miInput: Locator;

  constructor(page: Page) {
    super(page);
    this.miBoton = this.getByTestId('mi-boton');
    this.miInput = this.getByTestId('mi-input');
  }

  async navigate() {
    await this.goto('/mi-ruta');
  }

  async hacerAlgo() {
    await this.miInput.fill('texto');
    await this.miBoton.click();
  }
}
```

2. **Exportar** en `/pages/index.ts`

```typescript
export { MiPage } from './MiPage';
```

3. **Usar** en tests

```typescript
import { MiPage } from '../pages';

test('mi test', async ({ page }) => {
  const miPage = new MiPage(page);
  await miPage.navigate();
  await miPage.hacerAlgo();
});
```

## 📋 Best Practices

### ✅ DO (Hacer)

```typescript
// 1. Métodos descriptivos
async loginAndWaitForRedirect(email: string, password: string)

// 2. Métodos de acción simples
async login(email: string, password: string)

// 3. Métodos para flujos completos
async createDishAndWaitForRedirect(data: DishData)

// 4. Usar tipos para datos complejos
interface DishData {
  name: string;
  description: string;
  steps: string[];
}
```

### ❌ DON'T (No hacer)

```typescript
// 1. No poner aserciones en Page Objects
async login(email: string, password: string) {
  await this.emailInput.fill(email);
  await expect(this.emailInput).toHaveValue(email); // ❌ NO
}

// 2. No hacer demasiada lógica en Page Objects
async doEverything() {
  // ❌ Método muy complejo
}

// 3. No acceder directamente a page en los tests
test('mi test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/login'); // ❌ Usar loginPage.navigate()
});
```

## 🎓 Ejercicio Práctico

Intenta crear un nuevo Page Object para una página hipotética de "Profile":

```typescript
// pages/ProfilePage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  readonly nameInput: Locator;
  readonly emailDisplay: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    // TODO: Inicializar locators
  }

  async navigate() {
    // TODO: Navegar a /profile
  }

  async updateName(newName: string) {
    // TODO: Actualizar nombre
  }
}
```

## 📚 Recursos

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
