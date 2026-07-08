"use client";

import dynamic from "next/dynamic";
import type { LeafletMouseEvent } from "leaflet";

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

type ReportLocationMapProps = {
  coordinates: [number, number] | null;
  onChange: (coordinates: [number, number]) => void;
  error?: string;
};

const defaultMapCenter: [number, number] = [-34.5875, -58.42];

export function ReportLocationMap({
  coordinates,
  onChange,
  error,
}: ReportLocationMapProps) {
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">
        {coordinates
          ? `Ubicación seleccionada: ${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`
          : "Hacé click en el mapa para marcar la ubicación."}
      </p>

      <div
        className={`relative h-64 w-full overflow-hidden rounded-2xl border ${
          error ? "border-red-400" : "border-border"
        }`}
      >
        <MapContainer
          center={coordinates ?? defaultMapCenter}
          zoom={14}
          className="z-0 h-full w-full"
          scrollWheelZoom
        >
          <MapClickCapture onMapClick={onChange} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {coordinates && <Marker position={coordinates} />}
        </MapContainer>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}