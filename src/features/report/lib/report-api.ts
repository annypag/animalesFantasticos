import { ReportType, ReportPetFormState } from "../types/types";


type CreateReportParams = {
  type: ReportType;
  form: ReportPetFormState;
  coordinates: [number, number];
};

export async function createPetReport({
  type,
  form,
  coordinates,
}: CreateReportParams) {
  const [latitude, longitude] = coordinates;

  const endpoint = type === "found" ? "/api/found-pets" : "/api/lost-pets";

  const body =
    type === "found"
      ? {
          pet: {
            name: form.name,
            species: form.species,
            breed: form.breed,
            imageUrl: form.imageUrl,
            description: form.description,
            locationText: form.locationText,
            latitude,
            longitude,
          },
          finder: {
            fullName: form.ownerName,
            phone: form.ownerPhone,
            email: form.ownerEmail,
          },
        }
      : {
          pet: {
            name: form.name,
            species: form.species,
            breed: form.breed,
            imageUrl: form.imageUrl,
            description: form.description,
            lastSeen: form.lastSeen,
            locationText: form.locationText,
            latitude,
            longitude,
          },
          owner: {
            fullName: form.ownerName,
            phone: form.ownerPhone,
            email: form.ownerEmail,
          },
        };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message ?? "No se pudo guardar el reporte.");
  }

  return payload;
}