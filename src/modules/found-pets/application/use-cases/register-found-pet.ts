import { FoundPet, RegisterFoundPetInput } from "@/modules/found-pets/domain/found-pet";
import { FoundPetsRepository } from "@/modules/found-pets/application/ports/found-pets-repository";
import { VectorSearchRepository } from "@/modules/matching/infrastructure/vector-search-repository";
import { generateImageEmbedding } from "@/modules/shared/infrastructure/voyage-client";

export async function registerFoundPet(
  repository: FoundPetsRepository,
  input: RegisterFoundPetInput,
  vectorRepo?: VectorSearchRepository,
): Promise<FoundPet> {
  const createdPet = await repository.createFoundPet(input);

  // Fire-and-forget: no bloquear el alta si falla la generación de embedding
  if (vectorRepo && process.env.VOYAGE_API_KEY) {
    generateImageEmbedding(createdPet.imageUrl)
      .then((embedding) => vectorRepo.saveFoundPetEmbedding(createdPet.id, embedding))
      .catch((err) =>
        console.error("Error generando embedding para FoundPet", createdPet.id, err),
      );
  }

  return createdPet;
}
