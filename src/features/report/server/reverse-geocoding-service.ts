export interface ReverseGeocodingResult {
  latitude: number;
  longitude: number;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  province?: string;
  country?: string;
  displayName: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    footway?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    city_district?: string;
    quarter?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<ReverseGeocodingResult> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");

  url.searchParams.set("format", "json");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "es");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "animales-fantasticos-app/1.0",
    },
  });

  if (!response.ok) {
    throw new Error("Error consultando Nominatim");
  }

  const data = (await response.json()) as NominatimResponse;

  const address = data.address ?? {};

  const street = address.road || address.pedestrian || address.footway;
  const number = address.house_number;

  const neighborhood =
    address.neighbourhood ||
    address.suburb ||
    address.city_district ||
    address.quarter;

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality;

  const province = address.state;
  const country = address.country;

  const streetLine = [street, number].filter(Boolean).join(" ");

  const displayName =
    [streetLine, neighborhood, city, province].filter(Boolean).join(", ") ||
    data.display_name ||
    `${lat}, ${lon}`;

  return {
    latitude: lat,
    longitude: lon,
    street,
    number,
    neighborhood,
    city,
    province,
    country,
    displayName,
  };
}