"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { getBreedsForSpecies } from "@/features/report/data/breeds";

interface BreedAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  species: string;
  hasError?: boolean;
}

export function BreedAutocomplete({ value, onChange, species, hasError }: BreedAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const breeds = getBreedsForSpecies(species);

  const filtered = inputValue.trim()
    ? breeds.filter((b) => b.toLowerCase().includes(inputValue.toLowerCase()))
    : breeds;

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // Si lo que escribió no está en la lista, igual lo aceptamos como valor libre
        if (inputValue.trim() !== value) {
          onChange(inputValue.trim());
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue, value, onChange]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    setOpen(true);
    onChange(e.target.value);
  }

  function handleSelect(breed: string) {
    setInputValue(breed);
    onChange(breed);
    setOpen(false);
  }

  function handleClear() {
    setInputValue("");
    onChange("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowDown" && !open) setOpen(true);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar raza..."
          autoComplete="off"
          className={`h-11 w-full rounded-2xl border bg-white px-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
            hasError ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <button type="button" onClick={handleClear} className="text-muted-foreground hover:text-foreground p-0.5">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-2xl border border-border bg-white shadow-lg">
          {filtered.map((breed) => (
            <li key={breed}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(breed)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-2xl last:rounded-b-2xl ${
                  breed === value ? "bg-primary/10 font-medium text-primary" : "text-foreground"
                }`}
              >
                {breed}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && inputValue.trim() && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-border bg-white shadow-lg px-3 py-2 text-sm text-muted-foreground">
          Se usará &ldquo;{inputValue.trim()}&rdquo; como raza personalizada
        </div>
      )}
    </div>
  );
}
