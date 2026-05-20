import { NextResponse } from "next/server";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";
import { getOrCreateConversation } from "@/modules/messaging/application/use-cases/get-or-create-conversation";
import { listMessages } from "@/modules/messaging/application/use-cases/list-messages";
import { sendMessage } from "@/modules/messaging/application/use-cases/send-message";
import {
  validateConversationIdParam,
  validateGetOrCreateConversationPayload,
  validateSendMessagePayload,
} from "@/modules/messaging/application/validators/messaging-validators";
import { PrismaMessagingRepository } from "@/modules/messaging/infrastructure/prisma-messaging-repository";
import { handlePostImageUpload } from "@/modules/shared/presentation/http/image-upload-handler";

const repository = new PrismaMessagingRepository();

export async function handlePostConversation(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const input = validateGetOrCreateConversationPayload(body);
    const conversation = await getOrCreateConversation(repository, input);

    return NextResponse.json({ conversation }, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error("POST /api/conversations failed", error);
    return NextResponse.json(
      { message: "No se pudo iniciar la conversación." },
      { status: 500 },
    );
  }
}

export async function handleGetMessages(conversationIdParam: string) {
  try {
    const conversationId = validateConversationIdParam(conversationIdParam);
    const messages = await listMessages(repository, conversationId);

    return NextResponse.json({ messages }, { status: 200 });
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
    const conversationId = validateConversationIdParam(conversationIdParam);
    const body = (await request.json()) as unknown;
    const input = validateSendMessagePayload(body, conversationId);
    const message = await sendMessage(repository, input);

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
