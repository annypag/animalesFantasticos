import { FoundPet, RegisterFoundPetInput } from "@/modules/found-pets/domain/found-pet";

export interface FoundPetsRepository {
  listFoundPets(): Promise<FoundPet[]>;
  createFoundPet(input: RegisterFoundPetInput): Promise<FoundPet>;
}
