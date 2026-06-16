"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login(email: string, password: string, redirectTo?: string): Promise<void>;
  register(fullName: string, email: string, password: string, phone?: string): Promise<void>;
  logout(): Promise<void>;
  updateUser(fullName: string, phone?: string): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user: AuthUser } | null) => {
        setUser(data?.user ?? null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, redirectTo?: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { user?: AuthUser; message?: string };
    if (!res.ok) {
      throw new Error(data.message ?? "Error al iniciar sesión.");
    }
    setUser(data.user ?? null);
    router.push(redirectTo ?? "/");
  }, [router]);

  const register = useCallback(
    async (fullName: string, email: string, password: string, phone?: string) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, phone }),
      });
      const data = (await res.json()) as { user?: AuthUser; message?: string };
      if (!res.ok) {
        throw new Error(data.message ?? "Error al registrarse.");
      }
      setUser(data.user ?? null);
      router.push("/");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }, [router]);

  const updateUser = useCallback(async (fullName: string, phone?: string) => {
    const res = await fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone }),
    });

    const data = (await res.json()) as { user?: AuthUser; message?: string };
    
    if (!res.ok) {
      throw new Error(data.message ?? "Error al actualizar el perfil.");
    }

    // Hidratar el estado global de inmediato
    setUser(data.user ?? null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
