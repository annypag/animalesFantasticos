export type PetReportKind = "FOUND" | "LOST";

export type Conversation = {
  id: number;
  petKind: PetReportKind;
  petId: number;
  participantUserId: number;
  createdAt: string;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderUserId: number;
  senderName: string;
  body: string | null;
  imageUrl: string | null;
  createdAt: string;
};

export type GetOrCreateConversationInput = {
  petKind: PetReportKind;
  petId: number;
  participantUserId: number;
};

export type SendMessageInput = {
  conversationId: number;
  senderUserId: number;
  senderName: string;
  body: string | null;
  imageUrl: string | null;
};

export type InboxConversation = {
  id: number;
  petKind: PetReportKind;
  petId: number;
  petName: string;
  petImageUrl: string;
  peerName: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  resolvedAt: string | null;
  createdAt: string;
};
