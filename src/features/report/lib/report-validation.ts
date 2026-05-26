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
    errors.name = "Ingresa el nombre que figura en la chapita.";
  }

  if (form.breed.length === 0) {
    errors.breed = "Selecciona al menos una raza o Desconocido.";
  }

  if (!form.description.trim()) {
    errors.description = "La descripcion es obligatoria.";
  }

  if (!form.imageUrl.trim() || form.imageCapture.length === 0) {
    errors.imageUrl = "Subi al menos una foto de la mascota.";
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
        ? "El nombre de quien encontro la mascota es obligatorio."
        : "Tu nombre es obligatorio.";
  }

  if (!form.ownerPhone.trim()) {
    errors.ownerPhone = "El telefono de contacto es obligatorio.";
  } else if (!/^15-\d{4}-\d{4}$/.test(form.ownerPhone.trim())) {
    errors.ownerPhone = "Formato invalido. Usa 15-0000-0000.";
  }

  if (form.ownerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail.trim())) {
    errors.ownerEmail = "Formato invalido. Ejemplo: email@mail.com.";
  }

  if (!coordinates && !form.neighborhood.trim()) {
    errors.coordinates = "Marca una ubicacion en el mapa o completa el barrio.";
  }

  return errors;
}
