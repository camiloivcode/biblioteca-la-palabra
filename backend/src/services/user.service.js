const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const AppError = require('../utils/AppError');

class UserService {
  async findAll() {
    return await prisma.user.findMany({
      select: { id: true, nombre: true, email: true, role: true, activo: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, nombre: true, email: true, role: true, activo: true, createdAt: true },
    });
    if (!user) throw new AppError('Usuario no encontrado', 404);
    return user;
  }

  async create(data) {
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new AppError('Ya existe un usuario con ese email', 409);

    const hashedPassword = await bcrypt.hash(data.password, 12);

    return await prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: { id: true, nombre: true, email: true, role: true, activo: true, createdAt: true },
    });
  }

  async update(id, data) {
    await this.findById(id);

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    } else {
      delete data.password;
    }

    return await prisma.user.update({
      where: { id },
      data,
      select: { id: true, nombre: true, email: true, role: true, activo: true },
    });
  }

  async toggleStatus(id) {
    const user = await this.findById(id);
    return await prisma.user.update({
      where: { id },
      data: { activo: !user.activo },
      select: { id: true, nombre: true, activo: true },
    });
  }

  async remove(id) {
    await this.findById(id);
    await prisma.user.delete({ where: { id } });
    return { message: 'Usuario eliminado correctamente' };
  }
}

module.exports = new UserService();