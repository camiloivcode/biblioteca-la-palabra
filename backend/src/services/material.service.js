const prisma = require('../config/database');
const AppError = require('../utils/AppError');

class MaterialService {
  async findAll(filters = {}) {
    const { search, tipo, estado, categoriaId, autorId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {};
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (categoriaId) where.categoriaId = parseInt(categoriaId);
    if (autorId) where.autorId = parseInt(autorId);
    if (search) {
      where.OR = [
        { titulo: { contains: search } },
        { isbn: { contains: search } },
        { editorial: { contains: search } },
      ];
    }

    const [materiales, total] = await Promise.all([
      prisma.material.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { titulo: 'asc' },
        include: {
          autor: { select: { nombre: true, apellido: true } },
          categoria: { select: { nombre: true } },
        },
      }),
      prisma.material.count({ where }),
    ]);

    return { materiales, total };
  }

  async findById(id) {
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        autor: true,
        categoria: true,
        prestamos: {
          where: { estado: 'ACTIVO' },
          include: { socio: { select: { nombre: true, apellido: true } } },
        },
      },
    });
    if (!material) throw new AppError('Material no encontrado', 404);
    return material;
  }

  async create(data) {
    return await prisma.material.create({
      data: { ...data, autorId: parseInt(data.autorId), categoriaId: parseInt(data.categoriaId) },
      include: {
        autor: { select: { nombre: true, apellido: true } },
        categoria: { select: { nombre: true } },
      },
    });
  }

  async update(id, data) {
    await this.findById(id);
    if (data.autorId) data.autorId = parseInt(data.autorId);
    if (data.categoriaId) data.categoriaId = parseInt(data.categoriaId);

    return await prisma.material.update({
      where: { id },
      data,
      include: {
        autor: { select: { nombre: true, apellido: true } },
        categoria: { select: { nombre: true } },
      },
    });
  }

  async remove(id) {
    const material = await this.findById(id);
    const prestamosActivos = await prisma.prestamo.count({
      where: { materialId: id, estado: 'ACTIVO' },
    });

    if (prestamosActivos > 0) {
      throw new AppError('No se puede eliminar un material con préstamos activos', 409);
    }

    await prisma.material.delete({ where: { id } });
    return { message: 'Material eliminado correctamente' };
  }
}

module.exports = new MaterialService();