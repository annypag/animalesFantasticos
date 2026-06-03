import { FoundPet } from "@/modules/found-pets/domain/found-pet";
import { FoundPetsRepository } from "@/modules/found-pets/application/ports/found-pets-repository";

export async function resolveFoundPetReport(
  repository: FoundPetsRepository,
  petId: number,
  userId: number,
): Promise<FoundPet | null> {
  return repository.resolveFoundPet(petId, userId);
}
