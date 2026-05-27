import { PetSpecies } from "@/modules/shared/domain/pet-species";
import { PetSex } from "@/modules/shared/domain/pet-sex";
import { ImageCapture } from "@/modules/shared/domain/image-capture";
export type { PetSpecies };

export interface FoundPetOwner {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
}

export interface FoundPet {
  id: number;
  name: string;
  sex: PetSex;
  species: PetSpecies;
  breed: string;
  imageUrl: string;
  imageCapture: ImageCapture[];
  description: string;
  locationText: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  foundAt: string;
  reportDate: string;
  owner: FoundPetOwner;
}

export interface RegisterFoundPetInput {
  pet: {
    name: string;
    sex: PetSex;
    species: PetSpecies;
    breed: string;
    imageUrl: string | null;
    imageCapture: ImageCapture[];
    description: string;
    locationText: string | null;
    neighborhood: string;
    latitude: number;
    longitude: number;
    reportDate: Date;
  };
  owner: {
    fullName: string;
    phone: string;
    email: string | null;
  };
}

