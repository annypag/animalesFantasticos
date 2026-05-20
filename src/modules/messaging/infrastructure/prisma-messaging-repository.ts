import { prisma } from "@/lib/prisma";
import { MessagingRepository } from "@/modules/messaging/application/ports/messaging-repository";
import {
  ChatMessage,
  Conversation,
  GetOrCreateConversationInput,
  PetReportKind,
  SendMessageInput,
} from "@/modules/messaging/domain/messaging";

function mapConversation(record: {
  id: bigint;
  petKind: PetReportKind;
  petId: bigint;
  createdAt: Date;
}): Conversation {
  return {
    id: Number(record.id),
    petKind: record.petKind,
    petId: Number(record.petId),
    createdAt: record.createdAt.toISOString(),
  };
}

function mapMessage(record: {
  id: bigint;
  conversationId: bigint;
  senderName: string;
  body: string | null;
  imageUrl: string | null;
  createdAt: Date;
}): ChatMessage {
  return {
    id: Number(record.id),
    conversationId: Number(record.conversationId),
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
    const conversation = await prisma.conversation.upsert({
      where: {
        petKind_petId: {
          petKind: input.petKind,
          petId: BigInt(input.petId),
        },
      },
      create: {
        petKind: input.petKind,
        petId: BigInt(input.petId),
      },
      update: {},
    });

    return mapConversation(conversation);
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
        body: input.body,
        imageUrl: input.imageUrl,
      },
    });

    return mapMessage(message);
  }
}
