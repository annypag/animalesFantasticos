"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/auth-context";
import { RegistroForm } from "@/features/registro/components/registro-form";

export function RegistroScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password, phone || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center pt-16 px-6 pb-12 bg-background md:justify-center md:pt-12 md:px-0">
      <div className="w-full max-w-sm sm:max-w-md flex flex-col space-y-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-[#14B8A6] shadow-xl">
            <PawPrint className="h-11 w-11 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Woofie</h1>
          <p className="text-center text-muted-foreground">
            Creá tu cuenta para ayudar a reunir mascotas con sus familias
          </p>
        </motion.div>

        <RegistroForm
          fullName={fullName}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          phone={phone}
          showPassword={showPassword}
          error={error}
          loading={loading}
          onSubmit={handleSubmit}
          onFullNameChange={setFullName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onPhoneChange={setPhone}
          onTogglePasswordVisibility={() => setShowPassword((v) => !v)}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="pt-2 text-center"
        >
          <p className="text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-sm text-primary font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
