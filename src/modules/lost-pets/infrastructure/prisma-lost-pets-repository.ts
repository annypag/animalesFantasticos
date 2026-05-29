import { prisma } from "@/lib/prisma";
import {
  LostPetFilters,
  LostPetsRepository,
} from "@/modules/lost-pets/application/ports/lost-pets-repository";
import { LostPet, RegisterLostPetInput } from "@/modules/lost-pets/domain/lost-pet";

function mapLostPetRecord(pet: {
  id: bigint;
  name: string;
  species: string;
  breed: string;
  imageUrl: string;
  description: string;
  locationText: string;
  latitude: number;
  longitude: number;
  lastSeen: string;
  createdAt: Date;
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
    // sex y neighborhood no existen en el schema de LostPet — se usan defaults
    sex: "Desconocido",
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
    owner: {
      id: Number(pet.user.id),
      fullName: pet.user.fullName,
      phone: pet.user.phone,
      email: pet.user.email,
    },
  };
}

function toSexEnum(sex: RegisterLostPetInput["pet"]["sex"]): "MALE" | "FEMALE" | "UNKNOWN" {
  if (sex === "Macho") {
    return "MALE";
  }

  if (sex === "Hembra") {
    return "FEMALE";
  }

  return "UNKNOWN";
}

export class PrismaLostPetsRepository implements LostPetsRepository {
  async listLostPets(filters?: LostPetFilters): Promise<LostPet[]> {
    const pets = await prisma.lostPet.findMany({
      where: {
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
    // Nota: el schema de LostPet no incluye sex, imageUrls ni neighborhood todavía.
    // toSexEnum se mantiene para cuando se agreguen al schema.
    void toSexEnum;

    const createdPet = await prisma.$transaction(async (tx) => {
      // Reutiliza el User si el email ya existe; crea uno nuevo si no.
      const email = input.owner.email ?? `noreply_${Date.now()}@noreply.local`;
      const user = await tx.user.upsert({
        where: { email },
        update: {},
        create: {
          fullName: input.owner.fullName,
          email,
          phone: input.owner.phone,
          passwordHash: "__cannot_login__",
        },
      });

      return tx.lostPet.create({
        data: {
          userId: user.id,
          name: input.pet.name,
          species: input.pet.species,
          breed: input.pet.breed,
          imageUrl:
            input.pet.imageUrl ||
            input.pet.imageCapture[0]?.fileUrl ||
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
          description: input.pet.description,
          locationText:
            input.pet.locationText || `${input.pet.latitude.toFixed(4)}, ${input.pet.longitude.toFixed(4)}`,
          latitude: input.pet.latitude,
          longitude: input.pet.longitude,
          lastSeen: input.pet.lastSeen,
        },
        include: {
          user: true,
        },
      });
    });

    return mapLostPetRecord(createdPet);
  }
}
