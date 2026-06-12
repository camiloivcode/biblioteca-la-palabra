const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log(' Iniciando seed de base de datos...');

  // ─── Usuarios ─────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin2024!', 12);
  const biblioPassword = await bcrypt.hash('Biblio2024!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@biblioteca.com' },
    update: { password: adminPassword, activo: true },
    create: {
      nombre: 'Administrador',
      email: 'admin@biblioteca.com',
      password: adminPassword,
      role: 'ADMIN',
      activo: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'bibliotecario@biblioteca.com' },
    update: { password: biblioPassword, activo: true },
    create: {
      nombre: 'Juan Pérez',
      email: 'bibliotecario@biblioteca.com',
      password: biblioPassword,
      role: 'BIBLIOTECARIO',
      activo: true,
    },
  });

  // ─── Categorías ────────────────────────────────────
  const categorias = [
    { nombre: 'Literatura', descripcion: 'Obras literarias, narrativa y poesía', icono: 'menu_book' },
    { nombre: 'Historia', descripcion: 'Historia universal y regional', icono: 'history' },
    { nombre: 'Ciencias', descripcion: 'Ciencias exactas y naturales', icono: 'science' },
    { nombre: 'Filosofía', descripcion: 'Filosofía y pensamiento crítico', icono: 'lightbulb' },
    { nombre: 'Arte', descripcion: 'Arte, música y cultura visual', icono: 'palette' },
    { nombre: 'Tecnología', descripcion: 'Informática y tecnología', icono: 'computer' },
  ];

  for (const cat of categorias) {
    await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: { descripcion: cat.descripcion, icono: cat.icono },
      create: cat,
    });
  }

  // ─── Autores ───────────────────────────────────────
  const autores = [
    { nombre: 'Gabriel', apellido: 'García Márquez', nacionalidad: 'Colombiana' },
    { nombre: 'Jorge Luis', apellido: 'Borges', nacionalidad: 'Argentina' },
    { nombre: 'Isabel', apellido: 'Allende', nacionalidad: 'Chilena' },
    { nombre: 'Mario', apellido: 'Vargas Llosa', nacionalidad: 'Peruana' },
    { nombre: 'Julio', apellido: 'Cortázar', nacionalidad: 'Argentina' },
  ];

  for (const autor of autores) {
    await prisma.autor.upsert({
      where: { nombre_apellido: { nombre: autor.nombre, apellido: autor.apellido } },
      update: {},
      create: autor,
    });
  }

  // ─── Socios ────────────────────────────────────────
  const socios = [
    { nombre: 'María', apellido: 'González', dni: '12345678', email: 'maria@email.com', telefono: '555-0001', direccion: 'Av. Siempre Viva 123' },
    { nombre: 'Carlos', apellido: 'López', dni: '87654321', email: 'carlos@email.com', telefono: '555-0002', direccion: 'Calle Falsa 456' },
    { nombre: 'Ana', apellido: 'Martínez', dni: '11223344', email: 'ana@email.com', telefono: '555-0003', direccion: 'Belgrano 789' },
  ];

  for (const socio of socios) {
    await prisma.socio.upsert({
      where: { dni: socio.dni },
      update: {},
      create: socio,
    });
  }

  // ─── Materiales ────────────────────────────────────
  const literatura = await prisma.categoria.findUnique({ where: { nombre: 'Literatura' } });
  const garcia = await prisma.autor.findUnique({
    where: { nombre_apellido: { nombre: 'Gabriel', apellido: 'García Márquez' } },
  });
  const borges = await prisma.autor.findUnique({
    where: { nombre_apellido: { nombre: 'Jorge Luis', apellido: 'Borges' } },
  });

  const materiales = [
    {
      titulo: 'Cien Años de Soledad',
      isbn: '978-84-397-0497-3',
      tipo: 'LIBRO',
      anioPubl: 1967,
      editorial: 'Sudamericana',
      descripcion: 'Obra cumbre del realismo mágico latinoamericano.',
      stock: 3,
      estado: 'DISPONIBLE',
      autorId: garcia.id,
      categoriaId: literatura.id,
    },
    {
      titulo: 'Ficciones',
      isbn: '978-84-206-1155-2',
      tipo: 'LIBRO',
      anioPubl: 1944,
      editorial: 'Emecé',
      descripcion: 'Colección de cuentos de Jorge Luis Borges.',
      stock: 2,
      estado: 'DISPONIBLE',
      autorId: borges.id,
      categoriaId: literatura.id,
    },
  ];

  for (const material of materiales) {
    await prisma.material.upsert({
      where: { isbn: material.isbn },
      update: {},
      create: material,
    });
  }

  console.log(' Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error(' Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
