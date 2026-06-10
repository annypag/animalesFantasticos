import { NotificationsRepository } from "@/modules/notifications/application/ports/notifications-repository";
import { resolvePetReportMeta } from "@/modules/notifications/infrastructure/pet-report-meta-resolver";
import { isChatOpenForReport } from "@/modules/messaging/domain/chat-availability";
import type { PetReportKind } from "@/modules/messaging/domain/messaging";

type NotifyChatParticipantOnMessageInput = {
  conversationId: number;
  participantUserId: number;
  petKind: PetReportKind;
  petId: number;
  senderUserId: number;
  senderName: string;
  body: string | null;
  imageUrl: string | null;
};

function buildMessagePreview(body: string | null, imageUrl: string | null): string {
  if (body?.trim()) {
    const trimmed = body.trim();
    return trimmed.length > 120 ? `${trimmed.slice(0, 120)}…` : trimmed;
  }

  if (imageUrl) {
    return "Envió una imagen";
  }

  return "Nuevo mensaje";
}

export async function notifyChatParticipantOnMessage(
  repository: NotificationsRepository,
  input: NotifyChatParticipantOnMessageInput,
): Promise<void> {
  const reportMeta = await resolvePetReportMeta(input.petKind, input.petId);

  if (!reportMeta || !isChatOpenForReport(reportMeta.resolvedAt)) {
    return;
  }

  let recipientUserId: number | null = null;

  if (input.senderUserId === reportMeta.userId) {
    recipientUserId = input.participantUserId;
  } else if (input.senderUserId === input.participantUserId) {
    recipientUserId = reportMeta.userId;
  }

  if (!recipientUserId || recipientUserId === input.senderUserId) {
    return;
  }

  await repository.upsertChatNotification({
    recipientUserId,
    conversationId: input.conversationId,
    senderUserId: input.senderUserId,
    petKind: input.petKind,
    petId: input.petId,
    petName: reportMeta.petName,
    senderName: input.senderName,
    messagePreview: buildMessagePreview(input.body, input.imageUrl),
  });
}
