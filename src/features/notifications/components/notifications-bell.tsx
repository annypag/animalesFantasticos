"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { formatAbsoluteDateTime } from "@/features/home/lib/pet-utils";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { notificationToPetUiId } from "@/features/notifications/lib/pet-ui-id";

type NotificationsBellProps = {
  enabled: boolean;
};

export function NotificationsBell({ enabled }: NotificationsBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications(enabled);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!enabled) {
    return null;
  }

  async function handleNotificationClick(notificationId: number) {
    await markRead(notificationId);
    setOpen(false);

    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification) {
      return;
    }

    const petUiId = notificationToPetUiId(notification);
    const peerName = encodeURIComponent(notification.senderName);
    router.push(
      `/?openPet=${encodeURIComponent(petUiId)}&openChat=${notification.conversationId}&peerName=${peerName}`,
    );
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[3000] mt-2 w-[min(320px,90vw)] overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notificaciones</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs font-medium text-primary hover:underline"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No tenés notificaciones nuevas.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void handleNotificationClick(notification.id)}
                  className={`w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                    !notification.readAt ? "bg-primary/5" : ""
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">
                    {notification.senderName} · {notification.petName}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {notification.unreadCount > 1
                      ? `${notification.unreadCount} mensajes nuevos · ${notification.messagePreview}`
                      : notification.messagePreview}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatAbsoluteDateTime(notification.updatedAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
