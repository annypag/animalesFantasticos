import { X } from "lucide-react";

interface SelectedReportPetModalProps {
  open: boolean;
  onClose: () => void;
  onSelectFound: () => void;
  onSelectLost: () => void;
}

export function SelectedReportPetModal({
  open,
  onClose,
  onSelectFound,
  onSelectLost,
}: SelectedReportPetModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-center text-xl font-semibold">¿Qué deseas reportar?</h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={onSelectFound}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Reportar mascota encontrada
          </button>
          
          <button
            onClick={onSelectLost}
            className="rounded-xl border-2 border-primary px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            Reportar mascota perdida
          </button>
        </div>
      </div>
    </div>
  );
}