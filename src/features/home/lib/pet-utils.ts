import { ApiFoundPet, Pet } from "@/features/home/types";

export function mapApiPetToUiPet(apiPet: ApiFoundPet): Pet {
  return {
    id: `db-${apiPet.id}`,
    name: apiPet.name,
    species: apiPet.species,
    breed: apiPet.breed,
    image: apiPet.imageUrl,
    distance: "nuevo",
    lastSeen: formatRelativeTime(apiPet.foundAt),
    location: apiPet.locationText,
    coordinates: [apiPet.latitude, apiPet.longitude],
    description: apiPet.description,
    ownerName: apiPet.owner.fullName,
    ownerPhone: apiPet.owner.phone,
  };
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = Date.now();
  const deltaMs = date.getTime() - now;
  const deltaHours = Math.round(deltaMs / (1000 * 60 * 60));

  if (Math.abs(deltaHours) < 24) {
    return new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(
      deltaHours,
      "hour",
    );
  }

  const deltaDays = Math.round(deltaHours / 24);
  return new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(deltaDays, "day");
}
