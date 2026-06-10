import { Suspense } from "react";
import "leaflet/dist/leaflet.css";
import { LandingScreen } from "@/features/landing/pages/landing-screen";

export const metadata = {
  title: "Animales Fantásticos - Inicio",
  description: "La red comunitaria para reportar mascotas perdidas y encontradas.",
};

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <LandingScreen />
    </Suspense>
  );
}