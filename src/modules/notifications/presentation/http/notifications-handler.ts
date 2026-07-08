import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/request-user";
import { countUnreadNotifications } from "@/modules/notifications/application/use-cases/count-unread-notifications";
import { listUserNotifications } from "@/modules/notifications/application/use-cases/list-user-notifications";
import { PrismaNotificationsRepository } from "@/modules/notifications/infrastructure/prisma-notifications-repository";

const repository = new PrismaNotificationsRepository();

export async function handleGetNotifications(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ message: "No autenticado." }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      listUserNotifications(repository, userId),
      countUnreadNotifications(repository, userId),
    ]);

    return NextResponse.json({ notifications, unreadCount }, { status: 200 });
  } catch (error) {
    console.error("GET /api/notifications failed", error);
    return NextResponse.json(
      { message: "No se pudieron cargar las notificaciones." },
      { status: 500 },
    );
  }
}

export async function handlePatchNotificationRead(
  notificationIdParam: string,
  request: Request,
) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ message: "No autenticado." }, { status: 401 });
    }

    const notificationId = Number(notificationIdParam);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return NextResponse.json({ message: "Notificación inválida." }, { status: 400 });
    }

    await repository.markAsRead(notificationId, userId);

    const unreadCount = await countUnreadNotifications(repository, userId);

    return NextResponse.json({ ok: true, unreadCount }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/notifications/[id]/read failed", error);
    return NextResponse.json(
      { message: "No se pudo marcar la notificación." },
      { status: 500 },
    );
  }
}

export async function handlePostNotificationsReadAll(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ message: "No autenticado." }, { status: 401 });
    }

    await repository.markAllAsRead(userId);

    return NextResponse.json({ ok: true, unreadCount: 0 }, { status: 200 });
  } catch (error) {
    console.error("POST /api/notifications/read-all failed", error);
    return NextResponse.json(
      { message: "No se pudieron marcar las notificaciones." },
      { status: 500 },
    );
  }
}
