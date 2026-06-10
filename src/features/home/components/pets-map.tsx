"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import type L from "leaflet";
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
          click: (event: L.LeafletMouseEvent) => {
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
  const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    let active = true;

    import("leaflet").then((L) => {
      if (!active) {
        return;
      }

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      setLeaflet(L);
    });

    return () => {
      active = false;
    };
  }, []);

  if (!leaflet) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-slate-50/50">
        <div className="text-sm font-medium text-slate-500 animate-pulse">
          Cargando mapa interactivo...
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute top-3 right-3 z-[1000] bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-xl shadow-lg p-3 flex flex-col gap-2 pointer-events-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Referencias
        </span>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full border-2 border-red-500 bg-red-100 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          </div>
          <span className="text-xs font-medium text-slate-700">Mascota Perdida</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-500 bg-emerald-100 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <span className="text-xs font-medium text-slate-700">Mascota Encontrada</span>
        </div>
      </div>
      <MapContainer
        center={[-34.5875, -58.42]}
        zoom={13}
        className="h-full w-full z-0"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapClickCapture onMapClick={onMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pets.map((pet) => {
          const customIcon = leaflet.divIcon({
            className: "",
            html: `
              <div class="custom-pet-marker ${pet.status}">
                <div class="custom-pet-marker-img-container">
                  <img src="${pet.image}" alt="${pet.name}" class="custom-pet-marker-img" />
                </div>
                <div class="custom-pet-marker-pin"></div>
              </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 46],
            popupAnchor: [0, -42],
          });

          return (
            <Marker
              key={pet.id}
              position={pet.coordinates}
              icon={customIcon}
              eventHandlers={{
                mouseover: (e) => {
                  e.target.openPopup();
                },
                mouseout: (e) => {
                  e.target.closePopup();
                },
                click: () => {
                  onPetSelect(pet);
                },
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <Image
                    src={pet.image}
                    alt={pet.name}
                    width={320}
                    height={128}
                    unoptimized
                    className="mb-2 h-32 w-full rounded-lg object-cover"
                  />

                  {/* Cambiamos <p> y <h4> por <div> para evadir el CSS por defecto de Leaflet */}
                  <div className="mb-3 flex flex-col gap-0.5">
                    <div className="text-sm font-semibold leading-none text-foreground">
                      {pet.name}
                    </div>
                    <div className="text-xs leading-none text-muted-foreground mb-1">
                      {pet.species} • {pet.breed}
                      {pet.sex && pet.sex !== "Desconocido" && (
                        <span> • {pet.sex}</span>
                      )}
                    </div>

                    {pet.createdAt && (
                      <div className="text-[10px] leading-none text-muted-foreground flex items-center">
                        <span className="font-semibold text-foreground mr-1">
                          Publicado:
                        </span>
                        {new Date(pet.createdAt).toLocaleString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                    {pet.lastSeen && (
                      <div className="text-[10px] leading-none text-muted-foreground flex items-center">
                        <span className="font-semibold text-foreground mr-1">
                          Última vez visto:
                        </span>
                        {pet.lastSeen}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onPetSelect(pet)}
                    className="w-full rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 mt-1 cursor-pointer"
                  >
                    Ver detalles
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}