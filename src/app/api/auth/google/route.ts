import { handleGoogleLoginRedirect } from "@/modules/auth/presentation/http/auth-handler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleGoogleLoginRedirect(request);
}
