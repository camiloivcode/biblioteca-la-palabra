const { Router } = require('express');
const { body } = require('express-validator');
const socioController = require('../controllers/socio.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/', socioController.getAll);
router.get('/:id', socioController.getById);
router.get('/:id/prestamos', socioController.getPrestamos);

router.post(
  '/',
  [
    body('nombre').notEmpty().trim().withMessage('El nombre es requerido'),
    body('apellido').notEmpty().trim().withMessage('El apellido es requerido'),
    body('dni').notEmpty().trim().withMessage('El DNI es requerido'),
    body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail().withMessage('Email inválido'),
    body('telefono').optional().trim(),
    body('direccion').optional().trim(),
  ],
  validate,
  socioController.create
);

router.put(
  '/:id',
  [
    body('nombre').optional().notEmpty().trim(),
    body('apellido').optional().notEmpty().trim(),
    body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  ],
  validate,
  socioController.update
);

router.delete('/:id', socioController.remove);

module.exports = router;