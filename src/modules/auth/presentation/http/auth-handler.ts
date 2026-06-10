import { NextResponse } from "next/server";
import { loginUser } from "@/modules/auth/application/use-cases/login-user";
import { registerUser } from "@/modules/auth/application/use-cases/register-user";
import { PrismaAuthRepository } from "@/modules/auth/infrastructure/prisma-auth-repository";
import { AuthError } from "@/modules/auth/domain/auth-error";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie, clearSessionCookie, getSessionToken } from "@/lib/auth/session";
import { verifyToken } from "@/lib/auth/jwt";
import { authenticateGoogleUser } from "@/modules/auth/application/use-cases/google-auth";

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
    return NextResponse.json({ message: "Sesión inválida o expirada." }, { status: 401 });
  }

  return NextResponse.json(
    {
      user: {
        id: Number(payload.sub),
        email: payload.email,
        fullName: payload.fullName,
      },
    },
    { status: 200 },
  );
}

export async function handleGoogleLoginRedirect(request: Request) {
  const url = new URL(request.url);
  const redirect = url.searchParams.get("redirect") ?? "/";
  const state = encodeURIComponent(redirect);
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId) {
    console.log("Mock Mode activado en Google Login redirect. Redirigiendo directamente al callback mock.");
    return NextResponse.redirect(`${redirectUri}?code=mock_google_code&state=${state}`);
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20email%20profile&state=${state}`;

  return NextResponse.redirect(googleAuthUrl);
}

export async function handleGoogleCallback(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code") ?? "";
    const state = url.searchParams.get("state") ?? "/";
    const redirectUrl = decodeURIComponent(state);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    let profile: { email: string; name: string; sub: string };

    if (code === "mock_google_code") {
      profile = {
        email: "google-mock-user@example.com",
        name: "Mock Google User",
        sub: "mock-google-id-12345",
      };
    } else if (code) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent("Credenciales de Google no configuradas.")}`);
      }

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("Error exchanging Google code for token:", errText);
        return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent("Error al autenticar con Google.")}`);
      }

      const tokenData = (await tokenRes.json()) as { access_token: string };

      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoRes.ok) {
        return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent("Error al obtener datos de Google.")}`);
      }

      const data = (await userInfoRes.json()) as { email: string; name: string; sub: string };
      profile = {
        email: data.email,
        name: data.name || data.email.split("@")[0],
        sub: data.sub,
      };
    } else {
      return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent("Código de autorización no provisto.")}`);
    }

    const user = await authenticateGoogleUser(repository, {
      fullName: profile.name,
      email: profile.email,
      googleId: profile.sub,
    });

    const token = await signToken({
      sub: String(user.id),
      email: user.email,
      fullName: user.fullName,
    });

    const response = NextResponse.redirect(`${appUrl}${redirectUrl}`);
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Google Callback failed", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent("Error inesperado en el inicio de sesión.")}`);
  }
}
