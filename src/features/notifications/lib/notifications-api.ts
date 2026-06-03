export type ApiNotification = {
  id: number;
  conversationId: number;
  senderUserId: number;
  petKind: "FOUND" | "LOST";
  petId: number;
  petName: string;
  senderName: string;
  messagePreview: string;
  unreadCount: number;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchNotifications(): Promise<{
  notifications: ApiNotification[];
  unreadCount: number;
}> {
  const response = await fetch("/api/notifications", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("No se pudieron cargar las notificaciones.");
  }

  return (await response.json()) as {
    notifications: ApiNotification[];
    unreadCount: number;
  };
}

export async function markNotificationRead(
  notificationId: number,
): Promise<number> {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo marcar la notificación.");
  }

  const payload = (await response.json()) as { unreadCount: number };
  return payload.unreadCount;
}

export async function markAllNotificationsRead(): Promise<void> {
  const response = await fetch("/api/notifications/read-all", {
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron marcar las notificaciones.");
  }
}
