import { PrismaClient } from "../src/generated/prisma";
import { generateImageEmbedding, generateBase64Embedding } from "../src/modules/shared/infrastructure/voyage-client";
import { removeImageBackground } from "../src/modules/shared/infrastructure/background-removal";
import { VectorSearchRepository } from "../src/modules/matching/infrastructure/vector-search-repository";

const prisma = new PrismaClient();
const vectorRepo = new VectorSearchRepository();

const DELAY_MS = 21000; // 3 RPM free tier → 21s entre llamadas

async function main() {
  if (!process.env.VOYAGE_API_KEY) {
    console.error("VOYAGE_API_KEY no configurado.");
    process.exit(1);
  }

  const pets = await prisma.foundPet.findMany({
    select: { id: true, name: true, imageUrl: true, species: true, breed: true, description: true },
  });

  console.log(`Regenerando embeddings para ${pets.length} mascotas encontradas...`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < pets.length; i++) {
    const pet = pets[i];
    const textDescriptor = [pet.species, pet.breed, pet.description].filter(Boolean).join(", ");

    if (i > 0) await new Promise((r) => setTimeout(r, DELAY_MS));

    try {
      console.log(`  [${i + 1}/${pets.length}] ${pet.name} — "${textDescriptor.slice(0, 60)}..."`);

      const bgBase64 = await removeImageBackground(pet.imageUrl);

      const embedding = bgBase64
        ? await generateBase64Embedding(bgBase64, "image/png", textDescriptor)
        : await generateImageEmbedding(pet.imageUrl, textDescriptor);

      await vectorRepo.saveFoundPetEmbedding(Number(pet.id), embedding);
      success++;
      console.log(`    ✓ ${bgBase64 ? "con fondo removido" : "imagen original"}`);
    } catch (err) {
      failed++;
      console.warn(`    ✗ Error: ${(err as Error).message}`);
    }
  }

  console.log(`\nBackfill completado: ${success} OK, ${failed} fallidos.`);
}

main()
  .catch((err) => { console.error("Backfill failed:", err); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
