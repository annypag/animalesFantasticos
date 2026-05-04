"use client";

import Link from "next/link";
import { Menu, PawPrint, Search, User } from "lucide-react";

interface HomeNavbarProps {
  onReportClick: () => void;
}

export function HomeNavbar({ onReportClick }: HomeNavbarProps) {
  return (
    <nav className="sticky top-0 z-[1200] w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
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
              placeholder="Buscar por nombre, raza, ubicacion..."
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
            Reportar Perdida
          </button>

          <Link
            href="/login"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground"
          >
            <User className="h-5 w-5" />
          </Link>

          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
