import { handlePostLostPets } from "@/modules/lost-pets";

export async function POST(req: Request) {
  return handlePostLostPets(req);
}
