import { handlePostChatImageUpload } from "@/modules/messaging";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handlePostChatImageUpload(request);
}
