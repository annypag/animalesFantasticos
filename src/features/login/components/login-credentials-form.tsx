"use client";

import { FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";

interface LoginCredentialsFormProps {
  email: string;
  password: string;
  showPassword: boolean;
  error?: string | null;
  loading?: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
}

export function LoginCredentialsForm({
  email,
  password,
  showPassword,
  error,
  loading,
  onSubmit,
  onEmailChange,
  onPasswordChange,
  onTogglePasswordVisibility,
}: LoginCredentialsFormProps) {
  return (
    <motion.form
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      onSubmit={onSubmit}
      className="flex-1 space-y-6"
    >
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
            className="h-14 w-full rounded-2xl border-2 border-border bg-white pl-12 text-base focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            required
            className="h-14 w-full rounded-2xl border-2 border-border bg-white pl-12 pr-12 text-base focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={onTogglePasswordVisibility}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-primary py-6 text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </motion.form>
  );
}
