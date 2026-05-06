"use client";

import { Filter, X } from "lucide-react";
import { FiltersState } from "@/features/home/types";

interface FiltersBarProps {
  showFilters: boolean;
  filters: FiltersState;
  petCount: number;
  onToggle: () => void;
  onFilterChange: (field: keyof FiltersState, value: string) => void;
}

export function FiltersBar({
  showFilters,
  filters,
  petCount,
  onToggle,
  onFilterChange,
}: FiltersBarProps) {
  return (
    <div className="border-b bg-white px-4 py-3">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center rounded-full border border-border bg-white px-3 py-2 text-sm font-medium"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {showFilters && <X className="ml-2 h-3 w-3" />}
          </button>

          {showFilters && (
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.status}
                onChange={(event) => onFilterChange("status", event.target.value)}
                className="h-9 rounded-full border border-border bg-white px-3 text-sm"
              >
                <option value="all">Todas</option>
                <option value="lost">Perdidas</option>
                <option value="found">Encontradas</option>
              </select>
              <select
                value={filters.species}
                onChange={(event) => onFilterChange("species", event.target.value)}
                className="h-9 rounded-full border border-border bg-white px-3 text-sm"
              >
                <option value="all">Todas</option>
                <option value="dog">Perros</option>
                <option value="cat">Gatos</option>
              </select>
              <select
                value={filters.size}
                onChange={(event) => onFilterChange("size", event.target.value)}
                className="h-9 rounded-full border border-border bg-white px-3 text-sm"
              >
                <option value="all">Todos</option>
                <option value="small">Pequeno</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
              </select>
              <select
                value={filters.date}
                onChange={(event) => onFilterChange("date", event.target.value)}
                className="h-9 rounded-full border border-border bg-white px-3 text-sm"
              >
                <option value="all">Cualquier fecha</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
              </select>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{petCount} mascotas cerca</p>
      </div>
    </div>
  );
}
