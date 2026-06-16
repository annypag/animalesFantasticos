import type { PetReportKind } from "@/features/messaging/types";

export type PetRef = {
  petKind: PetReportKind;
  petId: number;
};

/** Solo reportes persistidos en PostgreSQL (ids db-* / db-lost-*). */
export function isSavedPetReport(uiPetId: string): boolean {
  return uiPetId.startsWith("db-") || uiPetId.startsWith("db-lost-");
}

export function parsePetRefFromUiId(uiPetId: string): PetRef | null {
  if (uiPetId.startsWith("db-lost-")) {
    const petId = Number(uiPetId.replace("db-lost-", ""));
    return Number.isInteger(petId) && petId > 0
      ? { petKind: "LOST", petId }
      : null;
  }

  if (uiPetId.startsWith("db-")) {
    const petId = Number(uiPetId.replace("db-", ""));
    return Number.isInteger(petId) && petId > 0
      ? { petKind: "FOUND", petId }
      : null;
  }

  return null;
}
