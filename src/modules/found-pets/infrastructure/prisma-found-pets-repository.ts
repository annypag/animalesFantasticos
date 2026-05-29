import { prisma } from "@/lib/prisma";
import {
  FoundPetFilters,
  FoundPetsRepository,
} from "@/modules/found-pets/application/ports/found-pets-repository";
import { FoundPet, RegisterFoundPetInput } from "@/modules/found-pets/domain/found-pet";

function mapFoundPetRecord(pet: {
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
  foundAt: Date;
  reportDate: Date;
  user: {
    id: bigint;
    fullName: string;
    email: string;
    phone: string | null;
  };
}): FoundPet {
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
    species: pet.species as FoundPet["species"],
    breed: pet.breed,
    imageUrl: pet.imageUrl,
    imageCapture,
    description: pet.description,
    locationText: pet.locationText,
    neighborhood: pet.neighborhood,
    latitude: pet.latitude,
    longitude: pet.longitude,
    foundAt: pet.foundAt.toISOString(),
    reportDate: pet.reportDate.toISOString(),
    owner: {
      id: Number(pet.user.id),
      fullName: pet.user.fullName,
      phone: pet.user.phone,
      email: pet.user.email,
    },
  };
}

function toSexEnum(sex: RegisterFoundPetInput["pet"]["sex"]): "MALE" | "FEMALE" | "UNKNOWN" {
  if (sex === "Macho") {
    return "MALE";
  }

  if (sex === "Hembra") {
    return "FEMALE";
  }

  return "UNKNOWN";
}

export class PrismaFoundPetsRepository implements FoundPetsRepository {
  async listFoundPets(filters?: FoundPetFilters): Promise<FoundPet[]> {
    const pets = await prisma.foundPet.findMany({
      where: {
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
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return pets.map((pet) => mapFoundPetRecord(pet));
  }

  async createFoundPet(input: RegisterFoundPetInput): Promise<FoundPet> {
    const createdPet = await prisma.$transaction(async (tx) => {
      // Reutiliza el User si el email ya existe; crea uno nuevo si no.
      // El campo passwordHash queda como placeholder ya que este usuario
      // es el contacto del reporte, no un usuario de login.
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

      return tx.foundPet.create({
        data: {
          userId: user.id,
          name: input.pet.name,
          sex: toSexEnum(input.pet.sex),
          species: input.pet.species,
          breed: input.pet.breed,
          imageUrl:
            input.pet.imageUrl ||
            input.pet.imageCapture[0]?.fileUrl ||
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
          imageUrls: JSON.parse(JSON.stringify(input.pet.imageCapture)),
          description: input.pet.description,
          locationText:
            input.pet.locationText || `${input.pet.latitude.toFixed(4)}, ${input.pet.longitude.toFixed(4)}`,
          neighborhood: input.pet.neighborhood,
          latitude: input.pet.latitude,
          longitude: input.pet.longitude,
          reportDate: input.pet.reportDate,
        },
        include: {
          user: true,
        },
      });
    });

    return mapFoundPetRecord(createdPet);
  }
}
