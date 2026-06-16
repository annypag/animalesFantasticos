"use client";

import { useState, useCallback } from "react";
import type { VectorMatch } from "@/modules/matching/infrastructure/vector-search-repository";

async function resizeImage(file: File, maxPx: number): Promise<Blob> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 });
}

export type WidgetState =
  | "closed"
  | "species-select"
  | "idle"
  | "removing-bg"
  | "loading"
  | "results"
  | "no-results"
  | "error";

interface UseVisualSearchReturn {
  widgetState: WidgetState;
  species: string | null;
  petName: string;
  petDescription: string;
  selectedFile: File | null;
  previewUrl: string | null;
  matches: VectorMatch[];
  errorMessage: string | null;
  handleOpen: () => void;
  handleClose: () => void;
  handleSpeciesSelect: (s: string) => void;
  handleNameChange: (v: string) => void;
  handleDescriptionChange: (v: string) => void;
  handleImageSelect: (file: File) => void;
  handleSearch: () => Promise<void>;
  reset: () => void;
}

export function useVisualSearch(): UseVisualSearchReturn {
  const [widgetState, setWidgetState] = useState<WidgetState>("closed");
  const [species, setSpecies] = useState<string | null>(null);
  const [petName, setPetName] = useState("");
  const [petDescription, setPetDescription] = useState("");
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
    setPetName("");
    setPetDescription("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setMatches([]);
    setErrorMessage(null);
  }, [previewUrl]);

  const handleSpeciesSelect = useCallback((s: string) => {
    setSpecies(s);
    setWidgetState("idle");
  }, []);

  const handleNameChange = useCallback((v: string) => setPetName(v), []);
  const handleDescriptionChange = useCallback((v: string) => setPetDescription(v), []);

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

    setWidgetState("removing-bg");
    setErrorMessage(null);

    let fileToSend: File = selectedFile;
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const resized = await resizeImage(selectedFile, 512);
      const blob = await removeBackground(resized, { model: "isnet_quint8" });
      fileToSend = new File([blob], "image.png", { type: "image/png" });
    } catch (err) {
      console.warn("[BG removal] Falló, se usa imagen original:", (err as Error).message);
    }

    setWidgetState("loading");

    try {
      const formData = new FormData();
      formData.append("image", fileToSend);
      if (species) formData.append("species", species);
      if (petName.trim()) formData.append("petName", petName.trim());
      if (petDescription.trim()) formData.append("petDescription", petDescription.trim());

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
    setPetName("");
    setPetDescription("");
    setWidgetState("species-select");
  }, [previewUrl]);

  return {
    widgetState,
    species,
    petName,
    petDescription,
    selectedFile,
    previewUrl,
    matches,
    errorMessage,
    handleOpen,
    handleClose,
    handleSpeciesSelect,
    handleNameChange,
    handleDescriptionChange,
    handleImageSelect,
    handleSearch,
    reset,
  };
}
