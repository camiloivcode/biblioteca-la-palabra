const { Router } = require('express');
const reporteController = require('../controllers/reporte.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/dashboard', reporteController.dashboard);
router.get('/prestamos-activos', reporteController.prestamosActivos);
router.get('/socios-morosos', reporteController.sociosMorosos);
router.get('/materiales-populares', reporteController.materialesPopulares);
router.get('/historial', reporteController.historialPrestamos);

module.exports = router;