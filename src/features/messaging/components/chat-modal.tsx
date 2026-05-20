"use client";

import { useMemo } from "react";
import { Loader2, MessageCircle, X } from "lucide-react";
import { Pet } from "@/features/home/types";
import { ChatComposer } from "@/features/messaging/components/chat-composer";
import { ChatMessageList } from "@/features/messaging/components/chat-message-list";
import { useChat } from "@/features/messaging/hooks/use-chat";
import { parsePetRefFromUiId } from "@/features/messaging/lib/parse-pet-ref";

type ChatModalProps = {
  open: boolean;
  onClose: () => void;
  pet: Pet | null;
};

export function ChatModal({ open, onClose, pet }: ChatModalProps) {
  const petRef = useMemo(
    () => (pet ? parsePetRefFromUiId(pet.id) : null),
    [pet],
  );

  const { messages, loading, sending, error, sendText, sendImage } = useChat({
    open,
    petRef,
  });

  if (!open || !pet) {
    return null;
  }

  const chatUnavailable = !petRef || !pet.id.startsWith("db");

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex h-[min(640px,85vh)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-background shadow-2xl">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Chat · {pet.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                Mensajes e imágenes
              </p>
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

        {chatUnavailable ? (
          <p className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
            El chat solo funciona en reportes guardados en la base de datos.
            Creá uno nuevo con el formulario de reporte.
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
              <ChatMessageList messages={messages} />
            )}

            <ChatComposer
              disabled={loading || chatUnavailable}
              sending={sending}
              onSendText={sendText}
              onSendImage={sendImage}
            />
          </>
        )}
      </div>
    </div>
  );
}
