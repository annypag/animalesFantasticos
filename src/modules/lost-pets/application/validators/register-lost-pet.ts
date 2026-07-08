import { RegisterLostPetInput } from "@/modules/lost-pets/domain/lost-pet";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";
import {
  asDdMmYyyyToDate,
  asFiniteNumber,
  asNullableTrimmedString,
  asPetSex,
  asPetSpecies,
  asTrimmedString,
} from "@/modules/shared/application/validation/payload-parsers";

interface RequestPayload {
  pet?: {
    name?: unknown;
    species?: unknown;
    sex?: unknown;
    breed?: unknown;
    imageUrl?: unknown;
    imageCapture?: unknown;
    description?: unknown;
    locationText?: unknown;
    neighborhood?: unknown;
    latitude?: unknown;
    longitude?: unknown;
    lastSeen?: unknown;
    reportDate?: unknown;
  };
  owner?: {
    fullName?: unknown;
    phone?: unknown;
    email?: unknown;
  };
}

export function validateRegisterLostPetPayload(payload: unknown, userId: number): RegisterLostPetInput {
  const data = payload as RequestPayload;

  const name = asTrimmedString(data?.pet?.name);
  const species = asPetSpecies(data?.pet?.species);
  const sex = asPetSex(data?.pet?.sex);
  const breed = asTrimmedString(data?.pet?.breed);
  const description = asTrimmedString(data?.pet?.description);
  const imageUrl = asNullableTrimmedString(data?.pet?.imageUrl);
  const imageCapture = Array.isArray(data?.pet?.imageCapture)
    ? data.pet.imageCapture.filter(
        (item): item is { id: string; fileName: string; fileUrl: string } =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { id?: unknown }).id === "string" &&
          typeof (item as { fileName?: unknown }).fileName === "string" &&
          typeof (item as { fileUrl?: unknown }).fileUrl === "string",
      )
    : [];
  const locationText = asNullableTrimmedString(data?.pet?.locationText);
  const neighborhood = asTrimmedString(data?.pet?.neighborhood);
  const latitude = asFiniteNumber(data?.pet?.latitude);
  const longitude = asFiniteNumber(data?.pet?.longitude);
  const lastSeen = asTrimmedString(data?.pet?.lastSeen);
  const reportDate = asDdMmYyyyToDate(data?.pet?.reportDate);

  const fullName = asTrimmedString(data?.owner?.fullName);
  const phone = asTrimmedString(data?.owner?.phone);
  const email = asNullableTrimmedString(data?.owner?.email);

  if (!name || !breed || !description || !fullName || !phone || !lastSeen || !neighborhood) {
    throw new ValidationError(
      "Faltan campos obligatorios. Completa nombre, raza, barrio, descripcion, ultimo avistamiento y contacto.",
    );
  }

  if (!species) {
    throw new ValidationError("La especie debe ser Perro, Gato u Otro.");
  }

  if (!sex) {
    throw new ValidationError("El sexo debe ser Macho, Hembra o Desconocido.");
  }

  if (!reportDate) {
    throw new ValidationError("La fecha debe tener formato dd/mm/yyyy.");
  }

  if (imageCapture.length === 0 && !imageUrl) {
    throw new ValidationError("Debe incluir al menos una foto de la mascota.");
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new ValidationError("La latitud es invalida.");
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new ValidationError("La longitud es invalida.");
  }

  return {
    userId,
    pet: {
      name,
      sex,
      species,
      breed,
      imageUrl,
      imageCapture:
        imageCapture.length > 0
          ? imageCapture
          : imageUrl
            ? [{ id: "legacy", fileName: "legacy-image", fileUrl: imageUrl }]
            : [],
      description,
      locationText,
      neighborhood,
      latitude,
      longitude,
      lastSeen,
      reportDate,
    },
    owner: {
      fullName,
      phone,
      email,
    },
  };
}
