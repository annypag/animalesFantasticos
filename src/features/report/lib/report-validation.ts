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
    errors.name = "Ingrese el nombre que figura en la chapita.";
  }

  if (form.breed.length === 0) {
    errors.breed = "Seleccione al menos una raza o Desconocido.";
  }

  if (!form.description.trim()) {
    errors.description = "La descripción es obligatoria.";
  }

  if (!form.imageUrl.trim() || form.imageCapture.length === 0) {
    errors.imageUrl = "Sube al menos una foto de la mascota.";
  }

  if (!form.neighborhood.trim()) {
    errors.neighborhood = "El barrio es obligatorio.";
  }

  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.eventDate.trim())) {
    errors.eventDate = "La fecha debe tener formato dd/mm/yyyy.";
  }

  if (!form.ownerName.trim()) {
    errors.ownerName =
      type === "found"
        ? "El nombre de quien encontró la mascota es obligatorio."
        : "Tu nombre es obligatorio.";
  }

  if (!form.ownerPhone.trim()) {
    errors.ownerPhone = "El teléfono de contacto es obligatorio.";
  } else if (!/^\d{10}$/.test(form.ownerPhone.trim())) {
    errors.ownerPhone = "Ingrese exactamente 10 dígitos numéricos.";
  }

  if (form.ownerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail.trim())) {
    errors.ownerEmail = "Formato invalido. Ejemplo: email@mail.com.";
  }

  if (!coordinates && !form.neighborhood.trim()) {
    errors.coordinates = "Marque una ubicación en el mapa o completa el barrio.";
  }

  return errors;
}
