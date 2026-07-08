import { handlePostLogout } from "@/modules/auth/presentation/http/auth-handler";

export function POST() {
  return handlePostLogout();
}
