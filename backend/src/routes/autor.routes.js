const { Router } = require('express');
const { body } = require('express-validator');
const autorController = require('../controllers/autor.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/', autorController.getAll);
router.get('/:id', autorController.getById);

router.post(
  '/',
  [
    body('nombre').notEmpty().trim().withMessage('El nombre es requerido'),
    body('apellido').notEmpty().trim().withMessage('El apellido es requerido'),
    body('nacionalidad').optional().trim(),
    body('biografia').optional().trim(),
  ],
  validate,
  autorController.create
);

router.put('/:id', validate, autorController.update);
router.delete('/:id', autorController.remove);

module.exports = router;