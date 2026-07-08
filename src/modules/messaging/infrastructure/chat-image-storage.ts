import { saveLocalImage } from "@/modules/shared/infrastructure/local-image-storage";

export async function saveChatImage(file: File): Promise<string> {
  const uploaded = await saveLocalImage(file, "chat");
  return uploaded.fileUrl;
}
