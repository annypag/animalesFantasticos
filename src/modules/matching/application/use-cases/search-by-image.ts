import { generateBase64Embedding } from "@/modules/shared/infrastructure/voyage-client";
import { VectorMatch, VectorSearchRepository } from "@/modules/matching/infrastructure/vector-search-repository";

const vectorRepo = new VectorSearchRepository();

export interface SearchByImageInput {
  base64Data: string;
  mimeType: string;
  limit?: number;
  threshold?: number;
  species?: string;
}

export interface SearchByImageResult {
  matches: VectorMatch[];
  warning?: string;
}

export async function searchByImage(
  input: SearchByImageInput,
): Promise<SearchByImageResult> {
  if (!process.env.VOYAGE_API_KEY) {
    return { matches: [], warning: "Servicio de búsqueda visual no configurado" };
  }

  const threshold = input.threshold ?? Number(process.env.MATCHING_SIMILARITY_THRESHOLD ?? "0.0");
  const limit = input.limit ?? 5;

  const queryEmbedding = await generateBase64Embedding(input.base64Data, input.mimeType);
  const allMatches = await vectorRepo.findSimilarFoundPets(queryEmbedding, limit, input.species);

  const filtered = threshold > 0
    ? allMatches.filter((m) => m.score >= threshold)
    : allMatches;

  if (filtered.length === 0) {
    return { matches: [], warning: "Sin resultados" };
  }

  return { matches: filtered };
}
