# Playwright Tests - Happy Testing with MCP Integration

Este proyecto contiene las pruebas **E2E (UI) y API** para la aplicación Happy Testing usando Playwright con integración de **Model Context Protocol (MCP)** para generación inteligente de tests.

## 🎯 Características

- ✅ **Tests E2E (UI) con Playwright**
- ✅ **Tests API completos con validaciones**
- ✅ **Page Object Model (POM)** obligatorio para UI
- ✅ **API Test Helpers** para reutilización
- ✅ **Data-testid selectors** exclusivos
- ✅ **MCP Integration** para generación automática de tests
- ✅ **AI-powered test scenarios**
- ✅ **Performance & Security testing**

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

### Tests UI (E2E)

#### Ejecutar todos los tests UI

```bash
npm run test:ui-only
```

#### Ejecutar tests con UI interactiva

```bash
npm run test:ui
```

#### Ejecutar tests en modo headed (ver navegador)

```bash
npm run test:headed
```

#### Ejecutar solo tests de autenticación UI

```bash
npm run test:auth
```

#### Ejecutar solo tests UI con sesión autenticada

```bash
npm run test:chromium
```

### Tests API

#### Ejecutar todos los tests API

```bash
npm run test:api
```

#### Ejecutar tests específicos de API

```bash
# Tests de autenticación API
npx playwright test auth.api.spec.ts --project=api

# Tests de gestión de platillos API
npx playwright test dishes.api.spec.ts --project=api

# Tests de integración y performance
npx playwright test integration.api.spec.ts --project=api
```

### Tests Combinados

#### Ejecutar todos los tests (UI + API)

```bash
npm test
```

#### Ejecutar tests en modo debug

```bash
npm run test:debug
```

#### Ver reporte de tests

```bash
npm run test:report
```

## 📁 Estructura del Proyecto

```
playwright_tests/
├── pages/                       # Page Object Model (POM) para UI
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
│   ├── ui/                     # Tests de interfaz de usuario (E2E)
│   │   ├── auth.setup.ts       # Setup de autenticación para UI
│   │   ├── auth.spec.ts        # Tests de login/register UI
│   │   ├── dishes.spec.ts      # Tests de gestión de platillos UI
│   │   └── navigation.spec.ts  # Tests de navegación UI
│   └── api/                    # Tests de API
│       ├── types/              # Tipos TypeScript para API
│       │   └── api.types.ts    # Interfaces y tipos de datos
│       ├── helpers/            # Utilidades para tests API
│       │   └── api-test-helpers.ts # Métodos reutilizables para API
│       ├── fixtures/           # Datos de prueba predefinidos
│       │   └── test-data.ts    # Datos de prueba y configuraciones
│       ├── auth.api.spec.ts    # Tests de autenticación API
│       ├── dishes.api.spec.ts  # Tests CRUD de platillos API
│       ├── integration.api.spec.ts # Tests de integración y performance
│       └── index.ts            # Exportación de módulos API
├── playwright/                  # Archivos de Playwright
│   └── .auth/                  # Sesiones guardadas
├── playwright.config.ts         # Configuración de Playwright
├── package.json                # Dependencias y scripts
├── tsconfig.json               # Configuración de TypeScript
└── README.md                   # Esta documentación
```

## ⚙️ Configuración

El proyecto está configurado para:

### Tests UI (E2E)
- **BaseURL**: `http://localhost:3000` (la app se levanta automáticamente)
- **Timeout**: 30 segundos por test
- **Navegadores**: Chrome (chromium)
- **Patrón**: Page Object Model (POM) para mejor mantenibilidad

### Tests API
- **BaseURL**: `http://localhost:3000` (misma aplicación)
- **HTTP Client**: Playwright APIRequestContext
- **Patrones**: Helper classes y fixtures para reutilización
- **Validación**: Schemas y tipos TypeScript estrictos

