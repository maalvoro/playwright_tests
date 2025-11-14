# Playwright Tests - Happy Testing with MCP Integration

Este proyecto contiene las pruebas E2E para la aplicación Happy Testing usando Playwright con integración de **Model Context Protocol (MCP)** para generación inteligente de tests.

## � Características

- ✅ **Tests E2E con Playwright**
- ✅ **Page Object Model (POM)** obligatorio
- ✅ **Data-testid selectors** exclusivos
- ✅ **MCP Integration** para generación automática de tests
- ✅ **AI-powered test scenarios**

## �📋 Prerequisitos

- Node.js 18 o superior
- La aplicación `happy_testing` debe estar en el directorio padre (`../happy_testing`)
- **MCP Agent configurado** para generación de tests

## 🚀 Instalación

Instala las dependencias del proyecto:

```bash
npm install
```

Instala los navegadores de Playwright:

```bash
npx playwright install
```

## 🤖 MCP Integration

### ¿Qué es MCP?
**Model Context Protocol** permite generar tests automáticamente usando IA, siguiendo las mejores prácticas del proyecto.

### Configuración MCP
- **Agente**: `.mcp/agent.md` - Especializado en Playwright
- **Settings**: `.mcp/settings.json` - Configuración del proyecto
- **Schema**: `.mcp/schema.json` - Validación de configuración

## 🧪 Ejecutar Tests

### Ejecutar todos los tests

```bash
npm test
```

### Ejecutar tests con UI interactiva

```bash
npm run test:ui
```

### Ejecutar tests en modo headed (ver navegador)

```bash
npm run test:headed
```

### Ejecutar tests en modo debug

```bash
npm run test:debug
```

### Ejecutar solo tests de autenticación

```bash
npm run test:auth
```

### Ejecutar solo tests con sesión autenticada

```bash
npm run test:chromium
```

### Ver reporte de tests

```bash
npm run test:report
```

## 📁 Estructura del Proyecto

```
playwright_tests/
├── pages/                       # Page Object Model (POM)
│   ├── BasePage.ts             # Clase base con métodos comunes
│   ├── LoginPage.ts            # Page Object para login
│   ├── RegisterPage.ts         # Page Object para registro
│   ├── DishesPage.ts           # Page Object para lista de platillos
│   ├── NewDishPage.ts          # Page Object para crear platillos
│   ├── EditDishPage.ts         # Page Object para editar platillos
│   ├── ViewDishPage.ts         # Page Object para ver platillos
│   ├── NavigationPage.ts       # Page Object para navegación
│   └── index.ts                # Exportación de todos los Page Objects
├── tests/                       # Archivos de tests
│   ├── auth.setup.ts           # Setup de autenticación
│   ├── auth.spec.ts            # Tests de login/register
│   ├── dishes.spec.ts          # Tests de gestión de platillos
│   └── navigation.spec.ts      # Tests de navegación
├── playwright/                  # Archivos de Playwright
│   └── .auth/                  # Sesiones guardadas
├── playwright.config.ts         # Configuración de Playwright
├── package.json                # Dependencias y scripts
├── tsconfig.json               # Configuración de TypeScript
└── README.md                   # Esta documentación
```

## ⚙️ Configuración

El proyecto está configurado para:

- **BaseURL**: `http://localhost:3000` (la app se levanta automáticamente)
- **Timeout**: 30 segundos por test
- **Navegadores**: Chrome (chromium)
- **Patrón**: Page Object Model (POM) para mejor mantenibilidad
- **Proyectos**:
  - `setup`: Crea un usuario y guarda la sesión
  - `chromium`: Tests con sesión autenticada
  - `auth`: Tests de autenticación sin sesión

## 🎨 Page Object Model (POM)

Este proyecto usa el patrón POM para:

1. **Reutilización de código**: Los locators y métodos están centralizados
2. **Mantenibilidad**: Cambios en la UI solo requieren actualizar el Page Object
3. **Legibilidad**: Los tests son más claros y expresivos

**Ejemplo:**

```typescript
// Sin POM (antes)
await page.goto('/login');
await page.getByTestId('login-email-input').fill(email);
await page.getByTestId('login-password-input').fill(password);
await page.getByTestId('login-submit').click();

// Con POM (ahora)
const loginPage = new LoginPage(page);
await loginPage.navigate();
await loginPage.loginAndWaitForRedirect(email, password);
```

## 🔧 Notas Importantes

1. **Servidor automático**: El servidor de desarrollo de `happy_testing` se levanta automáticamente al ejecutar los tests.

2. **Autenticación**: Los tests usan dos estrategias:
   - Tests con sesión guardada (proyecto `chromium`)
   - Tests sin sesión (proyecto `auth`) para probar login/register

3. **Data test IDs**: Todos los tests usan `data-testid` para identificar elementos de manera confiable.

## 🐛 Troubleshooting

### Error: No se puede conectar al servidor

Asegúrate de que:
- El proyecto `happy_testing` existe en `../happy_testing`
- El puerto 3000 no está siendo usado por otra aplicación
- Las dependencias de `happy_testing` están instaladas

### Tests fallan en CI

Los tests están configurados para CI con:
- `forbidOnly: true` - Previene que `.only` se ejecute en CI
- `retries: 2` - Reintenta tests fallidos
- `workers: 1` - Ejecuta tests secuencialmente en CI

## 📚 Recursos

- [Documentación de Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen)
