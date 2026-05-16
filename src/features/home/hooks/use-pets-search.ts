"use client";

import { useEffect, useMemo, useState } from "react";

import { mockPets } from "@/features/home/data/mock-pets";
import { mapApiPetToUiPet } from "@/features/home/lib/pet-utils";
import type { ApiFoundPet, FiltersState, Pet } from "@/features/home/types";

export const defaultFilters: FiltersState = {
  status: "all",
  species: "all",
  size: "all",
  date: "all",
};

function matchesDateFilter(
  createdAt: string | undefined,
  dateFilter: FiltersState["date"],
): boolean {
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

interface UsePetsSearchOptions {
  initialFilters?: FiltersState;
}

export function usePetsSearch(options?: UsePetsSearchOptions) {
  const [loadingDbPets, setLoadingDbPets] = useState(true);
  const [dbPets, setDbPets] = useState<Pet[]>([]);
  const [filters, setFilters] = useState<FiltersState>(
    options?.initialFilters ?? defaultFilters,
  );

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

  const pets = useMemo(() => {
    return [...dbPets, ...mockPets];
  }, [dbPets]);

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesStatus =
        filters.status === "all" || pet.status === filters.status;

      const matchesSpecies =
        filters.species === "all" || pet.species === filters.species;

      const matchesSize =
        filters.size === "all" || pet.size === filters.size;

      const matchesDate = matchesDateFilter(pet.createdAt, filters.date);

      return matchesStatus && matchesSpecies && matchesSize && matchesDate;
    });
  }, [pets, filters.status, filters.species, filters.size, filters.date]);

  const hasActiveFilters = Object.entries(filters).some(
    ([field, value]) => value !== defaultFilters[field as keyof FiltersState],
  );

  const handleFilterChange = (
    field: keyof FiltersState,
    value: string,
  ) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const addFoundPetFromPayload = (payload: unknown): Pet | null => {
    if (
      !payload ||
      typeof payload !== "object" ||
      !("pet" in payload)
    ) {
      return null;
    }

    const response = payload as { pet: ApiFoundPet };
    const uiPet = mapApiPetToUiPet(response.pet);

    setDbPets((current) => [uiPet, ...current]);

    return uiPet;
  };

  return {
    pets,
    dbPets,
    filteredPets,
    filters,
    loadingDbPets,
    hasActiveFilters,
    setFilters,
    handleFilterChange,
    clearFilters,
    addFoundPetFromPayload,
  };
}