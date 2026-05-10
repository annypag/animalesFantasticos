import { useEffect, useState } from "react";
import {
  defaultReportPetForm,
  ReportPetErrors,
  ReportPetFormState,
  ReportType,
} from "../types/types";
import { validatePetReport } from "../lib/report-validation";
import { createPetReport } from "../lib/report-api";

type UseReportPetFormParams = {
  type: ReportType;
  initialLocation?: [number, number] | null;
  onSuccess?: (payload: unknown) => void;
};

export function useReportPetForm({
  type,
  initialLocation = null,
  onSuccess,
}: UseReportPetFormParams) {
  const [form, setForm] = useState<ReportPetFormState>(defaultReportPetForm);

  const [coordinates, setCoordinates] = useState<[number, number] | null>(
    initialLocation,
  );

  const [errors, setErrors] = useState<ReportPetErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formatCoordinatesText = (coordinates: [number, number]) => {
    const [latitude, longitude] = coordinates;
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  };

  useEffect(() => {
    if (!initialLocation) {
      return;
    }

    setCoordinates(initialLocation);

    setForm((current) => ({
      ...current,
      locationText: formatCoordinatesText(initialLocation),
    }));

    setErrors((current) => ({
      ...current,
      coordinates: undefined,
      locationText: undefined,
    }));
  }, [initialLocation]);

  const changeField = <T extends keyof ReportPetFormState>(
    field: T,
    value: ReportPetFormState[T],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const changeCoordinates = (nextCoordinates: [number, number]) => {
    setCoordinates(nextCoordinates);

    setForm((current) => ({
      ...current,
      locationText: formatCoordinatesText(nextCoordinates),
    }));

    setErrors((current) => ({
      ...current,
      coordinates: undefined,
      locationText: undefined,
    }));
  };

  const reset = () => {
    setForm(defaultReportPetForm);
    setCoordinates(initialLocation);
    setErrors({});
    setSubmitError(null);
    setSaving(false);
  };

  const submit = async () => {
    const nextErrors = validatePetReport({
      type,
      form,
      coordinates,
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !coordinates) {
      return;
    }

    setSaving(true);
    setSubmitError(null);

    try {
      const payload = await createPetReport({
        type,
        form,
        coordinates,
      });

      reset();
      onSuccess?.(payload);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el reporte.",
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    coordinates,
    errors,
    submitError,
    saving,
    changeField,
    changeCoordinates,
    submit,
    reset,
  };
}
