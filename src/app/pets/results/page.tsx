import { Suspense } from "react";
import { PetsResultsScreen } from "@/features/home/pages/pets-results-screen";


export default function PetsPage() {
  return (
    <Suspense fallback={null}>
      <PetsResultsScreen />
    </Suspense>
  );
}