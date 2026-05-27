const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log(' Iniciando seed de base de datos...');

  // Usuarios
  const adminPassword = await bcrypt.hash('Admin2024!', 12);
  const bibl1Password = await bcrypt.hash('Biblio2024!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@biblioteca.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@biblioteca.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'bibliotecario@biblioteca.com' },
    update: {},
    create: {
      nombre: 'Juan Pérez',
      email: 'bibliotecario@biblioteca.com',
      password: bibl1Password,
      role: 'BIBLIOTECARIO',
    },
  });

  // Categorías
  const categorias = [
    { nombre: 'Literatura', descripcion: 'Obras literarias, narrativa y poesía' },
    { nombre: 'Historia', descripcion: 'Historia universal y regional' },
    { nombre: 'Ciencias', descripcion: 'Ciencias exactas y naturales' },
    { nombre: 'Filosofía', descripcion: 'Filosofía y pensamiento crítico' },
    { nombre: 'Arte', descripcion: 'Arte, música y cultura visual' },
    { nombre: 'Tecnología', descripcion: 'Informática y tecnología' },
  ];

  for (const cat of categorias) {
    await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    });
  }

  // Autores
  const autores = [
    { nombre: 'Gabriel', apellido: 'García Márquez', nacionalidad: 'Colombiana' },
    { nombre: 'Jorge Luis', apellido: 'Borges', nacionalidad: 'Argentina' },
    { nombre: 'Isabel', apellido: 'Allende', nacionalidad: 'Chilena' },
    { nombre: 'Mario', apellido: 'Vargas Llosa', nacionalidad: 'Peruana' },
    { nombre: 'Julio', apellido: 'Cortázar', nacionalidad: 'Argentina' },
  ];

  for (const autor of autores) {
    await prisma.autor.create({ data: autor }).catch(() => {});
  }

  // Materiales
  const literatura = await prisma.categoria.findFirst({ where: { nombre: 'Literatura' } });
  const garcia = await prisma.autor.findFirst({ where: { apellido: 'García Márquez' } });
  const borges = await prisma.autor.findFirst({ where: { apellido: 'Borges' } });

  if (literatura && garcia) {
    await prisma.material.create({
      data: {
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
    }).catch(() => {});
  }

  if (literatura && borges) {
    await prisma.material.create({
      data: {
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
    }).catch(() => {});
  }

  // Socios de prueba
  const socios = [
    { nombre: 'María', apellido: 'González', dni: '12345678', email: 'maria@email.com', telefono: '555-0001' },
    { nombre: 'Carlos', apellido: 'López', dni: '87654321', email: 'carlos@email.com', telefono: '555-0002' },
    { nombre: 'Ana', apellido: 'Martínez', dni: '11223344', email: 'ana@email.com', telefono: '555-0003' },
  ];

  for (const socio of socios) {
    await prisma.socio.create({ data: socio }).catch(() => {});
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