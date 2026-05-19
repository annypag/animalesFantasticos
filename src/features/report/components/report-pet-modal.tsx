"use client";

import { X } from "lucide-react";
import type { ReportType } from "../types/types";
import { useReportPetForm } from "../hooks/use-report-pet-form";
import { ReportPetForm } from "./report-pet-form";

type ReportPetModalProps = {
  open: boolean;
  type: ReportType;
  reportLocation: [number, number] | null;
  onClose: () => void;
  onSuccess?: (payload: unknown) => void;
};

export function ReportPetModal({
  open,
  type,
  reportLocation,
  onClose,
  onSuccess,
}: ReportPetModalProps) {
  const reportForm = useReportPetForm({
    type,
    initialLocation: reportLocation,
    onSuccess: (payload) => {
      onSuccess?.(payload);
      onClose();
    },
  });

  if (!open) {
    return null;
  }

  const isLost = type === "lost";

  const title =
    type === "lost"
      ? "Reportar mascota perdida"
      : "¡Encontré una mascota!"
  const subtitle =
    type === "lost"
      ? "Completá los datos para publicar una alerta."
      : "¡Gracias! Completá los datos y publica la mascota para que el dueño la encuentre.";

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className={`relative rounded-[1.5rem] border ${isLost ? "border-[var(--alert-orange)]" : "border-primary"} p-4 sm:p-6`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>

          <header
            className={`mb-6 rounded-xl p-5 pr-14 sm:p-6 sm:pr-16 ${isLost ? "bg-[var(--alert-orange)]" : "bg-primary"}`}
          >
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="mt-1 text-sm text-white/90">{subtitle}</p>
          </header>

          <ReportPetForm
            type={type}
            form={reportForm.form}
            coordinates={reportForm.coordinates}
            errors={reportForm.errors}
            submitError={reportForm.submitError}
            saving={reportForm.saving}
            onFieldChange={reportForm.changeField}
            onCoordinatesChange={reportForm.changeCoordinates}
            onSubmit={reportForm.submit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}