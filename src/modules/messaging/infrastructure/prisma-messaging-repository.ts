import { prisma } from "@/lib/prisma";
import { MessagingRepository } from "@/modules/messaging/application/ports/messaging-repository";
import {
  ChatMessage,
  Conversation,
  GetOrCreateConversationInput,
  PetReportKind,
  SendMessageInput,
} from "@/modules/messaging/domain/messaging";
import { resolvePetReportOwner } from "@/modules/notifications/infrastructure/pet-report-owner-resolver";

function mapConversation(record: {
  id: bigint;
  petKind: PetReportKind;
  petId: bigint;
  participantUserId: bigint;
  createdAt: Date;
}): Conversation {
  return {
    id: Number(record.id),
    petKind: record.petKind,
    petId: Number(record.petId),
    participantUserId: Number(record.participantUserId),
    createdAt: record.createdAt.toISOString(),
  };
}

function mapMessage(record: {
  id: bigint;
  conversationId: bigint;
  senderUserId: bigint;
  senderName: string;
  body: string | null;
  imageUrl: string | null;
  createdAt: Date;
}): ChatMessage {
  return {
    id: Number(record.id),
    conversationId: Number(record.conversationId),
    senderUserId: Number(record.senderUserId),
    senderName: record.senderName,
    body: record.body,
    imageUrl: record.imageUrl,
    createdAt: record.createdAt.toISOString(),
  };
}

export class PrismaMessagingRepository implements MessagingRepository {
  async getOrCreateConversation(
    input: GetOrCreateConversationInput,
  ): Promise<Conversation> {
    const owner = await resolvePetReportOwner(input.petKind, input.petId);

    if (!owner) {
      throw new Error("La publicación no existe.");
    }

    if (owner.userId === input.participantUserId) {
      throw new Error("No podés abrir un chat con tu propia publicación.");
    }

    const conversation = await prisma.conversation.upsert({
      where: {
        petKind_petId_participantUserId: {
          petKind: input.petKind,
          petId: BigInt(input.petId),
          participantUserId: BigInt(input.participantUserId),
        },
      },
      create: {
        petKind: input.petKind,
        petId: BigInt(input.petId),
        participantUserId: BigInt(input.participantUserId),
      },
      update: {},
    });

    return mapConversation(conversation);
  }

  async getConversationById(conversationId: number): Promise<Conversation | null> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: BigInt(conversationId) },
    });

    return conversation ? mapConversation(conversation) : null;
  }

  async listMessages(conversationId: number): Promise<ChatMessage[]> {
    const messages = await prisma.message.findMany({
      where: { conversationId: BigInt(conversationId) },
      orderBy: { createdAt: "asc" },
    });

    return messages.map(mapMessage);
  }

  async sendMessage(input: SendMessageInput): Promise<ChatMessage> {
    const message = await prisma.message.create({
      data: {
        conversationId: BigInt(input.conversationId),
        senderUserId: BigInt(input.senderUserId),
        senderName: input.senderName,
        body: input.body,
        imageUrl: input.imageUrl,
      },
    });

    return mapMessage(message);
  }
}
