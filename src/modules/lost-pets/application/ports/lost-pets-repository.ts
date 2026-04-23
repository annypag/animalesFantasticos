import { LostPet, RegisterLostPetInput } from "@/modules/lost-pets/domain/lost-pet";

export interface LostPetsRepository {
  createLostPet(input: RegisterLostPetInput): Promise<LostPet>;
}
