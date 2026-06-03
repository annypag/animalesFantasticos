import { NextResponse } from "next/server";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";
import { getOrCreateConversation } from "@/modules/messaging/application/use-cases/get-or-create-conversation";
import { listMessages } from "@/modules/messaging/application/use-cases/list-messages";
import { sendMessage } from "@/modules/messaging/application/use-cases/send-message";
import { userCanAccessConversation } from "@/modules/messaging/application/ensure-conversation-access";
import {
  validateConversationIdParam,
  validateGetOrCreateConversationPayload,
  validateSendMessagePayload,
  withSenderUserId,
} from "@/modules/messaging/application/validators/messaging-validators";
import { getUserIdFromRequest } from "@/lib/auth/request-user";
import {
  CHAT_CLOSED_RESOLVED_MESSAGE,
  isChatOpenForReport,
} from "@/modules/messaging/domain/chat-availability";
import { resolvePetReportMeta } from "@/modules/notifications/infrastructure/pet-report-meta-resolver";
import { PrismaMessagingRepository } from "@/modules/messaging/infrastructure/prisma-messaging-repository";
import { notifyChatParticipantOnMessage } from "@/modules/notifications/application/use-cases/notify-chat-participant-on-message";
import { PrismaNotificationsRepository } from "@/modules/notifications/infrastructure/prisma-notifications-repository";
import { handlePostImageUpload } from "@/modules/shared/presentation/http/image-upload-handler";

const repository = new PrismaMessagingRepository();
const notificationsRepository = new PrismaNotificationsRepository();

export async function handlePostConversation(request: Request) {
  try {
    const participantUserId = await getUserIdFromRequest(request);

    if (!participantUserId) {
      return NextResponse.json(
        { message: "Debés iniciar sesión para chatear." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as unknown;
    const input = validateGetOrCreateConversationPayload(body, participantUserId);
    const reportMeta = await resolvePetReportMeta(input.petKind, input.petId);

    if (!reportMeta) {
      return NextResponse.json({ message: "La publicación no existe." }, { status: 404 });
    }

    if (!isChatOpenForReport(reportMeta.resolvedAt)) {
      return NextResponse.json({ message: CHAT_CLOSED_RESOLVED_MESSAGE }, { status: 403 });
    }

    const conversation = await getOrCreateConversation(repository, input);

    return NextResponse.json({ conversation }, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    if (error instanceof Error && error.message) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("POST /api/conversations failed", error);
    return NextResponse.json(
      { message: "No se pudo iniciar la conversación." },
      { status: 500 },
    );
  }
}

export async function handleGetMessages(
  conversationIdParam: string,
  request: Request,
) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Debés iniciar sesión para ver el chat." },
        { status: 401 },
      );
    }

    const conversationId = validateConversationIdParam(conversationIdParam);
    const conversation = await repository.getConversationById(conversationId);

    if (!conversation) {
      return NextResponse.json({ message: "Conversación no encontrada." }, { status: 404 });
    }

    const canAccess = await userCanAccessConversation(userId, conversation);

    if (!canAccess) {
      return NextResponse.json({ message: "No tenés acceso a este chat." }, { status: 403 });
    }

    const messages = await listMessages(repository, conversationId);

    return NextResponse.json({ messages, conversation }, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error("GET /api/conversations/[id]/messages failed", error);
    return NextResponse.json(
      { message: "No se pudieron cargar los mensajes." },
      { status: 500 },
    );
  }
}

export async function handlePostMessage(
  conversationIdParam: string,
  request: Request,
) {
  try {
    const senderUserId = await getUserIdFromRequest(request);

    if (!senderUserId) {
      return NextResponse.json(
        { message: "Debés iniciar sesión para enviar mensajes." },
        { status: 401 },
      );
    }

    const conversationId = validateConversationIdParam(conversationIdParam);
    const conversation = await repository.getConversationById(conversationId);

    if (!conversation) {
      return NextResponse.json({ message: "Conversación no encontrada." }, { status: 404 });
    }

    const canAccess = await userCanAccessConversation(senderUserId, conversation);

    if (!canAccess) {
      return NextResponse.json({ message: "No tenés acceso a este chat." }, { status: 403 });
    }

    const reportMeta = await resolvePetReportMeta(conversation.petKind, conversation.petId);

    if (!reportMeta || !isChatOpenForReport(reportMeta.resolvedAt)) {
      return NextResponse.json({ message: CHAT_CLOSED_RESOLVED_MESSAGE }, { status: 403 });
    }

    const body = (await request.json()) as unknown;
    const input = withSenderUserId(
      validateSendMessagePayload(body, conversationId),
      senderUserId,
    );
    const message = await sendMessage(repository, input);

    if (conversation) {
      await notifyChatParticipantOnMessage(notificationsRepository, {
        conversationId,
        participantUserId: conversation.participantUserId,
        petKind: conversation.petKind,
        petId: conversation.petId,
        senderUserId,
        senderName: input.senderName,
        body: input.body,
        imageUrl: input.imageUrl,
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error("POST /api/conversations/[id]/messages failed", error);
    return NextResponse.json(
      { message: "No se pudo enviar el mensaje." },
      { status: 500 },
    );
  }
}

export async function handlePostChatImageUpload(request: Request) {
  return handlePostImageUpload(request, "chat");
}
