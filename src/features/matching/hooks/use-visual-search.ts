"use client";

import { useState, useCallback } from "react";
import type { VectorMatch } from "@/modules/matching/infrastructure/vector-search-repository";

export type WidgetState =
  | "closed"
  | "idle"
  | "uploading"
  | "loading"
  | "results"
  | "no-results"
  | "error";

interface UseVisualSearchReturn {
  widgetState: WidgetState;
  selectedFile: File | null;
  previewUrl: string | null;
  matches: VectorMatch[];
  errorMessage: string | null;
  handleOpen: () => void;
  handleClose: () => void;
  handleImageSelect: (file: File) => void;
  handleSearch: () => Promise<void>;
  reset: () => void;
}

export function useVisualSearch(): UseVisualSearchReturn {
  const [widgetState, setWidgetState] = useState<WidgetState>("closed");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [matches, setMatches] = useState<VectorMatch[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpen = useCallback(() => {
    setWidgetState("idle");
  }, []);

  const handleClose = useCallback(() => {
    setWidgetState("closed");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setMatches([]);
    setErrorMessage(null);
  }, [previewUrl]);

  const handleImageSelect = useCallback(
    (file: File) => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setWidgetState("idle");
      setMatches([]);
      setErrorMessage(null);
    },
    [previewUrl],
  );

  const handleSearch = useCallback(async () => {
    if (!selectedFile) return;

    setWidgetState("loading");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/matches/search", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        matches?: VectorMatch[];
        warning?: string;
        message?: string;
      };

      if (!response.ok) {
        setErrorMessage(data.message ?? "Error al buscar coincidencias.");
        setWidgetState("error");
        return;
      }

      const resultMatches = data.matches ?? [];
      setMatches(resultMatches);
      setWidgetState(resultMatches.length > 0 ? "results" : "no-results");
    } catch {
      setErrorMessage("No se pudo conectar con el servidor.");
      setWidgetState("error");
    }
  }, [selectedFile]);

  const reset = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setMatches([]);
    setErrorMessage(null);
    setWidgetState("idle");
  }, [previewUrl]);

  return {
    widgetState,
    selectedFile,
    previewUrl,
    matches,
    errorMessage,
    handleOpen,
    handleClose,
    handleImageSelect,
    handleSearch,
    reset,
  };
}
