"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Calendar, MapPin, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { formatAbsoluteDateTime } from "@/features/home/lib/pet-utils";
import { Pet } from "@/features/home/types";
import { ChatModal } from "@/features/messaging/components/chat-modal";
import { resolvePetReport } from "@/features/home/lib/resolve-pet-report-api";
import { isSavedPetReport } from "@/features/messaging/lib/parse-pet-ref";

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
  openChatOnMount?: boolean;
  chatConversationId?: number | null;
  chatPeerName?: string | null;
  onResolved?: () => void;
}

export function PetDetailsModal({
  pet,
  open,
  onClose,
  openChatOnMount = false,
  chatConversationId = null,
  chatPeerName = null,
  onResolved,
}: PetDetailsModalProps) {
  const { user } = useAuth();
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Función para cerrar todo de forma limpia
  const handleClose = () => {
      console.log("CERRANDO PET DETAILS MODAL");
    setChatModalOpen(false);
    setResolveError(null);
    onClose();
  };

  useEffect(() => {
    if (open && openChatOnMount && chatConversationId && !pet?.resolvedAt) {
      setChatModalOpen(true);
    }
  }, [open, openChatOnMount, chatConversationId, pet?.resolvedAt]);

useEffect(() => {
  if (!open) return;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      handleClose();
    }
  }

  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [open]);

  if (!open || !pet) {
    return null;
  }

  const isOwner = Boolean(user?.id && pet.ownerId && user.id === pet.ownerId);
  const isResolved = Boolean(pet.resolvedAt);
  const chatEnabled = isSavedPetReport(pet.id) && !isResolved;
  const canStartChat = chatEnabled && !isOwner;
  const resolveLabel =
    pet.status === "lost"
      ? "Marcar como resuelto (ya lo encontré)"
      : "Marcar como resuelto (ya lo devolví)";

  const isLost = pet.status === "lost";
  // CSS para diferenciar encontrado/perdido
  const badgeClasses = isLost
    ? "bg-[var(--alert-orange)]/10 text-[var(--alert-orange)] border-[var(--alert-orange)]/20"
    : "bg-primary/10 text-primary border-primary/20";

  const buttonColorClass = isLost
    ? "bg-[var(--alert-orange)] hover:bg-[var(--alert-orange)]/90"
    : "bg-primary hover:bg-primary/90";



  async function handleResolve() {
    if (!pet) {
      return;
    }
    if (!window.confirm("¿Confirmás que este caso ya se resolvió? Se cerrará el chat.")) {
      return;
    }

    setResolving(true);
    setResolveError(null);

    try {
      await resolvePetReport(pet.id);
      setChatModalOpen(false);
      onResolved?.();
      handleClose();
    } catch (error) {
      setResolveError(
        error instanceof Error ? error.message : "No se pudo cerrar la publicación.",
      );
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleClose}
className="sticky top-4 float-right mr-4 z-50 -mb-10 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-colors hover:bg-white"
          >
          <X className="h-5 w-5" />
        </button>

        <div className="w-full overflow-hidden bg-muted flex items-center justify-center">
          <Image
            src={pet.image}
            alt={pet.name}
            width={0}
            height={0}
            sizes="(max-width: 1024px) 100vw, 900px"
            unoptimized
            className="max-h-[60vh] w-full object-contain"
            style={{ width: "100%", height: "auto" }}
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
            <div className="mt-2 grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Sexo</p>
                <p className="text-sm font-medium">{pet.sex ?? "Desconocido"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Raza</p>
                <p className="text-sm font-medium">{pet.breed}</p>
              </div>
            </div>
            {isResolved && (
              <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-bold text-sm">¡Caso Resuelto!</h5>
                  <p className="text-xs text-emerald-700 mt-0.5">Esta mascota ya ha sido devuelta a su familia o se ha solucionado el reporte.</p>
                </div>
              </div>
            )}
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

            {canStartChat && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setChatModalOpen(true)}
                  className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold text-white transition-colors ${buttonColorClass} cursor-pointer`}
                >
                  Chatear
                </button>
              </div>
            )}

            {isOwner && chatEnabled && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Si alguien escribe sobre tu publicación, vas a verlo en la campana de
                  notificaciones. Cada persona tiene su propio chat.
                </p>
                <button
                  type="button"
                  onClick={() => void handleResolve()}
                  disabled={resolving}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60 cursor-pointer"
                >
                  {resolving ? "Cerrando publicación..." : resolveLabel}
                </button>
                {resolveError && (
                  <p className="text-sm text-red-600">{resolveError}</p>
                )}
              </div>
            )}

            {isResolved && (
              <p className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                Esta publicación está cerrada. El chat ya no está disponible.
              </p>
            )}
        </div>
      </div>

      {/* RENDERIZADO DEL NUEVO COMPONENTE EXTERNO */}
      <ChatModal
        open={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        pet={pet}
        conversationId={chatConversationId ?? undefined}
        peerName={chatPeerName}
      />

    </div>
  );
}

