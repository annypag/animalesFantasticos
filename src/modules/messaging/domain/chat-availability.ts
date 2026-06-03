import type { PetReportKind } from "@/modules/messaging/domain/messaging";

export const CHAT_CLOSED_RESOLVED_MESSAGE =
  "Esta publicación está cerrada porque el caso ya se resolvió. El chat ya no está disponible.";

export function isChatOpenForReport(resolvedAt: Date | string | null | undefined): boolean {
  return !resolvedAt;
}
