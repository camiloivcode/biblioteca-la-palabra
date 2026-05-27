const materialService = require('../services/material.service');
const ApiResponse = require('../utils/ApiResponse');

const materialController = {
  async getAll(req, res, next) {
    try {
      const { search, tipo, estado, categoriaId, autorId, page, limit } = req.query;
      const { materiales, total } = await materialService.findAll({ search, tipo, estado, categoriaId, autorId, page, limit });
      ApiResponse.paginated(res, materiales, page || 1, limit || 20, total);
    } catch (error) { next(error); }
  },
  async getById(req, res, next) {
    try {
      const material = await materialService.findById(parseInt(req.params.id));
      ApiResponse.success(res, material);
    } catch (error) { next(error); }
  },
  async create(req, res, next) {
    try {
      const material = await materialService.create(req.body);
      ApiResponse.created(res, material, 'Material registrado correctamente');
    } catch (error) { next(error); }
  },
  async update(req, res, next) {
    try {
      const material = await materialService.update(parseInt(req.params.id), req.body);
      ApiResponse.success(res, material, 'Material actualizado correctamente');
    } catch (error) { next(error); }
  },
  async remove(req, res, next) {
    try {
      const result = await materialService.remove(parseInt(req.params.id));
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  },
};

module.exports = materialController;