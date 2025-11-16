# CI/CD Setup para Playwright Tests + Happy Testing

## 📋 Arquitectura del Proyecto

Este setup utiliza **repositorios separados** para mantener una arquitectura limpia y modular:

```
┌─────────────────────────────────────┐
│         GitHub Repositories         │
├─────────────────────────────────────┤
│  🧪 maalvoro/playwright_tests       │
│    ├── .github/workflows/          │
│    ├── tests/                      │
│    ├── pages/                      │
│    ├── playwright.config.ts        │
│    └── package.json                │
│                                     │
│  🚀 maalvoro/happy_testing          │
│    ├── src/app/                    │
│    ├── prisma/                     │
│    ├── package.json                │
│    └── next.config.ts              │
└─────────────────────────────────────┘
```

## 🔧 Configuración CI/CD Actual

### GitHub Actions Workflow (`playwright-ci.yml`)

El workflow está configurado para:

#### **1. Servicios de Base de Datos**
```yaml
services:
  postgres:
    image: postgres:18
    ports:
      - 5432:5432
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp_test
```

- **PostgreSQL 18** como servicio de GitHub Actions
- Base de datos de prueba: `myapp_test`
- Credenciales: `postgres/postgres`
- Puerto expuesto: `5432`

#### **2. Estrategia Multi-Repo**
```yaml
steps:
  - name: Checkout tests repo
    uses: actions/checkout@v5
    # Descarga playwright_tests (repo actual)

  - name: Checkout app repository into ./happy_testing
    uses: actions/checkout@v5
    with:
      repository: maalvoro/happy_testing
      path: happy_testing
      token: ${{ secrets.GITHUB_TOKEN }}
```

**¿Cómo funciona?**
1. Descarga el repo `playwright_tests` en la raíz del runner
2. Descarga el repo `happy_testing` dentro de la carpeta `./happy_testing/`
3. Estructura final en el runner:
   ```
   /home/runner/work/playwright_tests/playwright_tests/
   ├── tests/                    # Tests de Playwright
   ├── playwright.config.ts      # Configuración
   └── happy_testing/            # App descargada aquí
       ├── src/
       ├── prisma/
       └── package.json
   ```

#### **3. Instalación y Setup**
```yaml
- name: Install app dependencies
  run: |
    cd happy_testing
    npm ci

- name: Run DB migrations
  run: |
    until pg_isready -h postgres -p 5432 -U postgres; do sleep 2; done
    cd happy_testing
    npm run db:migrate

- name: Install test deps
  run: npm ci
```

**Orden de instalación:**
1. Instala dependencias de `happy_testing` (Next.js, Prisma, etc.)
2. Espera que PostgreSQL esté listo
3. Ejecuta migraciones Prisma desde `happy_testing`
4. Instala dependencias de Playwright

#### **4. Ejecución de Tests**
```yaml
- name: Run Playwright tests
  run: npm run test:e2e
```

**¿Qué sucede internamente?**
- `npm run test:e2e` ejecuta `playwright test`
- `playwright.config.ts` tiene configurado:
  ```typescript
  webServer: {
    command: 'cd ../happy_testing && npm run dev',
    url: 'http://localhost:3000',
  }
  ```
- Playwright inicia automáticamente la app con `npm run dev`
- Los tests se ejecutan contra `http://localhost:3000`

## 🎯 Configuración de Playwright

### `playwright.config.ts` - Configuración Clave

