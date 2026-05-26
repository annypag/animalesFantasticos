export async function uploadReportImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/report/uploads", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "No se pudo subir la imagen.";
    try {
      const payload = (await response.json()) as { message?: string };
      message = payload.message ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as { imageUrl: string };
  return payload.imageUrl;
}
