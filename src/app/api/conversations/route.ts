import { handleGetConversations, handlePostConversation } from "@/modules/messaging";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleGetConversations(request);
}

export async function POST(request: Request) {
  return handlePostConversation(request);
}
