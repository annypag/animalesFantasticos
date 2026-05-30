"use client";

import { FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { motion } from "motion/react";

interface RegistroFormProps {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  showPassword: boolean;
  error?: string | null;
  loading?: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
}

export function RegistroForm({
  fullName,
  email,
  password,
  confirmPassword,
  phone,
  showPassword,
  error,
  loading,
  onSubmit,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onPhoneChange,
  onTogglePasswordVisibility,
}: RegistroFormProps) {
  return (
    <motion.form
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      onSubmit={onSubmit}
      className="flex-1 space-y-5"
    >
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          Nombre completo
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="fullName"
            type="text"
            placeholder="Tu nombre y apellido"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            required
            className="h-14 w-full rounded-2xl border-2 border-border bg-white pl-12 text-base focus:border-primary focus:outline-none"
          />
        </div>
      </div>

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
            onChange={(e) => onEmailChange(e.target.value)}
            required
            className="h-14 w-full rounded-2xl border-2 border-border bg-white pl-12 text-base focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Teléfono <span className="text-muted-foreground font-normal">(opcional)</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="phone"
            type="tel"
            placeholder="+54 11 1234-5678"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            minLength={6}
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

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmar contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Repetí tu contraseña"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            required
            className="h-14 w-full rounded-2xl border-2 border-border bg-white pl-12 text-base focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-primary py-6 text-base font-semibold text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>
    </motion.form>
  );
}
