import { verifyToken } from "@/lib/auth/jwt";
import { getSessionToken } from "@/lib/auth/session";

export async function getUserIdFromRequest(
  request: Request,
): Promise<number | null> {
  const headerUserId = request.headers.get("x-user-id");
  if (headerUserId) {
    const parsed = Number(headerUserId);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  const token = getSessionToken(request);
  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload?.sub) {
    return null;
  }

  const parsed = Number(payload.sub);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
