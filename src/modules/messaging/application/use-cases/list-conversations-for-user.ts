import { InboxConversation } from "@/modules/messaging/domain/messaging";
import { MessagingRepository } from "@/modules/messaging/application/ports/messaging-repository";

export async function listConversationsForUser(
  repository: MessagingRepository,
  userId: number,
): Promise<InboxConversation[]> {
  return repository.listConversationsForUser(userId);
}
