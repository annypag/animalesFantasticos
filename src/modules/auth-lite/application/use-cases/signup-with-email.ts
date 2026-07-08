import { PrismaAuthLiteRepository } from "@/modules/auth-lite/infrastructure/prisma-auth-lite-repository";

export async function signupWithEmail(repository: PrismaAuthLiteRepository, email: string) {
  return repository.signup(email);
}
