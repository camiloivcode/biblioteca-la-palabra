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
    // Stateless JWT — el cliente elimina el token
    ApiResponse.success(res, null, 'Sesión cerrada correctamente');
  },
};

module.exports = authController;