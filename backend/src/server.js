require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  logger.info(` Servidor corriendo en http://localhost:${PORT}`);
  logger.info(` Biblioteca Popular La Palabra — API v1.0`);
  logger.info(` Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});