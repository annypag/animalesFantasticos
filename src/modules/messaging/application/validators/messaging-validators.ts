import { ValidationError } from "@/modules/shared/application/errors/validation-error";
import {
  GetOrCreateConversationInput,
  PetReportKind,
  SendMessageInput,
} from "@/modules/messaging/domain/messaging";
import { asTrimmedString } from "@/modules/shared/application/validation/payload-parsers";

function parsePetKind(value: unknown): PetReportKind | null {
  const text = asTrimmedString(value).toUpperCase();
  if (text === "FOUND" || text === "LOST") {
    return text;
  }
  return null;
}

function parsePositiveInt(value: unknown): number | null {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(numeric) || numeric <= 0) {
    return null;
  }

  return numeric;
}

export function validateGetOrCreateConversationPayload(
  body: unknown,
): GetOrCreateConversationInput {
  const data = body as { petKind?: unknown; petId?: unknown } | null;
  const petKind = parsePetKind(data?.petKind);
  const petId = parsePositiveInt(data?.petId);

  if (!petKind || petId === null) {
    throw new ValidationError("petKind y petId son obligatorios.");
  }

  return { petKind, petId };
}

export function validateSendMessagePayload(
  body: unknown,
  conversationId: number,
): SendMessageInput {
  const data = body as { body?: unknown; imageUrl?: unknown } | null;
  const textBody = asTrimmedString(data?.body);
  const imageUrl = asTrimmedString(data?.imageUrl);

  if (!textBody && !imageUrl) {
    throw new ValidationError("El mensaje debe tener texto o una imagen.");
  }

  if (textBody.length > 2000) {
    throw new ValidationError("El mensaje no puede superar 2000 caracteres.");
  }

  return {
    conversationId,
    body: textBody || null,
    imageUrl: imageUrl || null,
  };
}

export function validateConversationIdParam(value: string): number {
  const conversationId = parsePositiveInt(value);

  if (conversationId === null) {
    throw new ValidationError("conversationId inválido.");
  }

  return conversationId;
}
