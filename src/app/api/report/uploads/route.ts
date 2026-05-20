import { handlePostImageUpload } from "@/modules/shared/presentation/http/image-upload-handler";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handlePostImageUpload(request, "reports");
}
