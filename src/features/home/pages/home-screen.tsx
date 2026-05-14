"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mockPets } from "@/features/home/data/mock-pets";
import { FiltersBar } from "@/features/home/components/filters-bar";
import { PetDetailsModal } from "@/features/home/components/pet-details-modal";
import { PetsList } from "@/features/home/components/pets-list";
import { PetsMap } from "@/features/home/components/pets-map";
import { Resizer } from "@/features/home/components/resizer";
import { ReportPetModal } from "@/features/report/components/report-pet-modal";
import { SelectedReportPetModal } from "@/features/home/components/selected-report-pet-modal";
import { mapApiPetToUiPet } from "@/features/home/lib/pet-utils";
import { ApiFoundPet, FiltersState, Pet } from "@/features/home/types";
import type { ReportType } from "@/features/report/types/types";

const defaultFilters: FiltersState = {
  status: "all",
  species: "all",
  size: "all",
  date: "all",
};

function matchesDateFilter(createdAt: string | undefined, dateFilter: string): boolean {
  if (dateFilter === "all") {
    return true;
  }

  if (!createdAt) {
    return false;
  }

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return false;
  }

  const now = new Date();

  if (dateFilter === "today") {
    return createdDate.toDateString() === now.toDateString();
  }

  if (dateFilter === "week") {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    return createdDate >= sevenDaysAgo && createdDate <= now;
  }

  if (dateFilter === "month") {
    return (
      createdDate.getFullYear() === now.getFullYear() &&
      createdDate.getMonth() === now.getMonth()
    );
  }

  return true;
}

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
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const isDragging = useRef(false);

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

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging.current) {
        return;
      }

      event.preventDefault();

      const newWidth = event.clientX;
      const minWidth = 320;
      const maxWidth = window.innerWidth * 0.6;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
        window.dispatchEvent(new Event("resize"));
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";

      setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const filteredPets = useMemo(() => {
    return [...dbPets, ...mockPets].filter((pet) => {
      const matchesStatus = filters.status === "all" || pet.status === filters.status;
      const matchesSpecies = filters.species === "all" || pet.species === filters.species;
      const matchesSize = filters.size === "all" || pet.size === filters.size;
      const matchesDate = matchesDateFilter(pet.createdAt, filters.date);

      return matchesStatus && matchesSpecies && matchesSize && matchesDate;
    });
  }, [dbPets, filters.status, filters.species, filters.size, filters.date]);

  const hasActiveFilters = Object.entries(filters).some(
    ([field, value]) => value !== defaultFilters[field as keyof FiltersState],
  );

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

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
        hasActiveFilters={hasActiveFilters}
        onToggle={() => setShowFilters((current) => !current)}
        onFilterChange={handleFilterChange}
        onClearFilters={() => setFilters(defaultFilters)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          style={{ width: `${sidebarWidth}px` }}
          className="relative flex flex-shrink-0 flex-col overflow-hidden"
        >
          <PetsList
            pets={filteredPets}
            selectedPetId={selectedPet?.id}
            loadingDbPets={loadingDbPets}
            onPetSelect={handlePetSelect}
          />
        </div>

        <Resizer onMouseDown={handleMouseDown} />

        <div className="relative min-w-0 flex-1 bg-secondary/10">
          <PetsMap
            pets={filteredPets}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            onPetSelect={handlePetSelect}
          />
        </div>
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
