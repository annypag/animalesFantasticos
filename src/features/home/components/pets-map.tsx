"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import type L from "leaflet";
import { Pet } from "@/features/home/types";

// Dynamic loading of Leaflet MapContainer, TileLayer, Marker, and Popup
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

// Stable dynamic wrapper for map event handling to avoid inline component recreation
const MapEventsHandler = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      return function MapEventsHandlerImpl({
        onMapClick,
        onZoomChange,
        onBoundsChange,
      }: {
        onMapClick: (coordinates: [number, number]) => void;
        onZoomChange: (zoom: number) => void;
        onBoundsChange: (map: L.Map) => void;
      }) {
        const map = mod.useMapEvents({
          click: (event: L.LeafletMouseEvent) => {
            onMapClick([event.latlng.lat, event.latlng.lng]);
          },
          zoomend: () => {
            onZoomChange(map.getZoom());
            onBoundsChange(map);
          },
          moveend: () => {
            onBoundsChange(map);
          },
        });

        // Initialize state on mount
        useEffect(() => {
          onZoomChange(map.getZoom());
          onBoundsChange(map);
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [map]);

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
  const [zoom, setZoom] = useState(13);
  const [map, setMap] = useState<L.Map | null>(null);
  const [, setMapUpdateKey] = useState(0);

  const handleBoundsChange = useCallback((mapInstance: L.Map) => {
    setMap(mapInstance);
    setMapUpdateKey((prev) => prev + 1);
  }, []);

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

  // Calculate dynamic sizes based on zoom and distance to neighbors
  const visiblePets = map
    ? pets.filter((pet) => map.getBounds().contains(pet.coordinates))
    : pets;

  const petPositions = map
    ? visiblePets.map((pet) => {
      const pt = map.latLngToLayerPoint(pet.coordinates);
      return {
        id: pet.id,
        x: pt.x,
        y: pt.y,
      };
    })
    : [];

  const petSizes = new Map<string, number>();

  pets.forEach((pet) => {
    // 1. Calculate default size based on rounded zoom level (handles fractional zoom on pinch/scroll)
    const roundedZoom = Math.round(zoom);
    let baseSize = 52;
    if (roundedZoom <= 11) baseSize = 36;
    else if (roundedZoom === 12) baseSize = 44;
    else if (roundedZoom === 13) baseSize = 52;
    else if (roundedZoom === 14) baseSize = 60;
    else if (roundedZoom === 15) baseSize = 68;
    else if (roundedZoom === 16) baseSize = 76;
    else baseSize = 84; // roundedZoom >= 17

    // 2. Find minimum distance to any other visible pet on screen
    const pos1 = petPositions.find((p) => p.id === pet.id);
    let minDistance = Infinity;

    if (pos1) {
      petPositions.forEach((pos2) => {
        if (pos2.id === pet.id) return;
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
        }
      });
    }

    // 3. Collision avoidance:
    // If they are extremely close (under 45px), keep them compact (max 44px)
    // If they are moderately close (45px to 75px), limit to a medium size (max 56px)
    // Otherwise, allow them to grow to their full base size
    let pinSize = baseSize;
    if (minDistance < 45) {
      pinSize = Math.min(baseSize, 44);
    } else if (minDistance < 75) {
      pinSize = Math.min(baseSize, 56);
    }

    petSizes.set(pet.id, pinSize);
  });

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
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler
          onMapClick={onMapClick}
          onZoomChange={setZoom}
          onBoundsChange={handleBoundsChange}
        />
        {pets.map((pet) => {
          const pinSize = petSizes.get(pet.id) || 42;
          const imageSize = pinSize - 6; // Subtract borders (3px each side)
          const pinTipSize = Math.max(6, Math.round(pinSize * 0.22));

          const customIcon = leaflet.divIcon({
            className: "",
            html: `
              <div class="custom-pet-marker ${pet.status}" style="width: ${pinSize}px; height: ${pinSize}px;">
                <div class="custom-pet-marker-img-container" style="width: ${imageSize}px; height: ${imageSize}px;">
                  <img src="${pet.image}" alt="${pet.name}" class="custom-pet-marker-img" />
                </div>
                <div class="custom-pet-marker-pin" style="bottom: -${Math.round(pinTipSize / 2)}px; width: ${pinTipSize}px; height: ${pinTipSize}px;"></div>
              </div>
            `,
            iconSize: [pinSize, pinSize],
            iconAnchor: [pinSize / 2, pinSize],
            popupAnchor: [0, -pinSize - 4],
          });

          return (
            <Marker
              key={`${pet.id}-${pinSize}`}
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