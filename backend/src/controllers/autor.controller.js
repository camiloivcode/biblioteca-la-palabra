const autorService = require('../services/autor.service');
const ApiResponse = require('../utils/ApiResponse');

const autorController = {
  async getAll(req, res, next) {
    try {
      const autores = await autorService.findAll(req.query.search);
      ApiResponse.success(res, autores);
    } catch (error) { next(error); }
  },
  async getById(req, res, next) {
    try {
      const autor = await autorService.findById(parseInt(req.params.id));
      ApiResponse.success(res, autor);
    } catch (error) { next(error); }
  },
  async create(req, res, next) {
    try {
      const autor = await autorService.create(req.body);
      ApiResponse.created(res, autor, 'Autor creado correctamente');
    } catch (error) { next(error); }
  },
  async update(req, res, next) {
    try {
      const autor = await autorService.update(parseInt(req.params.id), req.body);
      ApiResponse.success(res, autor, 'Autor actualizado correctamente');
    } catch (error) { next(error); }
  },
  async remove(req, res, next) {
    try {
      const result = await autorService.remove(parseInt(req.params.id));
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  },
};

module.exports = autorController;