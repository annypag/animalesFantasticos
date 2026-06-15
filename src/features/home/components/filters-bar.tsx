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
    <label className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm transition-all select-none ${
      isActive 
        ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15 font-semibold shadow-sm"
        : "bg-white/50 border-slate-200/60 text-slate-600 hover:bg-white/80 hover:border-slate-300"
    }`}>
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer bg-transparent pr-1 text-xs font-semibold outline-none border-none focus:ring-0 focus:outline-none"
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
    <div className="sticky top-0 z-[100] w-full border-b border-slate-200/40 bg-white/75 backdrop-blur-md shadow-sm py-2 px-4">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle solo visible en mobile */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 backdrop-blur px-3 py-2 text-sm font-semibold shadow-sm md:hidden hover:bg-slate-50 transition cursor-pointer"
          >
            <Filter className="mr-2 h-4 w-4 text-slate-500" />
            Filtros
            {showFilters && <X className="ml-2 h-3.5 w-3.5 text-slate-400" />}
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
                className="inline-flex h-9 items-center rounded-full border border-red-200 bg-red-50/50 hover:bg-red-50 px-3 text-sm font-semibold text-red-600 shadow-sm transition hover:text-red-700 cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        <p className="shrink-0 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100/60 rounded-full px-3 py-1.5 border border-slate-200/30">
          {petCount} {petCount === 1 ? "mascota" : "mascotas"} cerca
        </p>
      </div>
    </div>
  );
}

