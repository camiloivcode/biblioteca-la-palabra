# AGENTS.md — Biblioteca La Palabra

Full-stack library management system: Node.js/Express backend + Astro/Bootstrap 5 frontend + MySQL 8.

## Architecture

- **Backend** (`backend/`): CommonJS (require/module.exports), Express, Prisma ORM, MVC+Services.
  - Entry: `backend/src/server.js` → `app.js`
  - API root: `/api`, server port: 4000
  - Route modules in `src/routes/index.js`: `/auth`, `/users`, `/socios`, `/autores`, `/categorias`, `/materiales`, `/prestamos`, `/reportes`
- **Frontend** (`frontend/`): Astro (static output), Bootstrap 5, jQuery, DataTables, SweetAlert2 loaded via CDN. Client JS in `<script is:inline>` and classic `<script src>`.
  - Dev port: 3000
  - Auth token in `localStorage` (`accessToken`, `refreshToken`, `user`)
  - API base from `window.API_URL` set in `BaseLayout.astro` from `PUBLIC_API_URL` env var, fallback `http://localhost:4000/api`
  - `src/scripts/shared.js` loads first — exposes `window.showToast`, `window.getHeaders`, `window.estadoBadge`, `window.formatDate`, `window.showLoader`, `window.hideLoader`
  - `src/scripts/api.js` loads second — exposes `window.api` client with auto-refresh on 401 (`api.get/post/put/patch/del`)
  - External scripts (`auth.js`, `socios.js`, `materiales.js`, `prestamos.js`, `categorias.js`, `usuarios.js`, `forgot-password.js`, `reset-password.js`, `register.js`) use `window.api` and shared utilities
- **Database**: MySQL 8 with Prisma ORM. Tables mapped to Spanish names via `@@map`.

## Docker Quick Start

```bash
cp .env.example .env
docker-compose up --build -d
```

Services: backend (`:4000`), frontend (`:3000`), MySQL (`:3307`), phpMyAdmin (`:8080`).
Startup sequence: `npx prisma db push --accept-data-loss && node prisma/seed.js && npm run dev`

## Critical Setup & Conventions

- **Prisma**: Uses `db push` (not migrations). Migrations dir is gitignored. Run `npm run db:generate` after schema changes. VSCode setting: `prisma.pinToPrisma6: true`.
- **No tests** exist — no test framework in any `package.json`.
- **No linter/formatter** is configured.
- **Seed credentials** (see [docs/database.md](docs/database.md)): `admin@biblioteca.com` / `Admin2024!` (ADMIN), `bibliotecario@biblioteca.com` / `Biblio2024!` (BIBLIOTECARIO)
- **Business rules** enforced server-side in services (max 3 active loans, no loans if MOROSO, auto-mora after 30 days, cascade material state). Full details in [docs/database.md](docs/database.md).
- **API response format**: `{ success: bool, message: string, data: ..., meta?: ... }` via `ApiResponse` helper. Errors via `AppError` class caught by `error.middleware.js` (also handles Prisma error codes P2002/P2025/P2003).

## Dev Commands (run inside `backend/` or `frontend/`)

| Context | Command | Action |
|---------|---------|--------|
| Backend | `npm run dev` | Nodemon hot-reload server |
| Backend | `npm run db:generate` | Generate Prisma client |
| Backend | `npm run db:push` | Push schema to DB |
| Backend | `npm run db:seed` | Run `node prisma/seed.js` |
| Backend | `npm run db:studio` | Prisma Studio GUI |
| Frontend | `npm run dev` | Astro dev server |
| Frontend | `npm run build` | Static build to `dist/` |

## Key Files

- `backend/prisma/schema.prisma` — Data model (User, Socio, Autor, Categoria, Material, Prestamo)
- `backend/src/config/database.js` — Prisma singleton with query logging in dev
- `backend/src/config/mailer.js` — Nodemailer transporter for password reset & registration emails
- `backend/src/middlewares/auth.middleware.js` — JWT verification, attaches `req.user`
- `backend/src/middlewares/role.middleware.js` — `requireRole('ADMIN', ...)`
- `docker-compose.yml` — Full stack orchestration
