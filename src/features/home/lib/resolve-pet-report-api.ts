import { parsePetRefFromUiId } from "@/features/messaging/lib/parse-pet-ref";

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message ?? "No se pudo cerrar la publicación.";
  } catch {
    return "No se pudo cerrar la publicación.";
  }
}

export async function resolvePetReport(uiPetId: string): Promise<void> {
  const petRef = parsePetRefFromUiId(uiPetId);

  if (!petRef) {
    throw new Error("Solo podés cerrar publicaciones guardadas en la base de datos.");
  }

  const base = petRef.petKind === "LOST" ? "/api/lost-pets" : "/api/found-pets";
  const response = await fetch(`${base}/${petRef.petId}/resolve`, {
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}