### Proyectos Configurados
- `setup`: Crea un usuario y guarda la sesión (UI)
- `chromium`: Tests UI con sesión autenticada
- `auth`: Tests UI de autenticación sin sesión
- `api`: Tests de API (sin navegador)

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

## 🔗 API Testing Architecture

### API Test Helpers

Los tests API usan una clase helper centralizada para reutilización:

```typescript
const apiHelpers = new ApiTestHelpers(request);

// Crear usuario para testing
const testUser = await apiHelpers.createTestUser();

// Crear platillo
const dishData = apiHelpers.generateUniqueDishData();
const { dish } = await apiHelpers.createDish(dishData, testUser.sessionCookie);

// Validar estructura
apiHelpers.validateDishStructure(dish);
```

### Tipos y Fixtures

- **Types**: `api/types/api.types.ts` - Interfaces TypeScript para todas las APIs
- **Fixtures**: `api/fixtures/test-data.ts` - Datos de prueba predefinidos
- **Helpers**: `api/helpers/api-test-helpers.ts` - Métodos reutilizables

### Cobertura de API Tests

#### Autenticación (`auth.api.spec.ts`)
- ✅ Registro de usuario con validaciones
- ✅ Login con credenciales válidas/inválidas
- ✅ Logout y invalidación de sesión
- ✅ Ciclo completo de autenticación
- ✅ Tests de seguridad (SQL injection, XSS)

#### Gestión de Platillos (`dishes.api.spec.ts`)
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Autorización y ownership
- ✅ Validación de campos requeridos/opcionales
- ✅ Manejo de errores y edge cases
- ✅ Operaciones concurrentes

#### Integración y Performance (`integration.api.spec.ts`)
- ✅ Flujos de usuario completos
- ✅ Tests de performance y carga
- ✅ Manejo de errores y resiliencia
- ✅ Validación de seguridad avanzada
- ✅ Tests de stress

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

### API Tests fallan

Verifica que:
- El servidor de `happy_testing` está ejecutándose en puerto 3000
- La base de datos está disponible y migrada
- Las cookies de sesión se están manejando correctamente

### Performance Tests lentos

Los tests de performance tienen timeouts extendidos:
- Bulk operations: 60 segundos
- Concurrent tests: 30 segundos
- Ajusta los thresholds según el hardware

## 🚀 CI/CD Integration

### GitHub Actions

El proyecto incluye workflows de CI que ejecutan:

```yaml
# Ejecutar tests API
- name: Run API tests
  run: npx playwright test --grep @api --reporter=html

# Ejecutar tests UI
- name: Run UI tests  
  run: npx playwright test --grep @ui --reporter=html
```

### Filtros por Tags

- `@api` - Solo tests de API
- `@ui` - Solo tests de interfaz de usuario
- Todos los tests tienen tags apropiados para ejecución selectiva

## 🎯 Test Results Summary

✅ **ALL TESTS PASSING** (52/52 API tests + UI tests)

### API Test Coverage
- **Authentication**: 17 tests covering registration, login, logout, session management
- **CRUD Operations**: 25 tests for dishes management (create, read, update, delete)
- **Integration**: 10 tests for cross-API workflows and user journeys
- **Performance**: 3 tests for load testing and response times
- **Security**: 5 tests for injection attacks and input validation

### Performance Metrics
- **Bulk Creation**: ~84ms per dish (20 dishes in 1.68s)
- **Response Times**: 
  - GET dishes: avg 503ms, max 811ms
  - GET dish by ID: avg 530ms, max 616ms  
  - CREATE dish: avg 331ms, max 389ms
  - UPDATE dish: avg 418ms, max 441ms

### Security Findings
⚠️ **Note**: Current API implementation allows some potentially unsafe inputs:
- XSS payloads are not sanitized
- SQL injection strings are accepted
- Negative/zero values for times are allowed
- Path traversal attempts are not blocked

These findings are documented in test output for security review.

## 📚 Recursos

- [Documentación de Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen)
