
import { handleGetFoundPets, handlePostFoundPets } from "@/modules/found-pets";


export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleGetFoundPets(request);
}

export async function POST(request: Request) {
  return handlePostFoundPets(request);
}
