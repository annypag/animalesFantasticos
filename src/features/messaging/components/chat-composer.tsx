"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Send } from "lucide-react";

type ChatComposerProps = {
  disabled?: boolean;
  sendingText?: boolean;
  uploadingImage?: boolean;
  onSendText: (body: string) => Promise<void>;
  onSendImage: (file: File) => Promise<void>;
};

export function ChatComposer({
  disabled = false,
  sendingText = false,
  uploadingImage = false,
  onSendText,
  onSendImage,
}: ChatComposerProps) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const busy = disabled || sendingText || uploadingImage;

  async function submitText() {
    const trimmed = text.trim();
    if (!trimmed || busy) {
      return;
    }

    await onSendText(trimmed);
    setText("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await submitText();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitText();
    }
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || busy) {
      return;
    }

    await onSendImage(file);
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="border-t border-border bg-white p-3"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => void handleImageChange(event)}
      />

      <div className="flex items-end gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent disabled:opacity-50"
          aria-label="Adjuntar imagen"
        >
          {uploadingImage ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
        </button>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribí un mensaje... (Enter para enviar)"
          rows={1}
          disabled={busy}
          className="max-h-24 min-h-11 flex-1 resize-none rounded-2xl border border-border px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
          aria-label="Enviar mensaje"
        >
          {sendingText ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
}
