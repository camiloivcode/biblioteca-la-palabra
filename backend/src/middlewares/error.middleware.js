const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  let { statusCode = 500, message, errors } = err;

  // Log del error
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.url} — ${message}`, err.stack);
  } else {
    logger.warn(`${req.method} ${req.url} — ${statusCode}: ${message}`);
  }

  // Errores de Prisma
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'campo';
    message = `Ya existe un registro con ese ${field}`;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Registro no encontrado';
  }

  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Referencia inválida a recurso relacionado';
  }

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;