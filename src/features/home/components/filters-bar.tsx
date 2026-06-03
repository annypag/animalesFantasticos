"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { FiltersState } from "@/features/home/types";

interface FiltersBarProps {
  filters: FiltersState;
  petCount: number;
  hasActiveFilters: boolean;
  uniqueNeighborhoods: string[];
  uniqueBreeds: string[];
  onFilterChange: (field: keyof FiltersState, value: string) => void;
  onClearFilters: () => void;
}

interface FilterChipProps {
  label: string;
  isActive: boolean;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

function FilterChip({ label, isActive, value, onChange, children }: FilterChipProps) {
  return (
    <label className="flex h-9 cursor-pointer items-center gap-1 rounded-full border border-border bg-white px-3 text-sm hover:border-foreground/30 transition-colors">
      <span className={isActive ? "font-bold" : ""}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent text-sm outline-none"
      >
        {children}
      </select>
    </label>
  );
}

export function FiltersBar({
  filters,
  petCount,
  hasActiveFilters,
  uniqueNeighborhoods,
  uniqueBreeds,
  onFilterChange,
  onClearFilters,
}: FiltersBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="border-b bg-white px-4 py-3">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle solo visible en mobile */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="inline-flex items-center rounded-full border border-border bg-white px-3 py-2 text-sm font-medium md:hidden"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {showFilters && <X className="ml-2 h-3 w-3" />}
          </button>

          {/* En mobile: controlado por showFilters. En md+: siempre visible */}
          <div className={`${showFilters ? "flex" : "hidden"} md:flex flex-wrap items-center gap-2`}>
            <FilterChip
              label="Estado"
              isActive={filters.status !== "all"}
              value={filters.status}
              onChange={(v) => onFilterChange("status", v)}
            >
              <option value="all">Todas</option>
              <option value="lost">Perdidas</option>
              <option value="found">Encontradas</option>
            </FilterChip>

            <FilterChip
              label="Especie"
              isActive={filters.species !== "all"}
              value={filters.species}
              onChange={(v) => onFilterChange("species", v)}
            >
              <option value="all">Todas</option>
              <option value="Perro">Perros</option>
              <option value="Gato">Gatos</option>
            </FilterChip>

            <FilterChip
              label="Tamaño"
              isActive={filters.size !== "all"}
              value={filters.size}
              onChange={(v) => onFilterChange("size", v)}
            >
              <option value="all">Todos</option>
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
            </FilterChip>

            <FilterChip
              label="Sexo"
              isActive={filters.sex !== "all"}
              value={filters.sex}
              onChange={(v) => onFilterChange("sex", v)}
            >
              <option value="all">Todos</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </FilterChip>

            <FilterChip
              label="Barrio"
              isActive={filters.neighborhood !== "all"}
              value={filters.neighborhood}
              onChange={(v) => onFilterChange("neighborhood", v)}
            >
              <option value="all">Todos</option>
              {uniqueNeighborhoods.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </FilterChip>

            <FilterChip
              label="Raza"
              isActive={filters.breed !== "all"}
              value={filters.breed}
              onChange={(v) => onFilterChange("breed", v)}
            >
              <option value="all">Todas</option>
              {uniqueBreeds.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </FilterChip>

            <FilterChip
              label="Fecha"
              isActive={filters.date !== "all"}
              value={filters.date}
              onChange={(v) => onFilterChange("date", v)}
            >
              <option value="all">Cualquier fecha</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </FilterChip>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex h-9 items-center rounded-full border border-border bg-white px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        <p className="shrink-0 text-sm text-muted-foreground">{petCount} mascotas cerca</p>
      </div>
    </div>
  );
}
