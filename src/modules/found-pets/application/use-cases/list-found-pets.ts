import { FoundPet } from "@/modules/found-pets/domain/found-pet";
import {
  FoundPetFilters,
  FoundPetsRepository,
} from "@/modules/found-pets/application/ports/found-pets-repository";

export async function listFoundPets(
  repository: FoundPetsRepository,
  filters?: FoundPetFilters,
): Promise<FoundPet[]> {
  return repository.listFoundPets(filters);
}
