import { handleGetMatches, handlePostRecomputeMatches } from "@/modules/matching";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleGetMatches(request);
}

export async function POST(request: Request) {
  return handlePostRecomputeMatches(request);
}
