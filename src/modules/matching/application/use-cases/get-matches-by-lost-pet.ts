import { PrismaMatchingRepository } from "@/modules/matching/infrastructure/prisma-matching-repository";

export async function getMatchesByLostPet(repository: PrismaMatchingRepository, lostPetId: number) {
  return repository.listMatchesByLostPet(lostPetId);
}
