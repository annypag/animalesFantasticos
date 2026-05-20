export type ReportType = "lost" | "found";

export type PetSpecies = "Perro" | "Gato" | "Otro";
export type PetSize = "Pequeno" | "Mediano" | "Grande";

/** tag = chapita con nombre; unknown = no se conoce el nombre */
export type PetNameSituation = "tag" | "unknown";

export type ReportPetFormState = {
  nameSituation: PetNameSituation;
  name: string;
  species: PetSpecies;
  size: PetSize;
  breed: string;
  imageUrl: string;
  description: string;
  locationText: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  lastSeen: string;
};

export type ReportPetErrors = Partial<
  Record<
    | "name"
    | "nameSituation"
    | "species"
    | "breed"
    | "imageUrl"
    | "description"
    | "locationText"
    | "ownerName"
    | "ownerPhone"
    | "ownerEmail"
    | "lastSeen"
    | "coordinates",
    string
  >
>;

export const defaultReportPetForm: ReportPetFormState = {
  nameSituation: "tag",
  name: "",
  species: "Perro",
  size: "Mediano",
  breed: "",
  imageUrl: "",
  description: "",
  locationText: "",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  lastSeen: "",
};