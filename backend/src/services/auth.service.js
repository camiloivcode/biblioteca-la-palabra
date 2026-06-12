const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const jwtConfig = require('../config/jwt.config');
const AppError = require('../utils/AppError');
const { sendPasswordResetEmail, sendRegisterRequestEmail } = require('../config/mailer');

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

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt,
      },
    });

    try {
      await sendPasswordResetEmail(user.email, user.nombre, rawToken);
    } catch (emailError) {
      console.error('Error al enviar email de recuperación:', emailError.message);
    }
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gte: new Date() },
      },
    });

    if (!user) throw new AppError('Token inválido o expirado', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }

  async registerRequest(data) {
    try {
      await sendRegisterRequestEmail(data);
    } catch (emailError) {
      console.error('Error al enviar solicitud de registro:', emailError.message);
    }
  }
}

module.exports = new AuthService();