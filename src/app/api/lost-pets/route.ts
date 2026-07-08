import { handleGetLostPets, handlePostLostPets } from "@/modules/lost-pets";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleGetLostPets(request);
}

export async function POST(req: Request) {
  return handlePostLostPets(req);
}
