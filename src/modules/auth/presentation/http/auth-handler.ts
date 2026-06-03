import { NextResponse } from "next/server";
import { loginUser } from "@/modules/auth/application/use-cases/login-user";
import { registerUser } from "@/modules/auth/application/use-cases/register-user";
import { PrismaAuthRepository } from "@/modules/auth/infrastructure/prisma-auth-repository";
import { AuthError } from "@/modules/auth/domain/auth-error";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie, clearSessionCookie, getSessionToken } from "@/lib/auth/session";
import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

const repository = new PrismaAuthRepository();

export async function handlePostLogin(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ message: "Email y contraseña son requeridos." }, { status: 400 });
    }

    const user = await loginUser(repository, { email, password });
    const token = await signToken({ sub: String(user.id), email: user.email, fullName: user.fullName });

    const response = NextResponse.json({ user }, { status: 200 });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    console.error("POST /api/auth/login failed", error);
    return NextResponse.json({ message: "Error al iniciar sesión." }, { status: 500 });
  }
}

export async function handlePostRegister(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: unknown;
      email?: unknown;
      password?: unknown;
      phone?: unknown;
    };
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: "Nombre, email y contraseña son requeridos." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 },
      );
    }

    const user = await registerUser(repository, { fullName, email, password, phone });
    const token = await signToken({ sub: String(user.id), email: user.email, fullName: user.fullName });

    const response = NextResponse.json({ user }, { status: 201 });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    console.error("POST /api/auth/signup failed", error);
    return NextResponse.json({ message: "Error al registrarse." }, { status: 500 });
  }
}

export function handlePostLogout() {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  clearSessionCookie(response);
  return response;
}

export async function handleGetMe(request: Request) {
  const token = getSessionToken(request);
  if (!token) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const response = NextResponse.json(
      { message: "Sesión inválida o expirada." },
      { status: 401 },
    );
    clearSessionCookie(response);
    return response;
  }

  const userId = Number(payload.sub);
  if (!Number.isInteger(userId) || userId <= 0) {
    const response = NextResponse.json(
      { message: "Sesión inválida o expirada." },
      { status: 401 },
    );
    clearSessionCookie(response);
    return response;
  }

  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
    },
  });

  if (!user) {
    const response = NextResponse.json(
      {
        message:
          "Tu cuenta ya no existe en la base de datos (por ejemplo, después de un reset). Volvé a registrarte o iniciá sesión.",
      },
      { status: 401 },
    );
    clearSessionCookie(response);
    return response;
  }

  return NextResponse.json(
    {
      user: {
        id: Number(user.id),
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
      },
    },
    { status: 200 },
  );
}
