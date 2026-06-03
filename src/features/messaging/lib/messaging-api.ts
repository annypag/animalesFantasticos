import type {
  ApiChatMessage,
  ApiConversation,
  PetReportKind,
} from "@/features/messaging/types";

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message ?? "Ocurrió un error inesperado.";
  } catch {
    return "Ocurrió un error inesperado.";
  }
}

export async function getOrCreateConversation(params: {
  petKind: PetReportKind;
  petId: number;
}): Promise<ApiConversation> {
  const response = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as { conversation: ApiConversation };
  return payload.conversation;
}

export async function fetchMessages(conversationId: number): Promise<{
  messages: ApiChatMessage[];
  conversation: ApiConversation;
}> {
  const response = await fetch(`/api/conversations/${conversationId}/messages`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as {
    messages: ApiChatMessage[];
    conversation: ApiConversation;
  };

  return {
    messages: payload.messages,
    conversation: payload.conversation,
  };
}

export async function sendChatMessage(params: {
  conversationId: number;
  senderName: string;
  body: string | null;
  imageUrl: string | null;
}): Promise<ApiChatMessage> {
  const response = await fetch(
    `/api/conversations/${params.conversationId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderName: params.senderName,
        body: params.body,
        imageUrl: params.imageUrl,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as { message: ApiChatMessage };
  return payload.message;
}

export async function uploadChatImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/messaging/uploads", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const payload = (await response.json()) as { imageUrl: string };
  return payload.imageUrl;
}
