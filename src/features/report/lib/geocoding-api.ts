export interface ReverseGeocodingLocation {
  latitude: number;
  longitude: number;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  municipality?: string;
  province?: string;
  country?: string;
  displayName: string;
}

export async function getReverseGeocodingLocation(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<ReverseGeocodingLocation> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });

  const response = await fetch(`/api/geocoding/reverse?${params.toString()}`, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener la dirección de las coordenadas.");
  }

  return response.json();
}