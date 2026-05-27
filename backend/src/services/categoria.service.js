const prisma = require('../config/database');
const AppError = require('../utils/AppError');

class CategoriaService {
  async findAll() {
    return await prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { materiales: true } } },
    });
  }

  async findById(id) {
    const cat = await prisma.categoria.findUnique({
      where: { id },
      include: { materiales: { select: { id: true, titulo: true } } },
    });
    if (!cat) throw new AppError('Categoría no encontrada', 404);
    return cat;
  }

  async create(data) {
    return await prisma.categoria.create({ data });
  }

  async update(id, data) {
    await this.findById(id);
    return await prisma.categoria.update({ where: { id }, data });
  }

  async remove(id) {
    const cat = await this.findById(id);
    if (cat.materiales.length > 0) {
      throw new AppError('No se puede eliminar una categoría con materiales asociados', 409);
    }
    await prisma.categoria.delete({ where: { id } });
    return { message: 'Categoría eliminada correctamente' };
  }
}

module.exports = new CategoriaService();