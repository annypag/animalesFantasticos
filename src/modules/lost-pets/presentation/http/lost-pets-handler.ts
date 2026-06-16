import { NextResponse } from "next/server";
import { listLostPets } from "@/modules/lost-pets/application/use-cases/list-lost-pets";
import { registerLostPet } from "@/modules/lost-pets/application/use-cases/register-lost-pet";
import { validateRegisterLostPetPayload } from "@/modules/lost-pets/application/validators/register-lost-pet";
import { PrismaLostPetsRepository } from "@/modules/lost-pets/infrastructure/prisma-lost-pets-repository";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";
import { asOptionalQueryDate, asOptionalQueryNumber } from "@/modules/shared/application/validation/payload-parsers";
import { ensureUserExists } from "@/lib/auth/ensure-user-exists";
import { resolveLostPetReport } from "@/modules/lost-pets/application/use-cases/resolve-lost-pet";

const repository = new PrismaLostPetsRepository();

export async function handleGetLostPets(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = asOptionalQueryNumber(url.searchParams.get("userId"));
    const pets = await listLostPets(repository, {
      neighborhood: url.searchParams.get("neighborhood") ?? undefined,
      breed: url.searchParams.get("breed") ?? undefined,
      fromDate: asOptionalQueryDate(url.searchParams.get("fromDate")),
      toDate: asOptionalQueryDate(url.searchParams.get("toDate")),
      minLat: asOptionalQueryNumber(url.searchParams.get("minLat")),
      maxLat: asOptionalQueryNumber(url.searchParams.get("maxLat")),
      minLng: asOptionalQueryNumber(url.searchParams.get("minLng")),
      maxLng: asOptionalQueryNumber(url.searchParams.get("maxLng")),
      userId,
      includeResolved: url.searchParams.get("includeResolved") === "true" && userId !== undefined,
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
    const userIdHeader = request.headers.get("x-user-id");
    const userId = userIdHeader ? Number(userIdHeader) : NaN;
    if (!userId || !Number.isFinite(userId)) {
      return NextResponse.json({ message: "Debés iniciar sesión para publicar un reporte." }, { status: 401 });
    }

    const staleSessionMessage = await ensureUserExists(userId);
    if (staleSessionMessage) {
      return NextResponse.json({ message: staleSessionMessage }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const input = validateRegisterLostPetPayload(body, userId);
    const pet = await registerLostPet(repository, input);

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

function parsePetIdParam(value: string): number | null {
  const petId = Number(value);
  return Number.isInteger(petId) && petId > 0 ? petId : null;
}

export async function handlePostResolveLostPet(
  petIdParam: string,
  request: Request,
) {
  try {
    const userIdHeader = request.headers.get("x-user-id");
    const userId = userIdHeader ? Number(userIdHeader) : NaN;

    if (!userId || !Number.isFinite(userId)) {
      return NextResponse.json(
        { message: "Debés iniciar sesión para cerrar una publicación." },
        { status: 401 },
      );
    }

    const petId = parsePetIdParam(petIdParam);

    if (!petId) {
      return NextResponse.json({ message: "Publicación inválida." }, { status: 400 });
    }

    const pet = await resolveLostPetReport(repository, petId, userId);

    if (!pet) {
      return NextResponse.json(
        { message: "No se pudo cerrar la publicación. Verificá que sea tuya y siga activa." },
        { status: 404 },
      );
    }

    return NextResponse.json({ pet }, { status: 200 });
  } catch (error) {
    console.error("POST /api/lost-pets/[petId]/resolve failed", error);
    return NextResponse.json(
      { message: "No se pudo cerrar la publicación." },
      { status: 500 },
    );
  }
}
