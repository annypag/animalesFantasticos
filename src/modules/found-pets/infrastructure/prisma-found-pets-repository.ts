import { FoundPet, RegisterFoundPetInput } from "@/modules/found-pets/domain/found-pet";
import { FoundPetsRepository } from "@/modules/found-pets/application/ports/found-pets-repository";
import { prisma } from "@/lib/prisma";

let schemaReady = false;

async function ensureFoundPetsSchema() {
  if (schemaReady) {
    return;
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS owners (
      id BIGSERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS found_pets (
      id BIGSERIAL PRIMARY KEY,
      owner_id BIGINT NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      breed TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      location_text TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      found_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS found_pets_created_at_idx
    ON found_pets (created_at DESC);
  `);

  schemaReady = true;
}

function mapFoundPetRecord(pet: {
  id: bigint;
  name: string;
  species: string;
  breed: string;
  imageUrl: string;
  description: string;
  locationText: string;
  latitude: number;
  longitude: number;
  foundAt: Date;
  owner: {
    id: bigint;
    fullName: string;
    phone: string;
    email: string | null;
  };
}): FoundPet {
  return {
    id: Number(pet.id),
    name: pet.name,
    species: pet.species as FoundPet["species"],
    breed: pet.breed,
    imageUrl: pet.imageUrl,
    description: pet.description,
    locationText: pet.locationText,
    latitude: pet.latitude,
    longitude: pet.longitude,
    foundAt: pet.foundAt.toISOString(),
    owner: {
      id: Number(pet.owner.id),
      fullName: pet.owner.fullName,
      phone: pet.owner.phone,
      email: pet.owner.email,
    },
  };
}

export class PrismaFoundPetsRepository implements FoundPetsRepository {
  async listFoundPets(): Promise<FoundPet[]> {
    await ensureFoundPetsSchema();

    const pets = await prisma.foundPet.findMany({
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return pets.map((pet) => mapFoundPetRecord(pet));
  }

  async createFoundPet(input: RegisterFoundPetInput): Promise<FoundPet> {
    await ensureFoundPetsSchema();

    const createdPet = await prisma.$transaction(async (tx) => {
      const owner = await tx.owner.create({
        data: {
          fullName: input.owner.fullName,
          phone: input.owner.phone,
          email: input.owner.email,
        },
      });

      return tx.foundPet.create({
        data: {
          ownerId: owner.id,
          name: input.pet.name,
          species: input.pet.species,
          breed: input.pet.breed,
          imageUrl:
            input.pet.imageUrl ||
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
          description: input.pet.description,
          locationText:
            input.pet.locationText ||
            `${input.pet.latitude.toFixed(4)}, ${input.pet.longitude.toFixed(4)}`,
          latitude: input.pet.latitude,
          longitude: input.pet.longitude,
        },
        include: {
          owner: true,
        },
      });
    });

    return mapFoundPetRecord(createdPet);
  }
}
