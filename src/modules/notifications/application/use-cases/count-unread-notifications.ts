import { NotificationsRepository } from "@/modules/notifications/application/ports/notifications-repository";

export async function countUnreadNotifications(
  repository: NotificationsRepository,
  userId: number,
): Promise<number> {
  return repository.countUnreadForUser(userId);
}