```typescript
export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'cd ../happy_testing && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Funcionalidades:**
- **baseURL**: Todos los tests usan `localhost:3000` como base
- **webServer.command**: Inicia la app desde la carpeta relativa
- **webServer.reuseExistingServer**: En CI siempre inicia servidor nuevo

### Scripts de `package.json`

```json
{
  "scripts": {
    "test": "npx playwright test",
    "test:e2e": "playwright test",
    "test:ui": "npx playwright test --ui",
    "test:headed": "npx playwright test --headed"
  }
}
```

## 🔐 Permisos y Tokens

### GitHub Token Configuration

El workflow usa `${{ secrets.GITHUB_TOKEN }}` para:
- Acceder al repo `maalvoro/happy_testing`
- Descargar código de repositorios del mismo owner
- **Requisito**: Ambos repos deben estar en la misma cuenta (`maalvoro`)

**Permisos automáticos del `GITHUB_TOKEN`:**
- ✅ Leer repos públicos del mismo owner
- ✅ Leer repos privados del mismo owner (si el workflow tiene permisos)
- ❌ No accede a repos de otros owners sin configuración adicional

## 🚀 Flujo de Deployment y Validación

### Paso 1: Preparar Cambios Localmente

```bash
# En playwright_tests/
git add .
git commit -m "Update CI workflow for multi-repo setup"
git push origin main
```

### Paso 2: Validar en GitHub Actions

1. **Ir a GitHub Actions**: https://github.com/maalvoro/playwright_tests/actions
2. **Verificar que el workflow se ejecute** automáticamente después del push
3. **Monitorear los pasos**:
   - ✅ Checkout repos
   - ✅ Install dependencies  
   - ✅ Database migrations
   - ✅ Install Playwright browsers
   - ✅ Run tests
   - ✅ Upload artifacts

### Paso 3: Debug si algo falla

**Errores comunes y soluciones:**

| Error | Causa | Solución |
|-------|--------|----------|
| `Repository not found: maalvoro/happy_testing` | Repo privado o no existe | Verificar que el repo existe y es accesible |
| `npm run db:migrate: command not found` | Script no existe en happy_testing | Verificar que `package.json` de happy_testing tiene el script |
| `webServer.command failed` | App no inicia correctamente | Revisar logs de `npm run dev` en happy_testing |
| `Tests timeout` | App no responde en puerto 3000 | Verificar que la app inicia correctamente |

## 📊 Artifacts y Reportes

### Playwright HTML Report

```yaml
- name: Upload Playwright HTML report
  if: ${{ !cancelled() }}
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

**¿Dónde encontrar reportes?**
1. Ve a la página del workflow en GitHub Actions
2. Busca la sección "Artifacts" al final de la ejecución
3. Descarga `playwright-report` para ver resultados detallados

## 🔄 Triggers del Workflow

```yaml
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
```

**El CI se ejecuta cuando:**
- ✅ Haces push a `main` o `master`
- ✅ Creas/actualizas Pull Request hacia `main` o `master`
- ✅ Manualmente desde GitHub Actions (si habilitas `workflow_dispatch`)

## 🎯 Ventajas de esta Arquitectura

### ✅ Beneficios

1. **Separación de responsabilidades**
   - Tests en un repo dedicado
   - App en repo separado
   - Cada uno con su propio ciclo de vida

2. **Flexibilidad de versionado**
   - Tests pueden evolucionar independientemente
   - App puede tener releases sin afectar tests
   - Diferentes equipos pueden trabajar en paralelo

3. **Reutilización**
   - Los tests pueden usarse contra diferentes versiones de la app
   - Fácil integración con environments (staging, production)

4. **CI/CD escalable**
   - Workflows independientes por repo
   - Posibilidad de matrix builds
   - Configuración específica por proyecto

### ⚠️ Consideraciones

1. **Dependencia entre repos**
   - Tests dependen de la estructura de la app
   - Cambios en la app pueden romper tests

2. **Sincronización de versiones**
   - Mantener compatibilidad entre versiones
   - Documentar breaking changes

## 🚀 Next Steps Sugeridos

### Immediatos (Esta semana)
- [ ] Hacer push de los cambios al workflow
- [ ] Validar primera ejecución en GitHub Actions
- [ ] Verificar que todos los tests pasen

### Mejoras futuras
- [ ] Añadir matrix builds (múltiples navegadores)
- [ ] Configurar environments (staging/production)
- [ ] Implementar test sharding para paralelización
- [ ] Añadir notificaciones Slack/Teams

## 📞 Troubleshooting

Si encuentras problemas:

1. **Revisar logs del workflow** en GitHub Actions
2. **Verificar que ambos repos estén accesibles**
3. **Confirmar que `happy_testing` tiene el script `db:migrate`**
4. **Validar que la app inicia correctamente con `npm run dev`**

---

**¿Todo listo para deployment?** 
Cuando hagas push de estos cambios, el CI debería ejecutarse automáticamente y los tests deberían pasar sin problemas. 🎉