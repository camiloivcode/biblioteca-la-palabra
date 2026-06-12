const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');

const userController = {
  async getAll(req, res, next) {
    try {
      const users = await userService.findAll();
      ApiResponse.success(res, users);
    } catch (error) { next(error); }
  },

  async getById(req, res, next) {
    try {
      const user = await userService.findById(parseInt(req.params.id));
      ApiResponse.success(res, user);
    } catch (error) { next(error); }
  },

  async create(req, res, next) {
    try {
      const user = await userService.create(req.body);
      ApiResponse.created(res, user, 'Usuario creado correctamente');
    } catch (error) { next(error); }
  },

  async update(req, res, next) {
    try {
      const user = await userService.update(parseInt(req.params.id), req.body);
      ApiResponse.success(res, user, 'Usuario actualizado correctamente');
    } catch (error) { next(error); }
  },

  async toggleStatus(req, res, next) {
    try {
      const user = await userService.toggleStatus(parseInt(req.params.id), req.user.id);
      ApiResponse.success(res, user, `Usuario ${user.activo ? 'activado' : 'desactivado'}`);
    } catch (error) { next(error); }
  },

  async remove(req, res, next) {
    try {
      const result = await userService.remove(parseInt(req.params.id), req.user.id);
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  },
};

module.exports = userController;