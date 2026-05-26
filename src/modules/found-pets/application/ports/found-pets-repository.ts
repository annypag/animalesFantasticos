import { FoundPet, RegisterFoundPetInput } from "@/modules/found-pets/domain/found-pet";

export interface FoundPetFilters {
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

export interface FoundPetsRepository {
  listFoundPets(filters?: FoundPetFilters): Promise<FoundPet[]>;
  createFoundPet(input: RegisterFoundPetInput): Promise<FoundPet>;
}
