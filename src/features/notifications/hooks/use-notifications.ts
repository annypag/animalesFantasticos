"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ApiNotification,
} from "@/features/notifications/lib/notifications-api";

const POLL_INTERVAL_MS = 15000;

export function useNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!enabled) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Sin sesión o error temporal: no romper la navbar
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void reload();
    const intervalId = window.setInterval(() => {
      void reload();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [enabled, reload]);

  const markRead = useCallback(async (notificationId: number) => {
    const nextUnread = await markNotificationRead(notificationId);
    setUnreadCount(nextUnread);
    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId
          ? { ...item, readAt: new Date().toISOString(), unreadCount: 0 }
          : item,
      ),
    );
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setUnreadCount(0);
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        readAt: item.readAt ?? new Date().toISOString(),
        unreadCount: 0,
      })),
    );
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    reload,
    markRead,
    markAllRead,
  };
}
