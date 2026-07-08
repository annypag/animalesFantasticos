import type { ReportPetFormState } from "@/features/report/types/types";

export const PET_NAME_UNKNOWN = "Sin nombre conocido";

export function resolvePetNameForReport(form: ReportPetFormState): string {
  if (form.nameSituation === "unknown") {
    return PET_NAME_UNKNOWN;
  }

  return form.name.trim();
}
