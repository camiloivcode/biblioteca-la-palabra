const prisma = require('../config/database');
const AppError = require('../utils/AppError');

class SocioService {
  async findAll(filters = {}) {
    const { search, estado, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {};
    if (estado) where.estado = estado;
    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { apellido: { contains: search } },
        { dni: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [socios, total] = await Promise.all([
      prisma.socio.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { apellido: 'asc' },
        include: {
          _count: { select: { prestamos: true } },
        },
      }),
      prisma.socio.count({ where }),
    ]);

    return { socios, total };
  }

  async findById(id) {
    const socio = await prisma.socio.findUnique({
      where: { id },
      include: {
        prestamos: {
          include: { material: { select: { titulo: true } } },
          orderBy: { fechaPrestamo: 'desc' },
          take: 10,
        },
        _count: { select: { prestamos: true } },
      },
    });
    if (!socio) throw new AppError('Socio no encontrado', 404);
    return socio;
  }

  async create(data) {
    const exists = await prisma.socio.findUnique({ where: { dni: data.dni } });
    if (exists) throw new AppError('Ya existe un socio con ese DNI', 409);

    return await prisma.socio.create({ data });
  }

  async update(id, data) {
    await this.findById(id);

    if (data.dni) {
      const exists = await prisma.socio.findFirst({
        where: { dni: data.dni, id: { not: id } },
      });
      if (exists) throw new AppError('Ya existe un socio con ese DNI', 409);
    }

    return await prisma.socio.update({ where: { id }, data });
  }

  async remove(id) {
    const socio = await this.findById(id);
    const prestamosActivos = await prisma.prestamo.count({
      where: { socioId: id, estado: 'ACTIVO' },
    });

    if (prestamosActivos > 0) {
      throw new AppError('No se puede eliminar un socio con préstamos activos', 409);
    }

    await prisma.socio.delete({ where: { id } });
    return { message: 'Socio eliminado correctamente' };
  }

  async getPrestamos(id) {
    await this.findById(id);
    return await prisma.prestamo.findMany({
      where: { socioId: id },
      include: { material: { select: { titulo: true, tipo: true } } },
      orderBy: { fechaPrestamo: 'desc' },
    });
  }
}

module.exports = new SocioService();