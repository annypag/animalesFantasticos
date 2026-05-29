export type ReportType = "lost" | "found";

export type PetSpecies = "Perro" | "Gato" | "Otro";
export type PetSize = "Pequeno" | "Mediano" | "Grande";
export type PetSex = "Macho" | "Hembra" | "Desconocido";
export type PetBreedOption = "Labrador" | "Mestizo" | "Caniche" | "Desconocido";
export type DdMmYyyyDateString = string;

/** tag = chapita con nombre; unknown = no se conoce el nombre */
export type PetNameSituation = "tag" | "unknown";

export type ReportPublicationStatus =
  | "PENDING_VERIFICATION"
  | "PUBLISHED"
  | "ARCHIVED";

export type ImageCapture = {
  id: string;
  fileName: string;
  fileUrl: string;
};

export type ReportPetCore = {
  name: string;
  species: PetSpecies;
  sex: PetSex;
  breed: PetBreedOption[];
  imageCapture: ImageCapture[];
  description: string;
  latitude: number;
  longitude: number;
  neighborhood: string;
  /**
   * Fecha de extravio/hallazgo en formato de negocio.
   * Ejemplo: 25/05/2026
   */
  eventDate: DdMmYyyyDateString;
};

export type ReportContact = {
  fullName: string;
  phone: string;
  email: string;
};

export type ReportReporterMeta = {
  isRegistered: boolean;
  emailVerified: boolean;
};

/**
 * Contrato JSON comun para Lost/Found.
 * Se consume por APIs de alta de reportes.
 */
export type SymmetricReportPayload = {
  type: ReportType;
  pet: ReportPetCore;
  contact: ReportContact;
  reporter: ReportReporterMeta;
};

export type SymmetricLostReportPayload = SymmetricReportPayload & {
  type: "lost";
};

export type SymmetricFoundReportPayload = SymmetricReportPayload & {
  type: "found";
};

export type ReportPetFormState = {
  nameSituation: PetNameSituation;
  name: string;
  species: PetSpecies;
  sex: PetSex;
  size: PetSize;
  breed: PetBreedOption[];
  imageUrl: string;
  imageCapture: ImageCapture[];
  description: string;
  locationText: string;
  neighborhood: string;
  eventDate: DdMmYyyyDateString;
  latitude: number | null;
  longitude: number | null;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  reporterIsRegistered: boolean;
  reporterEmailVerified: boolean;
  /** Legacy para flujo actual de lost en UI */
  lastSeen: string;
};

export type ReportPetErrors = Partial<
  Record<
    | "name"
    | "nameSituation"
    | "species"
    | "sex"
    | "breed"
    | "imageUrl"
    | "imageCapture"
    | "description"
    | "locationText"
    | "neighborhood"
    | "eventDate"
    | "latitude"
    | "longitude"
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
  sex: "Desconocido",
  size: "Mediano",
  breed: [],
  imageUrl: "",
  imageCapture: [],
  description: "",
  locationText: "",
  neighborhood: "",
  eventDate: "",
  latitude: null,
  longitude: null,
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  reporterIsRegistered: false,
  reporterEmailVerified: false,
  lastSeen: "",
};
