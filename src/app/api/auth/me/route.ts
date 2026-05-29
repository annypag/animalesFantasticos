import { handleGetMe } from "@/modules/auth/presentation/http/auth-handler";

export async function GET(request: Request) {
  return handleGetMe(request);
}
