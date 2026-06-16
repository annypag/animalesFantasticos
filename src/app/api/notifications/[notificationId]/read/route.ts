import { handlePatchNotificationRead } from "@/modules/notifications";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ notificationId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { notificationId } = await context.params;
  return handlePatchNotificationRead(notificationId, request);
}
