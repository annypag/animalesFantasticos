"use client";

import { useState, useCallback } from "react";
import type { VectorMatch } from "@/modules/matching/infrastructure/vector-search-repository";

export type WidgetState =
  | "closed"
  | "species-select"
  | "idle"
  | "loading"
  | "results"
  | "no-results"
  | "error";

interface UseVisualSearchReturn {
  widgetState: WidgetState;
  species: string | null;
  selectedFile: File | null;
  previewUrl: string | null;
  matches: VectorMatch[];
  errorMessage: string | null;
  handleOpen: () => void;
  handleClose: () => void;
  handleSpeciesSelect: (s: string) => void;
  handleImageSelect: (file: File) => void;
  handleSearch: () => Promise<void>;
  reset: () => void;
}

export function useVisualSearch(): UseVisualSearchReturn {
  const [widgetState, setWidgetState] = useState<WidgetState>("closed");
  const [species, setSpecies] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [matches, setMatches] = useState<VectorMatch[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpen = useCallback(() => {
    setWidgetState("species-select");
  }, []);

  const handleClose = useCallback(() => {
    setWidgetState("closed");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSpecies(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setMatches([]);
    setErrorMessage(null);
  }, [previewUrl]);

  const handleSpeciesSelect = useCallback((s: string) => {
    setSpecies(s);
    setWidgetState("idle");
  }, []);

  const handleImageSelect = useCallback(
    (file: File) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
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
      if (species) formData.append("species", species);

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
  }, [selectedFile, species]);

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setMatches([]);
    setErrorMessage(null);
    setSpecies(null);
    setWidgetState("species-select");
  }, [previewUrl]);

  return {
    widgetState,
    species,
    selectedFile,
    previewUrl,
    matches,
    errorMessage,
    handleOpen,
    handleClose,
    handleSpeciesSelect,
    handleImageSelect,
    handleSearch,
    reset,
  };
}
