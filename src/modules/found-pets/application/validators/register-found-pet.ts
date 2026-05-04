import { RegisterFoundPetInput } from "@/modules/found-pets/domain/found-pet";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";
import {
  asFiniteNumber,
  asNullableTrimmedString,
  asPetSpecies,
  asTrimmedString,
} from "@/modules/shared/application/validation/payload-parsers";

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

export function validateRegisterFoundPetPayload(payload: unknown): RegisterFoundPetInput {
  const data = payload as RequestPayload;

  const name = asTrimmedString(data?.pet?.name);
  const species = asPetSpecies(data?.pet?.species);
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

  if (!species) {
    throw new ValidationError("La especie debe ser Perro, Gato u Otro.");
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
      species,
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
