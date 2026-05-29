"use client";

import { FormEvent, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoginCredentialsForm } from "@/features/login/components/login-credentials-form";
import { LoginFooter } from "@/features/login/components/login-footer";
import { LoginHero } from "@/features/login/components/login-hero";

function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginCredentialsForm
        email={email}
        password={password}
        showPassword={showPassword}
        error={error}
        loading={loading}
        onSubmit={handleLogin}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onTogglePasswordVisibility={() => setShowPassword((value) => !value)}
      />
      <LoginFooter />
    </>
  );
}

export function LoginScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center pt-24 px-6 pb-12 bg-background md:justify-center md:pt-12 md:px-0 safe-area">
      <div className="w-full max-w-sm sm:max-w-md flex flex-col space-y-8">
        <LoginHero />
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
