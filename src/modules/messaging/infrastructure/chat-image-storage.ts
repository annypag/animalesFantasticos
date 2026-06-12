import { saveLocalImage } from "@/modules/shared/infrastructure/local-image-storage";

export async function saveChatImage(
  file: File,
): Promise<{ id: string; fileName: string; fileUrl: string }> {
  return saveLocalImage(file, "chat");
}
