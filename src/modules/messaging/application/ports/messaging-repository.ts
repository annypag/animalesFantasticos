import {
  ChatMessage,
  Conversation,
  GetOrCreateConversationInput,
  SendMessageInput,
} from "@/modules/messaging/domain/messaging";

export interface MessagingRepository {
  getOrCreateConversation(input: GetOrCreateConversationInput): Promise<Conversation>;
  getConversationById(conversationId: number): Promise<Conversation | null>;
  listMessages(conversationId: number): Promise<ChatMessage[]>;
  sendMessage(input: SendMessageInput): Promise<ChatMessage>;
}
