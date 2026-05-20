import { MessagingRepository } from "@/modules/messaging/application/ports/messaging-repository";
import { ChatMessage, SendMessageInput } from "@/modules/messaging/domain/messaging";

export async function sendMessage(
  repository: MessagingRepository,
  input: SendMessageInput,
): Promise<ChatMessage> {
  return repository.sendMessage(input);
}
