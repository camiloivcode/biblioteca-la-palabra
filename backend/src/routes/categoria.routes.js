const { Router } = require('express');
const { body } = require('express-validator');
const categoriaController = require('../controllers/categoria.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/', categoriaController.getAll);
router.get('/:id', categoriaController.getById);

router.post(
  '/',
  [
    body('nombre').notEmpty().trim().withMessage('El nombre es requerido'),
    body('descripcion').optional().trim(),
  ],
  validate,
  categoriaController.create
);

router.put('/:id', validate, categoriaController.update);
router.delete('/:id', categoriaController.remove);

module.exports = router;