import { LostPet, RegisterLostPetInput } from "@/modules/lost-pets/domain/lost-pet";

export interface LostPetFilters {
  neighborhood?: string;
  breed?: string;
  fromDate?: Date;
  toDate?: Date;
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  onlyPublished?: boolean;
}

export interface LostPetsRepository {
  listLostPets(filters?: LostPetFilters): Promise<LostPet[]>;
  createLostPet(input: RegisterLostPetInput): Promise<LostPet>;
}
