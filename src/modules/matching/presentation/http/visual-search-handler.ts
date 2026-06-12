import { NextResponse } from "next/server";
import { searchByImage } from "@/modules/matching/application/use-cases/search-by-image";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB — límite de Voyage AI

export async function handleVisualSearch(request: Request): Promise<Response> {
  try {
    if (!process.env.VOYAGE_API_KEY) {
      return NextResponse.json(
        { matches: [], warning: "Servicio de búsqueda visual no configurado" },
        { status: 200 },
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { message: "El cuerpo debe ser multipart/form-data con el campo 'image'." },
        { status: 400 },
      );
    }

    const file = formData.get("image");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "El campo 'image' es obligatorio y debe ser un archivo." },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: `Tipo de imagen no soportado: ${file.type}. Usar JPEG, PNG, WEBP o GIF.` },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { message: "La imagen supera el límite de 20 MB." },
        { status: 400 },
      );
    }

    const speciesRaw = formData.get("species");
    const species = typeof speciesRaw === "string" ? speciesRaw : undefined;

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const result = await searchByImage({
      base64Data,
      mimeType: file.type,
      species,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("POST /api/matches/search failed", err);
    return NextResponse.json(
      { message: "Error al procesar la búsqueda visual." },
      { status: 500 },
    );
  }
}
