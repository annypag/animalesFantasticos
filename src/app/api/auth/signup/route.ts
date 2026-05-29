import { handleAuthSignupPost } from "@/modules/auth-lite";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleAuthSignupPost(request);
}
