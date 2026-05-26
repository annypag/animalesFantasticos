import { handleAuthVerifyEmailPost } from "@/modules/auth-lite";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleAuthVerifyEmailPost(request);
}
