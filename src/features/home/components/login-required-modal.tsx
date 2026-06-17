"use client";

import Link from "next/link";
import { X, PawPrint, LogIn, UserPlus } from "lucide-react";

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginRequiredModal({ open, onClose }: LoginRequiredModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <PawPrint className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Necesitás una cuenta
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Para publicar un reporte iniciá sesión o creá tu cuenta gratis. Solo toma un minuto.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <LogIn className="h-4 w-4" />
            Iniciar sesión
          </Link>

          <Link
            href="/registro"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Crear cuenta gratis
          </Link>
        </div>
      </div>
    </div>
  );
}
