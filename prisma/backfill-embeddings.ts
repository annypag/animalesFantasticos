/**
 * Backfill script: genera embeddings visuales para todas las mascotas encontradas
 * que aún no tienen embedding almacenado.
 *
 * Uso: npx tsx prisma/backfill-embeddings.ts
 */

import { PrismaClient } from "../src/generated/prisma";
import { generateImageEmbedding } from "../src/modules/shared/infrastructure/voyage-client";
import { VectorSearchRepository } from "../src/modules/matching/infrastructure/vector-search-repository";

const prisma = new PrismaClient();
const vectorRepo = new VectorSearchRepository();

const BATCH_SIZE = 5;

async function ensureHnswIndex(): Promise<void> {
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS found_pets_embedding_hnsw_idx
    ON found_pets USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64)
  `;
  console.log("Índice HNSW verificado/creado.");
}

async function main(): Promise<void> {
  if (!process.env.VOYAGE_API_KEY) {
    console.error(
      "Error: VOYAGE_API_KEY no está configurado.\n" +
        "Setear la variable de entorno antes de correr este script:\n" +
        "  $env:VOYAGE_API_KEY='tu-api-key'  # PowerShell\n" +
        "  export VOYAGE_API_KEY='tu-api-key' # bash",
    );
    process.exit(1);
  }

  // Verificar que pgvector esté instalado
  try {
    await prisma.$queryRaw`SELECT 1 FROM found_pets WHERE embedding IS NULL LIMIT 1`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("vector")) {
      console.error(
        "Error: La extensión pgvector no está instalada en la base de datos.\n" +
          "Ejecutar antes:\n" +
          "  docker exec animales-fantasticos-db psql -U postgres -d animales_fantasticos -c \"CREATE EXTENSION IF NOT EXISTS vector;\"\n" +
          "  npx prisma db push",
      );
      process.exit(1);
    }
    throw err;
  }

  let totalProcessed = 0;
  let totalFailed = 0;
  const failedIds = new Set<number>();

  console.log(`Iniciando backfill (lotes de ${BATCH_SIZE})...`);

  while (true) {
    const batch = (await vectorRepo.getFoundPetsWithoutEmbedding(BATCH_SIZE + failedIds.size))
      .filter((p) => !failedIds.has(p.id))
      .slice(0, BATCH_SIZE);

    if (batch.length === 0) break;

    for (const pet of batch) {
      try {
        console.log(`  Generando embedding para pet ${pet.id} (${pet.imageUrl})...`);
        const embedding = await generateImageEmbedding(pet.imageUrl);
        await vectorRepo.saveFoundPetEmbedding(pet.id, embedding);
        totalProcessed++;
        console.log(`  ✓ pet ${pet.id}`);
      } catch (err) {
        totalFailed++;
        failedIds.add(pet.id);
        console.error(`  ✗ pet ${pet.id} — error:`, err instanceof Error ? err.message : err);
      }
    }
  }

  console.log(`\nBackfill completado: ${totalProcessed} procesados, ${totalFailed} fallidos.`);

  if (totalProcessed > 0) {
    console.log("Creando índice HNSW...");
    await ensureHnswIndex();
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error fatal en backfill:", err);
  prisma.$disconnect();
  process.exit(1);
});
