const { PrismaClient } = require('@prisma/client');

async function waitForMySQL() {
  const prisma = new PrismaClient();
  const maxRetries = 30;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      await prisma.$connect();
      console.log('MySQL is ready!');
      await prisma.$disconnect();
      process.exit(0);
    } catch (err) {
      attempts++;
      console.log(`Waiting for MySQL (${attempts}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.error('Failed to connect to MySQL after 60 seconds');
  process.exit(1);
}

waitForMySQL();
