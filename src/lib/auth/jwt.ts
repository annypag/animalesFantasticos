import { SignJWT, jwtVerify } from "jose";

export interface JwtPayload {
  sub: string;
  email: string;
  fullName: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no está configurado en las variables de entorno.");
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email, fullName: payload.fullName })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      sub: payload.sub as string,
      email: payload["email"] as string,
      fullName: payload["fullName"] as string,
    };
  } catch {
    return null;
  }
}
