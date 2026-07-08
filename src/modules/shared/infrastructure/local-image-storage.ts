import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ValidationError } from "@/modules/shared/application/errors/validation-error";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function uploadToCloudinary(
  file: File,
  folder: "chat" | "reports"
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", `animales_fantasticos/${folder}`);

  if (uploadPreset) {
    formData.append("upload_preset", uploadPreset);
  } else if (cloudName && apiKey && apiSecret) {
    const timestamp = Math.round(Date.now() / 1000).toString();
    const paramsToSign = `folder=animales_fantasticos/${folder}&timestamp=${timestamp}`;
    
    const { createHash } = await import("node:crypto");
    const signature = createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
  } else {
    throw new ValidationError(
      "Configuración de Cloudinary incompleta. Definí CLOUDINARY_UPLOAD_PRESET o CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET."
    );
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Error al subir a Cloudinary");
  }

  const result = await response.json();
  return result.secure_url;
}

export async function saveLocalImage(
  file: File,
  folder: "chat" | "reports",
): Promise<{ id: string; fileName: string; fileUrl: string }> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new ValidationError("Solo se permiten imágenes JPG, PNG, WEBP o GIF.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ValidationError("La imagen no puede superar 5 MB.");
  }

  const extension = MIME_EXTENSION[file.type];
  const id = randomUUID();
  const fileName = `${id}.${extension}`;

  // 1. Intentar subir a Vercel Blob si está configurado
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const buffer = Buffer.from(await file.arrayBuffer());
      const blob = await put(`assets/${folder}/${fileName}`, buffer, {
        access: "public",
        contentType: file.type,
      });
      return {
        id,
        fileName,
        fileUrl: blob.url,
      };
    } catch (error) {
      console.error("Error al subir a Vercel Blob, intentando fallback:", error);
    }
  }

  // 2. Intentar subir a Cloudinary si está configurado
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const fileUrl = await uploadToCloudinary(file, folder);
      return {
        id,
        fileName,
        fileUrl,
      };
    } catch (error) {
      console.error("Error al subir a Cloudinary, intentando fallback:", error);
    }
  }

  // 3. Fallback a almacenamiento local tradicional
  const uploadDir = path.join(process.cwd(), "public", "assets", folder);
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, fileName), buffer);

  return {
    id,
    fileName,
    fileUrl: `/assets/${folder}/${fileName}`,
  };
}

