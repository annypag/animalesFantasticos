import { MessagingRepository } from "@/modules/messaging/application/ports/messaging-repository";
import { ChatMessage } from "@/modules/messaging/domain/messaging";

export async function listMessages(
  repository: MessagingRepository,
  conversationId: number,
): Promise<ChatMessage[]> {
  return repository.listMessages(conversationId);
}
