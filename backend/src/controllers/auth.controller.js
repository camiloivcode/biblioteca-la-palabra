const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      ApiResponse.success(res, result, 'Inicio de sesión exitoso');
    } catch (error) {
      next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token requerido', 400);
      }
      const result = await authService.refreshToken(refreshToken);
      ApiResponse.success(res, result, 'Token renovado');
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res) {
    ApiResponse.success(res, null, 'Sesión cerrada correctamente');
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      ApiResponse.success(res, null, 'Si el correo existe en el sistema, recibirás un enlace de recuperación');
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      ApiResponse.success(res, null, 'Contraseña actualizada correctamente');
    } catch (error) {
      next(error);
    }
  },

  async registerRequest(req, res, next) {
    try {
      const { nombre, email, telefono, mensaje } = req.body;
      await authService.registerRequest({ nombre, email, telefono, mensaje });
      ApiResponse.success(res, null, 'Tu solicitud ha sido enviada. El administrador se comunicará contigo.');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;