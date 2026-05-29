import { handlePostRegister } from "@/modules/auth/presentation/http/auth-handler";

export async function POST(request: Request) {
  return handlePostRegister(request);
}
