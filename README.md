# 📚 Biblioteca Popular La Palabra

Sistema de gestión bibliotecaria full stack, desarrollado con tecnologías modernas, arquitectura MVC, JWT y Docker.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Astro + Bootstrap 5 |
| **Backend** | Node.js + Express |
| **Base de Datos** | MySQL 8 |
| **ORM** | Prisma |
| **Auth** | JWT (Access + Refresh Token) |
| **Contenedores** | Docker + Docker Compose |
| **Arquitectura** | MVC con servicios desacoplados |

---

## 🚀 Inicio Rápido con Docker

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/biblioteca-la-palabra.git
cd biblioteca-la-palabra

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar todos los servicios
docker-compose up --build -d

# 4. Ver logs
docker-compose logs -f backend
```

El sistema estará disponible en:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:4000/api
- **Health check:** http://localhost:4000/health

---

## 🔑 Credenciales por Defecto

| Usuario | Email | Contraseña | Rol |
|---------|-------|-----------|-----|
| Administrador | admin@biblioteca.com | Admin2024! | ADMIN |
| Bibliotecario | bibliotecario@biblioteca.com | Biblio2024! | BIBLIOTECARIO |

---

## 📋 Módulos del Sistema

- **Dashboard** — estadísticas en tiempo real
- **Socios** — CRUD completo con filtros y paginación
- **Materiales** — catálogo con tipos y estados
- **Préstamos** — registro y devolución con reglas de negocio
- **Autores** — gestión con validación de dependencias
- **Categorías** — organización del catálogo
- **Usuarios** — solo ADMIN
- **Reportes** — historial, morosos, materiales populares

---

## ⚙️ Reglas de Negocio Implementadas

- ✅ Máximo 3 préstamos activos por socio
- ✅ Material no puede prestarse si está agotado
- ✅ Préstamos superiores a 30 días → MORA automática
- ✅ Socios en mora → no pueden realizar nuevos préstamos
- ✅ No se puede eliminar un autor con materiales asociados
- ✅ No se puede eliminar un socio con préstamos activos

---

## 📁 Estructura del Proyecto