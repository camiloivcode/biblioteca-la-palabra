const { Router } = require('express');
const { body } = require('express-validator');
const materialController = require('../controllers/material.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/', materialController.getAll);
router.get('/:id', materialController.getById);

router.post(
  '/',
  [
    body('titulo').notEmpty().trim().withMessage('El título es requerido'),
    body('tipo').isIn(['LIBRO', 'REVISTA', 'DVD', 'PERIODICO', 'OTRO']).withMessage('Tipo inválido'),
    body('autorId').isInt({ min: 1 }).withMessage('Autor requerido'),
    body('categoriaId').isInt({ min: 1 }).withMessage('Categoría requerida'),
    body('stock').optional().isInt({ min: 1 }).withMessage('Stock debe ser positivo'),
    body('anioPubl').optional().isInt({ min: 1000, max: new Date().getFullYear() }),
  ],
  validate,
  materialController.create
);

router.put('/:id', validate, materialController.update);
router.delete('/:id', materialController.remove);

module.exports = router;