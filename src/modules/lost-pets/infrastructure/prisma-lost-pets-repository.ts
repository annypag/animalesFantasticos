import { prisma } from "@/lib/prisma";
import {
  LostPetFilters,
  LostPetsRepository,
} from "@/modules/lost-pets/application/ports/lost-pets-repository";
import { LostPet, RegisterLostPetInput } from "@/modules/lost-pets/domain/lost-pet";

function mapLostPetRecord(pet: {
  id: bigint;
  name: string;
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  species: string;
  breed: string;
  imageUrl: string;
  description: string;
  locationText: string;
  latitude: number;
  longitude: number;
  lastSeen: string;
  createdAt: Date;
  resolvedAt: Date | null;
  user: {
    id: bigint;
    fullName: string;
    email: string;
    phone: string | null;
  };
}): LostPet {
  return {
    id: Number(pet.id),
    name: pet.name,
    sex: toSexDomain(pet.sex),
    species: pet.species as LostPet["species"],
    breed: pet.breed,
    imageUrl: pet.imageUrl,
    imageCapture: [],
    description: pet.description,
    locationText: pet.locationText,
    neighborhood: "",
    latitude: pet.latitude,
    longitude: pet.longitude,
    lastSeen: pet.lastSeen,
    reportDate: pet.createdAt.toISOString(),
    createdAt: pet.createdAt.toISOString(),
    resolvedAt: pet.resolvedAt?.toISOString() ?? null,
    owner: {
      id: Number(pet.user.id),
      fullName: pet.user.fullName,
      phone: pet.user.phone,
      email: pet.user.email,
    },
  };
}

function toSexEnum(sex: RegisterLostPetInput["pet"]["sex"]): "MALE" | "FEMALE" | "UNKNOWN" {
  if (sex === "Macho") return "MALE";
  if (sex === "Hembra") return "FEMALE";
  return "UNKNOWN";
}

function toSexDomain(sex: "MALE" | "FEMALE" | "UNKNOWN"): LostPet["sex"] {
  if (sex === "MALE") return "Macho";
  if (sex === "FEMALE") return "Hembra";
  return "Desconocido";
}

export class PrismaLostPetsRepository implements LostPetsRepository {
  async listLostPets(filters?: LostPetFilters): Promise<LostPet[]> {
    const pets = await prisma.lostPet.findMany({
      where: {
        resolvedAt: null,
        ...(filters?.neighborhood
          ? {
              locationText: {
                contains: filters.neighborhood,
                mode: "insensitive",
              },
            }
          : {}),
        ...(filters?.breed
          ? {
              breed: {
                contains: filters.breed,
                mode: "insensitive",
              },
            }
          : {}),
        ...(filters?.fromDate || filters?.toDate
          ? {
              createdAt: {
                ...(filters.fromDate ? { gte: filters.fromDate } : {}),
                ...(filters.toDate ? { lte: filters.toDate } : {}),
              },
            }
          : {}),
        ...(filters?.minLat !== undefined || filters?.maxLat !== undefined
          ? {
              latitude: {
                ...(filters.minLat !== undefined ? { gte: filters.minLat } : {}),
                ...(filters.maxLat !== undefined ? { lte: filters.maxLat } : {}),
              },
            }
          : {}),
        ...(filters?.minLng !== undefined || filters?.maxLng !== undefined
          ? {
              longitude: {
                ...(filters.minLng !== undefined ? { gte: filters.minLng } : {}),
                ...(filters.maxLng !== undefined ? { lte: filters.maxLng } : {}),
              },
            }
          : {}),
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return pets.map((pet) => mapLostPetRecord(pet));
  }

  async createLostPet(input: RegisterLostPetInput): Promise<LostPet> {
    const createdPet = await prisma.lostPet.create({
      data: {
        userId: BigInt(input.userId),
        name: input.pet.name,
        sex: toSexEnum(input.pet.sex),
        species: input.pet.species,
        breed: input.pet.breed,
        imageUrl:
          input.pet.imageUrl ||
          input.pet.imageCapture[0]?.fileUrl ||
          "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        description: input.pet.description,
        locationText:
          input.pet.locationText ||
          `${input.pet.latitude.toFixed(4)}, ${input.pet.longitude.toFixed(4)}`,
        latitude: input.pet.latitude,
        longitude: input.pet.longitude,
        lastSeen: input.pet.lastSeen,
      },
      include: {
        user: true,
      },
    });

    return mapLostPetRecord(createdPet);
  }

  async resolveLostPet(petId: number, userId: number): Promise<LostPet | null> {
    const result = await prisma.lostPet.updateMany({
      where: {
        id: BigInt(petId),
        userId: BigInt(userId),
        resolvedAt: null,
      },
      data: { resolvedAt: new Date() },
    });

    if (result.count === 0) {
      return null;
    }

    const pet = await prisma.lostPet.findUnique({
      where: { id: BigInt(petId) },
      include: { user: true },
    });

    return pet ? mapLostPetRecord(pet) : null;
  }
}
