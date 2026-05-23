import { ProfileScreen } from "@/features/profile/pages/profile-screen";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Perfil | Animales Fantásticos",
  description: "Gestiona tu perfil, mensajes y publicaciones de mascotas.",
};

export default function ProfilePage() {
  return <ProfileScreen />;
}