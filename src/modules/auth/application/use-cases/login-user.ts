import { AuthRepository, AuthUser, LoginInput } from "@/modules/auth/domain/auth";
import { AuthError } from "@/modules/auth/domain/auth-error";

export async function loginUser(repository: AuthRepository, input: LoginInput): Promise<AuthUser> {
  const user = await repository.findByEmail(input.email);
  if (!user) {
    throw new AuthError("Email o contraseña incorrectos.", 401);
  }

  if (user.passwordHash === null) {
    throw new AuthError("Esta cuenta está registrada con Google. Por favor, iniciá sesión con Google.", 400);
  }

  const valid = await repository.validatePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Email o contraseña incorrectos.", 401);
  }

  const { passwordHash: _, ...authUser } = user;
  return authUser;
}
