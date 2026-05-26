"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Calendar, MapPin, X, User } from "lucide-react";
import { formatAbsoluteDateTime } from "@/features/home/lib/pet-utils";
import { Pet } from "@/features/home/types";
import { ChatModal } from "@/features/messaging/components/chat-modal";

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
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false },
);

const MapResizeFix = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      function MapResizeFixImpl() {
        const map = mod.useMap();

        useEffect(() => {
          const timer = window.setTimeout(() => map.invalidateSize(), 100);
          return () => window.clearTimeout(timer);
        }, [map]);

        return null;
      }

      return MapResizeFixImpl;
    }),
  { ssr: false },
);

interface PetDetailsModalProps {
  pet: Pet | null;
  open: boolean;
  onClose: () => void;
}

export function PetDetailsModal({ pet, open, onClose }: PetDetailsModalProps) {

  const [chatModalOpen, setChatModalOpen] = useState(false);

  if (!open || !pet) {
    return null;
  }

  const isLost = pet.status === "lost";
  // CSS para diferenciar encontrado/perdido
  const badgeClasses = isLost
    ? "bg-[var(--alert-orange)]/10 text-[var(--alert-orange)] border-[var(--alert-orange)]/20"
    : "bg-primary/10 text-primary border-primary/20";

  const buttonColorClass = isLost
    ? "bg-[var(--alert-orange)] hover:bg-[var(--alert-orange)]/90"
    : "bg-primary hover:bg-primary/90";

  // Función para cerrar todo de forma limpia
  const handleClose = () => {
    setChatModalOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <Image
            src={pet.image}
            alt={pet.name}
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            unoptimized
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">{pet.name}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide border ${badgeClasses}`}>
                {isLost ? "Perdido" : "Encontrado"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5">
              {pet.species} • {pet.breed}
            </p>
          </div>

          <div className="mb-6 grid gap-4 rounded-xl bg-secondary/50 p-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Ultima ubicacion</p>
                <p className="text-sm">{pet.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Ultimo avistamiento</p>
                <p className="text-sm">{pet.lastSeen}</p>
              </div>
            </div>
            {pet.createdAt && (
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Fecha de publicacion</p>
                  <p className="text-sm">{formatAbsoluteDateTime(pet.createdAt)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold">Descripcion</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">{pet.description}</p>
          </div>

          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold">
              {isLost ? "Zona de desaparicion" : "Zona donde se encontró"}
            </h4>
            <div className="relative h-64 w-full overflow-hidden rounded-xl border">
              <MapContainer center={pet.coordinates} zoom={14} className="z-0 h-full w-full" scrollWheelZoom={false}>
                <MapResizeFix />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={pet.coordinates} />
                <Circle
                  center={pet.coordinates}
                  radius={500}
                  pathOptions={{
                    color: isLost ? "#f97316" : "#1e40af",
                    fillColor: isLost ? "#f97316" : "#1e40af",
                    fillOpacity: 0.1,
                  }}
                />
              </MapContainer>
            </div>
          </div>

          {/* BOTON MODIFICADO: Ahora abre el segundo modal y el texto es blanco */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setChatModalOpen(true)}
              className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold text-white transition-colors ${buttonColorClass}`}
            >
              Chatear
            </button>
          </div>
        </div>
      </div>

      {/* RENDERIZADO DEL NUEVO COMPONENTE EXTERNO */}
      <ChatModal
        open={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        pet={pet}
      />

    </div>
  );
}
