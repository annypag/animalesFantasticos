import { LostPet } from "@/modules/lost-pets/domain/lost-pet";
import { LostPetsRepository } from "@/modules/lost-pets/application/ports/lost-pets-repository";

export async function resolveLostPetReport(
  repository: LostPetsRepository,
  petId: number,
  userId: number,
): Promise<LostPet | null> {
  return repository.resolveLostPet(petId, userId);
}
