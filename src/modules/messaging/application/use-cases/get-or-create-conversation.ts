import { MessagingRepository } from "@/modules/messaging/application/ports/messaging-repository";
import {
  Conversation,
  GetOrCreateConversationInput,
} from "@/modules/messaging/domain/messaging";

export async function getOrCreateConversation(
  repository: MessagingRepository,
  input: GetOrCreateConversationInput,
): Promise<Conversation> {
  return repository.getOrCreateConversation(input);
}
