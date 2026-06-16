import { handlePostNotificationsReadAll } from "@/modules/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handlePostNotificationsReadAll(request);
}
