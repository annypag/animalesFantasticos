import { prisma } from "@/lib/prisma";
import { MessagingRepository } from "@/modules/messaging/application/ports/messaging-repository";
import {
  ChatMessage,
  Conversation,
  GetOrCreateConversationInput,
  InboxConversation,
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

  async listConversationsForUser(userId: number): Promise<InboxConversation[]> {
    // Q1+Q2: Pets owned by this user (for filtering + data in "owner" role)
    const [myFoundPets, myLostPets] = await Promise.all([
      prisma.foundPet.findMany({
        where: { userId: BigInt(userId) },
        select: { id: true, name: true, imageUrl: true, resolvedAt: true },
      }),
      prisma.lostPet.findMany({
        where: { userId: BigInt(userId) },
        select: { id: true, name: true, imageUrl: true, resolvedAt: true },
      }),
    ]);

    const myFoundPetMap = new Map(myFoundPets.map((p) => [String(p.id), p]));
    const myLostPetMap = new Map(myLostPets.map((p) => [String(p.id), p]));

    // Q3: All conversations where user is participant OR owns the pet
    const orConditions = [
      { participantUserId: BigInt(userId) },
      ...(myFoundPets.length > 0
        ? [{ petKind: "FOUND" as const, petId: { in: myFoundPets.map((p) => p.id) } }]
        : []),
      ...(myLostPets.length > 0
        ? [{ petKind: "LOST" as const, petId: { in: myLostPets.map((p) => p.id) } }]
        : []),
    ];

    const conversations = await prisma.conversation.findMany({
      where: { OR: orConditions },
      include: {
        participantUser: { select: { fullName: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    // Q4+Q5: For conversations where user is participant (not owner), fetch the pet data + owner name
    const participantConvos = conversations.filter(
      (c) => Number(c.participantUserId) === userId,
    );
    const extraFoundIds = participantConvos
      .filter((c) => c.petKind === "FOUND" && !myFoundPetMap.has(String(c.petId)))
      .map((c) => c.petId);
    const extraLostIds = participantConvos
      .filter((c) => c.petKind === "LOST" && !myLostPetMap.has(String(c.petId)))
      .map((c) => c.petId);

    const [extraFoundPets, extraLostPets] = await Promise.all([
      extraFoundIds.length > 0
        ? prisma.foundPet.findMany({
            where: { id: { in: extraFoundIds } },
            select: { id: true, name: true, imageUrl: true, resolvedAt: true, user: { select: { fullName: true } } },
          })
        : [],
      extraLostIds.length > 0
        ? prisma.lostPet.findMany({
            where: { id: { in: extraLostIds } },
            select: { id: true, name: true, imageUrl: true, resolvedAt: true, user: { select: { fullName: true } } },
          })
        : [],
    ]);

    type PetData = { name: string; imageUrl: string; resolvedAt: Date | null; user?: { fullName: string } };
    const extraFoundMap = new Map<string, PetData>(
      (extraFoundPets as (typeof extraFoundPets[0] & { user: { fullName: string } })[]).map((p) => [String(p.id), p]),
    );
    const extraLostMap = new Map<string, PetData>(
      (extraLostPets as (typeof extraLostPets[0] & { user: { fullName: string } })[]).map((p) => [String(p.id), p]),
    );

    // Assemble
    const result: InboxConversation[] = conversations.map((conv) => {
      const petIdStr = String(conv.petId);
      const isParticipant = Number(conv.participantUserId) === userId;

      let petData: PetData | undefined;
      let peerName: string;

      if (isParticipant) {
        petData = conv.petKind === "FOUND"
          ? (extraFoundMap.get(petIdStr) ?? myFoundPetMap.get(petIdStr))
          : (extraLostMap.get(petIdStr) ?? myLostPetMap.get(petIdStr));
        peerName = petData?.user?.fullName ?? "Usuario";
      } else {
        petData = conv.petKind === "FOUND"
          ? myFoundPetMap.get(petIdStr)
          : myLostPetMap.get(petIdStr);
        peerName = conv.participantUser.fullName;
      }

      const lastMessage = conv.messages[0] ?? null;

      return {
        id: Number(conv.id),
        petKind: conv.petKind,
        petId: Number(conv.petId),
        petName: petData?.name ?? "Mascota",
        petImageUrl: petData?.imageUrl ?? "",
        peerName,
        lastMessageAt: lastMessage?.createdAt.toISOString() ?? null,
        lastMessagePreview: lastMessage?.body ?? (lastMessage?.imageUrl ? "[imagen]" : null),
        resolvedAt: petData?.resolvedAt?.toISOString() ?? null,
        createdAt: conv.createdAt.toISOString(),
      };
    });

    result.sort((a, b) => {
      const dateA = a.lastMessageAt ?? a.createdAt;
      const dateB = b.lastMessageAt ?? b.createdAt;
      return dateB.localeCompare(dateA);
    });

    return result;
  }
}
