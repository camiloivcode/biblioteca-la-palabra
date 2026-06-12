# Frontend — Biblioteca La Palabra

Frontend Astro con Bootstrap 5, Tailwind CSS y jQuery.

## Comandos

```bash
npm run dev         # Servidor de desarrollo (puerto 3000)
npm run build       # Build estático a dist/
npm run css:build   # Compilar Tailwind CSS
```

## Estructura

```
src/
├── layouts/          # BaseLayout + DashboardLayout
├── pages/            # Páginas (login, dashboard/*, etc.)
├── scripts/          # JS del lado cliente (shared.js, api.js, módulos)
├── components/ui/    # Componentes reutilizables (Sidebar.astro)
└── styles/           # CSS (tailwind.src.css, global.css)
```

## Dependencias CDN

- Bootstrap 5.3, jQuery, SweetAlert2, DataTables
- Google Fonts (Inter), Material Symbols
- Cargados en `BaseLayout.astro`

## Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PUBLIC_API_URL` | `http://localhost:4000/api` | URL base de la API |

## Auth

Los tokens JWT se almacenan en `localStorage`. El cliente `api.js` maneja auto-refresh automático.
