"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginCredentialsForm } from "@/features/login/components/login-credentials-form";
import { LoginFooter } from "@/features/login/components/login-footer";
import { LoginHero } from "@/features/login/components/login-hero";

export function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-12 safe-area">
      <LoginHero />

      <LoginCredentialsForm
        email={email}
        password={password}
        showPassword={showPassword}
        onSubmit={handleLogin}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onTogglePasswordVisibility={() => setShowPassword((value) => !value)}
      />

      <LoginFooter />
    </div>
  );
}