export interface Pet {
  id: string;
  name: string;
  status: "lost" | "found";
  species: string;
  sex?: string;
  breed: string;
  size?: string;
  neighborhood?: string;
  image: string;
  distance: string;
  lastSeen: string;
  createdAt?: string;
  location: string;
  coordinates: [number, number];
  description: string;
  ownerId?: number;
  ownerName?: string;
  ownerPhone?: string;
  resolvedAt?: string | null;
}

export interface ApiFoundPet {
  id: number;
  name: string;
  sex: string;
  species: string;
  breed: string;
  imageUrl: string;
  description: string;
  locationText: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  foundAt: string;
  resolvedAt?: string | null;
  owner: {
    id: number;
    fullName: string;
    phone: string | null;
  };
}

export interface ApiLostPet {
  id: number;
  name: string;
  sex: string;
  species: string;
  breed: string;
  imageUrl: string;
  description: string;
  locationText: string;
  latitude: number;
  longitude: number;
  lastSeen: string;
  createdAt: string;
  resolvedAt?: string | null;
  owner: {
    id: number;
    fullName: string;
    phone: string | null;
    email: string | null;
  };
}

export interface FiltersState {
  status: string;
  species: string;
  size: string;
  date: string;
  neighborhood: string;
  sex: string;
  breed: string;
}

