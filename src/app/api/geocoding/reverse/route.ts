import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode } from "@/features/report/server/reverse-geocoding-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!lat || !lon || Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json(
      { message: "Latitud o longitud inválida" },
      { status: 400 }
    );
  }

  try {
    const location = await reverseGeocode(lat, lon);

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error en reverse geocoding:", error);

    return NextResponse.json(
      { message: "No se pudo obtener la dirección" },
      { status: 500 }
    );
  }
}