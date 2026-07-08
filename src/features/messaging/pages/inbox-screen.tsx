"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, PawPrint, Lock, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { fetchMyConversations } from "@/features/messaging/lib/messaging-api";
import type { ApiInboxConversation } from "@/features/messaging/types";

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "ahora";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;
  if (diffHours < 24) return `hace ${diffHours} h`;
  if (diffDays === 1) return "ayer";
  if (diffDays < 7) return `hace ${diffDays} días`;

  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

function petUiId(conv: ApiInboxConversation): string {
  return conv.petKind === "FOUND" ? `db-${conv.petId}` : `db-lost-${conv.petId}`;
}

export function InboxScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ApiInboxConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    fetchMyConversations()
      .then(setConversations)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  function handleConversationClick(conv: ApiInboxConversation) {
    if (conv.resolvedAt) return;
    const uiId = petUiId(conv);
    router.push(
      `/mapa?openPet=${encodeURIComponent(uiId)}&openChat=${conv.id}&peerName=${encodeURIComponent(conv.peerName)}`,
    );
  }

  if (authLoading || (loading && !error)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6 lg:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Centro de mensajes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Todas tus conversaciones sobre mascotas encontradas y perdidas.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && conversations.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No tenés conversaciones todavía</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Cuando alguien te escriba sobre una mascota, o vos escribas a otro usuario, vas a ver los chats acá.
          </p>
          <button
            onClick={() => router.push("/mapa")}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <PawPrint className="h-4 w-4" />
            Ver mascotas en el mapa
          </button>
        </div>
      )}

      {conversations.length > 0 && (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {conversations.map((conv) => {
            const isResolved = Boolean(conv.resolvedAt);
            const lastActivityDate = conv.lastMessageAt ?? conv.createdAt;

            return (
              <button
                key={conv.id}
                type="button"
                disabled={isResolved}
                onClick={() => handleConversationClick(conv)}
                className={`flex w-full items-center gap-4 px-4 py-4 text-left transition-colors ${
                  isResolved
                    ? "cursor-default opacity-60"
                    : "hover:bg-muted/40 active:bg-muted/60"
                }`}
              >
                {/* Imagen de la mascota */}
                <div className="relative shrink-0">
                  {conv.petImageUrl ? (
                    <img
                      src={conv.petImageUrl}
                      alt={conv.petName}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                      <PawPrint className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  {isResolved && (
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted border border-border">
                      <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate font-semibold text-foreground">
                        {conv.petName}
                      </span>
                      {isResolved ? (
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Archivado
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Activo
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeDate(lastActivityDate)}
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Con <span className="font-medium">{conv.peerName}</span>
                  </p>

                  {conv.lastMessagePreview && (
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {conv.lastMessagePreview}
                    </p>
                  )}
                </div>

                {!isResolved && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
