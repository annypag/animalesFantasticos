import type { PetReportKind } from "@/modules/messaging/domain/messaging";

export type Notification = {
  id: number;
  userId: number;
  conversationId: number;
  senderUserId: number;
  petKind: PetReportKind;
  petId: number;
  petName: string;
  senderName: string;
  messagePreview: string;
  unreadCount: number;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertChatNotificationInput = {
  recipientUserId: number;
  conversationId: number;
  senderUserId: number;
  petKind: PetReportKind;
  petId: number;
  petName: string;
  senderName: string;
  messagePreview: string;
};
