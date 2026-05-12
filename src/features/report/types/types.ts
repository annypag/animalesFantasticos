export type ReportType = "lost" | "found";

export type PetSpecies = "Perro" | "Gato" | "Otro";
export type PetSize = "Pequeno" | "Mediano" | "Grande";

export type ReportPetFormState = {
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