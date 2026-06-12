// Voyage AI voyage-multimodal-3 — 1024 dimensiones
// https://docs.voyageai.com/reference/multimodal-embeddings-api

const VOYAGE_API_URL = "https://api.voyageai.com/v1/multimodalembeddings";
const VOYAGE_MODEL = "voyage-multimodal-3"; // dimensión: 1024

type VoyageContentItem =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: string }
  | { type: "image_base64"; image_base64: string };

interface VoyageRequestBody {
  inputs: Array<{ content: VoyageContentItem[] }>;
  model: string;
  input_type?: "query" | "document";
}

interface VoyageResponseBody {
  data: Array<{ embedding: number[] }>;
}

export async function generateEmbedding(
  content: VoyageContentItem[],
  inputType: "query" | "document" = "query",
): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY no configurado");

  const body: VoyageRequestBody = {
    inputs: [{ content }],
    model: VOYAGE_MODEL,
    input_type: inputType,
  };

  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI error ${response.status}: ${error}`);
  }

  const data = (await response.json()) as VoyageResponseBody;
  return data.data[0].embedding;
}

export async function generateImageEmbedding(imageUrl: string): Promise<number[]> {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return generateEmbedding(
      [{ type: "image_url", image_url: imageUrl }],
      "document",
    );
  }

  // Path local relativo a /public — leer desde disco y convertir a base64
  const { readFileSync } = await import("fs");
  const { join } = await import("path");
  const absolutePath = join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
  const buffer = readFileSync(absolutePath);
  const base64 = buffer.toString("base64");
  const ext = imageUrl.split(".").pop()?.toLowerCase() ?? "jpeg";
  const mimeType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  return generateEmbedding(
    [{ type: "image_base64", image_base64: `data:${mimeType};base64,${base64}` }],
    "document",
  );
}

export async function generateBase64Embedding(
  base64Data: string,
  mimeType: string,
): Promise<number[]> {
  return generateEmbedding(
    [{ type: "image_base64", image_base64: `data:${mimeType};base64,${base64Data}` }],
    "query",
  );
}
