import { saveLocalImage } from "@/modules/shared/infrastructure/local-image-storage";

export async function saveChatImage(file: File): Promise<string> {
  return saveLocalImage(file, "chat");
}
