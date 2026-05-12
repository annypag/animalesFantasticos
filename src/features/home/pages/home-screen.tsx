"use client";

import { useEffect, useMemo, useState } from "react";
import { mockPets } from "@/features/home/data/mock-pets";
import { FiltersBar } from "@/features/home/components/filters-bar";
import { PetDetailsModal } from "@/features/home/components/pet-details-modal";
import { PetsList } from "@/features/home/components/pets-list";
import { PetsMap } from "@/features/home/components/pets-map";
import { mapApiPetToUiPet } from "@/features/home/lib/pet-utils";
import { ApiFoundPet, FiltersState, Pet } from "@/features/home/types";
import { SelectedReportPetModal } from "@/features/home/components/selected-report-pet-modal";
import { ReportPetModal } from "@/features/report/components/report-pet-modal";
import type { ReportType } from "@/features/report/types/types";

export function HomeScreen() {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("found");
  const [reportLocation, setReportLocation] = useState<[number, number] | null>(
    null,
  );

  const [loadingDbPets, setLoadingDbPets] = useState(true);
  const [dbPets, setDbPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);

  const [filters, setFilters] = useState<FiltersState>({
    species: "all",
    size: "all",
    date: "all",
  });

  useEffect(() => {
    import("leaflet").then((L) => {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  useEffect(() => {
    let active = true;

    async function loadFoundPets() {
      try {
        const response = await fetch("/api/found-pets", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudieron obtener reportes guardados.");
        }

        const data = (await response.json()) as { pets: ApiFoundPet[] };

        if (active) {
          setDbPets(data.pets.map(mapApiPetToUiPet));
        }
      } catch (error) {
        if (active) {
          console.error(error);
        }
      } finally {
        if (active) {
          setLoadingDbPets(false);
        }
      }
    }

    loadFoundPets();

    return () => {
      active = false;
    };
  }, []);

  const filteredPets = useMemo(() => [...dbPets, ...mockPets], [dbPets]);

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
    setModalOpen(true);
  };

  const handleMarkerClick = (pet: Pet) => {
    setSelectedPet(pet);
  };

  const handleMapClick = (coordinates: [number, number]) => {
    setReportLocation(coordinates);
    setSelectionModalOpen(true);
  };

  const handleSelectFound = () => {
    setReportType("found");
    setSelectionModalOpen(false);
    setReportModalOpen(true);
  };

  const handleSelectLost = () => {
    setReportType("lost");
    setSelectionModalOpen(false);
    setReportModalOpen(true);
  };

  const handleFilterChange = (field: keyof FiltersState, value: string) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleReportSuccess = (payload: unknown) => {
    setReportLocation(null);

    if (
      reportType === "found" &&
      payload &&
      typeof payload === "object" &&
      "pet" in payload
    ) {
      const response = payload as { pet: ApiFoundPet };
      const uiPet = mapApiPetToUiPet(response.pet);

      setDbPets((current) => [uiPet, ...current]);
      setSelectedPet(uiPet);
      setModalOpen(true);
    }
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <FiltersBar
        showFilters={showFilters}
        filters={filters}
        petCount={filteredPets.length}
        onToggle={() => setShowFilters((current) => !current)}
        onFilterChange={handleFilterChange}
      />

      <div className="flex flex-1 overflow-hidden">
        <PetsList
          pets={filteredPets}
          selectedPetId={selectedPet?.id}
          loadingDbPets={loadingDbPets}
          onPetSelect={handlePetSelect}
        />

        <PetsMap
          pets={filteredPets}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          onPetSelect={handlePetSelect}
        />
      </div>

      <SelectedReportPetModal
        open={selectionModalOpen}
        onClose={() => setSelectionModalOpen(false)}
        onSelectFound={handleSelectFound}
        onSelectLost={handleSelectLost}
      />

      <ReportPetModal
        open={reportModalOpen}
        type={reportType}
        reportLocation={reportLocation}
        onClose={() => setReportModalOpen(false)}
        onSuccess={handleReportSuccess}
      />

      <PetDetailsModal
        pet={selectedPet}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}