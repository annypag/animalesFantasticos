"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchMessages,
  getOrCreateConversation,
  sendChatMessage,
  uploadChatImage,
} from "@/features/messaging/lib/messaging-api";
import type { ApiChatMessage, ApiConversation } from "@/features/messaging/types";
import type { PetRef } from "@/features/messaging/lib/parse-pet-ref";

type UseChatParams = {
  open: boolean;
  petRef: PetRef | null;
};

export function useChat({ open, petRef }: UseChatParams) {
  const [conversation, setConversation] = useState<ApiConversation | null>(null);
  const [messages, setMessages] = useState<ApiChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadMessages = useCallback(async (conversationId: number) => {
    const nextMessages = await fetchMessages(conversationId);
    setMessages(nextMessages);
  }, []);

  useEffect(() => {
    if (!open || !petRef) {
      return;
    }

    const activePetRef = petRef;
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setError(null);

      try {
        const nextConversation = await getOrCreateConversation(activePetRef);
        if (cancelled) {
          return;
        }

        setConversation(nextConversation);
        await reloadMessages(nextConversation.id);
      } catch (bootstrapError) {
        if (!cancelled) {
          setError(
            bootstrapError instanceof Error
              ? bootstrapError.message
              : "No se pudo abrir el chat.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [open, petRef, reloadMessages]);

  const sendText = useCallback(
    async (body: string) => {
      if (!conversation) {
        return;
      }

      setSending(true);
      setError(null);

      try {
        await sendChatMessage({
          conversationId: conversation.id,
          body: body.trim(),
          imageUrl: null,
        });
        await reloadMessages(conversation.id);
      } catch (sendError) {
        setError(
          sendError instanceof Error
            ? sendError.message
            : "No se pudo enviar el mensaje.",
        );
      } finally {
        setSending(false);
      }
    },
    [conversation, reloadMessages],
  );

  const sendImage = useCallback(
    async (file: File) => {
      if (!conversation) {
        return;
      }

      setSending(true);
      setError(null);

      try {
        const imageUrl = await uploadChatImage(file);
        await sendChatMessage({
          conversationId: conversation.id,
          body: null,
          imageUrl,
        });
        await reloadMessages(conversation.id);
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "No se pudo enviar la imagen.",
        );
      } finally {
        setSending(false);
      }
    },
    [conversation, reloadMessages],
  );

  return {
    messages,
    loading,
    sending,
    error,
    sendText,
    sendImage,
  };
}
