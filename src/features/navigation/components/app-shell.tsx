"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppNavbar } from "@/features/navigation/components/app-navbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const shouldShowNavbar = !pathname.startsWith("/login");

  return (
    <>
      {shouldShowNavbar ? <AppNavbar /> : null}
      {children}
    </>
  );
}
