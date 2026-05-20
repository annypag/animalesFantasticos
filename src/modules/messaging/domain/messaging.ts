export type PetReportKind = "FOUND" | "LOST";

export type Conversation = {
  id: number;
  petKind: PetReportKind;
  petId: number;
  createdAt: string;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderName: string;
  body: string | null;
  imageUrl: string | null;
  createdAt: string;
};

export type GetOrCreateConversationInput = {
  petKind: PetReportKind;
  petId: number;
};

export type SendMessageInput = {
  conversationId: number;
  body: string | null;
  imageUrl: string | null;
};
