import { handlePostResolveLostPet } from "@/modules/lost-pets/presentation/http/lost-pets-handler";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ petId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { petId } = await context.params;
  return handlePostResolveLostPet(petId, request);
}
