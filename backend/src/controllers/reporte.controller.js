const reporteService = require('../services/reporte.service');
const ApiResponse = require('../utils/ApiResponse');

const reporteController = {
  async dashboard(req, res, next) {
    try {
      const data = await reporteService.dashboard();
      ApiResponse.success(res, data);
    } catch (error) { next(error); }
  },
  async prestamosActivos(req, res, next) {
    try {
      const data = await reporteService.prestamosActivos();
      ApiResponse.success(res, data);
    } catch (error) { next(error); }
  },
  async sociosMorosos(req, res, next) {
    try {
      const data = await reporteService.sociosMorosos();
      ApiResponse.success(res, data);
    } catch (error) { next(error); }
  },
  async materialesPopulares(req, res, next) {
    try {
      const data = await reporteService.materialesPopulares();
      ApiResponse.success(res, data);
    } catch (error) { next(error); }
  },
  async historialPrestamos(req, res, next) {
    try {
      const data = await reporteService.historialPrestamos(req.query);
      ApiResponse.success(res, data);
    } catch (error) { next(error); }
  },
};

module.exports = reporteController;