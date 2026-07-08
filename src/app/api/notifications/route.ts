import { handleGetNotifications } from "@/modules/notifications";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleGetNotifications(request);
}
