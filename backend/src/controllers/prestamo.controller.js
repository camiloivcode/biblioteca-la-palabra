const prestamoService = require('../services/prestamo.service');
const ApiResponse = require('../utils/ApiResponse');

const prestamoController = {
  async getAll(req, res, next) {
    try {
      const { estado, socioId, materialId, page, limit } = req.query;
      const { prestamos, total } = await prestamoService.findAll({ estado, socioId, materialId, page, limit });
      ApiResponse.paginated(res, prestamos, page || 1, limit || 20, total);
    } catch (error) { next(error); }
  },
  async getById(req, res, next) {
    try {
      const prestamo = await prestamoService.findById(parseInt(req.params.id));
      ApiResponse.success(res, prestamo);
    } catch (error) { next(error); }
  },
  async create(req, res, next) {
    try {
      const prestamo = await prestamoService.create(req.body);
      ApiResponse.created(res, prestamo, 'Préstamo registrado correctamente');
    } catch (error) { next(error); }
  },
  async devolver(req, res, next) {
    try {
      const prestamo = await prestamoService.devolver(parseInt(req.params.id));
      ApiResponse.success(res, prestamo, 'Devolución registrada correctamente');
    } catch (error) { next(error); }
  },
  async actualizarMora(req, res, next) {
    try {
      const result = await prestamoService.actualizarMora();
      ApiResponse.success(res, result);
    } catch (error) { next(error); }
  },
};

module.exports = prestamoController;