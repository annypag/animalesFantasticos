const { PrismaClient } = require("../src/generated/prisma");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL no está configurada.");
    process.exit(1);
  }

  console.log("Conectando a la base de datos para habilitar la extensión 'vector'...");
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });

  try {
    await prisma.$connect();
    await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS vector;");
    console.log("✓ Extensión 'vector' habilitada o ya existente.");
  } catch (error) {
    console.error("Error al habilitar la extensión 'vector':", error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
