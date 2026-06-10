"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ImagePlus, Loader2, X } from "lucide-react";
import { uploadReportImage } from "@/features/report/lib/report-image-api";
import { PET_NAME_UNKNOWN } from "@/features/report/lib/pet-name";
import type {
  PetBreedOption,
  ReportPetErrors,
  ReportPetFormState,
  ReportType,
} from "../types/types";
import { ReportLocationMap } from "./report-location-map";

const BREED_OPTIONS: PetBreedOption[] = [
  "Labrador",
  "Mestizo",
  "Caniche",
  "Desconocido",
];

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleImageFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      const upload = await uploadReportImage(file);
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

  function removeImageCapture(id: string) {
    const next = form.imageCapture.filter((image) => image.id !== id);
    onFieldChange("imageCapture", next);
    onFieldChange("imageUrl", next[0]?.fileUrl ?? "");
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <section>
        <h2 className="mb-3 text-lg font-bold">Foto</h2>

        <div className="rounded-3xl border border-border bg-white p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => void handleImageFileChange(event)}
          />

          <button
            type="button"
            disabled={uploadingImage || saving}
            onClick={() => fileInputRef.current?.click()}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            {uploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {uploadingImage ? "Subiendo foto..." : "Adjuntar foto"}
          </button>

          <p className="mb-3 text-xs text-muted-foreground">
            Podes adjuntar varias fotos. Mientras mas fotos, mejor precision de matching.
          </p>

          <div className="relative h-[220px] overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/20 p-3">
            {form.imageUrl ? (
              <Image
                src={form.imageUrl}
                alt="Vista previa de mascota"
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                Todavía no elegiste una foto.
              </div>
            )}
          </div>

          {form.imageCapture.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {form.imageCapture.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 px-2 py-1 text-xs"
                  title={image.fileName}
                >
                  <span className="truncate">{image.fileName}</span>
                  <button
                    type="button"
                    onClick={() => removeImageCapture(image.id)}
                    className="ml-2 rounded p-1 text-red-500 hover:bg-red-50"
                    aria-label="Descartar imagen"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {(uploadError || errors.imageUrl) && (
            <p className="mt-2 text-xs text-red-500">
              {uploadError ?? errors.imageUrl}
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Ubicación</h2>

        <div className="rounded-3xl border border-border bg-white p-4">
          <ReportLocationMap
            coordinates={coordinates}
            onChange={onCoordinatesChange}
            error={errors.coordinates}
          />

          <label className="mt-4 block space-y-1.5 text-sm">
            <span className="font-medium">Dirección o referencia</span>
            <input
              value={form.locationText}
              onChange={(event) =>
                onFieldChange("locationText", event.target.value)
              }
              placeholder="Ej: Av. Santa Fe 2400"
              className="h-11 w-full rounded-2xl border border-border px-3"
            />
          </label>

          <label className="mt-4 block space-y-1.5 text-sm">
            <span className="font-medium">{requiredLabel("Barrio")}</span>
            <input
              value={form.neighborhood}
              onChange={(event) => onFieldChange("neighborhood", event.target.value)}
              placeholder="Ej: Palermo"
              className={`h-11 w-full rounded-2xl border px-3 ${
                errors.neighborhood ? "border-red-400" : "border-border"
              }`}
            />
            {errors.neighborhood && (
              <p className="text-xs text-red-500">{errors.neighborhood}</p>
            )}
          </label>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Datos de la mascota</h2>

        <div className="rounded-3xl border border-border bg-white p-4 md:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">{requiredLabel("Especie")}</span>
              <div className="relative">
                <select
                  value={form.species}
                  onChange={(event) =>
                    onFieldChange(
                      "species",
                      event.target.value as ReportPetFormState["species"],
                    )
                  }
                  className="h-11 w-full appearance-none rounded-2xl border border-border bg-white px-3 pr-10"
                >
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Otro">Otro</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Tamaño</span>
              <select
                value={form.size}
                onChange={(event) =>
                  onFieldChange(
                    "size",
                    event.target.value as ReportPetFormState["size"],
                  )
                }
                className="h-11 w-full rounded-2xl border border-border bg-white px-3"
              >
                <option value="Pequeno">Pequeño</option>
                <option value="Mediano">Mediano</option>
                <option value="Grande">Grande</option>
              </select>
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">{requiredLabel("Sexo")}</span>
              <select
                value={form.sex}
                onChange={(event) =>
                  onFieldChange("sex", event.target.value as ReportPetFormState["sex"])
                }
                className="h-11 w-full rounded-2xl border border-border bg-white px-3"
              >
                <option value="Desconocido">Desconocido</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
              {errors.sex && <p className="text-xs text-red-500">{errors.sex}</p>}
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">
                {requiredLabel(
                  isLost ? "Fecha de extravio (dd/mm/yyyy)" : "Fecha de hallazgo (dd/mm/yyyy)",
                )}
              </span>
              <input
                value={form.eventDate}
                onChange={(event) =>
                  onFieldChange("eventDate", formatDateInput(event.target.value))
                }
                placeholder="Ej: 25/05/2026"
                inputMode="numeric"
                maxLength={10}
                className={`h-11 w-full rounded-2xl border px-3 ${
                  errors.eventDate ? "border-red-400" : "border-border"
                }`}
              />
              {errors.eventDate && (
                <p className="text-xs text-red-500">{errors.eventDate}</p>
              )}
            </label>

            <div className="space-y-1.5 text-sm sm:col-span-2">
              <span className="font-medium">{requiredLabel("Raza")}</span>
              <select
                value={form.breed[0] ?? ""}
                onChange={(event) =>
                  onFieldChange(
                    "breed",
                    event.target.value ? [event.target.value as PetBreedOption] : [],
                  )
                }
                className={`h-11 w-full rounded-2xl border bg-white px-3 ${
                  errors.breed ? "border-red-400" : "border-border"
                }`}
              >
                <option value="">Seleccionar raza</option>
                {BREED_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.breed && <p className="text-xs text-red-500">{errors.breed}</p>}
            </div>

            <div className="space-y-3 sm:col-span-2">
              <span className="block text-sm font-medium">Nombre de la mascota</span>

              <div className="flex flex-col gap-2">
                <label className="flex cursor-pointer items-start gap-2 rounded-2xl border border-border px-3 py-2 text-sm">
                  <input
                    type="radio"
                    name="name-situation"
                    checked={form.nameSituation === "tag"}
                    onChange={() => onFieldChange("nameSituation", "tag")}
                    className="mt-1"
                  />
                  <span>
                    Tiene chapita identificatoria
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Podés cargar el nombre que figure en la chapita.
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-2 rounded-2xl border border-border px-3 py-2 text-sm">
                  <input
                    type="radio"
                    name="name-situation"
                    checked={form.nameSituation === "unknown"}
                    onChange={() => onFieldChange("nameSituation", "unknown")}
                    className="mt-1"
                  />
                  <span>
                    No sabemos el nombre
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Se publicará como &quot;{PET_NAME_UNKNOWN}&quot;.
                    </span>
                  </span>
                </label>
              </div>

              {form.nameSituation === "tag" ? (
                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium">{requiredLabel("Nombre en la chapita")}</span>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      onFieldChange("name", event.target.value)
                    }
                    placeholder="Ej: Rocky"
                    className={`h-11 w-full rounded-2xl border px-3 ${errors.name ? "border-red-400" : "border-border"
                      }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name}</p>
                  )}
                </label>
              ) : null}
            </div>

            {isLost && (
              <label className="space-y-1.5 text-sm sm:col-span-2">
                <span className="font-medium">Visto por última vez</span>
                <input
                  value={form.lastSeen}
                  onChange={(event) =>
                    onFieldChange("lastSeen", event.target.value)
                  }
                  placeholder="Ej: Hoy a las 15:00"
                  className={`h-11 w-full rounded-2xl border px-3 ${errors.lastSeen ? "border-red-400" : "border-border"
                    }`}
                />
                {errors.lastSeen && (
                  <p className="text-xs text-red-500">{errors.lastSeen}</p>
                )}
              </label>
            )}
            <label className="space-y-1.5 text-sm sm:col-span-2">
              <span className="font-medium">{requiredLabel("Descripción")}</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  onFieldChange("description", event.target.value)
                }
                className={`w-full resize-none rounded-2xl border px-3 py-2 ${errors.description ? "border-red-400" : "border-border"}`}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </label>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold"><span className="font-medium">
          {isLost ? "Contacto del dueño" : "Contacto de la persona que lo encontró"}
        </span></h2>

        <div className="rounded-3xl border border-border bg-white p-4 md:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm sm:col-span-2">
              <span className="font-medium">
                {requiredLabel(isLost ? "Nombre del dueño" : "Persona que encontró")}
              </span>
              <input
                value={form.ownerName}
                onChange={(event) =>
                  onFieldChange("ownerName", event.target.value)
                }
                className={`h-11 w-full rounded-2xl border px-3 ${errors.ownerName ? "border-red-400" : "border-border"
                  }`}
              />
              {errors.ownerName && (
                <p className="text-xs text-red-500">{errors.ownerName}</p>
              )}
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">{requiredLabel("Teléfono")}</span>
              <input
                value={form.ownerPhone}
                onChange={(event) =>
                  onFieldChange("ownerPhone", event.target.value)
                }
                placeholder="1512341234"
                inputMode="numeric"
                className={`h-11 w-full rounded-2xl border px-3 ${
                  errors.ownerPhone ? "border-red-400" : "border-border"
                }`}
              />
              {errors.ownerPhone && (
                <p className="text-xs text-red-500">{errors.ownerPhone}</p>
              )}
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Email (opcional)</span>
              <input
                type="email"
                value={form.ownerEmail}
                onChange={(event) =>
                  onFieldChange("ownerEmail", event.target.value)
                }
                placeholder="email@mail.com"
                className={`h-11 w-full rounded-2xl border px-3 ${
                  errors.ownerEmail ? "border-red-400" : "border-border"
                }`}
              />
              {errors.ownerEmail && (
                <p className="text-xs text-red-500">{errors.ownerEmail}</p>
              )}
            </label>
          </div>
        </div>
      </section>

      {authError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="mb-3 font-medium">{authError}</p>
          <div className="flex gap-2">
            <Link
              href="/login"
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Registrarse
            </Link>
          </div>
        </div>
      )}

      {submitError && (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white disabled:opacity-60 ${isLost ? "bg-[var(--alert-orange)]" : "bg-primary"}`}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel ??
            (isLost ? "Publicar mascota perdida" : "Publicar mascota encontrada")}
        </button>
      </div>
    </form>
  );
}
