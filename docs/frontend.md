# Frontend

## Stack

- **Framework**: Astro (output static)
- **Estilos**: Bootstrap 5 + Tailwind CSS + Material Symbols
- **JS**: jQuery + SweetAlert2 + DataTables (cargados vía CDN)
- **Auth**: JWT almacenado en `localStorage`

## Estructura de Páginas

```
src/pages/
├── login.astro                      # Inicio de sesión
├── forgot-password.astro            # Recuperación de contraseña
├── reset-password.astro             # Restablecer contraseña (vía token)
├── register.astro                   # Solicitud de registro
├── dashboard/                       # Páginas protegidas (requieren auth)
│   ├── index.astro                  # Dashboard principal
│   ├── socios.astro                 # CRUD Socios
│   ├── materiales.astro             # CRUD Materiales
│   ├── prestamos.astro              # CRUD Préstamos
│   ├── autores.astro                # CRUD Autores
│   ├── categorias.astro             # CRUD Categorías (con selector de iconos)
│   ├── usuarios.astro               # CRUD Usuarios (solo ADMIN)
│   └── reportes.astro               # Reportes y estadísticas
```

## Scripts del Cliente

| Script | Rol |
|--------|-----|
| `shared.js` | Utilidades globales (`showToast`, `getHeaders`, `estadoBadge`, `showLoader`) |
| `api.js` | Cliente HTTP con auto-refresh de token en 401 |
| `auth.js` | Login: validación, POST, almacenamiento de tokens |
| `forgot-password.js` | Formulario de recuperación de contraseña |
| `reset-password.js` | Formulario de restablecimiento con validación de token |
| `register.js` | Formulario de solicitud de registro |
| `socios.js` | CRUD Socios con DataTables |
| `materiales.js` | CRUD Materiales con filtros |
| `prestamos.js` | CRUD Préstamos con reglas de negocio |
| `categorias.js` | CRUD Categorías con selector de iconos |
| `usuarios.js` | CRUD Usuarios (solo ADMIN) |

## Flujo de Autenticación

1. Login → POST `/api/auth/login` → recibe `{ accessToken, refreshToken, user }`
2. Se almacena en `localStorage`: `accessToken`, `refreshToken`, `user`
3. Cada request del cliente `api.js` envía `Authorization: Bearer <accessToken>`
4. Si el backend responde 401, `api.js` automáticamente:
   - POST `/api/auth/refresh` con `refreshToken`
   - Si funciona: reemplaza `accessToken` y reintenta la request original
   - Si falla: limpia `localStorage` y redirige a `/login`

## Layouts

- **BaseLayout.astro**: Layout raíz. Carga Google Fonts, Material Symbols, SweetAlert2 CDN, `shared.js` y `api.js`. Inyecta `window.API_URL`.
- **DashboardLayout.astro**: Layout interno con sidebar. Verifica que el usuario esté autenticado.

## API_URL

Se configura con `PUBLIC_API_URL` (variable de entorno del contenedor) o fallback a `http://localhost:4000/api`.

## Convenciones

- Los scripts se cargan con `<script src>` o `<script is:inline>` (no módulos ES)
- Las variables globales se exponen en `window.*`
- Los módulos específicos (`socios.js`, etc.) usan `window.api` y `window.getHeaders()`
- SweetAlert2 se usa para toasts (`showToast`) y confirmaciones
- Las respuestas de error se muestran con `showToast('error', message)`
