import { prisma } from "@/lib/prisma";

const STALE_SESSION_MESSAGE =
  "Tu cuenta ya no existe en la base de datos (suele pasar después de un reset de la DB). Cerrá sesión, registrate o iniciá sesión de nuevo y volvé a publicar.";

export async function ensureUserExists(userId: number): Promise<string | null> {
  if (!Number.isInteger(userId) || userId <= 0) {
    return STALE_SESSION_MESSAGE;
  }

  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    select: { id: true },
  });

  return user ? null : STALE_SESSION_MESSAGE;
}
