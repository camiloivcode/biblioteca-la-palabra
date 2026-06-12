# Base de Datos

## Modelo

```
User (1) ──── <no relation>
Socio (1) ──── (N) Prestamo (N) ──── (1) Material
Autor (1) ──── (N) Material
Categoria (1) ──── (N) Material
```

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema (ADMIN, BIBLIOTECARIO) |
| `socios` | Socios de la biblioteca |
| `autores` | Autores de materiales |
| `categorias` | Categorías de materiales (con icono) |
| `materiales` | Catálogo (libros, revistas, DVD, etc.) |
| `prestamos` | Préstamos de materiales a socios |

### Convenciones

- Nombres en español con `@@map` para las tablas
- `created_at` / `updated_at` con `@map`
- Timestamps automáticos con `@default(now())` y `@updatedAt`
- IDs autoincrementales como `Int @id @default(autoincrement())`

## Prisma

- Se usa `db push` en lugar de migraciones
- Después de cambios en `schema.prisma`:
  ```bash
  npm run db:generate   # Regenerar Prisma Client
  npm run db:push       # Sincronizar esquema con BD
  ```
- El directorio `migrations/` está en `.gitignore`

## Seed

El seed es **idempotente**: se puede ejecutar múltiples veces sin duplicar datos gracias a `upsert()`.

```bash
npm run db:seed
# o: node prisma/seed.js
```

### Datos sembrados

| Entidad | Cantidad |
|---------|----------|
| Usuarios | 2 (ADMIN + BIBLIOTECARIO) |
| Categorías | 6 (Literatura, Historia, Ciencias, Filosofía, Arte, Tecnología) |
| Autores | 5 (García Márquez, Borges, Allende, Vargas Llosa, Cortázar) |
| Socios | 3 (María González, Carlos López, Ana Martínez) |
| Materiales | 2 (Cien Años de Soledad, Ficciones) |

### Credenciales del seed

| Rol | Email | Contraseña |
|-----|-------|-----------|
| ADMIN | admin@biblioteca.com | Admin2024! |
| BIBLIOTECARIO | bibliotecario@biblioteca.com | Biblio2024! |

## Reglas de Negocio

### Préstamos
- Máximo 3 préstamos activos por socio
- Un socio en estado `MOROSO` no puede tomar nuevos préstamos
- Préstamos con más de 30 días de retraso pasan automáticamente a estado `MORA`
- No se puede prestar un material con stock 0 o en estado no disponible

### Materiales
- Al prestar un material: `stock--`, si llega a 0 → estado `PRESTADO`
- Al devolver: `stock++`, si vuelve a > 0 → estado `DISPONIBLE`

### Eliminaciones
- No se puede eliminar un autor con materiales asociados
- No se puede eliminar un socio con préstamos activos
- No se puede eliminar una categoría con materiales asociados
