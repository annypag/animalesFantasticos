import { AuthRepository, AuthUser } from "@/modules/auth/domain/auth";

export async function authenticateGoogleUser(
  repository: AuthRepository,
  input: { fullName: string; email: string; googleId: string }
): Promise<AuthUser> {
  // 1. Buscar si ya existe un usuario con este googleId
  const user = await repository.findByGoogleId(input.googleId);
  if (user) {
    return user;
  }

  // 2. Buscar si ya existe un usuario por su email
  const existingEmailUser = await repository.findByEmail(input.email);
  if (existingEmailUser) {
    // Vincular la cuenta existente con Google
    await repository.linkGoogleAccount(existingEmailUser.id, input.googleId);
    return {
      id: existingEmailUser.id,
      email: existingEmailUser.email,
      fullName: existingEmailUser.fullName,
      phone: existingEmailUser.phone,
    };
  }

  // 3. Si no existe, crear un usuario nuevo de Google
  return repository.createGoogleUser(input);
}
