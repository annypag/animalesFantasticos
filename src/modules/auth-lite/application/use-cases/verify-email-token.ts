import { PrismaAuthLiteRepository } from "@/modules/auth-lite/infrastructure/prisma-auth-lite-repository";

export async function verifyEmailToken(repository: PrismaAuthLiteRepository, token: string) {
  return repository.verifyEmail(token);
}
