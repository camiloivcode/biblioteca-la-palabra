const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  validate,
  authController.login
);

router.post('/refresh', authController.refresh);
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);

router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  ],
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token requerido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  validate,
  authController.resetPassword
);

router.post(
  '/register-request',
  [
    body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('telefono').optional().trim(),
    body('mensaje').optional().trim(),
  ],
  validate,
  authController.registerRequest
);

module.exports = router;