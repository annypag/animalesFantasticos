import {
  ChatMessage,
  Conversation,
  GetOrCreateConversationInput,
  SendMessageInput,
} from "@/modules/messaging/domain/messaging";

export interface MessagingRepository {
  getOrCreateConversation(input: GetOrCreateConversationInput): Promise<Conversation>;
  listMessages(conversationId: number): Promise<ChatMessage[]>;
  sendMessage(input: SendMessageInput): Promise<ChatMessage>;
}
