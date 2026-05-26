import { NextResponse } from "next/server";
import { listLostPets } from "@/modules/lost-pets/application/use-cases/list-lost-pets";
import { registerLostPet } from "@/modules/lost-pets/application/use-cases/register-lost-pet";
import { validateRegisterLostPetPayload } from "@/modules/lost-pets/application/validators/register-lost-pet";
import { PrismaLostPetsRepository } from "@/modules/lost-pets/infrastructure/prisma-lost-pets-repository";
import { PrismaMatchingRepository } from "@/modules/matching/infrastructure/prisma-matching-repository";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";

const repository = new PrismaLostPetsRepository();
const matchingRepository = new PrismaMatchingRepository();

function asOptionalNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function asOptionalDate(value: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function handleGetLostPets(request: Request) {
  try {
    const url = new URL(request.url);
    const pets = await listLostPets(repository, {
      neighborhood: url.searchParams.get("neighborhood") ?? undefined,
      breed: url.searchParams.get("breed") ?? undefined,
      fromDate: asOptionalDate(url.searchParams.get("fromDate")),
      toDate: asOptionalDate(url.searchParams.get("toDate")),
      minLat: asOptionalNumber(url.searchParams.get("minLat")),
      maxLat: asOptionalNumber(url.searchParams.get("maxLat")),
      minLng: asOptionalNumber(url.searchParams.get("minLng")),
      maxLng: asOptionalNumber(url.searchParams.get("maxLng")),
      onlyPublished: url.searchParams.get("onlyPublished") === "true",
    });

    return NextResponse.json({ pets }, { status: 200 });
  } catch (error) {
    console.error("GET /api/lost-pets failed", error);
    return NextResponse.json(
      { message: "No se pudieron cargar las mascotas perdidas." },
      { status: 500 },
    );
  }
}

export async function handlePostLostPets(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const input = validateRegisterLostPetPayload(body);
    const pet = await registerLostPet(repository, input);
    await matchingRepository.enqueue("LOST", pet.id);

    return NextResponse.json({ pet }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error("POST /api/lost-pets failed", error);
    return NextResponse.json(
      { message: "No se pudo guardar el reporte de mascota perdida." },
      { status: 500 },
    );
  }
}
