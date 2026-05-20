import { handleGetMessages, handlePostMessage } from "@/modules/messaging";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { conversationId } = await context.params;
  return handleGetMessages(conversationId);
}

export async function POST(request: Request, context: RouteContext) {
  const { conversationId } = await context.params;
  return handlePostMessage(conversationId, request);
}
