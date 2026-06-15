import type { ApiNotification } from "@/features/notifications/lib/notifications-api";

export function notificationToPetUiId(notification: ApiNotification): string {
  return notification.petKind === "LOST"
    ? `db-lost-${notification.petId}`
    : `db-${notification.petId}`;
}
