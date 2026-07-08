import { resolvePetReportMeta } from "@/modules/notifications/infrastructure/pet-report-meta-resolver";
import type { PetReportKind } from "@/modules/messaging/domain/messaging";

export type PetReportOwner = {
  userId: number;
  petName: string;
};

export async function resolvePetReportOwner(
  petKind: PetReportKind,
  petId: number,
): Promise<PetReportOwner | null> {
  const meta = await resolvePetReportMeta(petKind, petId);

  if (!meta) {
    return null;
  }

  return { userId: meta.userId, petName: meta.petName };
}
