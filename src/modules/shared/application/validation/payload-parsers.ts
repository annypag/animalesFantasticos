import { PetSpecies } from "@/modules/shared/domain/pet-species";

export function asTrimmedString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function asNullableTrimmedString(value: unknown): string | null {
  const text = asTrimmedString(value);
  return text.length > 0 ? text : null;
}

export function asFiniteNumber(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return Number.NaN;
  }

  return value;
}

export function asPetSpecies(value: unknown): PetSpecies | null {
  const text = asTrimmedString(value);
  if (text === "Perro" || text === "Gato" || text === "Otro") {
    return text;
  }

  return null;
}
