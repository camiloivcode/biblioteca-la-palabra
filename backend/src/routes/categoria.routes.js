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
    body('icono').optional().trim().isIn([
      'menu_book', 'history', 'science', 'lightbulb', 'palette', 'computer',
      'calculate', 'public', 'music_note', 'emoji_events', 'category', 'book',
      'biotech', 'architecture', 'psychology', 'sports_esports', 'language',
      'travel_explore', 'newspaper', 'theater_comedy', 'pets', 'restaurant',
      'sailing', 'stadium', 'volcano', 'forest',
    ]).withMessage('Icono inválido'),
  ],
  validate,
  categoriaController.create
);

router.put(
  '/:id',
  [
    body('nombre').optional().trim(),
    body('descripcion').optional().trim(),
    body('icono').optional().trim().isIn([
      'menu_book', 'history', 'science', 'lightbulb', 'palette', 'computer',
      'calculate', 'public', 'music_note', 'emoji_events', 'category', 'book',
      'biotech', 'architecture', 'psychology', 'sports_esports', 'language',
      'travel_explore', 'newspaper', 'theater_comedy', 'pets', 'restaurant',
      'sailing', 'stadium', 'volcano', 'forest',
    ]).withMessage('Icono inválido'),
  ],
  validate,
  categoriaController.update
);
router.delete('/:id', categoriaController.remove);

module.exports = router;