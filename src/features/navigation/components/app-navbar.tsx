"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CirclePlus, LogOut, PawPrint, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const avatarUrl = user
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=f1f5f9&color=0f172a&size=128`
    : null;

  const firstName = user?.fullName.split(" ")[0] ?? "";

  return (
    <>
      {/* Navbar Desktop */}
      <nav className="hidden w-full border-b border-border bg-white shadow-sm md:block">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 md:px-6">
          {/* Logo — funciona como link a inicio */}
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary">
              <PawPrint className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Woofie</p>
              <p className="text-xs text-muted-foreground">Mascotas perdidas y encontradas</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Nuevo reporte */}
            <Link
              href="/nuevoReporte"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                pathname === "/nuevoReporte"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground hover:bg-muted"
              }`}
            >
              <CirclePlus className="h-4 w-4" />
              <span>Nuevo reporte</span>
            </Link>

            {user ? (
              <>
                {/* Botón con nombre del usuario → va a Mi Perfil */}
                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === "/profile"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="h-6 w-6 overflow-hidden rounded-full border border-border">
                    <img
                      src={avatarUrl!}
                      alt={user.fullName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span>{firstName}</span>
                </button>

                {/* Cerrar sesión con hover text rojo */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <>
                {/* No autenticado */}
                <Link
                  href="/registro"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    pathname === "/registro"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Registrate</span>
                </Link>
                <Link
                  href="/login"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    pathname === "/login"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <span>Iniciar sesión</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Navbar Mobile — barra inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-[1300] border-t border-border bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-2 safe-bottom">
          {/* Inicio */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-colors ${
              pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <PawPrint className="h-5 w-5" />
            <span>Inicio</span>
          </Link>

          {/* Nuevo reporte */}
          <Link
            href="/nuevoReporte"
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-colors ${
              pathname === "/nuevoReporte"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <CirclePlus className="h-5 w-5" />
            <span>Reportar</span>
          </Link>

          {user ? (
            <>
              {/* Mi cuenta → nombre de usuario */}
              <Link
                href="/profile"
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-colors ${
                  pathname === "/profile"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="h-6 w-6 overflow-hidden rounded-full border border-border">
                  <img
                    src={avatarUrl!}
                    alt={user.fullName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="max-w-[56px] truncate">{firstName}</span>
              </Link>

              {/* Logout con hover rojo */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
                <span>Salir</span>
              </button>
            </>
          ) : (
            <>
              {/* Registrate */}
              <Link
                href="/registro"
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-colors ${
                  pathname === "/registro"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <User className="h-5 w-5" />
                <span>Registrate</span>
              </Link>

              {/* Iniciar sesión */}
              <Link
                href="/login"
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition-colors ${
                  pathname === "/login"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <LogOut className="h-5 w-5 rotate-180" />
                <span>Ingresar</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="h-20 md:hidden" />
    </>
  );
}
