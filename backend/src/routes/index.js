const { Router } = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const socioRoutes = require('./socio.routes');
const autorRoutes = require('./autor.routes');
const categoriaRoutes = require('./categoria.routes');
const materialRoutes = require('./material.routes');
const prestamoRoutes = require('./prestamo.routes');
const reporteRoutes = require('./reporte.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/socios', socioRoutes);
router.use('/autores', autorRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/materiales', materialRoutes);
router.use('/prestamos', prestamoRoutes);
router.use('/reportes', reporteRoutes);

module.exports = router;