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

  const title =
    type === "lost"
      ? "Reportar mascota perdida"
      : "Reportar mascota encontrada";

  const subtitle =
    type === "lost"
      ? "Completá los datos para publicar una alerta de pérdida."
      : "Completá los datos para publicar una mascota encontrada.";

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <header className="mb-6 pr-10">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
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
  );
}