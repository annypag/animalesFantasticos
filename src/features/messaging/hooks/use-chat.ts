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

const POLL_INTERVAL_MS = 5000;

type UseChatParams = {
  open: boolean;
  petRef: PetRef | null;
  senderUserId: number | null;
  senderName: string | null;
  conversationId?: number | null;
};

export function useChat({
  open,
  petRef,
  senderUserId,
  senderName,
  conversationId: initialConversationId = null,
}: UseChatParams) {
  const [conversation, setConversation] = useState<ApiConversation | null>(null);
  const [messages, setMessages] = useState<ApiChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingText, setSendingText] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadMessages = useCallback(async (activeConversationId: number) => {
    const data = await fetchMessages(activeConversationId);
    setMessages(data.messages);
    if (data.conversation) {
      setConversation(data.conversation);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setConversation(null);
      setMessages([]);
      setError(null);
      setLoading(false);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open || !senderUserId || !senderName) {
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setError(null);
      setMessages([]);

      try {
        let nextConversation: ApiConversation;

        if (initialConversationId) {
          const data = await fetchMessages(initialConversationId);
          if (cancelled) {
            return;
          }
          nextConversation = data.conversation;
          setMessages(data.messages);
        } else if (petRef) {
          nextConversation = await getOrCreateConversation(petRef);
          if (cancelled) {
            return;
          }
          await reloadMessages(nextConversation.id);
        } else {
          throw new Error("No se pudo abrir el chat.");
        }

        if (!cancelled) {
          setConversation(nextConversation);
        }
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
  }, [open, petRef, senderUserId, senderName, initialConversationId, reloadMessages]);

  useEffect(() => {
    if (!open || !conversation) {
      return;
    }

    const activeConversationId = conversation.id;
    const intervalId = window.setInterval(() => {
      void reloadMessages(activeConversationId).catch(() => undefined);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [conversation, open, reloadMessages]);

  const sendText = useCallback(
    async (body: string) => {
      if (!conversation || !senderName) {
        return;
      }

      setSendingText(true);
      setError(null);

      try {
        const message = await sendChatMessage({
          conversationId: conversation.id,
          senderName,
          body: body.trim(),
          imageUrl: null,
        });
        setMessages((current) => [...current, message]);
      } catch (sendError) {
        setError(
          sendError instanceof Error
            ? sendError.message
            : "No se pudo enviar el mensaje.",
        );
      } finally {
        setSendingText(false);
      }
    },
    [conversation, senderName],
  );

  const sendImage = useCallback(
    async (file: File) => {
      if (!conversation || !senderName) {
        return;
      }

      setUploadingImage(true);
      setError(null);

      try {
        const imageUrl = await uploadChatImage(file);
        const message = await sendChatMessage({
          conversationId: conversation.id,
          senderName,
          body: null,
          imageUrl,
        });
        setMessages((current) => [...current, message]);
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "No se pudo enviar la imagen.",
        );
      } finally {
        setUploadingImage(false);
      }
    },
    [conversation, senderName],
  );

  return {
    messages,
    loading,
    sending: sendingText || uploadingImage,
    sendingText,
    uploadingImage,
    error,
    sendText,
    sendImage,
  };
}
