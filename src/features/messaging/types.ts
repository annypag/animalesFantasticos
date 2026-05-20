import type { PetReportKind } from "@/modules/messaging/domain/messaging";

export type { PetReportKind };

export type ApiConversation = {
  id: number;
  petKind: PetReportKind;
  petId: number;
  createdAt: string;
};

export type ApiChatMessage = {
  id: number;
  conversationId: number;
  senderName: string;
  body: string | null;
  imageUrl: string | null;
  createdAt: string;
};
