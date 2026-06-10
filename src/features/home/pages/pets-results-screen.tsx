"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { FiltersBar } from "@/features/home/components/filters-bar";
import { PetDetailsModal } from "@/features/home/components/pet-details-modal";
import { PetsList } from "@/features/home/components/pets-list";
import { usePetsSearch } from "@/features/home/hooks/use-pets-search";
import type { Pet } from "@/features/home/types";

export function PetsResultsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    filteredPets,
    filters,
    loadingDbPets,
    hasActiveFilters,
    uniqueNeighborhoods,
    uniqueBreeds,
    handleFilterChange,
    clearFilters,
  } = usePetsSearch();

  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    setModalOpen(true);
  };

  const handleBackToMap = () => {
    const queryString = searchParams.toString();
    const url = queryString ? `/?${queryString}` : "/";

    router.push(url);
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <button
          type="button"
          onClick={handleBackToMap}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al mapa
        </button>

        <div>
          <h1 className="text-lg font-semibold">Listado de mascotas</h1>
          <p className="text-sm text-muted-foreground">
            {filteredPets.length} mascotas encontradas según los filtros
            seleccionados.
          </p>
        </div>
      </div>

      <FiltersBar
        filters={filters}
        petCount={filteredPets.length}
        hasActiveFilters={hasActiveFilters}
        uniqueNeighborhoods={uniqueNeighborhoods}
        uniqueBreeds={uniqueBreeds}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <section className="min-h-0 flex-1 overflow-hidden">
        <PetsList
          pets={filteredPets}
          selectedPetId={selectedPet?.id}
          loadingDbPets={loadingDbPets}
          onPetSelect={handlePetSelect}
        />
      </section>

      <PetDetailsModal
        pet={selectedPet}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}
