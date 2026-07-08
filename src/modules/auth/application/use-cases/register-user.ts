import { AuthRepository, AuthUser, RegisterInput } from "@/modules/auth/domain/auth";
import { AuthError } from "@/modules/auth/domain/auth-error";

export async function registerUser(
  repository: AuthRepository,
  input: RegisterInput,
): Promise<AuthUser> {
  const existing = await repository.findByEmail(input.email);
  if (existing) {
    throw new AuthError("Este email ya está registrado.", 409);
  }

  return repository.create(input);
}
