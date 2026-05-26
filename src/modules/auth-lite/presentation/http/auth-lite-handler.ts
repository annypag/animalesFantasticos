import { NextResponse } from "next/server";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";
import { signupWithEmail } from "@/modules/auth-lite/application/use-cases/signup-with-email";
import { verifyEmailToken } from "@/modules/auth-lite/application/use-cases/verify-email-token";
import { PrismaAuthLiteRepository } from "@/modules/auth-lite/infrastructure/prisma-auth-lite-repository";

const repository = new PrismaAuthLiteRepository();

export async function handleAuthSignupPost(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      throw new ValidationError("Email invalido.");
    }

    const result = await signupWithEmail(repository, email);

    return NextResponse.json(
      {
        userId: result.userId,
        email: result.email,
        verificationToken: result.verificationToken,
        message: "Registro creado. Verifica el email para publicar automaticamente.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error("POST /api/auth/signup failed", error);
    return NextResponse.json({ message: "No se pudo crear el registro." }, { status: 500 });
  }
}

export async function handleAuthVerifyEmailPost(request: Request) {
  try {
    const body = (await request.json()) as { token?: unknown };
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!token) {
      throw new ValidationError("Token requerido.");
    }

    const verified = await verifyEmailToken(repository, token);
    if (!verified) {
      return NextResponse.json({ message: "Token invalido o expirado." }, { status: 400 });
    }

    return NextResponse.json({ verified: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error("POST /api/auth/verify-email failed", error);
    return NextResponse.json({ message: "No se pudo verificar el email." }, { status: 500 });
  }
}
