import { handleGetMe, handleUpdateMe} from "@/modules/auth/presentation/http/auth-handler";

export async function GET(request: Request) {
  return handleGetMe(request);
}

export async function PUT(request: Request) {
  return handleUpdateMe(request);
}
