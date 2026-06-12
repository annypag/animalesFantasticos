import { handleVisualSearch } from "@/modules/matching/presentation/http/visual-search-handler";

export async function POST(request: Request): Promise<Response> {
  return handleVisualSearch(request);
}
