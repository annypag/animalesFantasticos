import { NextResponse } from "next/server";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";
import { saveLocalImage } from "@/modules/shared/infrastructure/local-image-storage";

export async function handlePostImageUpload(
  request: Request,
  folder: "chat" | "reports",
) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ValidationError("Debés adjuntar un archivo de imagen.");
    }

    const imageUrl = await saveLocalImage(file, folder);

    return NextResponse.json({ imageUrl }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }

    console.error(`POST /api/uploads (${folder}) failed`, error);
    return NextResponse.json(
      { message: "No se pudo subir la imagen." },
      { status: 500 },
    );
  }
}
