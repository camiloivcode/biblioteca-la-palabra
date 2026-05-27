const categoriaService = require('../services/categoria.service');
const ApiResponse = require('../utils/ApiResponse');

const categoriaController = {
  async getAll(req, res, next) {
    try {
      const cats = await categoriaService.findAll();
      ApiResponse.success(res, cats);
    } catch (error) { next(error); }
  },
  async getById(req, res, next) {
    try {
      const cat = await categoriaService.findById(parseInt(req.params.id));
      ApiResponse.success(res, cat);
    } catch (error) { next(error); }
  },
  async create(req, res, next) {
    try {
      const cat = await categoriaService.create(req.body);
      ApiResponse.created(res, cat, 'Categoría creada correctamente');
    } catch (error) { next(error); }
  },
  async update(req, res, next) {
    try {
      const cat = await categoriaService.update(parseInt(req.params.id), req.body);
      ApiResponse.success(res, cat, 'Categoría actualizada');
    } catch (error) { next(error); }
  },
  async remove(req, res, next) {
    try {
      const result = await categoriaService.remove(parseInt(req.params.id));
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  },
};

module.exports = categoriaController;