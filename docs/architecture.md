# Arquitectura

## Estructura del Proyecto

```
biblioteca-la-palabra/
├── backend/                        # API Express (CommonJS)
│   ├── prisma/
│   │   ├── schema.prisma           # Modelo de datos
│   │   ├── seed.js                 # Datos de semilla
│   │   └── init.sql                # Inicialización MySQL
│   └── src/
│       ├── server.js               # Entry point
│       ├── app.js                  # Configuración Express
│       ├── config/
│       │   ├── database.js         # Singleton Prisma
│       │   ├── jwt.config.js       # JWT secret/expiración
│       │   └── mailer.js           # Transporter nodemailer
│       ├── controllers/            # Handlers de rutas
│       ├── services/               # Lógica de negocio
│       ├── routes/
│       │   └── index.js            # Montaje de rutas
│       ├── middlewares/
│       │   ├── auth.middleware.js   # Verificación JWT
│       │   ├── role.middleware.js   # Restricción por rol
│       │   ├── error.middleware.js  # Manejador global de errores
│       │   └── validate.middleware.js # Validación express-validator
│       └── utils/
│           ├── ApiResponse.js       # Formato de respuesta
│           └── AppError.js          # Clase de error personalizada
├── frontend/                       # Astro (output static)
│   ├── src/
│   │   ├── layouts/
│   │   │   ├── BaseLayout.astro    # Layout raíz (API_URL, scripts globales)
│   │   │   └── DashboardLayout.astro # Layout interno (sidebar)
│   │   ├── pages/
│   │   │   ├── login.astro
│   │   │   ├── forgot-password.astro
│   │   │   ├── reset-password.astro
│   │   │   ├── register.astro
│   │   │   └── dashboard/          # Páginas internas
│   │   ├── scripts/                # JS del lado cliente
│   │   │   ├── shared.js           # Utilidades globales
│   │   │   ├── api.js              # Cliente HTTP con auto-refresh
│   │   │   └── ...                 # Scripts por módulo
│   │   ├── components/
│   │   │   └── ui/                 # Componentes reutilizables
│   │   └── styles/
│   └── public/                     # Archivos estáticos
├── docs/                           # Documentación
├── docker-compose.yml
└── .env.example
```

## Backend — MVC con Servicios

```
Ruta → Controller → Service → Prisma → MySQL
                        ↓
                  AppError → error.middleware.js
```

### Flujo de una request

1. Express recibe la request
2. Pasa por middlewares globales (helmet, cors, morgan)
3. La ruta ejecuta validación con express-validator
4. Si hay auth middleware, verifica JWT y adjunta `req.user`
5. El controller llama al servicio correspondiente
6. El servicio ejecuta lógica de negocio + queries Prisma
7. Si hay error, se lanza `AppError` y lo captura `error.middleware.js`
8. Si éxito, se responde con `ApiResponse.success()`

### Formato de respuesta

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

### Manejo de errores

- `AppError` capturado por `error.middleware.js`
- También maneja errores de Prisma (P2002: unique constraint, P2025: not found, P2003: foreign key)
- Devuelve siempre el formato `{ success: false, message }`

## Autenticación

- **Access token**: JWT firmado, expira en 8h (configurable)
- **Refresh token**: JWT firmado con otro secreto, expira en 7d
- El frontend almacena ambos en `localStorage`
- El cliente `api.js` renueva automáticamente el access token al recibir 401

## Contenedores

| Servicio | Dockerfile | Puerto |
|----------|-----------|--------|
| MySQL 8.0 | — | 3307 |
| Backend (Node 20 Alpine) | `backend/Dockerfile` | 4000 |
| Frontend (Node 20 Alpine) | `frontend/Dockerfile` | 3000 |
| phpMyAdmin | — | 8080 |

El backend arranca ejecutando `prisma db push` + `seed.js` antes de iniciar el servidor.
