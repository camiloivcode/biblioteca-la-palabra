const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');
const AppError = require('../utils/AppError');
const prisma = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de acceso requerido', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Sesión expirada. Por favor, inicia sesión nuevamente', 401);
      }
      throw new AppError('Token inválido', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, nombre: true, email: true, role: true, activo: true },
    });

    if (!user) throw new AppError('Usuario no encontrado', 401);
    if (!user.activo) throw new AppError('Cuenta desactivada. Contacta al administrador', 403);

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;