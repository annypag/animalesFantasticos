"use client";

import Link from "next/link";
import { useState } from "react";
import { PawPrint } from "lucide-react";
import type { ReportType } from "@/features/report/types/types";
import { useReportPetForm } from "@/features/report/hooks/use-report-pet-form";
import { ReportPetForm } from "@/features/report/components/report-pet-form";

export function NewReportScreen() {
  const [reportType, setReportType] = useState<ReportType>("found");
  const [submitted, setSubmitted] = useState(false);

  const reportForm = useReportPetForm({
    type: reportType,
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <PawPrint className="h-10 w-10 text-primary" />
        </div>

        <h2 className="text-2xl font-bold text-foreground">
          Reporte publicado
        </h2>

        <p className="text-muted-foreground">
          Tu alerta se guardó correctamente.
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted"
          >
            Cargar otro reporte
          </button>

          <Link
            href="/"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Nuevo reporte
            </h1>

            <p className="text-sm text-muted-foreground">
              Publicá una mascota perdida o encontrada.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Volver al mapa
          </Link>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setReportType("found");
              reportForm.reset();
            }}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              reportType === "found"
                ? "border-primary bg-primary text-white"
                : "border-border bg-white"
            }`}
          >
            Mascota encontrada
          </button>

          <button
            type="button"
            onClick={() => {
              setReportType("lost");
              reportForm.reset();
            }}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              reportType === "lost"
                ? "border-primary bg-primary text-white"
                : "border-border bg-white"
            }`}
          >
            Mascota perdida
          </button>
        </div>

        <ReportPetForm
          type={reportType}
          form={reportForm.form}
          coordinates={reportForm.coordinates}
          errors={reportForm.errors}
          submitError={reportForm.submitError}
          saving={reportForm.saving}
          onFieldChange={reportForm.changeField}
          onCoordinatesChange={reportForm.changeCoordinates}
          onSubmit={reportForm.submit}
        />
      </div>
    </main>
  );
}