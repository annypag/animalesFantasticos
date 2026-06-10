import type { Conversation } from "@/modules/messaging/domain/messaging";
import { resolvePetReportOwner } from "@/modules/notifications/infrastructure/pet-report-owner-resolver";

export async function userCanAccessConversation(
  userId: number,
  conversation: Conversation,
): Promise<boolean> {
  if (conversation.participantUserId === userId) {
    return true;
  }

  const owner = await resolvePetReportOwner(conversation.petKind, conversation.petId);
  return owner?.userId === userId;
}
