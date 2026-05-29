import { PrismaMatchingRepository } from "@/modules/matching/infrastructure/prisma-matching-repository";

export async function recomputeMatches(repository: PrismaMatchingRepository, threshold: number) {
  return repository.recomputeOnce(threshold);
}
