import { prisma } from "@/lib/prisma";
import { NotificationsRepository } from "@/modules/notifications/application/ports/notifications-repository";
import {
  Notification,
  UpsertChatNotificationInput,
} from "@/modules/notifications/domain/notification";
import type { PetReportKind } from "@/modules/messaging/domain/messaging";

function mapNotification(record: {
  id: bigint;
  userId: bigint;
  conversationId: bigint;
  senderUserId: bigint;
  petKind: PetReportKind;
  petId: bigint;
  petName: string;
  senderName: string;
  messagePreview: string;
  unreadCount: number;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Notification {
  return {
    id: Number(record.id),
    userId: Number(record.userId),
    conversationId: Number(record.conversationId),
    senderUserId: Number(record.senderUserId),
    petKind: record.petKind,
    petId: Number(record.petId),
    petName: record.petName,
    senderName: record.senderName,
    messagePreview: record.messagePreview,
    unreadCount: record.unreadCount,
    readAt: record.readAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export class PrismaNotificationsRepository implements NotificationsRepository {
  async upsertChatNotification(
    input: UpsertChatNotificationInput,
  ): Promise<Notification> {
    const saved = await prisma.notification.upsert({
      where: {
        userId_conversationId: {
          userId: BigInt(input.recipientUserId),
          conversationId: BigInt(input.conversationId),
        },
      },
      create: {
        userId: BigInt(input.recipientUserId),
        conversationId: BigInt(input.conversationId),
        senderUserId: BigInt(input.senderUserId),
        petKind: input.petKind,
        petId: BigInt(input.petId),
        petName: input.petName,
        senderName: input.senderName,
        messagePreview: input.messagePreview,
        unreadCount: 1,
      },
      update: {
        senderUserId: BigInt(input.senderUserId),
        senderName: input.senderName,
        messagePreview: input.messagePreview,
        readAt: null,
        unreadCount: { increment: 1 },
      },
    });

    return mapNotification(saved);
  }

  async listForUser(userId: number): Promise<Notification[]> {
    const rows = await prisma.notification.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { updatedAt: "desc" },
      take: 30,
    });

    return rows.map(mapNotification);
  }

  async countUnreadForUser(userId: number): Promise<number> {
    const result = await prisma.notification.aggregate({
      where: { userId: BigInt(userId), readAt: null },
      _sum: { unreadCount: true },
    });

    return result._sum.unreadCount ?? 0;
  }

  async markAsRead(notificationId: number, userId: number): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        id: BigInt(notificationId),
        userId: BigInt(userId),
      },
      data: { readAt: new Date(), unreadCount: 0 },
    });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId: BigInt(userId), readAt: null },
      data: { readAt: new Date(), unreadCount: 0 },
    });
  }
}
