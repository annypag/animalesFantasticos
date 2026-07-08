"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ImagePlus, Loader2, X, Camera, FileText, MapPin, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { uploadReportImage } from "@/features/report/lib/report-image-api";
import { PET_NAME_UNKNOWN } from "@/features/report/lib/pet-name";
import type {
  ReportPetErrors,
  ReportPetFormState,
  ReportType,
} from "../types/types";
import { ReportLocationMap } from "./report-location-map";
import { BreedAutocomplete } from "./breed-autocomplete";

type ReportPetFormProps = {
  type: ReportType;
  form: ReportPetFormState;
  coordinates: [number, number] | null;
  errors: ReportPetErrors;
  submitError: string | null;
  authError?: string | null;
  saving: boolean;
  onFieldChange: <T extends keyof ReportPetFormState>(
    field: T,
    value: ReportPetFormState[T],
  ) => void;
  onCoordinatesChange: (coordinates: [number, number]) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
};

function requiredLabel(label: string) {
  return (
    <>
      {label} <span className="text-red-500">*</span>
    </>
  );
}

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function ReportPetForm({
  type,
  form,
  coordinates,
  errors,
  submitError,
  authError,
  saving,
  onFieldChange,
  onCoordinatesChange,
  onSubmit,
  onCancel,
  submitLabel,
}: ReportPetFormProps) {
  const isLost = type === "lost";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localErrors, setLocalErrors] = useState<ReportPetErrors>({});

  const activeErrors = { ...errors, ...localErrors };

  const handleFieldChange = <T extends keyof ReportPetFormState>(
    field: T,
    value: ReportPetFormState[T],
  ) => {
    setLocalErrors((prev) => ({ ...prev, [field]: undefined }));
    onFieldChange(field, value);
  };

  const handleCoordinatesChange = (nextCoordinates: [number, number]) => {
    setLocalErrors((prev) => ({ ...prev, coordinates: undefined, neighborhood: undefined }));
    onCoordinatesChange(nextCoordinates);
  };

  async function processImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor, subí un archivo de imagen válido (JPEG, PNG, WEBP, GIF).");
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      const upload = await uploadReportImage(file);
      setLocalErrors((prev) => ({ ...prev, imageUrl: undefined }));
      onFieldChange("imageUrl", upload.imageUrl);
      onFieldChange("imageCapture", [...form.imageCapture, upload.imageCapture]);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "No se pudo subir la imagen.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleImageFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }
    await processImageFile(file);
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  function removeImageCapture(id: string) {
    const next = form.imageCapture.filter((image) => image.id !== id);
    onFieldChange("imageCapture", next);
    onFieldChange("imageUrl", next[0]?.fileUrl ?? "");
  }

  const validateStep = (currentStep: number): boolean => {
    const newErrors: ReportPetErrors = {};

    if (currentStep === 1) {
      if (form.breed.length === 0 || !form.breed[0]) {
        newErrors.breed = "Seleccione la raza de la mascota.";
      }
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.eventDate.trim())) {
        newErrors.eventDate = "La fecha debe tener formato dd/mm/yyyy.";
      }
      if (form.nameSituation === "tag" && !form.name.trim()) {
        newErrors.name = "Ingrese el nombre que figura en la chapita.";
      }
      if (!form.description.trim()) {
        newErrors.description = "La descripción es obligatoria.";
      }
    } else if (currentStep === 2) {
      if (!form.imageUrl.trim() || form.imageCapture.length === 0) {
        newErrors.imageUrl = "Subí al menos una foto de la mascota.";
      }
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const steps = [
    { number: 1, label: "Detalles", icon: FileText },
    { number: 2, label: "Fotos", icon: Camera },
    { number: 3, label: "Ubicación", icon: MapPin },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* ProgressBar Header */}
      <div className="mb-10 select-none">
        <div className="flex items-center justify-between relative max-w-lg mx-auto">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-slate-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-[3px] bg-primary -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s) => {
            const IconComponent = s.icon;
            const isActive = step === s.number;
            const isCompleted = step > s.number;

            return (
              <div key={s.number} className="relative z-10 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Solo permite navegar hacia atrás o a pasos validados
                    if (s.number < step) {
                      setStep(s.number);
                    } else if (s.number > step) {
                      // Valida paso por paso consecutivamente
                      let canGo = true;
                      for (let i = step; i < s.number; i++) {
                        if (!validateStep(i)) {
                          canGo = false;
                          break;
                        }
                      }
                      if (canGo) setStep(s.number);
                    }
                  }}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "border-primary bg-primary text-white shadow-lg shadow-primary/25 scale-110"
                      : isCompleted
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                  }`}
                >
                  {isCompleted ? "✓" : <IconComponent className="h-5 w-5" />}
                </button>
                <span
                  className={`text-xs font-bold transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          // Valida todos los pasos de corrido antes del submit final
          if (validateStep(1) && validateStep(2)) {
            void onSubmit();
          } else if (!validateStep(1)) {
            setStep(1);
          } else if (!validateStep(2)) {
            setStep(2);
          }
        }}
      >
        {/* Step 1: Datos de la mascota */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-foreground mb-5 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">1</span>
                Datos Básicos de la Mascota
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-semibold text-slate-700">{requiredLabel("Especie")}</span>
                  <div className="relative">
                    <select
                      value={form.species}
                      onChange={(event) =>
                        handleFieldChange(
                          "species",
                          event.target.value as ReportPetFormState["species"],
                        )
                      }
                      className="h-11 w-full appearance-none rounded-2xl border border-border bg-white px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="Perro">Perro</option>
                      <option value="Gato">Gato</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </label>

                <label className="space-y-1.5 text-sm">
                  <span className="font-semibold text-slate-700">Tamaño</span>
                  <div className="relative">
                    <select
                      value={form.size}
                      onChange={(event) =>
                        handleFieldChange(
                          "size",
                          event.target.value as ReportPetFormState["size"],
                        )
                      }
                      className="h-11 w-full appearance-none rounded-2xl border border-border bg-white px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="Pequeno">Pequeño</option>
                      <option value="Mediano">Mediano</option>
                      <option value="Grande">Grande</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </label>

                <label className="space-y-1.5 text-sm">
                  <span className="font-semibold text-slate-700">{requiredLabel("Sexo")}</span>
                  <div className="relative">
                    <select
                      value={form.sex}
                      onChange={(event) =>
                        handleFieldChange("sex", event.target.value as ReportPetFormState["sex"])
                      }
                      className="h-11 w-full appearance-none rounded-2xl border border-border bg-white px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="Desconocido">Desconocido</option>
                      <option value="Macho">Macho</option>
                      <option value="Hembra">Hembra</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </label>

                <label className="space-y-1.5 text-sm">
                  <span className="font-semibold text-slate-700">
                    {requiredLabel(
                      isLost ? "Fecha de extravío (dd/mm/yyyy)" : "Fecha de hallazgo (dd/mm/yyyy)",
                    )}
                  </span>
                  <input
                    value={form.eventDate}
                    onChange={(event) =>
                      handleFieldChange("eventDate", formatDateInput(event.target.value))
                    }
                    placeholder="Ej: 25/05/2026"
                    inputMode="numeric"
                    maxLength={10}
                    className={`h-11 w-full rounded-2xl border px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      activeErrors.eventDate ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
                    }`}
                  />
                  {activeErrors.eventDate && (
                    <p className="text-xs text-red-500 font-medium">{activeErrors.eventDate}</p>
                  )}
                </label>

                <div className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-semibold text-slate-700">{requiredLabel("Raza")}</span>
                  <BreedAutocomplete
                    value={form.breed[0] ?? ""}
                    onChange={(val) => handleFieldChange("breed", val ? [val] : [])}
                    species={form.species}
                    hasError={!!activeErrors.breed}
                  />
                  {activeErrors.breed && <p className="text-xs text-red-500 font-medium">{activeErrors.breed}</p>}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-foreground mb-5 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">2</span>
                Identificación de la Mascota
              </h2>

              <div className="space-y-4">
                <span className="block text-sm font-semibold text-slate-700">Nombre de la mascota</span>

                <div className="flex flex-col gap-2.5">
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border px-4 py-3 text-sm transition-all hover:bg-slate-50/50">
                    <input
                      type="radio"
                      name="name-situation"
                      checked={form.nameSituation === "tag"}
                      onChange={() => handleFieldChange("nameSituation", "tag")}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-semibold text-slate-800">Tiene chapita identificatoria</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Podés cargar el nombre que figure en la chapita.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border px-4 py-3 text-sm transition-all hover:bg-slate-50/50">
                    <input
                      type="radio"
                      name="name-situation"
                      checked={form.nameSituation === "unknown"}
                      onChange={() => handleFieldChange("nameSituation", "unknown")}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-semibold text-slate-800">No sabemos el nombre</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Se publicará como &quot;{PET_NAME_UNKNOWN}&quot;.
                      </span>
                    </span>
                  </label>
                </div>

                {form.nameSituation === "tag" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="block space-y-1.5 text-sm pt-2"
                  >
                    <span className="font-semibold text-slate-700">{requiredLabel("Nombre en la chapita")}</span>
                    <input
                      value={form.name}
                      onChange={(event) =>
                        handleFieldChange("name", event.target.value)
                      }
                      placeholder="Ej: Rocky"
                      className={`h-11 w-full rounded-2xl border px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                        activeErrors.name ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
                      }`}
                    />
                    {activeErrors.name && (
                      <p className="text-xs text-red-500 font-medium">{activeErrors.name}</p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">3</span>
                Detalles Adicionales
              </h2>

              <div className="space-y-4">
                {isLost && (
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-semibold text-slate-700">Visto por última vez</span>
                    <input
                      value={form.lastSeen}
                      onChange={(event) =>
                        handleFieldChange("lastSeen", event.target.value)
                      }
                      placeholder="Ej: Hoy a las 15:00 cerca de la plaza"
                      className={`h-11 w-full rounded-2xl border px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                        activeErrors.lastSeen ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
                      }`}
                    />
                    {activeErrors.lastSeen && (
                      <p className="text-xs text-red-500 font-medium">{activeErrors.lastSeen}</p>
                    )}
                  </label>
                )}

                <label className="block space-y-1.5 text-sm">
                  <span className="font-semibold text-slate-700">{requiredLabel("Descripción")}</span>
                  <textarea
                    rows={4}
                    value={form.description}
                    placeholder="Contanos cómo es la mascota, si tiene collar, señas particulares o algún comportamiento especial..."
                    onChange={(event) =>
                      handleFieldChange("description", event.target.value)
                    }
                    className={`w-full resize-none rounded-2xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      activeErrors.description ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
                    }`}
                  />
                  {activeErrors.description && (
                    <p className="text-xs text-red-500 font-medium">{activeErrors.description}</p>
                  )}
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Fotos de la mascota */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-foreground mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">2</span>
                Fotos de la Mascota
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Subí fotos claras de frente y perfil. Mientras más fotos adjuntes, el algoritmo de Inteligencia Artificial tendrá mayor precisión para hallar coincidencias.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageFileChange}
              />

              {/* Drag and Drop premium area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploadingImage && !saving && fileInputRef.current?.click()}
                className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition-all ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/5"
                    : "border-slate-200 bg-slate-50/30 hover:border-primary hover:bg-slate-50/80"
                }`}
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-bold text-slate-700 animate-pulse">Subiendo foto...</p>
                    <p className="text-xs text-muted-foreground">Procesando imagen, esto tomará unos segundos</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Arrastrá tus fotos acá o hacé clic para buscar
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Formatos soportados: JPEG, PNG, WEBP o GIF
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {uploadError}
                </div>
              )}
              {activeErrors.imageUrl && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {activeErrors.imageUrl}
                </div>
              )}

              {/* Thumbnails grid */}
              {form.imageCapture.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                    Fotos cargadas ({form.imageCapture.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {form.imageCapture.map((image) => (
                      <div
                        key={image.id}
                        className="relative group aspect-square rounded-2xl overflow-hidden border border-border bg-slate-50 shadow-sm"
                      >
                        <Image
                          src={image.fileUrl}
                          alt={image.fileName}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImageCapture(image.id);
                          }}
                          className="absolute top-2.5 right-2.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-red-600 hover:scale-110 shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label="Descartar imagen"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                          <p className="text-[10px] text-white truncate font-medium">{image.fileName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Ubicación y Datos de Contacto */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-foreground mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">3</span>
                Zona de Desaparición / Hallazgo
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Marcá en el mapa el punto exacto donde se vio la mascota por última vez.
              </p>

              <ReportLocationMap
                coordinates={coordinates}
                onChange={handleCoordinatesChange}
                error={activeErrors.coordinates}
              />

              <div className="grid gap-5 mt-6 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm">
                  <span className="font-semibold text-slate-700">Dirección o referencia</span>
                  <input
                    value={form.locationText}
                    onChange={(event) =>
                      handleFieldChange("locationText", event.target.value)
                    }
                    placeholder="Ej: Av. Santa Fe 2400"
                    className="h-11 w-full rounded-2xl border border-border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </label>

                <label className="block space-y-1.5 text-sm">
                  <span className="font-semibold text-slate-700">{requiredLabel("Barrio")}</span>
                  <input
                    value={form.neighborhood}
                    onChange={(event) => handleFieldChange("neighborhood", event.target.value)}
                    placeholder="Ej: Palermo"
                    className={`h-11 w-full rounded-2xl border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      activeErrors.neighborhood
                        ? "border-red-400 focus:border-red-500"
                        : "border-border focus:border-primary"
                    }`}
                  />
                  {activeErrors.neighborhood && (
                    <p className="text-xs text-red-500 font-medium">{activeErrors.neighborhood}</p>
                  )}
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-foreground mb-5 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">4</span>
                Datos de Contacto
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-semibold text-slate-700">
                    {requiredLabel(isLost ? "Nombre del dueño" : "Tu nombre / Persona que encontró")}
                  </span>
                  <input
                    value={form.ownerName}
                    onChange={(event) =>
                      handleFieldChange("ownerName", event.target.value)
                    }
                    className={`h-11 w-full rounded-2xl border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      activeErrors.ownerName ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
                    }`}
                  />
                  {activeErrors.ownerName && (
                    <p className="text-xs text-red-500 font-medium">{activeErrors.ownerName}</p>
                  )}
                </label>

                <label className="space-y-1.5 text-sm">
                  <span className="font-semibold text-slate-700">{requiredLabel("Teléfono")}</span>
                  <input
                    value={form.ownerPhone}
                    onChange={(event) =>
                      handleFieldChange("ownerPhone", event.target.value)
                    }
                    placeholder="1123456789"
                    inputMode="numeric"
                    className={`h-11 w-full rounded-2xl border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      activeErrors.ownerPhone ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
                    }`}
                  />
                  {activeErrors.ownerPhone && (
                    <p className="text-xs text-red-500 font-medium">{activeErrors.ownerPhone}</p>
                  )}
                </label>

                <label className="space-y-1.5 text-sm">
                  <span className="font-semibold text-slate-700">Email (opcional)</span>
                  <input
                    type="email"
                    value={form.ownerEmail}
                    onChange={(event) =>
                      handleFieldChange("ownerEmail", event.target.value)
                    }
                    placeholder="email@mail.com"
                    className={`h-11 w-full rounded-2xl border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                      activeErrors.ownerEmail ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
                    }`}
                  />
                  {activeErrors.ownerEmail && (
                    <p className="text-xs text-red-500 font-medium">{activeErrors.ownerEmail}</p>
                  )}
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {authError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 mt-6 shadow-sm">
            <p className="mb-3 font-semibold">{authError}</p>
            <div className="flex gap-2">
              <Link
                href="/login"
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-slate-50 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        )}

        {submitError && (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive mt-6 shadow-sm font-semibold">
            {submitError}
          </p>
        )}

        {/* Wizard Footer Navigation Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-6 border-t border-border mt-8">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                disabled={saving}
                className="w-full sm:w-auto rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Volver
              </button>
            ) : (
              onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={saving}
                  className="w-full sm:w-auto rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              )
            )}
          </div>

          <div className="flex gap-2.5">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (validateStep(step)) {
                    setStep((current) => current + 1);
                  }
                }}
                className="w-full sm:w-auto rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white disabled:opacity-60 transition-colors cursor-pointer ${
                  isLost ? "bg-[var(--alert-orange)] hover:bg-[var(--alert-orange)]/90" : "bg-primary hover:bg-primary/90"
                }`}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitLabel ??
                  (isLost ? "Publicar mascota perdida" : "Publicar mascota encontrada")}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
