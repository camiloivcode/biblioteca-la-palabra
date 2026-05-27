const socioService = require('../services/socio.service');
const ApiResponse = require('../utils/ApiResponse');

const socioController = {
  async getAll(req, res, next) {
    try {
      const { search, estado, page, limit } = req.query;
      const { socios, total } = await socioService.findAll({ search, estado, page, limit });
      ApiResponse.paginated(res, socios, page || 1, limit || 20, total);
    } catch (error) { next(error); }
  },

  async getById(req, res, next) {
    try {
      const socio = await socioService.findById(parseInt(req.params.id));
      ApiResponse.success(res, socio);
    } catch (error) { next(error); }
  },

  async create(req, res, next) {
    try {
      const socio = await socioService.create(req.body);
      ApiResponse.created(res, socio, 'Socio registrado correctamente');
    } catch (error) { next(error); }
  },

  async update(req, res, next) {
    try {
      const socio = await socioService.update(parseInt(req.params.id), req.body);
      ApiResponse.success(res, socio, 'Socio actualizado correctamente');
    } catch (error) { next(error); }
  },

  async remove(req, res, next) {
    try {
      const result = await socioService.remove(parseInt(req.params.id));
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  },

  async getPrestamos(req, res, next) {
    try {
      const prestamos = await socioService.getPrestamos(parseInt(req.params.id));
      ApiResponse.success(res, prestamos);
    } catch (error) { next(error); }
  },
};

module.exports = socioController;