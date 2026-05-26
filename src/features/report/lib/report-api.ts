import { resolvePetNameForReport } from "@/features/report/lib/pet-name";
import { ReportType, ReportPetFormState } from "../types/types";

type CreateReportParams = {
  type: ReportType;
  form: ReportPetFormState;
  coordinates: [number, number] | null;
};

export async function createPetReport({
  type,
  form,
  coordinates,
}: CreateReportParams) {
  const [latitude, longitude] = coordinates ?? [0, 0];
  const petName = resolvePetNameForReport(form);

  const endpoint = type === "found" ? "/api/found-pets" : "/api/lost-pets";
  const breedLabel = form.breed.join(", ");

  const body =
    type === "found"
      ? {
          pet: {
            name: petName,
            species: form.species,
            sex: form.sex,
            breed: breedLabel,
            imageUrl: form.imageUrl,
            imageCapture: form.imageCapture,
            description: form.description,
            locationText: form.locationText,
            neighborhood: form.neighborhood,
            latitude,
            longitude,
            reportDate: form.eventDate,
          },
          finder: {
            fullName: form.ownerName,
            phone: form.ownerPhone,
            email: form.ownerEmail,
          },
          reporter: {
            isRegistered: form.reporterIsRegistered,
            emailVerified: form.reporterEmailVerified,
          },
        }
      : {
          pet: {
            name: petName,
            species: form.species,
            sex: form.sex,
            breed: breedLabel,
            imageUrl: form.imageUrl,
            imageCapture: form.imageCapture,
            description: form.description,
            lastSeen: form.eventDate,
            locationText: form.locationText,
            neighborhood: form.neighborhood,
            latitude,
            longitude,
            reportDate: form.eventDate,
          },
          owner: {
            fullName: form.ownerName,
            phone: form.ownerPhone,
            email: form.ownerEmail,
          },
          reporter: {
            isRegistered: form.reporterIsRegistered,
            emailVerified: form.reporterEmailVerified,
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
