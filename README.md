# Biblioteca Popular La Palabra

Sistema de gestión bibliotecaria full stack con Node.js/Express, Astro y MySQL.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Astro + Bootstrap 5 + Tailwind CSS |
| **Backend** | Node.js + Express (CommonJS) |
| **Base de Datos** | MySQL 8 + Prisma ORM |
| **Auth** | JWT (access + refresh token) |
| **Contenedores** | Docker + Docker Compose |

## Inicio Rápido

```bash
cp .env.example .env
docker-compose up --build -d
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api |
| phpMyAdmin | http://localhost:8080 |

## Módulos

Dashboard, Socios, Materiales, Préstamos, Autores, Categorías, Usuarios (ADMIN), Reportes.

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [docs/architecture.md](docs/architecture.md) | Arquitectura, estructura del proyecto, flujo de requests |
| [docs/database.md](docs/database.md) | Schema, modelos, seed, reglas de negocio |
| [docs/frontend.md](docs/frontend.md) | Frontend: páginas, scripts, auth flow |
| [AGENTS.md](AGENTS.md) | Documentación técnica para asistentes IA |
| [CHANGELOG.md](CHANGELOG.md) | Historial de versiones |
