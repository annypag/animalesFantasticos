import { useEffect, useState } from "react";
import {
  defaultReportPetForm,
  ReportPetErrors,
  ReportPetFormState,
  ReportType,
} from "../types/types";
import { validatePetReport } from "../lib/report-validation";
import { createPetReport } from "../lib/report-api";
import { getReverseGeocodingLocation, ReverseGeocodingLocation } from "../lib/geocoding-api";

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

  const [locationData, setLocationData] =
    useState<ReverseGeocodingLocation | null>(null);

  const [resolvingLocation, setResolvingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);


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

  useEffect(() => {
    if (!coordinates) {
      setLocationData(null);
      setLocationError(null);
      return;
    }

    const [latitude, longitude] = coordinates;
    const fallbackLocationText = formatCoordinatesText(coordinates);

    const controller = new AbortController();

    const resolveLocation = async () => {
      setResolvingLocation(true);
      setLocationError(null);

      try {
        const location = await getReverseGeocodingLocation(
          latitude,
          longitude,
          controller.signal,
        );

        setLocationData(location);

        setForm((current) => ({
          ...current,
          locationText: location.displayName || fallbackLocationText,
          neighborhood: location.neighborhood || current.neighborhood,
        }));

        setErrors((current) => ({
          ...current,
          coordinates: undefined,
          locationText: undefined,
        }));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("No se pudo resolver la ubicación:", error);

        setLocationData(null);
        setLocationError("No se pudo obtener la dirección automáticamente.");

        setForm((current) => ({
          ...current,
          locationText: current.locationText || fallbackLocationText,
        }));
      } finally {
        if (!controller.signal.aborted) {
          setResolvingLocation(false);
        }
      }
    };

    resolveLocation();

    return () => {
      controller.abort();
    };
  }, [coordinates]);


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

    setLocationData(null);
    setLocationError(null);

    setErrors((current) => ({
      ...current,
      coordinates: undefined,
      locationText: undefined,
    }));
  };

  const reset = () => {
    setForm(defaultReportPetForm);
    setCoordinates(initialLocation);
    setLocationData(null);
    setLocationError(null);
    setResolvingLocation(false);
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

    if (Object.keys(nextErrors).length > 0) {
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
    locationData,
    resolvingLocation,
    locationError,
    errors,
    submitError,
    saving,
    changeField,
    changeCoordinates,
    submit,
    reset,
  };
}
