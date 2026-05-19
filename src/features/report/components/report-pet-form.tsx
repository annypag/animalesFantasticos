"use client";

import Image from "next/image";
import { ChevronDown, Loader2, Upload } from "lucide-react";
import type {
  ReportPetErrors,
  ReportPetFormState,
  ReportType,
} from "../types/types";
import { ReportLocationMap } from "./report-location-map";


type ReportPetFormProps = {
  type: ReportType;
  form: ReportPetFormState;
  coordinates: [number, number] | null;
  errors: ReportPetErrors;
  submitError: string | null;
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

export function ReportPetForm({
  type,
  form,
  coordinates,
  errors,
  submitError,
  saving,
  onFieldChange,
  onCoordinatesChange,
  onSubmit,
  onCancel,
  submitLabel,
}: ReportPetFormProps) {
  const isLost = type === "lost";

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
          <label className="mb-2 block text-sm font-medium">Por favor, sube o copia la url de la imagen de la mascota</label>

          <div
            className={`mb-3 flex h-11 items-center gap-2 rounded-2xl border px-3 ${errors.imageUrl ? "border-red-400" : "border-border"
              }`}
          >
            <Upload className="h-4 w-4 text-muted-foreground" />

            <input
              type="url"
              value={form.imageUrl}
              onChange={(event) =>
                onFieldChange("imageUrl", event.target.value)
              }
              placeholder="https://..."
              className="h-full w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/20">
            {form.imageUrl ? (
              <Image
                src={form.imageUrl}
                alt="Vista previa de mascota"
                width={800}
                height={520}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <p className="px-4 text-center text-sm text-muted-foreground">
                Ingresá una URL para ver la vista previa.
              </p>
            )}
          </div>

          {errors.imageUrl && (
            <p className="mt-2 text-xs text-red-500">{errors.imageUrl}</p>
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
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Datos de la mascota</h2>

        <div className="rounded-3xl border border-border bg-white p-4 md:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Especie</span>
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
              <span className="font-medium">Nombre</span>
              <input
                value={form.name}
                onChange={(event) => onFieldChange("name", event.target.value)}
                className={`h-11 w-full rounded-2xl border px-3 ${errors.name ? "border-red-400" : "border-border"
                  }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Raza</span>
              <input
                value={form.breed}
                onChange={(event) => onFieldChange("breed", event.target.value)}
                className={`h-11 w-full rounded-2xl border px-3 ${errors.breed ? "border-red-400" : "border-border"
                  }`}
              />
              {errors.breed && (
                <p className="text-xs text-red-500">{errors.breed}</p>
              )}
            </label>

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
              <span className="font-medium">Descripción</span>
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
                Nombre
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
              <span className="font-medium">Teléfono</span>
              <input
                value={form.ownerPhone}
                onChange={(event) =>
                  onFieldChange("ownerPhone", event.target.value)
                }
                className={`h-11 w-full rounded-2xl border px-3 ${errors.ownerPhone ? "border-red-400" : "border-border"
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
                className="h-11 w-full rounded-2xl border border-border px-3"
              />
            </label>
          </div>
        </div>
      </section>

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
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold"
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