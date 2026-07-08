import { NextResponse } from "next/server";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";
import { getMatchesByLostPet } from "@/modules/matching/application/use-cases/get-matches-by-lost-pet";
import { recomputeMatches } from "@/modules/matching/application/use-cases/recompute-matches";
import { PrismaMatchingRepository } from "@/modules/matching/infrastructure/prisma-matching-repository";

const repository = new PrismaMatchingRepository();

export async function handleGetMatches(request: Request) {
  try {
    const url = new URL(request.url);
    const lostPetId = Number(url.searchParams.get("lostPetId"));
    if (!Number.isFinite(lostPetId) || lostPetId <= 0) {
      throw new ValidationError("lostPetId es obligatorio.");
    }

    const matches = await getMatchesByLostPet(repository, lostPetId);
    return NextResponse.json({ matches }, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error("GET /api/matches failed", error);
    return NextResponse.json({ message: "No se pudieron cargar los matches." }, { status: 500 });
  }
}

export async function handlePostRecomputeMatches(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { threshold?: unknown; petKind?: unknown; petId?: unknown };
    const threshold = typeof body.threshold === "number" ? body.threshold : 0.6;

    if (typeof body.petKind === "string" && typeof body.petId === "number") {
      if (body.petKind === "LOST" || body.petKind === "FOUND") {
        await repository.enqueue(body.petKind, body.petId);
      }
    }

    const result = await recomputeMatches(repository, threshold);
    return NextResponse.json({ ...result, threshold }, { status: 200 });
  } catch (error) {
    console.error("POST /api/matches failed", error);
    return NextResponse.json({ message: "No se pudo recomputar los matches." }, { status: 500 });
  }
}
