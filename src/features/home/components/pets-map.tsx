"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { LeafletMouseEvent } from "leaflet";
import { Pet } from "@/features/home/types";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false },
);
const MapClickCapture = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      return function MapClickCaptureImpl({
        onMapClick,
      }: {
        onMapClick: (coordinates: [number, number]) => void;
      }) {
        mod.useMapEvents({
          click: (event: LeafletMouseEvent) => {
            onMapClick([event.latlng.lat, event.latlng.lng]);
          },
        });

        return null;
      };
    }),
  { ssr: false },
);

interface PetsMapProps {
  pets: Pet[];
  onMapClick: (coordinates: [number, number]) => void;
  onMarkerClick: (pet: Pet) => void;
  onPetSelect: (pet: Pet) => void;
}

export function PetsMap({ pets, onMapClick, onMarkerClick, onPetSelect }: PetsMapProps) {
  return (
    <div className="hidden flex-1 md:block">
      <MapContainer
        center={[-34.5875, -58.42]}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <MapClickCapture onMapClick={onMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pets.map((pet) => (
          <Marker
            key={pet.id}
            position={pet.coordinates}
            eventHandlers={{
              click: () => onMarkerClick(pet),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <Image
                  src={pet.image}
                  alt={pet.name}
                  width={320}
                  height={128}
                  unoptimized
                  className="mb-2 h-32 w-full rounded-lg object-cover"
                />
                <h4 className="mb-1 text-sm font-semibold">{pet.name}</h4>
                <p className="mb-2 text-xs text-muted-foreground">
                  {pet.species} • {pet.breed}
                </p>
                <button
                  type="button"
                  onClick={() => onPetSelect(pet)}
                  className="w-full rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                >
                  Ver detalles
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
