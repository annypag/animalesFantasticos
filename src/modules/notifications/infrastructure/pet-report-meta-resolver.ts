import { prisma } from "@/lib/prisma";
import type { PetReportKind } from "@/modules/messaging/domain/messaging";

export type PetReportMeta = {
  userId: number;
  petName: string;
  resolvedAt: Date | null;
};

export async function resolvePetReportMeta(
  petKind: PetReportKind,
  petId: number,
): Promise<PetReportMeta | null> {
  if (petKind === "FOUND") {
    const pet = await prisma.foundPet.findUnique({
      where: { id: BigInt(petId) },
      select: { userId: true, name: true, resolvedAt: true },
    });

    if (!pet) {
      return null;
    }

    return {
      userId: Number(pet.userId),
      petName: pet.name,
      resolvedAt: pet.resolvedAt,
    };
  }

  const pet = await prisma.lostPet.findUnique({
    where: { id: BigInt(petId) },
    select: { userId: true, name: true, resolvedAt: true },
  });

  if (!pet) {
    return null;
  }

  return {
    userId: Number(pet.userId),
    petName: pet.name,
    resolvedAt: pet.resolvedAt,
  };
}
