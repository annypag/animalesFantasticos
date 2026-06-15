import { handlePostResolveFoundPet } from "@/modules/found-pets/presentation/http/found-pets-handler";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ petId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { petId } = await context.params;
  return handlePostResolveFoundPet(petId, request);
}
