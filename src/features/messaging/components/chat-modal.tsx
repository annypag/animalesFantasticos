"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Pet } from "@/features/home/types";
import { ChatComposer } from "@/features/messaging/components/chat-composer";
import { ChatMessageList } from "@/features/messaging/components/chat-message-list";
import { useChat } from "@/features/messaging/hooks/use-chat";
import { parsePetRefFromUiId } from "@/features/messaging/lib/parse-pet-ref";
import { CHAT_CLOSED_RESOLVED_MESSAGE } from "@/modules/messaging/domain/chat-availability";

type ChatModalProps = {
  open: boolean;
  onClose: () => void;
  pet: Pet | null;
  conversationId?: number | null;
  peerName?: string | null;
};

export function ChatModal({
  open,
  onClose,
  pet,
  conversationId = null,
  peerName = null,
}: ChatModalProps) {
  const { user, loading: authLoading } = useAuth();

  const petRef = useMemo(
    () => (pet ? parsePetRefFromUiId(pet.id) : null),
    [pet],
  );

  const senderName = user?.fullName?.trim() || null;
  const chatEnabled = !pet?.resolvedAt;
  const canOpenChat =
    chatEnabled &&
    (Boolean(petRef && senderName) || Boolean(conversationId && senderName));

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const {
    messages,
    loading,
    sendingText,
    uploadingImage,
    error,
    sendText,
    sendImage,
  } = useChat({
    open: open && canOpenChat,
    petRef: conversationId ? null : petRef,
    senderUserId: user?.id ?? null,
    senderName,
    conversationId,
  });

  if (!open || !pet) {
    return null;
  }

  const loginHref = `/login?redirect=${encodeURIComponent("/")}`;
  const subtitle = peerName
    ? `Conversación con ${peerName}`
    : senderName
      ? `Participás como ${senderName}`
      : "Mensajes e imágenes";

  return (
    <div
      className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="chat-modal-title"
        className="relative flex h-[min(640px,85vh)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-background shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div>
              <h3 id="chat-modal-title" className="text-sm font-bold text-foreground">
                Chat · {pet.name}
              </h3>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-accent"
            aria-label="Cerrar chat"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {!chatEnabled ? (
          <p className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
            {CHAT_CLOSED_RESOLVED_MESSAGE}
          </p>
        ) : authLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !senderName ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm">
            <p className="text-muted-foreground">Para chatear sobre una publicación debe iniciar sesión.</p>
            <Link
              href={loginHref}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : !canOpenChat && !conversationId ? (
          <p className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
            El chat solo está disponible en publicaciones guardadas en la base de
            datos.
          </p>
        ) : (
          <>
            {error && (
              <p className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
                {error}
              </p>
            )}

            {loading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ChatMessageList messages={messages} currentUserId={user?.id ?? null} />
            )}

            <ChatComposer
              disabled={loading || !chatEnabled}
              sendingText={sendingText}
              uploadingImage={uploadingImage}
              onSendText={sendText}
              onSendImage={sendImage}
            />
          </>
        )}
      </div>
    </div>
  );
}
