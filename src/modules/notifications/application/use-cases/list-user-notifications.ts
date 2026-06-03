import { NotificationsRepository } from "@/modules/notifications/application/ports/notifications-repository";
import { Notification } from "@/modules/notifications/domain/notification";

export async function listUserNotifications(
  repository: NotificationsRepository,
  userId: number,
): Promise<Notification[]> {
  return repository.listForUser(userId);
}
