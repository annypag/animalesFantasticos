import { FoundPet, RegisterFoundPetInput } from "@/modules/found-pets/domain/found-pet";
import { FoundPetsRepository } from "@/modules/found-pets/application/ports/found-pets-repository";
import { VectorSearchRepository } from "@/modules/matching/infrastructure/vector-search-repository";
import { generateImageEmbedding, generateBase64Embedding } from "@/modules/shared/infrastructure/voyage-client";
import { removeImageBackground } from "@/modules/shared/infrastructure/background-removal";

export async function registerFoundPet(
  repository: FoundPetsRepository,
  input: RegisterFoundPetInput,
  vectorRepo?: VectorSearchRepository,
): Promise<FoundPet> {
  const createdPet = await repository.createFoundPet(input);

  // Fire-and-forget: no bloquear el alta si falla la generación de embedding
  if (vectorRepo && process.env.VOYAGE_API_KEY) {
    (async () => {
      try {
        const textDescriptor = [createdPet.species, createdPet.breed, createdPet.description]
          .filter(Boolean).join(", ");

        const bgRemovedBase64 = await removeImageBackground(createdPet.imageUrl);

        let embedding: number[];
        if (bgRemovedBase64) {
          // imagen sin fondo (PNG base64) + texto descriptor
          embedding = await generateBase64Embedding(bgRemovedBase64, "image/png", textDescriptor);
        } else {
          // fallback: imagen original + texto descriptor
          embedding = await generateImageEmbedding(createdPet.imageUrl, textDescriptor);
        }

        await vectorRepo.saveFoundPetEmbedding(createdPet.id, embedding);
      } catch (err) {
        console.error("Error generando embedding para FoundPet", createdPet.id, err);
      }
    })();
  }

  return createdPet;
}
