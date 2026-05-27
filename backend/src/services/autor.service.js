const prisma = require('../config/database');
const AppError = require('../utils/AppError');

class AutorService {
  async findAll(search = '') {
    const where = search
      ? {
          OR: [
            { nombre: { contains: search } },
            { apellido: { contains: search } },
            { nacionalidad: { contains: search } },
          ],
        }
      : {};

    return await prisma.autor.findMany({
      where,
      orderBy: { apellido: 'asc' },
      include: { _count: { select: { materiales: true } } },
    });
  }

  async findById(id) {
    const autor = await prisma.autor.findUnique({
      where: { id },
      include: {
        materiales: { select: { id: true, titulo: true, tipo: true, estado: true } },
        _count: { select: { materiales: true } },
      },
    });
    if (!autor) throw new AppError('Autor no encontrado', 404);
    return autor;
  }

  async create(data) {
    return await prisma.autor.create({ data });
  }

  async update(id, data) {
    await this.findById(id);
    return await prisma.autor.update({ where: { id }, data });
  }

  async remove(id) {
    const autor = await this.findById(id);

    if (autor._count.materiales > 0) {
      throw new AppError(
        `No se puede eliminar el autor porque tiene ${autor._count.materiales} material(es) asociado(s)`,
        409
      );
    }

    await prisma.autor.delete({ where: { id } });
    return { message: 'Autor eliminado correctamente' };
  }
}

module.exports = new AutorService();