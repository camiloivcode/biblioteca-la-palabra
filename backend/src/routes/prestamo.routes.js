const { Router } = require('express');
const { body } = require('express-validator');
const prestamoController = require('../controllers/prestamo.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/', prestamoController.getAll);
router.get('/:id', prestamoController.getById);

router.post(
  '/',
  [
    body('socioId').isInt({ min: 1 }).withMessage('Socio requerido'),
    body('materialId').isInt({ min: 1 }).withMessage('Material requerido'),
    body('observaciones').optional().trim(),
  ],
  validate,
  prestamoController.create
);

router.patch('/:id/devolver', prestamoController.devolver);
router.patch('/actualizar-mora', prestamoController.actualizarMora);

module.exports = router;