const prisma = require('../config/database');

class ReporteService {
  async dashboard() {
    const [
      totalSocios,
      sociosActivos,
      sociosMorosos,
      totalMateriales,
      materialesDisponibles,
      materialesPrestados,
      prestamosActivos,
      prestamosHoy,
      devoluccionesHoy,
    ] = await Promise.all([
      prisma.socio.count(),
      prisma.socio.count({ where: { estado: 'ACTIVO' } }),
      prisma.socio.count({ where: { estado: 'MOROSO' } }),
      prisma.material.count(),
      prisma.material.count({ where: { estado: 'DISPONIBLE' } }),
      prisma.material.count({ where: { estado: 'PRESTADO' } }),
      prisma.prestamo.count({ where: { estado: { in: ['ACTIVO', 'MORA'] } } }),
      prisma.prestamo.count({
        where: {
          fechaPrestamo: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.prestamo.count({
        where: {
          estado: 'DEVUELTO',
          fechaDevReal: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return {
      socios: { total: totalSocios, activos: sociosActivos, morosos: sociosMorosos },
      materiales: { total: totalMateriales, disponibles: materialesDisponibles, prestados: materialesPrestados },
      prestamos: { activos: prestamosActivos, hoy: prestamosHoy, devoluccionesHoy },
    };
  }

  async prestamosActivos() {
    return await prisma.prestamo.findMany({
      where: { estado: { in: ['ACTIVO', 'MORA'] } },
      include: {
        socio: { select: { nombre: true, apellido: true, dni: true } },
        material: { select: { titulo: true, tipo: true } },
      },
      orderBy: { fechaDevolucion: 'asc' },
    });
  }

  async sociosMorosos() {
    return await prisma.socio.findMany({
      where: { estado: 'MOROSO' },
      include: {
        prestamos: {
          where: { estado: 'MORA' },
          include: { material: { select: { titulo: true } } },
        },
        _count: { select: { prestamos: true } },
      },
    });
  }

  async materialesPopulares() {
    const materiales = await prisma.material.findMany({
      include: { _count: { select: { prestamos: true } } },
      orderBy: { prestamos: { _count: 'desc' } },
      take: 10,
    });
    return materiales;
  }

  async historialPrestamos(filtros = {}) {
    const { desde, hasta, estado } = filtros;
    const where = {};

    if (estado) where.estado = estado;
    if (desde || hasta) {
      where.fechaPrestamo = {};
      if (desde) where.fechaPrestamo.gte = new Date(desde);
      if (hasta) where.fechaPrestamo.lte = new Date(hasta);
    }

    return await prisma.prestamo.findMany({
      where,
      include: {
        socio: { select: { nombre: true, apellido: true, dni: true } },
        material: { select: { titulo: true, tipo: true, isbn: true } },
      },
      orderBy: { fechaPrestamo: 'desc' },
      take: 100,
    });
  }
}

module.exports = new ReporteService();