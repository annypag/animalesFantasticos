import {
  Notification,
  UpsertChatNotificationInput,
} from "@/modules/notifications/domain/notification";

export interface NotificationsRepository {
  upsertChatNotification(input: UpsertChatNotificationInput): Promise<Notification>;
  listForUser(userId: number): Promise<Notification[]>;
  countUnreadForUser(userId: number): Promise<number>;
  markAsRead(notificationId: number, userId: number): Promise<void>;
  markAllAsRead(userId: number): Promise<void>;
}
