import { FoundPet } from "@/modules/found-pets/domain/found-pet";
import { FoundPetsRepository } from "@/modules/found-pets/application/ports/found-pets-repository";

export async function listFoundPets(repository: FoundPetsRepository): Promise<FoundPet[]> {
  return repository.listFoundPets();
}
