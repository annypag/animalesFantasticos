import { NextResponse } from "next/server";
import { listFoundPets } from "@/modules/found-pets/application/use-cases/list-found-pets";
import { registerFoundPet } from "@/modules/found-pets/application/use-cases/register-found-pet";
import { validateRegisterFoundPetPayload } from "@/modules/found-pets/application/validators/register-found-pet";
import { PrismaFoundPetsRepository } from "@/modules/found-pets/infrastructure/prisma-found-pets-repository";
import { VectorSearchRepository } from "@/modules/matching/infrastructure/vector-search-repository";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";
import { asOptionalQueryDate, asOptionalQueryNumber } from "@/modules/shared/application/validation/payload-parsers";
import { ensureUserExists } from "@/lib/auth/ensure-user-exists";
import { resolveFoundPetReport } from "@/modules/found-pets/application/use-cases/resolve-found-pet";

const repository = new PrismaFoundPetsRepository();
const vectorRepo = new VectorSearchRepository();

export async function handleGetFoundPets(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = asOptionalQueryNumber(url.searchParams.get("userId"));
    const pets = await listFoundPets(repository, {
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
    console.error("GET /api/found-pets failed", error);
    return NextResponse.json(
      { message: "No se pudieron cargar las mascotas encontradas." },
      { status: 500 },
    );
  }
}

export async function handlePostFoundPets(request: Request) {
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
    const input = validateRegisterFoundPetPayload(body, userId);
    const pet = await registerFoundPet(repository, input, vectorRepo);

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

function parsePetIdParam(value: string): number | null {
  const petId = Number(value);
  return Number.isInteger(petId) && petId > 0 ? petId : null;
}

export async function handlePostResolveFoundPet(
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

    const pet = await resolveFoundPetReport(repository, petId, userId);

    if (!pet) {
      return NextResponse.json(
        { message: "No se pudo cerrar la publicación. Verificá que sea tuya y siga activa." },
        { status: 404 },
      );
    }

    return NextResponse.json({ pet }, { status: 200 });
  } catch (error) {
    console.error("POST /api/found-pets/[petId]/resolve failed", error);
    return NextResponse.json(
      { message: "No se pudo cerrar la publicación." },
      { status: 500 },
    );
  }
}
