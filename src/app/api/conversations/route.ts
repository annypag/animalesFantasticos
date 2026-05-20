import { handlePostConversation } from "@/modules/messaging";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handlePostConversation(request);
}
