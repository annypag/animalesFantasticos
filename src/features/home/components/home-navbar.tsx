"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, PawPrint, Search } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface HomeNavbarProps {
  onReportClick: () => void;
}

export function HomeNavbar({ onReportClick }: HomeNavbarProps) {
  const { user, loading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  const avatarUrl = user
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=f1f5f9&color=0f172a&size=128`
    : null;

  return (
    <nav className="sticky top-0 z-[1200] w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Logo — también funciona como link a inicio */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <PawPrint className="h-6 w-6 text-white" />
          </div>
          <span className="hidden text-xl font-semibold text-foreground sm:inline-block">
            Woofie
          </span>
        </Link>

        <form className="mx-8 hidden max-w-xl flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar por nombre, raza, ubicación..."
              className="w-full rounded-full border border-border bg-secondary/50 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </form>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReportClick}
            className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 sm:inline-flex"
          >
            Reportar pérdida
          </button>

          {/* Área de autenticación */}
          {!loading && (
            <>
              {user ? (
                /* Usuario autenticado: avatar + dropdown Mi cuenta */
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full border border-border px-2 py-1 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <div className="h-8 w-8 overflow-hidden rounded-full border border-border">
                      <img
                        src={avatarUrl!}
                        alt={user.fullName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {user.fullName.split(" ")[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-white shadow-lg py-1 z-50">
                      <button
                        type="button"
                        onClick={() => { setDropdownOpen(false); router.push("/profile"); }}
                        className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
                      >
                        Mi perfil
                      </button>
                      <hr className="my-1 border-border" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* No autenticado: Registrarse + Iniciar sesión */
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    href="/registro"
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Registrarse
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              )}
            </>
          )}

          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
