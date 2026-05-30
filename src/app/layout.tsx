import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/features/navigation/components/app-shell";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mascotas Perdidas | Encuentra y reporta",
  description:
    "Landing inspirada en la referencia original para visualizar reportes y login sin backend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
