const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const jwtConfig = require('../config/jwt.config');
const AppError = require('../utils/AppError');

class AuthService {
  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        nombre: true,
        email: true,
        password: true,
        role: true,
        activo: true,
      },
    });

    if (!user) throw new AppError('Credenciales inválidas', 401);
    if (!user.activo) throw new AppError('Cuenta desactivada. Contacta al administrador', 403);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new AppError('Credenciales inválidas', 401);

    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
    const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });

    return {
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, jwtConfig.refreshSecret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, activo: true },
      });

      if (!user || !user.activo) throw new AppError('Usuario inválido', 401);

      const payload = { id: user.id, email: user.email, role: user.role };
      const accessToken = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

      return { accessToken };
    } catch {
      throw new AppError('Refresh token inválido o expirado', 401);
    }
  }

  async getMe(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nombre: true, email: true, role: true, createdAt: true },
    });
  }
}

module.exports = new AuthService();