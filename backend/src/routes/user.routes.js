const { Router } = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);

router.post(
  '/',
  [
    body('nombre').notEmpty().trim().withMessage('El nombre es requerido'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La contraseña debe tener al menos una mayúscula y un número'),
    body('role').isIn(['ADMIN', 'BIBLIOTECARIO']).withMessage('Rol inválido'),
  ],
  validate,
  userController.create
);

router.put(
  '/:id',
  [
    body('nombre').optional().notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['ADMIN', 'BIBLIOTECARIO']),
  ],
  validate,
  userController.update
);

router.patch('/:id/toggle', userController.toggleStatus);
router.delete('/:id', userController.remove);

module.exports = router;