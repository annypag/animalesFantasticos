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
  imageUrls: unknown;
  description: string;
  locationText: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  lastSeen: string;
  reportDate: Date;
  publicationStatus: "PENDING_VERIFICATION" | "PUBLISHED" | "ARCHIVED";
  emailVerified: boolean;
  isRegisteredReporter: boolean;
  createdAt: Date;
  owner: {
    id: bigint;
    fullName: string;
    phone: string;
    email: string | null;
  };
}): LostPet {
  const imageCapture = Array.isArray(pet.imageUrls)
    ? pet.imageUrls.filter(
        (value): value is { id: string; fileName: string; fileUrl: string } =>
          typeof value === "object" &&
          value !== null &&
          typeof (value as { id?: unknown }).id === "string" &&
          typeof (value as { fileName?: unknown }).fileName === "string" &&
          typeof (value as { fileUrl?: unknown }).fileUrl === "string",
      )
    : [];

  return {
    id: Number(pet.id),
    name: pet.name,
    sex: pet.sex === "MALE" ? "Macho" : pet.sex === "FEMALE" ? "Hembra" : "Desconocido",
    species: pet.species as LostPet["species"],
    breed: pet.breed,
    imageUrl: pet.imageUrl,
    imageCapture,
    description: pet.description,
    locationText: pet.locationText,
    neighborhood: pet.neighborhood,
    latitude: pet.latitude,
    longitude: pet.longitude,
    lastSeen: pet.lastSeen,
    reportDate: pet.reportDate.toISOString(),
    publicationStatus: pet.publicationStatus,
    emailVerified: pet.emailVerified,
    isRegisteredReporter: pet.isRegisteredReporter,
    createdAt: pet.createdAt.toISOString(),
    owner: {
      id: Number(pet.owner.id),
      fullName: pet.owner.fullName,
      phone: pet.owner.phone,
      email: pet.owner.email,
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
        ...(filters?.onlyPublished ? { publicationStatus: "PUBLISHED" } : {}),
        ...(filters?.neighborhood
          ? {
              neighborhood: {
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
              reportDate: {
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
        owner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return pets.map((pet) => mapLostPetRecord(pet));
  }

  async createLostPet(input: RegisterLostPetInput): Promise<LostPet> {
    const createdPet = await prisma.$transaction(async (tx) => {
      const owner = await tx.owner.create({
        data: {
          fullName: input.owner.fullName,
          phone: input.owner.phone,
          email: input.owner.email,
        },
      });

      return tx.lostPet.create({
        data: {
          ownerId: owner.id,
          name: input.pet.name,
          sex: toSexEnum(input.pet.sex),
          species: input.pet.species,
          breed: input.pet.breed,
          imageUrl:
            input.pet.imageUrl ||
            input.pet.imageCapture[0]?.fileUrl ||
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
          imageUrls: input.pet.imageCapture,
          description: input.pet.description,
          locationText:
            input.pet.locationText || `${input.pet.latitude.toFixed(4)}, ${input.pet.longitude.toFixed(4)}`,
          neighborhood: input.pet.neighborhood,
          latitude: input.pet.latitude,
          longitude: input.pet.longitude,
          lastSeen: input.pet.lastSeen,
          reportDate: input.pet.reportDate,
          publicationStatus: input.reporter.emailVerified ? "PUBLISHED" : "PENDING_VERIFICATION",
          isRegisteredReporter: input.reporter.isRegistered,
          emailVerified: input.reporter.emailVerified,
        },
        include: {
          owner: true,
        },
      });
    });

    return mapLostPetRecord(createdPet);
  }
}

