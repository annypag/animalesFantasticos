import type {
  ReportPetErrors,
  ReportPetFormState,
  ReportType,
} from "../types/types";

type ValidateParams = {
  type: ReportType;
  form: ReportPetFormState;
  coordinates: [number, number] | null;
};

export function validatePetReport({
  type,
  form,
  coordinates,
}: ValidateParams): ReportPetErrors {
  const errors: ReportPetErrors = {};

  if (form.nameSituation === "tag" && !form.name.trim()) {
    errors.name = "Ingresá el nombre que figura en la chapita.";
  }

  if (!form.breed.trim()) {
    errors.breed = "La raza es obligatoria. Podés poner Mestizo.";
  }

  if (!form.description.trim()) {
    errors.description = "La descripción es obligatoria.";
  }

  if (!form.imageUrl.trim()) {
    errors.imageUrl = "Subí una foto de la mascota.";
  }

  if (!form.ownerName.trim()) {
    errors.ownerName =
      type === "found"
        ? "El nombre de quien encontró la mascota es obligatorio."
        : "Tu nombre es obligatorio.";
  }

  if (!form.ownerPhone.trim()) {
    errors.ownerPhone = "El teléfono de contacto es obligatorio.";
  }

  if (!coordinates) {
    errors.coordinates = "Marcá una ubicación en el mapa.";
  }

  if (type === "lost" && !form.lastSeen.trim()) {
    errors.lastSeen = "Indicá cuándo fue vista por última vez.";
  }

  return errors;
}