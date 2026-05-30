import { PetSpecies } from "@/modules/shared/domain/pet-species";
import { PetSex } from "@/modules/shared/domain/pet-sex";
import { ImageCapture } from "@/modules/shared/domain/image-capture";

export interface LostPetOwner {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
}

export interface LostPet {
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
  lastSeen: string;
  reportDate: string;
  createdAt: string;
  owner: LostPetOwner;
}

export interface RegisterLostPetInput {
  userId: number;
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
    lastSeen: string;
    reportDate: Date;
  };
  owner: {
    fullName: string;
    phone: string;
    email: string | null;
  };
}

