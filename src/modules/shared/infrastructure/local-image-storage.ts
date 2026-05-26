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

export async function saveLocalImage(
  file: File,
  folder: "chat" | "reports",
): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new ValidationError("Solo se permiten imágenes JPG, PNG, WEBP o GIF.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ValidationError("La imagen no puede superar 5 MB.");
  }

  const extension = MIME_EXTENSION[file.type];
  const fileName = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, fileName), buffer);

  return `/uploads/${folder}/${fileName}`;
}
