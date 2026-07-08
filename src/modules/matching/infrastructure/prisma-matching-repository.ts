import { prisma } from "@/lib/prisma";
import { MatchResult } from "@/modules/matching/domain/matching";

function normalizedText(value: string): string {
  return value.trim().toLowerCase();
}

function computeHeuristicScore(
  lost: { species: string; breed: string; neighborhood?: string | null },
  found: { species: string; breed: string; neighborhood?: string | null }
): number {
  let score = 0;
  if (normalizedText(lost.species) === normalizedText(found.species)) {
    score += 0.45;
  }

  if (normalizedText(lost.breed) === normalizedText(found.breed)) {
    score += 0.35;
  }

  if (
    lost.neighborhood &&
    found.neighborhood &&
    normalizedText(lost.neighborhood) === normalizedText(found.neighborhood)
  ) {
    score += 0.2;
  }

  return Math.min(1, score);
}

export class PrismaMatchingRepository {
  async enqueue(kind: "LOST" | "FOUND", petId: number): Promise<void> {
    await prisma.matchJob.create({
      data: {
        petKind: kind,
        petId: BigInt(petId),
        status: "PENDING",
      },
    });
  }

  async recomputeOnce(threshold: number): Promise<{ processed: number }> {
    const jobs = await prisma.matchJob.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    let processed = 0;

    for (const job of jobs) {
      try {
        await prisma.matchJob.update({ where: { id: job.id }, data: { status: "RUNNING", attempts: { increment: 1 } } });

        if (job.petKind === "LOST") {
          const lost = await prisma.lostPet.findUnique({ where: { id: job.petId } });
          if (lost) {
            const foundPets = await prisma.foundPet.findMany({ where: { resolvedAt: null } });
            for (const found of foundPets) {
              const score = computeHeuristicScore(lost, found);
              if (score >= threshold) {
                await prisma.petMatch.upsert({
                  where: {
                    lostPetId_foundPetId: {
                      lostPetId: lost.id,
                      foundPetId: found.id,
                    },
                  },
                  create: {
                    lostPetId: lost.id,
                    foundPetId: found.id,
                    score,
                    explanation: "species+breed+neighborhood heuristic",
                  },
                  update: {
                    score,
                    explanation: "species+breed+neighborhood heuristic",
                    computedAt: new Date(),
                  },
                });
              }
            }
          }
        }

        await prisma.matchJob.update({ where: { id: job.id }, data: { status: "DONE", lastError: null } });
        processed += 1;
      } catch (error) {
        await prisma.matchJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            lastError: error instanceof Error ? error.message : "unknown error",
          },
        });
      }
    }

    return { processed };
  }

  async listMatchesByLostPet(lostPetId: number): Promise<MatchResult[]> {
    const rows = await prisma.petMatch.findMany({
      where: { lostPetId: BigInt(lostPetId) },
      orderBy: { score: "desc" },
      take: 20,
    });

    return rows.map((row) => ({
      lostPetId: Number(row.lostPetId),
      foundPetId: Number(row.foundPetId),
      score: row.score,
      explanation: row.explanation ?? "",
    }));
  }
}
