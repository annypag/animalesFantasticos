"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { formatAbsoluteDateTime } from "@/features/home/lib/pet-utils";
import type { ApiChatMessage } from "@/features/messaging/types";

type ChatMessageListProps = {
  messages: ApiChatMessage[];
};

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground">
        Escribí un mensaje o enviá una foto para coordinar.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
      {messages.map((message) => (
        <article
          key={message.id}
          className="rounded-2xl border border-border bg-white px-3 py-2 text-sm shadow-sm"
        >
          <p className="mb-1 text-xs font-semibold text-muted-foreground">
            {message.senderName} · {formatAbsoluteDateTime(message.createdAt)}
          </p>

          {message.body && (
            <p className="whitespace-pre-wrap text-foreground">{message.body}</p>
          )}

          {message.imageUrl && (
            <a
              href={message.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`block overflow-hidden rounded-xl ${message.body ? "mt-2" : ""}`}
            >
              <Image
                src={message.imageUrl}
                alt="Imagen del chat"
                width={320}
                height={240}
                unoptimized
                className="max-h-48 w-full object-cover"
              />
            </a>
          )}
        </article>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
