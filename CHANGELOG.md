# Changelog

## [1.0.0] — 2026-06-12

### Añadido
- Sistema completo de autenticación JWT (login, refresh, logout)
- Módulo Socios CRUD con filtros y paginación
- Módulo Materiales CRUD con tipos y estados
- Módulo Préstamos con reglas de negocio (máx 3, mora automática a 30 días)
- Módulo Autores CRUD con validación de dependencias
- Módulo Categorías CRUD con selector de iconos
- Módulo Usuarios (solo ADMIN)
- Módulo Reportes (historial, morosos, materiales populares)
- Dashboard con estadísticas en tiempo real
- Recuperación de contraseña vía email (nodemailer)
- Solicitud de registro con notificación al admin
- Contenedores Docker con orquestación completa
- Seed de base de datos idempotente con upsert

### Cambiado
- Seed reescrito: upsert en todas las entidades, cero duplicados
- Categorías: icono almacenado en DB en lugar de asignación posicional
- Login: interfaz limpia sin credenciales de prueba visibles
- Documentación reestructurada en directorio `docs/`
