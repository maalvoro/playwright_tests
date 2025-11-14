# MCP Agent Prompt Template

Usa este template para ejecutar tu MCP Agent con cualquier AI assistant:

## 📋 Cómo usar este template:

1. **Copia el contenido completo de `.mcp/agent.md`**
2. **Agrega el contexto del proyecto:**

```
---

## Project Context
- Project: Happy Testing WebApp  
- Base URL: http://localhost:3000
- Test Directory: tests
- Use Data-TestId Only: true
- Enforce POM: true
- Language: en

## Current Page Objects Available:
- BasePage
- LoginPage  
- RegisterPage
- DishesPage
- EditDishPage
- NewDishPage
- ViewDishPage
- NavigationPage

---
```

3. **Agrega tu solicitud específica:**

```
## User Request
[TU SOLICITUD AQUÍ]

Por ejemplo:
- "Generate comprehensive tests for dish editing functionality"
- "Create tests for user registration with validation scenarios"  
- "Generate navigation tests for responsive design"
```

4. **Envía todo el prompt a tu AI assistant**

## 🚀 Ejemplos de solicitudes:

### Para generar tests de dishes:
```
Generate comprehensive tests for the dishes CRUD functionality. Include:
- Creating dishes with all field combinations
- Viewing dish details  
- Editing existing dishes
- Deleting dishes with confirmation
- Error handling and boundary conditions
- Form validation scenarios
```

### Para generar tests de navegación:
```
Create exploratory navigation tests covering:
- Menu interactions
- Responsive design behavior  
- Deep linking
- Back/forward navigation
- Error page handling
- Authentication redirects
```

### Para generar tests de autenticación:
```
Generate authentication flow tests including:
- Login with valid/invalid credentials
- Registration with various input combinations
- Password validation rules
- Session management
- Logout functionality
- Remember me functionality
```

## 📁 Estructura de respuesta esperada:

El MCP Agent generará:

1. **Test Scenarios** - Lista detallada de casos de prueba
2. **Page Object Updates** - Mejoras a Page Objects si es necesario
3. **Test Implementation** - Código completo de Playwright
4. **Execution Instructions** - Comandos para ejecutar los tests
5. **Next Steps** - Sugerencias de mejoras futuras

## ✅ Validación:

Después de generar tests con MCP:
- Los tests usan solo `data-testid` selectors
- Siguen Page Object Model
- Incluyen assertions significativas
- Tienen nombres descriptivos y tags apropiados