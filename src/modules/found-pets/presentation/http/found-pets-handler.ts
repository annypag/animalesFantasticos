import { NextResponse } from "next/server";
import { listFoundPets } from "@/modules/found-pets/application/use-cases/list-found-pets";
import { registerFoundPet } from "@/modules/found-pets/application/use-cases/register-found-pet";
import { validateRegisterFoundPetPayload } from "@/modules/found-pets/application/validators/register-found-pet";
import { PrismaFoundPetsRepository } from "@/modules/found-pets/infrastructure/prisma-found-pets-repository";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";

const repository = new PrismaFoundPetsRepository();

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

export async function handleGetFoundPets(request: Request) {
  try {
    const url = new URL(request.url);
    const pets = await listFoundPets(repository, {
      neighborhood: url.searchParams.get("neighborhood") ?? undefined,
      breed: url.searchParams.get("breed") ?? undefined,
      fromDate: asOptionalDate(url.searchParams.get("fromDate")),
      toDate: asOptionalDate(url.searchParams.get("toDate")),
      minLat: asOptionalNumber(url.searchParams.get("minLat")),
      maxLat: asOptionalNumber(url.searchParams.get("maxLat")),
      minLng: asOptionalNumber(url.searchParams.get("minLng")),
      maxLng: asOptionalNumber(url.searchParams.get("maxLng")),
    });

    return NextResponse.json({ pets }, { status: 200 });
  } catch (error) {
    console.error("GET /api/found-pets failed", error);
    return NextResponse.json(
      { message: "No se pudieron cargar las mascotas encontradas." },
      { status: 500 },
    );
  }
}

export async function handlePostFoundPets(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const input = validateRegisterFoundPetPayload(body);
    const pet = await registerFoundPet(repository, input);

    return NextResponse.json({ pet }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error("POST /api/found-pets failed", error);
    return NextResponse.json(
      { message: "No se pudo guardar el reporte en base de datos." },
      { status: 500 },
    );
  }
}
