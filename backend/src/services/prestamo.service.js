const prisma = require('../config/database');
const AppError = require('../utils/AppError');

const DIAS_PRESTAMO = 30;
const MAX_PRESTAMOS_ACTIVOS = 3;

class PrestamoService {
  async findAll(filters = {}) {
    const { estado, socioId, materialId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {};
    if (estado) where.estado = estado;
    if (socioId) where.socioId = parseInt(socioId);
    if (materialId) where.materialId = parseInt(materialId);

    const [prestamos, total] = await Promise.all([
      prisma.prestamo.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { fechaPrestamo: 'desc' },
        include: {
          socio: { select: { id: true, nombre: true, apellido: true, dni: true } },
          material: { select: { id: true, titulo: true, tipo: true, isbn: true } },
        },
      }),
      prisma.prestamo.count({ where }),
    ]);

    return { prestamos, total };
  }

  async findById(id) {
    const prestamo = await prisma.prestamo.findUnique({
      where: { id },
      include: {
        socio: true,
        material: { include: { autor: true, categoria: true } },
      },
    });
    if (!prestamo) throw new AppError('Préstamo no encontrado', 404);
    return prestamo;
  }

  async create(data) {
    const { socioId, materialId, observaciones } = data;

    // ── Regla 1: verificar estado del socio ────────────────────
    const socio = await prisma.socio.findUnique({ where: { id: parseInt(socioId) } });
    if (!socio) throw new AppError('Socio no encontrado', 404);
    if (socio.estado === 'MOROSO') {
      throw new AppError('El socio tiene préstamos en mora. No puede realizar nuevos préstamos', 409);
    }
    if (socio.estado === 'SUSPENDIDO') {
      throw new AppError('El socio está suspendido', 409);
    }

    // ── Regla 2: máximo 3 préstamos activos por socio ──────────
    const prestamosActivos = await prisma.prestamo.count({
      where: { socioId: parseInt(socioId), estado: { in: ['ACTIVO', 'MORA'] } },
    });
    if (prestamosActivos >= MAX_PRESTAMOS_ACTIVOS) {
      throw new AppError(`El socio ya tiene ${MAX_PRESTAMOS_ACTIVOS} préstamos activos (máximo permitido)`, 409);
    }

    // ── Regla 3: material disponible ───────────────────────────
    const material = await prisma.material.findUnique({ where: { id: parseInt(materialId) } });
    if (!material) throw new AppError('Material no encontrado', 404);
    if (material.estado !== 'DISPONIBLE') {
      throw new AppError('El material no está disponible para préstamo', 409);
    }

    const prestamosSimultaneos = await prisma.prestamo.count({
      where: { materialId: parseInt(materialId), estado: { in: ['ACTIVO', 'MORA'] } },
    });
    if (prestamosSimultaneos >= material.stock) {
      throw new AppError('No hay ejemplares disponibles de este material', 409);
    }

    // ── Calcular fecha de devolución ───────────────────────────
    const fechaPrestamo = new Date();
    const fechaDevolucion = new Date(fechaPrestamo);
    fechaDevolucion.setDate(fechaDevolucion.getDate() + DIAS_PRESTAMO);

    // ── Transacción: crear préstamo + actualizar material ──────
    const prestamo = await prisma.$transaction(async (tx) => {
      const nuevoPrestamo = await tx.prestamo.create({
        data: {
          socioId: parseInt(socioId),
          materialId: parseInt(materialId),
          fechaDevolucion,
          observaciones: observaciones || null,
        },
        include: {
          socio: { select: { nombre: true, apellido: true } },
          material: { select: { titulo: true } },
        },
      });

      // Verificar si quedan ejemplares disponibles
      const prestamosConMaterial = await tx.prestamo.count({
        where: { materialId: parseInt(materialId), estado: { in: ['ACTIVO', 'MORA'] } },
      });

      if (prestamosConMaterial >= material.stock) {
        await tx.material.update({
          where: { id: parseInt(materialId) },
          data: { estado: 'PRESTADO' },
        });
      }

      return nuevoPrestamo;
    });

    return prestamo;
  }

  async devolver(id) {
    const prestamo = await this.findById(id);

    if (prestamo.estado === 'DEVUELTO') {
      throw new AppError('Este préstamo ya fue devuelto', 409);
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // Actualizar préstamo
      const prestamoActualizado = await tx.prestamo.update({
        where: { id },
        data: { estado: 'DEVUELTO', fechaDevReal: new Date() },
        include: {
          socio: { select: { nombre: true, apellido: true } },
          material: { select: { titulo: true } },
        },
      });

      // Volver el material a disponible
      await tx.material.update({
        where: { id: prestamo.materialId },
        data: { estado: 'DISPONIBLE' },
      });

      // Revisar si el socio sigue en mora
      const prestamosEnMora = await tx.prestamo.count({
        where: { socioId: prestamo.socioId, estado: 'MORA' },
      });

      if (prestamosEnMora === 0) {
        await tx.socio.update({
          where: { id: prestamo.socioId },
          data: { estado: 'ACTIVO' },
        });
      }

      return prestamoActualizado;
    });

    return resultado;
  }

  async actualizarMora() {
    const hoy = new Date();

    // Buscar préstamos vencidos
    const prestamosVencidos = await prisma.prestamo.findMany({
      where: {
        estado: 'ACTIVO',
        fechaDevolucion: { lt: hoy },
      },
      select: { id: true, socioId: true },
    });

    if (prestamosVencidos.length === 0) {
      return { actualizados: 0, message: 'No hay préstamos en mora' };
    }

    const socioIds = [...new Set(prestamosVencidos.map((p) => p.socioId))];
    const prestamoIds = prestamosVencidos.map((p) => p.id);

    await prisma.$transaction([
      prisma.prestamo.updateMany({
        where: { id: { in: prestamoIds } },
        data: { estado: 'MORA' },
      }),
      prisma.socio.updateMany({
        where: { id: { in: socioIds } },
        data: { estado: 'MOROSO' },
      }),
    ]);

    return {
      actualizados: prestamosVencidos.length,
      message: `${prestamosVencidos.length} préstamo(s) actualizados a mora`,
    };
  }
}

module.exports = new PrestamoService();