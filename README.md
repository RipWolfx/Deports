# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Centro Deportivo Arete — App

## Arquitectura por n capas

Se organizó el proyecto en una estructura por capas clara y extensible, manteniendo compatibilidad con el código existente:

- Capa UI (`src/components`, `src/pages`):
  - Vistas y componentes React. Consumidores de casos de uso y utilidades.
- Capa Aplicación (`src/core/application`):
  - Casos de uso orquestan lógica con repositorios. Ej: `GenerateMonthlyReport.js`.
- Capa Dominio (`src/core/domain`):
  - Contratos y modelos del negocio. Ej: `repositories/StoreRepository.js` (interface documentada).
- Capa Infraestructura (`src/core/infrastructure`):
  - Adaptadores a la tecnología actual. Ej: `InMemoryStoreRepository.js` envuelve el `jsonStore`.
- Capa Shared (`src/core/shared`):
  - Utilidades transversales. Ej: `currency.js` con `formatSoles`.

### Beneficios
- Separación de responsabilidades y menor acoplamiento.
- Facilita cambiar almacenamiento (p. ej., API/DB) sin tocar vistas.
- Reutilización de utilidades y consistencia (ej. formato monetario).

### Adopción inicial
- `Reportes` usa `GenerateMonthlyReport` y el adaptador de infraestructura.
- `Activities`, `Contracts` y `Reservations` usan `formatSoles` para mostrar moneda en PEN.

### Próximos pasos sugeridos
- Migrar más casos de uso (reservas, accesos, inventario) a `core/application`.
- Definir repositorios específicos por agregado (ReservasRepository, ContratosRepository).
- Añadir tests por capa y CI básica.
