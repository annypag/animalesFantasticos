import { PetSpecies } from "@/modules/shared/domain/pet-species";
import { PetSex } from "@/modules/shared/domain/pet-sex";

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

export function asPetSex(value: unknown): PetSex | null {
  const text = asTrimmedString(value).toLowerCase();
  if (text === "macho") {
    return "Macho";
  }

  if (text === "hembra") {
    return "Hembra";
  }

  if (text === "desconocido") {
    return "Desconocido";
  }

  return null;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asTrimmedString(item))
    .filter((item) => item.length > 0);
}

export function asOptionalQueryNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function asOptionalQueryDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function asDdMmYyyyToDate(value: unknown): Date | null {
  const text = asTrimmedString(value);
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}
