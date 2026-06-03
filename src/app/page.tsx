import { Suspense } from "react";
import "leaflet/dist/leaflet.css";
import { HomeScreen } from "@/features/home/pages/home-screen";

// Route entrypoint for "/". UI and state live in features/home.
export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeScreen />
    </Suspense>
  );
}
