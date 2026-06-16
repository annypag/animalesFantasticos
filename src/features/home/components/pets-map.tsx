"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
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
const MarkerClusterGroup = dynamic(
  () => import("react-leaflet-cluster").then((mod) => mod.default),
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
        const popupOpenRef = useRef(false);
        const clickShouldSkipRef = useRef(false);

        const map = mod.useMapEvents({
          popupopen: () => {
            popupOpenRef.current = true;
          },
          popupclose: () => {
            popupOpenRef.current = false;
          },
          preclick: () => {
            clickShouldSkipRef.current = popupOpenRef.current;
          },
          click: (event: L.LeafletMouseEvent) => {
            if (clickShouldSkipRef.current) {
              clickShouldSkipRef.current = false;
              return;
            }
            onMapClick([event.latlng.lat, event.latlng.lng]);
          },
          zoom: () => {
            onZoomChange(map.getZoom());
          },
          zoomend: () => {
            onZoomChange(map.getZoom());
            onBoundsChange(map);
          },
          moveend: () => {
            onBoundsChange(map);
          },
        });

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

function pinSizeForZoom(roundedZoom: number): number {
  if (roundedZoom <= 9) return 28;
  if (roundedZoom === 10) return 36;
  if (roundedZoom === 11) return 44;
  if (roundedZoom === 12) return 52;
  if (roundedZoom === 13) return 62;
  if (roundedZoom === 14) return 70;
  if (roundedZoom === 15) return 78;
  if (roundedZoom === 16) return 86;
  return 94;
}

export function PetsMap({ pets, onMapClick, onMarkerClick, onPetSelect }: PetsMapProps) {
  const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null);
  const [zoom, setZoom] = useState(13);
  const [map, setMap] = useState<L.Map | null>(null);

  const roundedZoom = Math.round(zoom);
  const pinSize = pinSizeForZoom(roundedZoom);

  const handleBoundsChange = useCallback((mapInstance: L.Map) => {
    setMap(mapInstance);
  }, []);

  const createClusterIcon = useCallback(
    (cluster: { getChildCount(): number }) => {
      if (!leaflet) return leaflet;
      const count = cluster.getChildCount();
      const size = count < 10 ? 40 : count < 50 ? 50 : 60;
      const fontSize = count < 10 ? 14 : count < 50 ? 16 : 18;
      return leaflet.divIcon({
        html: `<div class="cluster-pin" style="width:${size}px;height:${size}px;font-size:${fontSize}px">${count}</div>`,
        className: "",
        iconSize: leaflet.point(size, size),
        iconAnchor: leaflet.point(size / 2, size / 2),
      });
    },
    [leaflet],
  );

  useEffect(() => {
    let active = true;
    import("leaflet").then((L) => {
      if (!active) return;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setLeaflet(L);
    });
    return () => { active = false; };
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

  const borderWidth = pinSize <= 36 ? 2 : pinSize <= 52 ? 2.5 : 3;
  const imageSize = pinSize - borderWidth * 2;
  const pinTipSize = Math.max(6, Math.round(pinSize * 0.2));

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

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          showCoverageOnHover={false}
          maxClusterRadius={60}
        >
          {pets.map((pet) => {
            const customIcon = leaflet.divIcon({
              className: "bg-transparent border-0",
              html: `
                <div class="custom-pet-marker ${pet.status}" style="width:${pinSize}px;height:${pinSize}px;">
                  <div class="custom-pet-marker-img-container" style="width:${imageSize}px;height:${imageSize}px;border-width:${borderWidth}px !important;">
                    <img src="${pet.image}" alt="${pet.name}" class="custom-pet-marker-img" />
                  </div>
                  <div class="custom-pet-marker-pin" style="bottom:-${Math.round(pinTipSize / 2)}px;width:${pinTipSize}px;height:${pinTipSize}px;"></div>
                </div>
              `,
              iconSize: [pinSize, pinSize],
              iconAnchor: [pinSize / 2, pinSize],
              popupAnchor: [0, -pinSize - 4],
            });

            return (
              <Marker
                key={pet.id}
                position={pet.coordinates}
                icon={customIcon}
                eventHandlers={{
                  mouseover: (e) => { e.target.openPopup(); },
                  click: (e) => { (e.target as { openPopup(): void }).openPopup(); },
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
                      className="mb-2 h-32 w-full rounded-lg object-cover object-top"
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
                          <span className="font-semibold text-foreground mr-1">Publicado:</span>
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
                          <span className="font-semibold text-foreground mr-1">Última vez visto:</span>
                          {pet.lastSeen}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { map?.closePopup(); onPetSelect(pet); }}
                      className="w-full rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 mt-1 cursor-pointer"
                    >
                      Ver detalles
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
