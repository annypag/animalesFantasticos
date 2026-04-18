import {
  PetSpecies,
  RegisterFoundPetInput,
} from "@/modules/found-pets/domain/found-pet";
import { ValidationError } from "@/modules/found-pets/application/errors/validation-error";

interface RequestPayload {
  pet?: {
    name?: unknown;
    species?: unknown;
    breed?: unknown;
    imageUrl?: unknown;
    description?: unknown;
    locationText?: unknown;
    latitude?: unknown;
    longitude?: unknown;
  };
  finder?: {
    fullName?: unknown;
    phone?: unknown;
    email?: unknown;
  };
}

function asTrimmedString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function asNullableTrimmedString(value: unknown): string | null {
  const text = asTrimmedString(value);
  return text.length > 0 ? text : null;
}

function asFiniteNumber(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return Number.NaN;
  }

  return value;
}

function normalizeSpecies(value: string): PetSpecies {
  if (value === "Perro" || value === "Gato" || value === "Otro") {
    return value;
  }

  throw new ValidationError("La especie debe ser Perro, Gato u Otro.");
}

export function validateRegisterFoundPetPayload(payload: unknown): RegisterFoundPetInput {
  const data = payload as RequestPayload;

  const name = asTrimmedString(data?.pet?.name);
  const speciesText = asTrimmedString(data?.pet?.species);
  const breed = asTrimmedString(data?.pet?.breed);
  const description = asTrimmedString(data?.pet?.description);
  const imageUrl = asNullableTrimmedString(data?.pet?.imageUrl);
  const locationText = asNullableTrimmedString(data?.pet?.locationText);
  const latitude = asFiniteNumber(data?.pet?.latitude);
  const longitude = asFiniteNumber(data?.pet?.longitude);

  const fullName = asTrimmedString(data?.finder?.fullName);
  const phone = asTrimmedString(data?.finder?.phone);
  const email = asNullableTrimmedString(data?.finder?.email);

  if (!name || !breed || !description || !fullName || !phone) {
    throw new ValidationError(
      "Faltan campos obligatorios. Completá nombre, raza, descripción y datos de contacto.",
    );
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new ValidationError("La latitud es inválida.");
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new ValidationError("La longitud es inválida.");
  }

  return {
    pet: {
      name,
      species: normalizeSpecies(speciesText),
      breed,
      imageUrl,
      description,
      locationText,
      latitude,
      longitude,
    },
    owner: {
      fullName,
      phone,
      email,
    },
  };
}
