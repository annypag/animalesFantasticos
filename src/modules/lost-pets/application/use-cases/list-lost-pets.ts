import { LostPet } from "@/modules/lost-pets/domain/lost-pet";
import {
  LostPetFilters,
  LostPetsRepository,
} from "@/modules/lost-pets/application/ports/lost-pets-repository";

export async function listLostPets(
  repository: LostPetsRepository,
  filters?: LostPetFilters,
): Promise<LostPet[]> {
  return repository.listLostPets(filters);
}
