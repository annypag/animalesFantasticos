import { Pet } from "@/features/home/types";

export const mockPets: Pet[] = [
  {
    id: "1",
    name: "Max",
    status: "lost",
    species: "Perro",
    breed: "Golden Retriever",
    size: "large",
    image:
      "https://images.unsplash.com/photo-1649974139924-875a581c9e0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwZ29sZGVuJTIwcmV0cmlldmVyJTIwZG9nfGVufDF8fHx8MTc3NDkxMTE3OHww&ixlib=rb-4.1.0&q=80&w=1080",
    distance: "0.5 km",
    lastSeen: "hace 2 horas",
    createdAt: "2026-05-06T10:00:00.000Z",
    location: "Palermo, Buenos Aires",
    neighborhood: "Palermo",
    coordinates: [-34.5875, -58.42],
    description:
      "Golden Retriever macho de 3 anos, muy amigable. Lleva collar azul con placa de identificacion. Responde al nombre de Max. Se perdio cerca del parque.",
  },
  {
    id: "2",
    name: "Luna",
    status: "lost",
    species: "Gato",
    breed: "Negro Comun",
    size: "small",
    image:
      "https://images.unsplash.com/photo-1660339825696-9bfdc4cf4ed2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwYmxhY2slMjBjYXR8ZW58MXx8fHwxNzc0OTk4MDQyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    distance: "1.2 km",
    lastSeen: "ayer",
    createdAt: "2026-05-05T11:00:00.000Z",
    location: "Recoleta, Buenos Aires",
    neighborhood: "Recoleta",
    coordinates: [-34.5885, -58.395],
    description:
      "Gata negra de ojos verdes, muy timida. No tiene collar. Tiene una pequena mancha blanca en el pecho. Es asustadiza con extranos.",
  },
  {
    id: "3",
    name: "Rocky",
    status: "found",
    species: "Perro",
    breed: "Beagle",
    size: "medium",
    image:
      "https://images.unsplash.com/photo-1737699430579-3f20b8abc613?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwYmVhZ2xlJTIwZG9nfGVufDF8fHx8MTc3NDk5ODA0Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    distance: "2.8 km",
    lastSeen: "hace 1 dia",
    createdAt: "2026-05-01T12:00:00.000Z",
    location: "Belgrano, Buenos Aires",
    neighborhood: "Belgrano",
    coordinates: [-34.5633, -58.4583],
    description:
      "Beagle tricolor muy jugueton. Lleva collar rojo con chapita de identificacion. Le encanta correr y perseguir ardillas. Es muy sociable.",
  },
  {
    id: "4",
    name: "Mimi",
    status: "lost",
    species: "Gato",
    breed: "Atigrado",
    size: "medium",
    image:
      "https://images.unsplash.com/photo-1675504661658-33940d979a6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwdGFiYnklMjBjYXR8ZW58MXx8fHwxNzc0OTk4MDQyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    distance: "3.5 km",
    lastSeen: "hace 3 dias",
    createdAt: "2026-04-20T13:00:00.000Z",
    location: "Villa Crespo, Buenos Aires",
    neighborhood: "Villa Crespo",
    coordinates: [-34.5992, -58.4383],
    description:
      "Gata atigrada de tamano mediano, muy carinosa. Tiene collar rosa con cascabel. Esta esterilizada y tiene microchip.",
  },
  {
    id: "5",
    name: "Toby",
    status: "found",
    species: "Perro",
    breed: "Labrador",
    size: "large",
    image:
      "https://images.unsplash.com/photo-1697777869187-a54d754fcf97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwbGFicmFkb3IlMjBwdXBweXxlbnwxfHx8fDE3NzQ5OTgwNDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    distance: "4.1 km",
    lastSeen: "hace 5 dias",
    createdAt: "2026-05-06T14:00:00.000Z",
    location: "Caballito, Buenos Aires",
    neighborhood: "Caballito",
    coordinates: [-34.6158, -58.4392],
    description:
      "Labrador joven color chocolate. Muy energico y amigable. Necesita medicacion diaria. Por favor contactar urgente.",
  },
  {
    id: "6",
    name: "Nieve",
    status: "found",
    species: "Gato",
    breed: "Blanco Persa",
    size: "small",
    image:
      "https://images.unsplash.com/photo-1761485465180-3c9d75fd7269?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwd2hpdGUlMjBraXR0ZW58ZW58MXx8fHwxNzc0OTk4MDQzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    distance: "1.8 km",
    lastSeen: "hace 12 horas",
    createdAt: "2026-05-03T15:00:00.000Z",
    location: "Nunez, Buenos Aires",
    neighborhood: "Nunez",
    coordinates: [-34.5442, -58.4578],
    description:
      "Gato persa blanco de pelo largo. Muy tranquilo y casero. No esta acostumbrado a estar en la calle. Ojos azules.",
  },
];
