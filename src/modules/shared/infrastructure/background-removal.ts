// Removes the background from a pet image before embedding generation.
// Uses @imgly/background-removal-node (local ONNX model, no external API).
// First call downloads the model (~100MB) and is slower; subsequent calls use cache.

export async function removeImageBackground(imageSource: string): Promise<string | null> {
  try {
    const { removeBackground } = await import("@imgly/background-removal-node");

    let inputData: string | ArrayBuffer;

    if (imageSource.startsWith("data:")) {
      // base64 data URL → convertir a ArrayBuffer
      const base64 = imageSource.split(",")[1];
      const binary = Buffer.from(base64, "base64");
      inputData = binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength) as ArrayBuffer;
    } else if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
      inputData = imageSource;
    } else {
      // Path local relativo a /public
      const { readFileSync } = await import("fs");
      const { join } = await import("path");
      const absolutePath = join(process.cwd(), "public", imageSource.replace(/^\//, ""));
      const buffer = readFileSync(absolutePath);
      inputData = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    }

    const resultBlob = await removeBackground(inputData);
    const arrayBuffer = await resultBlob.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
  } catch (err) {
    console.warn("[background-removal] Falló, se usará imagen original:", (err as Error).message);
    return null;
  }
}
