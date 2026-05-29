import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { verifyToken } from "@/lib/auth/jwt";

const PROTECTED_POST_ROUTES = ["/api/lost-pets", "/api/found-pets"];
const PROTECTED_PAGES = ["/profile"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Guard de páginas: redirige a /login si no hay sesión válida
  if (PROTECTED_PAGES.some((p) => pathname.startsWith(p))) {
    const token = getSessionToken(request);
    const payload = token ? await verifyToken(token) : null;

    if (!payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Guard de API: bloquea POST sin sesión
  const isProtectedApi =
    request.method === "POST" && PROTECTED_POST_ROUTES.some((r) => pathname.startsWith(r));

  if (!isProtectedApi) {
    return NextResponse.next();
  }

  const token = getSessionToken(request);
  if (!token) {
    return NextResponse.json(
      { message: "Debés iniciar sesión para publicar un reporte." },
      { status: 401 },
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { message: "Sesión inválida o expirada. Iniciá sesión nuevamente." },
      { status: 401 },
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.sub);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/profile/:path*", "/api/lost-pets/:path*", "/api/found-pets/:path*"],
};
